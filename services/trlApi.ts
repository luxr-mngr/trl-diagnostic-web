
import {
  AssessmentRequest,
  AssessmentResult,
  EvaluateStepResponse,
  ProjectData,
  ProjectRegistrationRequest,
  ProjectRegistrationResponse,
  QuestionnaireDetail,
  QuestionnaireSlug,
  QuestionnaireSummary,
  ResultLookupResponse
} from '../types';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backend-production-8fd6a.up.railway.app';

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export interface FastApiValidationError {
  loc: (string | number)[];
  msg: string;
}

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Nombres y apellidos',
  identification_type: 'Tipo de identificación',
  identification_number: 'Número de documento',
  email: 'Correo electrónico',
  project_role: 'Rol en el proyecto',
  organization: 'Organización',
  proposal_title: 'Título de propuesta',
  sector: 'Rubro del proyecto',
  project_summary: 'Resumen del proyecto',
  consent_accepted: 'Aceptación de términos',
  project_id: 'Proyecto',
  questionnaire_slug: 'Cuestionario',
  questionnaire_version: 'Versión del cuestionario',
  answers: 'Respuestas',
  question_code: 'Código de pregunta',
  complies: 'Respuesta',
  code: 'Código'
};

export function formatValidationErrors(items: FastApiValidationError[]): string {
  return items
    .map((item) => {
      const field = item.loc[item.loc.length - 1];
      const label = typeof field === 'string' ? (FIELD_LABELS[field] ?? field) : `elemento ${field}`;
      return `${label}: ${item.msg}`;
    })
    .join(' · ');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {})
      }
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
  }

  if (!response.ok) {
    let detail = `Ocurrió un error inesperado (${response.status}).`;

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      detail = retryAfter
        ? `Se superó el límite de solicitudes. Intenta nuevamente en ${retryAfter} segundos.`
        : 'Se superó el límite de solicitudes. Intenta nuevamente en unos instantes.';
    } else {
      try {
        const body = await response.json();
        if (typeof body?.detail === 'string') {
          detail = body.detail;
        } else if (Array.isArray(body?.detail)) {
          detail = formatValidationErrors(body.detail) || detail;
        }
      } catch {
        // keep default detail
      }
    }

    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

export const getProjectRoles = () =>
  request<string[]>('/project-roles');

export const getProjectSectors = () =>
  request<string[]>('/project-sectors');

export const getQuestionnaires = () =>
  request<QuestionnaireSummary[]>('/questionnaires');

export const getQuestionnaireDetail = (slug: QuestionnaireSlug) =>
  request<QuestionnaireDetail>(`/questionnaires/${slug}`);

export const evaluateStep = (payload: AssessmentRequest) =>
  request<EvaluateStepResponse>('/assessments/evaluate-step', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const submitAssessment = (payload: AssessmentRequest) =>
  request<AssessmentResult>('/assessments', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const toProjectRegistrationRequest = (data: ProjectData): ProjectRegistrationRequest => ({
  full_name: data.name,
  identification_type: data.idType,
  identification_number: data.idNumber,
  email: data.email,
  project_role: data.role,
  organization: data.organization,
  proposal_title: data.proposalTitle,
  sector: data.sector,
  project_summary: data.summary,
  consent_accepted: true
});

export const registerProject = (payload: ProjectRegistrationRequest) =>
  request<ProjectRegistrationResponse>('/projects', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const lookupResult = (code: string) =>
  request<ResultLookupResponse>('/results/lookup', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
