import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Book, Chapter, ChapterQuiz } from '../../types/book';
import { QuizGame } from './QuizGame';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  chapter: Chapter;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  book,
  chapter,
}) => {
  const [quiz, setQuiz] = useState<ChapterQuiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(null);

    if (!chapter.hasQuiz && !chapter.quizUrl) {
      setError('Chương này hiện chưa có bộ câu hỏi Quiz thử thách.');
      setLoading(false);
      return;
    }

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
        console.error('Error fetching quiz:', err);
        setError(err.message || 'Lỗi tải câu hỏi quiz.');
        setLoading(false);
      });
  }, [isOpen, book.id, chapter.id, chapter.quizUrl, chapter.hasQuiz]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Mini Game Quiz • {book.title}
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
              Thử Thách: {chapter.title}
            </h4>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
              <p className="text-xs text-slate-500">Đang chuẩn bị bộ câu hỏi suy luận...</p>
            </div>
          ) : error ? (
            <div className="mx-auto max-w-md p-6 text-center my-12 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          ) : quiz ? (
            <QuizGame quiz={quiz} book={book} chapter={chapter} onClose={onClose} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
