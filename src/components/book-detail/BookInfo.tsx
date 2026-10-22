import React from 'react';
import { Book } from '../../types/book';
import { Award, User, BookOpen, Quote, FileText, Download, ExternalLink } from 'lucide-react';

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

      {book.rawPdf && (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400 shadow-xs">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Sách Gốc Nguyên Bản (Raw PDF)</span>
                  <span className="rounded-md bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                    {book.rawPdf.formattedSize}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Bản in scan/PDF gốc của cuốn sách <strong>"{book.title}"</strong>. Độc giả có thể mở đọc trực tiếp hoặc tải về máy để đối chiếu nguyên bản, xem hình minh họa và sơ đồ gốc.
                </p>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                  Tập tin: {book.rawPdf.fileName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:shrink-0 pt-2 sm:pt-0">
              <a
                href={book.rawPdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm hover:scale-105 active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Mở Xem Trực Tiếp</span>
              </a>
              <a
                href={book.rawPdf.url}
                download={book.rawPdf.fileName}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 px-4 py-2.5 text-xs font-bold transition-all shadow-xs"
                title={`Tải xuống ${book.rawPdf.fileName}`}
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Tải Về Máy</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <User className="h-4 w-4 text-emerald-500" />
            Tác Giả
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-white">
            {book.author}
          </div>
          {book.authorBio && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {book.authorBio}
            </p>
          )}
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

      {book.quote && (
        <div className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 p-5">
          <div className="flex items-start gap-3">
            <Quote className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 italic leading-relaxed">
              "{book.quote}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
