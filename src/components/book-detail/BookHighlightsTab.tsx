import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Highlighter, Copy, Check, Trash2, ArrowRight, MessageSquare, BookOpen } from 'lucide-react';
import { Book } from '../../types/book';
import { useHighlights } from '../../context/HighlightContext';
import { HIGHLIGHT_COLORS, TextHighlight } from '../../types/highlight';
import { copyToClipboard } from '../../utils/clipboard';

interface BookHighlightsTabProps {
  book: Book;
}

export const BookHighlightsTab: React.FC<BookHighlightsTabProps> = ({ book }) => {
  const { getHighlightsForBook, deleteHighlight } = useHighlights();
  const highlights = getHighlightsForBook(book.id);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopySingle = async (hl: TextHighlight) => {
    const chTitle = hl.chapterTitle || 'Chương sách';
    const citation = `"${hl.text}"\n\n— Trích từ: "${chTitle}", sách "${book.title}"`;
    const ok = await copyToClipboard(citation);
    if (ok) {
      setCopiedId(hl.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    if (highlights.length === 0) return;

    const formatted = highlights
      .map((h, i) => {
        const dateStr = new Date(h.createdAt).toLocaleDateString('vi-VN');
        const chTitle = h.chapterTitle || 'Chương sách';
        const notePart = h.note ? `\n> *Ghi chú: ${h.note}*` : '';
        return `### ${i + 1}. ${chTitle} (${dateStr})\n> "${h.text}"${notePart}\n`;
      })
      .join('\n---\n\n');

    const fullExport = `# Các Đoạn Trích Nổi Bật - ${book.title}\n\n${formatted}\n\n*Xuất từ CLB Đọc Sách*`;
    const ok = await copyToClipboard(fullExport);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  if (highlights.length === 0) {
    const firstChapter = book.chapters[0];
    return (
      <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-12 text-center shadow-xs">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-4">
          <Highlighter className="h-7 w-7" />
        </div>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
          Chưa có đoạn highlight nào trong cuốn sách này
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 max-w-md mx-auto leading-relaxed">
          Khi đọc bất kỳ chương sách nào, bạn chỉ cần dùng chuột hoặc ngón tay bôi đen đoạn văn bản tâm đắc để lưu lại vào đây!
        </p>
        {firstChapter && (
          <Link
            to={`/reader/${book.id}/${firstChapter.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Bắt đầu đọc sách
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bạn đã lưu <strong className="text-slate-800 dark:text-slate-200 font-semibold">{highlights.length}</strong> đoạn trích tâm đắc từ cuốn sách này
        </p>
        <button
          onClick={handleCopyAll}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          {copiedAll ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Đã chép tất cả!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Sao chép tất cả</span>
            </>
          )}
        </button>
      </div>

      {/* Highlights List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((hl) => {
          const colorObj = HIGHLIGHT_COLORS.find((c) => c.id === hl.color) || HIGHLIGHT_COLORS[0];
          const dateStr = new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(new Date(hl.createdAt));

          return (
            <div
              key={hl.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-2.5">
                {/* Header: Chapter title & date */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: colorObj.hex }} />
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]">
                      {hl.chapterTitle || 'Chương sách'}
                    </span>
                  </div>
                  <span>{dateStr}</span>
                </div>

                {/* Quote text */}
                <blockquote
                  className="border-l-3 pl-3.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic"
                  style={{ borderColor: colorObj.hex }}
                >
                  "{hl.text}"
                </blockquote>

                {/* Note if present */}
                {hl.note && (
                  <div className="flex items-start gap-1.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl p-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <span className="flex-1 break-words">{hl.note}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  to={`/reader/${book.id}/${hl.chapterId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <span>Mở chương đọc</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopySingle(hl)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    title="Sao chép trích dẫn này"
                  >
                    {copiedId === hl.id ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Bạn có chắc muốn xóa đoạn highlight này?')) {
                        deleteHighlight(hl.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Xóa highlight"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
