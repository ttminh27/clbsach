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
        return 'max-w-2xl';
      case 'wide':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-6xl';
      case 'medium':
      default:
        return 'max-w-3xl';
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
    <div className={`mx-auto ${getMaxWidthClass()} px-4 sm:px-8 py-8 border-t border-slate-200 dark:border-slate-800 transition-all duration-200 space-y-4`}>
      {/* TIER 1: Interaction & Progress Status (Hoàn thành chương & Game Quiz) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
        {/* Hoàn thành status / button */}
        <button
          onClick={handleMarkComplete}
          className={`group flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all active:scale-98 cursor-pointer ${
            isCompleted
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs'
              : 'border-slate-200 dark:border-slate-800 bg-white hover:border-emerald-300 dark:bg-slate-900 hover:bg-emerald-50/30 dark:hover:bg-slate-800/80 shadow-2xs'
          }`}
          title={isCompleted ? 'Bạn đã đánh dấu hoàn thành chương này' : 'Bấm để đánh dấu hoàn thành chương'}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
              isCompleted
                ? 'bg-emerald-600 text-white shadow-xs group-hover:scale-105'
                : 'bg-slate-100 group-hover:bg-emerald-100 dark:bg-slate-800 text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p
                className={`text-sm font-bold truncate ${
                  isCompleted
                    ? 'text-emerald-800 dark:text-emerald-200'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                }`}
              >
                {isCompleted ? 'Đã hoàn thành chương' : 'Đánh dấu đã đọc'}
              </p>
              {isCompleted && (
                <span className="shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  Đã lưu
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isCompleted ? 'Bấm để ăn mừng lại tiến độ 🎉' : 'Lưu tiến độ đọc vào hồ sơ của bạn'}
            </p>
          </div>
        </button>

        {/* Game Quiz */}
        {onOpenQuiz ? (
          <button
            onClick={onOpenQuiz}
            className="group flex items-center gap-3.5 rounded-2xl border border-amber-200 hover:border-amber-300 dark:border-amber-900/50 bg-amber-50/40 hover:bg-amber-50/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 p-3.5 text-left transition-all active:scale-98 cursor-pointer shadow-2xs"
            title="Mở Mini Game / Quiz thử thách kiến thức"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Thử thách Quiz
                </span>
                {quizResult && (
                  <span className="inline-flex items-center text-[10px] bg-amber-200/90 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
                    {quizResult.score}/{quizResult.totalQuestions} điểm
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5 truncate">
                {quizResult ? 'Bấm để thử thách lại kiến thức' : 'Kiểm tra độ hiểu nội dung chương này'}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/50 bg-slate-50/40 dark:border-slate-800/40 dark:bg-slate-900/20 p-3.5 text-left opacity-40 select-none">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-400">Quiz chưa sẵn sàng</p>
              <p className="text-xs text-slate-400 mt-0.5">Chương này chưa có bộ câu hỏi</p>
            </div>
          </div>
        )}
      </div>

      {/* TIER 2: Clear Chapter Navigation (Chương trước / Chương sau) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* 1. Chương trước */}
        {prevChapter ? (
          <Link
            to={`/reader/${book.id}/${prevChapter.id}`}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all active:scale-98"
            title={`Chương trước: ${prevChapter.title}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700 group-hover:-translate-x-0.5 transition-all">
              <ArrowLeft className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Chương trước
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {prevChapter.title}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/40 bg-slate-50/40 dark:border-slate-800/30 dark:bg-slate-900/20 p-3.5 opacity-40 cursor-not-allowed select-none">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-400">
              <ArrowLeft className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Đầu sách
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-400">
                Đây là chương đầu tiên
              </p>
            </div>
          </div>
        )}

        {/* 2. Chương sau - Primary Call to Action */}
        {nextChapter ? (
          <Link
            to={`/reader/${book.id}/${nextChapter.id}`}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3.5 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all active:scale-98"
            title={`Chương sau: ${nextChapter.title}`}
          >
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100/90">
                Chương tiếp theo
              </p>
              <p className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {nextChapter.title}
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white group-hover:translate-x-0.5 transition-transform backdrop-blur-xs">
              <ArrowRight className="h-4.5 w-4.5" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/40 bg-slate-50/40 dark:border-slate-800/30 dark:bg-slate-900/20 p-3.5 opacity-40 cursor-not-allowed select-none">
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Hết sách
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-400">
                Bạn đã đến chương cuối cùng
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200/50 dark:bg-slate-800/50 text-slate-400">
              <ArrowRight className="h-4.5 w-4.5" />
            </div>
          </div>
        )}
      </div>

      {/* TIER 3: Quick Navigation Footer Links */}
      <div className="pt-2 flex items-center justify-between text-xs px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          title="Quay về Trang chủ"
        >
          <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Về Trang chủ</span>
        </Link>
        <Link
          to={`/book/${book.id}`}
          className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
          title="Xem mục lục và thông tin tác phẩm"
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Mục lục & Chi tiết sách</span>
        </Link>
      </div>
    </div>
  );
};
