import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, Loader2, Sparkles, Filter, Search, RotateCcw, Heart } from 'lucide-react';
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

type SortOrder = 'newest' | 'top' | 'oldest';

const DISCUSSION_PROMPTS = [
  {
    icon: '💡',
    title: 'Bài học tâm đắc',
    text: '💡 **Bài học tâm đắc của tôi:** Điểm sâu sắc nhất trong chương này là...',
  },
  {
    icon: '🎯',
    title: 'Ứng dụng thực tế',
    text: '🎯 **Ứng dụng thực tế:** Tôi dự định áp dụng điều này vào thói quen hàng ngày bằng cách...',
  },
  {
    icon: '❓',
    title: 'Câu hỏi thảo luận',
    text: '❓ **Thắc mắc / Góc nhìn:** Mình muốn trao đổi thêm cùng mọi người về luận điểm...',
  },
];

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
  const [sortBy, setSortBy] = useState<SortOrder>('newest');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [initialPrompt, setInitialPrompt] = useState<string>('');

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
      setError(err.message || 'Lỗi tải dữ liệu thảo luận.');
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
    fetchData();
  };

  // Filtered & Sorted Comments
  const displayedComments = useMemo(() => {
    let list = [...comments];

    // Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (c) =>
          c.content.toLowerCase().includes(q) ||
          c.userName.toLowerCase().includes(q) ||
          (c.replies && c.replies.some((r) => r.content.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q)))
      );
    }

    // Sort order
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'top') {
      list.sort((a, b) => {
        const aCount = Object.values(a.reactions || {}).reduce((x, y) => x + y, 0);
        const bCount = Object.values(b.reactions || {}).reduce((x, y) => x + y, 0);
        return bCount - aCount;
      });
    }

    return list;
  }, [comments, sortBy, searchFilter]);

  return (
    <section className={`rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 sm:p-7 shadow-sm ${className}`}>
      {/* 1. Target Reactions Dock */}
      {showReactionDock && (
        <div className="mb-7 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Cảm xúc của bạn về chương này
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  Chọn biểu tượng để thả cảm xúc nhanh
                </p>
              </div>
            </div>

            {reactions && reactions.total > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                <span>{reactions.total} lượt cảm xúc</span>
              </span>
            )}
          </div>

          <ReactionButton
            targetType={targetType}
            targetId={targetId}
            counts={reactions?.counts || {}}
            userReactions={reactions?.userReactions || []}
            size="md"
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

      {/* 2. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {totalCount}
              </span>
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Sort Tabs / Options */}
        {comments.length > 1 && (
          <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                sortBy === 'newest'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('top')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                sortBy === 'top'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Nhiều cảm xúc
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                sortBy === 'oldest'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Cũ nhất
            </button>
          </div>
        )}
      </div>

      {/* 3. New Comment Input */}
      <div className="mb-6">
        <CommentInput onSubmit={handleCreateComment} placeholder={initialPrompt || undefined} />
      </div>

      {/* 4. Filter search input if > 4 comments */}
      {comments.length >= 4 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Tìm kiếm bình luận theo nội dung hoặc độc giả..."
            className="w-full bg-transparent focus:outline-none placeholder:text-slate-400 text-xs"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Xóa
            </button>
          )}
        </div>
      )}

      {/* 5. Comments List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
          <p className="text-xs text-slate-500">Đang tải các bình luận...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 text-center my-4">
          <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-rose-500 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Thử lại</span>
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
          <MessageSquare className="h-9 w-9 text-emerald-500/40 mx-auto mb-2.5" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Chưa có thảo luận nào trong phần này
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Hãy là người đầu tiên chia sẻ cảm nghĩ, góc nhìn hoặc câu hỏi của bạn!
          </p>

          {/* Quick Prompt Starters */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-xl mx-auto text-left">
            {DISCUSSION_PROMPTS.map((prompt) => (
              <button
                key={prompt.title}
                onClick={() => {
                  setInitialPrompt(prompt.text);
                  window.scrollTo({ top: window.scrollY - 100, behavior: 'smooth' });
                }}
                className="group flex flex-col justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xs transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  <span>{prompt.icon}</span>
                  <span>{prompt.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                  Bấm để bắt đầu thảo luận
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : displayedComments.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Không tìm thấy bình luận nào khớp với từ khóa "{searchFilter}".
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {displayedComments.map((comment) => (
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
