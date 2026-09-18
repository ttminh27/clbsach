export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export interface TextHighlight {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle?: string;
  text: string;
  color: HighlightColor;
  prefix?: string;
  suffix?: string;
  paragraphIndex?: number;
  note?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface HighlightColorOption {
  id: HighlightColor;
  name: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  hex: string;
}

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
  {
    id: 'yellow',
    name: 'Vàng nắng',
    bgClass: 'bg-amber-100 dark:bg-amber-950/70',
    borderClass: 'border-amber-400 dark:border-amber-600',
    textClass: 'text-amber-800 dark:text-amber-300',
    hex: '#fef08a',
  },
  {
    id: 'green',
    name: 'Xanh ngọc',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/70',
    borderClass: 'border-emerald-400 dark:border-emerald-600',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    hex: '#bbf7d0',
  },
  {
    id: 'blue',
    name: 'Xanh lam',
    bgClass: 'bg-sky-100 dark:bg-sky-950/70',
    borderClass: 'border-sky-400 dark:border-sky-600',
    textClass: 'text-sky-800 dark:text-sky-300',
    hex: '#bae6fd',
  },
  {
    id: 'pink',
    name: 'Hồng phấn',
    bgClass: 'bg-rose-100 dark:bg-rose-950/70',
    borderClass: 'border-rose-400 dark:border-rose-600',
    textClass: 'text-rose-800 dark:text-rose-300',
    hex: '#fbcfe8',
  },
  {
    id: 'purple',
    name: 'Tím mộng',
    bgClass: 'bg-purple-100 dark:bg-purple-950/70',
    borderClass: 'border-purple-400 dark:border-purple-600',
    textClass: 'text-purple-800 dark:text-purple-300',
    hex: '#e9d5ff',
  },
];
