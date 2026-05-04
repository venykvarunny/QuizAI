import { getApiBaseUrl } from '@/lib/api-url';

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function parseJsonBody(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text };
  }
}

function messageFromBody(body: Record<string, unknown>, fallback: string): string {
  const err = body.error;
  return typeof err === 'string' && err.length > 0 ? err : fallback;
}

export async function getHealth(): Promise<{ ok: boolean }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/health`, { method: 'GET' });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Health check failed'), res.status, body);
  }
  return body as { ok: boolean };
}

export async function postRegister(email: string, password: string): Promise<{ id: number; email: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Registration failed'), res.status, body);
  }
  return body as { id: number; email: string };
}

export async function postLogin(email: string, password: string): Promise<{ token: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Login failed'), res.status, body);
  }
  return body as { token: string };
}

export async function postVerifyEmail(
  email: string,
  otp: string,
  password: string
): Promise<{ message: string; token: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), otp, password }),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Verification failed'), res.status, body);
  }
  return body as { message: string; token: string };
}

export async function getMe(token: string): Promise<{ user: unknown }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Request failed'), res.status, body);
  }
  return body as { user: unknown };
}

/** User profile as returned on GET /dashboard (and normalized from snake_case). */
export type DashboardUser = {
  id: string | number;
  email: string;
  name: string | null;
};

/** Quiz summary for the account dashboard. */
export type DashboardQuizStats = {
  hasAttemptedQuiz: boolean;
  hasPassedQuiz: boolean;
  attemptCount: number;
  /** Best score 0–100 across attempts, or null if none / not tracked */
  bestScorePercent: number | null;
  lastAttemptStatus: 'none' | 'passed' | 'failed' | 'in_progress';
};

export type DashboardResponse = {
  user: DashboardUser;
  quiz: DashboardQuizStats;
};

function readString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function readId(v: unknown): string | number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') return v;
  return '';
}

function coerceLastStatus(v: unknown): DashboardQuizStats['lastAttemptStatus'] {
  if (v === 'passed' || v === 'failed' || v === 'in_progress' || v === 'none') return v;
  return 'none';
}

function normalizeDashboard(body: Record<string, unknown>): DashboardResponse {
  const userRaw = body.user;
  const quizRaw = (body.quiz ?? body.quizStats ?? body.quiz_stats) as Record<string, unknown> | undefined;

  let user: DashboardUser = {
    id: '',
    email: '',
    name: null,
  };
  if (userRaw && typeof userRaw === 'object' && !Array.isArray(userRaw)) {
    const u = userRaw as Record<string, unknown>;
    user = {
      id: readId(u.id),
      email: readString(u.email) ?? '',
      name: readString(u.name ?? u.full_name ?? u.fullName),
    };
  }

  let quiz: DashboardQuizStats = {
    hasAttemptedQuiz: false,
    hasPassedQuiz: false,
    attemptCount: 0,
    bestScorePercent: null,
    lastAttemptStatus: 'none',
  };
  if (quizRaw && typeof quizRaw === 'object') {
    const has =
      quizRaw.hasAttemptedQuiz ??
      quizRaw.has_attempted_quiz ??
      quizRaw.hasAttempted ??
      false;
    const count = quizRaw.attemptCount ?? quizRaw.attempt_count ?? 0;
    const best = quizRaw.bestScorePercent ?? quizRaw.best_score_percent ?? quizRaw.score;
    const status = quizRaw.lastAttemptStatus ?? quizRaw.last_attempt_status;
    const hasPassed = quizRaw.hasPassedQuiz ?? quizRaw.has_passed_quiz ?? quizRaw.hasUserPassedQuiz ?? quizRaw.has_user_passed_quiz ?? false;
    quiz = {
      hasAttemptedQuiz: Boolean(has),
      hasPassedQuiz: Boolean(hasPassed),
      attemptCount: typeof count === 'number' && count >= 0 ? Math.floor(count) : 0,
      bestScorePercent:
        typeof best === 'number' && Number.isFinite(best)
          ? Math.min(100, Math.max(0, Math.round(best)))
          : null,
      lastAttemptStatus: coerceLastStatus(status),
    };
  }

  return { user, quiz };
}

export async function getDashboard(token: string): Promise<DashboardResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/dashboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to load dashboard'), res.status, body);
  }
  return normalizeDashboard(body);
}

export type QuizOption = {
  id: string;
  label: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  type: string;
  text: string;
  options: QuizOption[];
};

export type QuizCurrentResponse = {
  attemptId: string;
  /** Which quiz attempt this is for the user (1, 2, …) when the API sends it */
  attemptNumber?: number;
  /** True when user has already passed quiz and should not start again */
  hasPassedQuiz?: boolean;
  questionNumber: number;
  totalQuestions: number;
  timeLimitSec: number;
  question: QuizQuestion;
  /** Present on POST /quiz/start (e.g. "Quiz attempt started"); omitted on GET /quiz/current */
  message?: string;
};

export type QuizAnswerResponse = {
  result: 'correct' | 'incorrect';
  attemptStatus: 'in_progress' | 'passed' | 'failed';
  message?: string;
  nextQuestion?: {
    attemptNumber?: number;
    questionNumber: number;
    totalQuestions: number;
    timeLimitSec: number;
    question: QuizQuestion;
  };
};

function coerceQuizAttemptNumber(body: Record<string, unknown>): number | undefined {
  const raw = body.attemptNumber ?? body.attempt_number;
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 1) {
    return Math.floor(raw);
  }
  return undefined;
}

function normalizeQuizCurrent(body: Record<string, unknown>): QuizCurrentResponse {
  const base = body as unknown as QuizCurrentResponse;
  const attemptNumber = coerceQuizAttemptNumber(body) ?? base.attemptNumber;
  const hasPassedRaw = body.hasPassedQuiz ?? body.has_passed_quiz ?? body.hasUserPassedQuiz ?? body.has_user_passed_quiz;
  const hasPassedQuiz = typeof hasPassedRaw === 'boolean' ? hasPassedRaw : base.hasPassedQuiz;
  return { ...base, attemptNumber, hasPassedQuiz };
}

function normalizeQuizAnswer(body: Record<string, unknown>): QuizAnswerResponse {
  const base = body as unknown as QuizAnswerResponse;
  const nq = body.nextQuestion;
  if (nq && typeof nq === 'object' && !Array.isArray(nq)) {
    const nqRec = nq as Record<string, unknown>;
    const nextBase = nq as unknown as NonNullable<QuizAnswerResponse['nextQuestion']>;
    const attemptNumber = coerceQuizAttemptNumber(nqRec) ?? nextBase.attemptNumber;
    return { ...base, nextQuestion: { ...nextBase, attemptNumber } };
  }
  return base;
}

export async function getQuizCurrent(token: string): Promise<QuizCurrentResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/quiz/current`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to load quiz'), res.status, body);
  }
  return normalizeQuizCurrent(body);
}

