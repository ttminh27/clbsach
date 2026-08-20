import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Moon, Sun, Library, X, Menu, Info, History } from 'lucide-react';
import { useReaderSettings } from '../../context/ReaderSettingsContext';
import booksData from '../../data/books-manifest.json';
import { Book } from '../../types/book';

const books: Book[] = booksData as Book[];

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, setTheme } = useReaderSettings();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDarkMode = settings.theme === 'dark' || settings.theme === 'oled';

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [searchOpen]);

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  const handleSelectBook = (bookId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/book/${bookId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6">
          {/* Left: Hamburger Menu & Brand Logo */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="flex rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
                title={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn / Mở sidebar'}
                aria-label="Thu gọn hoặc mở menu bên trái"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                    CLB đọc sách <span className="text-emerald-600 dark:text-emerald-400">VietinBank</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Library className="h-4 w-4" />
              Trang Chủ
            </Link>
            <Link
              to="/about"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                location.pathname === '/about'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Info className="h-4 w-4" />
              Giới Thiệu
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                location.pathname === '/history'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <History className="h-4 w-4" />
              Lịch Sử Đọc
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-slate-700 transition-all"
              title="Tìm kiếm sách (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tìm kiếm...</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <Search className="h-5 w-5 text-slate-400 mr-3" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên sách, tác giả, chủ đề..."
                className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2">
              {searchQuery.trim() === '' ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Gợi ý: Tìm "Search Inside Yourself", "EQ", "Thói quen", "Sharma"...
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Không tìm thấy tựa sách nào khớp với "{searchQuery}"
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800 shadow-xs">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className={`h-full w-full bg-gradient-to-br ${book.gradient} flex items-center justify-center text-white text-[10px] font-bold p-1 text-center`}>
                          {book.title.slice(0, 4)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          {book.title}
                        </h4>
                        {book.status === 'available' ? (
                          <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Có sẵn
                          </span>
                        ) : (
                          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Sắp có
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {book.author} • {book.category}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
