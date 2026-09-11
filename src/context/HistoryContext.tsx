import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { historyApi } from '../services/api';
import { HistoryMap, ReadingProgress } from '../types/book';

const GUEST_STORAGE_KEY = 'clb_sach_reading_history';

function getGuestHistoryFromStorage(): HistoryMap {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGuestHistoryToStorage(data: HistoryMap): void {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to write guest reading history to localStorage:', e);
  }
}

interface HistoryContextType {
  history: HistoryMap;
  isCloudSync: boolean;
  isLoading: boolean;
  saveProgress: (progress: Omit<ReadingProgress, 'lastReadAt'>) => void;
  markChapterCompleted: (bookId: string, chapterId: string) => void;
  getProgressForBook: (bookId: string) => ReadingProgress | undefined;
  getRecentBookProgress: () => ReadingProgress | undefined;
  clearHistoryForBook: (bookId: string) => void;
  clearAllHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // 1. Guest history state (backed by localStorage)
  const [localHistory, setLocalHistory] = useState<HistoryMap>(getGuestHistoryFromStorage);

  // 2. Cloud D1 history state for logged-in user
  const [serverHistory, setServerHistory] = useState<HistoryMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounce ref for syncing progress updates to D1
  const saveTimeoutRef = useRef<Record<string, any>>({});

  // Cancel any pending D1 saves
  const cancelPendingSaves = () => {
    Object.values(saveTimeoutRef.current).forEach((timer) => clearTimeout(timer));
    saveTimeoutRef.current = {};
  };

  // Effect: When auth status changes (login / logout)
  useEffect(() => {
    // If still validating auth token on app load, wait
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      // User is logged out (or signed out):
      // - Cancel any pending D1 network saves
      // - Reset server history
      // - Reload guest history fresh from localStorage
      cancelPendingSaves();
      setServerHistory({});
      setLocalHistory(getGuestHistoryFromStorage());
      setIsLoading(false);
      return;
    }

    // User is logged in:
    // - Load reading history directly from D1 database
    // - Do not use or touch localStorage
    let isMounted = true;
    setIsLoading(true);

    const loadServerHistory = async () => {
      try {
        const res = await historyApi.getHistory();
        if (!isMounted) return;
        setServerHistory(res.history || {});
      } catch (err) {
        console.error('Failed to load reading history from D1 database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadServerHistory();

    return () => {
      isMounted = false;
      cancelPendingSaves();
    };
  }, [isAuthenticated, user?.id, isAuthLoading]);

  // Active history: strictly serverHistory if logged in, otherwise localHistory (guest)
  const activeHistory = isAuthenticated ? serverHistory : localHistory;

  const saveProgress = (progressData: Omit<ReadingProgress, 'lastReadAt'>) => {
    const now = Date.now();

    if (isAuthenticated) {
      // LOGGED IN: Update serverHistory in memory and persist to D1 (NO localStorage)
      setServerHistory((prev) => {
        const existing = prev[progressData.bookId];
        const completedSet = new Set(existing?.completedChapterIds || []);
        if (progressData.completedChapterIds) {
          progressData.completedChapterIds.forEach((id) => completedSet.add(id));
        }

        const newRecord: ReadingProgress = {
          ...existing,
          ...progressData,
          completedChapterIds: Array.from(completedSet),
          lastReadAt: now,
        };

        // Debounced sync to D1 (500ms)
        if (saveTimeoutRef.current[progressData.bookId]) {
          clearTimeout(saveTimeoutRef.current[progressData.bookId]);
        }
        saveTimeoutRef.current[progressData.bookId] = setTimeout(async () => {
          try {
            await historyApi.saveProgress(newRecord);
          } catch (err) {
            console.error('Failed to save reading progress to D1:', err);
          }
        }, 500);

        return {
          ...prev,
          [progressData.bookId]: newRecord,
        };
      });
    } else {
      // LOGGED OUT (GUEST): Update localHistory in memory and save to localStorage (NO D1)
      setLocalHistory((prev) => {
        const existing = prev[progressData.bookId];
        const completedSet = new Set(existing?.completedChapterIds || []);
        if (progressData.completedChapterIds) {
          progressData.completedChapterIds.forEach((id) => completedSet.add(id));
        }

        const updatedHistory: HistoryMap = {
          ...prev,
          [progressData.bookId]: {
            ...existing,
            ...progressData,
            completedChapterIds: Array.from(completedSet),
            lastReadAt: now,
          },
        };

        saveGuestHistoryToStorage(updatedHistory);
        return updatedHistory;
      });
    }
  };

  const markChapterCompleted = (bookId: string, chapterId: string) => {
    const now = Date.now();

    if (isAuthenticated) {
      // LOGGED IN: Update serverHistory & send to D1
      setServerHistory((prev) => {
        const existing = prev[bookId];
        if (!existing) return prev;
        const completedSet = new Set(existing.completedChapterIds || []);
        completedSet.add(chapterId);

        const newRecord: ReadingProgress = {
          ...existing,
          completedChapterIds: Array.from(completedSet),
          lastReadAt: now,
        };

        historyApi.saveProgress(newRecord).catch((err) => {
          console.error('Failed to sync completed chapter to D1:', err);
        });

        return {
          ...prev,
          [bookId]: newRecord,
        };
      });
    } else {
      // LOGGED OUT: Update localHistory & save to localStorage
      setLocalHistory((prev) => {
        const existing = prev[bookId];
        if (!existing) return prev;
        const completedSet = new Set(existing.completedChapterIds || []);
        completedSet.add(chapterId);

        const updatedHistory: HistoryMap = {
          ...prev,
          [bookId]: {
            ...existing,
            completedChapterIds: Array.from(completedSet),
            lastReadAt: now,
          },
        };

        saveGuestHistoryToStorage(updatedHistory);
        return updatedHistory;
      });
    }
  };

  const getProgressForBook = (bookId: string) => {
    return activeHistory[bookId];
  };

  const getRecentBookProgress = () => {
    const list = Object.values(activeHistory).sort((a, b) => b.lastReadAt - a.lastReadAt);
    return list.length > 0 ? list[0] : undefined;
  };

  const clearHistoryForBook = (bookId: string) => {
    if (isAuthenticated) {
      // LOGGED IN: Remove from serverHistory & D1
      setServerHistory((prev) => {
        const copy = { ...prev };
        delete copy[bookId];
        return copy;
      });
      historyApi.clearHistoryForBook(bookId).catch((err) => {
        console.error('Failed to clear book history on D1:', err);
      });
    } else {
      // LOGGED OUT: Remove from localHistory & localStorage
      setLocalHistory((prev) => {
        const copy = { ...prev };
        delete copy[bookId];
        saveGuestHistoryToStorage(copy);
        return copy;
      });
    }
  };

  const clearAllHistory = () => {
    if (isAuthenticated) {
      // LOGGED IN: Clear serverHistory & D1
      setServerHistory({});
      historyApi.clearAllHistory().catch((err) => {
        console.error('Failed to clear all history on D1:', err);
      });
    } else {
      // LOGGED OUT: Clear localHistory & localStorage
      setLocalHistory({});
      saveGuestHistoryToStorage({});
    }
  };

  const value = useMemo(
    () => ({
      history: activeHistory,
      isCloudSync: isAuthenticated,
      isLoading,
      saveProgress,
      markChapterCompleted,
      getProgressForBook,
      getRecentBookProgress,
      clearHistoryForBook,
      clearAllHistory,
    }),
    [activeHistory, isAuthenticated, isLoading]
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
