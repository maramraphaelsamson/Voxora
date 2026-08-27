import asyncio
from backend.services.script_parser import ScriptParser
from backend.services.audio_stitcher import AudioStitcher
from backend.engine.edge_tts_adapter import EdgeTTSAdapter
from backend.engine.base import SynthesisOptions

async def main():
    test_script = """
    Sarah: Bonjour, comment allez-vous?
    James: I'm doing great. How about you?
    Sarah: Je vais bien, merci! Where are you going tomorrow?
    James: I'm going to Paris. I'll be there for three days.
    """
    parsed = ScriptParser.parse_text(test_script)
    print(f"Parsed {len(parsed.lines)} lines for speakers: {parsed.speakers}")
    
    engine = EdgeTTSAdapter()
    audio1 = await engine.synthesize(parsed.lines[0].text, 'fr-FR-DeniseNeural', SynthesisOptions())
    audio2 = await engine.synthesize(parsed.lines[1].text, 'en-GB-RyanNeural', SynthesisOptions())
    merged = AudioStitcher.stitch_mp3_segments([audio1, audio2], pause_between_ms=400)
    print(f"Successfully generated and stitched dialogue MP3! Total size: {len(merged)} bytes")

if __name__ == "__main__":
    asyncio.run(main())
