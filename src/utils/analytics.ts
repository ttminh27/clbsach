/**
 * Google Analytics 4 (gtag.js) Utility Helpers
 */

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

export const trackReadChapter = (
  bookId: string,
  bookTitle: string,
  chapterId: string,
  chapterTitle: string,
  chapterOrder?: number
) => {
  trackEvent('read_chapter', {
    book_id: bookId,
    book_title: bookTitle,
    chapter_id: chapterId,
    chapter_title: chapterTitle,
    chapter_order: chapterOrder,
  });
};

export const trackStartQuiz = (
  bookId: string,
  bookTitle: string,
  chapterId: string,
  chapterTitle: string
) => {
  trackEvent('start_quiz', {
    book_id: bookId,
    book_title: bookTitle,
    chapter_id: chapterId,
    chapter_title: chapterTitle,
  });
};

export const trackCompleteQuiz = (
  bookId: string,
  bookTitle: string,
  chapterId: string,
  chapterTitle: string,
  score: number,
  totalQuestions: number,
  percent: number
) => {
  trackEvent('complete_quiz', {
    book_id: bookId,
    book_title: bookTitle,
    chapter_id: chapterId,
    chapter_title: chapterTitle,
    score,
    total_questions: totalQuestions,
    accuracy_percent: percent,
  });
};

export const trackPlayAudio = (
  bookId: string,
  bookTitle: string,
  audioId: string,
  audioTitle: string
) => {
  trackEvent('play_audio', {
    book_id: bookId,
    book_title: bookTitle,
    audio_id: audioId,
    audio_title: audioTitle,
  });
};
