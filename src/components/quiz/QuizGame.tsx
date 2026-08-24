import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Check, 
  X, 
  Lightbulb, 
  ChevronRight,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ChapterQuiz, QuizQuestion, Book, Chapter } from '../../types/book';
import { useQuiz } from '../../context/QuizContext';
import { trackCompleteQuiz } from '../../utils/analytics';

interface QuizGameProps {
  quiz: ChapterQuiz;
  book: Book;
  chapter: Chapter;
  onClose?: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  quiz,
  book,
  chapter,
  onClose,
}) => {
  const navigate = useNavigate();
  const { saveQuizResult, getQuizResult } = useQuiz();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: number }>({});
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  const existingResult = getQuizResult(book.id, chapter.id);
  const questions: QuizQuestion[] = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const currentSelection = selectedAnswers[currentIndex];
  const hasSelectedCurrent = currentSelection !== undefined;

  // Calculate next chapter
  const currentChapterIdx = book.chapters.findIndex((c) => c.id === chapter.id);
  const nextChapter = currentChapterIdx >= 0 && currentChapterIdx < book.chapters.length - 1
    ? book.chapters[currentChapterIdx + 1]
    : null;

  // Handle selecting an option
  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered || isCompleted) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
    setIsAnswered(true);

    // Small celebratory confetti for correct answer
    if (optionIndex === currentQuestion.correctIndex) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
    }
  };

  // Next question or finish
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsAnswered(selectedAnswers[currentIndex + 1] !== undefined);
    } else if (!isReviewMode) {
      finishQuiz();
    }
  };

  // Previous question (in review or normal)
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsAnswered(selectedAnswers[currentIndex - 1] !== undefined);
    }
  };

  // Complete Quiz and calculate score
  const finishQuiz = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const percent = Math.round((score / totalQuestions) * 100);

    saveQuizResult({
      bookId: book.id,
      chapterId: chapter.id,
      score,
      totalQuestions,
      percent,
      completedAt: Date.now(),
      userAnswers: selectedAnswers,
    });

    trackCompleteQuiz(book.id, book.title, chapter.id, chapter.title, score, totalQuestions, percent);

    setIsCompleted(true);

    // Trigger big confetti on completion
    if (percent >= 70) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
      });
    }
  };

  // Restart Quiz
  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setIsAnswered(false);
    setIsCompleted(false);
    setIsReviewMode(false);
  };

  // Compute final score
  const score = Object.entries(selectedAnswers).reduce((acc, [idx, ans]) => {
    const q = questions[parseInt(idx, 10)];
    return q && ans === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Render Completion Result View
  if (isCompleted && !isReviewMode) {
    let feedback = {
      badge: '🏆 BẬC THẦY THẤU HIỂU',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      title: 'Xuất Sắc! Bạn đã nắm trọn vẹn tinh hoa của chương!',
      desc: 'Khả năng phân tích và suy luận của bạn rất sắc bén. Bạn đã sẵn sàng ứng dụng những kiến thức này vào thực tiễn cuộc sống.',
    };

    if (percent < 60) {
      feedback = {
        badge: '💡 CẦN CỦNG CỐ THÊM',
        badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
        title: 'Bạn đã hoàn thành bài thử thách!',
        desc: 'Nhiều câu hỏi đòi hỏi sự liên hệ sâu sắc. Hãy xem lại lời giải thích chi tiết hoặc đọc lại chương sách để nắm chắc hơn nhé.',
      };
    } else if (percent < 80) {
      feedback = {
        badge: '🌟 ĐỘC GIẢ THÔNG THÁI',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        title: 'Rất Tốt! Bạn hiểu vững nội dung trọng tâm!',
        desc: 'Bạn đã nắm được các nguyên lý cốt lõi của chương. Hãy xem lại một vài câu chưa đúng để hoàn thiện kiến thức.',
      };
    }

    return (
      <div className="mx-auto max-w-2xl px-4 py-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 text-center shadow-xl">
          {/* Trophy Icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-lg shadow-amber-500/30">
            <Trophy className="h-10 w-10" />
          </div>

          <span className={`inline-block rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-3 ${feedback.badgeColor}`}>
            {feedback.badge}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {score} / {totalQuestions} Câu Đúng
          </h2>
          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Đạt độ chính xác {percent}%
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-3">
            {feedback.desc}
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsReviewMode(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-5 py-3 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs"
            >
              <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Xem lại toàn bộ câu hỏi & đáp án
            </button>

            <button
              onClick={handleRestart}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại Quiz
            </button>
          </div>

          {/* Next chapter navigation */}
          {nextChapter && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  navigate(`/reader/${book.id}/${nextChapter.id}`);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 hover:scale-105 transition-all"
              >
                <span>Đọc chương tiếp theo: {nextChapter.title}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md py-12 px-4 text-center">
        <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <h4 className="font-bold text-slate-800 dark:text-slate-200">
          Chưa có câu hỏi cho chương này
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Nội dung thử thách đang được cập nhật.
        </p>
      </div>
    );
  }

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 animate-in fade-in duration-150">
      {/* Quiz Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              Câu hỏi {currentIndex + 1} / {totalQuestions}
            </span>
            <span>•</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{chapter.title}</span>
          </div>
          {isReviewMode ? (
            <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
              Chế độ xem lại
            </span>
          ) : (
            <span>{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Question Selector in Review Mode */}
      {isReviewMode && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Danh sách câu:</span>
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const userAns = selectedAnswers[idx];
            const isCorrect = userAns === q.correctIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAnswered(true);
                }}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                  isCurrent
                    ? 'ring-2 ring-emerald-500 scale-110 shadow-sm z-10 ' + (isCorrect ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600')
                    : isCorrect
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 hover:scale-105'
                    : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 hover:scale-105'
                }`}
                title={`Câu ${idx + 1}: ${isCorrect ? 'Đúng' : 'Sai'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Thử thách suy luận #{currentIndex + 1}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = currentSelection === optIdx;
            const isCorrect = optIdx === currentQuestion.correctIndex;
            const showCorrectness = isAnswered || isReviewMode;

            let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/30';
            let badgeStyle = 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

            if (showCorrectness) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100 shadow-xs';
                badgeStyle = 'bg-emerald-500 text-white';
              } else if (isSelected) {
                optionStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 dark:border-rose-500 text-rose-950 dark:text-rose-100 shadow-xs';
                badgeStyle = 'bg-rose-500 text-white';
              } else {
                optionStyle = 'border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-transparent';
              }
            } else if (isSelected) {
              optionStyle = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 shadow-xs';
              badgeStyle = 'bg-emerald-600 text-white';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={showCorrectness && !isReviewMode}
                className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-150 flex items-start gap-3.5 group ${optionStyle}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${badgeStyle}`}
                >
                  {showCorrectness && isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : showCorrectness && isSelected ? (
                    <X className="h-4 w-4" />
                  ) : (
                    optionLetters[optIdx]
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    {option}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Explanation Box */}
        {(isAnswered || isReviewMode) && (
          <div className="mt-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
              <Lightbulb className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Phân tích & Bài học từ sách:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Navigation Toolbar */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold transition-all ${
              currentIndex === 0
                ? 'opacity-30 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 shadow-2xs'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Câu trước</span>
          </button>

          <div className="flex items-center gap-2">
            {isReviewMode ? (
              <>
                <button
                  onClick={() => setIsReviewMode(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 px-4 py-2 text-xs font-bold hover:opacity-90 transition-all shadow-xs"
                >
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Về</span> Tổng kết
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalQuestions - 1}
                  className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold transition-all ${
                    currentIndex === totalQuestions - 1
                      ? 'opacity-30 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 text-slate-400'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 shadow-2xs'
                  }`}
                >
                  <span>Câu sau</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasSelectedCurrent && !isAnswered}
                className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-xs font-bold transition-all shadow-md active:scale-95 ${
                  hasSelectedCurrent || isAnswered
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20 hover:scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <span>{currentIndex === totalQuestions - 1 ? 'Hoàn thành Quiz' : 'Câu tiếp theo'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
