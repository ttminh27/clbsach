import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { HistoryMap, ReadingProgress } from '../types/book';

interface HistoryContextType {
  history: HistoryMap;
  saveProgress: (progress: Omit<ReadingProgress, 'lastReadAt'>) => void;
  markChapterCompleted: (bookId: string, chapterId: string) => void;
  getProgressForBook: (bookId: string) => ReadingProgress | undefined;
  getRecentBookProgress: () => ReadingProgress | undefined;
  clearHistoryForBook: (bookId: string) => void;
  clearAllHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useLocalStorage<HistoryMap>('clb_sach_reading_history', {});

  const saveProgress = (progressData: Omit<ReadingProgress, 'lastReadAt'>) => {
    setHistory((prev) => {
      const existing = prev[progressData.bookId];
      const completedSet = new Set(existing?.completedChapterIds || []);
      if (progressData.completedChapterIds) {
        progressData.completedChapterIds.forEach((id) => completedSet.add(id));
      }

      return {
        ...prev,
        [progressData.bookId]: {
          ...existing,
          ...progressData,
          completedChapterIds: Array.from(completedSet),
          lastReadAt: Date.now(),
        },
      };
    });
  };

  const markChapterCompleted = (bookId: string, chapterId: string) => {
    setHistory((prev) => {
      const existing = prev[bookId];
      if (!existing) return prev;
      const completedSet = new Set(existing.completedChapterIds || []);
      completedSet.add(chapterId);
      return {
        ...prev,
        [bookId]: {
          ...existing,
          completedChapterIds: Array.from(completedSet),
          lastReadAt: Date.now(),
        },
      };
    });
  };

  const getProgressForBook = (bookId: string) => {
    return history[bookId];
  };

  const getRecentBookProgress = () => {
    const list = Object.values(history).sort((a, b) => b.lastReadAt - a.lastReadAt);
    return list.length > 0 ? list[0] : undefined;
  };

  const clearHistoryForBook = (bookId: string) => {
    setHistory((prev) => {
      const copy = { ...prev };
      delete copy[bookId];
      return copy;
    });
  };

  const clearAllHistory = () => {
    setHistory({});
  };

  const value = useMemo(
    () => ({
      history,
      saveProgress,
      markChapterCompleted,
      getProgressForBook,
      getRecentBookProgress,
      clearHistoryForBook,
      clearAllHistory,
    }),
    [history]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
