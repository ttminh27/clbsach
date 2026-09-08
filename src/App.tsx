import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Sidebar } from './components/layout/Sidebar';
import { FloatingAudioBar } from './components/audio/FloatingAudioBar';
import { AudioModal } from './components/audio/AudioModal';
import { HomePage } from './pages/HomePage';
import { BookDetailPage } from './pages/BookDetailPage';
import { ReaderPage } from './pages/ReaderPage';
import { QuizPage } from './pages/QuizPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { GuidePage } from './pages/GuidePage';
import { AdminPage } from './pages/AdminPage';
import { HistoryProvider } from './context/HistoryContext';
import { AudioProvider } from './context/AudioContext';
import { ReaderSettingsProvider } from './context/ReaderSettingsContext';
import { QuizProvider } from './context/QuizContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/reader/') || location.pathname.startsWith('/read/');
  const isQuizPage = location.pathname.startsWith('/quiz/');
  const hideStandardNav = isReaderPage || isQuizPage;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Auto close mobile sidebar & track page view on route change in Google Analytics
  useEffect(() => {
    setIsSidebarOpen(false);

    // Track SPA route change in Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-CG3YSVT2SL', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  const handleToggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsSidebarCollapsed((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Persistent / Drawer Left Sidebar for both Normal and Reader TOC Mode */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main App Content Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-80'
        }`}
      >
        {!hideStandardNav && (
          <Navbar
            onToggleSidebar={handleToggleSidebar}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        )}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/huong-dan" element={<GuidePage />} />
            <Route path="/book/:bookId" element={<BookDetailPage />} />
            <Route
              path="/reader/:bookId/:chapterId"
              element={<ReaderPage />}
            />
            <Route
              path="/read/:bookId/:chapterId"
              element={<ReaderPage />}
            />
            <Route
              path="/quiz/:bookId/:chapterId"
              element={<QuizPage />}
            />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        {!hideStandardNav && <MobileNav />}
      </div>

      <FloatingAudioBar isSidebarCollapsed={isSidebarCollapsed} />
      <AudioModal />
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <AudioProvider>
          <ReaderSettingsProvider>
            <QuizProvider>
              <Router>
                <AppLayout />
              </Router>
            </QuizProvider>
          </ReaderSettingsProvider>
        </AudioProvider>
      </HistoryProvider>
    </AuthProvider>
  );
}

export default App;
