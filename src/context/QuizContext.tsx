import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { QuizResult, QuizResultMap } from '../types/book';

interface QuizContextType {
  quizResults: QuizResultMap;
  saveQuizResult: (result: QuizResult) => void;
  getQuizResult: (bookId: string, chapterId: string) => QuizResult | undefined;
  clearQuizResult: (bookId: string, chapterId: string) => void;
  clearAllQuizResults: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizResults, setQuizResults] = useLocalStorage<QuizResultMap>('clb_sach_quiz_results', {});

  const saveQuizResult = (result: QuizResult) => {
    const key = `${result.bookId}:${result.chapterId}`;
    setQuizResults((prev) => ({
      ...prev,
      [key]: {
        ...result,
        completedAt: Date.now(),
      },
    }));
  };

  const getQuizResult = (bookId: string, chapterId: string): QuizResult | undefined => {
    const key = `${bookId}:${chapterId}`;
    return quizResults[key];
  };

  const clearQuizResult = (bookId: string, chapterId: string) => {
    const key = `${bookId}:${chapterId}`;
    setQuizResults((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const clearAllQuizResults = () => {
    setQuizResults({});
  };

  const value = useMemo(
    () => ({
      quizResults,
      saveQuizResult,
      getQuizResult,
      clearQuizResult,
      clearAllQuizResults,
    }),
    [quizResults]
  );

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
