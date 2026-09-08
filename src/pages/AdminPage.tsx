import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  MessageSquare,
  Heart,
  Search,
  Key,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Pin,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/api';
import { User, AdminStats, AdminComment, AdminReaction } from '../types/auth';
import { REACTION_DEFINITIONS } from '../types/interaction';
import { AvatarIcon, getAvatarBg } from '../components/auth/AvatarPresets';
import { formatTimeAgo } from '../utils/timeAgo';
import booksData from '../data/books-manifest.json';
import { Book } from '../types/book';

const books: Book[] = booksData as Book[];

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'users' | 'comments' | 'reactions'
  const [activeTab, setActiveTab] = useState<'users' | 'comments' | 'reactions'>('users');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Tab 1: Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);

  // User Action Modals
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetResult, setResetResult] = useState<{
    user: { name: string; email: string };
    newPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // Tab 2: Comments state
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [commentSearch, setCommentSearch] = useState('');
  const [commentStatusFilter, setCommentStatusFilter] = useState<'all' | 'active' | 'deleted'>('all');
  const [commentUserFilter, setCommentUserFilter] = useState<string>('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Tab 3: Reactions state
  const [reactions, setReactions] = useState<AdminReaction[]>([]);
  const [reactionTypeFilter, setReactionTypeFilter] = useState<string>('');
  const [reactionTargetFilter, setReactionTargetFilter] = useState<string>('');
  const [reactionUserFilter, setReactionUserFilter] = useState<string>('');
  const [reactionsLoading, setReactionsLoading] = useState(false);

  // Status Notification
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Helper to get book title from ID
  const getBookTitle = (bookId: string) => {
    const b = books.find((x) => x.id === bookId);
    return b ? b.title : bookId;
  };

  // 1. Fetch Stats
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminApi.getStats();
      setStats(res.stats);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 2. Fetch Users
  const loadUsers = async (query = userSearch) => {
    setUsersLoading(true);
    try {
      const res = await adminApi.getUsers(query);
      setUsers(res.users);
    } catch (err: any) {
      showNotification(err.message || 'Không thể tải danh sách đọc giả.', true);
    } finally {
      setUsersLoading(false);
    }
  };

  // 3. Fetch Comments
  const loadComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await adminApi.getComments({
        q: commentSearch,
        status: commentStatusFilter,
        userId: commentUserFilter,
      });
      setComments(res.comments);
    } catch (err: any) {
      showNotification(err.message || 'Không thể tải danh sách bình luận.', true);
    } finally {
      setCommentsLoading(false);
    }
  };

  // 4. Fetch Reactions
  const loadReactions = async () => {
    setReactionsLoading(true);
    try {
      const res = await adminApi.getReactions({
        userId: reactionUserFilter,
        targetType: reactionTargetFilter,
        reactionType: reactionTypeFilter,
      });
      setReactions(res.reactions);
    } catch (err: any) {
      showNotification(err.message || 'Không thể tải danh sách tương tác.', true);
    } finally {
      setReactionsLoading(false);
    }
  };

  // Load initial data when admin authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadStats();
      loadUsers();
      loadComments();
      loadReactions();
    }
  }, [isAuthenticated, user?.role]);

  // Handle Tab switches & search filters
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'comments') {
      loadComments();
    } else if (activeTab === 'reactions') {
      loadReactions();
    }
  }, [activeTab, commentStatusFilter, commentUserFilter, reactionTypeFilter, reactionTargetFilter, reactionUserFilter]);

  // User Actions: Password Reset
  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResettingPassword(true);
    try {
      const res = await adminApi.resetPassword(resetTargetUser.id, customPassword);
      setResetResult({
        user: { name: res.user.name, email: res.user.email },
        newPassword: res.newPassword,
      });
      setResetTargetUser(null);
      setCustomPassword('');
      showNotification('Đã đặt lại mật khẩu thành công!');
    } catch (err: any) {
      showNotification(err.message || 'Lỗi đặt lại mật khẩu.', true);
    } finally {
      setResettingPassword(false);
    }
  };

  // User Actions: Toggle Role
  const handleToggleRole = async (target: User) => {
    const nextRole = target.role === 'admin' ? 'member' : 'admin';
    const confirmMsg =
      nextRole === 'admin'
        ? `Nâng tài khoản "${target.name}" lên quyền Quản trị viên (Admin)?`
        : `Hạ tài khoản "${target.name}" xuống thành viên thông thường?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminApi.updateUserRole(target.id, nextRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u))
      );
      showNotification(`Đã cập nhật quyền của ${target.name} thành ${nextRole}.`);
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Không thể cập nhật quyền.', true);
    }
  };

  // User Actions: Delete User
  const handleExecuteDeleteUser = async () => {
    if (!deleteTargetUser) return;
    setDeletingUser(true);
    try {
      await adminApi.deleteUser(deleteTargetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      showNotification(`Đã xóa tài khoản "${deleteTargetUser.name}" thành công.`);
      setDeleteTargetUser(null);
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi xóa tài khoản.', true);
    } finally {
      setDeletingUser(false);
    }
  };

  // Comment Actions: Toggle Pin
  const handleTogglePin = async (c: AdminComment) => {
    try {
      await adminApi.updateComment(c.id, { isPinned: !c.isPinned });
      setComments((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, isPinned: !c.isPinned } : item))
      );
      showNotification(c.isPinned ? 'Đã bỏ ghim bình luận.' : 'Đã ghim bình luận lên đầu.');
    } catch (err: any) {
      showNotification(err.message || 'Không thể ghim bình luận.', true);
    }
  };

  // Comment Actions: Toggle Soft Delete / Restore
  const handleToggleDeleteComment = async (c: AdminComment) => {
    const willRestore = c.isDeleted;
    try {
      await adminApi.updateComment(c.id, { isDeleted: !willRestore });
      setComments((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, isDeleted: !willRestore } : item))
      );
      showNotification(willRestore ? 'Đã khôi phục bình luận.' : 'Đã xóa mềm bình luận.');
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Không thể cập nhật trạng thái bình luận.', true);
    }
  };

  // Comment Actions: Hard Delete
  const handleHardDeleteComment = async (c: AdminComment) => {
    if (!window.confirm(`Xóa vĩnh viễn bình luận này của "${c.userName}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    try {
      await adminApi.deleteCommentPermanently(c.id);
      setComments((prev) => prev.filter((item) => item.id !== c.id));
      showNotification('Đã xóa vĩnh viễn bình luận.');
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi xóa vĩnh viễn bình luận.', true);
    }
  };

  // Reaction Actions: Delete Reaction
  const handleDeleteReaction = async (r: AdminReaction) => {
    if (!window.confirm(`Xóa cảm xúc này của "${r.userName}"?`)) return;
    try {
      await adminApi.deleteReaction(r.id);
      setReactions((prev) => prev.filter((item) => item.id !== r.id));
      showNotification('Đã xóa cảm xúc.');
      loadStats();
    } catch (err: any) {
      showNotification(err.message || 'Lỗi xóa cảm xúc.', true);
    }
  };

  // Quick switch to tab filtered by user
  const handleFilterByUser = (userId: string, targetTab: 'comments' | 'reactions') => {
    if (targetTab === 'comments') {
      setCommentUserFilter(userId);
      setActiveTab('comments');
    } else {
      setReactionUserFilter(userId);
      setActiveTab('reactions');
    }
  };

  // Copy helper
  const handleCopyPassword = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Unauthenticated / Non-admin View
  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm text-slate-500">Đang kiểm tra quyền quản trị...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <Shield className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Khu Vực Quản Trị Viên
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Trang này chỉ dành cho quản trị viên của CLB Đọc Sách. Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {!isAuthenticated ? (
            <button
              onClick={() => openAuthModal('Đăng nhập bằng tài khoản quản trị để truy cập trang này.')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              Đăng nhập quản trị
            </button>
          ) : (
            <Link
              to="/"
              className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors"
            >
              Quay về Trang chủ
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 text-white shadow-xl text-sm font-medium animate-in slide-in-from-bottom-5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Bảng điều khiển</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            <span>Trung Tâm Quản Trị CLB</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quản lý đọc giả, đặt lại mật khẩu, kiểm duyệt bình luận và giám sát tương tác cộng đồng.
          </p>
        </div>

        {/* Global Refresh */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              loadStats();
              if (activeTab === 'users') loadUsers();
              if (activeTab === 'comments') loadComments();
              if (activeTab === 'reactions') loadReactions();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${statsLoading || usersLoading || commentsLoading || reactionsLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tổng Đọc Giả</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats?.totalUsers ?? '...'}
            </h3>
          </div>
        </div>

        {/* Total Comments */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Bình Luận Hoạt Động</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats?.totalComments ?? '...'}
            </h3>
          </div>
        </div>

        {/* Total Reactions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cảm Xúc & Tương Tác</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {stats?.totalReactions ?? '...'}
            </h3>
          </div>
        </div>

        {/* Admins count */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quản Trị Viên</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {users.filter((u) => u.role === 'admin').length || '1'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Đọc Giả & Mật Khẩu</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Kiểm Duyệt Bình Luận</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {comments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reactions')}
          className={`flex items-center gap-2 pb-3.5 px-4 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'reactions'
              ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Heart className="h-4 w-4" />
          <span>Cảm Xúc & Tương Tác</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {reactions.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS & PASSWORD MANAGEMENT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadUsers(userSearch);
              }}
              className="relative flex-1"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm đọc giả theo tên, email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </form>
            {userSearch && (
              <button
                onClick={() => {
                  setUserSearch('');
                  loadUsers('');
                }}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>

          {/* Users Table / Grid */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {usersLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-emerald-500" />
                <p className="text-xs">Đang tải danh sách đọc giả...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold">Không tìm thấy đọc giả nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Đọc giả</th>
                      <th className="py-3.5 px-4">Vai trò</th>
                      <th className="py-3.5 px-4">Hoạt động</th>
                      <th className="py-3.5 px-4">Ngày tham gia</th>
                      <th className="py-3.5 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${getAvatarBg(u.avatar)}`}>
                              <AvatarIcon avatarId={u.avatar} className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-white truncate">
                                {u.name}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
                              <Shield className="h-3 w-3" />
                              Quản trị viên
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              Đọc giả
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3 text-xs">
                            <button
                              onClick={() => handleFilterByUser(u.id, 'comments')}
                              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Xem bình luận của đọc giả này"
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-sky-500" />
                              <span>{u.commentCount ?? 0}</span>
                            </button>
                            <button
                              onClick={() => handleFilterByUser(u.id, 'reactions')}
                              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors"
                              title="Xem cảm xúc của đọc giả này"
                            >
                              <Heart className="h-3.5 w-3.5 text-rose-500" />
                              <span>{u.reactionCount ?? 0}</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                          {u.createdAt ? formatTimeAgo(u.createdAt) : '—'}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetTargetUser(u);
                                setCustomPassword('');
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-400 text-xs font-semibold transition-colors"
                              title="Đổi mật khẩu tài khoản này"
                            >
                              <Key className="h-3.5 w-3.5" />
                              <span>Đổi MK</span>
                            </button>

                            {/* Toggle Role */}
                            {u.id !== user?.id && (
                              <button
                                onClick={() => handleToggleRole(u)}
                                className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title={u.role === 'admin' ? 'Hạ quyền xuống đọc giả' : 'Nâng lên Quản trị viên'}
                              >
                                {u.role === 'admin' ? (
                                  <UserX className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-slate-400 hover:text-emerald-600" />
                                )}
                              </button>
                            )}

                            {/* Delete User */}
                            {u.id !== user?.id && (
                              <button
                                onClick={() => setDeleteTargetUser(u)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Xóa người dùng này"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COMMENTS MANAGEMENT                                                */}
      {/* ========================================================================= */}
      {activeTab === 'comments' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm nội dung bình luận, người đăng..."
                  value={commentSearch}
                  onChange={(e) => setCommentSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadComments()}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={commentStatusFilter}
                onChange={(e: any) => setCommentStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hiển thị</option>
                <option value="deleted">Đã xóa mềm</option>
              </select>

              {/* User filter tag */}
              {commentUserFilter && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <span>Lọc theo User</span>
                  <button
                    onClick={() => setCommentUserFilter('')}
                    className="hover:text-rose-600 ml-1 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => loadComments()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Tìm kiếm</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {commentsLoading ? (
              <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-emerald-500" />
                <p className="text-xs">Đang tải danh sách bình luận...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold">Không tìm thấy bình luận nào.</p>
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                    c.isPinned
                      ? 'border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                      : c.isDeleted
                      ? 'border-rose-200 dark:border-rose-900/40 opacity-75 bg-rose-50/20'
                      : 'border-slate-200/80 dark:border-slate-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Author & Meta */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${getAvatarBg(c.userAvatar)}`}>
                        <AvatarIcon avatarId={c.userAvatar} className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {c.userName}
                          </span>
                          {c.userRole === 'admin' && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                              Admin
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatTimeAgo(c.createdAt)}
                          </span>
                          {c.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                              <Pin className="h-3 w-3" />
                              Đã ghim
                            </span>
                          )}
                          {c.isDeleted && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                              Đã xóa mềm
                            </span>
                          )}
                        </div>

                        {/* Location Link */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {getBookTitle(c.bookId)}
                          </span>
                          <span>•</span>
                          <span>Chương: {c.chapterId}</span>
                          {c.questionId && (
                            <>
                              <span>•</span>
                              <span>Câu hỏi: {c.questionId}</span>
                            </>
                          )}
                          <Link
                            to={`/reader/${c.bookId}/${c.chapterId}`}
                            target="_blank"
                            className="inline-flex items-center gap-0.5 text-slate-400 hover:text-emerald-600 ml-1"
                            title="Mở bài đọc"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {/* Toggle Pin */}
                      <button
                        onClick={() => handleTogglePin(c)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                          c.isPinned
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={c.isPinned ? 'Bỏ ghim bình luận' : 'Ghim bình luận'}
                      >
                        <Pin className="h-4 w-4" />
                      </button>

                      {/* Restore / Soft Delete */}
                      <button
                        onClick={() => handleToggleDeleteComment(c)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-colors ${
                          c.isDeleted
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={c.isDeleted ? 'Khôi phục bình luận' : 'Xóa mềm bình luận'}
                      >
                        {c.isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                      </button>

                      {/* Hard Delete */}
                      <button
                        onClick={() => handleHardDeleteComment(c)}
                        className="p-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa vĩnh viễn khỏi hệ thống"
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mt-3 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line pl-13">
                    {c.content}
                  </div>

                  {/* Comment Stats Footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-400 pl-13">
                    <div className="flex items-center gap-4">
                      <span>{c.replyCount} phản hồi</span>
                      <span>{c.reactionCount} cảm xúc</span>
                      <span>ID: <code className="text-[11px]">{c.id.slice(0, 8)}...</code></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REACTIONS MANAGEMENT                                               */}
      {/* ========================================================================= */}
      {activeTab === 'reactions' && (
        <div className="space-y-6">
          {/* Emoji Distribution Quick Stats */}
          {stats?.reactionDistribution && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Phân bố cảm xúc cộng đồng
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {REACTION_DEFINITIONS.map((def) => {
                  const count = stats.reactionDistribution[def.type] || 0;
                  const isSelected = reactionTypeFilter === def.type;
                  return (
                    <button
                      key={def.type}
                      onClick={() => setReactionTypeFilter(isSelected ? '' : def.type)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <img src={def.iconUrl} alt={def.label} className="w-5 h-5 object-contain" />
                      <span>{def.label}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white dark:bg-slate-900 shadow-2xs font-extrabold">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2.5 items-center flex-1">
              <select
                value={reactionTargetFilter}
                onChange={(e) => setReactionTargetFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="">Tất cả đối tượng</option>
                <option value="chapter">Chương sách</option>
                <option value="comment">Bình luận</option>
                <option value="quiz_question">Câu hỏi trắc nghiệm</option>
              </select>

              {reactionUserFilter && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <span>Lọc theo User</span>
                  <button onClick={() => setReactionUserFilter('')} className="hover:text-rose-600 ml-1 font-bold">
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => loadReactions()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Tải lại</span>
            </button>
          </div>

          {/* Reactions Grid / Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            {reactionsLoading ? (
              <div className="p-12 text-center text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin mx-auto mb-2 text-emerald-500" />
                <p className="text-xs">Đang tải danh sách tương tác...</p>
              </div>
            ) : reactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Heart className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-semibold">Chưa có cảm xúc nào được ghi nhận.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Đọc giả</th>
                      <th className="py-3.5 px-4">Cảm xúc</th>
                      <th className="py-3.5 px-4">Đối tượng nhận</th>
                      <th className="py-3.5 px-4">Thời gian</th>
                      <th className="py-3.5 px-6 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {reactions.map((r) => {
                      const def = REACTION_DEFINITIONS.find((d) => d.type === r.reactionType);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${getAvatarBg(r.userAvatar)}`}>
                                <AvatarIcon avatarId={r.userAvatar} className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                  {r.userName}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate">{r.userEmail}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                              {def ? (
                                <>
                                  <img src={def.iconUrl} alt={def.label} className="w-4 h-4 object-contain" />
                                  <span>{def.label}</span>
                                </>
                              ) : (
                                <span>{r.reactionType}</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 capitalize">
                              {r.targetType === 'chapter' ? 'Chương sách' : r.targetType === 'comment' ? 'Bình luận' : r.targetType}:
                            </span>{' '}
                            <code className="text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                              {r.targetId}
                            </code>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                            {formatTimeAgo(r.createdAt)}
                          </td>

                          <td className="py-3.5 px-6 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDeleteReaction(r)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Xóa cảm xúc này"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL: CONFIRM RESET PASSWORD                                         */}
      {/* ========================================================================= */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Đặt Lại Mật Khẩu
                </h3>
                <p className="text-xs text-slate-500">
                  Tài khoản: <span className="font-semibold text-slate-700 dark:text-slate-300">{resetTargetUser.name}</span> ({resetTargetUser.email})
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mật khẩu mới (Tùy chọn)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(100000 + Math.random() * 900000);
                      setCustomPassword(`Clb@${rand}`);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    <Sparkles className="h-3 w-3" />
                    Sinh mật khẩu ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Để trống để hệ thống tự tạo mật khẩu an toàn..."
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
                >
                  {resettingPassword ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Key className="h-3.5 w-3.5" />
                  )}
                  <span>Xác nhận đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL: PASSWORD RESET SUCCESS DISPLAY                                 */}
      {/* ========================================================================= */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Đổi Mật Khẩu Thành Công!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Đã cập nhật mật khẩu cho đọc giả <span className="font-bold text-slate-800 dark:text-slate-200">{resetResult.user.name}</span>.
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Mật khẩu mới:
              </p>
              <div className="flex items-center justify-between">
                <code className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all">
                  {resetResult.newPassword}
                </code>
                <button
                  onClick={() => handleCopyPassword(resetResult.newPassword)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setResetResult(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-MODAL: DELETE USER CONFIRMATION                                       */}
      {/* ========================================================================= */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xóa Tài Khoản Đọc Giả?
                </h3>
                <p className="text-xs text-slate-500">
                  Thao tác này sẽ xóa vĩnh viễn tài khoản và toàn bộ bình luận, cảm xúc liên quan.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              Bạn đang xóa đọc giả: <strong>{deleteTargetUser.name}</strong> ({deleteTargetUser.email})
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteUser}
                disabled={deletingUser}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
              >
                {deletingUser ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
