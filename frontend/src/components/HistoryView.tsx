import React from 'react';
import { History, Download, Play, Trash2, Sparkles } from 'lucide-react';
import type { HistoryItem } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onPlayAudio: (url: string, title: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onPlayAudio,
  onClearHistory,
}) => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600" />
            <span>Generation History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review, play, and re-download previously generated audio tracks</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No generated audio yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Audio tracks will appear here once you generate speech in the studio.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onPlayAudio(item.audioUrl, item.title)}
                  className="w-10 h-10 rounded-full bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="capitalize">{item.mode} mode</span>
                    <span>•</span>
                    <span>{item.characters} characters</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>

              <a
                href={item.audioUrl}
                download={`${item.title.toLowerCase().replace(/\s+/g, '_')}.mp3`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download MP3</span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
