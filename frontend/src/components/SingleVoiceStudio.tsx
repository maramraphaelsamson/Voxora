import React from 'react';
import {
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Upload,
  Trash2,
} from 'lucide-react';
import type { Voice } from '../types';
import { AGE_PRESETS, AGE_BRACKET_LIST, findBestVoiceForDemographic } from '../utils/agePresets';

interface SingleVoiceStudioProps {
  text: string;
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
  voices: Voice[];
  onUpdateText: (text: string) => void;
  onUpdateVoiceId: (voiceId: string) => void;
  onUpdateControls: (controls: { rate?: number; pitch?: number; volume?: number }) => void;
  onOpenImportModal: () => void;
  onOpenVoiceExplorer: () => void;
  onPreviewVoice: (voiceId: string, rate?: number, pitch?: number) => void;
  previewingVoiceId: string | null;
  onGenerateAudio: () => void;
  isGenerating: boolean;
}

export const SingleVoiceStudio: React.FC<SingleVoiceStudioProps> = ({
  text,
  voiceId,
  rate,
  pitch,
  volume,
  voices,
  onUpdateText,
  onUpdateVoiceId,
  onUpdateControls,
  onOpenImportModal,
  onOpenVoiceExplorer,
  onPreviewVoice,
  previewingVoiceId,
  onGenerateAudio,
  isGenerating,
}) => {
  const currentVoice = voices.find((v) => v.id === voiceId) || voices[0];
  const isPreviewing = previewingVoiceId === currentVoice?.id;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto items-start">
      {/* Left: Single Text Box (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col min-h-[520px]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Narration Script</h2>
            <p className="text-xs text-slate-400 font-medium">One voice reads the entire text seamlessly</p>
          </div>

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Text</span>
          </button>
        </div>

        <textarea
          rows={12}
          value={text}
          onChange={(e) => onUpdateText(e.target.value)}
          placeholder="Paste or write your narration text here... 'The train arrived at 8:30 in the morning on a crisp autumn day...'"
          className="flex-1 w-full bg-slate-50/70 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 resize-none leading-relaxed"
        />

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>{text.length} characters • {text.split(/\s+/).filter(Boolean).length} words</span>
          {text && (
            <button
              onClick={() => onUpdateText('')}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Voice Casting & Fine-Tuning (5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Selected Voice Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900">Voice Selection</h3>
            <button
              onClick={onOpenVoiceExplorer}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
            >
              Browse All Voices →
            </button>
          </div>

          {/* Voice Display Card */}
          {currentVoice && (
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-sky-200 flex items-center justify-center text-xl">
                  {currentVoice.flag}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-900">{currentVoice.friendly_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-white text-sky-700 border border-sky-200">
                      {currentVoice.gender}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-0.5">
                    {currentVoice.language} • {currentVoice.accent}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPreviewVoice(currentVoice.id, rate, pitch)}
                disabled={isPreviewing}
                title="Preview voice with current pitch and rate"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  isPreviewing
                    ? 'bg-slate-950 text-sky-400 animate-pulse'
                    : 'bg-white text-slate-800 hover:text-sky-600 hover:bg-sky-50 border border-slate-200 shadow-2xs'
                }`}
              >
                {isPreviewing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          )}

          {/* Quick Voice Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Quick Voice Switch</label>
            <select
              value={voiceId}
              onChange={(e) => onUpdateVoiceId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-400"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.flag} {v.friendly_name} — {v.language} ({v.accent}) {v.age_bracket ? `• ${v.age_bracket}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Age Persona Presets */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Age Persona</label>
            <div className="grid grid-cols-5 gap-1">
              {AGE_BRACKET_LIST.map((age) => {
                const preset = AGE_PRESETS[age];
                const isMatched = currentVoice?.age_bracket === age;

                return (
                  <button
                    key={age}
                    type="button"
                    onClick={() => {
                      const matched = findBestVoiceForDemographic(
                        voices,
                        voiceId,
                        currentVoice?.language || 'English',
                        currentVoice?.gender || 'Female',
                        age
                      );
                      if (matched && matched.id !== voiceId) {
                        onUpdateVoiceId(matched.id);
                      }
                      onUpdateControls({ rate: preset.rate, pitch: preset.pitch });
                    }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      isMatched
                        ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                    title={`Apply ${preset.label} (${preset.range}) voice and prosody`}
                  >
                    <span className="text-sm">{preset.icon}</span>
                    <span className="truncate mt-0.5">{preset.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Voice Parameters */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Voice Controls</h3>
          </div>

          {/* Speed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Speed (Tempo)</span>
              <span className="font-extrabold text-slate-900">{rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={rate}
              onChange={(e) => onUpdateControls({ rate: parseFloat(e.target.value) })}
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Pitch */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Pitch Tuning</span>
              <span className="font-extrabold text-slate-900">{pitch > 0 ? `+${pitch}` : pitch}</span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={pitch}
              onChange={(e) => onUpdateControls({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Volume */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Volume</span>
              <span className="font-extrabold text-slate-900">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={volume}
              onChange={(e) => onUpdateControls({ volume: parseFloat(e.target.value) })}
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={onGenerateAudio}
            disabled={isGenerating || !text.trim()}
            className="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-extrabold text-xs rounded-2xl shadow-sm shadow-sky-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Generating Speech...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Generate Speech</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
