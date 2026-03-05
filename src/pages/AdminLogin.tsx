import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAdmin } from "@/hooks/useAdmin";

const DEFAULT_ADMIN_EMAIL = "cavapendoli@gmail.com";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAdmin();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin/anticamera", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/anticamera`,
        },
      });
      if (error) throw error;

      setSent(true);
      toast.success("Link magico inviato: controlla la tua email.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Errore durante l'invio del link.";
      toast.error(message.includes("Failed to fetch") ? "Connessione al backend non disponibile." : message);
    } finally {
      setSending(false);
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
          Accesso via link magico
        </p>

        <form onSubmit={handleMagicLink} className="space-y-4">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email admin"
            className="bg-background border-input text-center"
            required
          />
          <button
            type="submit"
            disabled={sending}
            className="w-full font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-3 rounded-xl border border-foreground/20 hover:bg-foreground hover:text-primary-foreground disabled:opacity-40"
          >
            {sending ? "Invio..." : "Invia link magico"}
          </button>
        </form>

        {sent && (
          <p className="mt-4 text-sm text-muted-foreground">
            Ti abbiamo inviato il link: aprilo dalla stessa email per entrare in Anticamera.
          </p>
        )}

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
