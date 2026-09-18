import React, { useState } from 'react';
import { Trash2, Quote, Check, X, Edit3, MessageSquare } from 'lucide-react';
import { TextHighlight, HighlightColor, HIGHLIGHT_COLORS } from '../../types/highlight';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ActiveHighlightPopoverProps {
  highlight: TextHighlight;
  position: { x: number; y: number };
  onUpdateColor: (color: HighlightColor) => void;
  onUpdateNote: (note: string) => void;
  onDelete: () => void;
  onCopyQuote: () => void;
  onClose: () => void;
}

export const ActiveHighlightPopover: React.FC<ActiveHighlightPopoverProps> = ({
  highlight,
  position,
  onUpdateColor,
  onUpdateNote,
  onDelete,
  onCopyQuote,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState(highlight.note || '');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNote(noteContent.trim());
    setIsEditingNote(false);
  };

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(highlight.createdAt));

  // MOBILE: Floating Card (Zero backdrop, non-blocking)
  if (isMobile) {
    return (
      <div
        data-highlight-popover="true"
        data-no-search="true"
        className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-200 shadow-2xl rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 flex flex-col gap-2"
      >
        {/* Header with date & close button */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Đã lưu {formattedDate}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quote Preview */}
        <div
          className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2 border-l-4 text-xs italic text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed"
          style={{
            borderLeftColor: HIGHLIGHT_COLORS.find((c) => c.id === highlight.color)?.hex || '#fef08a',
          }}
        >
          “{highlight.text}”
        </div>

        {/* Color Switcher */}
        <div className="flex items-center justify-between py-0.5">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Đổi màu:</span>
          <div className="flex items-center gap-2">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onUpdateColor(c.id)}
                className={`h-7 w-7 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-xs ${
                  highlight.color === c.id
                    ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-105'
                    : ''
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Đổi sang màu ${c.name}`}
              >
                {highlight.color === c.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />}
              </button>
            ))}
          </div>
        </div>

        {/* Note view or edit */}
        {isEditingNote ? (
          <form onSubmit={handleSaveNote} className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <textarea
              autoFocus
              rows={2}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Viết ghi chú cá nhân..."
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Lưu ghi chú</span>
              </button>
            </div>
          </form>
        ) : highlight.note ? (
          <div
            onClick={() => setIsEditingNote(true)}
            className="cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 p-2 text-xs text-slate-700 dark:text-slate-300 relative hover:border-emerald-500/40 transition-colors"
            title="Bấm để sửa ghi chú"
          >
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <p className="flex-1 break-words line-clamp-3 text-xs leading-relaxed">{highlight.note}</p>
              <Edit3 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingNote(true)}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline py-0.5 font-medium"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Thêm ghi chú cá nhân</span>
          </button>
        )}

        {/* Action buttons footer */}
        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCopyQuote}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800/80 dark:hover:bg-slate-800 transition-colors"
            title="Sao chép trích dẫn kèm nguồn"
          >
            <Quote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Sao chép</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 transition-colors"
            title="Bỏ highlight đoạn này"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Xóa highlight</span>
          </button>
        </div>
      </div>
    );
  }

  // DESKTOP: Contextual Floating Popover
  return (
    <div
      data-highlight-popover="true"
      data-no-search="true"
      className="fixed z-50 animate-in fade-in zoom-in-95 duration-150 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 flex flex-col gap-2 w-72 max-w-[calc(100vw-24px)]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header with date & close button */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Đã lưu {formattedDate}
        </span>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Đóng"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Color switcher */}
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Màu sắc:</span>
        <div className="flex items-center gap-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => onUpdateColor(c.id)}
              className={`h-5 w-5 rounded-full transition-transform hover:scale-115 active:scale-95 flex items-center justify-center ${
                highlight.color === c.id ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Đổi sang màu ${c.name}`}
            >
              {highlight.color === c.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />}
            </button>
          ))}
        </div>
      </div>

      {/* Note view or edit */}
      {isEditingNote ? (
        <form onSubmit={handleSaveNote} className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <textarea
            autoFocus
            rows={2}
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Viết ghi chú của bạn..."
            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
          />
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsEditingNote(false)}
              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors shadow-xs"
            >
              <Check className="h-3 w-3" />
              <span>Lưu</span>
            </button>
          </div>
        </form>
      ) : highlight.note ? (
        <div
          onClick={() => setIsEditingNote(true)}
          className="group cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 p-2 text-xs text-slate-700 dark:text-slate-300 relative hover:border-emerald-500/40 transition-colors"
          title="Bấm để sửa ghi chú"
        >
          <div className="flex items-start gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <p className="flex-1 break-words line-clamp-3 text-[11px] leading-relaxed">{highlight.note}</p>
            <Edit3 className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsEditingNote(true)}
          className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline py-0.5 font-medium"
        >
          <Edit3 className="h-3.5 w-3.5" />
          <span>Thêm ghi chú cá nhân</span>
        </button>
      )}

      {/* Action buttons footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onCopyQuote}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Sao chép trích dẫn kèm nguồn"
        >
          <Quote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Sao chép</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Bỏ highlight đoạn này"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xóa highlight</span>
        </button>
      </div>
    </div>
  );
};
