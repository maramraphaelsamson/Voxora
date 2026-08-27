import re
from typing import List, Dict, Tuple, Optional
from pydantic import BaseModel, Field

class ParsedLine(BaseModel):
    index: int
    speaker_name: str
    text: str
    original_line: str
    char_count: int

class ScriptParseResult(BaseModel):
    lines: List[ParsedLine]
    speakers: List[str]
    total_lines: int
    total_characters: int

class ScriptParser:
    # Matches patterns like:
    # "Sarah: text", "Sarah - text", "[Sarah]: text", "Sarah (whispering): text"
    SPEAKER_PATTERNS = [
        re.compile(r"^\s*\[([a-zA-Z0-9_\s\.\-'\u00C0-\u017F]+)\]\s*[:\-]?\s*(.*)$", re.UNICODE),
        re.compile(r"^\s*([a-zA-Z0-9_\.\-'\u00C0-\u017F]+(?:\s+[a-zA-Z0-9_\.\-'\u00C0-\u017F]+)?)\s*:\s*(.*)$", re.UNICODE),
        re.compile(r"^\s*([a-zA-Z0-9_\.\-'\u00C0-\u017F]+(?:\s+[a-zA-Z0-9_\.\-'\u00C0-\u017F]+)?)\s+[\-–—]\s+(.*)$", re.UNICODE),
    ]

    @classmethod
    def parse_text(cls, script_text: str, default_speaker: str = "Narrator") -> ScriptParseResult:
        raw_lines = script_text.strip().split("\n")
        parsed_lines: List[ParsedLine] = []
        discovered_speakers: Dict[str, bool] = {}
        last_speaker = default_speaker

        line_index = 0
        for raw in raw_lines:
            line_str = raw.strip()
            if not line_str:
                continue

            matched_speaker = None
            content = line_str

            for pattern in cls.SPEAKER_PATTERNS:
                m = pattern.match(line_str)
                if m:
                    candidate = m.group(1).strip()
                    # Filter out false positives (e.g. URLs or timestamps like 8:30)
                    if candidate and not candidate.isdigit() and len(candidate) <= 30 and not candidate.lower().startswith("http"):
                        matched_speaker = candidate
                        content = m.group(2).strip()
                        break

            if matched_speaker:
                speaker = matched_speaker
                last_speaker = matched_speaker
            else:
                speaker = last_speaker

            if content:
                discovered_speakers[speaker] = True
                parsed_lines.append(ParsedLine(
                    index=line_index,
                    speaker_name=speaker,
                    text=content,
                    original_line=line_str,
                    char_count=len(content)
                ))
                line_index += 1

        speaker_list = list(discovered_speakers.keys())
        total_chars = sum(l.char_count for l in parsed_lines)

        return ScriptParseResult(
            lines=parsed_lines,
            speakers=speaker_list,
            total_lines=len(parsed_lines),
            total_characters=total_chars
        )
