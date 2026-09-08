import React, { useState } from 'react';
import { Reply, Trash2, ChevronDown, ChevronUp, Pin } from 'lucide-react';
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

  const canDelete =
    !comment.isDeleted &&
    user &&
    (user.id === comment.userId || user.role === 'admin');

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) return;
    setIsDeleting(true);
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
    <div className={`group/comment relative ${isReply ? 'mt-3' : 'mt-4'}`}>
      {/* Main Comment Box */}
      <div
        className={`rounded-2xl p-3.5 transition-all ${
          comment.isPinned
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60'
            : isReply
            ? 'bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80'
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs'
        }`}
      >
        {/* Pinned Tag */}
        {comment.isPinned && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-2">
            <Pin className="h-3 w-3" />
            <span>Đã ghim bởi Ban điều hành CLB</span>
          </div>
        )}

        {/* Comment Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${getAvatarBg(
                comment.userAvatar
              )}`}
            >
              <AvatarIcon avatarId={comment.userAvatar} className="h-4 w-4" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {comment.userName}
              </span>
              {comment.userRole === 'admin' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Admin
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                • {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Delete action button */}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              title="Xóa bình luận"
              className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Comment Content */}
        <p
          className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
            comment.isDeleted
              ? 'italic text-slate-400 dark:text-slate-500'
              : 'text-slate-700 dark:text-slate-200'
          }`}
        >
          {comment.content}
        </p>

        {/* Action Bar (Reactions & Reply) */}
        {!comment.isDeleted && (
          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800/60">
            {/* Reaction bar for comment */}
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
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>Trả lời</span>
            </button>
          </div>
        )}
      </div>

      {/* Inline Reply Form */}
      {isReplying && (
        <div className="mt-2.5 pl-4 sm:pl-8">
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
        <div className="mt-1 pl-4 sm:pl-8">
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline py-1"
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Ẩn {comment.replies.length} câu trả lời</span>
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
        <div className="pl-4 sm:pl-8 border-l-2 border-emerald-500/20 dark:border-emerald-500/10 ml-3 sm:ml-4 space-y-2">
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
