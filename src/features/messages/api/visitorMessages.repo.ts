import { supabase } from "@/integrations/supabase/client";

export type VisitorMessage = {
  id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  message: string;
  category: "domanda" | "richiesta" | "feedback";
  is_read: boolean;
  locale: string | null;
  created_at: string;
};

export const visitorMessagesRepo = {
  async list(): Promise<VisitorMessage[]> {
    const { data, error } = await supabase
      .from("visitor_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as VisitorMessage[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from("visitor_messages")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from("visitor_messages")
      .update({ is_read: true })
      .eq("is_read", false);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("visitor_messages").delete().eq("id", id);
    if (error) throw error;
  },
};
