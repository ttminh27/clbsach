import React, { useRef, useEffect } from 'react';
import { Search, X, Tag, ArrowUpDown, RotateCcw } from 'lucide-react';

export type SortOption = 'default' | 'title-asc' | 'chapters-desc';

interface BookSearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: { name: string; count: number }[];
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalResults: number;
  totalBooks: number;
  onResetAll: () => void;
  hasActiveFilters: boolean;
}

export const BookSearchToolbar: React.FC<BookSearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
  totalResults,
  totalBooks,
  onResetAll,
  hasActiveFilters,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on '/' keypress if not already in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="mb-6 space-y-3">
      {/* Main Search & Filters Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên sách, tác giả, thể loại, từ khóa... (Nhấn '/' để tìm)"
            className="w-full rounded-2xl bg-white dark:bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200/90 dark:border-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category & Sort Controls */}
        <div className="flex items-center gap-2.5">
          {/* Category Selector */}
          <div className="relative flex-1 sm:flex-initial min-w-[180px] sm:min-w-[210px]">
            <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none rounded-2xl bg-white dark:bg-slate-900/90 pl-9.5 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="all">Tất cả thể loại ({totalBooks})</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>

          {/* Sort Selector */}
          <div className="relative min-w-[140px]">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full appearance-none rounded-2xl bg-white dark:bg-slate-900/90 pl-8 pr-7 py-2.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="title-asc">Tên sách (A → Z)</option>
              <option value="chapters-desc">Nhiều chương nhất</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Chips & Results Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-2">
          <span>
            Hiển thị <strong className="text-slate-900 dark:text-white">{totalResults}</strong> / {totalBooks} cuốn sách
          </span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 px-2 py-0.5 font-medium text-[11px]">
              Từ khóa: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-emerald-900 dark:hover:text-white"
                title="Bỏ lọc từ khóa"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 px-2 py-0.5 font-medium text-[11px]">
              Chủ đề: {selectedCategory}
              <button
                onClick={() => onCategoryChange('all')}
                className="hover:text-indigo-900 dark:hover:text-white"
                title="Bỏ lọc thể loại"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Xóa tất cả bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};
