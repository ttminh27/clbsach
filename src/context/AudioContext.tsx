import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { AudioTrack, Book } from '../types/book';
import { trackPlayAudio } from '../utils/analytics';

export interface PlayingTrack {
  id: string;
  bookId: string;
  bookTitle: string;
  coverUrl?: string | null;
  title: string;
  prefix: string;
  audioUrl: string;
  index: number;
  totalTracks: number;
}

interface AudioContextType {
  currentTrack: PlayingTrack | null;
  playlist: AudioTrack[];
  currentBook: Book | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  sleepTimerMinutes: number | null;
  sleepTimerRemaining: number | null;
  isPlayerModalOpen: boolean;
  setIsPlayerModalOpen: (open: boolean) => void;
  isAudioBarVisible: boolean;
  setIsAudioBarVisible: (visible: boolean) => void;
  playTrack: (book: Book, trackIndex: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setRate: (rate: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;
  closeAudio: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayingTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [volume, setVolumeState] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [isAudioBarVisible, setIsAudioBarVisible] = useState<boolean>(true);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleTrackEnded();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) return;

    if (sleepTimerRemaining <= 0) {
      pause();
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }

    const timer = setInterval(() => {
      setSleepTimerRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerRemaining]);

  // Sync MediaSession API (Lockscreen & Notification controls)
  useEffect(() => {
    if ('mediaSession' in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentTrack.prefix}: ${currentTrack.title}`,
        artist: currentTrack.bookTitle,
        album: 'CLB đọc sách VietinBank',
        artwork: currentTrack.coverUrl
          ? [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
          : [],
      });

      navigator.mediaSession.setActionHandler('play', () => resume());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => skip(-10));
      navigator.mediaSession.setActionHandler('seekforward', () => skip(10));
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    }
  }, [currentTrack]);

  const playTrack = (book: Book, trackIndex: number) => {
    if (!book.audios || book.audios.length === 0) return;
    const index = Math.max(0, Math.min(trackIndex, book.audios.length - 1));
    const track = book.audios[index];

    setCurrentBook(book);
    const newTrack: PlayingTrack = {
      id: track.id,
      bookId: book.id,
      bookTitle: book.title,
      coverUrl: book.coverUrl,
      title: track.title,
      prefix: track.prefix,
      audioUrl: track.audioUrl,
      index,
      totalTracks: book.audios.length,
    };
    setCurrentTrack(newTrack);
    setIsAudioBarVisible(true);
    trackPlayAudio(book.id, book.title, track.id, track.title);

    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Autoplay prevented or failed:', err));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resume = () => {
    if (audioRef.current && currentTrack) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn('Resume failed:', err));
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      const clamped = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clamped;
      setCurrentTime(clamped);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      seek(audioRef.current.currentTime + seconds);
    }
  };

  const handleTrackEnded = () => {
    if (sleepTimerMinutes === -1) {
      // End of track timer mode
      pause();
      setSleepTimerMinutes(null);
      setSleepTimerRemaining(null);
      return;
    }
    nextTrack();
  };

  const nextTrack = () => {
    if (!currentBook || !currentTrack) return;
    if (currentTrack.index < currentBook.audios.length - 1) {
      playTrack(currentBook, currentTrack.index + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (!currentBook || !currentTrack) return;
    if (currentTime > 3) {
      seek(0);
    } else if (currentTrack.index > 0) {
      playTrack(currentBook, currentTrack.index - 1);
    } else {
      seek(0);
    }
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
      setIsMuted(clamped === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume > 0 ? volume : 0.5;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else if (minutes === -1) {
      // Special: End of current track
      setSleepTimerRemaining(Math.max(0, Math.ceil(duration - currentTime)));
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  const closeAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setIsPlayerModalOpen(false);
    setIsAudioBarVisible(false);
    setSleepTimerMinutes(null);
    setSleepTimerRemaining(null);
  };

  const value = useMemo(
    () => ({
      currentTrack,
      playlist: currentBook?.audios || [],
      currentBook,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      volume,
      isMuted,
      sleepTimerMinutes,
      sleepTimerRemaining,
      isPlayerModalOpen,
      setIsPlayerModalOpen,
      isAudioBarVisible,
      setIsAudioBarVisible,
      playTrack,
      togglePlay,
      pause,
      resume,
      seek,
      skip,
      nextTrack,
      prevTrack,
      setRate,
      setSleepTimer,
      toggleMute,
      setVolume,
      closeAudio,
    }),
    [
      currentTrack,
      currentBook,
      isPlaying,
      currentTime,
      duration,
      playbackRate,
      volume,
      isMuted,
      sleepTimerMinutes,
      sleepTimerRemaining,
      isPlayerModalOpen,
      isAudioBarVisible,
    ]
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
