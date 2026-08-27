import React from 'react';
import { Settings, Cpu, Sparkles } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Studio Settings</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Configure audio generation engine and preferences</p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
        {/* TTS Provider Section */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Active TTS Engine Layer</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Decoupled backend architecture enables pluggable neural voice providers
          </p>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">EdgeTTS Neural Adapter</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Active & Connected
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Free tier • 300+ multilingual & regional neural models • Zero API key needed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Future Pluggable Providers */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Optional Future Adapters (Pluggable)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">ElevenLabs Adapter</h4>
                <p className="text-[11px] text-slate-400">Voice cloning & emotional nuance</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                Ready in BaseTTS
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">OpenAI TTS Adapter</h4>
                <p className="text-[11px] text-slate-400">Alloy, Echo, Shimmer voices</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                Ready in BaseTTS
              </span>
            </div>
          </div>
        </div>

        {/* Audio Output Preferences */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-700">Audio Export Preferences</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input type="radio" name="exportFmt" defaultChecked className="accent-indigo-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">MP3 High-Quality (192 kbps)</div>
                <div className="text-[11px] text-slate-400">Standard web & mobile audio format with small file sizes</div>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input type="radio" name="exportFmt" className="accent-indigo-600" />
              <div>
                <div className="text-xs font-bold text-slate-800">WAV Uncompressed Lossless (24,000 Hz)</div>
                <div className="text-[11px] text-slate-400">Studio production quality without compression</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
