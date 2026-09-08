import React, { useState } from 'react';
import { Reply, Trash2, ChevronDown, ChevronUp, Pin, ShieldCheck } from 'lucide-react';
import { CommentItem as CommentItemType } from '../../types/interaction';
import { useAuth } from '../../context/AuthContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import { AvatarIcon, getAvatarBg } from '../auth/AvatarPresets';
import { ReactionButton } from './ReactionButton';
import { CommentInput } from './CommentInput';

interface CommentItemProps {
  comment: CommentItemType;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  isReply = false,
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const canDelete =
    !comment.isDeleted &&
    user &&
    (user.id === comment.userId || user.role === 'admin');

  const handleDelete = async () => {
    setIsDeleting(true);
    setIsConfirmingDelete(false);
    try {
      await onDelete(comment.id);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = async (content: string) => {
    await onReply(comment.id, content);
    setIsReplying(false);
    setShowReplies(true);
  };

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`group/comment relative ${isReply ? 'mt-2.5 sm:mt-3' : 'mt-3.5 sm:mt-4'}`}>
      {/* Main Comment Box */}
      <div
        className={`rounded-2xl p-3 sm:p-4 transition-all ${
          comment.isPinned
            ? 'bg-amber-50/70 dark:bg-amber-950/25 border-2 border-amber-300 dark:border-amber-800/80 shadow-xs'
            : isReply
            ? 'bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80'
            : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        {/* Pinned Banner */}
        {comment.isPinned && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 mb-2.5 bg-amber-100/60 dark:bg-amber-900/40 px-2.5 py-1 rounded-lg w-fit">
            <Pin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Đã ghim bởi Ban điều hành CLB</span>
          </div>
        )}

        {/* Comment Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* User Avatar */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${getAvatarBg(
                comment.userAvatar
              )}`}
            >
              <AvatarIcon avatarId={comment.userAvatar} className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {comment.userName}
              </span>

              {comment.userRole === 'admin' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </span>
              )}

              <span className="text-[11px] text-slate-400 shrink-0" title={comment.createdAt}>
                • {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Delete Action (Desktop hover + Mobile touch friendly) */}
          {canDelete && (
            <div className="shrink-0">
              {isConfirmingDelete ? (
                <div className="flex items-center gap-1 animate-in fade-in duration-150">
                  <span className="text-[10px] text-rose-500 font-bold hidden sm:inline">Xác nhận?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow-xs transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-0.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  title="Xóa bình luận"
                  className="opacity-70 sm:opacity-0 sm:group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div
          className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
            comment.isDeleted
              ? 'italic text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {comment.content}
        </div>

        {/* Action Bar (Reactions & Reply) */}
        {!comment.isDeleted && (
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {/* Reaction Picker & Counts */}
            <ReactionButton
              targetType="comment"
              targetId={comment.id}
              counts={comment.reactions}
              userReactions={comment.userReaction ? [comment.userReaction] : []}
              size="sm"
            />

            {/* Reply toggle button */}
            <button
              type="button"
              onClick={() => setIsReplying(!isReplying)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>{isReplying ? 'Đóng' : 'Trả lời'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-2.5 pl-2.5 sm:pl-6 ml-2 sm:ml-4 border-l-2 border-emerald-500/30 dark:border-emerald-500/20 animate-in fade-in duration-150">
          <CommentInput
            autoFocus
            onSubmit={handleSendReply}
            replyingToName={comment.userName}
            onCancelReply={() => setIsReplying(false)}
            placeholder={`Trả lời @${comment.userName}...`}
          />
        </div>
      )}

      {/* Toggle Replies button if top-level */}
      {hasReplies && !isReply && (
        <div className="mt-1 pl-3 sm:pl-6 ml-1 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 py-1 transition-colors"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Thu gọn ({comment.replies.length})</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Xem {comment.replies.length} câu trả lời</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Nested Replies List */}
      {hasReplies && showReplies && (
        <div className="pl-2.5 sm:pl-6 border-l-2 border-emerald-500/20 dark:border-emerald-500/10 ml-2 sm:ml-4 space-y-2 animate-in fade-in duration-150">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
