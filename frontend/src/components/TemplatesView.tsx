import React from 'react';
import { LayoutTemplate, MessageSquare, BookOpen, Mic2, ArrowRight } from 'lucide-react';
import type { AppMode, DialogueLine, Speaker } from '../types';

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  mode: AppMode;
  speakers: Record<string, Speaker>;
  lines: DialogueLine[];
  singleText?: string;
}

interface TemplatesViewProps {
  onApplyTemplate: (template: {
    title: string;
    mode: AppMode;
    lines: DialogueLine[];
    speakers: Record<string, Speaker>;
    singleText?: string;
  }) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({ onApplyTemplate }) => {
  const templates: TemplateItem[] = [
    {
      id: 'french_english_conversation',
      title: 'French & UK English Language Exchange',
      category: 'Dialogue & Language Learning',
      icon: MessageSquare,
      color: 'bg-rose-50 text-rose-600',
      description: 'Natural bilingual conversation between Sarah (French native) and James (British native).',
      mode: 'dialogue',
      speakers: {
        Sarah: {
          id: 'spk_sarah',
          name: 'Sarah',
          gender: 'Female',
          language: 'French',
          accent: 'France',
          flag: '🇫🇷',
          voice_id: 'fr-FR-DeniseNeural',
          color: 'pink',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        James: {
          id: 'spk_james',
          name: 'James',
          gender: 'Male',
          language: 'English',
          accent: 'British',
          flag: '🇬🇧',
          voice_id: 'en-GB-RyanNeural',
          color: 'blue',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      },
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
      id: 'audiobook_narration',
      title: 'Cinematic Audiobook Chapter',
      category: 'Single Voice Narration',
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-600',
      description: 'Rich narrative prose tailored for storytelling with deliberate cadence and depth.',
      mode: 'single',
      singleText:
        'The train arrived at 8:30 in the morning on a crisp autumn day. As the steam cleared from the platform, a solitary traveler stepped onto the cobblestones, holding a worn leather journal that held the secrets of an untold era.',
      speakers: {},
      lines: [],
    },
    {
      id: 'tech_podcast_interview',
      title: 'Tech Podcast Host & Guest Interview',
      category: 'Dialogue & Media',
      icon: Mic2,
      color: 'bg-sky-50 text-sky-600',
      description: 'Dynamic studio interview with US Host (Jenny) and Nigerian Founder (Abeo).',
      mode: 'dialogue',
      speakers: {
        Host: {
          id: 'spk_host',
          name: 'Host',
          gender: 'Female',
          language: 'English',
          accent: 'American',
          flag: '🇺🇸',
          voice_id: 'en-US-JennyNeural',
          color: 'purple',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
        Abeo: {
          id: 'spk_abeo',
          name: 'Abeo',
          gender: 'Male',
          language: 'English',
          accent: 'Nigerian',
          flag: '🇳🇬',
          voice_id: 'en-NG-AbeoNeural',
          color: 'emerald',
          rate: 1.0,
          pitch: 0.0,
          volume: 1.0,
        },
      },
      lines: [
        { id: '1', speaker_name: 'Host', text: 'Welcome back to VoiceTech Daily! Today we are joined by Abeo from Lagos.' },
        { id: '2', speaker_name: 'Abeo', text: 'Thanks for having me! It is an absolute pleasure to be here.' },
        { id: '3', speaker_name: 'Host', text: 'Can you tell our listeners how multi-accent TTS is transforming global communication?' },
        { id: '4', speaker_name: 'Abeo', text: 'It connects authentic cultural voices directly into digital media without friction.' },
      ],
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-indigo-600" />
          <span>Project Templates</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Pre-configured scripts, voices, and dialogue casting setups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-2xl ${tpl.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                  {tpl.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">{tpl.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{tpl.description}</p>
              </div>

              <button
                onClick={() =>
                  onApplyTemplate({
                    title: tpl.title,
                    mode: tpl.mode,
                    lines: tpl.lines,
                    speakers: tpl.speakers,
                    singleText: tpl.singleText,
                  })
                }
                className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-semibold text-xs rounded-xl border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
