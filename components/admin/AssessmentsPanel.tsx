import React, { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import {
  AdminApiError,
  AdminAssessmentSummary,
  AssessmentFilters,
  EMPTY_FILTERS,
  formatDateTime,
  projectField,
  QUESTIONNAIRE_LABELS,
  useAdminApi
} from './adminApi';
import AssessmentDetailModal from './AssessmentDetailModal';

const PAGE_SIZE = 50;

const inputClass =
  'w-full rounded-full border border-slate-400 bg-white py-2 px-4 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#00AEEF]';

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof AdminApiError ? error.message : fallback;

const AssessmentsPanel: React.FC = () => {
  const { listAssessments, exportAssessments } = useAdminApi();

  const [draft, setDraft] = useState<AssessmentFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<AssessmentFilters>(EMPTY_FILTERS);
  const [items, setItems] = useState<AdminAssessmentSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(
    async (filters: AssessmentFilters) => {
      setIsLoading(true);
      setError(null);
      try {
        const page = await listAssessments(filters, null, PAGE_SIZE);
        setItems(page.items ?? []);
        setNextCursor(page.next_cursor ?? null);
      } catch (e) {
        setItems([]);
        setNextCursor(null);
        setError(errorMessage(e, 'No se pudieron cargar las evaluaciones.'));
      } finally {
        setIsLoading(false);
      }
    },
    [listAssessments]
  );

  useEffect(() => {
    load(applied);
  }, [applied, load]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await listAssessments(applied, nextCursor, PAGE_SIZE);
      setItems((prev) => [...prev, ...(page.items ?? [])]);
      setNextCursor(page.next_cursor ?? null);
    } catch (e) {
      setError(errorMessage(e, 'No se pudo cargar la página siguiente.'));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Exports what the table shows: the applied filters, not unsaved edits in the form.
      await exportAssessments(applied);
    } catch (e) {
      setError(errorMessage(e, 'No se pudo exportar el Excel.'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied({ ...draft });
  };

  // Reloads with the filters already applied (new evaluations may have arrived).
  const handleRefresh = () => load(applied);

  const setField = (field: keyof AssessmentFilters) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section className="flex flex-col gap-4">
      {/* Filters */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[24px] border border-slate-400 shadow-sm p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end"
      >
        <label className="lg:col-span-2 flex flex-col gap-1">
          <span className="text-xs font-bold text-black px-2">Buscar</span>
          <input
            value={draft.search}
            onChange={setField('search')}
            maxLength={200}
            placeholder="Organización, propuesta o código"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-black px-2">Tecnología</span>
          <select value={draft.questionnaire_slug} onChange={setField('questionnaire_slug')} className={inputClass}>
            <option value="">Todas</option>
            {Object.entries(QUESTIONNAIRE_LABELS).map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-black px-2">TRL final</span>
          <select value={draft.final_trl} onChange={setField('final_trl')} className={inputClass}>
            <option value="">Todos</option>
            {Array.from({ length: 9 }, (_, i) => i + 1).map((trl) => (
              <option key={trl} value={trl}>TRL {trl}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-black px-2">Desde</span>
          <input type="date" value={draft.created_from} onChange={setField('created_from')} max={draft.created_to || undefined} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-black px-2">Hasta</span>
          <input type="date" value={draft.created_to} onChange={setField('created_to')} min={draft.created_from || undefined} className={inputClass} />
        </label>

        <div className="sm:col-span-2 lg:col-span-6 flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-[#003B91] hover:bg-[#00224a] text-white font-bold text-sm px-5 py-2 transition-colors disabled:opacity-60"
          >
            <Search className="w-4 h-4" /> Buscar
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full border-2 border-slate-400 bg-white text-black font-bold text-sm px-4 py-1.5 hover:border-[#003B91] hover:text-[#003B91] transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="sm:ml-auto flex items-center gap-2 rounded-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-sm px-5 py-2 transition-colors disabled:opacity-60"
            title="Descarga las evaluaciones que coinciden con los filtros aplicados (máximo 10 000 filas)"
          >
            <Download className="w-4 h-4" /> {isExporting ? 'Exportando…' : 'Exportar Excel'}
          </button>
        </div>
      </form>

      {error && (
        <div role="alert" className="rounded-2xl border border-[#8B1E1E] bg-[#FDECEC] text-[#8B1E1E] text-sm font-medium px-4 py-3 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(applied)} className="font-bold underline underline-offset-2 shrink-0">
            Reintentar
          </button>
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-[24px] border border-slate-400 shadow-sm overflow-hidden">
        <div className="px-4 md:px-5 py-3 border-b border-slate-300 flex items-center justify-between gap-3">
          <h2 className="text-[#003B91] font-bold text-base md:text-lg">Evaluaciones</h2>
          <span className="text-xs font-bold text-black">
            {isLoading ? 'Cargando…' : `${items.length} ${items.length === 1 ? 'resultado' : 'resultados'}${nextCursor ? ' (hay más)' : ''}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F4F7FA] text-xs uppercase tracking-wide text-black">
              <tr>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Fecha</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Código</th>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Propuesta</th>
                <th className="px-4 py-3 font-bold">Organización</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap">Tecnología</th>
                <th className="px-4 py-3 font-bold whitespace-nowrap text-center">TRL final</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && items.length === 0 && !error && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-black">
                    No hay evaluaciones que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {items.map((item) => (
                <tr
                  key={item.assessment_id}
                  onClick={() => setSelectedId(item.assessment_id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(item.assessment_id);
                    }
                  }}
                  tabIndex={0}
                  className="border-t border-slate-200 hover:bg-[#F4F7FA] focus:bg-[#F4F7FA] focus:outline-none cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-black">{formatDateTime(item.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-[#003B91] tracking-wider">{item.result_code ?? '—'}</td>
                  <td className="px-4 py-3 text-black max-w-[200px] truncate">{projectField(item, 'full_name') ?? '—'}</td>
                  <td className="px-4 py-3 text-black max-w-[260px] truncate">{projectField(item, 'proposal_title') ?? '—'}</td>
                  <td className="px-4 py-3 text-black max-w-[220px] truncate">{projectField(item, 'organization') ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-black">
                    {item.questionnaire_slug ? (QUESTIONNAIRE_LABELS[item.questionnaire_slug] ?? item.questionnaire_slug) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] rounded-full bg-[#003B91] text-white font-bold text-xs px-2 py-1">
                      {item.final_trl ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {nextCursor && (
          <div className="px-4 py-3 border-t border-slate-300 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="rounded-full border-2 border-[#003B91] text-[#003B91] font-bold text-sm px-5 py-1.5 hover:bg-[#003B91] hover:text-white transition-colors disabled:opacity-60"
            >
              {isLoadingMore ? 'Cargando…' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {selectedId && <AssessmentDetailModal assessmentId={selectedId} onClose={() => setSelectedId(null)} />}
    </section>
  );
};

export default AssessmentsPanel;
