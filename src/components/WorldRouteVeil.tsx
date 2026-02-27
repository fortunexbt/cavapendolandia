import { cn } from "@/lib/utils";
import { getRouteWorldProfile, isAdminPath, readWorldJourney } from "@/lib/worldJourney";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type VeilState = {
  id: number;
  fromPath: string;
  toPath: string;
  fromAnchor: number;
  toAnchor: number;
  fromLabel: string;
  toLabel: string;
  fromTintA: string;
  fromTintB: string;
  toTintA: string;
  toTintB: string;
  direction: 1 | -1;
  surge: number;
};

type WorldRouteVeilProps = {
  pathname: string;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const WorldRouteVeil = ({ pathname }: WorldRouteVeilProps) => {
  const reduceMotion = useReducedMotion();
  const previousPathRef = useRef(pathname);
  const sequenceRef = useRef(0);
  const [veil, setVeil] = useState<VeilState | null>(null);

  useEffect(() => {
    const previousPath = previousPathRef.current;
    if (previousPath === pathname) return;
    previousPathRef.current = pathname;

    if (isAdminPath(previousPath) || isAdminPath(pathname)) {
      setVeil(null);
      return;
    }

    const from = getRouteWorldProfile(previousPath);
    const to = getRouteWorldProfile(pathname);
    const memory = readWorldJourney(to.anchor);

    sequenceRef.current += 1;
    const direction: 1 | -1 = to.anchor >= from.anchor ? 1 : -1;
    const surge = clamp01(
      0.24 + Math.abs(to.anchor - memory) * 1.65 + Math.abs(to.anchor - from.anchor) * 0.95,
    );

    const id = sequenceRef.current;
    setVeil({
      id,
      fromPath: previousPath,
      toPath: pathname,
      fromAnchor: from.anchor,
      toAnchor: to.anchor,
      fromLabel: from.label,
      toLabel: to.label,
      fromTintA: from.tintA,
      fromTintB: from.tintB,
      toTintA: to.tintA,
      toTintB: to.tintB,
      direction,
      surge,
    });

    const timeoutMs = reduceMotion ? 430 : 1300;
    const timeoutId = window.setTimeout(() => {
      setVeil((current) => (current?.id === id ? null : current));
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, reduceMotion]);

  const progressLabel = useMemo(() => {
    if (!veil) return "";
    const from = Math.round(veil.fromAnchor * 100);
    const to = Math.round(veil.toAnchor * 100);
    return `${from}% -> ${to}%`;
  }, [veil]);

  return (
    <AnimatePresence>
      {veil && (
        <motion.div
          key={`world-veil-${veil.id}-${veil.fromPath}-${veil.toPath}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.2 : 0.42, ease: "easeOut" }}
          className="pointer-events-none fixed inset-0 z-[62]"
          aria-hidden
        >
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at ${
                veil.direction > 0 ? "18% 42%" : "82% 42%"
              }, ${veil.fromTintA}, transparent 48%), radial-gradient(circle at ${
                veil.direction > 0 ? "79% 56%" : "21% 56%"
              }, ${veil.toTintA}, transparent 52%), linear-gradient(135deg, rgba(8,10,14,0.78), rgba(8,10,14,0.9))`,
            }}
            initial={{ filter: "blur(14px) saturate(130%)" }}
            animate={{ filter: "blur(0px) saturate(100%)" }}
            exit={{ filter: "blur(16px) saturate(132%)" }}
            transition={{ duration: reduceMotion ? 0.25 : 0.95, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            className="absolute inset-0 opacity-65"
            style={{
              backgroundImage: `repeating-linear-gradient(${veil.direction > 0 ? "102deg" : "-102deg"}, ${
                veil.fromTintB
              } 0px, ${veil.fromTintB} 1px, transparent 1px, transparent 48px), repeating-linear-gradient(${
                veil.direction > 0 ? "122deg" : "-122deg"
              }, ${veil.toTintB} 0px, ${veil.toTintB} 1px, transparent 1px, transparent 64px)`,
            }}
            initial={{ opacity: 0, x: veil.direction > 0 ? -24 : 24 }}
            animate={{ opacity: 0.72, x: 0 }}
            exit={{ opacity: 0, x: veil.direction > 0 ? 36 : -36 }}
            transition={{ duration: reduceMotion ? 0.24 : 0.78, ease: "easeOut" }}
          />

          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.08 + veil.surge * 0.24}), transparent 52%)`,
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1.22 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.6, ease: "easeOut" }}
          />

          <motion.div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.45, ease: "easeOut" }}
          >
            <div
              className={cn(
                "mx-auto w-fit rounded-full border px-6 py-2 text-center backdrop-blur-md",
                "border-white/20 bg-black/35 font-mono-light text-[0.62rem] uppercase tracking-[0.2em] text-[#eff3fa]",
              )}
            >
              {veil.fromLabel} / {veil.toLabel}
              <span className="mx-3 text-white/40">|</span>
              {progressLabel}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldRouteVeil;
