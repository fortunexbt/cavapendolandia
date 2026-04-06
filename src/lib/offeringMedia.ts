import { supabase } from "@/integrations/supabase/client";
import { getOfferingMediaUrl } from "@/features/offerings/api/offerings.repo";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

type OfferingMediaLike = {
  file_path?: string | null;
  file_url?: string | null;
  [key: string]: unknown;
};

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value);

/**
 * @deprecated file_url as a legacy storage path is deprecated.
 * Use file_path with getOfferingMediaUrl() instead. This function
 * exists purely for backward compatibility with existing records.
 */
export const getPublicMediaUrl = async (
  offering: OfferingMediaLike,
): Promise<string | null> => {
  // Preferred path: file_path → signed URL
  if (offering.file_path) {
    return getOfferingMediaUrl(offering);
  }
  // Legacy fallback: a bare file_url that looks like a storage path (not a URL)
  if (
    offering.file_url &&
    !isAbsoluteUrl(offering.file_url) &&
    !offering.file_url.startsWith("/")
  ) {
    // Legacy records have file_url storing the storage path directly
    return getOfferingMediaUrl(offering);
  }
  // Absolute URL (e.g. external link) — return as-is
  if (offering.file_url) return offering.file_url;
  return null;
};

export const withSignedFileUrl = async <T extends OfferingMediaLike>(
  offering: T,
): Promise<T & { file_url: string | null }> => {
  const file_url = await getPublicMediaUrl(offering);
  return { ...offering, file_url: file_url ?? offering.file_url ?? null };
};

export const withSignedFileUrls = async <T extends OfferingMediaLike>(
  offerings: T[],
) => Promise.all(offerings.map((offering) => withSignedFileUrl(offering)));
