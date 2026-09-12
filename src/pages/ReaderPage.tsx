import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReaderToolbar } from '../components/reader/ReaderToolbar';
import { MarkdownViewer } from '../components/reader/MarkdownViewer';
import { TableOfContentsDrawer } from '../components/reader/TableOfContentsDrawer';
import { ChapterNavigation } from '../components/reader/ChapterNavigation';
import { QuizModal } from '../components/quiz/QuizModal';
import { TTSPlayerBar } from '../components/reader/TTSPlayerBar';
import { CommentSection } from '../components/interaction/CommentSection';
import { ChapterDiscussionDrawer } from '../components/interaction/ChapterDiscussionDrawer';
import { ChapterSearchBar } from '../components/reader/ChapterSearchBar';
import booksData from '../data/books-manifest.json';
import { Book, Chapter } from '../types/book';
import { useHistory } from '../context/HistoryContext';
import { useAudio } from '../context/AudioContext';
import { useReaderSettings } from '../context/ReaderSettingsContext';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Loader2, AlertCircle, Home, Check } from 'lucide-react';
import { trackReadChapter } from '../utils/analytics';
import {
  findMatchesInElement,
  applyCSSHighlights,
  clearCSSHighlights,
  scrollToMatch,
  SearchMatch,
} from '../utils/chapterSearch';

const books: Book[] = booksData as Book[];

