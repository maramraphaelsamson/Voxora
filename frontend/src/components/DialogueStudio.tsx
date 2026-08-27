import React, { useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Play,
  Sliders,
  Sparkles,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import type { Voice, Speaker, DialogueLine, AgeBracket } from '../types';
import { AGE_PRESETS, AGE_BRACKET_LIST, findBestVoiceForDemographic } from '../utils/agePresets';

interface DialogueStudioProps {
  lines: DialogueLine[];
  speakers: Record<string, Speaker>;
  voices: Voice[];
  globalRate: number;
  globalPitch: number;
  globalVolume: number;
  pauseBetweenMs: number;
  onUpdateLines: (lines: DialogueLine[]) => void;
  onUpdateSpeakers: (speakers: Record<string, Speaker>) => void;
  onUpdateGlobalSettings: (settings: {
    rate?: number;
    pitch?: number;
    volume?: number;
    pauseMs?: number;
  }) => void;
  onOpenImportModal: () => void;
  onOpenVoiceExplorer: (forSpeakerId?: string) => void;
  onPreviewVoice: (voiceId: string, rate?: number, pitch?: number) => void;
  previewingVoiceId: string | null;
  onGenerateAudio: () => void;
  isGenerating: boolean;
}

const SPEAKER_COLOR_CLASSES: Record<
  string,
  { badge: string; avatar: string; border: string }
> = {
  pink: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
    avatar: 'bg-rose-500 text-white',
    border: 'border-l-4 border-rose-400',
  },
  blue: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
    avatar: 'bg-sky-600 text-white',
    border: 'border-l-4 border-sky-400',
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
    avatar: 'bg-emerald-600 text-white',
    border: 'border-l-4 border-emerald-400',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    avatar: 'bg-amber-500 text-white',
    border: 'border-l-4 border-amber-400',
  },
  purple: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
    avatar: 'bg-indigo-600 text-white',
    border: 'border-l-4 border-indigo-400',
  },
  indigo: {
    badge: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
    avatar: 'bg-slate-800 text-white',
    border: 'border-l-4 border-slate-700',
  },
};

