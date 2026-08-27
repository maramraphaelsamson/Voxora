# 🎙️ Voxora — AI Voice Studio

Voxora is a multi-speaker Text-to-Speech studio with support for neural voices, cross-language accents, dialogue parsing, custom pauses, and high-fidelity audio export.

---

## ✨ Features

- **🎙️ Single-Person Narration Mode**: Paste/type text, pick any voice/accent, adjust speed and pitch, and generate continuous audio.
- **👥 Multi-Speaker Dialogue Mode**:
  - Automatically parses script lines (`Sarah: ...`, `James: ...`, `Narrator: ...`).
  - Assign individual voices, genders, and nationalities to each speaker.
  - Automatic inter-speaker pause gap insertion (e.g. 400ms) for natural conversational rhythm.
- **🌍 Authentic Cross-Language & Regional Accents**:
  - **Regional Accents**: British (UK), American (US), Nigerian (NG), Australian (AU), Canadian (CA), Irish (IE), Indian (IN), French (France/Canada/Belgium), Spanish (Spain/Mexico), etc.
  - **Cross-Language Accents**: Multilingual Neural Voices (e.g. French model reading English with a natural French accent).
- **🔊 Instant Voice Auditioning (Preview)**: Audition any voice before generating full audio.
- **📁 Document Ingestion**: Upload `.txt`, `.pdf`, `.docx`, or `.md` files to automatically extract and parse dialogue lines.
- **🎚️ Waveform Scrubber & Player**: Interactive scrubbable waveform player with speed multiplier (0.75x–2.0x) and export to MP3/WAV.
- **📱 Fully Responsive**: Desktop studio view and Mobile PWA layout with bottom navigation drawer.
- **🔌 Decoupled Backend TTS Engine Layer**: Built on top of `BaseTTSEngine` with `EdgeTTSAdapter` as default, ready for future ElevenLabs or OpenAI TTS adapters.

---

## 🚀 Quick Start

### 1. Launch Everything (Single Command)
```powershell
python run.py
```
This starts both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`) and opens your default browser automatically.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (TypeScript), Vite, Tailwind CSS, Lucide React, HTML5 Web Audio API.
- **Backend**: Python 3.11, FastAPI, Uvicorn, Pydantic v2.
- **TTS Engine**: Microsoft Edge Neural Speech (`edge-tts`), wrapped in an abstract `BaseTTSEngine` interface.
- **Document Extractors**: `pypdf`, `python-docx`.
