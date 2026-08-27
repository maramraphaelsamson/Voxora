import React from 'react';
import { FolderOpen, Plus, Clock, Trash2, ArrowRight } from 'lucide-react';
import type { Project } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Projects</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and resume your voice generation projects</p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          const speakerCount = Object.keys(p.speakers).length;
          const lineCount = p.lines.length;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-indigo-50/50 border-indigo-400 ring-2 ring-indigo-200'
                  : 'bg-white hover:bg-slate-50/90 border-slate-100 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {p.mode === 'dialogue' ? 'Dialogue' : 'Single Voice'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-2 mb-4">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{p.mode === 'dialogue' ? `${lineCount} lines (${speakerCount} speakers)` : `${p.singleText.length} chars`}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(p.id);
                  }}
                  title="Delete project"
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
