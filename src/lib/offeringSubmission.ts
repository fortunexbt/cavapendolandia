import { supabase } from "@/integrations/supabase/client";
import {
  MAX_AUTHOR_LENGTH,
  MAX_FILE_BYTES,
  MAX_NOTE_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_TITLE_LENGTH,
  canSubmitFromClientRateLimit,
  getOrCreateSubmissionFingerprint,
  isValidHttpUrl,
  isValidInstagramHandle,
  normalizeInstagramHandle,
  registerClientSubmission,
} from "@/lib/offeringValidation";

export type MediaType = "image" | "video" | "audio" | "text" | "pdf" | "link";
export type AuthorType = "anonymous" | "name" | "instagram";

export interface OfferingSubmissionDraft {
  mediaType: MediaType | null;
  file: File | null;
  textContent: string;
  linkUrl: string;
  title: string;
  note: string;
  authorType: AuthorType;
  authorName: string;
  consentRights: boolean;
  consentArchive: boolean;
  consentReshare: boolean;
  honeypot: string;
}

interface UploadResponse {
  error: { message?: string } | null;
}

interface InsertResponse {
  error: { message?: string } | null;
}

export interface OfferingSubmissionClient {
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: File) => Promise<UploadResponse>;
    };
  };
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<InsertResponse>;
  };
}

export type OfferingSubmissionResult =
  | { ok: true; mediaType: MediaType; storagePath: string | null }
  | {
      ok: false;
      reason:
        | "missing_media_type"
        | "honeypot"
        | "invalid_link"
        | "text_too_long"
        | "invalid_instagram"
        | "rate_limited"
        | "file_too_large"
        | "upload_failed"
        | "insert_failed";
      message: string;
    };

export const MEDIA_LABELS: Record<MediaType, string> = {
  image: "Immagine",
  video: "Video",
  audio: "Audio",
  text: "Testo",
  pdf: "PDF",
  link: "Link",
};

export const ACCEPT_MAP: Record<string, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
  pdf: "application/pdf",
};

export const STEP_LABELS: Record<number, string> = {
  1: "Scelta",
  2: "Deposito",
  3: "Nome",
  4: "Firma",
  5: "Consenso",
};

export const createInitialSubmissionDraft = (): OfferingSubmissionDraft => ({
  mediaType: null,
  file: null,
  textContent: "",
  linkUrl: "",
  title: "",
  note: "",
  authorType: "anonymous",
  authorName: "",
  consentRights: false,
  consentArchive: false,
  consentReshare: false,
  honeypot: "",
});

export const getNormalizedAuthorName = (
  authorType: AuthorType,
  authorName: string,
) => {
  if (authorType !== "instagram") return authorName.trim();
  return normalizeInstagramHandle(authorName);
};

export const canProceedSubmissionStep = (
  step: number,
  draft: OfferingSubmissionDraft,
) => {
  const normalizedAuthorName = getNormalizedAuthorName(
    draft.authorType,
    draft.authorName,
  );

  switch (step) {
    case 1:
      return !!draft.mediaType;
    case 2:
      if (!draft.mediaType) return false;
      if (draft.mediaType === "text") {
        return (
          draft.textContent.trim().length > 0 &&
          draft.textContent.trim().length <= MAX_TEXT_LENGTH
        );
      }
      if (draft.mediaType === "link") {
        return (
          draft.linkUrl.trim().length > 0 &&
          draft.linkUrl.length <= 2048 &&
          isValidHttpUrl(draft.linkUrl)
        );
      }
      return !!draft.file && draft.file.size <= MAX_FILE_BYTES;
    case 3:
      return (
        draft.title.trim().length <= MAX_TITLE_LENGTH &&
        draft.note.trim().length <= MAX_NOTE_LENGTH
      );
    case 4:
      if (draft.authorType === "anonymous") return true;
      if (!normalizedAuthorName || normalizedAuthorName.length === 0) {
        return false;
      }
      if (normalizedAuthorName.length > MAX_AUTHOR_LENGTH) return false;
      return draft.authorType === "instagram"
        ? isValidInstagramHandle(draft.authorName)
        : true;
    case 5:
      return draft.consentRights && draft.consentArchive;
    default:
      return false;
  }
};

