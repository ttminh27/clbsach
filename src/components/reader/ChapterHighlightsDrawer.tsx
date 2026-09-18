import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Highlighter,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { TextHighlight, HighlightColor, HIGHLIGHT_COLORS } from '../../types/highlight';
import { copyToClipboard } from '../../utils/clipboard';
import { scrollToHighlight } from '../../utils/chapterHighlight';

interface ChapterHighlightsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
  currentChapterId: string;
  currentChapterTitle: string;
  chapterHighlights: TextHighlight[];
  bookHighlights: TextHighlight[];
  onDeleteHighlight: (id: string) => void;
  onToast?: (msg: string) => void;
}

export const ChapterHighlightsDrawer: React.FC<ChapterHighlightsDrawerProps> = ({
  isOpen,
  onClose,
  bookId,
  bookTitle,
  currentChapterId,
  currentChapterTitle,
  chapterHighlights,
  bookHighlights,
  onDeleteHighlight,
  onToast,
}) => {
  const navigate = useNavigate();
  const [scope, setScope] = useState<'chapter' | 'book'>('chapter');
  const [selectedColor, setSelectedColor] = useState<HighlightColor | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  // Filter list by scope, color, and search query
  const displayedHighlights = useMemo(() => {
    const list = scope === 'chapter' ? chapterHighlights : bookHighlights;
    return list
      .filter((h) => {
        if (selectedColor !== 'all' && h.color !== selectedColor) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = h.text.toLowerCase().includes(q);
          const matchNote = h.note ? h.note.toLowerCase().includes(q) : false;
          return matchText || matchNote;
        }
        return true;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [scope, chapterHighlights, bookHighlights, selectedColor, searchQuery]);

  // Jump to highlight position
  const handleJumpToHighlight = (hl: TextHighlight) => {
    const cleanCurrent = currentChapterId.replace(/\.md$/i, '');
    const cleanTarget = hl.chapterId.replace(/\.md$/i, '');

    if (cleanCurrent === cleanTarget) {
      const found = scrollToHighlight(hl.id);
      if (found) {
        onClose();
        onToast?.('Đã cuộn đến đoạn highlight!');
      } else {
        onToast?.('Đoạn văn này đang ở vị trí xa hoặc chưa hiển thị.');
      }
    } else {
      // Navigate to another chapter
      onClose();
      navigate(`/reader/${bookId}/${cleanTarget}`);
      // Wait for navigation and DOM render
      setTimeout(() => {
        scrollToHighlight(hl.id);
      }, 600);
    }
  };

  // Copy single quote
  const handleCopySingle = async (hl: TextHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    const chTitle = hl.chapterTitle || currentChapterTitle;
    const citation = `"${hl.text}"\n\n— Trích từ: "${chTitle}", sách "${bookTitle}"`;
    const ok = await copyToClipboard(citation);
    if (ok) {
      setCopiedItemId(hl.id);
      onToast?.('Đã sao chép đoạn trích dẫn!');
      setTimeout(() => setCopiedItemId(null), 2000);
    }
  };

  // Copy all visible highlights formatted as Markdown
  const handleCopyAll = async () => {
    if (displayedHighlights.length === 0) return;

    const formatted = displayedHighlights
      .map((h, i) => {
        const dateStr = new Date(h.createdAt).toLocaleDateString('vi-VN');
        const chTitle = h.chapterTitle || currentChapterTitle;
        const notePart = h.note ? `\n> *Ghi chú: ${h.note}*` : '';
        return `### ${i + 1}. ${chTitle} (${dateStr})\n> "${h.text}"${notePart}\n`;
      })
      .join('\n---\n\n');

    const fullExport = `# Các Đoạn Trích Nổi Bật - ${bookTitle}\n\n${formatted}\n\n*Xuất từ CLB Đọc Sách*`;
    const ok = await copyToClipboard(fullExport);
    if (ok) {
      setCopiedAll(true);
      onToast?.(`Đã sao chép toàn bộ ${displayedHighlights.length} đoạn highlight!`);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md md:max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Highlighter className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  Đoạn Trích Nổi Bật
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                  {bookTitle}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Đóng ngăn kéo"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scope Selector Tabs */}
          <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl w-full">
              <button
                onClick={() => setScope('chapter')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  scope === 'chapter'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Chương này ({chapterHighlights.length})
              </button>
              <button
                onClick={() => setScope('book')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  scope === 'book'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Cả cuốn sách ({bookHighlights.length})
              </button>
            </div>
          </div>

          {/* Search and Color Filter Bar */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 space-y-2.5">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm trong các câu trích dẫn & ghi chú..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Color chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                onClick={() => setSelectedColor('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                  selectedColor === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả ({scope === 'chapter' ? chapterHighlights.length : bookHighlights.length})
              </button>
              {HIGHLIGHT_COLORS.map((c) => {
                const count = (scope === 'chapter' ? chapterHighlights : bookHighlights).filter(
                  (h) => h.color === c.id
                ).length;
                if (count === 0 && selectedColor !== c.id) return null;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 ${
                      selectedColor === c.id
                        ? 'ring-2 ring-emerald-500 bg-white dark:bg-slate-800 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action bar (Export / Copy all) */}
          {displayedHighlights.length > 0 && (
            <div className="px-5 py-2 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                Hiển thị {displayedHighlights.length} đoạn trích
              </span>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline text-[11px]"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Đã chép toàn bộ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Sao chép tất cả</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Highlights List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {displayedHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-3">
                  <Highlighter className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đoạn highlight nào'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  {searchQuery
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc màu khác.'
                    : 'Hãy bôi đen bất kỳ đoạn văn bản nào bạn tâm đắc khi đọc sách để lưu lại tại đây!'}
                </p>
              </div>
            ) : (
              displayedHighlights.map((hl) => {
                const colorObj = HIGHLIGHT_COLORS.find((c) => c.id === hl.color) || HIGHLIGHT_COLORS[0];
                const dateStr = new Intl.DateTimeFormat('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(hl.createdAt));

                return (
                  <div
                    key={hl.id}
                    onClick={() => handleJumpToHighlight(hl)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 hover:border-emerald-500/50 hover:shadow-md transition-all relative flex flex-col gap-2"
                  >
                    {/* Top row: Color pill, Chapter & date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: colorObj.hex }}
                          title={colorObj.name}
                        />
                        {scope === 'book' && hl.chapterTitle && (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[170px]">
                            {hl.chapterTitle}
                          </span>
                        )}
                        <span>{dateStr}</span>
                      </div>

                      {/* Item Quick Action Buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopySingle(hl, e)}
                          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          title="Sao chép câu trích dẫn"
                        >
                          {copiedItemId === hl.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Bạn có chắc muốn xóa đoạn highlight này?')) {
                              onDeleteHighlight(hl.id);
                            }
                          }}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                          title="Xóa highlight"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quote Content */}
                    <div
                      className="border-l-3 pl-3 py-0.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-serif italic"
                      style={{ borderColor: colorObj.hex }}
                    >
                      "{hl.text}"
                    </div>

                    {/* Personal Note if present */}
                    {hl.note && (
                      <div className="flex items-start gap-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl p-2 text-[11px] text-slate-600 dark:text-slate-300">
                        <MessageSquare className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="flex-1 break-words">{hl.note}</span>
                      </div>
                    )}

                    {/* Jump hint on hover */}
                    <div className="flex items-center justify-end text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Đến vị trí đọc</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
