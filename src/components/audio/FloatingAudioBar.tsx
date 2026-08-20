import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Moon,
  ChevronUp,
  Maximize2,
  X,
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

interface FloatingAudioBarProps {
  isSidebarCollapsed?: boolean;
}

export const FloatingAudioBar: React.FC<FloatingAudioBarProps> = ({ isSidebarCollapsed = false }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    sleepTimerRemaining,
    togglePlay,
    seek,
    skip,
    nextTrack,
    prevTrack,
    setRate,
    toggleMute,
    isMuted,
    setIsPlayerModalOpen,
    closeAudio,
    isAudioBarVisible,
  } = useAudio();

  if (!currentTrack || !isAudioBarVisible) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      className={`fixed bottom-14 md:bottom-3 left-0 right-0 z-40 px-2 sm:px-4 pointer-events-none transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-80'
      }`}
    >
      <div className="mx-auto max-w-5xl rounded-2xl md:rounded-3xl bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-xl text-white border border-slate-700/60 dark:border-slate-800 shadow-2xl shadow-black/40 overflow-hidden pointer-events-auto transition-all">
        {/* Interactive Smooth Scrubber on top */}
        <div
          className="h-1.5 w-full bg-slate-800/80 hover:h-2.5 cursor-pointer relative group transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
            seek(newRatio * duration);
          }}
          title="Tua đến vị trí"
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-r-full relative transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex h-16 items-center justify-between px-3 sm:px-5 gap-2">
          {/* Left: Track Info + Cover + Equalizer */}
          <div
            onClick={() => setIsPlayerModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer group min-w-0 max-w-[45%] sm:max-w-[32%]"
            title="Mở trình phát đầy đủ"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-md border border-white/10 group-hover:scale-105 transition-transform">
              {currentTrack.coverUrl ? (
                <img src={currentTrack.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-[10px] font-bold text-white">
                  SIY
                </div>
              )}
              {/* Mini animated audio visualizer when playing */}
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center gap-0.5">
                  <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce h-3.5" />
                  <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s] h-2.5" />
                  <div className="w-0.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.4s] h-4" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {currentTrack.prefix}
                </span>
                <h5 className="font-semibold text-xs text-white truncate group-hover:text-emerald-400 transition-colors">
                  {currentTrack.title}
                </h5>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {currentTrack.bookTitle}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Prev Track */}
            <button
              onClick={prevTrack}
              className="p-1.5 text-slate-400 hover:text-white transition-colors hidden md:block rounded-lg hover:bg-white/5"
              title="Bài trước"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {/* Skip 10s backward */}
            <button
              onClick={() => skip(-10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Lùi 10s"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Play/Pause Button with ambient glow */}
            <button
              onClick={togglePlay}
              className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all ${
                isPlaying ? 'ring-2 ring-emerald-400/40 ring-offset-2 ring-offset-slate-950' : ''
              }`}
              title={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-slate-950" />
              ) : (
                <Play className="h-5 w-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            {/* Skip 10s forward */}
            <button
              onClick={() => skip(10)}
              className="p-1.5 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Tua 10s"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Next Track */}
            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-400 hover:text-white transition-colors hidden md:block rounded-lg hover:bg-white/5"
              title="Bài kế tiếp"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Time Stamp */}
            <span className="text-[11px] font-mono text-slate-400 hidden lg:inline ml-1">
              {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(duration)}
            </span>
          </div>

          {/* Right: Tools & Expand */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sleep Timer Indicator */}
            {sleepTimerRemaining !== null && (
              <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                <Moon className="h-3 w-3" />
                {Math.ceil(sleepTimerRemaining / 60)}m
              </span>
            )}

            {/* Playback Rate Button */}
            <button
              onClick={() => setRate(playbackRate >= 2 ? 0.75 : playbackRate + 0.25)}
              className="rounded-lg bg-white/10 hover:bg-white/15 px-2 py-1 text-[10px] font-bold text-slate-200 hover:text-white transition-colors"
              title="Đổi tốc độ phát"
            >
              {playbackRate}x
            </button>

            {/* Volume Toggle */}
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-white transition-colors hidden sm:block rounded-lg hover:bg-white/5"
              title={isMuted ? 'Bật âm' : 'Tắt âm'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {/* Open Fullscreen Player Modal */}
            <button
              onClick={() => setIsPlayerModalOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-2.5 py-1.5 text-xs text-emerald-300 transition-colors shadow-xs"
              title="Mở trình phát đầy đủ"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="hidden sm:inline text-[11px] font-semibold">Mở rộng</span>
            </button>

            {/* Dismiss Audio Bar */}
            <button
              onClick={closeAudio}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-xl transition-colors"
              title="Đóng thanh audio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
