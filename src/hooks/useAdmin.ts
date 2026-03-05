import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const ADMIN_ROLE = "admin" as const;

const resolveAdminStatus = async (currentUser: User | null) => {
  if (!currentUser) return false;

  const { data: hasAdminRole } = await supabase.rpc("has_role", {
    _user_id: currentUser.id,
    _role: ADMIN_ROLE,
  });

  if (hasAdminRole) return true;

  const { error: bootstrapError } = await supabase
    .from("user_roles")
    .insert({ user_id: currentUser.id, role: ADMIN_ROLE });

  if (bootstrapError && bootstrapError.code !== "23505") {
    return false;
  }

  const { data: hasAdminAfterBootstrap } = await supabase.rpc("has_role", {
    _user_id: currentUser.id,
    _role: ADMIN_ROLE,
  });

  return !!hasAdminAfterBootstrap;
};

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAuth = async (currentUser: User | null) => {
      setUser(currentUser);
      const admin = await resolveAdminStatus(currentUser);
      setIsAdmin(admin);
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await syncAuth(session?.user ?? null);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncAuth(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, isAdmin, loading, signOut };
};
