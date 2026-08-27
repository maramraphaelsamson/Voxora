import type { Voice, Speaker, DialogueLine } from '../types';

const API_BASE = '/api';

export async function fetchVoices(): Promise<Voice[]> {
  try {
    const res = await fetch(`${API_BASE}/voices`);
    if (!res.ok) throw new Error('Failed to fetch voices');
    const data = await res.json();
    return data.voices;
  } catch (err) {
    console.error('fetchVoices error:', err);
    return [];
  }
}

export async function fetchVoicePreview(
  voiceId: string,
  sampleText?: string,
  rate = 1.0,
  pitch = 0.0
): Promise<string> {
  const res = await fetch(`${API_BASE}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice_id: voiceId,
      sample_text: sampleText,
      rate,
      pitch,
    }),
  });
  if (!res.ok) throw new Error('Failed to generate preview');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function synthesizeSingleVoice(
  text: string,
  voiceId: string,
  rate = 1.0,
  pitch = 0.0,
  volume = 1.0
): Promise<string> {
  const res = await fetch(`${API_BASE}/synthesize/single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      voice_id: voiceId,
      rate,
      pitch,
      volume,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Synthesis failed' }));
    throw new Error(err.detail || 'Single synthesis failed');
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function synthesizeDialogue(
  lines: DialogueLine[],
  speakers: Record<string, Speaker>,
  globalRate = 1.0,
  globalPitch = 0.0,
  globalVolume = 1.0,
  pauseBetweenMs = 400
): Promise<string> {
  const res = await fetch(`${API_BASE}/synthesize/dialogue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lines,
      speakers,
      global_rate: globalRate,
      global_pitch: globalPitch,
      global_volume: globalVolume,
      pause_between_ms: pauseBetweenMs,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Dialogue synthesis failed' }));
    throw new Error(err.detail || 'Dialogue synthesis failed');
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function parseScriptText(text: string, defaultSpeaker = 'Narrator'): Promise<{
  lines: Array<{ index: number; speaker_name: string; text: string }>;
  speakers: string[];
  total_lines: number;
  total_characters: number;
}> {
  const res = await fetch(`${API_BASE}/parse-script`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, default_speaker: defaultSpeaker }),
  });
  if (!res.ok) throw new Error('Failed to parse script');
  return await res.json();
}

export async function uploadDocumentFile(file: File): Promise<{
  filename: string;
  raw_text: string;
  parsed: {
    lines: Array<{ index: number; speaker_name: string; text: string }>;
    speakers: string[];
  };
}> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-document`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Document upload failed');
  return await res.json();
}
