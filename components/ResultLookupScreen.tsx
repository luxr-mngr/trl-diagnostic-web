
import React, { useEffect, useState } from 'react';
import { Dimension, QuestionnaireDetail, ResultLookupResponse } from '../types';
import { ApiError, getQuestionnaireDetail, lookupResult } from '../services/trlApi';
import { TECH_TYPES } from '../constants';
import ResultDashboard, { DimensionRadarPoint } from './ResultDashboard';
import { computeDimensionRadarData } from '../utils/dimensionRadar';
import { getCachedResultAnswers } from '../utils/resultCache';
import { Search } from 'lucide-react';
import BackButton from './BackButton';

interface ResultLookupScreenProps {
  onBack: () => void;
  /** Lets the parent lock the viewport to one screen on desktop while the dashboard (not the search form) is showing. */
  onResultVisibleChange?: (visible: boolean) => void;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
};

const ResultLookupScreen: React.FC<ResultLookupScreenProps> = ({ onBack, onResultVisibleChange }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultLookupResponse | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDetail | null>(null);

  useEffect(() => {
    onResultVisibleChange?.(Boolean(result && questionnaire));
    return () => onResultVisibleChange?.(false);
  }, [result, questionnaire, onResultVisibleChange]);

  const isValidCode = /^[A-Za-z0-9]{6}$/.test(code);

  const handleSearch = async () => {
    if (!isValidCode) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setQuestionnaire(null);
    try {
      const normalizedCode = code.toUpperCase();
      const response = await lookupResult(normalizedCode);
      const detail = await getQuestionnaireDetail(response.assessment.questionnaire_slug);
      setResult(response);
      setQuestionnaire(detail);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : 'No se pudo consultar el resultado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSearch = () => {
    setResult(null);
    setQuestionnaire(null);
    setCode('');
  };

  if (result && questionnaire) {
    const finalTrl = result.assessment.final_trl;
    const currentLevelInfo = finalTrl != null ? questionnaire.levels.find((l) => l.trl === finalTrl) : undefined;
    const techTitle = TECH_TYPES.find((t) => t.questionnaireSlug === result.assessment.questionnaire_slug)?.title
      ?? result.assessment.questionnaire_slug;

    // The per-dimension radars need per-question answers. /results/lookup now returns
    // them; the browser cache stays as a fallback for assessments stored before that.
    const cached = getCachedResultAnswers(result.result_code);
    const cacheMatches =
      cached &&
      cached.questionnaireSlug === result.assessment.questionnaire_slug &&
      cached.questionnaireVersion === result.assessment.questionnaire_version;

    const answers: Record<string, boolean> | null = result.assessment.answers
      ? Object.fromEntries(result.assessment.answers.map((a) => [a.question_code, a.complies]))
      : cacheMatches
        ? cached!.answers
        : null;

    const dimensionRadarData = answers
      ? (Object.fromEntries(
          result.assessment.dimensions.map((d) => [
            d.dimension,
            computeDimensionRadarData(questionnaire, answers, d.dimension, finalTrl)
          ])
        ) as Partial<Record<Dimension, DimensionRadarPoint[]>>)
      : null;

    return (
      <ResultDashboard
        projectTitle={result.project.proposal_title}
        techTitle={techTitle}
        resultCode={result.result_code}
        finalTrl={finalTrl}
        currentLevelTitle={currentLevelInfo?.title}
        levels={result.assessment.levels}
        dimensions={result.assessment.dimensions}
        dimensionRadarData={dimensionRadarData}
        levelRadarData={[...questionnaire.levels]
          .sort((a, b) => a.trl - b.trl)
          .map(({ trl }) => {
            // Levels never reached aren't in the result; they still get an axis at 0.
            // Levels already passed plot full.
            const l = result.assessment.levels.find((r) => r.trl === trl);
            const passed = finalTrl != null && trl <= finalTrl;
            return {
              subject: `TRL ${trl}`,
              value: passed ? 100 : l && l.maximum_score > 0 ? Number(((l.score / l.maximum_score) * 100).toFixed(1)) : 0,
              full: 100
            };
          })}
        footerLine1={`PROYECTO: ${result.project.proposal_title}`}
        footerLine2={`Evaluado el ${formatDate(result.assessment.created_at)} · Cuestionario: ${result.assessment.questionnaire_slug} v${result.assessment.questionnaire_version}`}
        primaryActionLabel="Buscar otro código"
        onPrimaryAction={handleNewSearch}
        topRightNote={
          <BackButton onClick={onBack} label="Volver al inicio" variant="pill" />
        }
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn font-['Plus_Jakarta_Sans'] py-6">
      <div className="mb-6 md:mb-8">
        <BackButton onClick={onBack} label="Volver al inicio" />
      </div>

      <h2 className="text-2xl md:text-3xl font-black text-[#002B5B] mb-2">Consultar un resultado</h2>
      <p className="text-sm md:text-base text-black mb-6 md:mb-8">
        Ingresa el código de 6 caracteres que recibiste al finalizar tu evaluación.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ej. K7P4XM"
          maxLength={6}
          className="flex-grow rounded-full border border-black py-3 px-6 text-lg font-bold tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#00AEEF] bg-white"
        />
        <button
          onClick={handleSearch}
          disabled={!isValidCode || isLoading}
          className={`rounded-full py-3 px-8 font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0
            ${isValidCode && !isLoading
              ? 'bg-[#F9B115] hover:bg-[#e09e12] text-white active:scale-95'
              : 'bg-slate-300 text-black cursor-not-allowed'}`}
        >
          <Search className="w-5 h-5" /> {isLoading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="bg-[#FDECEC] border border-[#F5B5B5] text-[#8B1E1E] rounded-2xl px-6 py-4 mb-8 text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default ResultLookupScreen;
