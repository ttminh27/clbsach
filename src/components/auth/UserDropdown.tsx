import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User, Check, Edit3, X, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAvatarBg, AVATAR_OPTIONS, AvatarIcon } from './AvatarPresets';
import { AdminUsersModal } from '../admin/AdminUsersModal';

export const UserDropdown: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal('Đăng nhập để lưu cảm nghĩ và tham gia thảo luận cùng CLB.')}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-xs"
      >
        <LogIn className="h-3.5 w-3.5" />
        <span>Đăng nhập</span>
      </button>
    );
  }

  const handleStartEdit = () => {
    setEditName(user.name);
    setEditAvatar(user.avatar);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(editName.trim(), editAvatar);
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl p-1 sm:px-2.5 sm:py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-xs"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${getAvatarBg(user.avatar)}`}>
          <AvatarIcon avatarId={user.avatar} className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
          {user.name}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
          {!isEditing ? (
            <>
              {/* Profile Card */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getAvatarBg(user.avatar)}`}>
                  <AvatarIcon avatarId={user.avatar} className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                      Đọc giả
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Trang Quản Trị CLB</span>
                  </button>
                )}

                <button
                  onClick={handleStartEdit}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  <span>Đổi tên & Linh vật</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </>
          ) : (
            /* Edit Mini Form */
            <form onSubmit={handleSaveEdit} className="space-y-3 p-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Cập nhật hồ sơ</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Tên hiển thị mới"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="grid grid-cols-6 gap-1.5">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEditAvatar(opt.id)}
                      title={opt.name}
                      className={`h-8 rounded-lg flex items-center justify-center ${opt.bgColor} ${
                        editAvatar === opt.id ? 'ring-2 ring-emerald-500 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <AvatarIcon avatarId={opt.id} className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Lưu
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Admin Users Management Modal */}
      {user.role === 'admin' && (
        <AdminUsersModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />
      )}
    </div>
  );
};
