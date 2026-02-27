import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

type OfferingMediaLike = {
  file_path?: string | null;
  file_url?: string | null;
};

export const withSignedFileUrl = async <T extends OfferingMediaLike>(
  offering: T,
): Promise<T & { file_url: string | null }> => {
  if (!offering.file_path) {
    return { ...offering, file_url: offering.file_url ?? null };
  }

  const { data, error } = await supabase.storage
    .from("offerings")
    .createSignedUrl(offering.file_path, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    return { ...offering, file_url: offering.file_url ?? null };
  }

  return { ...offering, file_url: data.signedUrl };
};

export const withSignedFileUrls = async <T extends OfferingMediaLike>(
  offerings: T[],
) => {
  return Promise.all(offerings.map((offering) => withSignedFileUrl(offering)));
};
