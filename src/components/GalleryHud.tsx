import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveInitiative } from "@/hooks/useActiveInitiative";

const GALLERY_HUD_KEY = "gallery-hud-dismissed";

const GalleryHud = () => {
  const { data: initiative, isLoading } = useActiveInitiative();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPill, setShowPill] = useState(false);

  // Auto-fade after 4 seconds when visible
  useEffect(() => {
    if (!isVisible || !initiative) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem(GALLERY_HUD_KEY, Date.now().toString());
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible, initiative]);

  // Check if recently dismissed
  useEffect(() => {
    const lastDismissed = sessionStorage.getItem(GALLERY_HUD_KEY);
    if (lastDismissed) {
      const elapsed = Date.now() - parseInt(lastDismissed, 10);
      if (elapsed < 60000) {
        // Within last minute
        setIsDismissed(true);
      } else {
        sessionStorage.removeItem(GALLERY_HUD_KEY);
      }
    }
  }, []);

  // Show pill after a short delay if not dismissed
  useEffect(() => {
    if (initiative && !isDismissed && !isLoading) {
      const timer = setTimeout(() => setShowPill(true), 800);
      return () => clearTimeout(timer);
    }
  }, [initiative, isDismissed, isLoading]);

  const handleReopen = useCallback(() => {
    setIsDismissed(false);
    setIsVisible(true);
    setShowPill(true);
    sessionStorage.removeItem(GALLERY_HUD_KEY);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setShowPill(false);
    setIsDismissed(true);
    sessionStorage.setItem(GALLERY_HUD_KEY, Date.now().toString());
  }, []);

  if (!initiative || isLoading) return null;

  return (
    <>
      <AnimatePresence>
        {showPill && !isVisible && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleReopen}
            className="pointer-events-auto absolute left-1/2 top-6 z-50 -translate-x-1/2 cursor-pointer rounded-full border border-[#4f3c2a]/50 bg-[#1a1410]/85 px-4 py-2 font-mono-light text-[0.62rem] uppercase tracking-[0.16em] text-[#e8d9c3] shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition-colors hover:border-[#6b5744]/60 hover:bg-[#241c16]/90"
          >
            <span className="mr-2 opacity-60">[i]</span>
            <span>Un pensiero</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute left-1/2 top-6 z-50 w-[90vw] max-w-sm -translate-x-1/2 rounded-2xl border border-[#4f3c2a]/45 bg-[#1a1410]/92 px-5 py-4 shadow-[0_12px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-mono-light text-[0.55rem] uppercase tracking-[0.18em] text-[#c4a97d] mb-1.5">
                  Un pensiero
                </p>
                <p className="text-sm italic leading-relaxed text-[#f0e6d8]">
                  {initiative.prompt}
                </p>
                {initiative.details && (
                  <p className="mt-2 text-xs text-[#9a8772]">
                    {initiative.details}
                  </p>
                )}
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-full border border-[#4f3c2a]/40 bg-[#2a211a]/60 px-2 py-1 text-[0.55rem] uppercase tracking-[0.12em] text-[#8a7a66] transition-colors hover:border-[#6b5744]/50 hover:bg-[#3a3028]/60 hover:text-[#b5a48f]"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GalleryHud;
