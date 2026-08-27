import React from 'react';
import {
  Sparkles,
  Plus,
  Volume2,
  Waves,
  Clock,
  Users,
  CheckCircle2,
  Play,
  ArrowRight,
} from 'lucide-react';
import type { Project, HistoryItem, Voice, AppMode, DialogueLine, Speaker } from '../types';

interface DashboardViewProps {
  voices: Voice[];
  projects: Project[];
  history: HistoryItem[];
  onOpenStudio: () => void;
  onOpenVoices: () => void;
  onSelectProject: (id: string) => void;
  onPlayHistoryAudio: (url: string, title: string) => void;
  onApplyTemplate: (template: {
    title: string;
    mode: AppMode;
    lines: DialogueLine[];
    speakers: Record<string, Speaker>;
    singleText?: string;
  }) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  voices,
  projects,
  history,
  onOpenStudio,
  onOpenVoices,
  onSelectProject,
  onPlayHistoryAudio,
  onApplyTemplate,
}) => {
  const templates = [
    {
      id: 'french_english_conversation',
      title: 'French-English Travel Conversation',
      category: 'Language Learning',
      categoryColor: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Bilingual dialogue between Sarah and James discussing travel plans to Paris.',
      speakersCount: '2 Speakers',
      mode: 'dialogue' as AppMode,
      speakers: {
        Sarah: {
          id: 'spk_sarah',
          name: 'Sarah',
          gender: 'Female' as const,
          language: 'French',
          accent: 'France',
          flag: '🇫🇷',
          voice_id: 'fr-FR-DeniseNeural',
          color: 'pink' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        James: {
          id: 'spk_james',
          name: 'James',
          gender: 'Male' as const,
          language: 'English',
          accent: 'British',
          flag: '🇬🇧',
          voice_id: 'en-GB-RyanNeural',
          color: 'blue' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      } as Record<string, Speaker>,
      lines: [
        { id: '1', speaker_name: 'Sarah', text: 'Bonjour, comment allez-vous?' },
        { id: '2', speaker_name: 'James', text: "I'm doing great. How about you?" },
        { id: '3', speaker_name: 'Sarah', text: 'Je vais bien, merci! Where are you going tomorrow?' },
        { id: '4', speaker_name: 'James', text: "I'm going to Paris. I'll be there for three days." },
        { id: '5', speaker_name: 'Sarah', text: "Oh, c'est magnifique! Have a great trip!" },
        { id: '6', speaker_name: 'James', text: 'Thank you! À bientôt!' },
      ],
    },
    {
      id: 'podcast_cohosts',
      title: 'Tech Studio Podcast Co-hosts',
      category: 'Podcast & Interview',
      categoryColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Dynamic banter between podcast co-hosts Alex and Maya covering AI voice tech.',
      speakersCount: '2 Speakers',
      mode: 'dialogue' as AppMode,
      speakers: {
        Alex: {
          id: 'spk_alex',
          name: 'Alex',
          gender: 'Male' as const,
          language: 'English',
          accent: 'American',
          flag: '🇺🇸',
          voice_id: 'en-US-GuyNeural',
          color: 'blue' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        Maya: {
          id: 'spk_maya',
          name: 'Maya',
          gender: 'Female' as const,
          language: 'English',
          accent: 'American',
          flag: '🇺🇸',
          voice_id: 'en-US-JennyNeural',
          color: 'purple' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      } as Record<string, Speaker>,
      lines: [
        { id: '1', speaker_name: 'Alex', text: 'Welcome back to Tech Studio! Today we are discussing multilingual neural voices.' },
        { id: '2', speaker_name: 'Maya', text: 'That is right, Alex. The ability to switch accents on the fly is revolutionary!' },
      ],
    },
    {
      id: 'express_train',
      title: 'The Express Train to Edinburgh',
      category: 'Drama & Story',
      categoryColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Atmospheric audiobook scene with a narrator and two passengers.',
      speakersCount: '3 Speakers',
      mode: 'dialogue' as AppMode,
      speakers: {
        Narrator: {
          id: 'spk_narrator',
          name: 'Narrator',
          gender: 'Male' as const,
          language: 'English',
          accent: 'British',
          flag: '🇬🇧',
          voice_id: 'en-GB-RyanNeural',
          color: 'purple' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        Clara: {
          id: 'spk_clara',
          name: 'Clara',
          gender: 'Female' as const,
          language: 'English',
          accent: 'British',
          flag: '🇬🇧',
          voice_id: 'en-GB-SoniaNeural',
          color: 'pink' as const,
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      } as Record<string, Speaker>,
      lines: [
        { id: '1', speaker_name: 'Narrator', text: 'The express train glided through the Scottish highlands as twilight fell.' },
        { id: '2', speaker_name: 'Clara', text: 'Look out the window. We should arrive in Edinburgh within the hour.' },
      ],
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
      {/* Hero Banner (Matching Image 2) */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Speaker Studio Active</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight">
            Bring any dialogue to life with Voxora
          </h1>

          <p className="text-sm text-slate-300 font-normal leading-relaxed">
            Write scripts with natural speaker tags, cast multilingual voice models, and generate seamless multi-turn conversations with realistic pauses.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenStudio}
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Dialogue</span>
            </button>

            <button
              onClick={onOpenVoices}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-white/15 transition-all"
            >
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Browse Voices</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 4 Metric Cards (Matching Image 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Dialogues Created
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {projects.length}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Across all workspaces</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Waves className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Audio Rendered
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {(projects.length * 0.4).toFixed(1)}m
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Total speech duration</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Available Voices
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {voices.length || 322}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Neural multilingual models</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Characters Saved
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              125k
            </div>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Monthly allocation</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Start Dialogue Templates (Matching Images 2 & 3) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Quick Start Dialogue Templates</h2>
          <button
            onClick={onOpenStudio}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${tpl.categoryColor}`}>
                  {tpl.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2.5 mb-1.5">{tpl.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{tpl.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-400">{tpl.speakersCount}</span>
                <button
                  onClick={() =>
                    onApplyTemplate({
                      title: tpl.title,
                      mode: tpl.mode,
                      lines: tpl.lines,
                      speakers: tpl.speakers,
                    })
                  }
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Grid: Recent Generated Tracks + Saved Projects (Matching Image 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Generated Tracks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Recent Generated Tracks</h3>
            <span className="text-xs font-bold text-sky-600">See All</span>
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent tracks yet. Generate dialogue in the studio to see them here.
              </div>
            ) : (
              history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onPlayHistoryAudio(item.audioUrl, item.title)}
                      className="w-8 h-8 rounded-full bg-slate-950 hover:bg-sky-600 text-white flex items-center justify-center transition-colors shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[200px]">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.duration} • {item.characters} chars
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                    MP3
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Projects */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Saved Projects</h3>
            <span className="text-xs font-bold text-sky-600">Manage</span>
          </div>

          <div className="space-y-2.5">
            {projects.slice(0, 4).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {proj.mode === 'dialogue'
                      ? `Multi-Speaker Dialogue • ${Object.keys(proj.speakers).length} Cast`
                      : `Single Voice • ${proj.singleText.length} Chars`}
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1 hover:underline">
                  Edit →
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
