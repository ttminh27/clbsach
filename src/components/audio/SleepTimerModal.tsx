import React from 'react';
import { X, Moon, Clock, Check } from 'lucide-react';
import { useAudio } from '../../context/AudioContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimerMinutes, setSleepTimer, sleepTimerRemaining } = useAudio();

  if (!isOpen) return null;

  const timerOptions = [
    { label: 'Tắt hẹn giờ', value: null },
    { label: 'Hết bài hiện tại', value: -1 },
    { label: '15 phút', value: 15 },
    { label: '30 phút', value: 30 },
    { label: '45 phút', value: 45 },
    { label: '60 phút (1 tiếng)', value: 60 },
  ];

  const formatRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Hẹn Giờ Tắt Audio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sleepTimerRemaining !== null && (
          <div className="my-4 flex items-center justify-between rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 p-3.5 border border-indigo-200/60 dark:border-indigo-800/60 text-xs">
            <span className="text-indigo-900 dark:text-indigo-300 font-medium">
              Đang đếm ngược còn lại:
            </span>
            <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
              {formatRemaining(sleepTimerRemaining)}
            </span>
          </div>
        )}

        <div className="mt-4 space-y-1.5">
          {timerOptions.map((opt) => {
            const isSelected = sleepTimerMinutes === opt.value;
            return (
              <button
                key={String(opt.value)}
                onClick={() => {
                  setSleepTimer(opt.value);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 opacity-70" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
