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
