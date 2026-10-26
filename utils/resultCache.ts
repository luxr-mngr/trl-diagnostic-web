
import { QuestionnaireSlug } from '../types';

const CACHE_KEY = 'trl_result_answers_cache_v1';
const MAX_ENTRIES = 10;

interface CachedAnswers {
  questionnaireSlug: QuestionnaireSlug;
  questionnaireVersion: number;
  answers: Record<string, boolean>;
  savedAt: number;
}

type CacheStore = Record<string, CachedAnswers>;

const readStore = (): CacheStore => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
};

export const cacheResultAnswers = (
  resultCode: string,
  data: { questionnaireSlug: QuestionnaireSlug; questionnaireVersion: number; answers: Record<string, boolean> }
): void => {
  try {
    const store = readStore();
    store[resultCode] = { ...data, savedAt: Date.now() };
    const trimmed = Object.entries(store)
      .sort((a, b) => b[1].savedAt - a[1].savedAt)
      .slice(0, MAX_ENTRIES);
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // localStorage unavailable (private mode, quota exceeded, etc.) — safe to skip
  }
};

export const getCachedResultAnswers = (resultCode: string): CachedAnswers | null => {
  return readStore()[resultCode] ?? null;
};
