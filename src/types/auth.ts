import { TargetType, ReactionType } from './interaction';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: 'member' | 'admin';
  createdAt?: string;
  updatedAt?: string;
  commentCount?: number;
  reactionCount?: number;
  readingCount?: number;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalComments: number;
  totalReactions: number;
  totalActiveReaders?: number;
  totalReadingBooks?: number;
  reactionDistribution: Record<string, number>;
}

export interface AdminComment {
  id: string;
  targetType: TargetType;
  targetId: string;
  bookId: string;
  chapterId: string;
  questionId?: string | null;
  parentId?: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userRole: 'member' | 'admin';
  content: string;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  reactionCount: number;
}

export interface AdminReaction {
  id: string;
  targetType: TargetType;
  targetId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  reactionType: ReactionType;
  createdAt: string;
}

export interface AdminReadingProgressItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  userRole: 'member' | 'admin';
  bookId: string;
  bookTitle: string;
  lastChapterId: string;
  lastChapterTitle: string;
  lastChapterOrder: number;
  progressPercent: number;
  scrollRatio: number;
  completedChapterIds: string[];
  lastReadAt: number;
  createdAt: string;
  updatedAt: string;
}