export const DialogueStudio: React.FC<DialogueStudioProps> = ({
  lines,
  speakers,
  voices,
  globalRate,
  globalPitch,
  globalVolume,
  pauseBetweenMs,
  onUpdateLines,
  onUpdateSpeakers,
  onUpdateGlobalSettings,
  onOpenImportModal,
  onOpenVoiceExplorer,
  onPreviewVoice,
  previewingVoiceId,
  onGenerateAudio,
  isGenerating,
}) => {
  const [activeSpeakerMenu, setActiveSpeakerMenu] = useState<string | null>(null);

  // Character stats
  const totalCharacters = lines.reduce((acc, curr) => acc + curr.text.length, 0);

  // Add a new dialogue line
  const handleAddLine = () => {
    const speakerNames = Object.keys(speakers);
    const defaultSpeaker = speakerNames.length > 0 ? speakerNames[0] : 'Sarah';
    const newLine: DialogueLine = {
      id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      speaker_name: defaultSpeaker,
      text: '',
    };
    onUpdateLines([...lines, newLine]);
  };

  // Update a single dialogue line text
  const handleUpdateLineText = (id: string, text: string) => {
    const updated = lines.map((l) => (l.id === id ? { ...l, text } : l));
    onUpdateLines(updated);
  };

  // Switch a line's speaker
  const handleSwitchLineSpeaker = (lineId: string, speakerName: string) => {
    const updated = lines.map((l) => (l.id === lineId ? { ...l, speaker_name: speakerName } : l));
    onUpdateLines(updated);
    setActiveSpeakerMenu(null);
  };

  // Remove a dialogue line
  const handleDeleteLine = (id: string) => {
    if (lines.length <= 1) {
      onUpdateLines([{ id: `line_${Date.now()}`, speaker_name: Object.keys(speakers)[0] || 'Sarah', text: '' }]);
      return;
    }
    onUpdateLines(lines.filter((l) => l.id !== id));
  };

  // Clear all lines
  const handleClearAll = () => {
    if (confirm('Clear all script lines?')) {
      const defaultSpeaker = Object.keys(speakers)[0] || 'Sarah';
      onUpdateLines([{ id: `line_${Date.now()}`, speaker_name: defaultSpeaker, text: '' }]);
    }
  };

  // Add a new speaker
  const handleAddSpeaker = () => {
    const existingCount = Object.keys(speakers).length;
    const names = ['Narrator', 'Alex', 'Elena', 'Michael', 'Chloe', 'Daniel'];
    const unusedName = names.find((n) => !speakers[n]) || `Speaker ${existingCount + 1}`;
    const colors: Array<'pink' | 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo'> = [
      'emerald',
      'amber',
      'purple',
      'indigo',
      'pink',
      'blue',
    ];
    const chosenColor = colors[existingCount % colors.length];

    const defaultVoice = voices.find((v) => v.locale.startsWith('en-US')) || voices[0];

    const newSpeaker: Speaker = {
      id: `spk_${Date.now()}`,
      name: unusedName,
      gender: defaultVoice?.gender || 'Female',
      age_bracket: (defaultVoice?.age_bracket as AgeBracket) || 'Young Adult',
      language: defaultVoice?.language || 'English',
      accent: defaultVoice?.accent || 'American',
      flag: defaultVoice?.flag || '🇺🇸',
      voice_id: defaultVoice?.id || 'en-US-JennyNeural',
      color: chosenColor,
      rate: 1.0,
      pitch: 0.0,
      volume: 1.0,
    };

    onUpdateSpeakers({ ...speakers, [unusedName]: newSpeaker });
  };

  // Change age demographic for speaker with auto-demographic voice casting
  const handleSpeakerAgeChange = (speakerName: string, age: AgeBracket) => {
    const preset = AGE_PRESETS[age];
    const currentSpk = speakers[speakerName];
    const matchedVoice = findBestVoiceForDemographic(
      voices,
      currentSpk.voice_id,
      currentSpk.language,
      currentSpk.gender,
      age
    );

    onUpdateSpeakers({
      ...speakers,
      [speakerName]: {
        ...currentSpk,
        voice_id: matchedVoice ? matchedVoice.id : currentSpk.voice_id,
        age_bracket: age,
        rate: preset.rate,
        pitch: preset.pitch,
      },
    });
  };

  // Delete speaker
  const handleDeleteSpeaker = (speakerName: string) => {
    const keys = Object.keys(speakers);
    if (keys.length <= 1) {
      alert('You must have at least one speaker in dialogue mode.');
      return;
    }
    const updated = { ...speakers };
    delete updated[speakerName];
    onUpdateSpeakers(updated);

    const fallback = Object.keys(updated)[0];
    onUpdateLines(
      lines.map((l) => (l.speaker_name === speakerName ? { ...l, speaker_name: fallback } : l))
    );
  };

  // Change voice for speaker
  const handleSpeakerVoiceChange = (speakerName: string, voiceId: string) => {
    const matchedVoice = voices.find((v) => v.id === voiceId);
    if (!matchedVoice) return;

    onUpdateSpeakers({
      ...speakers,
      [speakerName]: {
        ...speakers[speakerName],
        voice_id: voiceId,
        gender: matchedVoice.gender,
        language: matchedVoice.language,
        accent: matchedVoice.accent,
        flag: matchedVoice.flag,
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto items-start">
      {/* ----------------- LEFT PANEL: SCRIPT EDITOR (7 cols) ----------------- */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col min-h-[580px]">
        {/* Script Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Script</h2>
            <p className="text-xs text-slate-400 font-medium">Write dialogue or assign lines per character</p>
          </div>

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Text</span>
          </button>
        </div>

        {/* Script Lines List */}
        <div className="flex-1 space-y-3 overflow-y-auto max-h-[480px] pr-1">
          {lines.map((line) => {
            const speaker = speakers[line.speaker_name] || {
              color: 'pink',
              name: line.speaker_name,
            };
            const colorScheme =
              SPEAKER_COLOR_CLASSES[speaker.color] || SPEAKER_COLOR_CLASSES.pink;

            return (
              <div
                key={line.id}
                className="group relative flex items-start gap-3 p-3 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-all"
              >
                {/* Speaker Selector Chip */}
                <div className="relative shrink-0 pt-0.5">
                  <button
                    onClick={() =>
                      setActiveSpeakerMenu(activeSpeakerMenu === line.id ? null : line.id)
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${colorScheme.badge}`}
                  >
                    <span>{line.speaker_name}</span>
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  </button>

                  {/* Speaker Switch Dropdown */}
                  {activeSpeakerMenu === line.id && (
                    <div className="absolute left-0 top-full mt-1 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1">
                        Switch Speaker
                      </div>
                      {Object.keys(speakers).map((spkName) => {
                        const spk = speakers[spkName];
                        const spkColor =
                          SPEAKER_COLOR_CLASSES[spk.color] || SPEAKER_COLOR_CLASSES.pink;
                        return (
                          <button
                            key={spkName}
                            onClick={() => handleSwitchLineSpeaker(line.id, spkName)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors text-left"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${spkColor.avatar.split(' ')[0]}`}
                            />
                            <span>{spkName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Line Text Area */}
                <textarea
                  rows={2}
                  value={line.text}
                  onChange={(e) => handleUpdateLineText(line.id, e.target.value)}
                  placeholder={`Write dialogue for ${line.speaker_name}...`}
                  className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 resize-none focus:outline-hidden leading-relaxed pt-1"
                />

                {/* Actions (Delete Line) */}
                <button
                  onClick={() => handleDeleteLine(line.id)}
                  title="Remove line"
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Script Footer / Stats */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
          <div className="flex items-center gap-2">
            <span>
              {lines.length} lines • {totalCharacters} characters
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddLine}
              className="flex items-center gap-1 text-sky-600 hover:text-sky-700 font-bold px-2.5 py-1 rounded-lg hover:bg-sky-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Line</span>
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- RIGHT PANEL: SPEAKERS & SETTINGS (5 cols) ----------------- */}
      <div className="lg:col-span-5 space-y-6">
        {/* Speakers Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-extrabold text-slate-900">Speakers</h2>
            <button
              onClick={handleAddSpeaker}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm shadow-sky-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
              <span>Add Speaker</span>
            </button>
          </div>

          {/* Speaker Cards List */}
          <div className="space-y-3.5">
            {Object.entries(speakers).map(([name, spk]) => {
              const colorScheme =
                SPEAKER_COLOR_CLASSES[spk.color] || SPEAKER_COLOR_CLASSES.pink;
              const isPreviewing = previewingVoiceId === spk.voice_id;

              return (
                <div
                  key={name}
                  className={`p-4 rounded-2xl bg-slate-50/80 border border-slate-100 ${colorScheme.border} space-y-3 transition-all`}
                >
                  {/* Top: Avatar, Name, Gender Badge, Menu */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${colorScheme.avatar}`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">{name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          spk.gender === 'Female'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {spk.gender === 'Female' ? '♀ Female' : '♂ Male'}
                      </span>
                      <button
                        onClick={() => handleDeleteSpeaker(name)}
                        title="Delete Speaker"
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdowns Row: Language/Accent & Voice Model + Preview Button */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Language / Country Flag dropdown button */}
                    <div className="col-span-6">
                      <button
                        onClick={() => onOpenVoiceExplorer(name)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-200 hover:border-sky-400 rounded-xl text-xs font-bold text-slate-700 shadow-2xs truncate"
                      >
                        <span className="truncate flex items-center gap-1.5">
                          <span>{spk.flag}</span>
                          <span className="truncate">{spk.language} ({spk.accent.split(' ')[0]})</span>
                        </span>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </button>
                    </div>

                    {/* Voice Model Selector */}
                    <div className="col-span-4">
                      <select
                        value={spk.voice_id}
                        onChange={(e) => handleSpeakerVoiceChange(name, e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 hover:border-sky-400 rounded-xl text-xs font-bold text-slate-700 shadow-2xs truncate focus:outline-hidden"
                      >
                        {voices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.gender.charAt(0)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Instant Preview Button (▶) */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => onPreviewVoice(spk.voice_id, spk.rate, spk.pitch)}
                        disabled={isPreviewing}
                        title="Audition voice preview with age settings"
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isPreviewing
                            ? 'bg-slate-950 text-sky-400 animate-pulse'
                            : 'bg-white border border-slate-200 hover:border-sky-400 text-slate-700 hover:text-sky-600 hover:bg-sky-50 shadow-2xs'
                        }`}
                      >
                        {isPreviewing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Age Range Demographic Selector */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">Age:</span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {AGE_BRACKET_LIST.map((age) => {
                        const preset = AGE_PRESETS[age];
                        const isSelected = (spk.age_bracket || 'Young Adult') === age;

                        return (
                          <button
                            key={age}
                            type="button"
                            onClick={() => handleSpeakerAgeChange(name, age)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                              isSelected
                                ? 'bg-sky-500 text-white shadow-2xs'
                                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                            }`}
                            title={`${preset.label} (${preset.range})`}
                          >
                            <span>{preset.icon}</span>
                            <span>{preset.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Dashed Add Speaker button */}
            <button
              onClick={handleAddSpeaker}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 rounded-2xl text-xs font-bold text-sky-600 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Speaker</span>
            </button>
          </div>
        </div>

        {/* Global Settings Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Global Settings</h3>
          </div>

          {/* Speed Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Speed</span>
              <span className="font-extrabold text-slate-900">{globalRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={globalRate}
              onChange={(e) =>
                onUpdateGlobalSettings({ rate: parseFloat(e.target.value) })
              }
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Pitch Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Pitch</span>
              <span className="font-extrabold text-slate-900">
                {globalPitch > 0 ? `+${globalPitch}` : globalPitch}
              </span>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={1}
              value={globalPitch}
              onChange={(e) =>
                onUpdateGlobalSettings({ pitch: parseFloat(e.target.value) })
              }
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Volume</span>
              <span className="font-extrabold text-slate-900">
                {Math.round(globalVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1.0}
              step={0.05}
              value={globalVolume}
              onChange={(e) =>
                onUpdateGlobalSettings({ volume: parseFloat(e.target.value) })
              }
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Inter-Speaker Pause Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Speaker Pause Gap</span>
              <span className="font-extrabold text-sky-600">{pauseBetweenMs}ms</span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={50}
              value={pauseBetweenMs}
              onChange={(e) =>
                onUpdateGlobalSettings({ pauseMs: parseInt(e.target.value) })
              }
              className="w-full accent-slate-950 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Generate Action Button */}
          <button
            onClick={onGenerateAudio}
            disabled={isGenerating || lines.length === 0}
            className="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-extrabold text-xs rounded-2xl shadow-sm shadow-sky-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Synthesizing Dialogue...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Generate Continuous Audio</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
