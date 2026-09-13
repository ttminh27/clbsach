import { useState, useEffect, useRef, useCallback } from 'react';

export interface TTSVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isVietnamese: boolean;
  isNatural?: boolean;
}

export interface UseTextToSpeechOptions {
  bookTitle?: string;
  chapterTitle?: string;
  coverUrl?: string;
  onParagraphChange?: (index: number) => void;
  onStateChange?: (isPlaying: boolean) => void;
}

/**
 * Tạo URL Blob chứa file WAV im lặng 1 giây (8kHz mono 8-bit PCM)
 * Dùng để phát nền giữ cho tiến trình âm thanh và JavaScript không bị hệ điều hành suspend khi tắt màn hình
 */
function createSilentAudioBlobUrl(): string {
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1 second
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  // RIFF identifier
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + numSamples, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate, true); // ByteRate (sampleRate * 1 * 1)
  view.setUint16(32, 1, true); // BlockAlign
  view.setUint16(34, 8, true); // BitsPerSample (8)

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, numSamples, true);

  // Điền giá trị 128 (mức im lặng chuẩn trong 8-bit unsigned PCM)
  new Uint8Array(buffer, 44, numSamples).fill(128);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Chuẩn hóa văn bản Tiếng Việt để bộ đọc Web Speech API phát âm tự nhiên, chuẩn xác nhất
 */
