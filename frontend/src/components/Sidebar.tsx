import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Volume2,
  LayoutTemplate,
  History,
  Star,
  Settings,
  Plus,
  Crown,
  Waves,
  Sparkles,
} from 'lucide-react';
import type { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewProject: () => void;
  characterCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onNewProject,
  characterCount,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'Studio', icon: Waves },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'voices', label: 'Voices', icon: Volume2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'history', label: 'History', icon: History },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const totalMonthlyLimit = 500000;
  const progressPercent = Math.min(100, Math.round((characterCount / totalMonthlyLimit) * 100));

  return (
    <aside className="w-64 bg-white border-r border-sky-100 flex flex-col h-screen shrink-0 sticky top-0 select-none">
      {/* ── TOP: Brand + New Project (fixed, never scrolls) ── */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer mb-5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:bg-sky-600 transition-colors">
            <Waves className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-1.5">
              Voxora
              <span className="text-[10px] px-1.5 rounded-md font-bold bg-sky-100 text-sky-700 border border-sky-200">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold">AI Voice Studio</div>
          </div>
        </div>

        {/* New Project Button — sky blue */}
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-sky-200 transition-all text-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* ── MIDDLE: Scrollable Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 min-h-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-sky-50 text-sky-700 border border-sky-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── BOTTOM: Promo + Usage (fixed, never scrolls) ── */}
      <div className="px-4 py-4 border-t border-sky-50 bg-sky-50/30 space-y-4 shrink-0">
        {/* Unlock Premium Card */}
        <div className="p-3.5 rounded-2xl bg-white border border-sky-100 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-500 mb-1.5">
            <Crown className="w-4 h-4 fill-amber-400 stroke-amber-500" />
            <span className="text-xs font-extrabold text-slate-900">Unlock Premium</span>
          </div>
          <ul className="text-[11px] text-slate-500 space-y-0.5 mb-3 font-medium">
            <li>• Unlimited characters</li>
            <li>• 300+ neural voices & accents</li>
            <li>• Commercial license</li>
          </ul>
          <button className="w-full text-xs font-bold py-2 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-sky-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade Now</span>
          </button>
        </div>

        {/* Character usage meter */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Monthly Characters</span>
            <span className="text-sky-600">{Math.round(progressPercent)}%</span>
          </div>
          <div className="text-xs font-extrabold text-slate-800 mb-1.5">
            {characterCount.toLocaleString()}{' '}
            <span className="text-slate-400 font-normal">/ {totalMonthlyLimit.toLocaleString()}</span>
          </div>
          <div className="w-full h-1.5 bg-sky-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
