import asyncio
import re
import html
from typing import List, Optional, Dict
import edge_tts
from backend.engine.base import BaseTTSEngine, VoiceInfo, SynthesisOptions

# Mapping of country/locale codes to flags, accents, rhythm, and phonetic characteristics
LOCALE_METADATA: Dict[str, Dict[str, str]] = {
    "en-US": {
        "flag": "🇺🇸",
        "accent": "American",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Rhotic R • Flapped T • Vowel reduction"
    },
    "en-GB": {
        "flag": "🇬🇧",
        "accent": "British",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Non-rhotic • Crisp T • TRAP-BATH split"
    },
    "en-NG": {
        "flag": "🇳🇬",
        "accent": "Nigerian",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Staccato rhythm • Tonal pitch leaps • Pure vowels"
    },
    "en-AU": {
        "flag": "🇦🇺",
        "accent": "Australian",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Broad diphthongs • Rising terminal • Non-rhotic"
    },
    "en-CA": {
        "flag": "🇨🇦",
        "accent": "Canadian",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Canadian raising • Flapped T • Rhotic R"
    },
    "en-IE": {
        "flag": "🇮🇪",
        "accent": "Irish",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Musical lilt • Clear L • Slit dental stops"
    },
    "en-IN": {
        "flag": "🇮🇳",
        "accent": "Indian",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Retroflex T/D • V=W merger • Singing pitch glides"
    },
    "en-ZA": {
        "flag": "🇿🇦",
        "accent": "South African",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Broad vowels • Pure mid-vowels • Non-rhotic"
    },
    "en-NZ": {
        "flag": "🇳🇿",
        "accent": "New Zealand",
        "language": "English",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Fronted short vowels • Rising terminal"
    },
    "en-PH": {
        "flag": "🇵🇭",
        "accent": "Filipino",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Even syllable tempo • Crisp stops • Pure vowels"
    },
    "en-SG": {
        "flag": "🇸🇬",
        "accent": "Singaporean",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Staccato timing • Tonal inflections"
    },
    "en-KE": {
        "flag": "🇰🇪",
        "accent": "Kenyan",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Even syllable beats • Pure vowels"
    },
    "en-TZ": {
        "flag": "🇹🇿",
        "accent": "Tanzanian",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Swahili vocalic melody • Pure vowels"
    },
    "en-HK": {
        "flag": "🇭🇰",
        "accent": "Hong Kong",
        "language": "English",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Cantonese pitch stepping • Crisp codas"
    },
    
    "fr-FR": {
        "flag": "🇫🇷",
        "accent": "France (Parisian)",
        "language": "French",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Nasal vowels • Uvular R • Flowing liaison • No /h/"
    },
    "fr-CA": {
        "flag": "🇨🇦",
        "accent": "Canadian (Québécois)",
        "language": "French",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Dental affricates (ts/dz) • Lax high vowels • Nasal tone"
    },
    "fr-BE": {
        "flag": "🇧🇪",
        "accent": "Belgian",
        "language": "French",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Distinctive vowel length • Soft cadence"
    },
    "fr-CH": {
        "flag": "🇨🇭",
        "accent": "Swiss",
        "language": "French",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Measured tempo • Lengthened tonic syllables"
    },
    
    "es-ES": {
        "flag": "🇪🇸",
        "accent": "Spain (Castilian)",
        "language": "Spanish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Distinción /θ/ • Apico-alveolar S • Guttural J"
    },
    "es-MX": {
        "flag": "🇲🇽",
        "accent": "Mexican",
        "language": "Spanish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Cantadito lilt • Seseo • Pure 5-vowel system"
    },
    "es-CO": {
        "flag": "🇨🇴",
        "accent": "Colombian",
        "language": "Spanish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Clear enunciation • Soft musical intonation"
    },
    "es-AR": {
        "flag": "🇦🇷",
        "accent": "Argentine",
        "language": "Spanish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Sheísmo (sh/zh) • Italian-style melodic cadence"
    },
    "es-US": {
        "flag": "🇺🇸",
        "accent": "US Spanish",
        "language": "Spanish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Bilingual cadence • Seseo"
    },
    
    "de-DE": {
        "flag": "🇩🇪",
        "accent": "German",
        "language": "German",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Hard glottal stops [ʔ] • Final devoicing • Front rounded vowels"
    },
    "de-AT": {
        "flag": "🇦🇹",
        "accent": "Austrian",
        "language": "German",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Softer consonants • Melodic pitch contour"
    },
    "de-CH": {
        "flag": "🇨🇭",
        "accent": "Swiss German",
        "language": "German",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Guttural ch in all positions • Distinct rhythm"
    },
    
    "it-IT": {
        "flag": "🇮🇹",
        "accent": "Italian",
        "language": "Italian",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Consonant gemination • Expressive melodic arcs • Rolled R"
    },
    "pt-BR": {
        "flag": "🇧🇷",
        "accent": "Brazilian",
        "language": "Portuguese",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Bouncy cadence • T/D palatalization (ch/dj) • Nasal vowels"
    },
    "pt-PT": {
        "flag": "🇵🇹",
        "accent": "European",
        "language": "Portuguese",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Heavy vowel reduction • Coda sh/zh sibilants • Dark L"
    },
    "ja-JP": {
        "flag": "🇯🇵",
        "accent": "Japanese",
        "language": "Japanese",
        "rhythm": "Mora-timed",
        "phonetic_hint": "Even mora pacing • Pitch accent drops • L/R tap merger"
    },
    "ko-KR": {
        "flag": "🇰🇷",
        "accent": "Korean",
        "language": "Korean",
        "rhythm": "Accentual-phrase",
        "phonetic_hint": "3-way stop contrast (plain/aspirated/tense) • Unreleased codas"
    },
    "zh-CN": {
        "flag": "🇨🇳",
        "accent": "Mainland Mandarin",
        "language": "Chinese",
        "rhythm": "Tone/Syllable-timed",
        "phonetic_hint": "4 Lexical tones • Retroflex consonants • Pitch stepping"
    },
    "zh-TW": {
        "flag": "🇹🇼",
        "accent": "Taiwanese Mandarin",
        "language": "Chinese",
        "rhythm": "Tone/Syllable-timed",
        "phonetic_hint": "Soft tones • Absence of retroflexion"
    },
    "zh-HK": {
        "flag": "🇭🇰",
        "accent": "Cantonese",
        "language": "Chinese",
        "rhythm": "Tone/Syllable-timed",
        "phonetic_hint": "6-9 Tones • Syllable-final stops [p, t, k]"
    },
    "ru-RU": {
        "flag": "🇷🇺",
        "accent": "Russian",
        "language": "Russian",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Hard/soft palatalization • Final devoicing • Steep pitch spikes"
    },
    "ar-EG": {
        "flag": "🇪🇬",
        "accent": "Egyptian",
        "language": "Arabic",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Bouncy musical cadence • G for J • Glottal stop for Q"
    },
    "ar-SA": {
        "flag": "🇸🇦",
        "accent": "Saudi",
        "language": "Arabic",
        "rhythm": "Stress/Mora-timed",
        "phonetic_hint": "Pharyngeal consonants (ح/ع) • Emphatic sounds • Rolled R"
    },
    "hi-IN": {
        "flag": "🇮🇳",
        "accent": "Hindi",
        "language": "Hindi",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Aspirated & retroflex stops • Pure nasal vowels"
    },
    "nl-NL": {
        "flag": "🇳🇱",
        "accent": "Dutch",
        "language": "Dutch",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Guttural G/CH • Final devoicing • Labiodental W"
    },
    "pl-PL": {
        "flag": "🇵🇱",
        "accent": "Polish",
        "language": "Polish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Penultimate word stress • Rich sibilant series"
    },
    "sv-SE": {
        "flag": "🇸🇪",
        "accent": "Swedish",
        "language": "Swedish",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Singing pitch accent • Vowel length distinction"
    },
    "tr-TR": {
        "flag": "🇹🇷",
        "accent": "Turkish",
        "language": "Turkish",
        "rhythm": "Syllable-timed",
        "phonetic_hint": "Vowel harmony • Final syllable stress"
    },
    "uk-UA": {
        "flag": "🇺🇦",
        "accent": "Ukrainian",
        "language": "Ukrainian",
        "rhythm": "Stress-timed",
        "phonetic_hint": "Soft palatalized consonants • Voiced glottal H"
    },
    "vi-VN": {
        "flag": "🇻🇳",
        "accent": "Vietnamese",
        "language": "Vietnamese",
        "rhythm": "Tone/Syllable-timed",
        "phonetic_hint": "6 Lexical tones • Complex vowel system"
    },
}

