export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'oled';
export type ReaderFontFamily = 'serif' | 'sans' | 'mono';
export type ReaderTextAlign = 'left' | 'justify';
export type ReaderWidth = 'narrow' | 'medium' | 'wide' | 'full';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontSize: number; // 14 to 28, default 18
  lineHeight: number; // 1.4 to 2.2, default 1.75
  fontFamily: ReaderFontFamily;
  textAlign: ReaderTextAlign;
  maxWidth: ReaderWidth;
  bionicReading: boolean;
}

export interface AudioPlaybackState {
  currentTrack: {
    id: string;
    bookId: string;
    bookTitle: string;
    coverUrl?: string | null;
    title: string;
    prefix: string;
    audioUrl: string;
    index: number;
    totalTracks: number;
  } | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
}
