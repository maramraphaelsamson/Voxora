import React from 'react';
import { HelpCircle, Mic, Users } from 'lucide-react';
import type { AppMode } from '../types';

interface TabSwitcherProps {
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenHowItWorks: () => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  mode,
  onSelectMode,
  onOpenHowItWorks,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-3 bg-white">
      {/* Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => onSelectMode('single')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            mode === 'single'
              ? 'bg-slate-950 text-sky-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Single Voice</span>
        </button>

        <button
          onClick={() => onSelectMode('dialogue')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            mode === 'dialogue'
              ? 'bg-slate-950 text-sky-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Multi-Speaker Dialogue</span>
        </button>
      </div>

      {/* How it works link */}
      <button
        onClick={onOpenHowItWorks}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-600 font-bold transition-colors"
      >
        <span>How it works</span>
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
