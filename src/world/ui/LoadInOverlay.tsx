import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type LoadInOverlayProps = {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
  simpleMode?: boolean;
};

const TITLE = "CAVAPENDOLANDIA";

export const LoadInOverlay = ({ open, onComplete, onSkip, simpleMode = false }: LoadInOverlayProps) => {
  const reducedMotion = useReducedMotion();
  const letters = useMemo(() => TITLE.split(""), []);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      onComplete();
    }, reducedMotion ? 1800 : 6200);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, onComplete, reducedMotion]);

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto fixed inset-0 z-[70] overflow-hidden bg-[#04070d]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_26%,rgba(239,189,104,0.26),transparent_42%),radial-gradient(circle_at_82%_74%,rgba(82,191,203,0.24),transparent_45%),linear-gradient(180deg,#050810_0%,#060b13_40%,#04070c_100%)]" />

      <motion.div
        className="absolute inset-0 opacity-35"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 14, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,255,255,0.03) 12.5%, transparent 12.5%, transparent 50%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.03) 62.5%, transparent 62.5%, transparent 100%)",
          backgroundSize: "120px 120px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 pb-10 pt-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1 }}
          className={cn(
            "font-mono-light uppercase tracking-[0.28em] text-[#b9cde0]",
            simpleMode ? "text-xs" : "text-[0.62rem]",
          )}
        >
          Un luogo delicato
        </motion.p>

        <h1
          className={cn(
            "mt-5 max-w-5xl text-[#f8efde]",
            simpleMode ? "text-4xl tracking-[0.18em]" : "text-[clamp(2.4rem,6vw,5rem)] tracking-[0.14em]",
          )}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1.05,
                delay: 0.25 + index * (reducedMotion ? 0.015 : 0.07),
                ease: [0.2, 0.75, 0.2, 1],
              }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: [0, -5, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.9, delay: 1.2 },
            y: { duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
            scale: { duration: 0.9, delay: 1.2 },
          }}
          className="mt-8 w-full max-w-[24rem] sm:max-w-[28rem]"
        >
          <svg viewBox="0 0 360 300" className="h-auto w-full" role="img" aria-label="Cavalluccio cavapendoli stilizzato">
            <motion.path
              d="M227 50C198 52 175 67 164 95C154 122 160 149 177 165C189 176 192 190 187 206C182 223 167 236 151 242C172 247 195 239 208 222C220 205 221 185 214 168C229 161 241 148 245 132C251 107 248 84 227 50Z"
              fill="#f3dc7d"
              stroke="#0b2233"
              strokeWidth="4"
              initial={{ pathLength: 0, opacity: 0.7 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.7, delay: 1.1, ease: "easeOut" }}
            />
            <path d="M228 78L196 74L184 98L212 112L240 96Z" fill="#56c3cd" stroke="#0b2233" strokeWidth="3" />
            <path d="M186 120L164 132L170 154L196 160L210 143Z" fill="#f08b5f" stroke="#0b2233" strokeWidth="3" />
            <path d="M212 143L198 170L218 184L236 166L232 146Z" fill="#7ca8dc" stroke="#0b2233" strokeWidth="3" />
            <path d="M167 95L148 85L144 108L160 124Z" fill="#89d5de" stroke="#0b2233" strokeWidth="3" />
            <path d="M241 74L270 63L258 89L233 97Z" fill="#f3c46d" stroke="#0b2233" strokeWidth="3" />

            <path d="M163 116C145 119 129 108 123 91C144 88 159 95 170 111Z" fill="#65c8d2" stroke="#0b2233" strokeWidth="3" />

            <path
              d="M152 173C138 179 132 194 135 210C137 220 144 230 157 234"
              fill="none"
              stroke="#0b2233"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="151" cy="232" r="8" fill="#f08b5f" stroke="#0b2233" strokeWidth="3" />

            <circle cx="248" cy="83" r="13" fill="#f5f1e4" stroke="#0b2233" strokeWidth="3" />
            <circle cx="251" cy="84" r="4" fill="#0b2233" />

            <motion.circle
              cx="282"
              initial={{ cy: 43, opacity: 0.4 }}
              cy="43"
              r="5"
              fill="#f3dc7d"
              animate={{ cy: [43, 28, 43], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.circle
              cx="299"
              initial={{ cy: 66, opacity: 0.4 }}
              cy="66"
              r="6"
              fill="#6bcad4"
              animate={{ cy: [66, 48, 66], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.circle
              cx="126"
              initial={{ cy: 53, opacity: 0.35 }}
              cy="53"
              r="4"
              fill="#f08b5f"
              animate={{ cy: [53, 38, 53], opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
            />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 2.1 }}
          className={cn("mt-4 text-[#d3dfeb]", simpleMode ? "text-base" : "text-sm")}
        >
          Entri in un mondo esplorabile stanza per stanza.
        </motion.p>

        <motion.div
          className="mt-7 h-1.5 w-full max-w-md overflow-hidden rounded-full border border-white/20 bg-white/8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#f2c873,#63c5cf)]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: reducedMotion ? 1.8 : 6, ease: "linear" }}
          />
        </motion.div>

        <motion.button
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          className="mt-6 rounded-full border border-white/30 px-5 py-2 font-mono-light text-[0.68rem] uppercase tracking-[0.16em] text-[#e7f1fc]"
        >
          Salta intro
        </motion.button>
      </div>
    </motion.div>
  );
};
