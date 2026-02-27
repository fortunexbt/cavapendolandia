import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const CavapendoliPrelude = ({ triggerKey }: { triggerKey: string }) => {
  const reduceMotion = useReducedMotion();
  const isFirstSequence = useRef(true);
  const [sequenceKey, setSequenceKey] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const totalDurationMs = reduceMotion
      ? 420
      : isFirstSequence.current
        ? 2400
        : 1350;
    setSequenceKey((prev) => prev + 1);
    setVisible(true);
    const timeoutId = window.setTimeout(() => setVisible(false), totalDurationMs);
    isFirstSequence.current = false;
    return () => window.clearTimeout(timeoutId);
  }, [triggerKey, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`prelude-${sequenceKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.4, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background/90"
          aria-hidden
        >
          <div className="relative h-[min(68vh,40rem)] w-[min(90vw,70rem)] overflow-hidden rounded-[1.6rem]">
            <motion.img
              src="/cavapendoli/models-bw.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial={{
                opacity: 0.96,
                scale: 1.01,
                filter: "grayscale(100%) blur(5px) saturate(62%)",
              }}
              animate={{
                opacity: 0,
                scale: 1.045,
                filter: "grayscale(100%) blur(11px) saturate(45%)",
              }}
              transition={{
                duration: reduceMotion ? 0.22 : 1.45,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.img
              src="/cavapendoli/models-b.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial={{
                opacity: 0,
                scale: 0.99,
                filter: "saturate(50%) blur(12px)",
              }}
              animate={{
                opacity: reduceMotion ? 0.3 : 0.62,
                scale: 1.03,
                filter: "saturate(92%) blur(6px)",
              }}
              transition={{
                delay: reduceMotion ? 0.08 : 0.34,
                duration: reduceMotion ? 0.22 : 1.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,hsl(var(--background)/0.62)_100%)]"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0.78 }}
              transition={{ duration: reduceMotion ? 0.2 : 1.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CavapendoliPrelude;
