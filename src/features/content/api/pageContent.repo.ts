import { supabase } from "@/integrations/supabase/client";

export type PageContentBlock = {
  id: string;
  page_slug: string;
  block_key: string;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
};

export const pageContentRepo = {
  async listBySlug(slug: string): Promise<PageContentBlock[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .order("block_key");
      if (error && error.code !== "PGRST116") {
        console.warn("[pageContentRepo] listBySlug error:", error.message);
        return [];
      }
      return (data || []) as PageContentBlock[];
    } catch (e) {
      console.warn("[pageContentRepo] listBySlug exception:", e);
      return [];
    }
  },

  async get(slug: string, blockKey: string): Promise<PageContentBlock | null> {
    try {
      const { data, error } = await (supabase as any)
        .from("page_content")
        .select("*")
        .eq("page_slug", slug)
        .eq("block_key", blockKey)
        .single();
      if (error && error.code !== "PGRST116") {
        console.warn("[pageContentRepo] get error:", error.message);
        return null;
      }
      return (data as PageContentBlock) || null;
    } catch (e) {
      console.warn("[pageContentRepo] get exception:", e);
      return null;
    }
  },

  async upsert(slug: string, blockKey: string, payload: { title?: string; body?: string }): Promise<void> {
    const { error } = await (supabase as any)
      .from("page_content")
      .upsert(
        { page_slug: slug, block_key: blockKey, title: payload.title || null, body: payload.body || null },
        { onConflict: "page_slug,block_key" },
      );
    if (error) throw error;
  },

  async listSlugs(): Promise<string[]> {
    try {
      const { data, error } = await (supabase as any)
        .from("page_content")
        .select("page_slug");
      if (error) {
        console.warn("[pageContentRepo] listSlugs error:", error.message);
        return [];
      }
      const slugs = [...new Set((data || []).map((r: { page_slug: string }) => r.page_slug))];
      return slugs;
    } catch (e) {
      console.warn("[pageContentRepo] listSlugs exception:", e);
      return [];
    }
  },
};
