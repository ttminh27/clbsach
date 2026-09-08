import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X, List, AlertCircle } from 'lucide-react';
import { SearchMatch } from '../../utils/chapterSearch';

interface ChapterSearchBarProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  matches: SearchMatch[];
  activeMatchIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onJumpTo: (index: number) => void;
}

export const ChapterSearchBar: React.FC<ChapterSearchBarProps> = ({
  isOpen,
  onClose,
  query,
  onQueryChange,
  matches,
  activeMatchIndex,
  onNext,
  onPrev,
  onJumpTo,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSnippets, setShowSnippets] = useState<boolean>(false);

  // Auto-focus input when search bar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setShowSnippets(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalMatches = matches.length;
  const currentDisplayIndex = totalMatches > 0 ? activeMatchIndex + 1 : 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      data-no-search="true"
      className="sticky top-14 z-20 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-6 py-2 w-full">
        {/* Search Input Container */}
        <div className="flex flex-1 items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/90 px-2.5 sm:px-3 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all min-w-0">
          <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm trong chương..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
              title="Xóa nội dung tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Results Counter & Navigation Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Match Counter Badge */}
          {query.trim() ? (
            <span
              className={`rounded-lg px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-colors ${
                totalMatches > 0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {totalMatches > 0 ? (
                `${currentDisplayIndex}/${totalMatches}`
              ) : (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  0
                </span>
              )}
            </span>
          ) : (
            <span className="hidden md:inline text-[11px] text-slate-400">
              Nhập từ khóa
            </span>
          )}

          {/* Prev match */}
          <button
            onClick={onPrev}
            disabled={totalMatches === 0}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Kết quả trước (Shift+Enter)"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Next match */}
          <button
            onClick={onNext}
            disabled={totalMatches === 0}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Kết quả tiếp theo (Enter)"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Snippets drawer toggle button */}
          {totalMatches > 0 && (
            <button
              onClick={() => setShowSnippets(!showSnippets)}
              className={`rounded-lg p-1.5 transition-colors ${
                showSnippets
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
              title="Xem danh sách tất cả các đoạn văn tìm thấy"
            >
              <List className="h-4 w-4" />
            </button>
          )}

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Close Search Bar */}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            title="Đóng tìm kiếm (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Snippets Popover / Dropdown Panel */}
      {showSnippets && totalMatches > 0 && (
        <div className="mx-auto max-w-5xl px-3 sm:px-6 pb-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/90 p-2 shadow-inner space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Tìm thấy {totalMatches} vị trí trong chương</span>
              <button
                onClick={() => setShowSnippets(false)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Thu gọn
              </button>
            </div>
            {matches.map((m, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onJumpTo(idx);
                }}
                className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-all flex items-start gap-2 ${
                  activeMatchIndex === idx
                    ? 'bg-emerald-500 text-white font-medium shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${
                    activeMatchIndex === idx
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  #{idx + 1}
                </span>
                <span className="line-clamp-2">{m.snippet}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
