import { supabase } from "@/integrations/supabase/client";

export type MeadowElement = {
  id: string;
  element_type: "tree" | "monolith" | "lantern" | "billboard";
  label: string;
  position_x: number;
  position_z: number;
  scale: number;
  rotation: number;
  tone: string;
  created_at: string;
};

export const meadowElementsRepo = {
  async listAll(): Promise<MeadowElement[]> {
    const { data, error } = await (supabase as any)
      .from("meadow_elements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as MeadowElement[];
  },

  async create(payload: Omit<MeadowElement, "id" | "created_at">): Promise<void> {
    const { error } = await (supabase as any).from("meadow_elements").insert(payload);
    if (error) throw error;
  },

  async update(id: string, patch: Partial<Omit<MeadowElement, "id" | "created_at">>): Promise<void> {
    const { error } = await (supabase as any).from("meadow_elements").update(patch).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any).from("meadow_elements").delete().eq("id", id);
    if (error) throw error;
  },
};