export function normalizeVietnameseTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Xóa các chú thích markdown footnotes, ví dụ [^1], [^note]
  cleaned = cleaned.replace(/\[\^[^\]]+\]/g, '');

  // 2. Xóa các liên kết markdown [text](url) -> giữ lại text, xóa url trần
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/https?:\/\/\S+/g, ' ');

  // 3. Xóa các ký tự markdown định dạng thừa
  cleaned = cleaned.replace(/[*_~`#>]/g, ' ');

  // 4. Chuẩn hóa dấu ngoặc kép và dấu nháy
  cleaned = cleaned.replace(/[“”«»]/g, ' ');
  cleaned = cleaned.replace(/[‘’]/g, "'");

  // 5. Chuẩn hóa dấu ba chấm và gạch đầu dòng
  cleaned = cleaned.replace(/\.{3,}|…/g, ', ');
  cleaned = cleaned.replace(/^[\s•\-*–—]+\s*/gm, '');

  // 6. Mở rộng các từ viết tắt phổ biến trong sách tiếng Việt
  const abbreviations: [RegExp, string][] = [
    [/\bv\.v\.(\.\.)?/gi, 'vân vân'],
    [/\bv\.v\b/gi, 'vân vân'],
    [/\btr\.\s*(\d+)/gi, 'trang $1'],
    [/\bNXB\b/g, 'Nhà xuất bản'],
    [/\bnxb\b/g, 'nhà xuất bản'],
    [/\bTP\.\s*HCM\b/gi, 'Thành phố Hồ Chí Minh'],
    [/\bTp\.\s*([A-ZÀ-Ỹ][a-zà-ỹ]+)/g, 'Thành phố $1'],
    [/\bTP\.\s*([A-ZÀ-Ỹ][a-zà-ỹ]+)/g, 'Thành phố $1'],
    [/\bPGS\.TS\b/gi, 'Phó giáo sư Tiến sĩ'],
    [/\bPGS\.\b/gi, 'Phó giáo sư'],
    [/\bGS\.TS\b/gi, 'Giáo sư Tiến sĩ'],
    [/\bGS\.\b/gi, 'Giáo sư'],
    [/\bTS\.\b/gi, 'Tiến sĩ'],
    [/\bThS\.\b/gi, 'Thạc sĩ'],
    [/\bBS\.\b/gi, 'Bác sĩ'],
    [/\bBs\.\b/gi, 'Bác sĩ'],
    [/\bMr\.\s*/gi, 'Ông '],
    [/\bMrs\.\s*/gi, 'Bà '],
    [/\bMs\.\s*/gi, 'Cô '],
    [/\b(\d+)\s*%/g, '$1 phần trăm'],
    [/\b(\d+)\s*km\/h\b/gi, '$1 ki lô mét trên giờ'],
    [/\b(\d+)\s*km\b/gi, '$1 ki lô mét'],
    [/\b(\d+)\s*kg\b/gi, '$1 ki lô gam'],
    [/\b(\d+)\s*m\b/gi, '$1 mét'],
    [/\bT1\b/g, 'Tập 1'],
    [/\bT2\b/g, 'Tập 2'],
    [/\bT3\b/g, 'Tập 3'],
  ];

  for (const [pattern, replacement] of abbreviations) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Thu gọn khoảng trắng thừa
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Kiểm tra xem một voice có phải là giọng Tiếng Việt hay không
 */
function isVoiceVietnamese(v: SpeechSynthesisVoice): boolean {
  const lang = (v.lang || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  return (
    lang.startsWith('vi') ||
    lang.includes('vi-vn') ||
    lang.includes('vi_vn') ||
    name.includes('vietnam') ||
    name.includes('vietnamese') ||
    name.includes('tiếng việt') ||
    name.includes('hoaimy') ||
    name.includes('linh') ||
    name.includes('nam') ||
    name.includes('an') ||
    name.includes('mai')
  );
}

/**
 * Đánh giá chất lượng của giọng đọc Tiếng Việt (ưu tiên giọng Natural / Google / Microsoft)
 */
function getVietnameseVoiceScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;

  if (isVoiceVietnamese(v)) {
    score += 100;
    if (name.includes('natural') || name.includes('online')) score += 50;
    if (name.includes('google')) score += 40;
    if (name.includes('microsoft')) score += 35;
    if (name.includes('apple') || name.includes('siri')) score += 30;
    if (lang === 'vi-vn' || lang === 'vi_vn') score += 20;
    if (v.default) score += 5;
  }
  return score;
}

export const useTextToSpeech = (options?: UseTextToSpeechOptions) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState<number>(-1);
  const [totalParagraphs, setTotalParagraphs] = useState<number>(0);
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [hasVietnameseVoice, setHasVietnameseVoice] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isPlayerVisible, setIsPlayerVisible] = useState<boolean>(false);

  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(true);
  const [isWakeLockActive, setIsWakeLockActive] = useState<boolean>(false);
  const isWakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const keepScreenAwakeRef = useRef<boolean>(true);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const optionsRef = useRef(options);
  const actionsRef = useRef<{
    play: (idx?: number) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    next: () => void;
    prev: () => void;
  }>({
    play: () => {},
    pause: () => {},
    resume: () => {},
    stop: () => {},
    next: () => {},
    prev: () => {},
  });

  const paragraphsRef = useRef<string[]>([]);
  const currentIndexRef = useRef<number>(-1);
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoScrollRef = useRef<boolean>(true);
  const playbackRateRef = useRef<number>(1.0);
  const pitchRef = useRef<number>(1.0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Sync refs with state
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    currentIndexRef.current = currentParagraphIndex;
  }, [currentParagraphIndex]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    pitchRef.current = pitch;
  }, [pitch]);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Request screen wake lock to prevent display turn-off / power save
  const requestWakeLock = useCallback(async () => {
    if (!keepScreenAwakeRef.current) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        const lock = await navigator.wakeLock.request('screen');
        wakeLockRef.current = lock;
        setIsWakeLockActive(true);
        lock.onrelease = () => {
          setIsWakeLockActive(false);
          wakeLockRef.current = null;
        };
      }
    } catch (err) {
      console.debug('Wake lock request not granted/supported:', err);
    }
  }, []);

  // Release screen wake lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
      setIsWakeLockActive(false);
    }
  }, []);

  // React to keepScreenAwake preference changes
  useEffect(() => {
    keepScreenAwakeRef.current = keepScreenAwake;
    if (!keepScreenAwake && wakeLockRef.current) {
      releaseWakeLock();
    } else if (keepScreenAwake && isPlayingRef.current) {
      requestWakeLock();
    }
  }, [keepScreenAwake, releaseWakeLock, requestWakeLock]);

  // Re-request wake lock when user switches back to tab or device unlocks
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlayingRef.current && keepScreenAwakeRef.current) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

  // Start silent background audio to keep process alive on lockscreen / background
  const startSilentAudio = useCallback(() => {
    try {
      if (!silentAudioRef.current && typeof Audio !== 'undefined') {
        const url = createSilentAudioBlobUrl();
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.01;
        silentAudioRef.current = audio;
      }
      if (silentAudioRef.current && silentAudioRef.current.paused) {
        silentAudioRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.debug('Silent audio play error:', err);
    }
  }, []);

  // Pause silent background audio
  const pauseSilentAudio = useCallback(() => {
    try {
      if (silentAudioRef.current && !silentAudioRef.current.paused) {
        silentAudioRef.current.pause();
      }
    } catch {
      // ignore
    }
  }, []);

  // Stop silent background audio
  const stopSilentAudio = useCallback(() => {
    try {
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current.currentTime = 0;
      }
    } catch {
      // ignore
    }
  }, []);

  // Update Media Session API for lockscreen controls and background state
  const updateMediaSession = useCallback((state: 'playing' | 'paused' | 'none') => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
      if (state === 'none') return;

      const opts = optionsRef.current;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: opts?.chapterTitle || 'Sách nói TTS (CLB Sách)',
        artist: opts?.bookTitle || 'CLB Sách',
        album: opts?.bookTitle ? `Sách: ${opts.bookTitle}` : 'CLB Sách - Đọc sách tự động',
        artwork: opts?.coverUrl
          ? [{ src: opts.coverUrl, sizes: '512x512', type: 'image/png' }]
          : undefined,
      });

      navigator.mediaSession.setActionHandler('play', () => {
        actionsRef.current.resume();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        actionsRef.current.pause();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        actionsRef.current.next();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        actionsRef.current.prev();
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        actionsRef.current.stop();
      });
    } catch (e) {
      console.debug('MediaSession error:', e);
    }
  }, []);

  // Check Web Speech API support and load available voices with Vietnamese priority
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      if (!synthVoices || synthVoices.length === 0) return;

      const formattedVoices: TTSVoiceOption[] = synthVoices.map((v) => ({
        voice: v,
        name: v.name,
        lang: v.lang,
        isVietnamese: isVoiceVietnamese(v),
        isNatural: v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'),
      }));

      // Sort: Highest Vietnamese score first, then alphabetical
      formattedVoices.sort((a, b) => {
        const scoreA = getVietnameseVoiceScore(a.voice);
        const scoreB = getVietnameseVoiceScore(b.voice);
        if (scoreA !== scoreB) return scoreB - scoreA;
        return a.name.localeCompare(b.name);
      });

      setVoices(formattedVoices);

      const viVoices = formattedVoices.filter((v) => v.isVietnamese);
      setHasVietnameseVoice(viVoices.length > 0);

      // Default to the top rated Vietnamese voice
      if (!selectedVoiceRef.current || !isVoiceVietnamese(selectedVoiceRef.current)) {
        if (viVoices.length > 0) {
          setSelectedVoice(viVoices[0].voice);
          selectedVoiceRef.current = viVoices[0].voice;
        } else {
          const fallbackDefault = formattedVoices.find((v) => v.voice.default)?.voice || formattedVoices[0]?.voice || null;
          setSelectedVoice(fallbackDefault);
          selectedVoiceRef.current = fallbackDefault;
        }
      }
    };

    updateVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll active paragraph into view
  const scrollToActiveBlock = useCallback((index: number) => {
    if (!autoScrollRef.current || index < 0) return;
    const blockEl = document.querySelector(`[data-tts-block="${index}"]`);
    if (blockEl) {
      blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Speak a specific paragraph by index
  const speakParagraph = useCallback((index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    synth.cancel(); // Stop previous utterance

    const paragraphs = paragraphsRef.current;
    if (index < 0 || index >= paragraphs.length) {
      // Finished all paragraphs
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentParagraphIndex(-1);
      stopSilentAudio();
      releaseWakeLock();
      updateMediaSession('none');
      if (options?.onStateChange) options.onStateChange(false);
      return;
    }

    const rawText = paragraphs[index];
    const normalizedText = normalizeVietnameseTextForSpeech(rawText);

    if (!normalizedText || normalizedText.trim().length === 0) {
      // Skip empty block and move to next
      speakParagraph(index + 1);
      return;
    }

    setCurrentParagraphIndex(index);
    if (options?.onParagraphChange) {
      options.onParagraphChange(index);
    }
    scrollToActiveBlock(index);

    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utteranceRef.current = utterance; // Prevent garbage collection in Chromium

    // ALWAYS explicitly enforce Vietnamese language code 'vi-VN'
    utterance.lang = 'vi-VN';

    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
      // If voice has a specific lang like vi_VN or vi, retain it
      if (selectedVoiceRef.current.lang) {
        utterance.lang = selectedVoiceRef.current.lang;
      }
    }

    utterance.rate = playbackRateRef.current;
    utterance.pitch = pitchRef.current;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      if (options?.onStateChange) options.onStateChange(true);
    };

    utterance.onend = () => {
      if (isPlayingRef.current && !isPausedRef.current) {
        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < paragraphsRef.current.length) {
          speakParagraph(nextIndex);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentParagraphIndex(-1);
          stopSilentAudio();
          releaseWakeLock();
          updateMediaSession('none');
          if (options?.onStateChange) options.onStateChange(false);
        }
      }
    };

    utterance.onerror = (event) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.warn('TTS SpeechSynthesis error:', event.error);
      }
    };

    synth.speak(utterance);
  }, [options, releaseWakeLock, scrollToActiveBlock, stopSilentAudio, updateMediaSession]);

  // Collect paragraph blocks from DOM
  const collectParagraphsFromDOM = useCallback((): string[] => {
    const elements = document.querySelectorAll<HTMLElement>('[data-tts-block]');
    const list: string[] = [];
    elements.forEach((el) => {
      const text = (el.innerText || '').trim();
      list.push(text);
    });
    paragraphsRef.current = list;
    setTotalParagraphs(list.length);
    return list;
  }, []);

  // Start speaking
  const play = useCallback((startIndex?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPausedRef.current && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startSilentAudio();
      requestWakeLock();
      updateMediaSession('playing');
      if (options?.onStateChange) options.onStateChange(true);
      return;
    }

    const list = collectParagraphsFromDOM();
    if (list.length === 0) return;

    setIsPlayerVisible(true);

    let targetIndex = 0;
    if (typeof startIndex === 'number' && startIndex >= 0 && startIndex < list.length) {
      targetIndex = startIndex;
    } else if (currentIndexRef.current >= 0 && currentIndexRef.current < list.length) {
      targetIndex = currentIndexRef.current;
    }

    setIsPlaying(true);
    setIsPaused(false);
    startSilentAudio();
    requestWakeLock();
    updateMediaSession('playing');
    speakParagraph(targetIndex);
  }, [collectParagraphsFromDOM, options, requestWakeLock, speakParagraph, startSilentAudio, updateMediaSession]);

  // Pause speaking
  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    pauseSilentAudio();
    releaseWakeLock();
    updateMediaSession('paused');
    if (options?.onStateChange) options.onStateChange(false);
  }, [options, pauseSilentAudio, releaseWakeLock, updateMediaSession]);

  // Resume speaking
  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    startSilentAudio();
    requestWakeLock();
    updateMediaSession('playing');
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      if (options?.onStateChange) options.onStateChange(true);
    } else if (currentIndexRef.current >= 0) {
      speakParagraph(currentIndexRef.current);
    } else {
      play(0);
    }
  }, [options, play, requestWakeLock, speakParagraph, startSilentAudio, updateMediaSession]);

  // Toggle play / pause
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      play();
    }
  }, [isPlaying, isPaused, pause, resume, play]);

  // Stop speaking and reset
  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
    stopSilentAudio();
    releaseWakeLock();
    updateMediaSession('none');
    if (options?.onStateChange) options.onStateChange(false);
  }, [options, releaseWakeLock, stopSilentAudio, updateMediaSession]);

  // Skip to next paragraph
  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < paragraphsRef.current.length) {
      speakParagraph(nextIdx);
    } else {
      stop();
    }
  }, [speakParagraph, stop]);

  // Skip to previous paragraph
  const prev = useCallback(() => {
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    speakParagraph(prevIdx);
  }, [speakParagraph]);

  // Jump to specific paragraph index
  const jumpTo = useCallback((index: number) => {
    collectParagraphsFromDOM();
    speakParagraph(index);
  }, [collectParagraphsFromDOM, speakParagraph]);

  // Change playback speed rate
  const changeRate = useCallback((newRate: number) => {
    setPlaybackRate(newRate);
    playbackRateRef.current = newRate;
    if (isPlayingRef.current && currentIndexRef.current >= 0) {
      speakParagraph(currentIndexRef.current);
    }
  }, [speakParagraph]);

  // Change voice
  const changeVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice);
    selectedVoiceRef.current = voice;
    if (isPlayingRef.current && currentIndexRef.current >= 0) {
      speakParagraph(currentIndexRef.current);
    }
  }, [speakParagraph]);

  // Keep actionsRef synced for mediaSession action handlers
  useEffect(() => {
    actionsRef.current = {
      play,
      pause,
      resume,
      stop,
      next,
      prev,
    };
  });

  // Chrome bug workaround: speechSynthesis can pause after 15s in background
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 12000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Clean up wakeLock and silent audio on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
      stopSilentAudio();
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
          navigator.mediaSession.playbackState = 'none';
        } catch {
          // ignore
        }
      }
    };
  }, [releaseWakeLock, stopSilentAudio]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentParagraphIndex,
    totalParagraphs,
    voices,
    selectedVoice,
    hasVietnameseVoice,
    playbackRate,
    pitch,
    autoScroll,
    isPlayerVisible,
    keepScreenAwake,
    isWakeLockActive,
    isWakeLockSupported,
    setKeepScreenAwake,
    setIsPlayerVisible,
    setAutoScroll,
    setPitch,
    play,
    pause,
    resume,
    togglePlay,
    stop,
    next,
    prev,
    jumpTo,
    changeRate,
    changeVoice,
    collectParagraphsFromDOM,
  };
};
