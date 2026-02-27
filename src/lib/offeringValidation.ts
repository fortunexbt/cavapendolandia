export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_TITLE_LENGTH = 60;
export const MAX_NOTE_LENGTH = 500;
export const MAX_TEXT_LENGTH = 2000;
export const MAX_AUTHOR_LENGTH = 30;
export const MAX_SUBMISSIONS_PER_10_MIN = 5;

const INSTAGRAM_HANDLE_REGEX = /^@?[A-Za-z0-9._]{1,30}$/;

export const normalizeInstagramHandle = (value: string) => {
  return value.trim().replace(/^@+/, "").toLowerCase();
};

export const isValidInstagramHandle = (value: string) => {
  return INSTAGRAM_HANDLE_REGEX.test(value.trim());
};

export const isValidHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

type ClientRateLimitRecord = {
  timestamps: number[];
};

const RATE_LIMIT_STORAGE_KEY = "cavapendolandia_submission_rate";
const SUBMISSION_FINGERPRINT_KEY = "cavapendolandia_submission_fingerprint";
const TEN_MINUTES_MS = 10 * 60 * 1000;

export const getOrCreateSubmissionFingerprint = () => {
  const existing = localStorage.getItem(SUBMISSION_FINGERPRINT_KEY);
  if (existing) return existing;

  const generated = crypto.randomUUID();
  localStorage.setItem(SUBMISSION_FINGERPRINT_KEY, generated);
  return generated;
};

export const canSubmitFromClientRateLimit = () => {
  const now = Date.now();
  const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const parsed: ClientRateLimitRecord = raw
    ? JSON.parse(raw)
    : { timestamps: [] };
  const recent = parsed.timestamps.filter((ts) => now - ts <= TEN_MINUTES_MS);

  return recent.length < MAX_SUBMISSIONS_PER_10_MIN;
};

export const registerClientSubmission = () => {
  const now = Date.now();
  const raw = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const parsed: ClientRateLimitRecord = raw
    ? JSON.parse(raw)
    : { timestamps: [] };
  const recent = parsed.timestamps.filter((ts) => now - ts <= TEN_MINUTES_MS);
  recent.push(now);

  localStorage.setItem(
    RATE_LIMIT_STORAGE_KEY,
    JSON.stringify({ timestamps: recent }),
  );
};
