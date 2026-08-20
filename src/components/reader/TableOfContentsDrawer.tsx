import React from 'react';
import { Link } from 'react-router-dom';
import { X, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Book, Chapter } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useAudio } from '../../context/AudioContext';

interface TableOfContentsDrawerProps {
  book: Book;
  currentChapterId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TableOfContentsDrawer: React.FC<TableOfContentsDrawerProps> = ({
  book,
  currentChapterId,
  isOpen,
  onClose,
}) => {
  const { getProgressForBook } = useHistory();
  const { setIsAudioBarVisible } = useAudio();
  const progress = getProgressForBook(book.id);
  const completedSet = new Set(progress?.completedChapterIds || []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                {book.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                Mục lục {book.chapters.length} chương
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {book.chapters.map((chapter, idx) => {
            const isSelected = chapter.id === currentChapterId;
            const isCompleted = completedSet.has(chapter.id);

            return (
              <Link
                key={chapter.id}
                to={`/reader/${book.id}/${chapter.id}`}
                onClick={() => {
                  onClose();
                  setIsAudioBarVisible(false);
                }}
                className={`group flex items-center justify-between rounded-xl p-3 text-xs transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
                    : isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 text-slate-700 dark:text-slate-300 hover:bg-emerald-100/60'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isCompleted
                        ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-semibold">{chapter.title}</p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      ~{chapter.readingTimeMin} phút đọc • {chapter.wordCount.toLocaleString()} từ
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    Đang xem
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Outside click closer */}
      <div className="flex-1" onClick={onClose}></div>
    </div>
  );
};
