import React, { useState, useMemo } from 'react';
import {
  Search,
  Play,
  RefreshCw,
  Heart,
  Volume2,
} from 'lucide-react';
import type { Voice, Gender, AgeBracket } from '../types';
import { AGE_PRESETS } from '../utils/agePresets';

interface VoiceExplorerPageProps {
  voices: Voice[];
  onSelectVoiceForStudio: (voice: Voice) => void;
  onPreviewVoice: (voiceId: string) => void;
  previewingVoiceId: string | null;
}

const AGE_FILTER_OPTIONS: AgeBracket[] = [
  'Any',
  'Child',
  'Teenager',
  'Young Adult',
  'Mature Adult',
  'Senior',
];

export const VoiceExplorerPage: React.FC<VoiceExplorerPageProps> = ({
  voices,
  onSelectVoiceForStudio,
  onPreviewVoice,
  previewingVoiceId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedAccent, setSelectedAccent] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<Gender>('Any');
  const [selectedAge, setSelectedAge] = useState<AgeBracket>('Any');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'en-GB-RyanNeural': true,
    'fr-FR-DeniseNeural': true,
    'en-NG-AbeoNeural': true,
  });

  const toggleFavorite = (voiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [voiceId]: !prev[voiceId] }));
  };

  const languages = useMemo(() => {
    const set = new Set<string>();
    voices.forEach((v) => set.add(v.language));
    return ['All', ...Array.from(set).sort()];
  }, [voices]);

  const accents = useMemo(() => {
    const set = new Set<string>();
    voices.forEach((v) => {
      if (selectedLanguage === 'All' || v.language === selectedLanguage) {
        set.add(v.accent);
      }
    });
    return ['All', ...Array.from(set).sort()];
  }, [voices, selectedLanguage]);

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = v.name.toLowerCase().includes(q) || v.friendly_name.toLowerCase().includes(q);
        const matchesLang = v.language.toLowerCase().includes(q);
        const matchesAccent = v.accent.toLowerCase().includes(q);
        if (!matchesName && !matchesLang && !matchesAccent) return false;
      }
      if (selectedLanguage !== 'All' && v.language !== selectedLanguage) return false;
      if (selectedAccent !== 'All' && v.accent !== selectedAccent) return false;
      if (selectedGender !== 'Any' && v.gender !== selectedGender) return false;
      if (selectedAge !== 'Any' && v.age_bracket !== selectedAge) return false;
      if (onlyFavorites && !favorites[v.id]) return false;

      return true;
    });
  }, [voices, searchQuery, selectedLanguage, selectedAccent, selectedGender, selectedAge, onlyFavorites, favorites]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Volume2 className="w-6 h-6 text-sky-600" />
            <span>Voice Library & Accents</span>
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Over {voices.length} neural voices with biological age profiles and regional accents
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-3">
        {/* Row 1: Search, Language, Accent, Gender, Favs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, accent (e.g. British, French, Nigerian)..."
              className="w-full bg-slate-50 pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setSelectedAccent('All');
            }}
            className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Languages</option>
            {languages.filter((l) => l !== 'All').map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={selectedAccent}
            onChange={(e) => setSelectedAccent(e.target.value)}
            className="bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden"
          >
            <option value="All">All Accents</option>
            {accents.filter((a) => a !== 'All').map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            {(['Any', 'Female', 'Male'] as Gender[]).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors ${
                  selectedGender === g
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              onlyFavorites
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span>Favorites</span>
          </button>
        </div>

        {/* Row 2: 5-Tier Age Range Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Age Range:</span>
          {AGE_FILTER_OPTIONS.map((age) => {
            const preset = AGE_PRESETS[age];
            const isSelected = selectedAge === age;

            return (
              <button
                key={age}
                onClick={() => setSelectedAge(age)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVoices.map((v) => {
          const isFav = !!favorites[v.id];
          const isPreviewing = previewingVoiceId === v.id;
          const agePreset = v.age_bracket ? AGE_PRESETS[v.age_bracket as AgeBracket] : undefined;

          return (
            <div
              key={v.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                      v.gender === 'Female'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {v.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{v.friendly_name}</h3>
                    <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                      <span>{v.flag}</span>
                      <span>
                        {v.language} ({v.accent})
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleFavorite(v.id, e)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              </div>

              {v.phonetic_hint && (
                <p className="text-[11px] text-slate-500 font-medium mb-3 line-clamp-1">
                  {v.phonetic_hint}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                    {v.gender}
                  </span>
                  {agePreset && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {agePreset.icon} {agePreset.shortLabel}
                    </span>
                  )}
                  {v.rhythm && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {v.rhythm}
                    </span>
                  )}
                  {v.is_multilingual && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Multilingual
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewVoice(v.id)}
                    disabled={isPreviewing}
                    title="Audition voice"
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isPreviewing
                        ? 'bg-slate-950 text-sky-400 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isPreviewing ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                    ) : (
                      <Play className="w-3 h-3 fill-current" />
                    )}
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => onSelectVoiceForStudio(v)}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Use in Studio
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
