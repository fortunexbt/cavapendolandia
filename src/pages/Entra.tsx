import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MinimalHeader from "@/components/MinimalHeader";
import MinimalFooter from "@/components/MinimalFooter";
import type {
  WorldMemoryFragment,
  WorldMode,
  WorldPortal,
  WorldSignal,
} from "@/components/CavapendoliWorldCanvas";
import { cn } from "@/lib/utils";
import { persistWorldJourney, readWorldJourney, resolveJourneyForPage } from "@/lib/worldJourney";
import { supabase } from "@/integrations/supabase/client";

const CavapendoliWorldCanvas = lazy(() => import("@/components/CavapendoliWorldCanvas"));
const ENTRA_JOURNEY_ANCHOR: Record<WorldMode, number> = {
  soglia: 0.12,
  vaga: 0.56,
  silenzio: 0.9,
};
const SOUND_PREF_KEY = "cavapendoli-world-sound";
const ASSIST_PREF_KEY = "cavapendoli-world-assist";
const FALLBACK_MEMORY_FRAGMENTS: WorldMemoryFragment[] = [
  { id: "manifesto", label: "Manifesto", path: "/che-cose", zone: 0.14 },
  { id: "regole", label: "Regole", path: "/regole", zone: 0.9 },
  { id: "offri", label: "Offri", path: "/offri", zone: 0.86 },
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

const WORLD_OPTIONS: Array<{
  id: WorldMode;
  label: string;
  name: string;
  detail: string;
}> = [
  {
    id: "vaga",
    label: "Deriva aperta",
    name: "Vaga",
    detail:
      "Un percorso libero, fatto di apparizioni e tracce che emergono a ritmo lento.",
  },
  {
    id: "silenzio",
    label: "Ascolto profondo",
    name: "Silenzio",
    detail:
      "Una sola offerta alla volta, con interfaccia minima e presenza quasi meditativa.",
  },
];
const SIGNAL_WORLD_LABELS: Record<WorldMode, string> = {
  soglia: "Soglia",
  vaga: "Vaga",
  silenzio: "Silenzio",
};

const Entra = () => {
  const navigate = useNavigate();
  const [world, setWorld] = useState<WorldMode>(() =>
    readWorldJourney(ENTRA_JOURNEY_ANCHOR.vaga) > 0.72 ? "silenzio" : "vaga",
  );
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
  const touchStartYRef = useRef<number | null>(null);
  const activeWorld = useMemo(
    () => WORLD_OPTIONS.find((item) => item.id === world) ?? WORLD_OPTIONS[0],
    [world],
  );
  const pageJourney = resolveJourneyForPage(ENTRA_JOURNEY_ANCHOR[world], 0.52);
  const signalRoom = worldSignal?.activeRoom ?? world;
  const worldSignalNarrative = useMemo(() => {
    if (!worldSignal) return "Segnale archivio in acquisizione.";
    if (worldSignal.portalTravelActive) {
      return `Portale in attraversamento: ${worldSignal.hoveredPortal?.label ?? "stanza"}.`;
    }
    if (worldSignal.fragmentTravelActive) {
      return `Frammento in raccolta: ${worldSignal.hoveredFragment?.label ?? "presenza"}.`;
    }
    if (worldSignal.hoveredFragment) {
      return `Frammento tracciato: ${worldSignal.hoveredFragment.label}.`;
    }
    if (worldSignal.hoveredPortal) {
      return `Portale tracciato: ${worldSignal.hoveredPortal.label}.`;
    }
    return signalRoom === "vaga"
      ? "Deriva attiva: il campo invita all'esplorazione."
      : signalRoom === "silenzio"
        ? "Silenzio attivo: il campo riduce il rumore."
        : "Soglia attiva: il campo prepara il passaggio.";
  }, [signalRoom, worldSignal]);
  const memoryFragments = useMemo<WorldMemoryFragment[]>(() => {
    if (!approvedFragments.length) return FALLBACK_MEMORY_FRAGMENTS;
    return approvedFragments.slice(0, 12).map((fragment, index) => ({
      id: fragment.id,
      label: fragment.title?.trim() || `Frammento ${index + 1}`,
      path: `/o/${fragment.id}`,
      zone: [0.2, 0.55, 0.88][index % 3],
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
        .limit(15);
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
    persistWorldJourney(ENTRA_JOURNEY_ANCHOR[world]);
  }, [world]);

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
    if (assistMode) return;
    const rotateOrder: WorldMode[] = ["vaga", "silenzio"];
    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now - lastManualSwitchRef.current < 10000) return;
      setWorld((current) => {
        const index = rotateOrder.indexOf(current);
        return rotateOrder[(index + 1) % rotateOrder.length];
      });
    }, 8200);
    return () => window.clearInterval(interval);
  }, [assistMode]);

  useEffect(() => {
    const rotateOrder: WorldMode[] = ["vaga", "silenzio"];
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
      setWorld((current) => {
        const index = rotateOrder.indexOf(current);
        const direction = delta > 0 ? 1 : -1;
        const next = (index + direction + rotateOrder.length) % rotateOrder.length;
        return rotateOrder[next];
      });
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
    const rotateOrder: WorldMode[] = ["vaga", "silenzio"];
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 10) return;
      const now = Date.now();
      if (now - lastWheelSwitchRef.current < 1400) return;
      lastWheelSwitchRef.current = now;
      lastManualSwitchRef.current = now;
      setWorld((current) => {
        const index = rotateOrder.indexOf(current);
        const direction = event.deltaY > 0 ? 1 : -1;
        const next = (index + direction + rotateOrder.length) % rotateOrder.length;
        return rotateOrder[next];
      });
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const rotateOrder: WorldMode[] = ["vaga", "silenzio"];
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowRight" ||
        event.key === "1" ||
        event.key === "2"
      ) {
        lastManualSwitchRef.current = Date.now();
        setWorld((current) => {
          if (event.key === "1") return "vaga";
          if (event.key === "2") return "silenzio";
          const index = rotateOrder.indexOf(current);
          return rotateOrder[(index + 1) % rotateOrder.length];
        });
      } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        lastManualSwitchRef.current = Date.now();
        setWorld((current) => {
          const index = rotateOrder.indexOf(current);
          return rotateOrder[(index - 1 + rotateOrder.length) % rotateOrder.length];
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0c1117] text-[#f5eddc]">
      <Suspense fallback={null}>
        <CavapendoliWorldCanvas
          mode={world}
          journey={pageJourney}
          accessibilityMode={assistMode}
          interactivePortals
          portalTravelDurationMs={assistMode ? 900 : 780}
          fragmentTravelDurationMs={assistMode ? 700 : 560}
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
            setWorld(portal.mode === "silenzio" ? "silenzio" : "vaga");
            persistWorldJourney(portal.journey);
            if (portal.path !== "/entra") {
              navigate(portal.path);
            }
          }}
        />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(243,187,86,0.2),transparent_44%),radial-gradient(circle_at_82%_24%,rgba(79,178,200,0.22),transparent_48%),linear-gradient(180deg,rgba(9,11,16,0.5),rgba(8,10,15,0.85))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_52px)]" />
      <AnimatePresence>
        {travelHud && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-none absolute left-1/2 top-[6.6rem] z-20 w-[min(90vw,24rem)] -translate-x-1/2 rounded-2xl border border-white/24 bg-black/52 p-3 backdrop-blur-xl"
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
            className="pointer-events-none absolute left-1/2 top-[10.2rem] z-20 w-[min(90vw,22rem)] -translate-x-1/2 rounded-2xl border border-white/22 bg-black/48 p-3 backdrop-blur-xl"
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

      <main className="relative z-10 flex min-h-screen items-center px-6 pb-12 pt-32 md:px-10 md:pt-36">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto grid w-full max-w-6xl gap-7 lg:grid-cols-[1.08fr_0.92fr]"
        >
          <article className="rounded-[2rem] border border-white/20 bg-black/35 p-7 backdrop-blur-xl md:p-10">
            <p className="font-mono-light text-[0.68rem] uppercase tracking-[0.22em] text-[#d8dce4]">
              Archivio in revisione
            </p>
            <h1
              className={cn(
                "mt-5 font-light italic leading-[1.06] text-[#fbf3e5]",
                assistMode ? "text-[2.8rem] md:text-[5rem]" : "text-5xl md:text-7xl",
              )}
            >
              Entra torna presto.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#e7dfcf]">
              Le offerte stanno entrando una a una. Stiamo revisionando i primi contributi prima di aprire il
              passaggio completo.
            </p>
            <p className="mt-5 rounded-xl border border-white/15 bg-black/30 p-4 text-base text-[#f0e8d8]">
              <span className="font-mono-light text-[0.64rem] uppercase tracking-[0.16em] text-[#cad4e2]">
                Preview attiva: {activeWorld.name}
              </span>
              <br />
              {activeWorld.detail}
            </p>
            <div className="mt-4 rounded-xl border border-white/16 bg-black/26 p-4">
              <p className="font-mono-light text-[0.62rem] uppercase tracking-[0.16em] text-[#cfd9e8]">
                Segnale archivio: {SIGNAL_WORLD_LABELS[signalRoom]}
              </p>
              <p className="mt-2 text-sm text-[#d7dfeb]">{worldSignalNarrative}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div>
                  <p className="font-mono-light text-[0.55rem] uppercase tracking-[0.14em] text-[#adc0d2]">
                    Campo stanza
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
                    Campo oracolo
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
            {assistMode && (
              <div className="mt-4 rounded-xl border border-[#f0c368]/50 bg-black/35 p-4">
                <p className="font-mono-light text-xs uppercase tracking-[0.16em] text-[#ffe2a4]">
                  Guida rapida
                </p>
                <p className="mt-2 text-base leading-relaxed text-[#f2e4c8]">
                  1. Tocca una sfera luminosa per aprire una pagina.
                  <br />
                  2. Usa i pulsanti ritmo qui a destra.
                  <br />
                  3. Questa modalita rende il movimento piu gentile.
                </p>
              </div>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/offri"
                className={cn(
                  "inline-flex min-w-[13rem] justify-center rounded-full border border-[#e2bd6c] bg-black/35 px-7 font-mono-light uppercase tracking-[0.17em] text-[#fff4de] shadow-[0_0_30px_rgba(241,192,96,0.2)] transition hover:-translate-y-0.5 hover:bg-[#f0c267] hover:text-[#1a1a1a]",
                  assistMode ? "py-4 text-sm" : "py-3 text-xs",
                )}
              >
                Lascia un&apos;offerta
              </Link>
              <Link
                to="/che-cose"
                className="font-mono-light text-xs uppercase tracking-[0.15em] text-[#cfd9e5] underline underline-offset-4"
              >
                Che cos&apos;e
              </Link>
            </div>
          </article>

          <aside className="rounded-[1.6rem] border border-white/20 bg-black/30 p-5 backdrop-blur-xl md:p-6">
            <p className="font-mono-light text-[0.64rem] uppercase tracking-[0.18em] text-[#d1d8e3]">
              Modalita di ingresso
            </p>
            <h2 className="mt-3 text-3xl italic text-[#f9efdf] md:text-4xl">Scegli il ritmo</h2>
            <p className="mt-3 text-sm text-[#d8dde5]">
              Due stati diversi dello stesso archivio, progettati per esplorare o contemplare.
            </p>
            <p className="mt-1 font-mono-light text-[0.62rem] uppercase tracking-[0.15em] text-[#bfc9d3]/80">
              {assistMode
                ? "Modalita semplice attiva: cambio automatico disattivato."
                : "Cambio automatico attivo. Clicca, scorri o trascina per guidarlo."}
            </p>
            <p className="mt-1 font-mono-light text-[0.6rem] uppercase tracking-[0.15em] text-[#adbece]/75">
              Puoi entrare in altre stanze cliccando i portali dentro il mondo.
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

            <div className="mt-5 grid gap-3">
              {WORLD_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    lastManualSwitchRef.current = Date.now();
                    setWorld(option.id);
                  }}
                  className={cn(
                    "rounded-xl border text-left transition",
                    assistMode ? "p-5" : "p-4",
                    world === option.id
                      ? "translate-x-1 border-[#f0c063] bg-white/12 shadow-[0_0_28px_rgba(108,173,203,0.2)]"
                      : "border-white/20 bg-black/20 hover:border-white/35 hover:bg-white/5",
                  )}
                >
                  <p
                    className={cn(
                      "font-mono-light uppercase tracking-[0.16em] text-[#d4dce6]",
                      assistMode ? "text-[0.74rem]" : "text-[0.62rem]",
                    )}
                  >
                    {option.label}
                  </p>
                  <p className={cn("mt-1 italic leading-none text-[#f8f0e2]", assistMode ? "text-3xl" : "text-2xl")}>
                    {option.name}
                  </p>
                  <p className={cn("mt-2 text-[#d7dce3]", assistMode ? "text-base" : "text-sm")}>{option.detail}</p>
                </button>
              ))}
            </div>
          </aside>
        </motion.section>
      </main>

      <div className="relative z-10">
        <MinimalFooter />
      </div>
    </div>
  );
};

export default Entra;
