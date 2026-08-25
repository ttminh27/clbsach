import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Clock, ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { useHistory } from '../../context/HistoryContext';
import booksData from '../../data/books-manifest.json';
import { Book } from '../../types/book';

const books: Book[] = booksData as Book[];

export const HistoryBanner: React.FC = () => {
  const { getRecentBookProgress } = useHistory();
  const recentProgress = getRecentBookProgress();

  if (!recentProgress) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/10 mb-10">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Chào mừng bạn đến với CLB đọc sách
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Khám phá kho tàng tri thức & bài tập rèn luyện
          </h2>
          <p className="mt-2 text-sm text-white/85 leading-relaxed">
            Đọc và làm Quiz tương tác các tuyệt phẩm: <strong className="text-white">"Đời Ngắn Đừng Ngủ Dài"</strong>, <strong className="text-white">"Sức Mạnh Của Thói Quen"</strong>, <strong className="text-white">"Search Inside Yourself"</strong> cùng 28 bài tập Audio chánh niệm.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#book-catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              Khám Phá Toàn Bộ Thư Viện
            </a>
          </div>
        </div>
      </div>
    );
  }

  const book = books.find((b) => b.id === recentProgress.bookId);
  const chapter = book?.chapters.find((c) => c.id === recentProgress.lastChapterId);

  const formattedTime = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(recentProgress.lastReadAt));

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 mb-10 border border-slate-700/50">
      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-800 shadow-md border border-white/10 hidden sm:block">
            {book?.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-emerald-700 flex items-center justify-center font-bold text-xs">
                {book?.title.slice(0, 3)}
              </div>
            )}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-2">
              <Bookmark className="h-3 w-3" />
              Đang đọc dở • Lần cuối lúc {formattedTime}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {book?.title || recentProgress.bookTitle}
            </h3>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-1.5">
              <span className="font-medium text-emerald-400">
                {chapter ? chapter.title : recentProgress.lastChapterTitle}
              </span>
            </p>

            <div className="mt-3 flex items-center gap-3 max-w-md">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(
                      5,
                      book?.totalChapters
                        ? Math.round(((recentProgress.completedChapterIds?.length || 1) / book.totalChapters) * 100)
                        : 20
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-xs font-medium text-slate-300 shrink-0">
                {recentProgress.completedChapterIds?.length || 1}/{book?.totalChapters || 17} chương
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/reader/${recentProgress.bookId}/${recentProgress.lastChapterId}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 w-full sm:w-auto"
          >
            <BookOpen className="h-4 w-4" />
            Đọc Tiếp Ngay
            <ArrowRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
