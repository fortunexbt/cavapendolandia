import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMocks = vi.hoisted(() => ({
  createSignedUrl: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: supabaseMocks.from,
    },
  },
}));

import { withSignedFileUrl, withSignedFileUrls } from "@/lib/offeringMedia";

describe("offeringMedia", () => {
  beforeEach(() => {
    supabaseMocks.createSignedUrl.mockReset();
    supabaseMocks.from.mockReset();
    supabaseMocks.from.mockReturnValue({
      createSignedUrl: supabaseMocks.createSignedUrl,
    });
  });

  it("lascia intatti gli asset pubblici locali", async () => {
    const result = await withSignedFileUrl({
      id: "demo",
      file_url: "/cavapendoli/models-a.png",
    });

    expect(result.file_url).toBe("/cavapendoli/models-a.png");
    expect(supabaseMocks.from).not.toHaveBeenCalled();
    expect(supabaseMocks.createSignedUrl).not.toHaveBeenCalled();
  });

  it("firma i path storage relativi", async () => {
    supabaseMocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example.com/media.png" },
      error: null,
    });

    const result = await withSignedFileUrl({
      id: "approved",
      file_url: "2026-03-26/example.png",
    });

    expect(supabaseMocks.from).toHaveBeenCalledWith("offerings");
    expect(supabaseMocks.createSignedUrl).toHaveBeenCalledWith(
      "2026-03-26/example.png",
      60 * 60,
    );
    expect(result.file_url).toBe("https://signed.example.com/media.png");
  });

  it("firma in batch solo le entries che usano lo storage", async () => {
    supabaseMocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: "https://signed.example.com/final.pdf" },
      error: null,
    });

    const [localAsset, signedAsset] = await withSignedFileUrls([
      { id: "local", file_url: "/cavapendoli/models-b.png" },
      { id: "storage", file_path: "2026-03-26/final.pdf" },
    ]);

    expect(localAsset.file_url).toBe("/cavapendoli/models-b.png");
    expect(signedAsset.file_url).toBe("https://signed.example.com/final.pdf");
    expect(supabaseMocks.createSignedUrl).toHaveBeenCalledTimes(1);
  });
});