# Localized preview samples
PREVIEW_SAMPLES = {
    "English": "Hello! I am ready to bring your words and dialogue to life with Voxora.",
    "French": "Bonjour! Je suis ravi de vous prêter ma voix pour Voxora.",
    "Spanish": "¡Hola! Estoy listo para dar vida a tus proyectos con Voxora.",
    "German": "Hallo! Ich freue mich darauf, deine Texte mit Voxora zu vertonen.",
    "Italian": "Ciao! Sono pronto a dare vita ai tuoi dialoghi con Voxora.",
    "Portuguese": "Olá! Estou pronto para dar vida às suas palavras com o Voxora.",
    "Japanese": "こんにちは！Voxoraであなたの言葉をお届けします。",
    "Korean": "안녕하세요! Voxora로 당신의 대화에 생명을 불어넣겠습니다.",
    "Chinese": "你好！我已准备好用 Voxora 为你的文字赋予声音。",
}

CHILD_NAMES = {"ana", "amala", "eloise", "eman", "lia", "zack", "mairi", "niall", "peipei", "pim", "thalitakid", "linh", "chloe", "hina", "minho"}
TEEN_NAMES = {"kevin", "maisie", "gia", "jaspal", "alba", "kavya", "yunjian", "xiaobei", "xiaoao", "noora", "erika", "tamara", "milo", "noah", "leonie"}
SENIOR_NAMES = {"roger", "davis", "thomas", "henri", "tony", "steffan", "conrad", "christel", "bernard", "willem", "geoffrey", "dmitry", "jorge", "gerard", "mario", "jose", "alain"}
MATURE_NAMES = {"andrew", "brian", "ryan", "christopher", "eric", "denise", "jean", "elvira", "florian", "diego", "antonio", "prabhat", "connor", "duarte", "hamed", "svetlana", "maarten", "yunxi", "boris", "alvaro", "guy", "marcus", "oliver", "seraphina"}

