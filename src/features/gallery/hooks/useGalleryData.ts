import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { withSignedFileUrls } from "@/lib/offeringMedia";
import type { Offering } from "@/components/cavapendo-gallery/types";
import { DEMO_OFFERINGS } from "@/components/cavapendo-gallery/config";
import {
  deriveCategory,
  type OfferingCategory,
} from "@/lib/categoryUtils";

export interface GalleryDataOptions {
  quality?: "low" | "medium" | "high";
  /**
   * If provided, only return offerings whose category matches this value.
   * Uses deriveCategory() to map media_type to category.
   */
  category?: OfferingCategory;
}

export interface GalleryDataResult {
  offerings: Offering[];
  loading: boolean;
  error: Error | null;
}

export function useGalleryData(options: GalleryDataOptions = {}): GalleryDataResult {
  const { quality = "medium", category } = options;

  const { data: liveOfferings, isLoading, error } = useQuery({
    queryKey: ["gallery-offerings", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select(
          "id, title, note, text_content, media_type, file_url, link_url, author_name, author_type, created_at, approved_at",
        )
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(24);

      if (error) throw error;
      if (!data?.length) return null;
      return withSignedFileUrls(data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const visibleCount =
    quality === "high" ? 18 : quality === "medium" ? 14 : 10;

  const offerings = (() => {
    const source =
      liveOfferings && liveOfferings.length > 0
        ? liveOfferings
        : DEMO_OFFERINGS;

    let filtered = source;
    if (category) {
      filtered = source.filter(
        (offering) => deriveCategory(offering.media_type) === category,
      );
    }

    return filtered.slice(0, visibleCount);
  })();

  return {
    offerings,
    loading: isLoading,
    error: error as Error | null,
  };
}
