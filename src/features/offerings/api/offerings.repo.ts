import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

/**
 * Canonical repository for offerings.
 * All reads go through this layer; storage-path → signed-URL resolution happens here.
 */

export type OfferingRow = Database["public"]["Tables"]["offerings"]["Row"];
export type OfferingStatus = Database["public"]["Enums"]["offering_status"];

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

const OFFERINGS_TABLE = "offerings" as const;
const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Generates a signed URL for a given offering's storage path.
 * Legacy fallback: if no file_path but file_url exists (and looks like a path, not an absolute URL),
 * treat file_url as the storage path and generate a signed URL from it.
 */
export async function getOfferingMediaUrl(
  offering: { file_path?: string | null; file_url?: string | null },
): Promise<string | null> {
  const storagePath = resolveStoragePath(offering);
  if (!storagePath) return null;

  const { data, error } = await supabase.storage
    .from("offerings")
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

function resolveStoragePath(
  offering: { file_path?: string | null; file_url?: string | null },
): string | null {
  if (offering.file_path) return offering.file_path;

  // Legacy: file_url was stored as a bare storage path (not an absolute URL)
  if (offering.file_url && !/^https?:\/\//i.test(offering.file_url) && !offering.file_url.startsWith("/")) {
    return offering.file_url;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Repository functions
// ---------------------------------------------------------------------------

export async function getApprovedOfferings(): Promise<OfferingRow[]> {
  const { data, error } = await supabase
    .from(OFFERINGS_TABLE)
    .select("*")
    .eq("status", "approved")
    .order("approved_at", { ascending: false });

  if (error) throw error;
  return (data as OfferingRow[]) ?? [];
}

export async function getOfferingById(id: string): Promise<OfferingRow | null> {
  const { data, error } = await supabase
    .from(OFFERINGS_TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as OfferingRow;
}

export async function getOfferingsByStatus(
  status: OfferingStatus,
): Promise<OfferingRow[]> {
  const { data, error } = await supabase
    .from(OFFERINGS_TABLE)
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as OfferingRow[]) ?? [];
}
