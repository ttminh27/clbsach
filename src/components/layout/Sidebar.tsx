import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Home,
  Info,
  History,
  BookOpen,
  Headphones,
  Search,
  X,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Bookmark,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  ArrowLeft,
  Clock,
  Play,
  Pause,
  List,
  Menu,
} from 'lucide-react';
import booksData from '../../data/books-manifest.json';
import { Book, Chapter } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import { useAudio } from '../../context/AudioContext';

const books: Book[] = booksData as Book[];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { history } = useHistory();
  const { settings, setTheme } = useReaderSettings();
  const { playTrack, togglePlay, currentTrack, isPlaying, setIsAudioBarVisible } = useAudio();
  const [searchFilter, setSearchFilter] = useState('');
  const [readerTab, setReaderTab] = useState<'chapters' | 'audios'>('chapters');

  const isDarkMode = settings.theme === 'dark' || settings.theme === 'oled';

  // Check if current route is Reader page: /reader/:bookId/:chapterId
  const matchReader = location.pathname.match(/^\/reader\/([^/]+)\/([^/]+)/);
  const isReaderMode = Boolean(matchReader);
  const currentReaderBookId = matchReader ? matchReader[1] : null;
  const currentReaderChapterId = matchReader ? matchReader[2] : null;

  const currentReaderBook = currentReaderBookId
    ? books.find((b) => b.id === currentReaderBookId)
    : null;

  const progress = currentReaderBookId ? history[currentReaderBookId] : undefined;
  const completedSet = new Set(progress?.completedChapterIds || []);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.author.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredChapters = currentReaderBook
    ? currentReaderBook.chapters.filter((c) =>
        c.title.toLowerCase().includes(searchFilter.toLowerCase())
      )
    : [];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleChapterClick = (chapterId: string) => {
    if (currentReaderBook) {
      navigate(`/reader/${currentReaderBook.id}/${chapterId}`);
      setIsAudioBarVisible(false);
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-20' : 'w-72 sm:w-80'
        }`}
      >
        {/* ========================================================================= */}
        {/* CASE A: READER MODE (MỤC LỤC CHƯƠNG KHI ĐANG ĐỌC SÁCH)                    */}
        {/* ========================================================================= */}
        {isReaderMode && currentReaderBook ? (
          <>
            {/* Header: Book Title & Back Link */}
            <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
              <Link
                to={`/book/${currentReaderBook.id}`}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 min-w-0"
                title="Quay lại chi tiết sách"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate font-bold">
                    {currentReaderBook.title}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-1">
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    title={isCollapsed ? 'Mở rộng mục lục' : 'Thu gọn mục lục'}
                  >
                    {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Tab Switcher (Chapters vs Audio) */}
            {!isCollapsed && (
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    onClick={() => {
                      setReaderTab('chapters');
                      setIsAudioBarVisible(false);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                      readerTab === 'chapters'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    Mục Lục ({currentReaderBook.chapters.length})
                  </button>

                  {currentReaderBook.audios.length > 0 && (
                    <button
                      onClick={() => {
                        setReaderTab('audios');
                        setIsAudioBarVisible(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                        readerTab === 'audios'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Headphones className="h-3.5 w-3.5 text-emerald-500" />
                      Audio ({currentReaderBook.audios.length})
                    </button>
                  )}
                </div>

                {/* Filter chapters input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder={readerTab === 'chapters' ? "Tìm chương..." : "Tìm bài audio..."}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* List Content: Chapters or Audios */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {readerTab === 'chapters' ? (
                /* Chapter Items */
                filteredChapters.map((chapter, idx) => {
                  const isCurrent = chapter.id === currentReaderChapterId;
                  const isCompleted = completedSet.has(chapter.id);

                  if (isCollapsed) {
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter.id)}
                        className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-bold transition-all relative ${
                          isCurrent
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                        title={chapter.title}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : chapter.order}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => handleChapterClick(chapter.id)}
                      className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                          : isCompleted
                          ? 'text-slate-700 hover:bg-emerald-50 dark:text-slate-300 dark:hover:bg-emerald-950/30'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-slate-950 text-emerald-400'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-xs font-semibold">
                            {chapter.title}
                          </p>
                        </div>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isCurrent ? 'text-slate-900/80 font-medium' : 'text-slate-400'
                          }`}
                        >
                          ~{chapter.readingTimeMin}p • {chapter.wordCount} từ
                        </p>
                      </div>

                      {isCurrent && (
                        <span className="shrink-0 rounded bg-slate-950 px-1.5 py-0.2 text-[9px] font-bold text-white">
                          Đang đọc
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                /* Audio Playlist Items */
                currentReaderBook.audios.map((audio, aIdx) => {
                  const isThisAudioPlaying =
                    currentTrack?.id === audio.id &&
                    currentTrack?.bookId === currentReaderBook.id &&
                    isPlaying;
                  const isThisAudioCurrent =
                    currentTrack?.id === audio.id &&
                    currentTrack?.bookId === currentReaderBook.id;

                  return (
                    <button
                      key={audio.id}
                      onClick={() => {
                        if (isThisAudioCurrent) {
                          togglePlay();
                        } else {
                          playTrack(currentReaderBook, aIdx);
                        }
                        setIsAudioBarVisible(true);
                      }}
                      className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                        isThisAudioCurrent
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform ${
                          isThisAudioCurrent
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isThisAudioPlaying ? (
                          <Pause className="h-3.5 w-3.5 fill-white" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            {audio.prefix}
                          </span>
                          <p className="truncate text-xs font-semibold">
                            {audio.title}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Actions in Reader Mode */}
            <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-white"
              >
                <Home className="h-4 w-4" />
                {!isCollapsed && <span>Thư Viện Sách</span>}
              </Link>

              <button
                onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                className="flex items-center gap-1.5 rounded-lg p-1.5 text-xs text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                title="Đổi giao diện Sáng / Tối"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* CASE B: NORMAL MODE (TRANG CHỦ, GIỚI THIỆU, DANH SÁCH 7 TỰA SÁCH)         */
          /* ========================================================================= */
          <>
            {/* Brand Header */}
            <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                {onToggleCollapse ? (
                  <button
                    onClick={onToggleCollapse}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                    title={isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                    aria-label="Thu gọn hoặc mở sidebar"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 dark:text-slate-300">
                    <Menu className="h-5 w-5" />
                  </div>
                )}

                {!isCollapsed && (
                  <Link
                    to="/"
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className="min-w-0 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        CLB đọc sách <span className="text-emerald-600 dark:text-emerald-400">VietinBank</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      Đọc & Nghe Tỉnh Thức
                    </p>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  aria-label="Đóng sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Main Navigation Menu */}
            <div className="p-3 space-y-1">
              <Link
                to="/"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  location.pathname === '/'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                title="Trang Chủ"
              >
                <Home className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Trang Chủ</span>}
              </Link>

              <Link
                to="/about"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive('/about')
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                title="Giới Thiệu"
              >
                <Info className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Giới Thiệu Dự Án</span>}
              </Link>

              <Link
                to="/history"
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive('/history')
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                title="Lịch Sử Đọc"
              >
                <History className="h-4 w-4 shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>Lịch Sử & Tiến Độ</span>
                    {Object.keys(history).length > 0 && (
                      <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold">
                        {Object.keys(history).length}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </div>

            {/* Books List Header & Filter */}
            {!isCollapsed && (
              <div className="px-4 pt-3 pb-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Danh Sách Tựa Sách ({books.length})
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    1 Có sẵn
                  </span>
                </div>

                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Lọc tên sách..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Books List Items */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
              {filteredBooks.map((book) => {
                const isCurrentBook =
                  location.pathname.includes(`/book/${book.id}`) ||
                  location.pathname.includes(`/reader/${book.id}`);
                const bookProg = history[book.id];
                const isAvailable = book.status === 'available';

                if (isCollapsed) {
                  return (
                    <button
                      key={book.id}
                      onClick={() => handleBookClick(book.id)}
                      className={`flex h-12 w-full items-center justify-center rounded-xl transition-all relative group ${
                        isCurrentBook
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                      title={`${book.title} (${isAvailable ? 'Có sẵn' : 'Sắp có'})`}
                    >
                      <div className="h-8 w-6 overflow-hidden rounded shadow-xs">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className={`h-full w-full bg-gradient-to-br ${book.gradient} flex items-center justify-center text-white text-[8px] font-bold`}>
                            {book.title.slice(0, 2)}
                          </div>
                        )}
                      </div>
                      {isAvailable && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={book.id}
                    onClick={() => handleBookClick(book.id)}
                    className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all ${
                      isCurrentBook
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Mini Cover */}
                    <div className="h-11 w-8 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 shadow-xs">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${book.gradient} flex items-center justify-center text-white text-[9px] font-bold p-0.5 text-center`}>
                          {book.title.slice(0, 3)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {book.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {book.author}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        {isAvailable ? (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {book.totalChapters} chương • {book.totalAudios} audio
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Sắp ra mắt
                          </span>
                        )}

                        {bookProg && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <Bookmark className="h-2.5 w-2.5" />
                            Đang đọc
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Bottom Theme & Footer Actions */}
            <div className="shrink-0 p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {!isCollapsed ? (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                    <span>{isDarkMode ? 'Giao diện Sáng' : 'Giao diện Tối'}</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-400">
                    v1.0.0
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className="flex h-9 w-full items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Chuyển chế độ sáng/tối"
                >
                  {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
};
