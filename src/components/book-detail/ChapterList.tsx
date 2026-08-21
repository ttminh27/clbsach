import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle2, ChevronRight, Sparkles, Trophy } from 'lucide-react';
import { Book, Chapter } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useQuiz } from '../../context/QuizContext';

interface ChapterListProps {
  book: Book;
}

export const ChapterList: React.FC<ChapterListProps> = ({ book }) => {
  const { getProgressForBook } = useHistory();
  const { getQuizResult } = useQuiz();
  const progress = getProgressForBook(book.id);
  const completedSet = new Set(progress?.completedChapterIds || []);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Danh Sách Các Chương
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Tổng cộng {book.chapters.length} phần
        </span>
      </div>

      <div className="grid gap-2.5">
        {book.chapters.map((chapter, index) => {
          const isCompleted = completedSet.has(chapter.id);
          const isCurrent = progress?.lastChapterId === chapter.id;
          const quizResult = getQuizResult(book.id, chapter.id);

          return (
            <Link
              key={chapter.id}
              to={`/reader/${book.id}/${chapter.id}`}
              className={`group flex items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                isCurrent
                  ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500/60 dark:bg-emerald-950/20 shadow-xs'
                  : isCompleted
                  ? 'border-slate-200/60 bg-white/70 dark:border-slate-800/60 dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-800'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Index badge */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : isCurrent
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`font-semibold text-sm truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {chapter.title}
                    </h4>
                    {isCurrent && (
                      <span className="shrink-0 rounded bg-emerald-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                        Đang đọc
                      </span>
                    )}
                  </div>
                  {chapter.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {chapter.subtitle}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{chapter.readingTimeMin} phút đọc
                    </span>
                    <span>•</span>
                    <span>{chapter.wordCount.toLocaleString()} từ</span>
                    {chapter.hasQuiz && (
                      <>
                        <span>•</span>
                        {quizResult ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            Quiz: {quizResult.score}/{quizResult.totalQuestions}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-950/40 px-1.5 py-0.2 rounded">
                            <Sparkles className="h-3 w-3" />
                            Quiz {chapter.totalQuestions || 15} câu
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-4 shrink-0">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                  Đọc ngay
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
