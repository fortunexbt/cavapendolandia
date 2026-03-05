import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface CavapendoliPreludeProps {
  onComplete?: () => void;
}

const CavapendoliPrelude = ({ onComplete }: CavapendoliPreludeProps) => {
  const reduceMotion = useReducedMotion();
  const hasPlayedRef = useRef(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      setVisible(false);
      onComplete?.();
      return;
    }

    if (hasPlayedRef.current) {
      return;
    }

    hasPlayedRef.current = true;

    const totalDurationMs = 4500;

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, totalDurationMs);
    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion, onComplete]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center justify-center bg-background p-4"
          aria-hidden
        >
          <p className="font-mono-light text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6 md:mb-8">
            Un luogo delicato
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-7xl tracking-[0.12em]"
          >
            CAVAPENDOLAND
          </motion.h2>

          <motion.svg
            viewBox="0 0 280 240"
            className="my-8 h-40 w-40 md:h-72 md:w-72"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
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

          <p className="text-base md:text-lg text-muted-foreground text-center px-4">Entri in un mondo esplorabile stanza per stanza.</p>

          <div className="mx-auto mt-8 md:mt-10 h-1.5 w-full max-w-xs md:max-w-md overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3.8, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CavapendoliPrelude;
