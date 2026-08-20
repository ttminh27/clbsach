import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ReaderSettings, ReaderTheme, ReaderFontFamily, ReaderTextAlign, ReaderWidth } from '../types/settings';

const defaultSettings: ReaderSettings = {
  theme: 'light',
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'serif',
  textAlign: 'left',
  maxWidth: 'medium',
  bionicReading: false,
};

interface ReaderSettingsContextType {
  settings: ReaderSettings;
  setTheme: (theme: ReaderTheme) => void;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setLineHeight: (height: number) => void;
  setFontFamily: (font: ReaderFontFamily) => void;
  setTextAlign: (align: ReaderTextAlign) => void;
  setMaxWidth: (width: ReaderWidth) => void;
  toggleBionicReading: () => void;
  resetSettings: () => void;
}

const ReaderSettingsContext = createContext<ReaderSettingsContextType | undefined>(undefined);

export const ReaderSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<ReaderSettings>('clb_sach_reader_settings', defaultSettings);

  // Sync theme class to html root and document body
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark', 'sepia', 'oled');
    body.classList.remove('dark', 'sepia', 'oled', 'reader-dark', 'reader-sepia', 'reader-oled');

    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark', 'reader-dark');
    } else if (settings.theme === 'sepia') {
      root.classList.add('sepia');
      body.classList.add('sepia', 'reader-sepia');
    } else if (settings.theme === 'oled') {
      root.classList.add('dark', 'oled');
      body.classList.add('dark', 'oled', 'reader-oled');
    }
  }, [settings.theme]);

  const setTheme = (theme: ReaderTheme) => setSettings((s) => ({ ...s, theme }));
  const setFontSize = (fontSize: number) => setSettings((s) => ({ ...s, fontSize: Math.min(32, Math.max(14, fontSize)) }));
  const increaseFontSize = () => setSettings((s) => ({ ...s, fontSize: Math.min(32, s.fontSize + 2) }));
  const decreaseFontSize = () => setSettings((s) => ({ ...s, fontSize: Math.max(14, s.fontSize - 2) }));
  const setLineHeight = (lineHeight: number) => setSettings((s) => ({ ...s, lineHeight }));
  const setFontFamily = (fontFamily: ReaderFontFamily) => setSettings((s) => ({ ...s, fontFamily }));
  const setTextAlign = (textAlign: ReaderTextAlign) => setSettings((s) => ({ ...s, textAlign }));
  const setMaxWidth = (maxWidth: ReaderWidth) => setSettings((s) => ({ ...s, maxWidth }));
  const toggleBionicReading = () => setSettings((s) => ({ ...s, bionicReading: !s.bionicReading }));
  const resetSettings = () => setSettings(defaultSettings);

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      setLineHeight,
      setFontFamily,
      setTextAlign,
      setMaxWidth,
      toggleBionicReading,
      resetSettings,
    }),
    [settings]
  );

  return <ReaderSettingsContext.Provider value={value}>{children}</ReaderSettingsContext.Provider>;
};

export const useReaderSettings = () => {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error('useReaderSettings must be used within a ReaderSettingsProvider');
  }
  return context;
};
