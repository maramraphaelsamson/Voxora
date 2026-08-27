import type { AgeBracket, Voice } from '../types';

export interface AgePreset {
  id: AgeBracket;
  label: string;
  shortLabel: string;
  range: string;
  icon: string;
  pitch: number;
  rate: number;
}

export const AGE_PRESETS: Record<AgeBracket, AgePreset> = {
  Any: {
    id: 'Any',
    label: 'All Ages',
    shortLabel: 'Any',
    range: 'All',
    icon: '👥',
    pitch: 0,
    rate: 1.0,
  },
  Child: {
    id: 'Child',
    label: 'Child',
    shortLabel: 'Child',
    range: '5–11 yrs',
    icon: '🧒',
    pitch: 45,
    rate: 1.08,
  },
  Teenager: {
    id: 'Teenager',
    label: 'Teenager',
    shortLabel: 'Teen',
    range: '12–19 yrs',
    icon: '🎧',
    pitch: 20,
    rate: 1.05,
  },
  'Young Adult': {
    id: 'Young Adult',
    label: 'Young Adult',
    shortLabel: 'Youth',
    range: '20–35 yrs',
    icon: '🧑',
    pitch: 0,
    rate: 1.0,
  },
  'Mature Adult': {
    id: 'Mature Adult',
    label: 'Mature Adult',
    shortLabel: 'Adult',
    range: '36–55 yrs',
    icon: '👨',
    pitch: -12,
    rate: 0.98,
  },
  Senior: {
    id: 'Senior',
    label: 'Senior',
    shortLabel: 'Senior',
    range: '55+ yrs',
    icon: '👴',
    pitch: -30,
    rate: 0.90,
  },
};

export const AGE_BRACKET_LIST: AgeBracket[] = [
  'Child',
  'Teenager',
  'Young Adult',
  'Mature Adult',
  'Senior',
];

/**
 * Universal 3-Tier Demographic Voice Matcher:
 * Tier 1: Look for exact demographic match in current language & gender.
 * Tier 2: Look for matching multilingual cross-over voice.
 * Tier 3: Safely keep current voice and rely on universal acoustic pitch/tempo transform.
 */
export function findBestVoiceForDemographic(
  voices: Voice[],
  currentVoiceId: string,
  targetLanguage: string,
  targetGender: 'Male' | 'Female',
  targetAge: AgeBracket
): Voice | null {
  if (targetAge === 'Any' || voices.length === 0) return null;

  // Tier 1: Exact native demographic match in same language and gender
  const exactMatch = voices.find(
    (v) =>
      v.language.toLowerCase() === targetLanguage.toLowerCase() &&
      v.gender === targetGender &&
      v.age_bracket === targetAge
  );
  if (exactMatch) return exactMatch;

  // Tier 1b: Exact demographic match in same language (any gender if preferred gender is missing)
  const langMatch = voices.find(
    (v) =>
      v.language.toLowerCase() === targetLanguage.toLowerCase() &&
      v.age_bracket === targetAge
  );
  if (langMatch) return langMatch;

  // Tier 2: Multilingual voice with matching age demographic
  const multiMatch = voices.find(
    (v) => v.is_multilingual && v.gender === targetGender && v.age_bracket === targetAge
  );
  if (multiMatch) return multiMatch;

  // Tier 3: Keep existing voice (universal acoustic prosody handles the age transform)
  return voices.find((v) => v.id === currentVoiceId) || null;
}
