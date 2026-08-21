import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Headphones, Clock, CheckCircle2, ChevronRight, Sparkles, Play } from 'lucide-react';
import { Book } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useAudio } from '../../context/AudioContext';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();
  const { getProgressForBook } = useHistory();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const progress = getProgressForBook(book.id);

  const isAudioPlayingThisBook = isPlaying && currentTrack?.bookId === book.id;

  const isAvailable = book.status === 'available';
  const completedChaptersCount = progress?.completedChapterIds?.length || 0;
  const progressPercent =
    book.totalChapters > 0
      ? Math.round((completedChaptersCount / book.totalChapters) * 100)
      : progress?.progressPercent || 0;

  return (
    <div
      onClick={() => isAvailable && navigate(`/book/${book.id}`)}
      className={`group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isAvailable ? 'cursor-pointer hover:-translate-y-1 hover:border-emerald-500/50 dark:hover:border-emerald-500/40' : 'opacity-85'
      }`}
    >
      {/* Cover Header Banner - Portrait 3:4 Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        {book.coverUrl ? (
          <div className="relative h-full w-full overflow-hidden">
            {/* Ambient background blur */}
            <img
              src={book.coverUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover blur-sm scale-105 opacity-25"
            />
            {/* Main sharp cover image */}
            <img
              src={book.coverUrl}
              alt={book.title}
              className="relative h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Left 3D Book Spine shadow */}
            <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-10" />
            {/* Bottom gradient overlay to make bottom badges pop */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none z-10" />
          </div>
        ) : (
          <div className={`relative h-full w-full bg-gradient-to-br ${book.gradient} flex flex-col justify-between p-5 text-white overflow-hidden`}>
            {/* Texture and ambient highlights */}
            <div className="absolute inset-0 bg-radial from-white/15 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-3.5 bg-white/15 border-r border-white/20" />

            {/* Top insignia */}
            <div className="relative z-10 flex items-center justify-between pl-2">
              <div className="h-8 w-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Center title & author in book layout */}
            <div className="relative z-10 text-center px-2 pl-4 my-auto">
              <h3 className="font-extrabold text-base sm:text-lg leading-snug drop-shadow-md line-clamp-3">
                {book.title}
              </h3>
              <div className="h-0.5 w-8 bg-white/40 mx-auto my-2.5 rounded-full" />
              <p className="text-xs text-white/90 font-medium line-clamp-1">{book.author}</p>
            </div>

            {/* Bottom spacer */}
            <div className="h-6" />
          </div>
        )}

        {/* Status Badge (only if not yet available) */}
        {!isAvailable && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-slate-200 shadow-md border border-white/15">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Sắp ra mắt
            </span>
          </div>
        )}

        {/* Audio & Chapter Counter Badges */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5">
          {book.totalAudios > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playTrack(book, 0);
              }}
              className={`flex items-center gap-1 rounded-lg backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold transition-all shadow-md border hover:scale-105 active:scale-95 ${
                isAudioPlayingThisBook
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-2 ring-emerald-400/40 animate-pulse'
                  : 'bg-black/75 hover:bg-emerald-600 text-white border-white/15'
              }`}
              title="Bấm để phát Audio ngay"
            >
              <Headphones className="h-3 w-3 text-emerald-300" />
              <span>{book.totalAudios} audio</span>
            </button>
          )}
          {book.totalChapters > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-black/65 backdrop-blur-md px-2 py-1 text-[11px] font-medium text-white shadow-md border border-white/10">
              <BookOpen className="h-3 w-3 text-teal-400" />
              {book.totalChapters} chương
            </span>
          )}
        </div>
      </div>

      {/* Book Content Info */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 line-clamp-1">
            {book.category}
          </span>
        </div>

        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3 line-clamp-1">
          Tác giả: <span className="font-medium text-slate-700 dark:text-slate-300">{book.author}</span>
          {book.translator && ` • Dịch: ${book.translator}`}
        </p>

        {/* Progress bar if user has started */}
        {progress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Đã hoàn thành {progressPercent}%</span>
              <span>{completedChaptersCount}/{book.totalChapters} chương</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Bottom Tags & Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap gap-1">
            {book.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          {isAvailable ? (
            <span className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              {progress ? 'Đọc tiếp' : 'Xem sách'}
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
              Đang biên soạn
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
