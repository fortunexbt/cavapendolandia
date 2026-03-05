import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";

const ADMIN_EMAIL = "cavapendoli@gmail.com";
const ADMIN_PASSWORD = "barbantni";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/anticamera", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSigningIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      if (error) throw error;

      toast.success("Accesso effettuato");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante l'accesso.";
      toast.error(message.includes("Failed to fetch") ? "Connessione al backend non disponibile." : message);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm text-center rounded-2xl border border-border bg-card/70 p-8"
      >
        <h1 className="text-2xl font-light mb-3 tracking-[0.08em]">Admin</h1>
        <p className="font-mono-light text-xs text-muted-foreground mb-7 uppercase tracking-[0.1em]">
          Accesso riservato
        </p>

        <form onSubmit={handleSignIn} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email admin"
            className="bg-background border-input text-center"
            required
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-background border-input text-center pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPassword ? "Nascondi" : "Mostra"}
            </button>
          </div>
          <button
            type="submit"
            disabled={signingIn}
            className="w-full font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-3 rounded-xl border border-foreground/20 hover:bg-foreground hover:text-primary-foreground disabled:opacity-40"
          >
            {signingIn ? "Accesso..." : "Accedi"}
          </button>
        </form>

        {user && !isAdmin && (
          <p className="mt-4 text-sm text-muted-foreground">
            Sei autenticato ma non ancora autorizzato come admin.
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
