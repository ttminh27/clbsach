import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  List,
  Type,
  Headphones,
  Moon,
  Sun,
  Palette,
  Minus,
  Plus,
  AlignLeft,
  AlignJustify,
  Maximize2,
  Check,
  Sparkles,
} from 'lucide-react';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import { useAudio } from '../../context/AudioContext';
import { Book, Chapter } from '../../types/book';

interface ReaderToolbarProps {
  book: Book;
  currentChapter: Chapter;
  onOpenTOC: () => void;
  scrollProgress: number; // 0 to 100
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  book,
  currentChapter,
  onOpenTOC,
  scrollProgress,
}) => {
  const { settings, setTheme, setFontSize, setLineHeight, setFontFamily, setTextAlign, setMaxWidth, toggleBionicReading } =
    useReaderSettings();
  const { currentTrack, isPlaying, playTrack, togglePlay, setIsPlayerModalOpen } = useAudio();
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  const isAudioAvailable = book.audios.length > 0;
  const isThisBookAudioPlaying = isPlaying && currentTrack?.bookId === book.id;

  return (
    <div className="sticky top-0 z-30 w-full backdrop-blur-md transition-colors border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/90">
      {/* Top Reading Progress Bar */}
      <div className="h-1 w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6">
        {/* Left: Back & TOC */}
        <div className="flex items-center gap-2">
          <Link
            to={`/book/${book.id}`}
            className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Quay lại chi tiết sách"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Chi tiết sách</span>
          </Link>

          <button
            onClick={onOpenTOC}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 px-3 py-1.5 text-xs font-semibold transition-colors"
            title="Mở mục lục các chương"
          >
            <List className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mục lục</span>
            <span className="text-[11px] opacity-75">({currentChapter.order}/{book.chapters.length})</span>
          </button>
        </div>

        {/* Center: Chapter title truncate */}
        <div className="hidden md:block max-w-sm text-center">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {currentChapter.title}
          </p>
          <p className="text-[10px] text-slate-400">
            Tiến độ: {Math.round(scrollProgress)}%
          </p>
        </div>

        {/* Right: Audio toggle & Reading Settings */}
        <div className="flex items-center gap-1.5">
          {isAudioAvailable && (
            <button
              onClick={() => {
                if (currentTrack) {
                  setIsPlayerModalOpen(true);
                } else {
                  playTrack(book, 0);
                  setIsPlayerModalOpen(true);
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                isThisBookAudioPlaying
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Phát Audio đi kèm"
            >
              <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Audio</span>
            </button>
          )}

          {/* Reading Display Settings Popover Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsPopover(!showSettingsPopover)}
              className={`flex items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors ${
                showSettingsPopover
                  ? 'bg-slate-200 dark:bg-slate-700 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Tùy chỉnh giao diện đọc (Font, Cỡ chữ, Nền)"
            >
              <Type className="h-4 w-4" />
            </button>

            {/* Popover Dropdown */}
            {showSettingsPopover && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tùy Chỉnh Chế Độ Đọc
                  </h4>
                  <button
                    onClick={() => setShowSettingsPopover(false)}
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Đóng
                  </button>
                </div>

                {/* Theme Selector */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Màu nền & Giao diện
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-all ${
                        settings.theme === 'light'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 text-slate-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Sun className="h-4 w-4 mb-1 text-amber-500" />
                      Sáng
                    </button>

                    <button
                      onClick={() => setTheme('sepia')}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-all ${
                        settings.theme === 'sepia'
                          ? 'border-amber-600 ring-2 ring-amber-600/20 bg-[#fbf0d9] text-[#433422]'
                          : 'border-amber-200 bg-[#fbf0d9] text-[#433422]/80 hover:bg-[#f6e9ce]'
                      }`}
                    >
                      <Palette className="h-4 w-4 mb-1 text-amber-700" />
                      Sepia
                    </button>

                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-all ${
                        settings.theme === 'dark'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-800 text-white'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Moon className="h-4 w-4 mb-1 text-blue-400" />
                      Tối
                    </button>

                    <button
                      onClick={() => setTheme('oled')}
                      className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-medium border transition-all ${
                        settings.theme === 'oled'
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-black text-white'
                          : 'border-slate-800 bg-black text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="h-4 w-4 mb-1 text-emerald-400" />
                      OLED
                    </button>
                  </div>
                </div>

                {/* Font Size Selector */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <span>Cỡ chữ</span>
                    <span className="font-bold text-emerald-600">{settings.fontSize}px</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFontSize(settings.fontSize - 2)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Giảm cỡ chữ"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      step="2"
                      value={settings.fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                    <button
                      onClick={() => setFontSize(settings.fontSize + 2)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      title="Tăng cỡ chữ"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Font Family Selector */}
                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Kiểu Font chữ
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setFontFamily('serif')}
                      className={`rounded-xl py-2 px-2 text-xs font-serif transition-all border ${
                        settings.fontFamily === 'serif'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Serif (Lora)
                    </button>
                    <button
                      onClick={() => setFontFamily('sans')}
                      className={`rounded-xl py-2 px-2 text-xs font-sans transition-all border ${
                        settings.fontFamily === 'sans'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Sans (Hiện đại)
                    </button>
                    <button
                      onClick={() => setFontFamily('mono')}
                      className={`rounded-xl py-2 px-2 text-xs font-mono transition-all border ${
                        settings.fontFamily === 'mono'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      Mono (Code)
                    </button>
                  </div>
                </div>

                {/* Line Height & Alignment */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTextAlign('left')}
                      className={`rounded-lg p-2 text-xs transition-colors ${
                        settings.textAlign === 'left'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Canh lề trái"
                    >
                      <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setTextAlign('justify')}
                      className={`rounded-lg p-2 text-xs transition-colors ${
                        settings.textAlign === 'justify'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Canh đều 2 bên"
                    >
                      <AlignJustify className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400">Độ rộng:</span>
                    <button
                      onClick={() => setMaxWidth(settings.maxWidth === 'narrow' ? 'medium' : settings.maxWidth === 'medium' ? 'wide' : 'narrow')}
                      className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 font-semibold text-slate-700 dark:text-slate-300 uppercase text-[10px]"
                    >
                      {settings.maxWidth}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
