import React, { useState } from 'react';
import {
  Pencil,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  ChevronDown,
  Download,
  FileAudio,
  Menu,
} from 'lucide-react';
import type { NavTab } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  projectTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  onExport: (format: 'mp3' | 'wav') => void;
  onToggleMobileMenu: () => void;
  isGenerating?: boolean;
}

const TAB_TITLES: Record<NavTab, string> = {
  dashboard: 'Dashboard',
  studio: 'Studio Editor',
  projects: 'Projects',
  voices: 'Voice Library',
  templates: 'Templates',
  history: 'Generation History',
  favorites: 'Favorite Voices',
  settings: 'Settings',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  projectTitle,
  onUpdateTitle,
  onExport,
  onToggleMobileMenu,
  isGenerating = false,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(projectTitle);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    } else {
      setTempTitle(projectTitle);
    }
    setIsEditingTitle(false);
  };

  const isStudioTab = currentTab === 'studio';

  return (
    <header className="h-16 bg-white border-b border-sky-100 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile hamburger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isStudioTab ? (
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="text-base font-bold text-slate-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            ) : (
              <div
                onClick={() => {
                  setTempTitle(projectTitle);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-sky-50 transition-colors"
              >
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {projectTitle}
                </h1>
                <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
            {TAB_TITLES[currentTab] || 'Voxora'}
          </h1>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {isStudioTab && (
          <>
            {/* Undo / Redo */}
            <div className="hidden sm:flex items-center gap-1 border-r border-slate-200 pr-3 mr-1">
              <button
                title="Undo"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                title="Redo"
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Saved Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Saved</span>
            </div>

            {/* Export Dropdown Button — sky blue */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm shadow-sky-200 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-sky-100 rounded-2xl shadow-xl p-1.5 z-50">
                  <button
                    onClick={() => { onExport('mp3'); setShowExportMenu(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-sky-500" />
                      <span>MP3 Audio</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-200">.mp3</span>
                  </button>
                  <button
                    onClick={() => { onExport('wav'); setShowExportMenu(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <FileAudio className="w-4 h-4 text-blue-500" />
                      <span>WAV Lossless</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200">.wav</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-extrabold cursor-pointer shadow-sm shadow-sky-200">
          R
        </div>
      </div>
    </header>
  );
};
