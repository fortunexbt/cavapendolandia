import { supabase } from "@/integrations/supabase/client";

export type VisitorMessage = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  category: "domanda" | "richiesta" | "feedback";
  locale: string;
  status: "unread" | "read" | "archived";
  is_read: boolean; // computed: status !== 'unread'
  created_at: string;
};

export const visitorMessagesRepo = {
  async list(): Promise<VisitorMessage[]> {
    const { data, error } = await (supabase as any)
      .from("visitor_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data || []) as any[]).map((row) => ({
      ...row,
      is_read: row.status !== "unread",
    })) as VisitorMessage[];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from("visitor_messages")
      .update({ status: "read" })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await (supabase as any)
      .from("visitor_messages")
      .update({ status: "read" })
      .eq("status", "unread");
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await (supabase as any).from("visitor_messages").delete().eq("id", id);
    if (error) throw error;
  },
};
