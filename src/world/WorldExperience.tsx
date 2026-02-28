import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import OfferingCard from "@/components/OfferingCard";
import { cn } from "@/lib/utils";
import type { RoomId } from "@/world/types";
import type { ArchivioArtifact } from "@/world/types";
import { ROOM_GRAPH } from "@/world/graph/roomGraph";
import { resolveRoomFromPath } from "@/world/engine/RouteBridge";
import { WorldRuntime } from "@/world/engine/WorldRuntime";
import {
  createInitialWorldUiState,
  persistAudioEnabled,
  persistIntroSeen,
  worldUiReducer,
} from "@/world/state/worldStore";
import { LoadInOverlay } from "@/world/ui/LoadInOverlay";
import { OffriOverlay } from "@/world/ui/OffriOverlay";
import { getApprovedOfferingById, listApprovedOfferings } from "@/data/offeringsRepository";

const ROOM_TEXT: Record<RoomId, { title: string; body: string }> = {
  home_atrium: {
    title: "Che cosa significa Cavapendoli per te?",
    body: "Attraversa i portali e visita ogni stanza del sito come un mondo continuo.",
  },
  manifesto_room: {
    title: "Che cos'e",
    body: "Un luogo in cui lasciare tracce: testo, immagini, suoni, memoria.",
  },
  regole_room: {
    title: "Regole",
    body: "Patto del luogo: diritti, rispetto, cura, moderazione curatoriale.",
  },
  rimozione_room: {
    title: "Rimozione",
    body: "Per rimuovere un contenuto, contatta cavapendoli@gmail.com.",
  },
  archivio_room: {
    title: "Entra",
    body: "Le offerte approvate compaiono come reperti: cliccane una per entrare nel dettaglio.",
  },
  offri_room: {
    title: "Offri",
    body: "Apri il modulo in stanza e deposita la tua offerta direttamente nel mondo.",
  },
  offering_detail_room: {
    title: "Offerta",
    body: "Una stanza dedicata a un singolo frammento dell'archivio.",
  },
};

const WEBGL2_HELP_LINKS = [
  { label: "Home", to: "/" },
  { label: "Che cos'e", to: "/che-cose" },
  { label: "Regole", to: "/regole" },
  { label: "Rimozione", to: "/rimozione" },
  { label: "Entra", to: "/entra" },
  { label: "Offri", to: "/offri" },
];

const LOAD_IN_SESSION_KEY = "cava_world_load_in_seen_v1";

