import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DEFAULT_ADMIN_EMAIL = "cavapendoli@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "barbantini";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      navigate("/admin/anticamera", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Errore durante il login.";
      toast.error(message);
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

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email admin"
            className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light text-center"
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="bg-transparent border-border/50 focus:border-foreground/30 font-mono-light text-center"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono-light text-xs uppercase tracking-[0.15em] px-6 py-3 border border-foreground/20 hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-30"
          >
            {loading ? "..." : "Accedi"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
