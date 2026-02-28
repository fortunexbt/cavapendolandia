import { supabase } from "@/integrations/supabase/client";
import { withSignedFileUrl } from "@/lib/offeringMedia";
import type { Database } from "@/integrations/supabase/types";

export type OfferingRow = Database["public"]["Tables"]["offerings"]["Row"];

export type OfferingDraftInput = {
  mediaType: Database["public"]["Enums"]["media_type"];
  file?: File | null;
  textContent?: string | null;
  linkUrl?: string | null;
  title?: string | null;
  note?: string | null;
  authorType: Database["public"]["Enums"]["author_type"];
  authorName?: string | null;
  consentRights: boolean;
  consentArchive: boolean;
  consentReshare: boolean;
  submissionFingerprint: string;
};

const DEFAULT_PAGE_SIZE = 18;

export const listApprovedOfferings = async (
  limit = DEFAULT_PAGE_SIZE,
  offset = 0,
): Promise<Array<OfferingRow & { file_url: string | null }>> => {
  const { data, error } = await supabase
    .from("offerings")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + Math.max(0, limit - 1));

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  return Promise.all(rows.map((row) => withSignedFileUrl(row)));
};

export const getApprovedOfferingById = async (
  id: string,
): Promise<(OfferingRow & { file_url: string | null }) | null> => {
  const { data, error } = await supabase
    .from("offerings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return withSignedFileUrl(data);
};

export const createSignedOfferingUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from("offerings")
    .createSignedUrl(filePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
};

export const createOfferingDraft = async (input: OfferingDraftInput): Promise<void> => {
  let filePath: string | null = null;
  let fileSize: number | null = null;

  if (input.file && input.mediaType !== "text" && input.mediaType !== "link") {
    const extension = input.file.name.split(".").pop() || "bin";
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("offerings")
      .upload(path, input.file);

    if (uploadError) {
      throw uploadError;
    }

    filePath = path;
    fileSize = input.file.size;
  }

  const { error } = await supabase.from("offerings").insert({
    media_type: input.mediaType,
    file_path: filePath,
    file_size: fileSize,
    text_content: input.mediaType === "text" ? input.textContent?.trim() || null : null,
    link_url: input.mediaType === "link" ? input.linkUrl?.trim() || null : null,
    title: input.title?.trim() || null,
    note: input.note?.trim() || null,
    author_type: input.authorType,
    author_name: input.authorType === "anonymous" ? null : input.authorName?.trim() || null,
    consent_rights: input.consentRights,
    consent_archive: input.consentArchive,
    consent_reshare: input.consentReshare,
    status: "pending",
    submission_fingerprint: input.submissionFingerprint,
  });

  if (error) {
    throw error;
  }
};
