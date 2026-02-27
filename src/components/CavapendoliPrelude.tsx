import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

const CavapendoliPrelude = ({ triggerKey }: { triggerKey: string }) => {
  const reduceMotion = useReducedMotion();
  const hasPlayedDesktopRef = useRef(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false,
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

    const totalDurationMs = hasPlayedDesktopRef.current ? 950 : 1650;

    setSequenceKey((prev) => prev + 1);
    setVisible(true);
    const timeoutId = window.setTimeout(() => setVisible(false), totalDurationMs);
    hasPlayedDesktopRef.current = true;
    return () => window.clearTimeout(timeoutId);
  }, [triggerKey, reduceMotion, isMobile]);

  if (isMobile) return null;

  const frameClass =
    "relative h-[min(68vh,40rem)] w-[min(90vw,70rem)] overflow-hidden rounded-[1.6rem]";
  const imageClass = "absolute inset-0 h-full w-full object-cover";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`prelude-${sequenceKey}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background/88"
          aria-hidden
        >
          <div className={frameClass}>
            <motion.img
              src="/cavapendoli/models-bw.png"
              alt=""
              className={imageClass}
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
                duration: 1.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.img
              src="/cavapendoli/models-b.png"
              alt=""
              className={imageClass}
              initial={{
                opacity: 0,
                scale: 0.99,
                filter: "saturate(50%) blur(12px)",
              }}
              animate={{
                opacity: 0.62,
                scale: 1.03,
                filter: "saturate(92%) blur(6px)",
              }}
              transition={{
                delay: 0.24,
                duration: 1.28,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.div
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,hsl(var(--background)/0.62)_100%)]"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: 0.78 }}
              transition={{ duration: 1.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CavapendoliPrelude;
