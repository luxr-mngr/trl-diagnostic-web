import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { QuestionnaireDetail } from '../../types';
import { getQuestionnaireDetail } from '../../services/trlApi';
import { DIMENSION_META } from '../ResultDashboard';
import {
  AdminApiError,
  AdminAnswer,
  AdminAssessmentDetail,
  AdminProjectInfo,
  formatDateTime,
  projectField,
  QUESTIONNAIRE_LABELS,
  useAdminApi
} from './adminApi';

interface AssessmentDetailModalProps {
  assessmentId: string;
  onClose: () => void;
}

const PROJECT_FIELDS: { field: keyof AdminProjectInfo; label: string; wide?: boolean }[] = [
  { field: 'full_name', label: 'Nombres y apellidos' },
  { field: 'email', label: 'Correo electrónico' },
  { field: 'identification_type', label: 'Tipo de documento' },
  { field: 'identification_number', label: 'Número de documento' },
  { field: 'project_role', label: 'Rol en el proyecto' },
  { field: 'organization', label: 'Organización' },
  { field: 'sector', label: 'Rubro' },
  { field: 'proposal_title', label: 'Título de propuesta', wide: true },
  { field: 'project_summary', label: 'Resumen del proyecto', wide: true }
];

/** "TRL3.2.S" -> 3. Used when an answer doesn't say which level it belongs to. */
const trlFromCode = (code: string): number | undefined => {
  const match = /^TRL(\d+)/i.exec(code);
  return match ? Number(match[1]) : undefined;
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-[#003B91] font-bold text-base mb-3">{children}</h4>
);

const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({ assessmentId, onClose }) => {
  const { getAssessment } = useAdminApi();
  const [detail, setDetail] = useState<AdminAssessmentDetail | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetail(null);
    setError(null);
    getAssessment(assessmentId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        // Answers may come with codes only; the public questionnaire supplies the question text.
        const needsText = data.answers?.some((a) => !a.text && !a.question_text);
        if (needsText && data.questionnaire_slug) {
          getQuestionnaireDetail(data.questionnaire_slug)
            .then((q) => !cancelled && setQuestionnaire(q))
            .catch(() => {
              // Codes are still shown; the text is a nice-to-have.
            });
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof AdminApiError) {
          setError(e.message);
        } else {
          // An unexpected response shape surfaces here; keep the cause visible for support.
          console.error('Admin assessment detail failed', e);
          setError(`No se pudo mostrar la evaluación (${e instanceof Error ? e.message : String(e)}).`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [assessmentId, getAssessment]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const questionText = useMemo(() => {
    const map = new Map<string, string>();
    questionnaire?.levels.forEach((level) => level.questions.forEach((q) => map.set(q.code, q.text)));
    return map;
  }, [questionnaire]);

  const answersByLevel = useMemo(() => {
    const groups = new Map<number, AdminAnswer[]>();
    (detail?.answers ?? []).forEach((answer) => {
      const trl = answer.trl ?? trlFromCode(answer.question_code) ?? 0;
      groups.set(trl, [...(groups.get(trl) ?? []), answer]);
    });
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [detail]);

  return createPortal(
    <div
      className="fixed inset-0 bg-[#002B5B]/50 backdrop-blur-sm z-[200] flex items-center justify-center p-3 md:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assessment-detail-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[25px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 px-5 md:px-8 py-4 border-b border-slate-300">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#00AEEF] uppercase tracking-wider truncate">
              {detail ? (projectField(detail, 'proposal_title') ?? 'Sin título') : 'Evaluación'}
            </p>
            <h3 id="assessment-detail-title" className="text-xl md:text-2xl font-bold text-[#002B5B]">
              {detail?.result_code ? `Resultado ${detail.result_code}` : 'Detalle de la evaluación'}
            </h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="shrink-0 text-black hover:text-[#003B91] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 md:px-8 py-5 space-y-6 text-sm text-black">
          {error && (
            <p role="alert" className="rounded-2xl border border-[#8B1E1E] bg-[#FDECEC] text-[#8B1E1E] font-medium px-4 py-3">
              {error}
            </p>
          )}
          {!detail && !error && <p className="py-10 text-center">Cargando evaluación…</p>}

          {detail && (
            <>
              {/* Summary */}
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] text-white px-5 py-3 flex items-center gap-4">
                  <span className="text-sm font-bold leading-tight">TRL final</span>
                  <span className="text-4xl font-bold leading-none">{detail.final_trl ?? 0}</span>
                </div>
                <div className="rounded-2xl border border-slate-400 px-4 py-2 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Tecnología</span>
                  <span className="font-medium">
                    {detail.questionnaire_slug ? (QUESTIONNAIRE_LABELS[detail.questionnaire_slug] ?? detail.questionnaire_slug) : '—'}
                    {detail.questionnaire_version ? ` · v${detail.questionnaire_version}` : ''}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-400 px-4 py-2 flex flex-col justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wide">Fecha</span>
                  <span className="font-medium">{formatDateTime(detail.created_at)}</span>
                </div>
              </div>

              {/* Project / personal data */}
              <section>
                <SectionTitle>Datos del proyecto</SectionTitle>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {PROJECT_FIELDS.map(({ field, label, wide }) => (
                    <div key={field} className={wide ? 'sm:col-span-2' : undefined}>
                      <dt className="text-[11px] font-bold uppercase tracking-wide">{label}</dt>
                      <dd className="font-medium whitespace-pre-line break-words">{projectField(detail, field) || '—'}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              {/* Levels */}
              {detail.levels && detail.levels.length > 0 && (
                <section>
                  <SectionTitle>Resultado por nivel</SectionTitle>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-[#F4F7FA] text-xs uppercase tracking-wide">
                        <tr>
                          <th className="px-3 py-2 font-bold">Nivel</th>
                          <th className="px-3 py-2 font-bold">Puntaje</th>
                          <th className="px-3 py-2 font-bold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...detail.levels].sort((a, b) => a.trl - b.trl).map((level) => (
                          <tr key={level.trl} className="border-t border-slate-200">
                            <td className="px-3 py-2 font-bold">TRL {level.trl}</td>
                            <td className="px-3 py-2">{level.score} / {level.maximum_score}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${level.status === 'Cumplido' ? 'bg-[#003B91] text-white' : 'border border-slate-400'}`}>
                                {level.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Dimensions */}
              {detail.dimensions && detail.dimensions.length > 0 && (
                <section>
                  <SectionTitle>Análisis dimensional</SectionTitle>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {detail.dimensions.map((d) => {
                      const meta = DIMENSION_META[d.dimension] ?? { label: d.dimension, color: '#003B91' };
                      return (
                        <div key={d.dimension} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{meta.label}</span>
                            <span>{d.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="h-full" style={{ width: `${d.percentage}%`, backgroundColor: meta.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Answers */}
              <section>
                <SectionTitle>Respuestas{detail.answers ? ` (${detail.answers.length})` : ''}</SectionTitle>
                {answersByLevel.length === 0 ? (
                  <p>Esta evaluación no incluye respuestas.</p>
                ) : (
                  <div className="space-y-4">
                    {answersByLevel.map(([trl, answers]) => (
                      <div key={trl}>
                        <p className="text-xs font-bold uppercase tracking-wide mb-1.5">{trl ? `TRL ${trl}` : 'Sin nivel'}</p>
                        <ul className="divide-y divide-slate-200 border border-slate-300 rounded-2xl overflow-hidden">
                          {answers.map((answer) => (
                            <li key={answer.question_code} className="flex items-start gap-3 px-3 py-2">
                              <span
                                className={`mt-0.5 shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold
                                  ${answer.complies ? 'bg-[#003B91] text-white' : 'bg-[#F48FB1] text-white'}`}
                              >
                                {answer.complies ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                {answer.complies ? 'Cumple' : 'No cumple'}
                              </span>
                              <span className="min-w-0">
                                <span className="font-mono text-[11px] font-bold mr-2">{answer.question_code}</span>
                                {answer.text ?? answer.question_text ?? questionText.get(answer.question_code) ?? ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AssessmentDetailModal;