const WorldExperience = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<WorldRuntime | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const initialResolution = resolveRoomFromPath(location.pathname);
  const initialRoom = initialResolution.roomId ?? "home_atrium";
  const [state, dispatch] = useReducer(worldUiReducer, createInitialWorldUiState(initialRoom));
  const [compatibility, setCompatibility] = useState(WorldRuntime.checkCompatibility());
  const [infoOverlayOpen, setInfoOverlayOpen] = useState(false);
  const [simpleMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("cava_world_simple_mode_v1");
    if (stored === "1") return true;
    if (stored === "0") return false;
    return window.matchMedia("(max-width: 900px)").matches;
  });
  const [loadInOpen, setLoadInOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(LOAD_IN_SESSION_KEY) !== "1";
  });

  const resolution = useMemo(() => resolveRoomFromPath(location.pathname), [location.pathname]);
  const currentRoom = resolution.roomId ?? state.currentRoom;

  const closeLoadIn = useCallback(() => {
    setLoadInOpen(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(LOAD_IN_SESSION_KEY, "1");
    }
  }, []);

  const offeringsQuery = useQuery({
    queryKey: ["world-approved-offerings"],
    queryFn: async () => listApprovedOfferings(18, 0),
  });

  const detailQuery = useQuery({
    queryKey: ["world-offering-detail", resolution.offeringId],
    queryFn: async () => getApprovedOfferingById(resolution.offeringId || ""),
    enabled: !!resolution.offeringId,
  });

  const artifactList = useMemo<ArchivioArtifact[]>(() => {
    const rows = offeringsQuery.data ?? [];
    return rows.map((row) => ({
      id: row.id,
      title: row.title?.trim() || "Offerta",
      authorName: row.author_name,
      mediaType: row.media_type,
    }));
  }, [offeringsQuery.data]);

  useEffect(() => {
    setCompatibility(WorldRuntime.checkCompatibility());
  }, []);

  useEffect(() => {
    if (!compatibility.webgl2) return;
    const container = containerRef.current;
    if (!container) return;

    const runtime = new WorldRuntime({
      container,
      initialRoom,
      audioEnabled: state.audioEnabled,
      onHotspotAction: (hotspot) => {
        if (state.introLocked) return;
        if (hotspot.action.type === "navigate") {
          navigate(hotspot.action.route);
          return;
        }
        if (hotspot.action.type === "focus_offering") {
          navigate(`/o/${hotspot.action.offeringId}`);
          return;
        }
        if (hotspot.action.type === "open_overlay") {
          if (hotspot.action.overlay === "offri_form") {
            navigate("/offri");
            dispatch({ type: "SET_OFFRI_OVERLAY", open: true });
            return;
          }
          setInfoOverlayOpen(true);
        }
      },
      onRoomSettled: (roomId) => {
        dispatch({ type: "SET_CURRENT_ROOM", room: roomId });
      },
    });

    runtimeRef.current = runtime;
    runtime.setArchivioArtifacts(artifactList);

    return () => {
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
      runtime.dispose();
      runtimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compatibility.webgl2]);

  useEffect(() => {
    runtimeRef.current?.setAudioEnabled(state.audioEnabled);
    persistAudioEnabled(state.audioEnabled);
  }, [state.audioEnabled]);

  useEffect(() => {
    if (!runtimeRef.current) return;
    runtimeRef.current.setArchivioArtifacts(artifactList);
  }, [artifactList]);

  useEffect(() => {
    if (!runtimeRef.current) return;
    runtimeRef.current.setOfferingDetailPreview(
      detailQuery.data?.title?.trim() || null,
      detailQuery.data?.media_type || null,
    );
  }, [detailQuery.data]);

  useEffect(() => {
    if (!resolution.known) return;
    if (!resolution.roomId) return;

    dispatch({ type: "SET_TARGET_ROOM", room: resolution.roomId });
    dispatch({ type: "SET_SELECTED_OFFERING", offeringId: resolution.offeringId });
    dispatch({ type: "SET_OFFRI_OVERLAY", open: resolution.roomId === "offri_room" });

    if (!runtimeRef.current) return;
    if (resolution.roomId === state.currentRoom) return;

    const transition = runtimeRef.current.travelToRoom(resolution.roomId);
    if (transition) {
      dispatch({
        type: "START_TRANSITION",
        transition: {
          active: true,
          from: transition.from,
          to: transition.to,
          startAt: Date.now(),
          durationMs: transition.durationMs,
          easing: transition.easing,
        },
      });
      if (transitionTimerRef.current) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        dispatch({ type: "END_TRANSITION" });
        transitionTimerRef.current = null;
      }, transition.durationMs + 50);
    } else {
      runtimeRef.current.setRoomImmediately(resolution.roomId);
      dispatch({ type: "SET_CURRENT_ROOM", room: resolution.roomId });
    }
  }, [location.pathname, resolution.known, resolution.offeringId, resolution.roomId, state.currentRoom]);

  useEffect(() => {
    if (!state.introSeen) return;
    persistIntroSeen(true);
  }, [state.introSeen]);

  const startIntroTour = () => {
    dispatch({ type: "SET_INTRO_SEEN", seen: true });
    dispatch({ type: "SET_INTRO_LOCKED", locked: false });
    persistIntroSeen(true);
    navigate("/che-cose");
  };

  if (!compatibility.webgl2) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b11] px-6 text-[#f5eddc]">
        <div className="max-w-2xl rounded-3xl border border-white/15 bg-black/45 p-8">
          <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.18em] text-[#b7cadf]">Compatibilita</p>
          <h1 className="mt-4 text-4xl italic">WebGL2 richiesto</h1>
          <p className="mt-4 text-base text-[#d9e2ec]">
            Per esplorare la Cavapendolandia 3D serve un browser con supporto WebGL2 attivo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {WEBGL2_HELP_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-white/25 px-4 py-2 font-mono-light text-xs uppercase tracking-[0.14em] text-[#d8e7f3]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const roomText = ROOM_TEXT[currentRoom];
  const roomNode = ROOM_GRAPH[currentRoom];

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[#05080f] pb-24 text-[#f5eddc] md:pb-0",
        simpleMode && "text-[1.04rem] leading-relaxed",
      )}
    >
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,15,0.12),rgba(5,7,11,0.42))]" />

      <LoadInOverlay open={loadInOpen} onComplete={closeLoadIn} onSkip={closeLoadIn} simpleMode={simpleMode} />

      <header className="pointer-events-auto fixed inset-x-0 top-0 z-30 border-b border-white/20 bg-black/35 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-8 md:py-2">
          <button
            onClick={() => navigate("/")}
            className="font-mono-light text-[0.68rem] uppercase tracking-[0.17em] text-[#f3e8d4]/90 sm:text-[0.72rem] sm:tracking-[0.2em]"
          >
            Cavapendolandia
          </button>
          <div className="flex max-w-[72%] flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2">
            <button
              onClick={() => {
                dispatch({ type: "TOGGLE_AUDIO" });
              }}
              className={cn(
                "min-h-9 rounded-full border border-white/25 px-3 py-1.5 font-mono-light uppercase tracking-[0.12em] text-[#d8e7f3] sm:px-3 sm:tracking-[0.14em]",
                simpleMode ? "text-[0.74rem]" : "text-[0.68rem]",
              )}
            >
              Audio {state.audioEnabled ? "on" : "off"}
            </button>
            <button
              onClick={() => setInfoOverlayOpen((open) => !open)}
              className={cn(
                "min-h-9 rounded-full border border-white/25 px-3 py-1.5 font-mono-light uppercase tracking-[0.12em] text-[#d8e7f3] sm:px-3 sm:tracking-[0.14em]",
                simpleMode ? "text-[0.74rem]" : "text-[0.68rem]",
              )}
            >
              {infoOverlayOpen ? "HUD off" : "HUD on"}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {state.introLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/78 p-6"
          >
            <motion.div
              initial={{ y: 16, opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-3xl rounded-3xl border border-white/20 bg-[#070b12]/95 p-7"
            >
              <p className="font-mono-light text-[0.66rem] uppercase tracking-[0.18em] text-[#b7cadf]">Introduzione guidata</p>
              <h2 className="mt-4 text-5xl italic text-[#fbf2df]">Esplora stanza per stanza</h2>
              <p className="mt-5 text-lg text-[#d9e2ec]">
                Questa esperienza e interamente 3D: clicca i portali luminosi per attraversare il sito.
              </p>
              <ul className="mt-4 grid gap-2 text-sm text-[#ced9e6]">
                <li>1. I portali muovono la camera tra le stanze.</li>
                <li>2. In Archivio clicca i reperti per aprire una singola offerta.</li>
                <li>3. In Offri apri il modulo in stanza e invia la tua traccia.</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={startIntroTour}
                  className="rounded-full border border-[#f0c56f] px-5 py-2 font-mono-light text-xs uppercase tracking-[0.16em] text-[#ffefce]"
                >
                  Inizia tour
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {infoOverlayOpen && !state.introLocked && !state.showOffriOverlay && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            className={cn(
              "pointer-events-auto absolute right-4 top-24 z-35 w-[min(92vw,22rem)] rounded-3xl border border-white/18 bg-black/38 p-4 backdrop-blur-lg md:right-8",
              simpleMode && "w-[min(94vw,24rem)] p-5",
            )}
          >
            <p
              className={cn(
                "font-mono-light uppercase tracking-[0.18em] text-[#c6d6e8]",
                simpleMode ? "text-[0.72rem]" : "text-[0.62rem]",
              )}
            >
              {roomNode.title}
            </p>
            <h2 className={cn("mt-2 italic text-[#fbf2df]", simpleMode ? "text-3xl" : "text-2xl")}>{roomText.title}</h2>
            <p className={cn("mt-3 text-[#d8e3f0]", simpleMode ? "text-[0.96rem]" : "text-[0.88rem]")}>{roomText.body}</p>

            <p className={cn("mt-3 text-[#b8cadf]", simpleMode ? "text-[0.84rem]" : "text-[0.7rem]")}>
              Tocca o clicca i cerchi luminosi nella scena per muoverti stanza per stanza.
            </p>

            {currentRoom === "archivio_room" && (
              <div className="mt-5 max-h-[16rem] space-y-2 overflow-auto pr-2">
                {offeringsQuery.data?.slice(0, 8).map((offering) => (
                  <button
                    key={offering.id}
                    onClick={() => navigate(`/o/${offering.id}`)}
                    className="w-full rounded-xl border border-white/14 bg-black/25 px-3 py-2 text-left hover:border-white/30"
                  >
                    <p className="text-sm text-[#f3ebdc]">{offering.title || "Offerta"}</p>
                    <p className="font-mono-light text-[0.58rem] uppercase tracking-[0.14em] text-[#b2c6da]">
                      {offering.media_type}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {currentRoom === "offering_detail_room" && detailQuery.data && (
              <div className="mt-5 rounded-2xl border border-white/16 bg-black/30 p-3">
                <OfferingCard
                  id={detailQuery.data.id}
                  mediaType={detailQuery.data.media_type}
                  fileUrl={detailQuery.data.file_url}
                  textContent={detailQuery.data.text_content}
                  linkUrl={detailQuery.data.link_url}
                  title={detailQuery.data.title || "Offerta"}
                  note={detailQuery.data.note}
                  authorType={detailQuery.data.author_type}
                  authorName={detailQuery.data.author_name}
                  createdAt={detailQuery.data.created_at}
                  curatorialNote={detailQuery.data.curatorial_note}
                  full
                />
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <OffriOverlay
        open={state.showOffriOverlay && !state.introLocked}
        state={state.offri}
        onStateChange={(next) => {
          dispatch({ type: "SET_OFFRI_STEP", step: next.step });
          dispatch({ type: "SET_OFFRI_MEDIA", mediaType: next.mediaType });
          dispatch({ type: "SET_OFFRI_SUBMITTING", submitting: next.submitting });
          dispatch({ type: "SET_OFFRI_SUBMITTED", submitted: next.submitted });
        }}
        onClose={() => {
          dispatch({ type: "SET_OFFRI_OVERLAY", open: false });
        }}
        onSubmitted={() => {
          setInfoOverlayOpen(true);
        }}
      />

      {!resolution.known && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-6 z-40 mx-auto w-[min(92vw,34rem)] rounded-2xl border border-white/20 bg-black/50 p-4 text-center">
          <p className="text-lg italic text-[#f5ecd9]">Percorso non trovato</p>
          <p className="mt-2 text-sm text-[#c8d4df]">Questo varco non esiste ancora nel mondo.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-3 rounded-full border border-[#f0c56f] px-4 py-2 font-mono-light text-xs uppercase tracking-[0.15em] text-[#ffefce]"
          >
            Torna all'Atrio
          </button>
        </div>
      )}

      {!state.introLocked && !state.showOffriOverlay && (
        <nav className="pointer-events-auto fixed inset-x-0 bottom-0 z-30 border-t border-white/15 bg-black/35 px-3 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm md:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">
            {[
              { to: "/", label: "Atrio" },
              { to: "/entra", label: "Entra" },
              { to: "/offri", label: "Offri" },
              { to: "/che-cose", label: "Che cos'e" },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="min-h-11 rounded-lg border border-white/22 bg-black/30 px-2 py-2.5 font-mono-light text-[0.78rem] uppercase tracking-[0.12em] text-[#dce9f5]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default WorldExperience;
