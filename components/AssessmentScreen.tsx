import React, { useMemo, useRef, useState } from 'react';
import { QuestionDTO, QuestionnaireDetail, TechnologyType } from '../types';

interface AssessmentScreenProps {
  tech: TechnologyType;
  questionnaire: QuestionnaireDetail;
  currentTrl: number | null;
  answers: Record<string, boolean>;
  onNext: (levelAnswers: Record<string, boolean>) => void;
  onPrevLevel: (levelAnswers: Record<string, boolean>) => boolean;
  onBack: () => void;
}

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const AssessmentScreen: React.FC<AssessmentScreenProps> = ({
  tech,
  questionnaire,
  currentTrl,
  answers: committedAnswers,
  onNext,
  onPrevLevel,
  onBack
}) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>(committedAnswers);

  // Order is drawn once per level per fill-out (this component remounts for each
  // new assessment), so going back and forth within a session keeps it stable.
  const orderCache = useRef<Record<number, QuestionDTO[]>>({});

  const levels = questionnaire.levels;
  const levelIndex = Math.max(0, levels.findIndex((l) => l.trl === currentTrl));
  const level = levels[levelIndex];

  const currentQuestions = useMemo(() => {
    if (!level) return [];
    if (!orderCache.current[level.trl]) orderCache.current[level.trl] = shuffle(level.questions);
    return orderCache.current[level.trl];
  }, [level]);

  const totalLevels = levels.length;
  const levelAnswered = currentQuestions.filter((q) => answers[q.code] !== undefined).length;
  const isCurrentPageComplete = currentQuestions.length > 0 && levelAnswered === currentQuestions.length;
  const isLastLevel = levelIndex === totalLevels - 1;

  const levelAnswersOnly = () =>
    Object.fromEntries(currentQuestions.map((q) => [q.code, answers[q.code]]).filter(([, v]) => v !== undefined));

  const handleAnswer = (code: string, complies: boolean) => {
    setAnswers((prev) => ({ ...prev, [code]: complies }));
  };

  const handleNext = () => {
    if (!isCurrentPageComplete) return;
    onNext(levelAnswersOnly());
  };

  const handlePrev = () => {
    if (!onPrevLevel(levelAnswersOnly())) {
      onBack();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!level) return null;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-fadeIn font-['Plus_Jakarta_Sans'] md:min-h-screen flex flex-col py-4 md:py-6">

      {/* Top Header Section - Calculadora TRL Tag */}
      <div className="flex justify-start mb-6 md:mb-10">
        <div className="bg-[#B2CCE8] rounded-r-full pl-5 pr-8 md:pl-8 md:pr-12 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 shadow-sm -ml-6 md:-ml-8">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-[#003B91] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"/>
          </svg>
          <span className="font-bold text-[#003B91] text-base md:text-xl tracking-tight whitespace-nowrap">Calculadora TRL</span>
        </div>
      </div>

      {/* Center Title */}
      <div className="flex flex-col items-center mb-8 md:mb-10">
        <h2 className="text-xl md:text-2xl font-medium text-[#003B91] text-center">{tech.title}</h2>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-x-10 md:gap-y-8 mb-10 md:mb-16 md:px-4">
        {currentQuestions.map((q, idx) => (
          <div key={q.code} className="bg-white rounded-[25px] p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-400 flex flex-col h-full">
            <div className="flex gap-3 md:gap-4 mb-6 md:mb-8">
              <span className="text-[#003B91] font-bold text-base md:text-lg pt-0.5 md:pt-1 shrink-0">
                {idx + 1}
              </span>
              <p className="text-black font-bold text-[15px] md:text-[17px] leading-[1.35]">{q.text}</p>
            </div>

            {/* Sí / No toggle */}
            <div className="mt-auto flex items-center justify-center gap-3 md:gap-4">
              <button
                onClick={() => handleAnswer(q.code, false)}
                className={`flex-1 rounded-full py-2.5 md:py-3 font-bold text-sm border-2 transition-all
                  ${answers[q.code] === false
                    ? 'bg-[#F48FB1] border-[#F48FB1] text-white shadow-inner'
                    : 'bg-white border-black text-black hover:border-[#F48FB1] hover:text-[#F48FB1]'}`}
              >
                No cumple
              </button>
              <button
                onClick={() => handleAnswer(q.code, true)}
                className={`flex-1 rounded-full py-2.5 md:py-3 font-bold text-sm border-2 transition-all
                  ${answers[q.code] === true
                    ? 'bg-[#003B91] border-[#003B91] text-white shadow-inner'
                    : 'bg-white border-black text-black hover:border-[#003B91] hover:text-[#003B91]'}`}
              >
                Sí cumple
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="mt-auto flex flex-col md:flex-row md:items-center gap-4 md:gap-6 md:px-4 max-w-[1100px] mx-auto w-full pb-8">
        <div className="order-1 md:order-2 flex-grow flex flex-col gap-1">
          <div className="flex gap-1 items-center h-2.5">
            {Array.from({ length: totalLevels }).map((_, i) => (
              <div
                key={i}
                className={`h-full rounded-full flex-grow transition-all duration-500
                  ${i < levelIndex || (i === levelIndex && isCurrentPageComplete) ? 'bg-[#003B91]' : 'bg-[#E0E0E0]'}`}
              />
            ))}
          </div>
        </div>

        <div className="order-2 md:contents flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            className="md:order-1 bg-[#BDBDBD] text-white rounded-full py-3 md:py-3.5 px-6 md:px-8 font-bold text-sm md:text-base flex items-center gap-2 transition-all hover:bg-slate-400 active:scale-95 shadow-md"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <button
            onClick={handleNext}
            disabled={!isCurrentPageComplete}
            className={`md:order-3 rounded-full py-3 md:py-3.5 px-6 md:px-8 font-bold text-sm md:text-base flex items-center gap-2 transition-all shadow-md
              ${isCurrentPageComplete
                ? 'bg-[#003B91] text-white hover:bg-[#00224a] active:scale-95'
                : 'bg-[#BDBDBD] text-white opacity-60 cursor-not-allowed'}`}
          >
            {isLastLevel ? 'Finalizar' : 'Siguiente'}
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentScreen;
