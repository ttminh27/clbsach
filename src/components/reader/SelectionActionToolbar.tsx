import React, { useState } from 'react';
import { Highlighter, Quote, MessageSquarePlus, Check } from 'lucide-react';
import { HighlightColor, HIGHLIGHT_COLORS } from '../../types/highlight';

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