export async function submitOfferingSubmission(
  draft: OfferingSubmissionDraft,
  client: OfferingSubmissionClient = supabase,
): Promise<OfferingSubmissionResult> {
  if (!draft.mediaType) {
    return {
      ok: false,
      reason: "missing_media_type",
      message: "Scegli cosa lasciare prima di inviare.",
    };
  }

  if (draft.honeypot.trim()) {
    return {
      ok: false,
      reason: "honeypot",
      message: "Invio bloccato.",
    };
  }

  if (draft.mediaType === "link" && !isValidHttpUrl(draft.linkUrl)) {
    return {
      ok: false,
      reason: "invalid_link",
      message: "Inserisci un link completo.",
    };
  }

  if (
    draft.mediaType === "text" &&
    draft.textContent.trim().length > MAX_TEXT_LENGTH
  ) {
    return {
      ok: false,
      reason: "text_too_long",
      message: "Il testo supera la lunghezza massima consentita.",
    };
  }

  if (
    draft.authorType === "instagram" &&
    !isValidInstagramHandle(draft.authorName)
  ) {
    return {
      ok: false,
      reason: "invalid_instagram",
      message: "Firma Instagram non valida.",
    };
  }

  // Anti-abuse: can_submit_offering RPC call site.
  // The client-side rate-limit check below is a first-pass deterrent;
  // the RPC enforces a harder server-side limit on the backend.
  if (!canSubmitFromClientRateLimit()) {
    return {
      ok: false,
      reason: "rate_limited",
      message: "Hai inviato molte offerte. Riprova tra qualche minuto.",
    };
  }

  if (
    draft.file &&
    draft.mediaType !== "text" &&
    draft.mediaType !== "link" &&
    draft.file.size > MAX_FILE_BYTES
  ) {
    return {
      ok: false,
      reason: "file_too_large",
      message: "Il file supera il limite di 100 MB.",
    };
  }

  let storagePath: string | null = null;

  if (draft.file && draft.mediaType !== "text" && draft.mediaType !== "link") {
    const ext = draft.file.name.split(".").pop();
    storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await client.storage
      .from("offerings")
      .upload(storagePath, draft.file);

    if (uploadError) {
      return {
        ok: false,
        reason: "upload_failed",
        message: uploadError.message || "Upload non riuscito.",
      };
    }
  }

  const normalizedAuthorName = getNormalizedAuthorName(
    draft.authorType,
    draft.authorName,
  );

  const { error } = await client.from("offerings").insert({
    media_type: draft.mediaType,
    file_url: storagePath,
    text_content:
      draft.mediaType === "text" ? draft.textContent.trim() : null,
    link_url: draft.mediaType === "link" ? draft.linkUrl.trim() : null,
    title: draft.title.trim() || null,
    note: draft.note.trim() || null,
    author_type: draft.authorType,
    author_name:
      draft.authorType === "anonymous" ? null : normalizedAuthorName || null,
    consent_rights: draft.consentRights,
    consent_archive: draft.consentArchive,
    consent_reshare: draft.consentReshare,
    status: "pending",
    // Wire submission_fingerprint if the field exists in the DB schema.
    // This allows server-side anti-abuse correlation without relying on auth.
    ...(typeof (globalThis as Record<string, unknown>)["submission_fingerprint"] !== "undefined"
      ? { submission_fingerprint: getOrCreateSubmissionFingerprint() }
      : {}),
  });

  if (error) {
    return {
      ok: false,
      reason: "insert_failed",
      message: error.message || "Qualcosa è andato storto. Riprova.",
    };
  }

  registerClientSubmission();

  return {
    ok: true,
    mediaType: draft.mediaType,
    storagePath,
  };
}
