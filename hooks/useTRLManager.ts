
import { useCallback, useState } from 'react';
import {
  AssessmentResult,
  ProjectData,
  QuestionnaireDetail,
  Step,
  TechnologyType
} from '../types';
import {
  ApiError,
  evaluateStep,
  getQuestionnaireDetail,
  registerProject,
  submitAssessment,
  toProjectRegistrationRequest
} from '../services/trlApi';
import { cacheResultAnswers } from '../utils/resultCache';

export const useTRLManager = () => {
  const [step, setStep] = useState<Step>(Step.Welcome);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<TechnologyType | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentTrl, setCurrentTrl] = useState<number | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);

  const [isRegisteringProject, setIsRegisteringProject] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [isLoadingQuestionnaire, setIsLoadingQuestionnaire] = useState(false);
  const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const goToStep = useCallback((targetStep: Step) => setStep(targetStep), []);

  const handleStart = () => goToStep(Step.Info);

  const handleInfoNext = () => goToStep(Step.ProjectData);

  const handleProjectDataSubmit = async (data: ProjectData) => {
    setProjectData(data);
    setProjectError(null);
    setIsRegisteringProject(true);
    try {
      const response = await registerProject(toProjectRegistrationRequest(data));
      setProjectId(response.project_id);
      goToStep(Step.SelectTech);
    } catch (error) {
      setProjectError(
        error instanceof ApiError ? error.detail : 'No se pudo registrar los datos del proyecto.'
      );
    } finally {
      setIsRegisteringProject(false);
    }
  };

  const retryProjectRegistration = () => {
    if (projectData) handleProjectDataSubmit(projectData);
  };

  const loadQuestionnaire = useCallback(async (tech: TechnologyType) => {
    setSelectedTech(tech);
    setQuestionnaireError(null);
    setIsLoadingQuestionnaire(true);
    try {
      const detail = await getQuestionnaireDetail(tech.questionnaireSlug);
      const levels = [...detail.levels].sort((a, b) => a.trl - b.trl);
      setQuestionnaire({ ...detail, levels });
      setCurrentTrl(levels[0]?.trl ?? null);
      setAnswers({});
      setAssessmentResult(null);
      goToStep(Step.Assessment);
    } catch (error) {
      setQuestionnaireError(
        error instanceof ApiError ? error.detail : 'No se pudo cargar el cuestionario.'
      );
    } finally {
      setIsLoadingQuestionnaire(false);
    }
  }, [goToStep]);

  const handleTechSelect = (tech: TechnologyType) => {
    loadQuestionnaire(tech);
  };

  const retryQuestionnaire = () => {
    if (selectedTech) loadQuestionnaire(selectedTech);
  };

  /** Answers for every level up to and including `trl`, in TRL order. */
  const collectAnswers = (detail: QuestionnaireDetail, upToTrl: number, source: Record<string, boolean>) =>
    detail.levels
      .filter((level) => level.trl <= upToTrl)
      .flatMap((level) => level.questions)
      .filter((q) => source[q.code] !== undefined)
      .map((q) => ({ question_code: q.code, complies: source[q.code] }));

  const handleLevelNext = async (levelAnswers: Record<string, boolean>) => {
    if (!questionnaire || !projectId || currentTrl === null) return;
    const merged = { ...answers, ...levelAnswers };
    setAnswers(merged);
    setAssessmentError(null);
    setIsCalculating(true);
    try {
      // Only send levels up to the current one: going back and changing an
      // answer must invalidate whatever was answered beyond it.
      const accumulated = collectAnswers(questionnaire, currentTrl, merged);
      const base = {
        project_id: projectId,
        questionnaire_slug: questionnaire.slug,
        questionnaire_version: questionnaire.version,
        answers: accumulated
      };
      const progress = await evaluateStep(base);

      if (!progress.completed && progress.next_trl !== null) {
        setCurrentTrl(progress.next_trl);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const result = await submitAssessment(base);
      const finalAnswers = Object.fromEntries(accumulated.map((a) => [a.question_code, a.complies]));
      setAnswers(finalAnswers);
      setAssessmentResult(result);
      cacheResultAnswers(result.result_code, {
        questionnaireSlug: questionnaire.slug,
        questionnaireVersion: questionnaire.version,
        answers: finalAnswers
      });
      goToStep(Step.Result);
    } catch (error) {
      setAssessmentError(
        error instanceof ApiError ? error.detail : 'No se pudo calcular el resultado.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  /** Returns true when it moved to a previous level, false when already on the first one. */
  const handleLevelBack = (levelAnswers: Record<string, boolean>): boolean => {
    if (!questionnaire || currentTrl === null) return false;
    const index = questionnaire.levels.findIndex((level) => level.trl === currentTrl);
    if (index <= 0) return false;
    setAnswers((prev) => ({ ...prev, ...levelAnswers }));
    setCurrentTrl(questionnaire.levels[index - 1].trl);
    return true;
  };

  const handleBack = () => {
    if (step === Step.Assessment) setStep(Step.SelectTech);
    else if (step === Step.SelectTech) setStep(Step.ProjectData);
    else if (step === Step.ProjectData) setStep(Step.Info);
    else if (step === Step.Info) setStep(Step.Welcome);
  };

  const reset = () => {
    setStep(Step.Welcome);
    setProjectData(null);
    setProjectId(null);
    setSelectedTech(null);
    setQuestionnaire(null);
    setAnswers({});
    setCurrentTrl(null);
    setAssessmentResult(null);
    setProjectError(null);
    setQuestionnaireError(null);
    setAssessmentError(null);
  };

  return {
    step,
    projectData,
    selectedTech,
    questionnaire,
    answers,
    currentTrl,
    assessmentResult,
    isRegisteringProject,
    projectError,
    isLoadingQuestionnaire,
    questionnaireError,
    isCalculating,
    assessmentError,
    handleStart,
    handleInfoNext,
    handleProjectDataSubmit,
    retryProjectRegistration,
    handleTechSelect,
    retryQuestionnaire,
    handleLevelNext,
    handleLevelBack,
    handleBack,
    reset
  };
};
