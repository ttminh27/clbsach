import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Headphones, Clock, ArrowLeft, Bookmark, CheckCircle2, Share2, Sparkles } from 'lucide-react';
import { Book } from '../../types/book';
import { useHistory } from '../../context/HistoryContext';
import { useAudio } from '../../context/AudioContext';

interface BookHeaderProps {
  book: Book;
  activeTab: 'chapters' | 'audios' | 'info';
  onTabChange: (tab: 'chapters' | 'audios' | 'info') => void;
}

export const BookHeader: React.FC<BookHeaderProps> = ({ book, activeTab, onTabChange }) => {
  const { getProgressForBook } = useHistory();
  const { playTrack, isPlaying, currentTrack } = useAudio();
  const progress = getProgressForBook(book.id);

  const completedCount = progress?.completedChapterIds?.length || 0;
  const isAvailable = book.status === 'available';

  const firstChapterId = book.chapters.length > 0 ? book.chapters[0].id : '';
  const continueChapterId = progress?.lastChapterId || firstChapterId;
  const isAudioPlayingThisBook = isPlaying && currentTrack?.bookId === book.id;

  const totalReadingTime = book.chapters.reduce((acc, c) => acc + c.readingTimeMin, 0);

  return (
    <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8 overflow-hidden">
      {/* Background ambient glow */}
      <div className={`absolute top-0 right-0 -mt-20 -mr-20 h-72 w-72 rounded-full bg-gradient-to-br ${book.gradient} opacity-15 blur-3xl`}></div>

      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Thư viện
        </Link>

        <div className="flex items-center gap-2">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Sẵn sàng Đọc & Nghe
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Sách đang chuẩn bị
            </span>
          )}
        </div>
      </div>

      {/* Main Book Info Row */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Book Cover */}
        <div className="w-full md:w-56 shrink-0 flex justify-center md:justify-start">
          <div className="relative aspect-[2/3] w-48 sm:w-56 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-xl border border-slate-200/60 dark:border-slate-700/50">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${book.gradient} flex flex-col items-center justify-center p-6 text-center text-white`}>
                <BookOpen className="h-12 w-12 text-white/80 mb-3" />
                <h3 className="font-bold text-base">{book.title}</h3>
                <p className="text-xs text-white/80 mt-1">{book.author}</p>
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 text-xs font-medium">
              {book.category}
            </span>
            {book.tags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {book.title}
          </h1>
          {book.originalTitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
              Tiêu đề gốc: {book.originalTitle}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400">Tác giả:</span>{' '}
              <strong className="font-semibold text-slate-800 dark:text-slate-200">{book.author}</strong>
            </div>
            {book.translator && (
              <div>
                <span className="text-slate-400">Dịch giả:</span>{' '}
                <span className="font-medium text-slate-800 dark:text-slate-200">{book.translator}</span>
              </div>
            )}
            {totalReadingTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Thời gian đọc: ~{Math.round(totalReadingTime / 60)} giờ ({totalReadingTime} phút)</span>
              </div>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {book.description}
          </p>

          {/* Reading Progress */}
          {progress && (
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Bookmark className="h-3.5 w-3.5 text-emerald-500" />
                  Tiến độ đọc của bạn
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {completedCount}/{book.totalChapters} chương ({Math.round((completedCount / book.totalChapters) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, (completedCount / book.totalChapters) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          {isAvailable ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={`/reader/${book.id}/${continueChapterId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95"
              >
                <BookOpen className="h-4 w-4" />
                {progress ? 'Tiếp Tục Đọc' : 'Bắt Đầu Đọc'}
              </Link>

              {book.audios.length > 0 && (
                <button
                  onClick={() => playTrack(book, 0)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold transition-all ${
                    isAudioPlayingThisBook
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
                  }`}
                >
                  <Headphones className="h-4 w-4" />
                  {isAudioPlayingThisBook ? 'Đang Nghe Audio' : 'Phát Audio'}
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
              <span>Sách đang được biên soạn nội dung số & audio. Vui lòng quay lại sau!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Row */}
      {isAvailable && (
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => onTabChange('chapters')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'chapters'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Mục Lục Chương ({book.totalChapters})
          </button>

          {book.totalAudios > 0 && (
            <button
              onClick={() => onTabChange('audios')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                activeTab === 'audios'
                  ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Headphones className="h-4 w-4" />
              Danh Sách Audio ({book.totalAudios})
            </button>
          )}

          <button
            onClick={() => onTabChange('info')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
              activeTab === 'info'
                ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            Giới Thiệu Tác Phẩm
          </button>
        </div>
      )}
    </div>
  );
};
