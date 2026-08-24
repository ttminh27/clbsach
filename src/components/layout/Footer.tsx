import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 py-10 px-4 sm:px-6 lg:px-8 mt-16 transition-colors pb-24 md:pb-10">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2.5">
            <img src="/logo-64.png" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-base text-slate-900 dark:text-white">
              CLB đọc sách <span className="text-emerald-600 dark:text-emerald-400">VietinBank</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Nền tảng đọc sách & nghe audio thông minh, tối ưu trải nghiệm trên mọi thiết bị.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Thư viện sách
          </Link>
          <Link to="/history" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Lịch sử đọc
          </Link>
          <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Giới thiệu dự án
          </Link>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1">
          <span>Xây dựng với</span>
          <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
          <span>cho cộng đồng yêu sách</span>
        </div>
      </div>
    </footer>
  );
};
