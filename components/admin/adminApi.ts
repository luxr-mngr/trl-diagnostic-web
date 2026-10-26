import { useCallback } from 'react';
import { useAuth } from '@clerk/react';
import { BASE_URL, formatValidationErrors } from '../../services/trlApi';
import { DimensionResult, LevelResult, QuestionnaireSlug } from '../../types';
import { TECH_TYPES } from '../../constants';

/*
 * The backend's OpenAPI doesn't declare response schemas for /admin/*, so these
 * types are written defensively (optional fields, a couple of fallbacks) and
 * the UI never assumes a field exists.
 */

export interface AdminProjectInfo {
  full_name?: string;
  identification_type?: string;
  identification_number?: string;
  email?: string;
  project_role?: string;
  organization?: string;
  proposal_title?: string;
  sector?: string;
  project_summary?: string;
}

export interface AdminAssessmentSummary extends AdminProjectInfo {
  assessment_id: string;
  result_code?: string;
  questionnaire_slug?: QuestionnaireSlug;
  questionnaire_version?: number;
  final_trl?: number | null;
  created_at?: string;
  project?: AdminProjectInfo;
}

export interface AdminAssessmentPage {
  items: AdminAssessmentSummary[];
  next_cursor: string | null;
}

export interface AdminAnswer {
  question_code: string;
  complies: boolean;
  text?: string;
  question_text?: string;
  trl?: number;
}

export interface AdminAssessmentDetail extends AdminAssessmentSummary {
  levels?: LevelResult[];
  dimensions?: DimensionResult[];
  answers?: AdminAnswer[];
}

export interface AssessmentFilters {
  questionnaire_slug: string;
  created_from: string; // yyyy-mm-dd from <input type="date">
  created_to: string;
  final_trl: string;
  search: string;
}

export const EMPTY_FILTERS: AssessmentFilters = {
  questionnaire_slug: '',
  created_from: '',
  created_to: '',
  final_trl: '',
  search: ''
};

export class AdminApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

/** Builds the shared filter query string used by the list and the Excel export. */
export const filtersToParams = (filters: AssessmentFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.questionnaire_slug) params.set('questionnaire_slug', filters.questionnaire_slug);
  if (filters.final_trl) params.set('final_trl', filters.final_trl);
  if (filters.search.trim()) params.set('search', filters.search.trim());
  // Date inputs are local calendar days; send the whole day as ISO 8601 instants.
  if (filters.created_from) params.set('created_from', new Date(`${filters.created_from}T00:00:00`).toISOString());
  if (filters.created_to) params.set('created_to', new Date(`${filters.created_to}T23:59:59.999`).toISOString());
  return params;
};

const readErrorDetail = async (response: Response): Promise<string> => {
  const body = await response.json().catch(() => null);
  if (typeof body?.detail === 'string') return body.detail;
  if (Array.isArray(body?.detail)) return formatValidationErrors(body.detail) || `Error HTTP ${response.status}`;
  return `Error HTTP ${response.status}`;
};

/**
 * Admin requests carry a fresh Clerk session JWT. The token is never stored by
 * us: Clerk keeps and refreshes the session, `getToken()` hands out a current one.
 */
