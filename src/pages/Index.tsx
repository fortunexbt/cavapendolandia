import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import EntraComingSoon from "@/components/EntraComingSoon";
import { cn } from "@/lib/utils";
import type {
  WorldMemoryFragment,
  WorldMode,
  WorldPortal,
  WorldSignal,
} from "@/components/CavapendoliWorldCanvas";
import { supabase } from "@/integrations/supabase/client";
import {
  clampJourneyVelocity,
  nearestJourneyAnchor,
  persistWorldJourney,
  readWorldJourney,
} from "@/lib/worldJourney";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));

const WORLD_CARDS: Record<
  WorldMode,
  { name: string; subtitle: string; atmosphere: string; accent: string; text: string }
> = {
  soglia: {
    name: "Soglia",
    subtitle: "Ingresso lento",
    atmosphere:
      "Le forme arrivano da lontano e ti prendono per mano. Qui il mondo respira prima di aprirsi.",
    accent: "#e9be63",
    text: "La stanza si accende a piccoli strati.",
  },
  vaga: {
    name: "Vaga",
    subtitle: "Esplorazione viva",
    atmosphere:
      "Creature e frammenti orbitano come tracce in movimento. Questo stato porta ritmo e curiosita.",
    accent: "#48c2cc",
    text: "Ogni passaggio cambia la mappa.",
  },
  silenzio: {
    name: "Silenzio",
    subtitle: "Contemplazione",
    atmosphere:
      "Luce bassa, movimenti trattenuti, presenze sospese. Qui resta solo cio che merita ascolto.",
    accent: "#89a6d8",
    text: "Il luogo rallenta e lascia spazio.",
  },
};

const WORLD_ORDER: WorldMode[] = ["soglia", "vaga", "silenzio"];
const WORLD_ANCHOR: Record<WorldMode, number> = {
  soglia: 0.12,
  vaga: 0.5,
  silenzio: 0.88,
};
const WORLD_ANCHOR_VALUES = Object.values(WORLD_ANCHOR);
const SOUND_PREF_KEY = "cavapendoli-world-sound";
const ASSIST_PREF_KEY = "cavapendoli-world-assist";
const FALLBACK_MEMORY_FRAGMENTS: WorldMemoryFragment[] = [
  { id: "manifesto", label: "Manifesto", path: "/che-cose", zone: 0.14 },
  { id: "regole", label: "Regole", path: "/regole", zone: 0.9 },
  { id: "offri", label: "Offri", path: "/offri", zone: 0.86 },
  { id: "rimozione", label: "Rimozione", path: "/rimozione", zone: 0.96 },
  { id: "entra", label: "Entra", path: "/entra", zone: 0.56 },
];

type TravelHudState = {
  portal: WorldPortal;
  progress: number;
};

type FragmentTravelHudState = {
  fragment: WorldMemoryFragment;
  progress: number;
};

type ApprovedFragmentRow = {
  id: string;
  title: string | null;
};

