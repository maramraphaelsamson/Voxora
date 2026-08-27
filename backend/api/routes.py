import asyncio
import io
import hashlib
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from fastapi.responses import StreamingResponse

from backend.engine.base import SynthesisOptions
from backend.engine.edge_tts_adapter import EdgeTTSAdapter
from backend.services.script_parser import ScriptParser, ScriptParseResult
from backend.services.audio_stitcher import AudioStitcher
from backend.services.document_parser import DocumentParser
from backend.models.schemas import (
    SingleSynthesisRequest,
    DialogueSynthesisRequest,
    PreviewVoiceRequest,
    ParseScriptRequest,
    SpeakerProfile
)

router = APIRouter(prefix="/api")
tts_engine = EdgeTTSAdapter()

# In-memory segment audio cache to make multi-speaker edits instantaneous
# Key: sha256(text + voice_id + rate + pitch + volume) -> bytes
AUDIO_SEGMENT_CACHE: Dict[str, bytes] = {}

def get_cache_key(text: str, voice_id: str, rate: float, pitch: float, volume: float) -> str:
    key_src = f"{text}|{voice_id}|{rate:.2f}|{pitch:.1f}|{volume:.2f}"
    return hashlib.sha256(key_src.encode("utf-8")).hexdigest()

@router.get("/health")
async def health_check():
    return {"status": "ok", "app": "Voxora AI Voice Studio", "version": "1.0.0"}

@router.get("/voices")
async def list_voices():
    voices = await tts_engine.get_voices()
    return {"voices": voices, "total": len(voices)}

@router.post("/preview")
async def preview_voice(req: PreviewVoiceRequest):
    try:
        opts = SynthesisOptions(rate=req.rate, pitch=req.pitch, volume=1.0)
        audio_bytes = await tts_engine.preview_voice(req.voice_id, req.sample_text, opts)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")

@router.post("/synthesize/single")
async def synthesize_single(req: SingleSynthesisRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    try:
        opts = SynthesisOptions(rate=req.rate, pitch=req.pitch, volume=req.volume)
        audio_bytes = await tts_engine.synthesize(req.text, req.voice_id, opts)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=voxora_single.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Single synthesis failed: {str(e)}")

@router.post("/synthesize/dialogue")
async def synthesize_dialogue(req: DialogueSynthesisRequest):
    if not req.lines:
        raise HTTPException(status_code=400, detail="Script lines cannot be empty")

    default_voice = "en-US-JennyNeural"
    # Find fallback voice if available
    first_spk = next(iter(req.speakers.values()), None)
    if first_spk:
        default_voice = first_spk.voice_id

    # Build generation tasks for each line
    async def process_line(line) -> bytes:
        spk: Optional[SpeakerProfile] = req.speakers.get(line.speaker_name)
        voice_id = spk.voice_id if spk else default_voice
        spk_rate = spk.rate if spk else 1.0
        spk_pitch = spk.pitch if spk else 0.0
        spk_volume = spk.volume if spk else 1.0

        # Combine speaker options with global multipliers
        combined_rate = round(spk_rate * req.global_rate, 2)
        combined_pitch = round(spk_pitch + req.global_pitch, 1)
        combined_volume = round(spk_volume * req.global_volume, 2)

        cache_key = get_cache_key(line.text, voice_id, combined_rate, combined_pitch, combined_volume)
        if cache_key in AUDIO_SEGMENT_CACHE:
            return AUDIO_SEGMENT_CACHE[cache_key]

        opts = SynthesisOptions(rate=combined_rate, pitch=combined_pitch, volume=combined_volume)
        chunk = await tts_engine.synthesize(line.text, voice_id, opts)
        if chunk:
            AUDIO_SEGMENT_CACHE[cache_key] = chunk
        return chunk

    # Limit concurrent generation to 5 workers to be polite to upstream Edge endpoints
    semaphore = asyncio.Semaphore(5)

    async def sem_process(line):
        async with semaphore:
            return await process_line(line)

    try:
        tasks = [sem_process(line) for line in req.lines if line.text.strip()]
        rendered_segments = await asyncio.gather(*tasks)
        
        # Stitch all segments together with calibrated pauses
        final_mp3 = AudioStitcher.stitch_mp3_segments(
            rendered_segments,
            pause_between_ms=req.pause_between_ms
        )

        return Response(
            content=final_mp3,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=voxora_dialogue.mp3"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dialogue synthesis failed: {str(e)}")

@router.post("/parse-script")
async def parse_script(req: ParseScriptRequest):
    result: ScriptParseResult = ScriptParser.parse_text(req.text, req.default_speaker)
    return result

@router.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    try:
        content_bytes = await file.read()
        extracted_text = DocumentParser.extract_text(file.filename or "unknown.txt", content_bytes)
        parsed = ScriptParser.parse_text(extracted_text)
        return {
            "filename": file.filename,
            "raw_text": extracted_text,
            "parsed": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Document parsing failed: {str(e)}")
