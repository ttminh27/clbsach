import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { TargetType, CommentItem as CommentItemType, ReactionSummary } from '../../types/interaction';
import { commentsApi, reactionsApi } from '../../services/api';
import { ReactionButton } from './ReactionButton';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  targetType: TargetType;
  targetId: string;
  bookId: string;
  chapterId: string;
  questionId?: string | null;
  title?: string;
  subtitle?: string;
  showReactionDock?: boolean;
  className?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  targetType,
  targetId,
  bookId,
  chapterId,
  questionId,
  title = 'Góc Thảo Luận & Cảm Nghĩ',
  subtitle,
  showReactionDock = true,
  className = '',
}) => {
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reactions, setReactions] = useState<ReactionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [cmtRes, rxRes] = await Promise.all([
        commentsApi.getComments(targetType, targetId),
        reactionsApi.getReactions(targetType, targetId),
      ]);
      setComments(cmtRes.comments);
      setTotalCount(cmtRes.total);
      setReactions(rxRes);
    } catch (err: any) {
      console.error('Error fetching comments/reactions:', err);
      setError(err.message || 'Lỗi tải thảo luận.');
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateComment = async (content: string) => {
    const res = await commentsApi.createComment({
      targetType,
      targetId,
      bookId,
      chapterId,
      questionId: questionId || null,
      content,
    });
    setComments((prev) => [res.comment, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const handleReply = async (parentId: string, content: string) => {
    const res = await commentsApi.createComment({
      targetType,
      targetId,
      bookId,
      chapterId,
      questionId: questionId || null,
      parentId,
      content,
    });

    // Attach reply into appropriate parent comment in state
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), res.comment],
          };
        }
        return c;
      })
    );
    setTotalCount((prev) => prev + 1);
  };

  const handleDelete = async (commentId: string) => {
    await commentsApi.deleteComment(commentId);
    // Refresh to reflect soft-delete or deletion accurately
    fetchData();
  };

  return (
    <section className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 sm:p-8 shadow-xs ${className}`}>
      {/* 1. Target Reactions Dock */}
      {showReactionDock && (
        <div className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Bày tỏ cảm xúc về nội dung này
              </h4>
            </div>
            {reactions && reactions.total > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {reactions.total} lượt thả cảm xúc
              </span>
            )}
          </div>

          <ReactionButton
            targetType={targetType}
            targetId={targetId}
            counts={reactions?.counts || {}}
            userReactions={reactions?.userReactions || []}
            size="lg"
            onUpdated={(counts, userReactions) => {
              setReactions((prev) =>
                prev
                  ? {
                      ...prev,
                      counts,
                      userReactions,
                      total: Object.values(counts).reduce((a, b) => a + b, 0),
                    }
                  : null
              );
            }}
          />
        </div>
      )}

      {/* 2. Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>
        </div>

        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
          {totalCount} thảo luận
        </span>
      </div>

      {/* 3. New Comment Input */}
      <div className="mb-6">
        <CommentInput onSubmit={handleCreateComment} />
      </div>

      {/* 4. Comments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs text-slate-500">Đang tải các bình luận...</p>
        </div>
      ) : error ? (
        <div className="text-center py-6 text-xs text-rose-500">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
          <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Chưa có bình luận nào cho phần này.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Hãy là người đầu tiên chia sẻ cảm nghĩ, góc nhìn hoặc câu hỏi của bạn!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
};
