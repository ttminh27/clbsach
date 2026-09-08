import React, { useState, useEffect } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AVATAR_OPTIONS, AvatarIcon } from './AvatarPresets';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalIntent, closeAuthModal, login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
    }
  }, [isAuthModalOpen, tab]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Vui lòng nhập tên hiển thị.');
        }
        await register(name, email, password, selectedAvatar);
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon & Intent */}
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-2 flex items-center justify-center mb-3 shadow-xs border border-emerald-100/80 dark:border-emerald-800/40">
            <img src="/logo-192.png" alt="CLB Đọc Sách" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            CLB Đọc Sách
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {authModalIntent || 'Tham gia thảo luận, lưu cảm nghĩ và kết nối cùng cộng đồng đọc sách.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Tạo tài khoản
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hiển thị
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Minh Đọc Sách, Lan Hương..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Chọn linh vật đại diện
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAvatar(opt.id)}
                      title={opt.name}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                        opt.bgColor
                      } ${
                        selectedAvatar === opt.id
                          ? 'ring-2 ring-emerald-500 scale-105 shadow-xs'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <AvatarIcon avatarId={opt.id} className="h-6 w-6" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 py-3 text-xs font-bold text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : tab === 'login' ? (
              <>
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập ngay</span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Hoàn tất đăng ký</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
