import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Search,
  Key,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types/auth';
import { adminApi } from '../../services/api';
import { AvatarIcon, getAvatarBg } from '../auth/AvatarPresets';
import { formatTimeAgo } from '../../utils/timeAgo';

interface AdminUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUsersModal: React.FC<AdminUsersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected user for password reset
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    user: { name: string; email: string };
    newPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch users
  const loadUsers = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers(query);
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers(search);
      setResetTargetUser(null);
      setResetResult(null);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(search);
  };

  const handleOpenResetModal = (target: User) => {
    setResetTargetUser(target);
    setCustomPassword('');
    setError(null);
    setResetResult(null);
    setCopied(false);
  };

  const handleGenerateRandomPassword = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setCustomPassword(`Clb@${randomNum}`);
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;

    setResetting(true);
    setError(null);
    try {
      const res = await adminApi.resetPassword(resetTargetUser.id, customPassword);
      setResetResult({
        user: {
          name: res.user.name,
          email: res.user.email,
        },
        newPassword: res.newPassword,
      });
      setResetTargetUser(null);
      setCustomPassword('');
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi khi đặt lại mật khẩu.');
    } finally {
      setResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!resetResult) return;
    navigator.clipboard.writeText(resetResult.newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Quản lý Đọc giả & Đặt lại Mật khẩu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tìm kiếm tài khoản thành viên và cấp lại mật khẩu đăng nhập
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Success Banner when password was just reset */}
          {resetResult && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Đặt lại mật khẩu thành công cho: {resetResult.user.name} ({resetResult.user.email})</span>
                </div>
                <button
                  onClick={() => setResetResult(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                Mật khẩu mới đã được cập nhật trực tiếp vào cơ sở dữ liệu. Hãy sao chép và gửi cho đọc giả:
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 font-mono text-sm font-bold bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 select-all">
                  {resetResult.newPassword}
                </div>
                <button
                  onClick={handleCopyPassword}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search bar & Refresh */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm theo tên đọc giả hoặc email..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                loadUsers('');
              }}
              title="Tải lại danh sách"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </form>

          {/* Users List */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                <span>Đang tải danh sách thành viên...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Không tìm thấy thành viên nào phù hợp.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getAvatarBg(u.avatar)}`}>
                        <AvatarIcon avatarId={u.avatar} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {u.name}
                          </span>
                          {u.role === 'admin' ? (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              Đọc giả
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {u.email}
                          {u.createdAt && (
                            <span> • Tham gia {formatTimeAgo(u.createdAt)}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleOpenResetModal(u)}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-2xs"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span>Đổi mật khẩu</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Tổng số: {users.length} tài khoản</span>
          <span>Bảo mật chuẩn PBKDF2 (100.000 vòng)</span>
        </div>
      </div>

      {/* Sub-modal: Confirm Reset Password */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Key className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đặt lại mật khẩu
                </h4>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Target info preview */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getAvatarBg(resetTargetUser.avatar)}`}>
                <AvatarIcon avatarId={resetTargetUser.avatar} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {resetTargetUser.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {resetTargetUser.email}
                </p>
              </div>
            </div>

            <form onSubmit={handleExecuteReset} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mật khẩu mới (tùy chọn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Để trống sẽ tự sinh mật khẩu ngẫu nhiên"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    title="Tự sinh mật khẩu"
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Sinh ngẫu nhiên</span>
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Tối thiểu 6 ký tự nếu bạn tự nhập mật khẩu riêng.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-xs disabled:opacity-50"
                >
                  {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Key className="h-3.5 w-3.5" />}
                  <span>Xác nhận đặt lại</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