const Index = () => {
  const navigate = useNavigate();
  const [journey, setJourney] = useState(() => readWorldJourney(0.14));
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SOUND_PREF_KEY) === "on";
  });
  const [assistMode, setAssistMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(ASSIST_PREF_KEY);
    if (stored === "on") return true;
    if (stored === "off") return false;
    return window.matchMedia("(pointer: coarse)").matches;
  });
  const [travelHud, setTravelHud] = useState<TravelHudState | null>(null);
  const [fragmentTravelHud, setFragmentTravelHud] = useState<FragmentTravelHudState | null>(null);
  const [approvedFragments, setApprovedFragments] = useState<ApprovedFragmentRow[]>([]);
  const [worldSignal, setWorldSignal] = useState<WorldSignal | null>(null);
  const lastManualSwitchRef = useRef(0);
  const lastWheelSwitchRef = useRef(0);
  const velocityRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const journeyRef = useRef(journey);
  const world = useMemo<WorldMode>(() => {
    if (journey < 0.34) return "soglia";
    if (journey < 0.67) return "vaga";
    return "silenzio";
  }, [journey]);
  const worldCard = useMemo(() => WORLD_CARDS[world], [world]);
  const signalRoom = worldSignal?.activeRoom ?? world;
  const signalCard = useMemo(() => WORLD_CARDS[signalRoom], [signalRoom]);
  const worldSignalNarrative = useMemo(() => {
    if (!worldSignal) return "Segnale in acquisizione.";
    if (worldSignal.portalTravelActive) {
      return `Attraversamento attivo verso ${worldSignal.hoveredPortal?.label ?? "una stanza"}.`;
    }
    if (worldSignal.fragmentTravelActive) {
      return `Raccolta in corso: ${worldSignal.hoveredFragment?.label ?? "frammento vivo"}.`;
    }
    if (worldSignal.hoveredFragment) {
      return `Frammento agganciato: ${worldSignal.hoveredFragment.label}.`;
    }
    if (worldSignal.hoveredPortal) {
      return `Portale agganciato: ${worldSignal.hoveredPortal.label}.`;
    }
    return signalRoom === "soglia"
      ? "Stanza d'ingresso: tracce lente, densita alta."
      : signalRoom === "vaga"
        ? "Stanza viva: deriva attiva e creature in moto."
        : "Stanza di silenzio: campo stabile e presenza minima.";
  }, [signalRoom, worldSignal]);
  const memoryFragments = useMemo<WorldMemoryFragment[]>(() => {
    if (!approvedFragments.length) return FALLBACK_MEMORY_FRAGMENTS;
    return approvedFragments.slice(0, 18).map((fragment, index) => ({
      id: fragment.id,
      label: fragment.title?.trim() || `Frammento ${index + 1}`,
      path: `/o/${fragment.id}`,
      zone: [0.14, 0.52, 0.9][index % 3],
    }));
  }, [approvedFragments]);

  useEffect(() => {
    if (import.meta.env.MODE === "test") return;
    let active = true;
    const loadFragments = async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("id,title")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(24);
      if (!active) return;
      if (error || !data) {
        setApprovedFragments([]);
        return;
      }
      setApprovedFragments(data as ApprovedFragmentRow[]);
    };
    void loadFragments();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    journeyRef.current = journey;
    persistWorldJourney(journey);
  }, [journey]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SOUND_PREF_KEY, soundEnabled ? "on" : "off");
    } catch {
      // Non-blocking preference persistence.
    }
  }, [soundEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ASSIST_PREF_KEY, assistMode ? "on" : "off");
    } catch {
      // Non-blocking preference persistence.
    }
  }, [assistMode]);

  useEffect(() => {
    let frameId = 0;
    const animateJourney = () => {
      velocityRef.current *= 0.9;
      const now = Date.now();
      setJourney((current) => {
        let next = current;
        if (Math.abs(velocityRef.current) > 0.00012) {
          next = Math.max(0.02, Math.min(0.98, current + velocityRef.current));
        } else if (now - lastManualSwitchRef.current > 900) {
          const anchor = nearestJourneyAnchor(current, WORLD_ANCHOR_VALUES);
          next = current + (anchor - current) * 0.045;
        }
        return Math.abs(next - current) < 0.00008 ? current : next;
      });
      frameId = window.requestAnimationFrame(animateJourney);
    };
    frameId = window.requestAnimationFrame(animateJourney);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (assistMode) return;
    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastManualSwitchRef.current < 12000) return;
      const direction = journeyRef.current > 0.72 ? -1 : 1;
      velocityRef.current = clampJourneyVelocity(velocityRef.current + direction * 0.018, 0.04);
    }, 9800);
    return () => window.clearInterval(interval);
  }, [assistMode]);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY == null || currentY == null) return;
      const delta = startY - currentY;
      if (Math.abs(delta) < 24) return;
      const now = Date.now();
      if (now - lastWheelSwitchRef.current < 950) return;
      lastWheelSwitchRef.current = now;
      lastManualSwitchRef.current = now;
      touchStartYRef.current = currentY;
      const direction = delta > 0 ? 1 : -1;
      velocityRef.current = clampJourneyVelocity(velocityRef.current + direction * 0.012, 0.036);
    };
    const onTouchEnd = () => {
      touchStartYRef.current = null;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      const now = Date.now();
      if (now - lastWheelSwitchRef.current < 1400) return;
      lastWheelSwitchRef.current = now;
      lastManualSwitchRef.current = now;
      const direction = event.deltaY > 0 ? 1 : -1;
      velocityRef.current = clampJourneyVelocity(velocityRef.current + direction * 0.014, 0.04);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        lastManualSwitchRef.current = Date.now();
        velocityRef.current = clampJourneyVelocity(velocityRef.current + 0.015, 0.04);
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        lastManualSwitchRef.current = Date.now();
        velocityRef.current = clampJourneyVelocity(velocityRef.current - 0.015, 0.04);
      } else if (event.key === "1" || event.key === "2" || event.key === "3") {
        const target =
          event.key === "1"
            ? WORLD_ANCHOR.soglia
            : event.key === "2"
              ? WORLD_ANCHOR.vaga
              : WORLD_ANCHOR.silenzio;
        lastManualSwitchRef.current = Date.now();
        velocityRef.current = 0;
        setJourney(target);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#0c1117] text-[#f4eddc]">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas
          mode={world}
          journey={journey}
          accessibilityMode={assistMode}
          interactivePortals
          portalTravelDurationMs={assistMode ? 980 : 860}
          fragmentTravelDurationMs={assistMode ? 760 : 620}
          soundscapeEnabled={soundEnabled}
          memoryFragments={memoryFragments}
          interactiveFragments
          onPortalTravelProgress={(update) => {
            if (!update.active || !update.portal) {
              setTravelHud(null);
              return;
            }
            setTravelHud({ portal: update.portal, progress: update.progress });
          }}
          onMemoryFragmentTravelProgress={(update) => {
            if (!update.active || !update.fragment) {
              setFragmentTravelHud(null);
              return;
            }
            setFragmentTravelHud({
              fragment: update.fragment,
              progress: update.progress,
            });
          }}
          onWorldSignal={(signal) => {
            setWorldSignal(signal);
          }}
          onMemoryFragmentSelect={(fragment) => {
            navigate(fragment.path);
          }}
          onPortalSelect={(portal: WorldPortal) => {
            lastManualSwitchRef.current = Date.now();
            velocityRef.current = 0;
            setJourney(portal.journey);
            persistWorldJourney(portal.journey);
            navigate(portal.path);
          }}
        />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(248,198,90,0.24),transparent_42%),radial-gradient(circle_at_84%_27%,rgba(56,158,174,0.24),transparent_48%),radial-gradient(circle_at_55%_82%,rgba(234,95,66,0.2),transparent_52%),linear-gradient(180deg,rgba(8,10,15,0.34),rgba(8,10,15,0.84))]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_44px)]" />
      <AnimatePresence>
        {travelHud && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[6.8rem] z-20 w-[min(90vw,26rem)] -translate-x-1/2 rounded-2xl border border-white/24 bg-black/52 p-3 backdrop-blur-xl"
          >
            <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.16em] text-[#d3deeb]">
              Attraversamento: {travelHud.portal.label}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f1c56d] via-[#57c5d2] to-[#a2b6de]"
                style={{ width: `${Math.round(travelHud.progress * 100)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {fragmentTravelHud && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[10.4rem] z-20 w-[min(90vw,23rem)] -translate-x-1/2 rounded-2xl border border-white/22 bg-black/48 p-3 backdrop-blur-xl"
          >
            <p className="font-mono-light text-[0.6rem] uppercase tracking-[0.16em] text-[#cfe6eb]">
              Raccolta: {fragmentTravelHud.fragment.label}
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-white/12">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#58c5cf] via-[#f2c36c] to-[#f07b59]"
                style={{ width: `${Math.round(fragmentTravelHud.progress * 100)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MinimalHeader immersive />

      <main className="relative z-10 flex min-h-screen items-center px-5 pb-10 pt-32 md:px-10 md:pt-36">
        <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="rounded-[2rem] border border-white/20 bg-black/35 p-7 shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-11"
          >
            <p className="font-mono-light text-[0.68rem] uppercase tracking-[0.25em] text-[#d5d8dd]">
              Cavapendolandia
            </p>
            <h1
              className={cn(
                "mt-6 font-light italic text-[#fbf4e7]",
                assistMode
                  ? "text-[2.85rem] leading-[1.04] md:text-[5.2rem]"
                  : "text-5xl leading-[1.08] md:text-7xl",
              )}
            >
              Che cosa significa Cavapendoli per te?
            </h1>
            <p
              className={cn(
                "mt-7 max-w-2xl font-mono-light uppercase tracking-[0.12em] text-[#e4ddd0]",
                assistMode ? "text-base" : "text-sm",
              )}
            >
              Un luogo delicato. Lascia qualcosa che possa stare qui.
            </p>
            <div className="mt-5 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#eabf65] via-[#4ec2ce] to-[#99aede]"
                style={{ width: `${Math.round(journey * 100)}%` }}
              />
            </div>
            <p className="mt-2 font-mono-light text-[0.6rem] uppercase tracking-[0.14em] text-[#bcc8d6]">
              Viaggio nel luogo: {Math.round(journey * 100)}%
            </p>
            <p
              className={cn(
                "mt-1 font-mono-light uppercase tracking-[0.14em] text-[#aebcd0]/85",
                assistMode ? "text-[0.68rem]" : "text-[0.58rem]",
              )}
            >
              Tocca i portali luminosi nello spazio per entrare in una stanza.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setSoundEnabled((current) => !current)}
                className={cn(
                  "inline-flex rounded-full border border-white/28 bg-black/28 px-4 py-2 font-mono-light uppercase tracking-[0.14em] text-[#d4e1ef] transition hover:border-white/45 hover:bg-white/10",
                  assistMode ? "text-[0.72rem]" : "text-[0.58rem]",
                )}
              >
                Audio {soundEnabled ? "on" : "off"}
              </button>
              <button
                onClick={() => setAssistMode((current) => !current)}
                className={cn(
                  "inline-flex rounded-full border px-4 py-2 font-mono-light uppercase tracking-[0.14em] transition",
                  assistMode
                    ? "border-[#f0c368] bg-[#f0c368]/20 text-[#fff0c8]"
                    : "border-white/28 bg-black/28 text-[#d4e1ef] hover:border-white/45 hover:bg-white/10",
                  assistMode ? "text-[0.72rem]" : "text-[0.58rem]",
                )}
              >
                Modalita semplice {assistMode ? "on" : "off"}
              </button>
            </div>
            {assistMode && (
              <div className="mt-3 rounded-xl border border-[#f0c368]/50 bg-black/35 p-3">
                <p className="font-mono-light text-xs uppercase tracking-[0.16em] text-[#ffe2a4]">
                  Guida rapida
                </p>
                <p className="mt-2 text-base leading-relaxed text-[#f2e4c8]">
                  1. Tocca una sfera luminosa per entrare.
                  <br />
                  2. Usa i tre pulsanti stanza qui sotto.
                  <br />
                  3. Se il movimento da fastidio, lascia attiva questa modalita.
                </p>
              </div>
            )}
            <div className="mt-2 grid grid-cols-3 gap-2">
              {WORLD_ORDER.map((candidate) => (
                <button
                  key={`journey-${candidate}`}
                  onClick={() => {
                    lastManualSwitchRef.current = Date.now();
                    velocityRef.current = 0;
                    setJourney(WORLD_ANCHOR[candidate]);
                  }}
                  className={cn(
                    "rounded-md border px-2 text-left font-mono-light uppercase tracking-[0.13em] transition",
                    assistMode ? "py-2 text-[0.72rem]" : "py-1 text-[0.57rem]",
                    world === candidate
                      ? "border-white/40 bg-white/12 text-[#eff5ff]"
                      : "border-white/14 bg-black/24 text-[#b4c1d0] hover:border-white/30 hover:text-[#dce7f3]",
                  )}
                >
                  {WORLD_CARDS[candidate].name}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-white/15 bg-black/30 p-4">
              <p className="font-mono-light text-[0.64rem] uppercase tracking-[0.18em] text-[#d5d8dd]">
                Mondo attivo: {worldCard.name}
              </p>
              <p className="mt-2 text-base text-[#f2ebdd]">{worldCard.atmosphere}</p>
            </div>
            <div className="mt-4 rounded-2xl border border-white/18 bg-black/26 p-4">
              <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.17em] text-[#d4dbe5]">
                Segnale vivo: {signalCard.name}
              </p>
              <p className="mt-2 text-sm text-[#d8dfeb]">{worldSignalNarrative}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="font-mono-light text-[0.55rem] uppercase tracking-[0.14em] text-[#adc0d2]">
                    Intensita stanza
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-white/12">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f0c167] to-[#6cc8d2]"
                      style={{ width: `${Math.round((worldSignal?.roomFocus ?? 0) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-mono-light text-[0.55rem] uppercase tracking-[0.14em] text-[#adc0d2]">
                    Intensita oracolo
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-white/12">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7cc4df] to-[#ef7863]"
                      style={{ width: `${Math.round((worldSignal?.oracleFocus ?? 0) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <EntraComingSoon
                className={cn(
                  "inline-flex min-w-[13rem] justify-center rounded-full border border-white/20 bg-white/5 px-7 font-mono-light uppercase tracking-[0.17em] text-[#d7deea]",
                  assistMode ? "py-4 text-sm" : "py-3 text-xs",
                )}
                hint="In arrivo: Entra si apre appena termina la revisione delle offerte."
              />
              <Link
                to="/offri"
                className={cn(
                  "inline-flex min-w-[13rem] justify-center rounded-full border px-7 font-mono-light uppercase tracking-[0.17em] text-[#fff5df] shadow-[0_0_30px_rgba(255,208,119,0.24)] transition hover:-translate-y-0.5 hover:bg-[#f4c465] hover:text-[#121314]",
                  assistMode ? "py-4 text-sm" : "py-3 text-xs",
                )}
                style={{ borderColor: worldCard.accent }}
              >
                Lascia un'offerta
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="rounded-[1.65rem] border border-white/18 bg-black/30 p-5 backdrop-blur-xl md:p-6"
          >
            <p className="font-mono-light text-[0.64rem] uppercase tracking-[0.18em] text-[#d0d8e1]">
              Room / Worlds
            </p>
            <h2 className="mt-3 text-3xl italic text-[#f9f0e0] md:text-4xl">Esplora il luogo</h2>
            <p className="mt-3 text-sm text-[#d5d9df]">
              Muovi il cursore e attraversa tre stati emotivi ispirati all&apos;universo Cavapendoli.
            </p>
            <p className="mt-1 font-mono-light text-[0.62rem] uppercase tracking-[0.15em] text-[#bfc9d3]/80">
              {assistMode
                ? "Modalita semplice attiva: trasformazione automatica ridotta."
                : "Il mondo si trasforma da solo. Clicca, scorri o trascina per cambiarlo."}
            </p>

            <div className="mt-5 grid gap-3">
              {WORLD_ORDER.map((candidate) => {
                const item = WORLD_CARDS[candidate];
                const active = world === candidate;
                return (
                  <button
                    key={candidate}
                    onClick={() => {
                      lastManualSwitchRef.current = Date.now();
                      velocityRef.current = 0;
                      setJourney(WORLD_ANCHOR[candidate]);
                    }}
                    className={cn(
                      "rounded-xl border text-left transition",
                      assistMode ? "p-5" : "p-4",
                      active
                        ? "translate-x-1 border-white/45 bg-white/12 shadow-[0_0_30px_rgba(108,173,203,0.25)]"
                        : "border-white/20 bg-black/20 hover:border-white/35 hover:bg-white/5",
                    )}
                    style={active ? { borderColor: item.accent } : undefined}
                  >
                    <p
                      className={cn(
                        "font-mono-light uppercase tracking-[0.17em] text-[#d4d9df]",
                        assistMode ? "text-[0.74rem]" : "text-[0.62rem]",
                      )}
                    >
                      {item.subtitle}
                    </p>
                    <p className={cn("mt-1 italic leading-none text-[#f8f0e2]", assistMode ? "text-3xl" : "text-2xl")}>
                      {item.name}
                    </p>
                    <p className={cn("mt-2 text-[#d7dce3]", assistMode ? "text-base" : "text-sm")}>{item.text}</p>
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </section>
      </main>

      <div className="relative z-10">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Index;
