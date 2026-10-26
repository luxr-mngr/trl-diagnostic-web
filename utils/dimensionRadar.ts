
import { Dimension, QuestionnaireDetail } from '../types';
import { DimensionRadarPoint } from '../components/ResultDashboard';

export const computeDimensionRadarData = (
  questionnaire: QuestionnaireDetail,
  answers: Record<string, boolean>,
  dimension: Dimension,
  finalTrl: number | null
): DimensionRadarPoint[] => {
  const points: DimensionRadarPoint[] = [];
  questionnaire.levels.forEach((level) => {
    let earned = 0;
    let max = 0;
    level.questions.forEach((q) => {
      if (!q.dimensions.includes(dimension)) return;
      max += q.base_score_units;
      if (answers[q.code]) earned += q.base_score_units;
    });
    // Always one axis per level, even if it has no questions in this dimension.
    // Levels already passed plot full, so the chart doesn't need per-axis explaining.
    const value = finalTrl != null && level.trl <= finalTrl
      ? 100
      : max > 0 ? Number(((earned / max) * 100).toFixed(1)) : 0;
    points.push({ subject: `TRL ${level.trl}`, value, full: 100 });
  });
  return points;
};
