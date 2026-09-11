import React, { useState, useMemo, useEffect } from 'react';
import { BookCard } from '../components/home/BookCard';
import { HistoryBanner } from '../components/home/HistoryBanner';
import { BookFilter, FilterCategory } from '../components/home/BookFilter';
import { BookSearchToolbar, SortOption } from '../components/home/BookSearchToolbar';
import { BookOpen, SearchX, RotateCcw } from 'lucide-react';
import booksData from '../data/books-manifest.json';
import { Book } from '../types/book';
import { useHistory } from '../context/HistoryContext';
import { removeVietnameseAccents } from '../utils/chapterSearch';

const books: Book[] = booksData as Book[];

export const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const { history } = useHistory();

  useEffect(() => {
    document.title = 'CLB đọc sách - Đọc Sách & Nghe Audio Trực Tuyến';
  }, []);

  const readingBookIds = useMemo(() => Object.keys(history), [history]);

  // Extract unique categories with their book counts
  const categories = useMemo(() => {
    const countsMap: Record<string, number> = {};
    books.forEach((b) => {
      if (b.category) {
        countsMap[b.category] = (countsMap[b.category] || 0) + 1;
      }
    });

    return Object.entries(countsMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, []);

  const counts = useMemo(() => {
    return {
      all: books.length,
      available: books.filter((b) => b.status === 'available').length,
      reading: books.filter((b) => readingBookIds.includes(b.id)).length,
      coming_soon: books.filter((b) => b.status === 'coming_soon').length,
    };
  }, [readingBookIds]);

  const hasActiveFilters = filter !== 'all' || searchQuery.trim() !== '' || selectedCategory !== 'all' || sortBy !== 'default';

  const handleResetAll = () => {
    setFilter('all');
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('default');
  };

  const filteredBooks = useMemo(() => {
    const normalizedQuery = removeVietnameseAccents(searchQuery.trim().toLowerCase());

    const result = books.filter((b) => {
      // 1. Status Filter
      if (filter === 'available' && b.status !== 'available') return false;
      if (filter === 'coming_soon' && b.status !== 'coming_soon') return false;
      if (filter === 'reading' && !readingBookIds.includes(b.id)) return false;

      // 2. Category Filter
      if (selectedCategory !== 'all' && b.category !== selectedCategory) return false;

      // 3. Search Query Filter (Accent-insensitive)
      if (normalizedQuery) {
        const searchableFields = [
          b.title,
          b.originalTitle || '',
          b.author,
          b.category || '',
          b.description || '',
          b.translator || '',
          ...(b.tags || []),
        ];

        const match = searchableFields.some((field) =>
          removeVietnameseAccents(field.toLowerCase()).includes(normalizedQuery)
        );

        if (!match) return false;
      }

      return true;
    });

    // 4. Sorting
    if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    } else if (sortBy === 'chapters-desc') {
      result.sort((a, b) => b.totalChapters - a.totalChapters);
    }

    return result;
  }, [filter, searchQuery, selectedCategory, sortBy, readingBookIds]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Continue Reading / Hero Banner */}
      <HistoryBanner />

      {/* Catalog Header & Status Filter Tabs */}
      <div id="book-catalog" className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 scroll-mt-20">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thư Viện Tác Phẩm
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lựa chọn sách để bắt đầu đọc nội dung hoặc nghe bài tập audio đi kèm.
          </p>
        </div>

        <BookFilter currentFilter={filter} onFilterChange={setFilter} counts={counts} />
      </div>

      {/* Search, Category Filter & Sorting Toolbar */}
      <BookSearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalResults={filteredBooks.length}
        totalBooks={books.length}
        onResetAll={handleResetAll}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Book Grid: 5 items per row on desktop */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
          {searchQuery || selectedCategory !== 'all' ? (
            <SearchX className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          ) : (
            <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          )}
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
            {searchQuery || selectedCategory !== 'all'
              ? 'Không tìm thấy cuốn sách nào phù hợp'
              : 'Không có sách nào trong mục này'}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            {searchQuery || selectedCategory !== 'all'
              ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc chọn danh mục thể loại khác.'
              : 'Hãy chọn bộ lọc trạng thái khác hoặc bắt đầu đọc cuốn sách có sẵn.'}
          </p>

          {hasActiveFilters && (
            <button
              onClick={handleResetAll}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Xem lại toàn bộ thư viện</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};
