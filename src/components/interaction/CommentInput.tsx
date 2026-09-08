import React, { useState, useRef } from 'react';
import { Send, X, Loader2, MessageSquare, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AvatarIcon, getAvatarBg } from '../auth/AvatarPresets';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  replyingToName?: string | null;
  onCancelReply?: () => void;
  autoFocus?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  onSubmit,
  placeholder = 'Chia sẻ cảm nghĩ, bài học tâm đắc của bạn...',
  replyingToName,
  onCancelReply,
  autoFocus = false,
}) => {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFocus = () => {
    if (!isAuthenticated) {
      requireAuth(() => {
        textareaRef.current?.focus();
      }, 'Vui lòng đăng nhập để bình luận.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    if (!isAuthenticated) {
      requireAuth(() => {}, 'Vui lòng đăng nhập để gửi bình luận.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      console.error('Submit comment error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs transition-all focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10">
      {/* Replying Banner */}
      {replyingToName && (
        <div className="mb-2 flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 font-medium">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              Đang phản hồi tới <strong className="font-bold">{replyingToName}</strong>
            </span>
          </div>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 items-start">
          {/* User Avatar */}
          <div className="hidden sm:flex shrink-0">
            {isAuthenticated && user ? (
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${getAvatarBg(
                  user.avatar
                )}`}
              >
                <AvatarIcon avatarId={user.avatar} className="h-5 w-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* Text Area */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              rows={2}
              autoFocus={autoFocus}
              value={content}
              onFocus={handleFocus}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isAuthenticated ? placeholder : 'Đăng nhập để tham gia thảo luận...'}
              className="w-full resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden leading-relaxed"
            />

            {/* Bottom Actions */}
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-400">
                {content.length > 0 && `${content.length}/2000 ký tự`}
              </span>

              <div className="flex items-center gap-2">
                {onCancelReply && (
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Hủy
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{replyingToName ? 'Gửi phản hồi' : 'Bình luận'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
