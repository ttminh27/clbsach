import { useState, useEffect, useRef, useCallback } from 'react';

export interface TTSVoiceOption {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
  isVietnamese: boolean;
  isNatural?: boolean;
}

export interface UseTextToSpeechOptions {
  onParagraphChange?: (index: number) => void;
  onStateChange?: (isPlaying: boolean) => void;
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
  }, [options, scrollToActiveBlock]);

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
    speakParagraph(targetIndex);
  }, [collectParagraphsFromDOM, options, speakParagraph]);

  // Pause speaking
  const pause = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    if (options?.onStateChange) options.onStateChange(false);
  }, [options]);

  // Resume speaking
  const resume = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
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
  }, [options, play, speakParagraph]);

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
    if (options?.onStateChange) options.onStateChange(false);
  }, [options]);

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
