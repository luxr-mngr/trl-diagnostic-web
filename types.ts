
export enum Step {
  Welcome,
  Info,
  ProjectData,
  SelectTech,
  Assessment,
  Result
}

export interface ProjectData {
  name: string;
  idType: string;
  idNumber: string;
  email: string;
  role: string;
  organization: string;
  proposalTitle: string;
  sector: string;
  summary: string;
  acceptedTerms: boolean;
}

export type QuestionnaireSlug = 'software' | 'manufacturing' | 'medical_device';

export type LevelStatus = 'No cumple' | 'Insuficiente' | 'En proceso' | 'Cumplido';

export type Dimension = 'TECHNOLOGICAL' | 'LEGAL_REGULATORY' | 'COMMERCIAL' | 'ORGANIZATIONAL';

export interface TechnologyType {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  color: string;
  questionnaireSlug: QuestionnaireSlug;
}

export interface QuestionnaireSummary {
  slug: QuestionnaireSlug;
  version: number;
  question_count: number;
}

export interface ClassificationBand {
  status: LevelStatus;
  chart_value: number;
  min_score_units: number;
  max_score_units: number;
}

export interface QuestionDTO {
  code: string;
  text: string;
  stage: string;
  priority: string;
  base_score_units: number;
  dimensions: Dimension[];
}

export interface LevelDTO {
  trl: number;
  title: string;
  classification_bands: ClassificationBand[];
  questions: QuestionDTO[];
}

export interface QuestionnaireDetail {
  slug: QuestionnaireSlug;
  version: number;
  weights: Record<string, number>;
  levels: LevelDTO[];
}

export interface ProjectRegistrationRequest {
  full_name: string;
  identification_type: string;
  identification_number: string;
  email: string;
  project_role: string;
  organization: string;
  proposal_title: string;
  sector: string;
  project_summary: string;
  consent_accepted: true;
}

export interface ProjectRegistrationResponse {
  project_id: string;
}

export interface AssessmentAnswerInput {
  question_code: string;
  complies: boolean;
}

export interface AssessmentRequest {
  project_id: string;
  questionnaire_slug: QuestionnaireSlug;
  questionnaire_version: number;
  answers: AssessmentAnswerInput[];
}

export interface EvaluateStepResponse {
  questionnaire_slug: QuestionnaireSlug;
  questionnaire_version: number;
  final_trl: number | null;
  levels: LevelResult[];
  dimensions: DimensionResult[];
  completed: boolean;
  next_trl: number | null;
}

export interface LevelResult {
  trl: number;
  score: number;
  maximum_score: number;
  status: LevelStatus;
  chart_value: number;
}

export interface DimensionResult {
  dimension: Dimension;
  fulfilled: number;
  total: number;
  percentage: number;
}

export interface AssessmentResult {
  assessment_id: string;
  result_code: string;
  questionnaire_slug: QuestionnaireSlug;
  questionnaire_version: number;
  final_trl: number | null;
  levels: LevelResult[];
  dimensions: DimensionResult[];
}

export interface ResultLookupProject {
  organization: string;
  proposal_title: string;
  sector: string;
  project_summary: string;
}

export interface ResultLookupAssessment {
  questionnaire_slug: QuestionnaireSlug;
  questionnaire_version: number;
  created_at: string;
  final_trl: number | null;
  levels: LevelResult[];
  dimensions: DimensionResult[];
  /** Not returned today. Present only if the backend starts including it. */
  answers?: AssessmentAnswerInput[];
}

export interface ResultLookupResponse {
  result_code: string;
  project: ResultLookupProject;
  assessment: ResultLookupAssessment;
}
