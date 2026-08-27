import io
import math
import struct
import wave
from typing import List, Optional

class AudioStitcher:
    """
    High-performance audio stitcher for combining multiple TTS speech segments
    with customizable inter-speaker silence gaps.
    """

    @staticmethod
    def create_silence_mp3(duration_ms: int) -> bytes:
        """
        Creates a valid silent MPEG Audio Layer 3 (MP3) frame sequence for the requested duration.
        MPEG 2.5 Layer III at 24000Hz, 32kbps mono frame is 72 bytes representing 24ms.
        """
        if duration_ms <= 0:
            return b""
        
        # 1 frame of silent 24kHz 32kbps MP3
        # Standard silent MP3 frame header: 0xFF 0xF3 0x20 0x00 ...
        silent_frame = bytes([
            0xFF, 0xF3, 0x20, 0xC4, 0x00, 0x00, 0x00, 0x03, 0x48, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ])
        frame_ms = 24.0 # 576 samples at 24000Hz = 24ms
        num_frames = max(1, int(round(duration_ms / frame_ms)))
        return silent_frame * num_frames

    @classmethod
    def stitch_mp3_segments(cls, audio_segments: List[bytes], pause_between_ms: int = 400) -> bytes:
        """
        Concatenates MP3 byte chunks, inserting silent gaps between speakers.
        """
        if not audio_segments:
            return b""
        
        if len(audio_segments) == 1:
            return audio_segments[0]

        silence = cls.create_silence_mp3(pause_between_ms)
        output = bytearray()

        for i, segment in enumerate(audio_segments):
            if not segment:
                continue
            output.extend(segment)
            # Add pause between segments (not after the final segment)
            if i < len(audio_segments) - 1 and pause_between_ms > 0:
                output.extend(silence)

        return bytes(output)
