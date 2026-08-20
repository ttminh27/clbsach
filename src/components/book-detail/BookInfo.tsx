import React from 'react';
import { Book } from '../../types/book';
import { Info, Award, User, BookOpen, Quote } from 'lucide-react';

interface BookInfoProps {
  book: Book;
}

export const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 sm:p-8">
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          Về Tác Phẩm
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {book.description}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <User className="h-4 w-4 text-emerald-500" />
            Tác Giả
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {book.author}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kỹ sư Jolly Good Fellow kỳ cựu của Google và là người sáng lập phong trào Search Inside Yourself.
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Award className="h-4 w-4 text-teal-500" />
            Thể Loại & Chủ Đề
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {book.category}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags.map((t, idx) => (
              <span
                key={idx}
                className="rounded bg-white dark:bg-slate-700 px-2 py-0.5 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 p-5">
        <div className="flex items-start gap-3">
          <Quote className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 italic leading-relaxed">
            "Cuốn sách này và khóa học tại Google đại diện cho một trong những khía cạnh tuyệt vời nhất của văn hóa doanh nghiệp hiện đại: sự kết hợp hoàn hảo giữa khoa học não bộ, tâm lý học và thiền chánh niệm."
          </div>
        </div>
      </div>
    </div>
  );
};
