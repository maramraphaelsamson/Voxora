import React from 'react';
import {
  X,
  Plus,
  FolderOpen,
  Volume2,
  LayoutTemplate,
  History,
  Settings,
  Waves,
} from 'lucide-react';
import type { NavTab } from '../types';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewProject: () => void;
  characterCount: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onNewProject,
  characterCount,
}) => {
  if (!isOpen) return null;

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'studio', label: 'Studio Editor', icon: Waves },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'voices', label: 'Voice Library', icon: Volume2 },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      />

      {/* Drawer panel */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Waves className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">Voxora</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Project */}
          <button
            onClick={() => {
              onNewProject();
              onClose();
            }}
            className="w-full mb-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs shadow-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer usage */}
        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center justify-between mb-1 font-medium">
            <span>Monthly Usage</span>
            <span className="font-bold text-slate-800">{characterCount.toLocaleString()} / 500k</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${Math.min(100, (characterCount / 500000) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
