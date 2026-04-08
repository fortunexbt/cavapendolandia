import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Contatti = () => {
  const { t, i18n } = useTranslation();
  const [formState, setFormState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cooldown || formState === "submitting") return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = formData.get("website") as string;
    if (honeypot) {
      // Silently reject - bot detected
      setFormState("success");
      return;
    }

    const message = formData.get("message") as string;
    const category = formData.get("category") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!message || !category) {
      setErrorMessage(t("contatti.errorFillFields"));
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMessage("");

    const { error } = await supabase.from("visitor_messages").insert({
      visitor_name: name || null,
      visitor_email: email || null,
      message,
      category,
      locale: i18n.language,
    });

    if (error) {
      setErrorMessage(t("contatti.errorSendFailed"));
      setFormState("error");
      return;
    }

    setFormState("success");
    setCooldown(true);
    setTimeout(() => setCooldown(false), 5000);
  };

  if (formState === "success") {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
        <MinimalHeader />
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center max-w-md"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-6">{t("contatti.successTitle")}</h1>
            <p className="text-lg italic text-muted-foreground mb-12">
              {t("contatti.successMessage")}
            </p>
            <Link
              to="/"
              className="inline-block font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-3 border border-foreground/30 hover:bg-foreground hover:text-primary-foreground transition-all duration-500"
            >
              {t("contatti.backHome")}
            </Link>
          </motion.div>
        </main>
        <MinimalFooter />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-background">
      <MinimalHeader />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <h1 className="text-3xl md:text-4xl font-light text-center mb-2">{t("contatti.title")}</h1>
          <p className="text-center text-muted-foreground mb-10">
            {t("contatti.subtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot - hidden from users */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">{t("contatti.honeypotLabel")}</label>
              <input type="text" name="website" id="website" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="name" className="block font-mono-light text-xs uppercase tracking-[0.15em] mb-2">
                {t("contatti.nameLabel")}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                className="w-full px-4 py-3 bg-background border border-border/50 focus:border-foreground/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-mono-light text-xs uppercase tracking-[0.15em] mb-2">
                {t("contatti.emailLabel")}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-background border border-border/50 focus:border-foreground/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="category" className="block font-mono-light text-xs uppercase tracking-[0.15em] mb-2">
                {t("contatti.categoryLabel")}
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-3 bg-background border border-border/50 focus:border-foreground/50 focus:outline-none transition-colors"
              >
                <option value="">{t("contatti.selectCategory")}</option>
                <option value="domanda">{t("contatti.categoryDomanda")}</option>
                <option value="richiesta">{t("contatti.categoryRichiesta")}</option>
                <option value="feedback">{t("contatti.categoryFeedback")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block font-mono-light text-xs uppercase tracking-[0.15em] mb-2">
                {t("contatti.messageLabel")}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border/50 focus:border-foreground/50 focus:outline-none transition-colors resize-none"
              />
            </div>

            {formState === "error" && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={cooldown || formState === "submitting"}
                className="w-full font-mono-light text-sm uppercase tracking-[0.15em] px-8 py-4 border border-foreground/30 bg-background hover:bg-foreground hover:text-primary-foreground transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formState === "submitting" ? t("contatti.submitting") : cooldown ? t("contatti.sent") : t("contatti.submit")}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="font-mono-light text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {t("contatti.backHome")}
            </Link>
          </div>
        </motion.div>
      </main>

      <MinimalFooter />
    </div>
  );
};

export default Contatti;