def determine_age_bracket(name: str, short_name: str) -> str:
    n = name.lower()
    s = short_name.lower()
    if any(k in n or k in s for k in ["kid", "child"]) or n in CHILD_NAMES:
        return "Child"
    if any(k in n or k in s for k in ["teen", "youth"]) or n in TEEN_NAMES:
        return "Teenager"
    if any(k in n or k in s for k in ["senior", "elder", "old"]) or n in SENIOR_NAMES:
        return "Senior"
    if n in MATURE_NAMES:
        return "Mature Adult"
    return "Young Adult"

class EdgeTTSAdapter(BaseTTSEngine):
    def __init__(self):
        self._cached_voices: Optional[List[VoiceInfo]] = None

    async def get_voices(self) -> List[VoiceInfo]:
        if self._cached_voices:
            return self._cached_voices

        raw_voices = await edge_tts.list_voices()
        voice_catalog: List[VoiceInfo] = []

        for v in raw_voices:
            short_name = v.get("ShortName", "")
            locale = v.get("Locale", "")
            gender = v.get("Gender", "Female")
            
            # Extract simple name (e.g., 'fr-FR-DeniseNeural' -> 'Denise')
            parts = short_name.split("-")
            simple_name = parts[-1].replace("Neural", "") if len(parts) >= 3 else short_name
            is_multilingual = "multilingual" in short_name.lower()
            age_bracket = determine_age_bracket(simple_name, short_name)

            meta = LOCALE_METADATA.get(locale, {
                "flag": "🌐",
                "accent": locale,
                "language": locale.split("-")[0].upper(),
                "rhythm": "Natural pacing",
                "phonetic_hint": "Neural pronunciation model"
            })

            friendly_name = f"{simple_name} (Neural)"
            tags = [gender, "Neural", age_bracket]
            if is_multilingual:
                tags.append("Multilingual")

            voice_catalog.append(VoiceInfo(
                id=short_name,
                name=simple_name,
                friendly_name=friendly_name,
                gender=gender,
                locale=locale,
                language=meta["language"],
                accent=meta["accent"],
                flag=meta["flag"],
                is_multilingual=is_multilingual,
                age_bracket=age_bracket,
                rhythm=meta.get("rhythm", "Natural timing"),
                phonetic_hint=meta.get("phonetic_hint", "Neural synthesis"),
                sample_rate_hz=24000,
                description=f"{meta['language']} ({meta['accent']}) - {gender} ({age_bracket})",
                tags=tags
            ))

        # Sort with popular accents first (US, UK, FR, NG, CA, AU, ES, DE)
        priority_locales = ["en-US", "en-GB", "fr-FR", "en-NG", "fr-CA", "en-AU", "es-ES", "de-DE", "ja-JP"]
        def sort_key(v: VoiceInfo):
            if v.locale in priority_locales:
                return (0, priority_locales.index(v.locale), v.name)
            return (1, v.language, v.accent, v.name)

        voice_catalog.sort(key=sort_key)
        self._cached_voices = voice_catalog
        return self._cached_voices

    def _format_rate(self, rate: float) -> str:
        diff = int(round((rate - 1.0) * 100))
        return f"+{diff}%" if diff >= 0 else f"{diff}%"

    def _format_pitch(self, pitch: float) -> str:
        pitch_int = int(round(pitch))
        return f"+{pitch_int}Hz" if pitch_int >= 0 else f"{pitch_int}Hz"

    def _format_volume(self, volume: float) -> str:
        diff = int(round((volume - 1.0) * 100))
        return f"+{diff}%" if diff >= 0 else f"{diff}%"

    async def synthesize(self, text: str, voice_id: str, options: Optional[SynthesisOptions] = None) -> bytes:
        if options is None:
            options = SynthesisOptions()

        rate_str = self._format_rate(options.rate)
        pitch_str = self._format_pitch(options.pitch)
        volume_str = self._format_volume(options.volume)

        # Sanitize clean text
        clean_text = text.strip()
        if not clean_text:
            return b""

        # Edge TTS communicate with rate, pitch, volume
        communicate = edge_tts.Communicate(
            clean_text,
            voice=voice_id,
            rate=rate_str,
            pitch=pitch_str,
            volume=volume_str
        )

        audio_bytes = bytearray()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes.extend(chunk["data"])

        return bytes(audio_bytes)

    async def preview_voice(
        self,
        voice_id: str,
        sample_text: Optional[str] = None,
        options: Optional[SynthesisOptions] = None
    ) -> bytes:
        if not sample_text:
            # Find appropriate localized sample
            voices = await self.get_voices()
            matched = next((v for v in voices if v.id == voice_id), None)
            lang = matched.language if matched else "English"
            sample_text = PREVIEW_SAMPLES.get(lang, PREVIEW_SAMPLES["English"])

        synth_opts = options if options is not None else SynthesisOptions(rate=1.0, pitch=0.0, volume=1.0)
        return await self.synthesize(sample_text, voice_id, synth_opts)
