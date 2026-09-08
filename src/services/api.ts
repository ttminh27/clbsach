import { User, AuthResponse, AdminStats, AdminComment, AdminReaction } from '../types/auth';
import { CommentItem, ReactionSummary, TargetType, ReactionType } from '../types/interaction';

const TOKEN_KEY = 'clb_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}, retries = 1): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      if (text.startsWith('<!doctype') || text.startsWith('<html') || text.includes('<!DOCTYPE')) {
        throw new Error(`Endpoint "${endpoint}" chưa sẵn sàng trên máy chủ (trả về HTML thay vì JSON). Vui lòng kiểm tra bản deploy.`);
      }
      throw new Error(`Phản hồi không hợp lệ (${res.status}): ${text.slice(0, 100)}`);
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Yêu cầu thất bại (${res.status})`);
    }
    return data as T;
  } catch (err: any) {
    if (retries > 0 && err instanceof TypeError && err.message.includes('fetch')) {
      await new Promise((r) => setTimeout(r, 200));
      return request<T>(endpoint, options, retries - 1);
    }
    throw err;
  }
}

// 1. Auth API
export const authApi = {
  async register(name: string, email: string, password: string, avatar: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, avatar }),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(name: string, avatar: string): Promise<{ user: User; token?: string }> {
    const res = await request<{ user: User; token?: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, avatar }),
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },
};

// 2. Comments API
export const commentsApi = {
  async getComments(targetType: TargetType, targetId: string): Promise<{ comments: CommentItem[]; total: number }> {
    return request<{ comments: CommentItem[]; total: number }>(
      `/api/comments?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`
    );
  },

  async createComment(data: {
    targetType: TargetType;
    targetId: string;
    bookId: string;
    chapterId: string;
    questionId?: string | null;
    parentId?: string | null;
    content: string;
  }): Promise<{ success: boolean; comment: CommentItem }> {
    return request<{ success: boolean; comment: CommentItem }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteComment(commentId: string): Promise<{ success: boolean; softDeleted: boolean }> {
    return request<{ success: boolean; softDeleted: boolean }>(`/api/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// 3. Reactions API
export const reactionsApi = {
  async getReactions(targetType: TargetType, targetId: string): Promise<ReactionSummary> {
    return request<ReactionSummary>(
      `/api/reactions?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`
    );
  },

  async toggleReaction(
    targetType: TargetType,
    targetId: string,
    reactionType: ReactionType
  ): Promise<ReactionSummary & { action: 'added' | 'removed' }> {
    return request<ReactionSummary & { action: 'added' | 'removed' }>('/api/reactions', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, reactionType }),
    });
  },
};

// 4. Admin API
export const adminApi = {
  async getStats(): Promise<{ stats: AdminStats }> {
    return request<{ stats: AdminStats }>('/api/admin/stats');
  },

  async getUsers(search?: string): Promise<{ users: User[] }> {
    const q = search ? `?q=${encodeURIComponent(search)}` : '';
    return request<{ users: User[] }>(`/api/admin/users${q}`);
  },

  async updateUserRole(userId: string, role: 'member' | 'admin'): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/admin/users', {
      method: 'PATCH',
      body: JSON.stringify({ userId, role }),
    });
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  },

  async resetPassword(
    userId: string,
    newPassword?: string
  ): Promise<{ success: boolean; message: string; newPassword: string; user: { id: string; name: string; email: string } }> {
    return request<{ success: boolean; message: string; newPassword: string; user: { id: string; name: string; email: string } }>(
      '/api/admin/users/reset-password',
      {
        method: 'POST',
        body: JSON.stringify({ userId, newPassword }),
      }
    );
  },

  async getComments(params?: {
    q?: string;
    userId?: string;
    bookId?: string;
    status?: 'all' | 'active' | 'deleted';
  }): Promise<{ comments: AdminComment[]; total: number }> {
    const sp = new URLSearchParams();
    if (params?.q) sp.append('q', params.q);
    if (params?.userId) sp.append('userId', params.userId);
    if (params?.bookId) sp.append('bookId', params.bookId);
    if (params?.status) sp.append('status', params.status);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<{ comments: AdminComment[]; total: number }>(`/api/admin/comments${qs}`);
  },

  async updateComment(
    commentId: string,
    data: { isPinned?: boolean; isDeleted?: boolean }
  ): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/api/admin/comments', {
      method: 'PATCH',
      body: JSON.stringify({ commentId, ...data }),
    });
  },

  async deleteCommentPermanently(commentId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/admin/comments?commentId=${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
    });
  },

  async getReactions(params?: {
    userId?: string;
    targetType?: string;
    reactionType?: string;
  }): Promise<{ reactions: AdminReaction[]; total: number }> {
    const sp = new URLSearchParams();
    if (params?.userId) sp.append('userId', params.userId);
    if (params?.targetType) sp.append('targetType', params.targetType);
    if (params?.reactionType) sp.append('reactionType', params.reactionType);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return request<{ reactions: AdminReaction[]; total: number }>(`/api/admin/reactions${qs}`);
  },

  async deleteReaction(reactionId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/admin/reactions?reactionId=${encodeURIComponent(reactionId)}`, {
      method: 'DELETE',
    });
  },
};

