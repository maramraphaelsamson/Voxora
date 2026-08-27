from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class SpeakerProfile(BaseModel):
    id: str
    name: str
    gender: str = "Female" # 'Female' | 'Male'
    language: str = "English"
    accent: str = "American"
    flag: str = "🇺🇸"
    voice_id: str
    color: str = "pink" # 'pink' | 'blue' | 'emerald' | 'amber' | 'violet'
    rate: float = 1.0
    pitch: float = 0.0
    volume: float = 1.0

class DialogueLineItem(BaseModel):
    id: str
    speaker_name: str
    text: str

class SingleSynthesisRequest(BaseModel):
    text: str
    voice_id: str
    rate: float = 1.0
    pitch: float = 0.0
    volume: float = 1.0

class DialogueSynthesisRequest(BaseModel):
    lines: List[DialogueLineItem]
    speakers: Dict[str, SpeakerProfile]
    global_rate: float = 1.0
    global_pitch: float = 0.0
    global_volume: float = 1.0
    pause_between_ms: int = 400

class PreviewVoiceRequest(BaseModel):
    voice_id: str
    sample_text: Optional[str] = None
    rate: float = 1.0
    pitch: float = 0.0

class ParseScriptRequest(BaseModel):
    text: str
    default_speaker: str = "Narrator"

class ProjectSaveRequest(BaseModel):
    id: str
    title: str
    mode: str # 'single' | 'dialogue'
    single_text: str = ""
    single_voice_id: str = ""
    single_rate: float = 1.0
    single_pitch: float = 0.0
    dialogue_lines: List[DialogueLineItem] = Field(default_factory=list)
    speakers: Dict[str, SpeakerProfile] = Field(default_factory=dict)
    pause_between_ms: int = 400
    updated_at: Optional[str] = None
