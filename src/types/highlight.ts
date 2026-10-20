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
  accentHex: string;
}

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
  {
    id: 'yellow',
    name: 'Vàng nắng',
    bgClass: 'bg-amber-100 dark:bg-amber-950/70',
    borderClass: 'border-amber-400 dark:border-amber-500',
    textClass: 'text-amber-800 dark:text-amber-300',
    hex: '#fde047',
    accentHex: '#f59e0b',
  },
  {
    id: 'green',
    name: 'Xanh ngọc',
    bgClass: 'bg-emerald-100 dark:bg-emerald-950/70',
    borderClass: 'border-emerald-400 dark:border-emerald-500',
    textClass: 'text-emerald-800 dark:text-emerald-300',
    hex: '#6ee7b7',
    accentHex: '#10b981',
  },
  {
    id: 'blue',
    name: 'Xanh lam',
    bgClass: 'bg-sky-100 dark:bg-sky-950/70',
    borderClass: 'border-sky-400 dark:border-sky-500',
    textClass: 'text-sky-800 dark:text-sky-300',
    hex: '#7dd3fc',
    accentHex: '#0ea5e9',
  },
  {
    id: 'pink',
    name: 'Hồng phấn',
    bgClass: 'bg-rose-100 dark:bg-rose-950/70',
    borderClass: 'border-rose-400 dark:border-rose-500',
    textClass: 'text-rose-800 dark:text-rose-300',
    hex: '#fda4af',
    accentHex: '#f43f5e',
  },
  {
    id: 'purple',
    name: 'Tím mộng',
    bgClass: 'bg-purple-100 dark:bg-purple-950/70',
    borderClass: 'border-purple-400 dark:border-purple-500',
    textClass: 'text-purple-800 dark:text-purple-300',
    hex: '#d8b4fe',
    accentHex: '#a855f7',
  },
];