export const ReaderPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { saveProgress } = useHistory();
  const { pause: pauseAudio, isPlaying: isAudioPlaying } = useAudio();
  const { settings } = useReaderSettings();

  const getMaxWidthClass = () => {
    switch (settings.maxWidth) {
      case 'narrow':
        return 'max-w-2xl';
      case 'wide':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-6xl';
      case 'medium':
      default:
        return 'max-w-3xl';
    }
  };

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isTOCDrawerOpen, setIsTOCDrawerOpen] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isDiscussionDrawerOpen, setIsDiscussionDrawerOpen] = useState<boolean>(false);

  // Chapter In-page Search States
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [activeMatchIndex, setActiveMatchIndex] = useState<number>(0);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  const cleanChapterId = chapterId ? chapterId.replace(/\.md$/i, '') : '';
  const book = books.find((b) => b.id === bookId);
  const currentChapter = book?.chapters.find(
    (c) => c.id === cleanChapterId || c.id === chapterId || c.fileName === chapterId
  );

  // Normalize URL if chapterId has .md extension
  useEffect(() => {
    if (bookId && chapterId && chapterId.endsWith('.md') && currentChapter) {
      navigate(`/reader/${bookId}/${currentChapter.id}`, { replace: true });
    }
  }, [bookId, chapterId, currentChapter, navigate]);

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
        setContent(text.normalize('NFC'));
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
  }, [bookId, currentChapter?.id]);

  // Refresh TTS paragraphs & handle anchor hash once content is rendered
  useEffect(() => {
    if (!loading && content) {
      // Small timeout to allow ReactMarkdown DOM rendering to finalize
      const timer = setTimeout(() => {
        tts.collectParagraphsFromDOM();

        // If URL has a hash anchor, scroll smoothly to target element
        if (window.location.hash) {
          const targetId = window.location.hash.slice(1);
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  // Reset search when switching chapters
  useEffect(() => {
    clearCSSHighlights();
    setIsSearchOpen(false);
    setSearchQuery('');
    setMatches([]);
    setActiveMatchIndex(0);
  }, [bookId, currentChapter?.id]);

  // Search execution & highlight update
  useEffect(() => {
    if (!isSearchOpen || !searchQuery.trim() || loading) {
      clearCSSHighlights();
      setMatches([]);
      setActiveMatchIndex(0);
      return;
    }

    const timer = setTimeout(() => {
      const articleEl = document.getElementById('chapter-content-article');
      if (!articleEl) return;

      const foundMatches = findMatchesInElement(articleEl, searchQuery);
      setMatches(foundMatches);
      setActiveMatchIndex(0);

      if (foundMatches.length > 0) {
        applyCSSHighlights(foundMatches, 0);
        scrollToMatch(foundMatches[0]);
      } else {
        clearCSSHighlights();
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen, loading]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matches.length;
    setActiveMatchIndex(nextIdx);
    applyCSSHighlights(matches, nextIdx);
    scrollToMatch(matches[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matches.length) % matches.length;
    setActiveMatchIndex(prevIdx);
    applyCSSHighlights(matches, prevIdx);
    scrollToMatch(matches[prevIdx]);
  };

  const handleJumpToMatch = (index: number) => {
    if (index >= 0 && index < matches.length) {
      setActiveMatchIndex(index);
      applyCSSHighlights(matches, index);
      scrollToMatch(matches[index]);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    clearCSSHighlights();
  };

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      handleCloseSearch();
    } else {
      setIsSearchOpen(true);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F / Cmd+F opens chapter search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Don't trigger when user is typing in an input unless it's Escape
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          handleCloseSearch();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (isSearchOpen) {
          handleCloseSearch();
          return;
        }
        setIsTOCDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const handleToggleTTS = useCallback(() => {
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
  }, [tts]);

  const handleReadFromIndex = useCallback((index: number) => {
    if (isAudioPlaying) {
      pauseAudio();
    }
    tts.setIsPlayerVisible(true);
    tts.jumpTo(index);
  }, [isAudioPlaying, pauseAudio, tts]);

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
    <div className="min-h-screen pb-28 w-full max-w-full">
      {/* Reader Toolbar */}
      <ReaderToolbar
        book={book}
        currentChapter={currentChapter}
        onOpenTOC={() => setIsTOCDrawerOpen(true)}
        isTTSActive={tts.isPlayerVisible}
        isTTSSpeaking={tts.isPlaying}
        onToggleTTS={handleToggleTTS}
        onOpenDiscussion={() => setIsDiscussionDrawerOpen(true)}
        chapterContent={content}
        isSearchOpen={isSearchOpen}
        onToggleSearch={handleToggleSearch}
        onCopied={showToast}
      />

      {/* In-page Chapter Search Bar */}
      <ChapterSearchBar
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        matches={matches}
        activeMatchIndex={activeMatchIndex}
        onNext={handleNextMatch}
        onPrev={handlePrevMatch}
        onJumpTo={handleJumpToMatch}
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
              bookTitle={book.title}
              chapterTitle={currentChapter.title}
              currentTTSIndex={tts.currentParagraphIndex}
              isTTSSpeaking={tts.isPlaying || tts.isPaused}
              onReadFromIndex={handleReadFromIndex}
              onCopied={showToast}
            />
            <ChapterNavigation
              book={book}
              currentChapter={currentChapter}
              onOpenQuiz={() => setIsQuizOpen(true)}
            />

            {/* Discussion & Reactions on this Chapter */}
            <div className={`mx-auto ${getMaxWidthClass()} px-4 sm:px-8 pb-16`}>
              <CommentSection
                targetType="chapter"
                targetId={`${book.id}:${currentChapter.id}`}
                bookId={book.id}
                chapterId={currentChapter.id}
                title="Thảo Luận & Cảm Nghĩ Chương Sách"
                subtitle={`Chia sẻ bài học tâm đắc hoặc góc nhìn của bạn về "${currentChapter.title}"`}
              />
            </div>
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

      {/* Chapter Discussion Drawer */}
      <ChapterDiscussionDrawer
        isOpen={isDiscussionDrawerOpen}
        onClose={() => setIsDiscussionDrawerOpen(false)}
        bookId={book.id}
        chapterId={currentChapter.id}
        bookTitle={book.title}
        chapterTitle={currentChapter.title}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          data-no-search="true"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 text-white dark:bg-emerald-800/95 px-5 py-3 shadow-2xl backdrop-blur-md border border-slate-700 dark:border-emerald-600 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
