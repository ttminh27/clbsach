import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
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
  Volume2,
  MessageSquare,
  Search,
  Copy,
  FileText,
  Code2,
  Link2,
  Quote,
} from 'lucide-react';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import { useAudio } from '../../context/AudioContext';
import { UserDropdown } from '../auth/UserDropdown';
import { ChapterCopyMenu } from './ChapterCopyMenu';
import { copyToClipboard, stripMarkdownToPlainText } from '../../utils/clipboard';
import { Book, Chapter } from '../../types/book';

interface ReaderToolbarProps {
  book: Book;
  currentChapter: Chapter;
  onOpenTOC: () => void;
  scrollProgress: number; // 0 to 100
  isTTSActive?: boolean;
  isTTSSpeaking?: boolean;
  onToggleTTS?: () => void;
  onOpenDiscussion?: () => void;
  chapterContent?: string;
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;
  onCopied?: (message: string) => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  book,
  currentChapter,
  onOpenTOC,
  scrollProgress,
  isTTSActive = false,
  isTTSSpeaking = false,
  onToggleTTS,
  onOpenDiscussion,
  chapterContent = '',
  isSearchOpen = false,
  onToggleSearch,
  onCopied,
}) => {
  const { settings, setTheme, setFontSize, setLineHeight, setFontFamily, setTextAlign, setMaxWidth, toggleBionicReading } =
    useReaderSettings();
  const { currentTrack, isPlaying, playTrack, togglePlay, setIsPlayerModalOpen } = useAudio();
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [justCopiedType, setJustCopiedType] = useState<string | null>(null);

  const handleToggleSettings = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0) {
      setSelectedText(sel.toString().trim());
    } else {
      setSelectedText('');
    }
    setShowSettingsPopover(!showSettingsPopover);
  };

  const handleCopyPlainText = async () => {
    if (!chapterContent) return;
    const plainText = stripMarkdownToPlainText(chapterContent);
    const fullText = `📚 ${book.title}\n📖 ${currentChapter.title}\n\n${plainText}\n\n— Nguồn: CLB Đọc Sách (${window.location.href})`;
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setJustCopiedType('plain');
      onCopied?.('Đã sao chép toàn bộ nội dung chương (văn bản thuần)!');
      setTimeout(() => setJustCopiedType(null), 2000);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!chapterContent) return;
    const fullMd = `<!-- Sách: ${book.title} | Chương: ${currentChapter.title} -->\n\n${chapterContent}`;
    const ok = await copyToClipboard(fullMd);
    if (ok) {
      setJustCopiedType('md');
      onCopied?.('Đã sao chép nội dung định dạng Markdown!');
      setTimeout(() => setJustCopiedType(null), 2000);
    }
  };

  const handleCopyLink = async () => {
    const link = window.location.href;
    const textToCopy = `📖 Đọc "${currentChapter.title}" - ${book.title} tại:\n${link}`;
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setJustCopiedType('link');
      onCopied?.('Đã sao chép liên kết chương sách!');
      setTimeout(() => setJustCopiedType(null), 2000);
    }
  };

  const handleCopySelection = async () => {
    if (!selectedText) return;
    const quoteText = `"${selectedText}"\n\n— Trích từ: "${currentChapter.title}", sách "${book.title}" (${window.location.href})`;
    const ok = await copyToClipboard(quoteText);
    if (ok) {
      setJustCopiedType('selection');
      onCopied?.('Đã sao chép đoạn trích dẫn đang chọn!');
      setTimeout(() => setJustCopiedType(null), 2000);
    }
  };

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

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 w-full">
        {/* Left: Back to Book Detail & Mobile TOC button */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link
            to={`/book/${book.id}`}
            className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Quay lại chi tiết sách"
          >
            <ArrowLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Chi tiết sách</span>
          </Link>

          {/* On Desktop, left sidebar already shows TOC. Only show TOC drawer button on mobile/tablet */}
          <button
            onClick={onOpenTOC}
            className="lg:hidden flex items-center gap-1 sm:gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300 px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition-colors shrink-0"
            title="Mở mục lục các chương"
          >
            <List className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">Mục lục</span>
            <span className="text-[11px] opacity-85">({currentChapter.order}/{book.chapters.length})</span>
          </button>
        </div>

        {/* Center: Book & Chapter title with reading progress */}
        <div className="hidden md:flex flex-1 min-w-0 flex-col items-center justify-center max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg text-center px-1 sm:px-2">
          <div className="flex items-center gap-1.5 text-[11px] max-w-full">
            <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 truncate max-w-[120px] lg:max-w-[180px]">
              {book.title}
            </span>
            <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              Tiến độ {Math.round(scrollProgress)}%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">
            {currentChapter.title}
          </p>
        </div>

        {/* Right: Search, Copy, Audio toggle, TTS & Reading Settings */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Chapter In-Page Search Button */}
          {onToggleSearch && (
            <button
              onClick={onToggleSearch}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium transition-all shrink-0 ${
                isSearchOpen
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/50 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Tìm kiếm trong chương này (Ctrl+F)"
            >
              <Search className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Tìm kiếm</span>
            </button>
          )}

          {/* Chapter Copy to Clipboard Menu - hidden on small mobile to avoid overflow */}
          <div className="hidden sm:block">
            <ChapterCopyMenu
              bookTitle={book.title}
              chapterTitle={currentChapter.title}
              chapterContent={chapterContent}
              onCopied={onCopied || (() => {})}
            />
          </div>

          {/* TTS Web Speech Button */}
          {onToggleTTS && (
            <button
              onClick={onToggleTTS}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium transition-all shrink-0 ${
                isTTSSpeaking
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/50 shadow-xs'
                  : isTTSActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Đọc tự động bằng AI Web Speech (TTS)"
            >
              <Volume2 className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 ${isTTSSpeaking ? 'animate-bounce' : ''}`} />
              <span className="hidden xl:inline">Giọng đọc AI</span>
            </button>
          )}

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
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium transition-all shrink-0 ${
                isThisBookAudioPlaying
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse ring-1 ring-amber-500/50'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title={`Nghe audio thu âm sẵn (${book.audios.length} bài)`}
            >
              <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="hidden xl:inline">Audio sách</span>
            </button>
          )}

          {/* Reading Display Settings & Copy Popover Trigger */}
          <div className="relative">
            <button
              onClick={handleToggleSettings}
              className={`flex items-center gap-1 rounded-lg p-2 text-xs font-medium transition-colors shrink-0 ${
                showSettingsPopover
                  ? 'bg-slate-200 dark:bg-slate-700 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Tùy chỉnh giao diện đọc & Sao chép nội dung"
            >
              <Type className="h-4 w-4 shrink-0" />
            </button>

            {/* Popover Dropdown */}
            {showSettingsPopover && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
                  onClick={() => setShowSettingsPopover(false)}
                />
                <div className="fixed inset-x-3 top-16 max-h-[85vh] overflow-y-auto sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-80 z-50 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
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
                      Serif (Sách)
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

                {/* Text Alignment */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Canh lề văn bản</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTextAlign('left')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        settings.textAlign === 'left'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Canh lề trái"
                    >
                      <AlignLeft className="h-4 w-4" />
                      <span>Trái</span>
                    </button>
                    <button
                      onClick={() => setTextAlign('justify')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                        settings.textAlign === 'justify'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Canh đều 2 bên"
                    >
                      <AlignJustify className="h-4 w-4" />
                      <span>Đều 2 bên</span>
                    </button>
                  </div>
                </div>

                {/* Width Selector */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <span>Độ rộng trang đọc</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {settings.maxWidth === 'narrow'
                        ? 'Hẹp (768px)'
                        : settings.maxWidth === 'wide'
                        ? 'Rộng (1152px)'
                        : settings.maxWidth === 'full'
                        ? 'Tối đa (1280px)'
                        : 'Chuẩn (1024px)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                    <button
                      onClick={() => setMaxWidth('narrow')}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                        settings.maxWidth === 'narrow'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Hẹp
                    </button>
                    <button
                      onClick={() => setMaxWidth('medium')}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                        settings.maxWidth === 'medium'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Chuẩn
                    </button>
                    <button
                      onClick={() => setMaxWidth('wide')}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                        settings.maxWidth === 'wide'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Rộng
                    </button>
                    <button
                      onClick={() => setMaxWidth('full')}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition-all ${
                        settings.maxWidth === 'full'
                          ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Tối đa
                    </button>
                  </div>
                </div>

                {/* Sao chép nội dung chương (Đặc biệt hữu ích trên Mobile) */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Sao Chép Nội Dung</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Clipboard</span>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    {selectedText && (
                      <button
                        onClick={handleCopySelection}
                        className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Quote className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div className="truncate">
                            <div className="font-semibold text-[11px]">Sao chép đoạn đang chọn</div>
                            <div className="text-[10px] text-amber-700 dark:text-amber-400/80 truncate">"{selectedText.slice(0, 35)}..."</div>
                          </div>
                        </div>
                        {justCopiedType === 'selection' ? (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 opacity-70" />
                        )}
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopyPlainText}
                        disabled={!chapterContent}
                        className="flex items-center justify-between rounded-xl p-2.5 text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-left disabled:opacity-50"
                        title="Sao chép toàn bộ văn bản thuần không kèm format"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-[11px]">Văn bản thuần</div>
                            <div className="text-[10px] text-slate-400">Dễ đọc & dán</div>
                          </div>
                        </div>
                        {justCopiedType === 'plain' && (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-in zoom-in-50" />
                        )}
                      </button>

                      <button
                        onClick={handleCopyMarkdown}
                        disabled={!chapterContent}
                        className="flex items-center justify-between rounded-xl p-2.5 text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-left disabled:opacity-50"
                        title="Sao chép định dạng Markdown đầy đủ"
                      >
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div>
                            <div className="font-semibold text-[11px]">Markdown</div>
                            <div className="text-[10px] text-slate-400">Giữ tiêu đề & format</div>
                          </div>
                        </div>
                        {justCopiedType === 'md' && (
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-in zoom-in-50" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-left"
                      title="Sao chép đường link tới chương sách hiện tại"
                    >
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-[11px]">Sao chép liên kết chương</div>
                          <div className="text-[10px] text-slate-400">Chia sẻ trực tiếp tới bài đọc này</div>
                        </div>
                      </div>
                      {justCopiedType === 'link' ? (
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-in zoom-in-50" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400 shrink-0 opacity-60" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Discussion Trigger Button - hidden on mobile (accessible at bottom of chapter) */}
        {onOpenDiscussion && (
          <button
            onClick={onOpenDiscussion}
            className="hidden sm:flex items-center gap-1 sm:gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all shrink-0"
            title="Mở bảng thảo luận chương sách"
          >
            <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden xl:inline">Thảo luận</span>
          </button>
        )}

          {/* User Profile / Login Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};
