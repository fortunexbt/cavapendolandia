/**
 * Utilities for mapping between gallery media types and deposit zone categories.
 *
 * Categories:
 *   - "grafica"  : visual offerings (image, video, pdf, link)
 *   - "musicale" : audio offerings
 *   - "letteraria": text offerings
 */

import type { Database } from "@/integrations/supabase/types";

export type OfferingCategory = "grafica" | "musicale" | "letteraria";

export type MediaType = Database["public"]["Enums"]["media_type"];

/**
 * Maps a database media_type to an offering category for deposit zone filtering.
 */
export function deriveCategory(mediaType: MediaType | string): OfferingCategory {
  switch (mediaType) {
    case "audio":
      return "musicale";
    case "text":
      return "letteraria";
    // image, video, pdf, link are all treated as visual/grafica
    case "image":
    case "video":
    case "pdf":
    case "link":
    default:
      return "grafica";
  }
}

/**
 * Returns the Italian display label for an offering category.
 */
export function getCategoryLabel(category: OfferingCategory): string {
  switch (category) {
    case "grafica":
      return "Grafica";
    case "musicale":
      return "Musicale";
    case "letteraria":
      return "Letteraria";
  }
}

/**
 * Returns all categories in preferred display order.
 */
export const OFFERING_CATEGORIES: OfferingCategory[] = [
  "grafica",
  "musicale",
  "letteraria",
];
