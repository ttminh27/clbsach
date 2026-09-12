/**
 * Reading Position Tracker & Resume Utility
 * CLB Đọc Sách
 * 
 * Supports both paragraph/block index precision (100% responsive, zoom & font agnostic)
 * and scroll ratio fallback.
 */

export interface SavedReadingPosition {
  bookId: string;
  chapterId: string;
  scrollRatio: number; // 0 to 1
  paragraphIndex: number; // 0-based data-tts-block index
  updatedAt: number;
}

const STORAGE_PREFIX = 'clb_reading_pos_';

export function getChapterPositionKey(bookId: string, chapterId: string): string {
  const cleanChapterId = chapterId.replace(/\.md$/i, '');
  return `${STORAGE_PREFIX}${bookId}_${cleanChapterId}`;
}

export function saveChapterPosition(
  bookId: string,
  chapterId: string,
  position: { scrollRatio: number; paragraphIndex: number }
): void {
  try {
    const key = getChapterPositionKey(bookId, chapterId);
    const data: SavedReadingPosition = {
      bookId,
      chapterId: chapterId.replace(/\.md$/i, ''),
      scrollRatio: Math.min(1, Math.max(0, position.scrollRatio)),
      paragraphIndex: Math.max(0, position.paragraphIndex),
      updatedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save reading position to localStorage:', e);
  }
}

export function getChapterPosition(
  bookId: string,
  chapterId: string
): SavedReadingPosition | null {
  try {
    const key = getChapterPositionKey(bookId, chapterId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.scrollRatio === 'number' && typeof parsed.paragraphIndex === 'number') {
      return parsed as SavedReadingPosition;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearChapterPosition(bookId: string, chapterId: string): void {
  try {
    const key = getChapterPositionKey(bookId, chapterId);
    localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}

/**
 * Detects the currently active reading block and scroll ratio.
 * Inspects all elements with [data-tts-block] to find the one closest to user eye reading line.
 */
export function findCurrentReadingBlock(): { paragraphIndex: number; scrollRatio: number } {
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = totalHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / totalHeight)) : 0;

  const blocks = document.querySelectorAll<HTMLElement>('[data-tts-block]');
  if (blocks.length === 0) {
    return { paragraphIndex: 0, scrollRatio };
  }

  // Eye-level threshold: ~140px below the viewport top (just under the sticky navbar)
  const targetEyeY = 140;
  let activeIndex = 0;
  let found = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const rect = block.getBoundingClientRect();

    // Block encompasses or starts around the eye level
    if (rect.top <= targetEyeY && rect.bottom >= targetEyeY) {
      const idx = Number(block.getAttribute('data-tts-block'));
      activeIndex = isNaN(idx) ? i : idx;
      found = true;
      break;
    }
  }

  // If not found in the eye line, find the first visible block below targetEyeY
  if (!found) {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const rect = block.getBoundingClientRect();
      if (rect.top >= targetEyeY && rect.top <= window.innerHeight) {
        const idx = Number(block.getAttribute('data-tts-block'));
        activeIndex = isNaN(idx) ? i : idx;
        found = true;
        break;
      }
    }
  }

  // If scrolled to bottom, select the last block
  if (!found && scrollRatio > 0.95 && blocks.length > 0) {
    const lastBlock = blocks[blocks.length - 1];
    const idx = Number(lastBlock.getAttribute('data-tts-block'));
    activeIndex = isNaN(idx) ? blocks.length - 1 : idx;
  }

  return { paragraphIndex: activeIndex, scrollRatio };
}

/**
 * Smoothly scrolls to a saved reading position and highlights the active paragraph.
 */
export function scrollToReadingPosition(
  position: { scrollRatio: number; paragraphIndex?: number },
  smooth: boolean = true
): boolean {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'instant';

  // Strategy 1: Paragraph index element
  if (typeof position.paragraphIndex === 'number' && position.paragraphIndex > 0) {
    const targetEl = document.querySelector<HTMLElement>(`[data-tts-block="${position.paragraphIndex}"]`);
    if (targetEl) {
      // Calculate position with offset for sticky reader header (64px)
      const rect = targetEl.getBoundingClientRect();
      const targetScrollY = window.scrollY + rect.top - 80;
      window.scrollTo({ top: Math.max(0, targetScrollY), behavior });

      // Subtle pulse highlight effect to guide user's eyes
      targetEl.classList.add(
        'ring-2',
        'ring-emerald-500/60',
        'dark:ring-emerald-400/60',
        'bg-emerald-500/10',
        'dark:bg-emerald-500/20',
        'rounded-xl',
        'transition-all',
        'duration-700'
      );
      setTimeout(() => {
        targetEl.classList.remove(
          'ring-2',
          'ring-emerald-500/60',
          'dark:ring-emerald-400/60',
          'bg-emerald-500/10',
          'dark:bg-emerald-500/20'
        );
      }, 3000);

      return true;
    }
  }

  // Strategy 2: Scroll ratio fallback
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (totalHeight > 0 && position.scrollRatio > 0.01) {
    const targetY = position.scrollRatio * totalHeight;
    window.scrollTo({ top: targetY, behavior });
    return true;
  }

  return false;
}
