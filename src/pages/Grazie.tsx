import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";

const Grazie = () => {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <MinimalHeader />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="flex-1 flex items-center justify-center"
      >
        <div className="text-center px-6 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <svg viewBox="0 0 280 240" className="h-16 w-16 mx-auto mb-6 text-secondary">
              <path d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z" fill="currentColor" />
            </svg>
            <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-foreground mb-4">
              {t("grazie.title")}
            </h1>
            <p className="text-lg text-muted-foreground font-serif italic leading-relaxed mb-2">
              {t("grazie.line1")}
            </p>
            <p className="text-base text-muted-foreground/70 font-serif leading-relaxed mb-8">
              {t("grazie.line2")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-block border border-foreground/25 px-7 py-3 font-mono-light text-xs uppercase tracking-[0.13em] text-foreground/85 hover:bg-foreground hover:text-primary-foreground transition-all duration-300"
            >
              {t("grazie.ctaHome")}
            </Link>
            <Link
              to="/galleria"
              className="inline-block border border-border/50 px-7 py-3 font-mono-light text-xs uppercase tracking-[0.13em] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-300"
            >
              {t("grazie.ctaGallery")}
            </Link>
          </motion.div>
        </div>
      </motion.main>

      <MinimalFooter />
    </div>
  );
};

export default Grazie;
