import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, BookOpen, Clock, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import booksData from '../data/books-manifest.json';
import { Book } from '../types/book';

const books: Book[] = booksData as Book[];

export const HistoryPage: React.FC = () => {
  const { history, clearHistoryForBook, clearAllHistory } = useHistory();
  const historyList = Object.values(history).sort((a, b) => b.lastReadAt - a.lastReadAt);

  useEffect(() => {
    document.title = 'Lịch Sử & Tiến Độ Đọc | CLB đọc sách';
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Lịch Sử & Tiến Độ Đọc
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ghi nhớ tự động các chương bạn đã và đang đọc dở trên thiết bị này.
          </p>
        </div>

        {historyList.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc?')) {
                clearAllHistory();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa Lịch Sử
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            Chưa có lịch sử đọc nào
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Hãy bắt đầu mở một tựa sách trong Thư viện để trải nghiệm đọc!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md"
          >
            <BookOpen className="h-4 w-4" />
            Khám Phá Thư Viện
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => {
            const book = books.find((b) => b.id === item.bookId);
            const formattedDate = new Intl.DateTimeFormat('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }).format(new Date(item.lastReadAt));

            const totalChapters = book?.totalChapters || 17;
            const completedCount = item.completedChapterIds?.length || 0;
            const percent = Math.round((completedCount / totalChapters) * 100);

            return (
              <div
                key={item.bookId}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm">
                    {book?.coverUrl ? (
                      <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
                        {book?.title.slice(0, 3)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {book?.title || item.bookTitle}
                    </h3>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium truncate mt-0.5">
                      Đang đọc: {item.lastChapterTitle}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Đọc lần cuối: {formattedDate}</span>
                      <span>•</span>
                      <span>{completedCount}/{totalChapters} chương ({percent}%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => clearHistoryForBook(item.bookId)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Xóa sách này khỏi lịch sử"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link
                    to={`/reader/${item.bookId}/${item.lastChapterId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    Đọc Tiếp
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
