import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Initiative = {
  id: string;
  prompt: string;
  details: string | null;
  is_active: boolean;
  created_at: string;
};

export const useActiveInitiative = () => {
  return useQuery({
    queryKey: ["active-initiative"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("initiatives")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.warn("[useActiveInitiative]", error.message);
          return null;
        }

        return data as Initiative | null;
      } catch (e) {
        console.warn("[useActiveInitiative] exception:", e);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });
};
