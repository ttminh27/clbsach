import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BookHeader } from '../components/book-detail/BookHeader';
import { ChapterList } from '../components/book-detail/ChapterList';
import { AudioList } from '../components/book-detail/AudioList';
import { BookInfo } from '../components/book-detail/BookInfo';
import booksData from '../data/books-manifest.json';
import { Book } from '../types/book';
import { ArrowLeft } from 'lucide-react';

const books: Book[] = booksData as Book[];

export const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const [activeTab, setActiveTab] = useState<'chapters' | 'audios' | 'info'>('chapters');

  const book = books.find((b) => b.id === bookId);

  useEffect(() => {
    if (book) {
      document.title = `${book.title} - ${book.author} | CLB đọc sách`;
    }
  }, [book]);

  if (!book) {
    return (
      <div className="mx-auto max-w-xl py-20 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Không tìm thấy tựa sách
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Cuốn sách bạn yêu cầu không tồn tại trong hệ thống.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <BookHeader book={book} activeTab={activeTab} onTabChange={setActiveTab} />

      {book.status === 'available' && (
        <div className="mt-6">
          {activeTab === 'chapters' && <ChapterList book={book} />}
          {activeTab === 'audios' && <AudioList book={book} />}
          {activeTab === 'info' && <BookInfo book={book} />}
        </div>
      )}
    </div>
  );
};