export const useAdminApi = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const adminFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      if (!isLoaded || !isSignedIn) {
        throw new AdminApiError(401, 'Inicia sesión para usar el panel de administración.');
      }
      const token = await getToken();
      if (!token) {
        throw new AdminApiError(401, 'Clerk no devolvió un token de sesión. Vuelve a iniciar sesión.');
      }

      const headers = new Headers(init.headers);
      headers.set('Authorization', `Bearer ${token}`);
      if (init.body) headers.set('Content-Type', 'application/json');

      let response: Response;
      try {
        response = await fetch(`${BASE_URL}${path}`, { ...init, headers, cache: 'no-store' });
      } catch {
        throw new AdminApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }

      if (response.status === 401) {
        throw new AdminApiError(401, 'Sesión vencida o token inválido. Vuelve a iniciar sesión.');
      }
      if (response.status === 403) {
        throw new AdminApiError(403, 'Esta cuenta no está autorizada para administrar el sistema.');
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new AdminApiError(
          429,
          retryAfter
            ? `Se superó el límite de solicitudes. Intenta nuevamente en ${retryAfter} segundos.`
            : 'Se superó el límite de solicitudes. Intenta nuevamente en unos instantes.'
        );
      }
      if (!response.ok) {
        throw new AdminApiError(response.status, await readErrorDetail(response));
      }
      return response;
    },
    [getToken, isLoaded, isSignedIn]
  );

  const listAssessments = useCallback(
    async (filters: AssessmentFilters, cursor: string | null, limit = 50): Promise<AdminAssessmentPage> => {
      const params = filtersToParams(filters);
      params.set('limit', String(limit));
      if (cursor) params.set('cursor', cursor);
      const response = await adminFetch(`/admin/assessments?${params}`);
      return response.json();
    },
    [adminFetch]
  );

  const getAssessment = useCallback(
    async (assessmentId: string): Promise<AdminAssessmentDetail> => {
      const response = await adminFetch(`/admin/assessments/${encodeURIComponent(assessmentId)}`);
      return normalizeAssessmentDetail(await response.json());
    },
    [adminFetch]
  );

  const exportAssessments = useCallback(
    async (filters: AssessmentFilters): Promise<void> => {
      const params = filtersToParams(filters);
      const query = params.toString();
      const response = await adminFetch(`/admin/assessments/export.xlsx${query ? `?${query}` : ''}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evaluaciones-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      // Revoke on the next tick so the download has started in every browser.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    },
    [adminFetch]
  );

  return {
    listAssessments,
    getAssessment,
    exportAssessments
  };
};

type RawRecord = Record<string, unknown>;

const asRecord = (value: unknown): RawRecord | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as RawRecord) : undefined;

const normalizeAnswer = (raw: unknown): AdminAnswer | null => {
  const a = asRecord(raw);
  if (!a) return null;
  const code = a.question_code ?? a.code ?? asRecord(a.question)?.code;
  if (typeof code !== 'string') return null;
  const text = a.text ?? a.question_text ?? asRecord(a.question)?.text;
  return {
    question_code: code,
    complies: Boolean(a.complies ?? a.answer ?? a.value),
    text: typeof text === 'string' ? text : undefined,
    trl: typeof a.trl === 'number' ? a.trl : undefined
  };
};

/**
 * The detail endpoint nests the evaluation (TRL, levels, dimensions, answers)
 * under `assessment`, like the public result lookup, while project data sits
 * under `project`. Flatten it into one shape so the modal reads a single object.
 */
const normalizeAssessmentDetail = (raw: unknown): AdminAssessmentDetail => {
  const top = asRecord(raw) ?? {};
  const nested = asRecord(top.assessment) ?? {};
  const merged = { ...top, ...nested } as RawRecord;
  const answers = (Array.isArray(merged.answers) ? merged.answers : [])
    .map(normalizeAnswer)
    .filter((a): a is AdminAnswer => a !== null);

  return {
    ...(merged as unknown as AdminAssessmentDetail),
    assessment_id: String(top.assessment_id ?? nested.assessment_id ?? nested.id ?? top.id ?? ''),
    result_code: (top.result_code ?? nested.result_code) as string | undefined,
    created_at: (nested.created_at ?? top.created_at) as string | undefined,
    project: (asRecord(top.project) ?? asRecord(nested.project)) as AdminProjectInfo | undefined,
    answers
  };
};

/** Project fields may come flat on the item or nested under `project`. */
export const projectField = (item: AdminAssessmentSummary, field: keyof AdminProjectInfo): string | undefined =>
  item.project?.[field] ?? item[field];

export const QUESTIONNAIRE_LABELS: Record<string, string> = Object.fromEntries(
  TECH_TYPES.map((tech) => [tech.questionnaireSlug, tech.title])
);

export const formatDateTime = (iso?: string): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
};
