import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/anticamera`,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Errore durante l'invio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-xs text-center"
      >
        <h1 className="text-2xl font-light mb-8 tracking-[0.1em]">Admin</h1>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link magico inviato a <strong>{email}</strong>
            </p>
            <p className="font-mono-light text-muted-foreground/60 text-xs">
              Controlla la tua email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email admin"
              className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light text-center"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-3 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30"
            >
              {loading ? "..." : "Invia link magico"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
