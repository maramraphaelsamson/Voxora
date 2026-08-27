import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
} from 'lucide-react';
import { uploadDocumentFile, parseScriptText } from '../services/api';
import type { DialogueLine } from '../types';

interface DocumentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLines: (lines: DialogueLine[], extractedSpeakers: string[]) => void;
}

export const DocumentImportModal: React.FC<DocumentImportModalProps> = ({
  isOpen,
  onClose,
  onImportLines,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    lines: Array<{ index: number; speaker_name: string; text: string }>;
    speakers: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await uploadDocumentFile(file);
      setRawText(res.raw_text);
      setParsedPreview(res.parsed);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse uploaded document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleParseRawText = async () => {
    if (!rawText.trim()) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await parseScriptText(rawText);
      setParsedPreview({ lines: res.lines, speakers: res.speakers });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse script text');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || parsedPreview.lines.length === 0) return;
    const formatted: DialogueLine[] = parsedPreview.lines.map((l, i) => ({
      id: `imported_line_${Date.now()}_${i}`,
      speaker_name: l.speaker_name,
      text: l.text,
    }));
    onImportLines(formatted, parsedPreview.speakers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Import Script / Document</h2>
              <p className="text-xs text-slate-400">Upload PDF, DOCX, TXT or paste script</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx,.md"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <Upload className="w-8 h-8 text-indigo-500 mb-2" />
            <p className="text-xs font-bold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports PDF, Word (.docx), Plain Text (.txt, .md)</p>
          </div>

          {/* Paste Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Or Paste Script Text</label>
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Sarah: Bonjour, comment allez-vous?&#10;James: I'm doing great. How about you?"
              className="w-full bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-300 font-mono"
            />
            <button
              onClick={handleParseRawText}
              disabled={isUploading || !rawText.trim()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Parse Text
            </button>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Parse Result Preview */}
          {parsedPreview && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Detected {parsedPreview.lines.length} lines</span>
                <span className="text-indigo-600">
                  {parsedPreview.speakers.length} Speaker(s): {parsedPreview.speakers.join(', ')}
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {parsedPreview.lines.slice(0, 8).map((l, i) => (
                  <div key={i} className="text-xs text-slate-600 truncate flex items-center gap-2">
                    <span className="font-bold text-indigo-600">{l.speaker_name}:</span>
                    <span className="truncate">{l.text}</span>
                  </div>
                ))}
                {parsedPreview.lines.length > 8 && (
                  <p className="text-[11px] text-slate-400 italic">
                    + {parsedPreview.lines.length - 8} more lines...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parsedPreview || parsedPreview.lines.length === 0}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-all disabled:opacity-50"
          >
            Import to Script
          </button>
        </div>
      </div>
    </div>
  );
};
