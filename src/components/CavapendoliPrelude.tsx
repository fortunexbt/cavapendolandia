import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const PRELUDE_SESSION_KEY = "cavapendolandia-prelude-seen";

interface CavapendoliPreludeProps {
  onComplete?: () => void;
}

const CavapendoliPrelude = ({ onComplete }: CavapendoliPreludeProps) => {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  // Use sessionStorage so prelude stays dismissed across navigations within the same browser session
  const alreadySeen = sessionStorage.getItem(PRELUDE_SESSION_KEY) === "1";
  const [visible, setVisible] = useState(!alreadySeen);

  const completePrelude = useCallback(() => {
    sessionStorage.setItem(PRELUDE_SESSION_KEY, "1");
    setVisible(false);
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (reduceMotion) {
      completePrelude();
      return;
    }

    if (alreadySeen) {
      return;
    }

    const totalDurationMs = 4500;

    const timeoutId = window.setTimeout(() => {
      completePrelude();
    }, totalDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [completePrelude, reduceMotion, alreadySeen]);

  useEffect(() => {
    if (!visible) return;

    const handleEarlyComplete = () => {
      completePrelude();
    };

    window.addEventListener("keydown", handleEarlyComplete, { once: true });
    window.addEventListener("pointerdown", handleEarlyComplete, { once: true });
    window.addEventListener("touchstart", handleEarlyComplete, { once: true });

    return () => {
      window.removeEventListener("keydown", handleEarlyComplete);
      window.removeEventListener("pointerdown", handleEarlyComplete);
      window.removeEventListener("touchstart", handleEarlyComplete);
    };
  }, [completePrelude, visible]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden bg-background p-4"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,210,185,0.54),transparent_30%),radial-gradient(circle_at_20%_30%,rgba(205,180,150,0.26),transparent_26%),linear-gradient(180deg,#fbf4ec_0%,#f2e7db_54%,#d8c3b1_100%),rgba(0,0,0,0.08)]" />
          <div className="absolute left-1/2 top-[14%] h-40 w-40 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,246,235,0.85),transparent_68%)] blur-3xl md:h-64 md:w-64" />
          <div className="absolute bottom-[14%] left-[18%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(173,140,109,0.22),transparent_70%)] blur-3xl" />
          <div className="absolute right-[16%] top-[22%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(236,220,199,0.4),transparent_72%)] blur-3xl" />

          <div className="relative z-10 flex flex-col items-center">
            <p className="mb-6 font-mono-light text-xs uppercase tracking-[0.25em] text-foreground/70 md:mb-8">
              {t("prato.prelude.subtitle")}
            </p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl tracking-[0.14em] md:text-7xl"
            >
              {t("prato.prelude.title")}
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative my-8"
            >
              <div className="absolute inset-[-12%] rounded-full border border-foreground/10" />
              <div className="absolute inset-[-22%] rounded-full border border-foreground/5" />
              <motion.svg
                viewBox="0 0 280 240"
                className="relative h-40 w-40 md:h-72 md:w-72"
              >
                <motion.path
                  d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z"
                  fill="hsl(var(--secondary))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="4"
                />
                <polygon
                  points="115,92 146,68 186,74 198,108 167,127 132,117"
                  fill="hsl(var(--accent))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="4"
                />
                <polygon
                  points="102,129 129,108 159,133 143,163 111,156"
                  fill="hsl(var(--destructive))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="4"
                />
                <polygon
                  points="161,150 189,137 203,160 183,187 154,173"
                  fill="hsl(var(--ring))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="4"
                />
                <ellipse cx="205" cy="84" rx="18" ry="18" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="4" />
                <circle cx="208" cy="84" r="5" fill="hsl(var(--foreground))" />
                <path d="M224 76l20-10-8 21" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="4" />
                <path d="M100 105l-26-8 16 25" fill="hsl(var(--accent))" stroke="hsl(var(--foreground))" strokeWidth="4" />
                <motion.g
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                >
                  <circle
                    cx="79"
                    cy="215"
                    r="11"
                    fill="hsl(var(--destructive))"
                  />
                </motion.g>
                <motion.path
                  d="M84 214c-20-20-14-49 8-62"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  animate={{ pathLength: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />
              </motion.svg>
            </motion.div>

            <p className="max-w-xl px-4 text-center text-base text-muted-foreground md:text-lg">
              {t("prato.prelude.body")}
            </p>

            <div className="mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted md:mt-10 md:max-w-md">
              <motion.div
                className="h-full rounded-full bg-foreground"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3.8, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CavapendoliPrelude;
