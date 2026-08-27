export type Gender = 'Male' | 'Female' | 'Any';
export type AgeBracket = 'Any' | 'Child' | 'Teenager' | 'Young Adult' | 'Mature Adult' | 'Senior';
export type AppMode = 'single' | 'dialogue';
export type NavTab = 'studio' | 'dashboard' | 'projects' | 'voices' | 'templates' | 'history' | 'favorites' | 'settings';

export interface Voice {
  id: string;
  name: string;
  friendly_name: string;
  gender: 'Male' | 'Female';
  locale: string;
  language: string;
  accent: string;
  flag: string;
  is_multilingual: boolean;
  age_bracket?: string;
  rhythm?: string;
  phonetic_hint?: string;
  sample_rate_hz: number;
  description?: string;
  tags: string[];
}

export interface Speaker {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  age_bracket?: AgeBracket;
  language: string;
  accent: string;
  flag: string;
  voice_id: string;
  color: 'pink' | 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo' | 'rose' | 'cyan';
  rate: number;
  pitch: number;
  volume: number;
}

export interface DialogueLine {
  id: string;
  speaker_name: string;
  text: string;
}

export interface Project {
  id: string;
  title: string;
  mode: AppMode;
  singleText: string;
  singleVoiceId: string;
  singleRate: number;
  singlePitch: number;
  singleVolume: number;
  lines: DialogueLine[];
  speakers: Record<string, Speaker>;
  globalRate: number;
  globalPitch: number;
  globalVolume: number;
  pauseBetweenMs: number;
  audioUrl: string | null;
  duration: number;
  updatedAt: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  mode: AppMode;
  date: string;
  duration: string;
  audioUrl: string;
  characters: number;
}
