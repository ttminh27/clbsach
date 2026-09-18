import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { highlightsApi } from '../services/api';
import { TextHighlight } from '../types/highlight';

const GUEST_HIGHLIGHTS_STORAGE_KEY = 'clb_sach_highlights';

function getGuestHighlightsFromStorage(): TextHighlight[] {
  try {
    const raw = localStorage.getItem(GUEST_HIGHLIGHTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGuestHighlightsToStorage(data: TextHighlight[]): void {
  try {
    localStorage.setItem(GUEST_HIGHLIGHTS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save guest highlights to localStorage:', e);
  }
}

interface HighlightContextType {
  highlights: TextHighlight[];
  isLoading: boolean;
  isCloudSync: boolean;
  addHighlight: (item: Omit<TextHighlight, 'id' | 'createdAt'>) => TextHighlight;
  updateHighlight: (id: string, updates: Partial<TextHighlight>) => void;
  deleteHighlight: (id: string) => void;
  getHighlightsForChapter: (bookId: string, chapterId: string) => TextHighlight[];
  getHighlightsForBook: (bookId: string) => TextHighlight[];
  clearHighlightsForBook: (bookId: string) => void;
  clearAllHighlights: () => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Guest highlights state
  const [localHighlights, setLocalHighlights] = useState<TextHighlight[]>(getGuestHighlightsFromStorage);

  // Cloud highlights state for logged-in user
  const [serverHighlights, setServerHighlights] = useState<TextHighlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Debounce ref for syncing updates to D1
  const syncTimeoutRef = useRef<any>(null);

  // Combined active highlights depending on auth status
  const highlights = useMemo(() => {
    return isAuthenticated && user ? serverHighlights : localHighlights;
  }, [isAuthenticated, user, serverHighlights, localHighlights]);

  const isCloudSync = Boolean(isAuthenticated && user);

  // Load from server or restore guest storage when auth status changes
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAuthenticated || !user) {
      setServerHighlights([]);
      setLocalHighlights(getGuestHighlightsFromStorage());
      setIsLoading(false);
      return;
    }

    // User is logged in: load from D1
    let isMounted = true;
    setIsLoading(true);

    const loadCloudHighlights = async () => {
      try {
        // Check if there are any guest highlights that need to be migrated into user account
        const guestItems = getGuestHighlightsFromStorage();

        const res = await highlightsApi.getHighlights();
        if (!isMounted) return;

        let combined = res.highlights || [];

        if (guestItems.length > 0) {
          // Merge guest items into server
          const existingIds = new Set(combined.map((h) => h.id));
          const toUpload = guestItems.filter((h) => !existingIds.has(h.id));

          if (toUpload.length > 0) {
            try {
              await highlightsApi.syncHighlights(toUpload);
              combined = [...toUpload, ...combined];
            } catch (err) {
              console.warn('Failed to sync guest highlights to account:', err);
            }
          }
          // Clear guest storage after migration
          localStorage.removeItem(GUEST_HIGHLIGHTS_STORAGE_KEY);
        }

        setServerHighlights(combined);
      } catch (err) {
        console.error('Failed to load highlights from cloud database:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCloudHighlights();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, isAuthLoading]);

  // Add new highlight
  const addHighlight = useCallback(
    (item: Omit<TextHighlight, 'id' | 'createdAt'>): TextHighlight => {
      const newHighlight: TextHighlight = {
        ...item,
        id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (isCloudSync) {
        setServerHighlights((prev) => [newHighlight, ...prev]);
        // Fire-and-forget save to cloud
        highlightsApi.saveHighlight(newHighlight).catch((err) => {
          console.warn('Failed to save highlight to D1:', err);
        });
      } else {
        setLocalHighlights((prev) => {
          const next = [newHighlight, ...prev];
          saveGuestHighlightsToStorage(next);
          return next;
        });
      }

      return newHighlight;
    },
    [isCloudSync]
  );

  // Update existing highlight
  const updateHighlight = useCallback(
    (id: string, updates: Partial<TextHighlight>) => {
      const updater = (prev: TextHighlight[]) =>
        prev.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: Date.now() } : h));

      if (isCloudSync) {
        setServerHighlights(updater);
        highlightsApi.updateHighlight(id, {
          color: updates.color,
          note: updates.note,
        }).catch((err) => {
          console.warn('Failed to update highlight in D1:', err);
        });
      } else {
        setLocalHighlights((prev) => {
          const next = updater(prev);
          saveGuestHighlightsToStorage(next);
          return next;
        });
      }
    },
    [isCloudSync]
  );

  // Delete highlight
  const deleteHighlight = useCallback(
    (id: string) => {
      if (isCloudSync) {
        setServerHighlights((prev) => prev.filter((h) => h.id !== id));
        highlightsApi.deleteHighlight(id).catch((err) => {
          console.warn('Failed to delete highlight in D1:', err);
        });
      } else {
        setLocalHighlights((prev) => {
          const next = prev.filter((h) => h.id !== id);
          saveGuestHighlightsToStorage(next);
          return next;
        });
      }
    },
    [isCloudSync]
  );

  // Get highlights for a specific chapter
  const getHighlightsForChapter = useCallback(
    (bookId: string, chapterId: string): TextHighlight[] => {
      const cleanChapterId = chapterId.replace(/\.md$/i, '');
      return highlights.filter(
        (h) => h.bookId === bookId && (h.chapterId === chapterId || h.chapterId === cleanChapterId)
      );
    },
    [highlights]
  );

  // Get highlights for an entire book
  const getHighlightsForBook = useCallback(
    (bookId: string): TextHighlight[] => {
      return highlights.filter((h) => h.bookId === bookId);
    },
    [highlights]
  );

  // Clear all highlights for a book
  const clearHighlightsForBook = useCallback(
    (bookId: string) => {
      if (isCloudSync) {
        setServerHighlights((prev) => prev.filter((h) => h.bookId !== bookId));
        highlightsApi.clearHighlightsForBook(bookId).catch((err) => {
          console.warn('Failed to clear highlights for book in D1:', err);
        });
      } else {
        setLocalHighlights((prev) => {
          const next = prev.filter((h) => h.bookId !== bookId);
          saveGuestHighlightsToStorage(next);
          return next;
        });
      }
    },
    [isCloudSync]
  );

  // Clear all highlights
  const clearAllHighlights = useCallback(() => {
    if (isCloudSync) {
      setServerHighlights([]);
      highlightsApi.getHighlights().then((res) => {
        const ids = (res.highlights || []).map((h) => h.id);
        ids.forEach((id) => highlightsApi.deleteHighlight(id));
      });
    } else {
      setLocalHighlights([]);
      localStorage.removeItem(GUEST_HIGHLIGHTS_STORAGE_KEY);
    }
  }, [isCloudSync]);

  const contextValue = useMemo(
    () => ({
      highlights,
      isLoading,
      isCloudSync,
      addHighlight,
      updateHighlight,
      deleteHighlight,
      getHighlightsForChapter,
      getHighlightsForBook,
      clearHighlightsForBook,
      clearAllHighlights,
    }),
    [
      highlights,
      isLoading,
      isCloudSync,
      addHighlight,
      updateHighlight,
      deleteHighlight,
      getHighlightsForChapter,
      getHighlightsForBook,
      clearHighlightsForBook,
      clearAllHighlights,
    ]
  );

  return <HighlightContext.Provider value={contextValue}>{children}</HighlightContext.Provider>;
};

export const useHighlights = (): HighlightContextType => {
  const context = useContext(HighlightContext);
  if (!context) {
    throw new Error('useHighlights must be used within a HighlightProvider');
  }
  return context;
};
