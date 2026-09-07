import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, Headphones, Home, Info, HelpCircle } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const { currentTrack, setIsPlayerModalOpen } = useAudio();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 px-2 py-1 transition-colors">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium transition-colors ${
            location.pathname === '/'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Home className="h-5 w-5 mb-0.5" />
          Trang Chủ
        </Link>

        <Link
          to="/about"
          className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium transition-colors ${
            location.pathname === '/about'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Info className="h-5 w-5 mb-0.5" />
          Giới Thiệu
        </Link>

        <Link
          to="/guide"
          className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium transition-colors ${
            location.pathname === '/guide' || location.pathname === '/huong-dan'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="h-5 w-5 mb-0.5" />
          Hướng Dẫn
        </Link>

        <Link
          to="/history"
          className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium transition-colors ${
            location.pathname === '/history'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <History className="h-5 w-5 mb-0.5" />
          Tiến Độ
        </Link>

        {currentTrack && (
          <button
            onClick={() => setIsPlayerModalOpen(true)}
            className="flex flex-col items-center py-1 px-2.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 animate-pulse"
          >
            <Headphones className="h-5 w-5 mb-0.5" />
            Đang Phát
          </button>
        )}
      </div>
    </div>
  );
};
