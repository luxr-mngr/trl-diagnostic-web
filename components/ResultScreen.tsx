
import React from 'react';
import { AssessmentResult, Dimension, ProjectData, QuestionnaireDetail, TechnologyType } from '../types';
import ResultDashboard, { DimensionRadarPoint } from './ResultDashboard';
import { computeDimensionRadarData } from '../utils/dimensionRadar';

interface ResultScreenProps {
  tech: TechnologyType;
  questionnaire: QuestionnaireDetail;
  result: AssessmentResult;
  answers: Record<string, boolean>;
  projectData: ProjectData | null;
  onReset: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ tech, questionnaire, result, answers, projectData, onReset }) => {
  const finalTrl = result.final_trl;
  const currentLevelInfo = finalTrl != null ? questionnaire.levels.find((l) => l.trl === finalTrl) : undefined;

  // Every level gets an axis; passed levels plot full and levels never reached plot as 0.
  const dimensionRadarData = Object.fromEntries(
    result.dimensions.map((d) => [d.dimension, computeDimensionRadarData(questionnaire, answers, d.dimension, finalTrl)])
  ) as Partial<Record<Dimension, DimensionRadarPoint[]>>;

  return (
    <ResultDashboard
      projectTitle={projectData?.proposalTitle || 'Sin título'}
      techTitle={tech.title}
      resultCode={result.result_code}
      finalTrl={finalTrl}
      currentLevelTitle={currentLevelInfo?.title}
      levels={result.levels}
      dimensions={result.dimensions}
      dimensionRadarData={dimensionRadarData}
      footerLine1={`PROYECTO: ${projectData?.proposalTitle || 'Sin título'}`}
      footerLine2={`Cuestionario: ${result.questionnaire_slug} v${result.questionnaire_version} · ID: ${result.assessment_id}`}
      primaryActionLabel="Realizar Nueva Evaluación"
      onPrimaryAction={onReset}
    />
  );
};

export default ResultScreen;
