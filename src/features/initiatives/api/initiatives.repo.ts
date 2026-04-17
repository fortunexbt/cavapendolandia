import { supabase } from "@/integrations/supabase/client";

export type Initiative = {
  id: string;
  prompt: string;
  details: string | null;
  is_active: boolean;
  created_at: string;
  created_by?: string | null;
};

export const initiativesRepo = {
  async listAll(): Promise<Initiative[]> {
    const { data, error } = await supabase
      .from("initiatives")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Initiative[];
  },

  async getActive(): Promise<Initiative | null> {
    const { data, error } = await supabase
      .from("initiatives")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("[initiativesRepo.getActive]", error.message);
      return null;
    }
    return (data as Initiative) || null;
  },

  async create(payload: { prompt: string; details?: string; created_by?: string }): Promise<void> {
    const { error } = await supabase.from("initiatives").insert({
      prompt: payload.prompt,
      details: payload.details || null,
      is_active: true,
      created_by: payload.created_by || null,
    });
    if (error) throw error;
  },

  async update(id: string, patch: Partial<Pick<Initiative, "prompt" | "details" | "is_active">>): Promise<void> {
    const { error } = await supabase.from("initiatives").update(patch).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("initiatives").delete().eq("id", id);
    if (error) throw error;
  },
};
