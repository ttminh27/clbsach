import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import { CommentSection } from './CommentSection';

interface ChapterDiscussionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  chapterId: string;
  bookTitle: string;
  chapterTitle: string;
}

export const ChapterDiscussionDrawer: React.FC<ChapterDiscussionDrawerProps> = ({
  isOpen,
  onClose,
  bookId,
  chapterId,
  bookTitle,
  chapterTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                  {bookTitle}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {chapterTitle}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <CommentSection
              targetType="chapter"
              targetId={`${bookId}:${chapterId}`}
              bookId={bookId}
              chapterId={chapterId}
              title="Thảo luận chương"
              showReactionDock={true}
              className="border-none bg-transparent p-0 shadow-none backdrop-blur-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