/** Call when there is no in-progress attempt yet (same response shape as GET /quiz/current). */
export async function postQuizStart(token: string): Promise<QuizCurrentResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/quiz/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to start quiz'), res.status, body);
  }
  return normalizeQuizCurrent(body);
}

export async function postQuizAnswer(
  token: string,
  payload: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string;
    timeTakenSec: number;
  }
): Promise<QuizAnswerResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/quiz/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to submit answer'), res.status, body);
  }
  return normalizeQuizAnswer(body);
}

export async function postQuizTimeout(
  token: string,
  payload: { attemptId: string; questionId: string }
): Promise<{ attemptStatus: 'failed' | 'in_progress' | 'passed'; message?: string }> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/quiz/timeout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to submit timeout'), res.status, body);
  }
  return body as { attemptStatus: 'failed' | 'in_progress' | 'passed'; message?: string };
}

export type SentimentAnalyzeResponse = {
  sentiment?: string;
  score?: number;
  [key: string]: unknown;
};

export async function postSentimentAnalyze(
  token: string,
  payload: { text: string }
): Promise<SentimentAnalyzeResponse> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/sentiment/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: payload.text }),
  });
  const body = await parseJsonBody(res);
  if (!res.ok) {
    throw new AuthApiError(messageFromBody(body, 'Failed to analyze sentiment'), res.status, body);
  }
  return body as SentimentAnalyzeResponse;
}
