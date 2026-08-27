import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  Play,
  RefreshCw,
  Heart,
  Check,
  Sparkles,
} from 'lucide-react';
import type { Voice, Gender, AgeBracket } from '../types';
import { AGE_PRESETS } from '../utils/agePresets';

interface VoiceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: Voice[];
  selectedVoiceId?: string;
  onSelectVoice: (voice: Voice) => void;
  onPreviewVoice: (voiceId: string) => void;
  previewingVoiceId: string | null;
  targetSpeakerName?: string;
}

const AGE_FILTER_OPTIONS: AgeBracket[] = [
  'Any',
  'Child',
  'Teenager',
  'Young Adult',
  'Mature Adult',
  'Senior',
];

export const VoiceExplorerModal: React.FC<VoiceExplorerModalProps> = ({
  isOpen,
  onClose,
  voices,
  selectedVoiceId,
  onSelectVoice,
  onPreviewVoice,
  previewingVoiceId,
  targetSpeakerName,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Choose a Voice</span>
              {targetSpeakerName && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  For {targetSpeakerName}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Explore 300+ neural voices with native accents and biological age profiles
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-100 space-y-3">
          {/* Top Filter Row: Search, Language, Accent, Gender, Favs */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search voices by name, accent..."
                className="w-full bg-white pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 shadow-2xs"
              />
            </div>

            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setSelectedAccent('All');
              }}
              className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden"
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
              className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs focus:outline-hidden"
            >
              <option value="All">All Accents</option>
              {accents.filter((a) => a !== 'All').map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {(['Any', 'Female', 'Male'] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGender(g)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-colors ${
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                onlyFavorites
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              } shadow-2xs`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  onlyFavorites ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
              <span>Favorites</span>
            </button>
          </div>

          {/* Bottom Filter Row: 5-Tier Age Range Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Age:</span>
            {AGE_FILTER_OPTIONS.map((age) => {
              const preset = AGE_PRESETS[age];
              const isSelected = selectedAge === age;

              return (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs'
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
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[500px]">
          {filteredVoices.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-sky-500" />
              <p className="text-sm font-bold text-slate-700">No voices found</p>
            </div>
          ) : (
            filteredVoices.map((v) => {
              const isSelected = selectedVoiceId === v.id;
              const isFav = !!favorites[v.id];
              const isPreviewing = previewingVoiceId === v.id;
              const agePreset = v.age_bracket ? AGE_PRESETS[v.age_bracket as AgeBracket] : undefined;

              return (
                <div
                  key={v.id}
                  onClick={() => onSelectVoice(v)}
                  className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-300 shadow-sm'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-xs shrink-0 ${
                          v.gender === 'Female'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-sky-100 text-sky-700'
                        }`}
                      >
                        {v.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                            {v.friendly_name}
                          </h4>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3]" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                          <span>{v.flag}</span>
                          <span>
                            {v.language} ({v.accent.split(' ')[0]})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(v.id, e)}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  </div>

                  {v.phonetic_hint && (
                    <p className="text-[10px] text-slate-500 font-medium mb-2.5 line-clamp-1">
                      {v.phonetic_hint}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreviewVoice(v.id);
                      }}
                      disabled={isPreviewing}
                      title="Audition voice"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isPreviewing
                          ? 'bg-slate-950 text-sky-400 animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-950 hover:text-sky-400 text-slate-700'
                      }`}
                    >
                      {isPreviewing ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                      ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Showing {filteredVoices.length} of {voices.length} voices</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
