import React, { useState } from 'react';
import { Quote, MessageSquarePlus, Check, X } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLORS } from '../../types/highlight';
import { useIsMobile } from '../../hooks/useIsMobile';

interface SelectionActionToolbarProps {
  position: { x: number; y: number };
  selectedText: string;
  onHighlight: (color: HighlightColor, note?: string) => void;
  onCopyQuote: () => void;
  onClose: () => void;
}

export const SelectionActionToolbar: React.FC<SelectionActionToolbarProps> = ({
  position,
  selectedText,
  onHighlight,
  onCopyQuote,
  onClose,
}) => {
  const isMobile = useIsMobile();
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');

  const handleColorClick = (color: HighlightColor) => {
    setSelectedColor(color);
    if (!isNoteInputOpen) {
      onHighlight(color);
    }
  };

  const handleSaveWithNote = (e: React.FormEvent) => {
    e.preventDefault();
    onHighlight(selectedColor, noteText.trim() || undefined);
  };

  // MOBILE: Floating Mini Dock (Zero backdrop, does NOT block Samsung One UI selection / clipboard)
  if (isMobile) {
    if (isNoteInputOpen) {
      return (
        <div
          data-selection-tooltip="true"
          data-no-search="true"
          className="fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-3 duration-200 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 flex flex-col gap-2.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Ghi chú đoạn trích
            </span>
            <button
              type="button"
              onClick={() => setIsNoteInputOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Color palette selector */}
          <div className="flex items-center gap-2">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedColor(c.id)}
                className={`h-6 w-6 rounded-full transition-transform active:scale-90 flex items-center justify-center ${
                  selectedColor === c.id ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 scale-105' : ''
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Màu ${c.name}`}
              >
                {selectedColor === c.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSaveWithNote} className="flex flex-col gap-2">
            <textarea
              rows={2}
              autoFocus
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Nhập ghi chú cho đoạn này..."
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Lưu highlight</span>
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div
        data-selection-tooltip="true"
        data-no-search="true"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 shadow-2xl rounded-full border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 max-w-[calc(100vw-32px)]"
      >
        {/* Color buttons palette */}
        <div className="flex items-center gap-1.5">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleColorClick(c.id)}
              className={`h-7 w-7 rounded-full transition-transform active:scale-90 flex items-center justify-center shadow-xs ${
                selectedColor === c.id
                  ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-105'
                  : ''
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Highlight màu ${c.name}`}
            >
              {selectedColor === c.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

        {/* Quick Note Toggle */}
        <button
          type="button"
          onClick={() => setIsNoteInputOpen(true)}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Thêm ghi chú"
        >
          <MessageSquarePlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Copy Citation button */}
        <button
          type="button"
          onClick={onCopyQuote}
          className="p-1.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Sao chép trích dẫn kèm nguồn sách"
        >
          <Quote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-0.5"
          title="Đóng thanh highlight"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // DESKTOP: Contextual Floating Popover
  return (
    <div
      data-selection-tooltip="true"
      data-no-search="true"
      className="fixed z-40 animate-in fade-in zoom-in-95 duration-150 shadow-2xl rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1.5 flex flex-col gap-1.5"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      <div className="flex items-center gap-1">
        {/* Color buttons palette */}
        <div className="flex items-center gap-1 px-1 py-0.5 border-r border-slate-200 dark:border-slate-800">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => handleColorClick(c.id)}
              className={`h-5 w-5 rounded-full transition-transform hover:scale-115 active:scale-95 flex items-center justify-center ${
                selectedColor === c.id ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : ''
              }`}
              style={{ backgroundColor: c.hex }}
              title={`Highlight màu ${c.name}`}
            >
              {selectedColor === c.id && <span className="h-1.5 w-1.5 rounded-full bg-slate-800/80" />}
            </button>
          ))}
        </div>

        {/* Quick Note Toggle */}
        <button
          onClick={() => setIsNoteInputOpen((prev) => !prev)}
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            isNoteInputOpen
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
          title="Thêm ghi chú đính kèm đoạn trích"
        >
          <MessageSquarePlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xs:inline">Ghi chú</span>
        </button>

        {/* Copy Citation button */}
        <button
          onClick={onCopyQuote}
          className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          title="Sao chép trích dẫn kèm nguồn sách"
        >
          <Quote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xs:inline">Sao chép</span>
        </button>
      </div>

      {/* Note input expander */}
      {isNoteInputOpen && (
        <form onSubmit={handleSaveWithNote} className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          <input
            type="text"
            autoFocus
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Nhập ghi chú cho đoạn này..."
            className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
              Đang chọn: {HIGHLIGHT_COLORS.find((c) => c.id === selectedColor)?.name}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsNoteInputOpen(false)}
                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 text-[11px] font-semibold transition-colors shadow-xs"
              >
                <Check className="h-3 w-3" />
                <span>Lưu highlight</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
