import React, { useState } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Settings2,
  HelpCircle,
  Info,
} from 'lucide-react';
import { TTSVoiceOption } from '../../hooks/useTextToSpeech';

interface TTSPlayerBarProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentParagraphIndex: number;
  totalParagraphs: number;
  voices: TTSVoiceOption[];
  selectedVoice: SpeechSynthesisVoice | null;
  hasVietnameseVoice?: boolean;
  playbackRate: number;
  autoScroll: boolean;
  isSupported: boolean;
  onPlay: (startIndex?: number) => void;
  onPause: () => void;
  onResume: () => void;
  onTogglePlay: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onJumpTo: (index: number) => void;
  onChangeRate: (rate: number) => void;
  onChangeVoice: (voice: SpeechSynthesisVoice | null) => void;
  onToggleAutoScroll: () => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const TTSPlayerBar: React.FC<TTSPlayerBarProps> = ({
  isPlaying,
  isPaused,
  currentParagraphIndex,
  totalParagraphs,
  voices,
  selectedVoice,
  hasVietnameseVoice = false,
  playbackRate,
  autoScroll,
  isSupported,
  onPlay,
  onPause,
  onResume,
  onTogglePlay,
  onStop,
  onNext,
  onPrev,
  onJumpTo,
  onChangeRate,
  onChangeVoice,
  onToggleAutoScroll,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isSupported) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md rounded-2xl border border-rose-200 bg-rose-50/95 p-4 shadow-xl backdrop-blur-md dark:border-rose-800 dark:bg-rose-950/90 text-center">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Trình duyệt chưa hỗ trợ Web Speech API.</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-200/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const currentIdx = Math.max(0, currentParagraphIndex);
  const progressPercent = totalParagraphs > 0 ? Math.round(((currentIdx + 1) / totalParagraphs) * 100) : 0;
  const viVoices = voices.filter((v) => v.isVietnamese);
  const otherVoices = voices.filter((v) => !v.isVietnamese);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl dark:border-emerald-500/20 text-slate-800 dark:text-slate-100">
        {/* Top Progress Micro-bar */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Main Bar Content */}
        <div className="p-3 sm:px-5 sm:py-3.5 flex flex-col gap-2.5">
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Badge & Paragraph Info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Giọng đọc Tiếng Việt
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40">
                    vi-VN
                  </span>
                  {isPlaying && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {totalParagraphs > 0 ? (
                    <>
                      Đoạn <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentIdx + 1}</span> / {totalParagraphs}
                      <span className="text-[10px] text-slate-400 ml-1.5">({progressPercent}%)</span>
                    </>
                  ) : (
                    'Sẵn sàng đọc Tiếng Việt'
                  )}
                </p>
              </div>
            </div>

            {/* Center: Playback Navigation Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                onClick={onPrev}
                disabled={currentParagraphIndex <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Đoạn trước"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={onTogglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-md shadow-emerald-600/30 transition-all"
                title={isPlaying ? 'Tạm dừng (Pause)' : isPaused ? 'Tiếp tục (Resume)' : 'Bắt đầu đọc (Play)'}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <button
                onClick={onNext}
                disabled={currentParagraphIndex >= totalParagraphs - 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                title="Đoạn tiếp theo"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                onClick={onStop}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                title="Dừng và đặt lại vị trí"
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right: Toggle Options & Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                  isExpanded
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                title="Cài đặt giọng đọc & tốc độ"
              >
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">{playbackRate}x</span>
                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Đóng thanh đọc TTS"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Expanded Settings Panel */}
          {isExpanded && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 animate-in fade-in duration-150">
              {/* Speed Rate & Auto-Scroll Options */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Speed buttons */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" /> Tốc độ:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                    {SPEED_OPTIONS.map((rate) => (
                      <button
                        key={rate}
                        onClick={() => onChangeRate(rate)}
                        className={`rounded-md px-2 py-1 text-[11px] font-semibold transition-all ${
                          playbackRate === rate
                            ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Scroll Switch */}
                <button
                  onClick={onToggleAutoScroll}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                    autoScroll
                      ? 'border-emerald-500/50 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                  title="Tự động cuộn màn hình đến đoạn đang đọc"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Tự cuộn theo bài</span>
                  <span className={`text-[10px] font-bold ${autoScroll ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {autoScroll ? 'BẬT' : 'TẮT'}
                  </span>
                </button>
              </div>

              {/* Voice Selector */}
              {voices.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      Chọn giọng đọc:
                    </label>
                    {hasVietnameseVoice && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        🇻🇳 Có {viVoices.length} giọng Tiếng Việt
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const found = voices.find((v) => v.name === e.target.value);
                      if (found) onChangeVoice(found.voice);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-hidden"
                  >
                    {viVoices.length > 0 && (
                      <optgroup label="🇻🇳 Giọng đọc Tiếng Việt (Khuyên dùng)">
                        {viVoices.map((v) => (
                          <option key={`${v.name}-${v.lang}`} value={v.name}>
                            ⭐ {v.name} ({v.lang}) {v.isNatural ? '✨ [Tự nhiên]' : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {otherVoices.length > 0 && (
                      <optgroup label="🌐 Giọng hệ thống khác">
                        {otherVoices.map((v) => (
                          <option key={`${v.name}-${v.lang}`} value={v.name}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              {/* Note on Vietnamese Voice quality */}
              {!hasVietnameseVoice && (
                <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    Hệ thống đang phát âm với mã ngôn ngữ <b>vi-VN</b>. Khuyên dùng trình duyệt <b>Google Chrome</b> hoặc <b>Microsoft Edge</b> để có giọng đọc Tiếng Việt AI tự nhiên nhất.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
