import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Moon,
  List,
  Sparkles,
  ChevronDown,
  Headphones,
  Sliders,
  BookOpen,
} from 'lucide-react';
import { useAudio } from '../../context/AudioContext';
import { SleepTimerModal } from './SleepTimerModal';

export const AudioModal: React.FC = () => {
  const {
    currentTrack,
    playlist,
    currentBook,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    isMuted,
    sleepTimerRemaining,
    isPlayerModalOpen,
    setIsPlayerModalOpen,
    togglePlay,
    seek,
    skip,
    nextTrack,
    prevTrack,
    setRate,
    toggleMute,
    setVolume,
    playTrack,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'player' | 'playlist'>('player');
  const [showSleepModal, setShowSleepModal] = useState(false);

  if (!isPlayerModalOpen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const speedRates = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
        <div className="relative flex flex-col h-full max-h-[700px] w-full max-w-lg rounded-3xl bg-slate-950 text-white shadow-2xl border border-slate-800/80 overflow-hidden">
          {/* Dynamic Ambient Background Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          {/* Header Navigation */}
          <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/50 backdrop-blur-md">
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-white/5">
              <button
                onClick={() => setActiveTab('player')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'player'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>Trình phát</span>
              </button>

              <button
                onClick={() => setActiveTab('playlist')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  activeTab === 'playlist'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Danh sách ({playlist.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsPlayerModalOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Thu nhỏ trình phát"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            {activeTab === 'player' ? (
              <>
                {/* Artwork & Title Showcase */}
                <div className="flex flex-col items-center text-center my-auto pt-2">
                  {/* Glowing Artwork Container */}
                  <div className="relative group mb-5">
                    {/* Breathing glow when playing */}
                    {isPlaying && (
                      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-30 blur-xl animate-pulse" />
                    )}

                    <div className="relative aspect-square w-48 sm:w-56 overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-white/15 transition-all">
                      {currentTrack.coverUrl ? (
                        <img
                          src={currentTrack.coverUrl}
                          alt={currentTrack.bookTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-teal-600 via-emerald-700 to-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                          <BookOpen className="h-10 w-10 mb-2 text-white/80" />
                          <span className="font-bold text-sm">{currentTrack.bookTitle}</span>
                        </div>
                      )}

                      {/* Playing state badge */}
                      {isPlaying && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-950 shadow-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping" />
                          Đang phát
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Soundwave animation bar */}
                  <div className="flex items-end justify-center gap-1 h-5 mb-3">
                    {[40, 70, 90, 60, 100, 75, 45, 85, 60, 90, 50].map((height, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${
                          isPlaying
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-300 animate-pulse'
                            : 'bg-slate-700 h-1.5'
                        }`}
                        style={{
                          height: isPlaying ? `${Math.max(6, (height * 20) / 100)}px` : '4px',
                          animationDelay: `${(i % 5) * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Track info typography */}
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-0.5 text-xs font-bold mb-2">
                    {currentTrack.prefix}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white line-clamp-2 px-4">
                    {currentTrack.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {currentTrack.bookTitle}
                  </p>
                </div>

                {/* Progress Scrubber Bar */}
                <div className="w-full mt-4">
                  <div className="relative group">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => seek(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1.5">
                    <span className="text-emerald-400 font-semibold">{formatTime(currentTime)}</span>
                    <span className="text-slate-500">-{formatTime(Math.max(0, duration - currentTime))}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Playback Controls */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 my-4 sm:my-5">
                  {/* Prev track */}
                  <button
                    onClick={prevTrack}
                    className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
                    title="Bài trước"
                  >
                    <SkipBack className="h-5 w-5" />
                  </button>

                  {/* Skip 10s backward */}
                  <button
                    onClick={() => skip(-10)}
                    className="flex flex-col items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    title="Lùi 10 giây"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-[9px] mt-0.5 font-bold">10s</span>
                  </button>

                  {/* Big Play / Pause Button with radiant glow */}
                  <button
                    onClick={togglePlay}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 text-slate-950 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/20"
                    title={isPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isPlaying ? (
                      <Pause className="h-7 w-7 fill-slate-950" />
                    ) : (
                      <Play className="h-7 w-7 fill-slate-950 ml-1" />
                    )}
                  </button>

                  {/* Skip 10s forward */}
                  <button
                    onClick={() => skip(10)}
                    className="flex flex-col items-center justify-center h-12 w-12 rounded-2xl bg-slate-900 border border-white/10 text-slate-200 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                    title="Tua 10 giây"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span className="text-[9px] mt-0.5 font-bold">10s</span>
                  </button>

                  {/* Next track */}
                  <button
                    onClick={nextTrack}
                    className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-90"
                    title="Bài tiếp theo"
                  >
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>

                {/* Bottom Bar: Volume + Speed + Sleep Timer */}
                <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
                  {/* Volume Slider Row */}
                  <div className="flex items-center gap-3 px-2">
                    <button
                      onClick={toggleMute}
                      className="text-slate-400 hover:text-white transition-colors"
                      title={isMuted ? 'Bật âm' : 'Tắt âm'}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4 text-rose-400" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  {/* Speed & Sleep Timer Row */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Speed Selector */}
                    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
                      {speedRates.map((r) => (
                        <button
                          key={r}
                          onClick={() => setRate(r)}
                          className={`rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                            playbackRate === r
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}x
                        </button>
                      ))}
                    </div>

                    {/* Sleep Timer */}
                    <button
                      onClick={() => setShowSleepModal(true)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                        sleepTimerRemaining !== null
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/25'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>
                        {sleepTimerRemaining !== null
                          ? `${Math.ceil(sleepTimerRemaining / 60)} phút`
                          : 'Hẹn giờ'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Playlist View */
              <div className="flex-1 flex flex-col space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="font-bold text-sm text-slate-200">
                    Danh Sách {playlist.length} Bài Audio
                  </h4>
                  <span className="text-xs text-emerald-400 font-medium">
                    {currentTrack.bookTitle}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[440px]">
                  {playlist.map((track, idx) => {
                    const isCurrent = currentTrack.index === idx;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          if (currentBook) {
                            playTrack(currentBook, idx);
                            setActiveTab('player');
                          }
                        }}
                        className={`group flex w-full items-center justify-between rounded-2xl p-3 text-left transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold shadow-md shadow-emerald-600/25'
                            : 'text-slate-300 hover:bg-slate-900 border border-transparent hover:border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isCurrent ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold block opacity-75">
                              {track.prefix}
                            </span>
                            <span className="text-xs font-medium truncate block">{track.title}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-2">
                          {isCurrent && isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3.5">
                              <div className="w-1 bg-white rounded-full animate-bounce h-3.5" />
                              <div className="w-1 bg-white rounded-full animate-bounce [animation-delay:-0.2s] h-2.5" />
                              <div className="w-1 bg-white rounded-full animate-bounce h-3.5" />
                            </div>
                          ) : (
                            <Play className={`h-4 w-4 ${isCurrent ? 'text-white' : 'text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SleepTimerModal isOpen={showSleepModal} onClose={() => setShowSleepModal(false)} />
    </>
  );
};
