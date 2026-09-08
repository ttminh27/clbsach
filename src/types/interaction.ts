export type TargetType = 'chapter' | 'quiz_question' | 'comment';

export type ReactionType = 'like' | 'love' | 'heart' | 'haha' | 'surprise' | 'cry' | 'angry';

export interface ReactionDefinition {
  type: ReactionType;
  emoji: string;
  iconUrl: string;
  label: string;
  colorClass: string;
}

export const REACTION_DEFINITIONS: ReactionDefinition[] = [
  { type: 'like', emoji: '👍', iconUrl: '/reactions/like.png', label: 'Thích', colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
  { type: 'love', emoji: '❤️', iconUrl: '/reactions/love.png', label: 'Yêu thích', colorClass: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
  { type: 'haha', emoji: '😂', iconUrl: '/reactions/haha.png', label: 'Haha', colorClass: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
  { type: 'surprise', emoji: '😮', iconUrl: '/reactions/surprise.png', label: 'Ngạc nhiên', colorClass: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
  { type: 'cry', emoji: '😢', iconUrl: '/reactions/cry.png', label: 'Buồn', colorClass: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800' },
  { type: 'angry', emoji: '😡', iconUrl: '/reactions/angry.png', label: 'Phẫn nộ', colorClass: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800' },
];

export interface ReactionSummary {
  targetType: TargetType;
  targetId: string;
  counts: Record<string, number>;
  userReactions: string[];
  total: number;
}

export interface CommentItem {
  id: string;
  targetType: TargetType;
  targetId: string;
  bookId: string;
  chapterId: string;
  questionId?: string | null;
  parentId?: string | null;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: 'member' | 'admin';
  content: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  reactions: Record<string, number>;
  userReaction?: string | null;
  replies: CommentItem[];
}
