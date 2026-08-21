import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertCircle, Loader2, Home } from 'lucide-react';
import booksData from '../data/books-manifest.json';
import { Book, Chapter, ChapterQuiz } from '../types/book';
import { QuizGame } from '../components/quiz/QuizGame';

const books: Book[] = booksData as Book[];

export const QuizPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<ChapterQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const book = books.find((b) => b.id === bookId);
  const chapter = book?.chapters.find((c) => c.id === chapterId);

  useEffect(() => {
    if (!book || !chapter) {
      setError('Không tìm thấy chương sách tương ứng.');
      setLoading(false);
      return;
    }

    if (!chapter.hasQuiz && !chapter.quizUrl) {
      setError('Chương này hiện chưa có bộ câu hỏi Quiz thử thách.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const quizUrl = chapter.quizUrl || `/books/${book.id}/quizzes/${chapter.id}.json`;

    fetch(quizUrl)
      .then(async (res) => {
        const contentType = res.headers.get('content-type');
        if (!res.ok || (contentType && !contentType.includes('application/json'))) {
          throw new Error('Chương này hiện chưa có bộ câu hỏi Quiz thử thách.');
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('Dữ liệu câu hỏi chưa khả dụng.');
        }
        setQuiz(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading quiz:', err);
        setError(err.message || 'Lỗi tải nội dung Quiz.');
        setLoading(false);
      });
  }, [bookId, chapterId, book, chapter]);

  if (!book || !chapter) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chương không tồn tại
        </h3>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Về Trang chủ
          </Link>
          {book && (
            <Link
              to={`/book/${book.id}`}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              Chi tiết sách
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="mx-auto max-w-3xl mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs"
            title="Về Trang chủ"
          >
            <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          <Link
            to={`/reader/${book.id}/${chapter.id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về bài đọc chương</span>
          </Link>
        </div>

        <Link
          to={`/book/${book.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          <BookOpen className="h-4 w-4" />
          <span>{book.title}</span>
        </Link>
      </div>

      {/* Main Quiz Content */}
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs text-slate-500">Đang chuẩn bị bộ câu hỏi suy luận...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md p-6 text-center my-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
          </div>
        ) : quiz ? (
          <QuizGame quiz={quiz} book={book} chapter={chapter} />
        ) : null}
      </div>
    </div>
  );
};
