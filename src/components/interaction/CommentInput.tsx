import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2, MessageSquare, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarIcon, getAvatarBg } from '../auth/AvatarPresets';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  replyingToName?: string | null;
  onCancelReply?: () => void;
  autoFocus?: boolean;
}

const QUICK_TAGS = [
  { label: '💡 Bài học tâm đắc', prefix: '💡 **Bài học tâm đắc:** ' },
  { label: '❤️ Cảm xúc', prefix: '❤️ **Cảm nhận:** ' },
  { label: '✨ Góc nhìn mới', prefix: '✨ **Góc nhìn:** ' },
  { label: '❓ Câu hỏi', prefix: '❓ **Thắc mắc:** ' },
];

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Chia sẻ cảm nghĩ, bài học tâm đắc hoặc câu hỏi của bạn...',
  replyingToName,
  onCancelReply,
  autoFocus = false,
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height to fit content smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(220, Math.max(52, textareaRef.current.scrollHeight))}px`;
    }
  }, [content]);

  const handleFocus = () => {
    if (!isAuthenticated) {
      openAuthModal('Đăng nhập bằng 1 chạm để tham gia thảo luận cùng các độc giả.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInsertTag = (prefix: string) => {
    if (!isAuthenticated) {
      openAuthModal('Vui lòng đăng nhập để bình luận.');
      return;
    }
    if (content.startsWith(prefix)) return;
    setContent((prev) => (prev ? `${prefix}${prev}` : prefix));
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!isAuthenticated) {
      openAuthModal('Vui lòng đăng nhập để gửi bình luận.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Submit comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOverLimit = content.length > 2000;
  const isNearLimit = content.length > 1800;

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-3 sm:p-4 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
      {/* Replying Banner */}
      {replyingToName && (
        <div className="mb-2.5 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 font-medium">
            <MessageSquare className="h-3.5 w-3.5 shrink-0" />
            <span>
              Đang phản hồi tới <strong className="font-bold">@{replyingToName}</strong>
            </span>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md transition-colors"
              title="Hủy phản hồi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Guest Mode Invitation Banner */}
      {!isAuthenticated && (
        <div
          onClick={() => openAuthModal('Đăng nhập bằng 1 chạm để tham gia thảo luận cùng các độc giả.')}
          className="cursor-pointer mb-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-200/60 dark:border-emerald-800/40 p-2.5 flex items-center justify-between gap-2 group hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 transition-colors">
                Bạn chưa đăng nhập?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Đăng nhập nhanh để lưu cảm nghĩ và nhận phản hồi từ CLB.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs shrink-0 group-hover:bg-emerald-500 transition-colors">
            <LogIn className="h-3 w-3" />
            <span>Đăng nhập</span>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-2.5 sm:gap-3 items-start">
          {/* User Avatar */}
          <div className="hidden sm:flex shrink-0">
            {isAuthenticated && user ? (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${getAvatarBg(
                  user.avatar
                )}`}
              >
                <AvatarIcon avatarId={user.avatar} className="h-5 w-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 opacity-60" />
              </div>
            )}
          </div>

          {/* Text Area Container */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={2}
              autoFocus={autoFocus}
              value={content}
              onFocus={handleFocus}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAuthenticated ? placeholder : 'Bấm vào đây để đăng nhập và viết cảm nhận...'}
              className="w-full resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none leading-relaxed transition-all"
            />

            {/* Quick Topic Tag Chips */}
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 flex-wrap my-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
                  Gợi ý:
                </span>
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleInsertTag(tag.prefix)}
                    className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] transition-colors ${
                    isOverLimit
                      ? 'text-rose-600 font-bold'
                      : isNearLimit
                      ? 'text-amber-500 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {content.length > 0 ? `${content.length}/2000 ký tự` : 'Tối đa 2000 ký tự'}
                </span>
                <span className="hidden md:inline text-[10px] text-slate-400">
                  • Nhấn <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Ctrl+Enter</kbd> để gửi
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {onCancelReply && (
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Hủy
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting || isOverLimit}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{replyingToName ? 'Gửi trả lời' : 'Bình luận'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
