import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  type ControlProfile,
  type GuideDescriptor,
  type HudMode,
  type MobileOrientationState,
  type RenderProfilePreference,
  type ResolvedRenderProfile,
} from "@/components/cavapendo-gallery/runtime";

export function PreloadOverlay({
  stageLabel,
  stageIndex,
  totalStages,
}: {
  stageLabel: string;
  stageIndex: number;
  totalStages: number;
}) {
  const progress = Math.min(
    100,
    Math.max(12, (stageIndex / totalStages) * 100),
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#110d0c] px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#4d3d32] bg-[radial-gradient(circle_at_top,_rgba(116,151,193,0.22),_rgba(20,15,12,0.96)_64%)] px-6 py-8 text-[#f3eadf] shadow-[0_28px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ceb89f]">
          Cavapendolandia / Galleria
        </div>
        <h1 className="mt-3 text-3xl font-light tracking-[-0.03em] text-[#fbf5ec]">
          Sto preparando il mondo.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#dbcfc0]">
          Caricamento progressivo del globo, delle superfici dipinte e
          dell&apos;ambiente sonoro. L&apos;ingresso parte solo quando il primo
          frame e stabile.
        </p>
        <div className="mt-6 rounded-full border border-[#5f4f43] bg-black/20 p-1">
          <div
            className="h-3 rounded-full bg-[linear-gradient(90deg,_#e7d0a6,_#92b5ff,_#e2f0cb)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-[0.72rem] uppercase tracking-[0.14em] text-[#c9b39c]">
          <span>
            Fase {stageIndex}/{totalStages}
          </span>
          <span>{stageLabel}</span>
        </div>
      </div>
    </div>
  );
}

