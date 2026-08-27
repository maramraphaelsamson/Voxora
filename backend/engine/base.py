from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class VoiceInfo(BaseModel):
    id: str
    name: str
    friendly_name: str
    gender: str # 'Male' | 'Female'
    locale: str # e.g. 'en-GB', 'fr-FR'
    language: str # e.g. 'English', 'French'
    accent: str # e.g. 'British', 'American', 'Nigerian', 'France', 'Canada'
    flag: str # e.g. '🇬🇧', '🇫🇷', '🇳🇬', '🇺🇸'
    is_multilingual: bool = False
    age_bracket: str = "Young Adult" # 'Child' | 'Teenager' | 'Young Adult' | 'Mature Adult' | 'Senior'
    rhythm: Optional[str] = None # e.g. 'Syllable-timed', 'Stress-timed', 'Mora-timed'
    phonetic_hint: Optional[str] = None # e.g. 'Nasal vowels • Uvular R • Flowing liaison'
    sample_rate_hz: int = 24000
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class SynthesisOptions(BaseModel):
    rate: float = 1.0 # 0.5 to 2.0
    pitch: float = 0.0 # -50 to +50 (Hz or semitones offset)
    volume: float = 1.0 # 0.0 to 1.0

class BaseTTSEngine(ABC):
    """
    Abstract interface for TTS providers (EdgeTTS, ElevenLabs, OpenAI, etc.)
    Ensures zero hardcoding and complete modularity.
    """
    @abstractmethod
    async def get_voices(self) -> List[VoiceInfo]:
        """Return full catalog of supported voices with metadata."""
        pass

    @abstractmethod
    async def synthesize(self, text: str, voice_id: str, options: SynthesisOptions) -> bytes:
        """Synthesize given text into MP3 audio bytes."""
        pass

    @abstractmethod
    async def preview_voice(
        self,
        voice_id: str,
        sample_text: Optional[str] = None,
        options: Optional[SynthesisOptions] = None
    ) -> bytes:
        """Synthesize a short preview snippet for instant auditioning."""
        pass
