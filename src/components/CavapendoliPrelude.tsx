import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const CavapendoliPrelude = ({ triggerKey }: { triggerKey: string }) => {
  const reduceMotion = useReducedMotion();
  const hasPlayedDesktopRef = useRef(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false,
  );
  const [sequenceKey, setSequenceKey] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(MOBILE_QUERY);
    const onChange = () => setIsMobile(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || isMobile) {
      setVisible(false);
      return;
    }

    const totalDurationMs = hasPlayedDesktopRef.current ? 1600 : 2500;

    setSequenceKey((prev) => prev + 1);
    setVisible(true);
    const timeoutId = window.setTimeout(() => setVisible(false), totalDurationMs);
    hasPlayedDesktopRef.current = true;
    return () => window.clearTimeout(timeoutId);
  }, [triggerKey, reduceMotion, isMobile]);

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`prelude-${sequenceKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-[radial-gradient(circle_at_top_left,hsl(var(--whisper)/0.25),transparent_38%),radial-gradient(circle_at_bottom_right,hsl(var(--trace)/0.32),transparent_42%),hsl(var(--background)/0.96)]"
          aria-hidden
        >
          <div className="w-[min(92vw,36rem)] rounded-3xl border border-border/70 bg-card/70 px-8 py-10 text-center shadow-2xl backdrop-blur">
            <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.25em] text-muted-foreground mb-5">
              Un luogo delicato
            </p>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl tracking-[0.12em]"
            >
              CAVAPENDOLANDIA
            </motion.h2>

            <motion.svg
              viewBox="0 0 280 240"
              className="mx-auto mt-6 h-44 w-44"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
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
              <motion.circle
                cx="79"
                cy="215"
                r="11"
                fill="hsl(var(--destructive))"
                animate={{ cy: [215, 208, 215] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
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

            <p className="mt-2 text-base text-muted-foreground">Entri in un mondo esplorabile stanza per stanza.</p>

            <div className="mx-auto mt-5 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-foreground"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: hasPlayedDesktopRef.current ? 1.3 : 2.1, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CavapendoliPrelude;
