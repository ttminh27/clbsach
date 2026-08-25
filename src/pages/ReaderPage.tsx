import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { MarkdownViewer } from '../components/reader/MarkdownViewer';
import { TableOfContentsDrawer } from '../components/reader/TableOfContentsDrawer';
import { ChapterNavigation } from '../components/reader/ChapterNavigation';
import { QuizModal } from '../components/quiz/QuizModal';
import { TTSPlayerBar } from '../components/reader/TTSPlayerBar';
import booksData from '../data/books-manifest.json';
import { Book, Chapter } from '../types/book';
import { useHistory } from '../context/HistoryContext';
import { useAudio } from '../context/AudioContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import { trackReadChapter } from '../utils/analytics';

const books: Book[] = booksData as Book[];

export const ReaderPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { saveProgress } = useHistory();
  const { pause: pauseAudio, isPlaying: isAudioPlaying } = useAudio();

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTOCDrawerOpen, setIsTOCDrawerOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const book = books.find((b) => b.id === bookId);
  const currentChapter = book?.chapters.find((c) => c.id === chapterId);

  // Initialize Web Speech TTS hook
  const tts = useTextToSpeech({
    onStateChange: (speaking) => {
      if (speaking && isAudioPlaying) {
        pauseAudio(); // Pause background MP3 audio when TTS starts
      }
    },
  });

  // If audio player starts playing, stop TTS speech
  useEffect(() => {
    if (isAudioPlaying && (tts.isPlaying || tts.isPaused)) {
      tts.stop();
    }
  }, [isAudioPlaying]);

  // Update page title & track chapter read
  useEffect(() => {
    if (book && currentChapter) {
      document.title = `${currentChapter.title} - ${book.title} | CLB đọc sách`;
      trackReadChapter(book.id, book.title, currentChapter.id, currentChapter.title, currentChapter.order);
    }
  }, [book, currentChapter]);

  // Fetch Chapter Markdown content
  useEffect(() => {
    if (!book || !currentChapter) {
      setError('Không tìm thấy chương này trong sách.');
      setLoading(false);
      return;
    }

    // Stop active TTS when switching chapters
    tts.stop();
    tts.setIsPlayerVisible(false);

    setLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'instant' });

    fetch(currentChapter.fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Không thể tải nội dung (${res.status})`);
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);

        // Save to reading history
        saveProgress({
          bookId: book.id,
          bookTitle: book.title,
          lastChapterId: currentChapter.id,
          lastChapterTitle: currentChapter.title,
          lastChapterOrder: currentChapter.order,
          progressPercent: Math.round((currentChapter.order / book.chapters.length) * 100),
          scrollRatio: 0,
          completedChapterIds: [currentChapter.id],
        });
      })
      .catch((err) => {
        console.error('Error loading markdown:', err);
        setError(err.message || 'Lỗi tải nội dung chương.');
        setLoading(false);
      });
  }, [bookId, chapterId]);

  // Refresh TTS paragraphs once content is rendered
  useEffect(() => {
    if (!loading && content) {
      // Small timeout to allow ReactMarkdown DOM rendering to finalize
      const timer = setTimeout(() => {
        tts.collectParagraphsFromDOM();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Escape') {
        setIsTOCDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTTS = () => {
    if (tts.isPlaying) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.resume();
    } else if (tts.isPlayerVisible) {
      tts.play();
    } else {
      tts.setIsPlayerVisible(true);
      tts.play(0);
    }
  };

  const handleReadFromIndex = (index: number) => {
    if (isAudioPlaying) {
      pauseAudio();
    }
    tts.setIsPlayerVisible(true);
    tts.jumpTo(index);
  };

  if (!book || !currentChapter) {
    return (
      <div className="mx-auto max-w-md py-20 px-4 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Chương không tồn tại
        </h3>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Về Trang chủ
          </Link>
          {book && (
            <Link
              to={`/book/${book.id}`}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
            >
              Chi tiết sách
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Reader Toolbar */}
      <ReaderToolbar
        book={book}
        currentChapter={currentChapter}
        onOpenTOC={() => setIsTOCDrawerOpen(true)}
        scrollProgress={scrollProgress}
        isTTSActive={tts.isPlayerVisible}
        isTTSSpeaking={tts.isPlaying}
        onToggleTTS={handleToggleTTS}
      />

      {/* Main Chapter Content */}
      <main className="min-h-[70vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang tải nội dung chương...
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-center my-12">
            <AlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">{error}</p>
          </div>
        ) : (
          <>
            <MarkdownViewer
              content={content}
              bookId={book.id}
              currentTTSIndex={tts.currentParagraphIndex}
              isTTSSpeaking={tts.isPlaying || tts.isPaused}
              onReadFromIndex={handleReadFromIndex}
            />
            <ChapterNavigation
              book={book}
              currentChapter={currentChapter}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />
          </>
        )}
      </main>

      {/* Web Speech API TTS Floating Player Bar */}
      {tts.isPlayerVisible && (
        <TTSPlayerBar
          isPlaying={tts.isPlaying}
          isPaused={tts.isPaused}
          currentParagraphIndex={tts.currentParagraphIndex}
          totalParagraphs={tts.totalParagraphs}
          voices={tts.voices}
          selectedVoice={tts.selectedVoice}
          hasVietnameseVoice={tts.hasVietnameseVoice}
          playbackRate={tts.playbackRate}
          autoScroll={tts.autoScroll}
          isSupported={tts.isSupported}
          onPlay={() => {
            if (isAudioPlaying) pauseAudio();
            tts.play();
          }}
          onPause={tts.pause}
          onResume={() => {
            if (isAudioPlaying) pauseAudio();
            tts.resume();
          }}
          onTogglePlay={() => {
            if (isAudioPlaying) pauseAudio();
            tts.togglePlay();
          }}
          onStop={tts.stop}
          onNext={tts.next}
          onPrev={tts.prev}
          onJumpTo={tts.jumpTo}
          onChangeRate={tts.changeRate}
          onChangeVoice={tts.changeVoice}
          onToggleAutoScroll={() => tts.setAutoScroll(!tts.autoScroll)}
          onClose={() => {
            tts.stop();
            tts.setIsPlayerVisible(false);
          }}
        />
      )}

      {/* Table of Contents Drawer */}
      <TableOfContentsDrawer
        book={book}
        currentChapterId={currentChapter.id}
        isOpen={isTOCDrawerOpen}
        onClose={() => setIsTOCDrawerOpen(false)}
      />

      {/* Chapter Quiz Modal */}
      <QuizModal
        book={book}
        chapter={currentChapter}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
      />
    </div>
  );
};
