export interface Chapter {
  id: string;
  fileName: string;
  fileUrl: string;
  order: number;
  title: string;
  subtitle?: string;
  wordCount: number;
  readingTimeMin: number;
}

export interface AudioTrack {
  id: string;
  fileName: string;
  audioUrl: string;
  trackNumber: number;
  prefix: string;
  title: string;
  fullTitle: string;
  duration?: number;
}

export interface Book {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  translator?: string;
  category: string;
  tags: string[];
  description: string;
  gradient: string;
  themeColor: string;
  status: 'available' | 'coming_soon';
  coverUrl: string | null;
  totalChapters: number;
  totalAudios: number;
  chapters: Chapter[];
  audios: AudioTrack[];
}

export interface ReadingProgress {
  bookId: string;
  bookTitle: string;
  lastChapterId: string;
  lastChapterTitle: string;
  lastChapterOrder: number;
  progressPercent: number; // 0 to 100
  scrollRatio: number; // 0 to 1
  lastReadAt: number; // timestamp
  completedChapterIds: string[];
}

export interface HistoryMap {
  [bookId: string]: ReadingProgress;
}
