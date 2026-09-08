import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Gamepad2, Home, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Book, Chapter } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useQuiz } from '../../context/QuizContext';
import { useReaderSettings } from '../../context/ReaderSettingsContext';

interface ChapterNavigationProps {
  book: Book;
  currentChapter: Chapter;
  onOpenQuiz?: () => void;
}

export const ChapterNavigation: React.FC<ChapterNavigationProps> = ({
  book,
  currentChapter,
  onOpenQuiz,
}) => {
  const { settings } = useReaderSettings();
  const { markChapterCompleted, getProgressForBook } = useHistory();
  const { getQuizResult } = useQuiz();
  const progress = getProgressForBook(book.id);
  const quizResult = getQuizResult(book.id, currentChapter.id);

  const currentIndex = book.chapters.findIndex((c) => c.id === currentChapter.id);
  const prevChapter = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;

  const isCompleted = progress?.completedChapterIds?.includes(currentChapter.id);

  const getMaxWidthClass = () => {
    switch (settings.maxWidth) {
      case 'narrow':
        return 'max-w-3xl';
      case 'wide':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-7xl';
      case 'medium':
      default:
        return 'max-w-5xl';
    }
  };

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
    <div className={`mx-auto ${getMaxWidthClass()} px-4 sm:px-8 py-8 border-t border-slate-200 dark:border-slate-800 transition-all duration-200`}>
      {/* 4 Buttons in a single row: Chương trước | Hoàn thành | Game | Chương sau */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 items-stretch">
        {/* 1. Chương trước */}
        {prevChapter ? (
          <Link
            to={`/reader/${book.id}/${prevChapter.id}`}
            className="group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3.5 text-center sm:text-left hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80 hover:shadow-xs transition-all active:scale-98"
            title={`Chương trước: ${prevChapter.title}`}
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate">
                Chương trước
              </p>
              <p className="hidden lg:block text-[11px] text-slate-400 truncate mt-0.5 max-w-[120px]">
                {prevChapter.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/30 p-2.5 sm:p-3.5 text-center sm:text-left opacity-40 cursor-not-allowed select-none">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-400">
              <ArrowLeft className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-400 truncate">
                Chương trước
              </p>
            </div>
          </div>
        )}

        {/* 2. Hoàn thành */}
        <button
          onClick={handleMarkComplete}
          className={`group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-2xl border p-2.5 sm:p-3.5 text-center sm:text-left hover:shadow-xs transition-all active:scale-95 cursor-pointer ${
            isCompleted
              ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30'
              : 'border-slate-200/90 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/80'
          }`}
          title={isCompleted ? 'Đã hoàn thành chương này' : 'Đánh dấu hoàn thành chương này'}
        >
          <div
            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-all ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs group-hover:scale-105'
                : 'bg-slate-100 group-hover:bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </div>
          <div className="min-w-0">
            <p
              className={`text-xs sm:text-sm font-semibold truncate ${
                isCompleted
                  ? 'text-emerald-800 dark:text-emerald-200 font-bold'
                  : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              {isCompleted ? 'Đã hoàn thành' : 'Hoàn thành'}
            </p>
            <p
              className={`hidden lg:block text-[11px] truncate mt-0.5 ${
                isCompleted
                  ? 'text-emerald-600/80 dark:text-emerald-400/80'
                  : 'text-slate-400'
              }`}
            >
              {isCompleted ? 'Đã lưu tiến độ' : 'Đánh dấu đã đọc'}
            </p>
          </div>
        </button>

        {/* 3. Game */}
        {onOpenQuiz ? (
          <button
            onClick={onOpenQuiz}
            className="group flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-2xl border border-amber-200/90 hover:border-amber-300 dark:border-amber-900/50 bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 p-2.5 sm:p-3.5 text-center sm:text-left hover:shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Mở Mini Game / Quiz thử thách kiến thức"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                <span className="text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-200">
                  Game Quiz
                </span>
                {quizResult && (
                  <span className="inline-flex items-center text-[10px] bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded font-semibold">
                    {quizResult.score}/{quizResult.totalQuestions}
                  </span>
                )}
              </div>
              <p className="hidden lg:block text-[11px] text-amber-600/80 dark:text-amber-400/80 truncate mt-0.5">
                {quizResult ? 'Làm lại Quiz' : 'Thử thách Quiz'}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/30 p-2.5 sm:p-3.5 text-center sm:text-left opacity-40 cursor-not-allowed select-none">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-400">
              <Gamepad2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-slate-400 truncate">
                Game
              </p>
            </div>
          </div>
        )}

        {/* 4. Chương sau - Primary Hero Action */}
        {nextChapter ? (
          <Link
            to={`/reader/${book.id}/${nextChapter.id}`}
            className="group flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-2.5 sm:p-3.5 text-center sm:text-right shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 transition-all active:scale-95"
            title={`Chương sau: ${nextChapter.title}`}
          >
            <div className="min-w-0 order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                Chương sau
              </p>
              <p className="hidden lg:block text-[11px] text-emerald-100/90 truncate mt-0.5 max-w-[120px]">
                {nextChapter.title}
              </p>
            </div>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white order-1 sm:order-2 group-hover:translate-x-0.5 transition-transform backdrop-blur-xs">
              <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </Link>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-3 rounded-2xl border border-slate-200/50 bg-slate-50/50 dark:border-slate-800/40 dark:bg-slate-900/30 p-2.5 sm:p-3.5 text-center sm:text-right opacity-40 cursor-not-allowed select-none">
            <div className="min-w-0 order-2 sm:order-1">
              <p className="text-xs sm:text-sm font-semibold text-slate-400 truncate">
                Hết sách
              </p>
            </div>
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 order-1 sm:order-2">
              <ArrowRight className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation Footer Links - clean & integrated */}
      <div className="mt-5 flex items-center justify-between text-xs px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors font-medium"
          title="Quay về Trang chủ"
        >
          <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Về Trang chủ</span>
        </Link>
        <Link
          to={`/book/${book.id}`}
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors font-medium"
          title="Xem mục lục và thông tin tác phẩm"
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Mục lục & Chi tiết sách</span>
        </Link>
      </div>
    </div>
  );
};
