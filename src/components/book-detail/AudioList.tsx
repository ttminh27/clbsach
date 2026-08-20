import React from 'react';
import { Headphones, Play, Pause, Clock, Volume2, Sparkles } from 'lucide-react';
import { Book } from '../../types/book';
import { useAudio } from '../../context/AudioContext';

interface AudioListProps {
  book: Book;
}

export const AudioList: React.FC<AudioListProps> = ({ book }) => {
  const { playTrack, togglePlay, currentTrack, isPlaying, setIsPlayerModalOpen } = useAudio();

  if (book.audios.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center bg-white dark:bg-slate-900">
        <Headphones className="h-10 w-10 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Chưa có file audio cho tựa sách này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 border border-emerald-200/50 dark:border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            28 Bài Tập Thiền & Tỉnh Thức
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Các bài hướng dẫn thiền chánh niệm theo ngày đi kèm trong chương trình Search Inside Yourself.
          </p>
        </div>

        <button
          onClick={() => playTrack(book, 0)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/20 shrink-0"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          Phát Tất Cả (Từ Ngày 01)
        </button>
      </div>

      {/* Audio Track List */}
      <div className="grid gap-2.5">
        {book.audios.map((track, index) => {
          const isThisTrackPlaying =
            currentTrack?.id === track.id && currentTrack?.bookId === book.id && isPlaying;
          const isThisTrackCurrent =
            currentTrack?.id === track.id && currentTrack?.bookId === book.id;

          return (
            <div
              key={track.id}
              onClick={() => {
                if (isThisTrackCurrent) {
                  togglePlay();
                } else {
                  playTrack(book, index);
                }
              }}
              className={`group flex items-center justify-between rounded-2xl border p-4 transition-all cursor-pointer ${
                isThisTrackCurrent
                  ? 'border-emerald-500 bg-gradient-to-r from-emerald-50/80 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 shadow-sm ring-1 ring-emerald-500/30'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Play Button with active ring */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isThisTrackCurrent) {
                      togglePlay();
                    } else {
                      playTrack(book, index);
                    }
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all group-hover:scale-105 ${
                    isThisTrackCurrent
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:bg-emerald-500 group-hover:text-white shadow-xs'
                  }`}
                  title={isThisTrackPlaying ? 'Tạm dừng' : 'Phát bài này'}
                >
                  {isThisTrackPlaying ? (
                    <Pause className="h-4 w-4 fill-white" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  )}
                </button>

                {/* Track Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {track.prefix}
                    </span>
                    <h4
                      className={`font-semibold text-sm truncate transition-colors ${
                        isThisTrackCurrent
                          ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}
                    >
                      {track.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1 flex items-center gap-2">
                    <span>Hướng dẫn thiền thực hành</span>
                    {isThisTrackCurrent && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                        • Đang chọn
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status / Equalizer Animation & Open Full Player button */}
              <div className="flex items-center gap-3 pl-3 shrink-0">
                {isThisTrackPlaying && (
                  <div className="flex items-end gap-0.5 h-4 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                    <div className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3.5"></div>
                    <div className="w-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s] h-2.5"></div>
                    <div className="w-1 bg-emerald-500 rounded-full animate-bounce h-3.5"></div>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isThisTrackCurrent) {
                      playTrack(book, index);
                    }
                    setIsPlayerModalOpen(true);
                  }}
                  className="rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors hidden sm:inline-flex items-center gap-1"
                  title="Mở trình phát đầy đủ"
                >
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Nghe</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
