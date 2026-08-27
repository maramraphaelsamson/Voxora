import React from 'react';
import { X, Mic, Users, Globe, Sparkles, Sliders } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">How Voxora Works</h2>
              <p className="text-xs text-slate-400">Mastering single voice, dialogue casting & accents</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-600 leading-relaxed">
          {/* Section 1: Single Voice */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
              <Mic className="w-4 h-4" />
              <span>1. Single-Person Mode</span>
            </div>
            <p>
              Paste or type narration text. Choose a voice model, adjust speed (tempo) and pitch, and click <strong>Generate Speech</strong> to produce clean, continuous audio.
            </p>
          </div>

          {/* Section 2: Dialogue Mode */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
              <Users className="w-4 h-4" />
              <span>2. Multi-Speaker Dialogue Mode</span>
            </div>
            <p>
              Write dialogue using speaker tags like <code>Sarah: ...</code> or <code>James: ...</code>. Voxora automatically detects each character and lets you assign unique voice profiles, nationalities, and accents per speaker.
            </p>
          </div>

          {/* Section 3: Accent Switching */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>3. Accents & Cross-Language Voice Casting</span>
            </div>
            <p>
              You can mix native French (e.g. 🇫🇷 Céline) with British English (🇬🇧 Ryan) in one continuous conversation. Or assign a <strong>Multilingual Neural Voice</strong> to read English text with an authentic French/Spanish accent.
            </p>
          </div>

          {/* Section 4: Natural Pauses */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Sliders className="w-4 h-4" />
              <span>4. Natural Inter-Speaker Pauses</span>
            </div>
            <p>
              Use the <strong>Speaker Pause Gap</strong> slider in Global Settings to control conversational rhythm (from fast back-and-forth 200ms to dramatic 1000ms pauses).
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Got it, let's create!
          </button>
        </div>
      </div>
    </div>
  );
};
