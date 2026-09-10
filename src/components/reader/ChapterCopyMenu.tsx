import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, ChevronDown, FileText, Code2, Link2, Quote } from 'lucide-react';
import { copyToClipboard, stripMarkdownToPlainText } from '../../utils/clipboard';

interface ChapterCopyMenuProps {
  bookTitle: string;
  chapterTitle: string;
  chapterContent: string;
  onCopied: (message: string) => void;
}

export const ChapterCopyMenu: React.FC<ChapterCopyMenuProps> = ({
  bookTitle,
  chapterTitle,
  chapterContent,
  onCopied,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [justCopied, setJustCopied] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Check if user currently has text selected
  const updateSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText('');
    }
  };

  const handleToggle = () => {
    updateSelection();
    setIsOpen(!isOpen);
  };

  const markCopied = (message: string) => {
    setJustCopied(true);
    setIsOpen(false);
    onCopied(message);
    setTimeout(() => {
      setJustCopied(false);
    }, 2000);
  };

  // 1. Copy plain text of the chapter
  const handleCopyPlainText = async () => {
    const plainText = stripMarkdownToPlainText(chapterContent);
    const fullText = `📚 ${bookTitle}\n📖 ${chapterTitle}\n\n${plainText}\n\n— Nguồn: CLB Đọc Sách (${window.location.href})`;
    const success = await copyToClipboard(fullText);
    if (success) {
      markCopied('Đã sao chép toàn bộ nội dung chương (văn bản thuần)!');
    }
  };

  // 2. Copy markdown formatted text
  const handleCopyMarkdown = async () => {
    const fullMd = `<!-- Sách: ${bookTitle} | Chương: ${chapterTitle} -->\n\n${chapterContent}`;
    const success = await copyToClipboard(fullMd);
    if (success) {
      markCopied('Đã sao chép nội dung định dạng Markdown!');
    }
  };

  // 3. Copy chapter share link
  const handleCopyLink = async () => {
    const link = window.location.href;
    const textToCopy = `📖 Đọc "${chapterTitle}" - ${bookTitle} tại:\n${link}`;
    const success = await copyToClipboard(textToCopy);
    if (success) {
      markCopied('Đã sao chép liên kết chương sách!');
    }
  };

  // 4. Copy current selection with citation
  const handleCopySelection = async () => {
    if (!selectedText) return;
    const quoteText = `"${selectedText}"\n\n— Trích từ: "${chapterTitle}", sách "${bookTitle}" (${window.location.href})`;
    const success = await copyToClipboard(quoteText);
    if (success) {
      markCopied('Đã sao chép đoạn trích dẫn đang chọn!');
    }
  };

  return (
    <div className="relative" ref={menuRef} data-no-search="true">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center gap-1 sm:gap-1.5 rounded-lg p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium transition-all shrink-0 ${
          justCopied
            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/50'
            : isOpen
            ? 'bg-slate-200 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`}
        title="Sao chép nội dung chương vào clipboard"
      >
        {justCopied ? (
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-150 shrink-0" />
        ) : (
          <Copy className="h-4 w-4 text-slate-600 dark:text-slate-300 shrink-0" />
        )}
        <span className="hidden xl:inline">Sao chép</span>
        <ChevronDown className="hidden xl:inline h-3 w-3 opacity-60 ml-0.5" />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs sm:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-11 sm:w-80 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tùy chọn sao chép
              </span>
              <span className="text-[10px] text-slate-400">Clipboard</span>
            </div>

          <div className="mt-1 space-y-1">
            {/* If user selected text */}
            {selectedText && (
              <button
                onClick={handleCopySelection}
                className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <Quote className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                    Sao chép đoạn đang chọn
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                    "{selectedText}"
                  </div>
                </div>
              </button>
            )}

            {/* Plain text copy */}
            <button
              onClick={handleCopyPlainText}
              className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  Sao chép toàn bộ chương (Văn bản thuần)
                </div>
                <div className="text-[11px] text-slate-400">
                  Dễ đọc, đã lọc thẻ định dạng, thích hợp gửi & ghi chú
                </div>
              </div>
            </button>

            {/* Markdown copy */}
            <button
              onClick={handleCopyMarkdown}
              className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  Sao chép định dạng Markdown
                </div>
                <div className="text-[11px] text-slate-400">
                  Giữ nguyên tiêu đề, in đậm, bảng biểu cho Notion, Obsidian
                </div>
              </div>
            </button>

            {/* Share link copy */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                  Sao chép liên kết chương sách
                </div>
                <div className="text-[11px] text-slate-400">
                  Đường dẫn trực tiếp kèm tên chương để chia sẻ
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
};
