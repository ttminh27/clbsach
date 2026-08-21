import React from 'react';
import { Sparkles, Trophy, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Book, Chapter } from '../../types/book';
import { useQuiz } from '../../context/QuizContext';

interface ChapterQuizBannerProps {
  book: Book;
  chapter: Chapter;
  onOpenQuiz: () => void;
}

export const ChapterQuizBanner: React.FC<ChapterQuizBannerProps> = ({
  book,
  chapter,
  onOpenQuiz,
}) => {
  const { getQuizResult } = useQuiz();
  const result = getQuizResult(book.id, chapter.id);

  const totalQuestions = chapter.totalQuestions || 15;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-900/30 p-6 sm:p-7 shadow-sm transition-all hover:border-emerald-500/50 mb-8">
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            {result ? <Trophy className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Mini Game • Kiểm tra kiến thức
              </span>
              {result && (
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  Điểm: {result.score}/{result.totalQuestions} ({result.percent}%)
                </span>
              )}
            </div>

            <h4 className="font-bold text-base text-slate-900 dark:text-white">
              Thử Thách Suy Luận: {chapter.title}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-lg">
              {result
                ? `Bạn đã hoàn thành thử thách này với ${result.score}/${result.totalQuestions} câu đúng. Bạn có muốn thử lại để đạt điểm tuyệt đối?`
                : `Bộ 15 câu hỏi tình huống & suy luận giúp bạn khắc sâu nguyên lý và bài học cốt lõi từ chương sách vừa đọc.`}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <button
            onClick={onOpenQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all"
          >
            <span>{result ? 'Làm lại thử thách' : 'Bắt đầu Quiz ngay'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
