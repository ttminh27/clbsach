import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Book, Chapter } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';

interface ChapterNavigationProps {
  book: Book;
  currentChapter: Chapter;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({ book, currentChapter }) => {
  const { markChapterCompleted, getProgressForBook } = useHistory();
  const progress = getProgressForBook(book.id);

  const currentIndex = book.chapters.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;

  const isCompleted = progress?.completedChapterIds?.includes(currentChapter.id);

  const handleMarkComplete = () => {
    markChapterCompleted(book.id, currentChapter.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.85 },
      colors: ['#10b981', '#14b8a6', '#06b6d4', '#f59e0b'],
    });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 border-t border-slate-200 dark:border-slate-800">
      {/* Mark Completed Button */}
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 text-center mb-8">
        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">
          Bạn vừa đọc xong chương này?
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
          Đánh dấu hoàn thành để cập nhật tiến độ đọc và lưu mốc hành trình.
        </p>

        <button
          onClick={handleMarkComplete}
          className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-all shadow-md active:scale-95 ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20 hover:scale-105'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCompleted ? '✓ Đã hoàn thành chương này' : 'Đánh dấu đã hoàn thành'}
        </button>
      </div>

      {/* Prev / Next chapter navigation */}
      <div className="grid sm:grid-cols-2 gap-4">
        {prevChapter ? (
          <Link
            to={`/reader/${book.id}/${prevChapter.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-left hover:border-emerald-400 dark:border-slate-800 dark:bg-slate-900 hover:shadow-md transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-emerald-100 dark:bg-slate-800 text-slate-600 group-hover:text-emerald-600 transition-colors">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Chương trước
              </p>
              <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate mt-0.5 group-hover:text-emerald-600">
                {prevChapter.title}
              </h5>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block"></div>
        )}

        {nextChapter ? (
          <Link
            to={`/reader/${book.id}/${nextChapter.id}`}
            className="group flex items-center justify-between rounded-2xl border border-emerald-500/60 bg-emerald-50/40 p-4 text-right hover:border-emerald-500 dark:border-emerald-900/60 dark:bg-emerald-950/20 hover:shadow-md transition-all"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Chương tiếp theo
              </p>
              <h5 className="font-semibold text-xs text-slate-900 dark:text-white truncate mt-0.5 group-hover:text-emerald-600">
                {nextChapter.title}
              </h5>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ml-3">
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-center p-4 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            🎉 Bạn đã đọc đến chương cuối cùng của cuốn sách!
          </div>
        )}
      </div>
    </div>
  );
};
