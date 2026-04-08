import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canProceedSubmissionStep,
  createInitialSubmissionDraft,
  getNormalizedAuthorName,
  submitOfferingSubmission,
  type OfferingSubmissionClient,
} from "@/lib/offeringSubmission";

describe("offeringSubmission", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("richiede contenuto valido e consensi minimi per avanzare", () => {
    const draft = createInitialSubmissionDraft();

    expect(canProceedSubmissionStep(1, draft)).toBe(false);

    draft.mediaType = "text";
    draft.textContent = "Una cavapendolata.";
    expect(canProceedSubmissionStep(2, draft)).toBe(true);

    draft.authorType = "instagram";
    draft.authorName = "@nome.profilo";
    expect(canProceedSubmissionStep(4, draft)).toBe(true);

    draft.consentRights = true;
    draft.consentArchive = false;
    expect(canProceedSubmissionStep(5, draft)).toBe(false);

    draft.consentArchive = true;
    expect(canProceedSubmissionStep(5, draft)).toBe(true);
  });

  it("normalizza la firma instagram", () => {
    expect(getNormalizedAuthorName("instagram", "@@Nome.Profilo")).toBe(
      "nome.profilo",
    );
    expect(getNormalizedAuthorName("name", "  Cavapendolo  ")).toBe(
      "Cavapendolo",
    );
  });

  it("inserisce un deposito testuale senza upload file", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const upload = vi.fn().mockResolvedValue({ error: null });
    const client: OfferingSubmissionClient = {
      storage: {
        from: () => ({
          upload,
        }),
      },
      from: () => ({
        insert,
      }),
    };

    const draft = createInitialSubmissionDraft();
    draft.mediaType = "text";
    draft.textContent = " Una cavapendolata di prova. ";
    draft.title = " Titolo ";
    draft.note = " Nota ";
    draft.authorType = "instagram";
    draft.authorName = "@Nome.Profilo";
    draft.consentRights = true;
    draft.consentArchive = true;

    const result = await submitOfferingSubmission(draft, client);

    expect(result).toEqual({
      ok: true,
      mediaType: "text",
      storagePath: null,
    });
    expect(upload).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        media_type: "text",
        text_content: "Una cavapendolata di prova.",
        title: "Titolo",
        note: "Nota",
        author_type: "instagram",
        author_name: "nome.profilo",
        consent_rights: true,
        consent_archive: true,
        status: "pending",
      }),
    );
  });

  it("blocca i link invalidi senza chiamare il backend", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client: OfferingSubmissionClient = {
      storage: {
        from: () => ({
          upload: vi.fn(),
        }),
      },
      from: () => ({
        insert,
      }),
    };

    const draft = createInitialSubmissionDraft();
    draft.mediaType = "link";
    draft.linkUrl = "nota-url";
    draft.consentRights = true;
    draft.consentArchive = true;

    const result = await submitOfferingSubmission(draft, client);

    expect(result).toEqual({
      ok: false,
      reason: "invalid_link",
      errorKey: "wizard.errorInvalidLink",
    });
    expect(insert).not.toHaveBeenCalled();
  });
});
