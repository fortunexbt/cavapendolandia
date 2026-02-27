import { beforeEach, describe, expect, it } from "vitest";
import {
  canSubmitFromClientRateLimit,
  isValidHttpUrl,
  normalizeInstagramHandle,
  registerClientSubmission,
} from "@/lib/offeringValidation";

describe("offeringValidation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("normalizza gli handle instagram", () => {
    expect(normalizeInstagramHandle("@@Nome.Profilo")).toBe("nome.profilo");
  });

  it("accetta solo URL http/https", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("not-a-url")).toBe(false);
  });

  it("applica rate limit client-side", () => {
    expect(canSubmitFromClientRateLimit()).toBe(true);
    for (let i = 0; i < 5; i += 1) {
      registerClientSubmission();
    }
    expect(canSubmitFromClientRateLimit()).toBe(false);
  });
});
