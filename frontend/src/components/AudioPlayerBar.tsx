import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Pencil,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';

interface AudioPlayerBarProps {
  audioUrl: string | null;
  trackTitle: string;
  onUpdateTrackTitle: (title: string) => void;
  onDownload: () => void;
  isGenerating?: boolean;
}

const TOTAL_BARS = 64;

// Base static profile when audio is idle
const BASE_PROFILE = [
  25, 35, 50, 65, 40, 80, 90, 45, 95, 60, 35, 75, 85, 55, 70, 90,
  35, 65, 45, 80, 95, 35, 85, 55, 70, 45, 95, 75, 60, 85, 40, 65,
  30, 40, 55, 70, 45, 85, 95, 50, 90, 65, 40, 75, 80, 50, 65, 90,
  35, 60, 40, 75, 90, 30, 85, 50, 65, 40, 95, 70, 55, 80, 35, 50,
];

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioUrl,
  trackTitle,
  onUpdateTrackTitle,
  onDownload,
  isGenerating = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barsContainerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(trackTitle);

  // 1. Decode exact duration from audio buffer immediately when audioUrl arrives
  useEffect(() => {
    let isCancelled = false;

    if (audioUrl) {
      fetch(audioUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            return ctx.decodeAudioData(buffer).then((decoded) => {
              if (!isCancelled && decoded.duration && isFinite(decoded.duration) && decoded.duration > 0) {
                setDuration(decoded.duration);
              }
              ctx.close().catch(() => {});
            });
          }
        })
        .catch((err) => {
          console.warn('Audio duration decode fallback:', err);
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [audioUrl]);

  // 2. Sync audio element src when audioUrl changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.src = audioUrl;
      audio.playbackRate = playbackRate;
      audio.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // 3. High-performance direct DOM Waveform visualizer loop (Zero React State Thrashing)
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      // Reset waveform bars to base profile
      if (barsContainerRef.current) {
        const barElements = barsContainerRef.current.children;
        for (let i = 0; i < barElements.length; i++) {
          const el = barElements[i] as HTMLElement;
          if (el) {
            el.style.height = `${BASE_PROFILE[i % BASE_PROFILE.length]}%`;
            el.style.transform = 'none';
          }
        }
      }
      return;
    }

    const renderWaveform = () => {
      const audio = audioRef.current;
      const container = barsContainerRef.current;

      if (audio && !audio.paused && container) {
        const t = performance.now() * 0.008;
        const cur = audio.currentTime || 0;
        const dur = audio.duration && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
        const progress = dur > 0 ? Math.min(1, cur / dur) : 0;
        const playheadIdx = Math.floor(progress * TOTAL_BARS);

        const barElements = container.children;
        for (let i = 0; i < barElements.length; i++) {
          const el = barElements[i] as HTMLElement;
          if (!el) continue;

          const base = BASE_PROFILE[i % BASE_PROFILE.length];
          const wave1 = Math.sin(t * 1.8 + i * 0.35);
          const wave2 = Math.cos(t * 2.6 - i * 0.2);
          const wave3 = Math.sin(t * 4.2 + i * 0.5);

          const dist = Math.abs(i - playheadIdx);
          const playheadBoost = dist < 4 ? (4 - dist) * 14 : 0;
          const energy = wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2;
          const dynamicHeight = Math.min(100, Math.max(15, Math.round(base * 0.4 + base * 0.6 * (0.65 + 0.35 * energy) + playheadBoost)));

          el.style.height = `${dynamicHeight}%`;

          // Apply color based on playback position
          const isPassed = (i + 0.5) / TOTAL_BARS <= progress;
          if (isPassed) {
            el.className = 'flex-1 rounded-full bg-sky-500 shadow-xs shadow-sky-300 pointer-events-none';
          } else {
            el.className = 'flex-1 rounded-full bg-slate-300 pointer-events-none';
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderWaveform);
    };

    animFrameRef.current = requestAnimationFrame(renderWaveform);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying, duration]);

  // Audio Control Handlers
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Audio playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const effectiveDuration = duration > 0 ? duration : (audio?.duration && isFinite(audio.duration) ? audio.duration : 0);
    if (!audio || effectiveDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickFraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = clickFraction * effectiveDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipSeconds = (secs: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const effectiveDuration = duration > 0 ? duration : (audio.duration && isFinite(audio.duration) ? audio.duration : 60);
    const nextTime = Math.max(0, Math.min(effectiveDuration, (audio.currentTime || 0) + secs));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs <= 0 || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeDuration = duration > 0 ? duration : (audioRef.current?.duration && isFinite(audioRef.current.duration) ? audioRef.current.duration : 0);
  const progressFraction = activeDuration > 0 ? Math.max(0, Math.min(1, currentTime / activeDuration)) : 0;

  // Only render when audio exists or is being generated
  if (!audioUrl && !isGenerating) return null;

  return (
    <>
      {/* Declarative HTML5 Audio Element with Native Event Listeners */}
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          setCurrentTime(audio.currentTime || 0);
          if (audio.duration && isFinite(audio.duration) && audio.duration > 0 && duration === 0) {
            setDuration(audio.duration);
          }
        }}
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration);
          }
        }}
        onDurationChange={(e) => {
          const audio = e.currentTarget;
          if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration);
          }
        }}
      />

      {/* ── WHITE player bar with sky-blue play button & black small controls ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom duration-300 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">

          {/* Left: Sky-blue Play button + Track title */}
          <div className="flex items-center gap-4 min-w-[200px]">
            {/* ── BIG SKY-BLUE PLAY BUTTON ── */}
            <button
              onClick={togglePlay}
              disabled={!audioUrl || isGenerating}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 transition-all active:scale-95 shrink-0 disabled:opacity-60 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play audio'}
            >
              {isGenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Track title */}
            <div className="min-w-0">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={() => {
                    if (tempTitle.trim()) onUpdateTrackTitle(tempTitle.trim());
                    setIsEditingTitle(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (tempTitle.trim()) onUpdateTrackTitle(tempTitle.trim());
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="text-xs font-bold text-slate-900 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-300 focus:outline-none w-44"
                />
              ) : (
                <div
                  onClick={() => { setTempTitle(trackTitle); setIsEditingTitle(true); }}
                  className="flex items-center gap-1.5 cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors truncate max-w-[160px]">
                    {trackTitle || 'Generated Audio Track'}
                  </h4>
                  <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-sky-500 animate-pulse' : 'bg-slate-300'}`} />
                <p className="text-[10px] text-slate-400 font-semibold">
                  {isGenerating ? 'Synthesizing audio…' : isPlaying ? 'Playing speech…' : 'Ready to play & export'}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Live Waveform Scrubber */}
          <div className="flex-1 max-w-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>

            <div
              onClick={handleSeek}
              className="flex-1 h-10 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl px-2.5 flex items-center gap-[2px] cursor-pointer overflow-hidden group border border-slate-200 relative"
              title="Click or drag anywhere to scrub"
            >
              {/* Direct DOM Bars Container */}
              <div ref={barsContainerRef} className="w-full h-full flex items-center gap-[2px]">
                {BASE_PROFILE.map((height, i) => {
                  const barFraction = (i + 0.5) / TOTAL_BARS;
                  const isPassed = barFraction <= progressFraction;

                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full pointer-events-none ${
                        isPassed
                          ? 'bg-sky-500 shadow-xs shadow-sky-300'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>

            <span className="text-xs font-bold text-slate-500 w-10 tabular-nums">
              {formatTime(activeDuration)}
            </span>
          </div>

          {/* Right: Black small control buttons */}
          <div className="flex items-center gap-1.5">
            {/* Skip back — black */}
            <button
              onClick={() => skipSeconds(-10)}
              disabled={!audioUrl}
              title="Back 10s"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Skip forward — black */}
            <button
              onClick={() => skipSeconds(10)}
              disabled={!audioUrl}
              title="Forward 10s"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Speed selector — black */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="h-8 px-2.5 flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <span>{playbackRate}x</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-24 bg-white border border-slate-200 rounded-2xl shadow-xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {[0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-xl font-bold transition-colors cursor-pointer ${
                        playbackRate === rate
                          ? 'bg-sky-50 text-sky-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download — black */}
            <button
              onClick={onDownload}
              disabled={!audioUrl}
              title="Download audio"
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-700 text-white transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
