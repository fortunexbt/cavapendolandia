import { supabase } from "@/integrations/supabase/client";

export type PageContentBlock = {
  id: string;
  page_slug: string;
  block_key: string;
  locale: string;
  eyebrow: string | null;
  title: string | null;
  body_text: string | null;
  image_path: string | null;
  cta_label: string | null;
  cta_href: string | null;
  sort_order: number;
  is_enabled: boolean;
  updated_at: string;
  updated_by: string | null;
};

const DEFAULT_LOCALE = "it";

export const pageContentRepo = {
  async listBySlug(slug: string, locale: string = DEFAULT_LOCALE): Promise<PageContentBlock[]> {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("locale", locale)
        .order("block_key");
      if (error) {
        console.warn("[pageContentRepo] listBySlug error:", error.message);
        return [];
      }
      return (data || []) as PageContentBlock[];
    } catch (e) {
      console.warn("[pageContentRepo] listBySlug exception:", e);
      return [];
    }
  },

  async get(
    slug: string,
    blockKey: string,
    locale: string = DEFAULT_LOCALE,
  ): Promise<PageContentBlock | null> {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("block_key", blockKey)
        .eq("locale", locale)
        .maybeSingle();
      if (error) {
        console.warn("[pageContentRepo] get error:", error.message);
        return null;
      }
      return (data as PageContentBlock) || null;
    } catch (e) {
      console.warn("[pageContentRepo] get exception:", e);
      return null;
    }
  },

  async upsert(
    slug: string,
    blockKey: string,
    payload: { title?: string; body_text?: string; locale?: string },
  ): Promise<void> {
    const locale = payload.locale || DEFAULT_LOCALE;
    const { error } = await supabase
      .from("page_content")
      .upsert(
        {
          page_slug: slug,
          block_key: blockKey,
          locale,
          title: payload.title || null,
          body_text: payload.body_text || null,
        },
        { onConflict: "page_slug,block_key,locale" },
      );
    if (error) throw error;
  },

  async listSlugs(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("page_content")
        .select("page_slug");
      if (error) {
        console.warn("[pageContentRepo] listSlugs error:", error.message);
        return [];
      }
      const slugs = [...new Set((data || []).map((r) => r.page_slug as string))] as string[];
      return slugs;
    } catch (e) {
      console.warn("[pageContentRepo] listSlugs exception:", e);
      return [];
    }
  },
};