export function MobileOrientationOverlay({
  orientationState,
  onDismiss,
}: {
  orientationState: MobileOrientationState;
  onDismiss: () => void;
}) {
  if (orientationState !== "portrait_hint") return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(198,223,255,0.26),_rgba(9,7,7,0.95)_64%)] px-5">
      <div className="w-full max-w-md rounded-[2.2rem] border border-[#8a6c59] bg-[linear-gradient(180deg,_rgba(27,20,17,0.98),_rgba(13,10,9,0.95))] p-6 text-[#fbf3e8] shadow-[0_36px_110px_rgba(0,0,0,0.56)] backdrop-blur-2xl">
        <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#dec5ab]">
          Esperienza mobile
        </div>
        <h2 className="mt-3 text-3xl font-light tracking-[-0.04em] text-[#fff9f0]">
          Ruota in orizzontale.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#f0dfd1]">
          Il globo esterno e i controlli twin-stick sono progettati per il
          paesaggio. In verticale puoi continuare, ma perderai spazio, visione
          e comfort.
        </p>
        <div className="mt-5 rounded-[1.5rem] border border-[#3c2f28] bg-[radial-gradient(circle_at_top,_rgba(145,185,255,0.14),_rgba(255,255,255,0.03)_58%)] p-4">
          <div className="grid grid-cols-2 gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-[#e6d8c9]">
            <div className="rounded-[1.25rem] border border-[#4a3a32] bg-[#1b1411] px-3 py-3 text-center">
              Sinistra
              <div className="mt-2 text-[0.8rem] normal-case tracking-normal text-[#fff7ee]">
                Movimento
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-[#4a3a32] bg-[#1b1411] px-3 py-3 text-center">
              Destra
              <div className="mt-2 text-[0.8rem] normal-case tracking-normal text-[#fff7ee]">
                Sguardo + azioni
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 rounded-full border border-[#8b7461] bg-[#221915] px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-[#f6eadc]"
          >
            Continua comunque
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 rounded-full bg-[linear-gradient(180deg,_#f6eee5,_#eadbc9)] px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-[#241913]"
          >
            Ho capito
          </button>
        </div>
      </div>
    </div>
  );
}

export function PlayerHud({
  zoneLabel,
  sectorLabel,
  objectiveLabel,
  promptLabel,
  landmarkLabel,
  ambienceLabel,
  creatureCount,
  depositReady,
  isMobile,
  showGuideButton,
  onOpenGuide,
}: {
  zoneLabel: string;
  sectorLabel: string | null;
  objectiveLabel: string | null;
  promptLabel: string | null;
  landmarkLabel: string | null;
  ambienceLabel: string | null;
  creatureCount: number;
  depositReady: boolean;
  isMobile: boolean;
  showGuideButton: boolean;
  onOpenGuide: () => void;
}) {
  return (
    <>
      <div
        className={`pointer-events-none absolute left-4 z-20 flex flex-col gap-2.5 ${
          isMobile
            ? "top-4 max-w-[min(13.5rem,calc(100%-8.75rem))]"
            : "top-4 max-w-[min(21rem,calc(100%-6.5rem))]"
        }`}
      >
        <div className="rounded-[1.5rem] border border-[#6d5a4a] bg-[linear-gradient(180deg,_rgba(20,14,12,0.82),_rgba(11,8,7,0.74))] px-4 py-3 text-[#fcf6ee] shadow-[0_24px_70px_rgba(0,0,0,0.42)] backdrop-blur-[18px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#8f7965] bg-[#241916] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#f1dcc2]">
              {zoneLabel}
            </span>
            {sectorLabel && (
              <span className="rounded-full border border-[#66755d] bg-[#182017] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#edf5e3]">
                {sectorLabel}
              </span>
            )}
          </div>
          {objectiveLabel && (
            <>
              <div className="mt-2.5 text-[0.58rem] uppercase tracking-[0.22em] text-[#d9bea2]">
                Obiettivo attuale
              </div>
              <div
                className={`mt-1.5 leading-relaxed text-[#fff9f1] ${
                  isMobile
                    ? "line-clamp-2 text-[0.82rem]"
                    : "line-clamp-2 text-[0.9rem]"
                }`}
              >
                {objectiveLabel}
              </div>
            </>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-[#efe4d5]">
            {landmarkLabel && (
              <span className="rounded-full border border-[#5c4d43] bg-[#171211] px-2.5 py-1 text-[#f0e4d8]">
                Vista: {landmarkLabel}
              </span>
            )}
            {ambienceLabel && (
              <span className="rounded-full border border-[#5c4d43] bg-[#171211] px-2.5 py-1 text-[#f0e4d8]">
                {ambienceLabel}
              </span>
            )}
            {creatureCount > 0 && (
              <span className="rounded-full border border-[#5c4d43] bg-[#171211] px-2.5 py-1 text-[#f0e4d8]">
                Creature vicine {creatureCount}
              </span>
            )}
            {depositReady && (
              <span className="rounded-full border border-[#9a7d4d] bg-[#352716] px-2.5 py-1 text-[#ffebb8]">
                Radura pronta
              </span>
            )}
          </div>
        </div>

        {!isMobile && showGuideButton && (
          <button
            onClick={onOpenGuide}
            className="pointer-events-auto inline-flex w-fit items-center rounded-full border border-[#6c5848] bg-[#100c0b]/78 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#fff2e4] shadow-[0_14px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-colors hover:bg-[#231815]"
          >
            Riapri guida
          </button>
        )}
      </div>

      <AnimatePresence>
        {promptLabel && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className={`pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 ${
              isMobile ? "bottom-[9.3rem]" : "bottom-8"
            }`}
          >
            <div className="rounded-full border border-[#a18767] bg-[linear-gradient(180deg,_rgba(19,14,13,0.9),_rgba(10,8,8,0.82))] px-5 py-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#fff7ee] shadow-[0_18px_44px_rgba(0,0,0,0.34)] backdrop-blur-xl">
              {promptLabel}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function DebugHud({
  zoneLabel,
  sectorLabel,
  renderProfile,
  ambienceLabel,
  sensitivitySummary,
  nearbyTriggerLabel,
  nearbyCreatureCount,
}: {
  zoneLabel: string;
  sectorLabel: string | null;
  renderProfile: string;
  ambienceLabel: string | null;
  sensitivitySummary: string;
  nearbyTriggerLabel: string | null;
  nearbyCreatureCount: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-wrap justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {[
          zoneLabel,
          sectorLabel,
          renderProfile,
          nearbyTriggerLabel,
          ambienceLabel,
        ]
          .filter(Boolean)
          .map((item) => (
            <div
              key={item}
              className="rounded-full border border-white/10 bg-[#17110f]/76 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#ddcec0] backdrop-blur-md"
            >
              {item}
            </div>
          ))}
        {nearbyCreatureCount > 0 && (
          <div className="rounded-full border border-white/10 bg-[#17110f]/76 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#ddcec0] backdrop-blur-md">
            Creature vicine {nearbyCreatureCount}
          </div>
        )}
      </div>
      <div className="rounded-full border border-white/10 bg-[#17110f]/76 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#ddcec0] backdrop-blur-md">
        {sensitivitySummary}
      </div>
    </div>
  );
}

export function SettingsPanel({
  renderProfilePreference,
  onRenderProfilePreferenceChange,
  resolvedProfile,
  mouseSensitivity,
  touchSensitivity,
  joystickRadius,
  invertLook,
  reducedCameraMotion,
  hudMode,
  isMobile,
  onMouseSensitivityChange,
  onTouchSensitivityChange,
  onJoystickRadiusChange,
  onToggleInvertLook,
  onToggleReducedCameraMotion,
  onHudModeChange,
  ambienceVolume,
  ambienceMuted,
  onAmbienceVolumeChange,
  onToggleAmbienceMuted,
  fullscreen,
  onToggleFullscreen,
  onOpenGuide,
}: {
  renderProfilePreference: RenderProfilePreference;
  onRenderProfilePreferenceChange: (
    nextPreference: RenderProfilePreference,
  ) => void;
  resolvedProfile: ResolvedRenderProfile;
  mouseSensitivity: number;
  touchSensitivity: number;
  joystickRadius: number;
  invertLook: boolean;
  reducedCameraMotion: boolean;
  hudMode: HudMode;
  isMobile: boolean;
  onMouseSensitivityChange: (nextSensitivity: number) => void;
  onTouchSensitivityChange: (nextSensitivity: number) => void;
  onJoystickRadiusChange: (nextRadius: number) => void;
  onToggleInvertLook: () => void;
  onToggleReducedCameraMotion: () => void;
  onHudModeChange: (nextMode: HudMode) => void;
  ambienceVolume: number;
  ambienceMuted: boolean;
  onAmbienceVolumeChange: (nextVolume: number) => void;
  onToggleAmbienceMuted: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenGuide: () => void;
}) {
  return (
    <div className="pointer-events-auto absolute right-4 top-16 z-20 w-[min(26rem,calc(100%-2rem))] rounded-[1.9rem] border border-[#624f43] bg-[linear-gradient(180deg,_rgba(18,13,12,0.96),_rgba(10,8,8,0.94))] p-5 text-[#f6ede2] shadow-[0_32px_96px_rgba(0,0,0,0.46)] backdrop-blur-2xl">
      <div className="space-y-5">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#c9b29b]">
            Profilo di rendering
          </p>
          <div className="mt-2 flex items-center gap-3">
            <select
              value={renderProfilePreference}
              onChange={(event) =>
                onRenderProfilePreferenceChange(
                  event.target.value as RenderProfilePreference,
                )
              }
              className="w-full rounded-2xl border border-[#6a5748] bg-[#201713] px-3 py-2.5 text-sm text-[#f8efe3]"
            >
              <option value="auto">Auto</option>
              <option value="desktop_showcase">Desktop Showcase</option>
              <option value="desktop_balanced">Desktop Balanced</option>
              <option value="mobile_balanced">Mobile Balanced</option>
              <option value="mobile_safe">Mobile Safe</option>
            </select>
            <span className="rounded-full border border-[#6a5748] bg-[#201713] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-[#d9c5b1]">
              {resolvedProfile.label}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#d5c6b7]">
            {resolvedProfile.description}
          </p>
        </div>

        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#c9b29b]">
            Controlli
          </p>
          <div className="mt-3 space-y-3 text-sm text-[#f6ede2]">
            <label className="block">
              <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
                <span>Mouse</span>
                <span>{mouseSensitivity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={mouseSensitivity}
                onChange={(event) =>
                  onMouseSensitivityChange(Number(event.target.value))
                }
                className="mt-2 w-full accent-[#e5d3ba]"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
                <span>Look touch</span>
                <span>{touchSensitivity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.55"
                max="1.4"
                step="0.05"
                value={touchSensitivity}
                onChange={(event) =>
                  onTouchSensitivityChange(Number(event.target.value))
                }
                className="mt-2 w-full accent-[#e5d3ba]"
              />
            </label>

            {isMobile && (
              <label className="block">
                <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
                  <span>Raggio joystick</span>
                  <span>{Math.round(joystickRadius)}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="62"
                  step="1"
                  value={joystickRadius}
                  onChange={(event) =>
                    onJoystickRadiusChange(Number(event.target.value))
                  }
                  className="mt-2 w-full accent-[#e5d3ba]"
                />
              </label>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={onToggleInvertLook}
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {invertLook ? "Look invertito" : "Look normale"}
            </button>
            <button
              onClick={onToggleReducedCameraMotion}
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {reducedCameraMotion ? "Camera morbida" : "Camera piena"}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#c9b29b]">
            HUD e audio
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onHudModeChange(hudMode === "player" ? "debug" : "player")
              }
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              HUD {hudMode === "player" ? "player" : "debug"}
            </button>
            <button
              onClick={onToggleAmbienceMuted}
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {ambienceMuted ? "Riattiva audio" : "Muta audio"}
            </button>
          </div>
          <label className="mt-3 block">
            <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
              <span>Volume ambiente</span>
              <span>{Math.round(ambienceVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={ambienceVolume}
              onChange={(event) =>
                onAmbienceVolumeChange(Number(event.target.value))
              }
              className="mt-2 w-full accent-[#e5d3ba]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={onOpenGuide}
            className="rounded-full border border-[#665244] bg-[#1b1411] px-4 py-2.5 text-left text-[0.72rem] uppercase tracking-[0.14em] text-[#f4e8da]"
          >
            Riapri guida
          </button>
          <button
            onClick={onToggleFullscreen}
            className="rounded-full border border-[#665244] bg-[#1b1411] px-4 py-2.5 text-left text-[0.72rem] uppercase tracking-[0.14em] text-[#f4e8da]"
          >
            {fullscreen ? "Esci dal fullscreen" : "Entra in fullscreen"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function GuidePanel({
  descriptor,
  expanded,
  isMobile,
  onToggleExpanded,
  onHide,
}: {
  descriptor: GuideDescriptor | null;
  expanded: boolean;
  isMobile: boolean;
  onToggleExpanded: () => void;
  onHide: () => void;
}) {
  if (!descriptor) return null;
  const guideCopy = isMobile
    ? descriptor.compactLabel
    : expanded
      ? descriptor.body
      : descriptor.compactLabel;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`pointer-events-auto absolute z-20 ${
        isMobile
          ? "left-3 top-[4.75rem] w-[min(14.5rem,calc(100%-7.25rem))]"
          : "right-4 top-20 w-[min(27rem,calc(100%-8rem))]"
      }`}
    >
      <div className="rounded-[1.8rem] border border-[#715e4f] bg-[linear-gradient(180deg,_rgba(16,12,10,0.84),_rgba(10,8,8,0.74))] px-4 py-3.5 text-[#fdf5ea] shadow-[0_24px_72px_rgba(0,0,0,0.42)] backdrop-blur-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#e0c8ad]">
              Guida {descriptor.step}/{descriptor.total}
            </p>
            <h2
              className={`mt-1.5 font-light leading-tight text-[#fff8ef] ${
                isMobile ? "text-[1.05rem]" : "text-[1.45rem]"
              }`}
            >
              {descriptor.title}
            </h2>
            <p
              className={`mt-1.5 leading-relaxed text-[#f3e6d7] ${
                expanded
                  ? isMobile
                    ? "line-clamp-3"
                    : "block"
                  : "line-clamp-2"
              } ${isMobile ? "text-[0.76rem]" : "text-[0.9rem]"} ${
                !isMobile ? "max-w-[22rem]" : ""
              }`}
            >
              {guideCopy}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onToggleExpanded}
              className="rounded-full border border-[#7b6552] bg-[#211613]/92 px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff2e3] transition-colors hover:bg-[#2c1f18]"
            >
              {expanded ? "Riduci" : "Apri"}
            </button>
            <button
              onClick={onHide}
              className="rounded-full border border-[#7b6552] bg-[#211613]/92 px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff2e3] transition-colors hover:bg-[#2c1f18]"
            >
              Nascondi
            </button>
          </div>
        </div>

        {expanded && !isMobile && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {descriptor.hints.map((hint) => (
              <div
                key={hint}
                className="rounded-full border border-[#755f4d] bg-[#1a1310]/92 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.18em] text-[#fff0e0]"
              >
                {hint}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function GuideObjectivePill({
  descriptor,
  isMobile,
  onOpen,
}: {
  descriptor: GuideDescriptor | null;
  isMobile: boolean;
  onOpen: () => void;
}) {
  if (!descriptor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`pointer-events-auto absolute z-20 ${
        isMobile
          ? "left-1/2 top-[4.75rem] w-[min(15.5rem,calc(100%-2rem))] -translate-x-1/2"
          : "left-1/2 top-20 -translate-x-1/2"
      }`}
    >
      <div className="flex items-center gap-3 rounded-full border border-[#6b5849] bg-[linear-gradient(180deg,_rgba(16,12,10,0.84),_rgba(10,8,8,0.74))] px-4 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-[18px]">
        <div className="rounded-full border border-[#7b6552] bg-[#211613] px-2 py-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#eed8be]">
          {descriptor.step}/{descriptor.total}
        </div>
        <div className="min-w-0 flex-1 text-[0.82rem] text-[#fff6eb]">
          {descriptor.compactLabel}
        </div>
        {!isMobile && (
          <button
            onClick={onOpen}
            className="rounded-full border border-[#7b6552] bg-[#211613] px-3 py-1 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff2e3] transition-colors hover:bg-[#2c1f18]"
          >
            Apri
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function MobileActionLink() {
  return (
    <Link
      to="/offri"
      className="absolute right-4 top-14 z-20 rounded-full border border-[#ded2c2] bg-[linear-gradient(180deg,_rgba(244,236,226,0.94),_rgba(235,223,207,0.88))] px-4 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-[#261c15] shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      + Offri
    </Link>
  );
}
