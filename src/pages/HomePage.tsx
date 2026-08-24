import React, { useState, useMemo, useEffect } from 'react';
import { BookCard } from '../components/home/BookCard';
import { HistoryBanner } from '../components/home/HistoryBanner';
import { BookFilter, FilterCategory } from '../components/home/BookFilter';
import { BookOpen } from 'lucide-react';
import booksData from '../data/books-manifest.json';
import { Book } from '../types/book';
import { useHistory } from '../context/HistoryContext';

const books: Book[] = booksData as Book[];

export const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const { history } = useHistory();

  useEffect(() => {
    document.title = 'CLB đọc sách VietinBank - Đọc Sách & Nghe Audio Trực Tuyến';
  }, []);

  const readingBookIds = useMemo(() => Object.keys(history), [history]);

  const counts = useMemo(() => {
    return {
      all: books.length,
      available: books.filter((b) => b.status === 'available').length,
      reading: books.filter((b) => readingBookIds.includes(b.id)).length,
      coming_soon: books.filter((b) => b.status === 'coming_soon').length,
    };
  }, [readingBookIds]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (filter === 'available') return b.status === 'available';
      if (filter === 'coming_soon') return b.status === 'coming_soon';
      if (filter === 'reading') return readingBookIds.includes(b.id);
      return true;
    });
  }, [filter, readingBookIds]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Continue Reading / Hero Banner */}
      <HistoryBanner />

      {/* Filter Tabs */}
      <div id="book-catalog" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 scroll-mt-20">
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

      {/* Book Grid: 5 items per row on desktop */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">
            Không có sách nào trong mục này
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Hãy chọn bộ lọc khác hoặc bắt đầu đọc cuốn sách có sẵn.
          </p>
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
