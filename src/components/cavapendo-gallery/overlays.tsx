import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  RENDER_PROFILE_OPTIONS,
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
  const { t } = useTranslation();
  const progress = Math.min(
    100,
    Math.max(12, (stageIndex / totalStages) * 100),
  );

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#110d0c] px-4">
      <div className="w-full max-w-xl rounded-[2rem] border border-[#4d3d32] bg-[radial-gradient(circle_at_top,_rgba(116,151,193,0.22),_rgba(20,15,12,0.96)_64%)] px-6 py-8 text-[#f3eadf] shadow-[0_28px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl">
        <div className="text-[0.68rem] uppercase tracking-[0.28em] text-[#ceb89f]">
          {t("gallery.preload.header")}
        </div>
        <h1 className="mt-3 text-3xl font-light tracking-[-0.03em] text-[#fbf5ec]">
          {t("gallery.preload.title")}
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#dbcfc0]">
          {t("gallery.preload.description")}
        </p>
        <div className="mt-6 rounded-full border border-[#5f4f43] bg-black/20 p-1">
          <div
            className="h-3 rounded-full bg-[linear-gradient(90deg,_#e7d0a6,_#92b5ff,_#e2f0cb)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 flex items-center justify-between gap-4 text-[0.72rem] uppercase tracking-[0.14em] text-[#c9b39c]">
          <span>
            {t("gallery.preload.stage", { index: stageIndex, total: totalStages })}
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
  const { t } = useTranslation();
  if (orientationState !== "portrait_hint") return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(198,223,255,0.26),_rgba(9,7,7,0.95)_64%)] px-5">
      <div className="w-full max-w-md rounded-[2.2rem] border border-[#8a6c59] bg-[linear-gradient(180deg,_rgba(27,20,17,0.98),_rgba(13,10,9,0.95))] p-6 text-[#fbf3e8] shadow-[0_36px_110px_rgba(0,0,0,0.56)] backdrop-blur-2xl">
        <div className="text-[0.68rem] uppercase tracking-[0.24em] text-[#dec5ab]">
          {t("gallery.mobileOrientation.header")}
        </div>
        <h2 className="mt-3 text-3xl font-light tracking-[-0.04em] text-[#fff9f0]">
          {t("gallery.mobileOrientation.title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#f0dfd1]">
          {t("gallery.mobileOrientation.description")}
        </p>
        <div className="mt-5 rounded-[1.5rem] border border-[#3c2f28] bg-[radial-gradient(circle_at_top,_rgba(145,185,255,0.14),_rgba(255,255,255,0.03)_58%)] p-4">
          <div className="grid grid-cols-2 gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-[#e6d8c9]">
            <div className="rounded-[1.25rem] border border-[#4a3a32] bg-[#1b1411] px-3 py-3 text-center">
              {t("gallery.mobileOrientation.left")}
              <div className="mt-2 text-[0.8rem] normal-case tracking-normal text-[#fff7ee]">
                {t("gallery.mobileOrientation.movement")}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-[#4a3a32] bg-[#1b1411] px-3 py-3 text-center">
              {t("gallery.mobileOrientation.right")}
              <div className="mt-2 text-[0.8rem] normal-case tracking-normal text-[#fff7ee]">
                {t("gallery.mobileOrientation.lookActions")}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 rounded-full border border-[#8b7461] bg-[#221915] px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-[#f6eadc]"
          >
            {t("gallery.mobileOrientation.continueAnyway")}
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 rounded-full bg-[linear-gradient(180deg,_#f6eee5,_#eadbc9)] px-4 py-3 text-[0.72rem] uppercase tracking-[0.18em] text-[#241913]"
          >
            {t("gallery.mobileOrientation.gotIt")}
          </button>
        </div>
      </div>
    </div>
  );
}

function TransitionLogo() {
  return (
    <svg
      viewBox="0 0 280 240"
      className="h-28 w-28 md:h-40 md:w-40"
      aria-hidden
    >
      <path
        d="M175 35c22 24 30 55 22 88-4 17-15 31-29 39 5 22-3 42-20 60-13 13-28 19-45 17 19-9 30-23 34-43 4-19 0-36-12-50-16-18-24-39-22-62 2-24 14-45 35-60 23-16 50-14 71 11Z"
        fill="#efe0cb"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <polygon
        points="115,92 146,68 186,74 198,108 167,127 132,117"
        fill="#d1c086"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <polygon
        points="102,129 129,108 159,133 143,163 111,156"
        fill="#b57452"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <polygon
        points="161,150 189,137 203,160 183,187 154,173"
        fill="#b9d2d6"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <ellipse
        cx="205"
        cy="84"
        rx="18"
        ry="18"
        fill="#fff9ef"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <circle cx="208" cy="84" r="5" fill="#1c130f" />
      <path
        d="M224 76l20-10-8 21"
        fill="#efe0cb"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <path
        d="M100 105l-26-8 16 25"
        fill="#d1c086"
        stroke="#1c130f"
        strokeWidth="4"
      />
      <circle cx="79" cy="215" r="11" fill="#b57452" />
      <path
        d="M84 214c-20-20-14-49 8-62"
        fill="none"
        stroke="#1c130f"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ZoneTransitionOverlay({
  transition,
}: {
  transition:
    | {
        label: string;
        detail: string;
        phase: "cover" | "opening";
      }
    | null;
}) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {transition && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 z-[55] overflow-hidden"
          aria-hidden
        >
          <motion.div
            initial={false}
            animate={{
              opacity: transition.phase === "cover" ? 0.8 : 0,
              scaleX: transition.phase === "cover" ? 0.68 : 2.1,
              scaleY: transition.phase === "cover" ? 0.42 : 1.3,
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-1/2 z-[15] h-56 w-[min(42rem,88vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#fff1dd]/28 bg-[radial-gradient(circle,_rgba(255,247,236,0.34),_rgba(255,247,236,0.08)_42%,_rgba(255,247,236,0)_72%)] blur-sm"
          />
          <motion.div
            animate={{
              opacity: transition.phase === "cover" ? 1 : 0,
              scale: transition.phase === "cover" ? 0.88 : 1.06,
            }}
            transition={{
              duration: transition.phase === "cover" ? 0.2 : 0.62,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(233,210,183,0.18),_rgba(8,6,5,0.97)_58%),linear-gradient(180deg,_rgba(20,16,13,0.96),_rgba(7,5,5,0.99))] px-4 text-[#fff7eb]"
          >
            <motion.div
              animate={{
                scale: transition.phase === "cover" ? 0.84 : 1.18,
                opacity: transition.phase === "cover" ? 0.28 : 0.08,
              }}
              transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-44 w-72 rounded-full border border-[#f0e1cc]/40 bg-[radial-gradient(circle,_rgba(255,241,222,0.24),_rgba(255,241,222,0)_70%)] blur-sm md:h-56 md:w-[34rem]"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-4 text-[0.68rem] uppercase tracking-[0.26em] text-[#dec7ac]">
                {t("gallery.zoneTransition.header")}
              </div>
              <TransitionLogo />
              <div className="mt-5 text-2xl font-light tracking-[0.22em] text-[#fff4e4] md:text-[2rem]">
                CAVAPENDOLI
              </div>
              <div className="mt-5 text-[0.7rem] uppercase tracking-[0.22em] text-[#ead7bf]">
                {transition.label}
              </div>
              <div className="mt-3 max-w-md text-center text-sm leading-relaxed text-[#f5e8d7] md:text-base">
                {transition.detail}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{
              y: transition.phase === "cover" ? "0%" : "-118%",
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-0 z-20 h-[53%] bg-[#080605] shadow-[0_22px_90px_rgba(0,0,0,0.5)]"
            style={{
              borderBottomLeftRadius: "50% 38%",
              borderBottomRightRadius: "50% 38%",
            }}
          />
          <motion.div
            initial={false}
            animate={{
              y: transition.phase === "cover" ? "0%" : "118%",
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 z-20 h-[53%] bg-[#080605] shadow-[0_-22px_90px_rgba(0,0,0,0.5)]"
            style={{
              borderTopLeftRadius: "50% 38%",
              borderTopRightRadius: "50% 38%",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
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
  const { t } = useTranslation();
  return (
    <>
      <div
        className={`pointer-events-none absolute left-4 z-20 flex flex-col gap-2.5 ${
          isMobile
            ? "top-4 max-w-[min(13.5rem,calc(100%-8.75rem))]"
            : "top-4 max-w-[min(21rem,calc(100%-6.5rem))]"
        }`}
      >
        <div className="rounded-[1.5rem] border border-[#8a735f] bg-[linear-gradient(180deg,_rgba(18,13,11,0.95),_rgba(11,8,7,0.92))] px-4 py-3 text-[#fff8f0] shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-[18px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#a58b73] bg-[#2c201a] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#ffeed5]">
              {zoneLabel}
            </span>
            {sectorLabel && (
              <span className="rounded-full border border-[#6f8661] bg-[#1f2a1c] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#f4ffe8]">
                {sectorLabel}
              </span>
            )}
          </div>
          {objectiveLabel && (
            <>
              <div className="mt-2.5 text-[0.58rem] uppercase tracking-[0.22em] text-[#ecd2b3]">
                {t("gallery.playerHud.currentObjective")}
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
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[0.58rem] uppercase tracking-[0.16em] text-[#f6ebdb]">
            {landmarkLabel && (
              <span className="rounded-full border border-[#6f5d50] bg-[#171110] px-2.5 py-1 text-[#fff1e2]">
                {t("gallery.playerHud.lookAt", { label: landmarkLabel })}
              </span>
            )}
            {ambienceLabel && (
              <span className="rounded-full border border-[#6f5d50] bg-[#171110] px-2.5 py-1 text-[#fff1e2]">
                {ambienceLabel}
              </span>
            )}
            {depositReady && (
              <span className="rounded-full border border-[#b08c52] bg-[#3d2b16] px-2.5 py-1 text-[#fff0bc]">
                {t("gallery.playerHud.ritualPlace")}
              </span>
            )}
          </div>
        </div>

        {!isMobile && showGuideButton && (
          <button
            onClick={onOpenGuide}
            className="pointer-events-auto inline-flex w-fit items-center rounded-full border border-[#7e6956] bg-[#130d0c]/92 px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-[#fff5e8] shadow-[0_14px_34px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-colors hover:bg-[#281b16]"
          >
            {t("gallery.playerHud.reopenNote")}
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
            <div className="rounded-full border border-[#b59a78] bg-[linear-gradient(180deg,_rgba(18,13,12,0.96),_rgba(9,7,7,0.94))] px-5 py-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#fff9f0] shadow-[0_18px_44px_rgba(0,0,0,0.38)] backdrop-blur-xl">
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
  const { t } = useTranslation();
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
              className="rounded-full border border-[#655447] bg-[#16110f]/88 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#f2e6d7] backdrop-blur-md"
            >
              {item}
            </div>
          ))}
        {nearbyCreatureCount > 0 && (
          <div className="rounded-full border border-[#655447] bg-[#16110f]/88 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#f2e6d7] backdrop-blur-md">
            {t("gallery.debugHud.nearbyCreatures", { count: nearbyCreatureCount })}
          </div>
        )}
      </div>
      <div className="rounded-full border border-[#655447] bg-[#16110f]/88 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[#f2e6d7] backdrop-blur-md">
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
  const { t } = useTranslation();
  return (
    <div
      className="pointer-events-auto absolute right-4 top-16 z-20 w-[min(26rem,calc(100%-2rem))] rounded-[1.9rem] border border-[#624f43] bg-[linear-gradient(180deg,_rgba(18,13,12,0.96),_rgba(10,8,8,0.94))] p-5 text-[#f6ede2] shadow-[0_32px_96px_rgba(0,0,0,0.46)] backdrop-blur-2xl"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="space-y-5">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#c9b29b]">
            {t("gallery.settings.renderProfile")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {RENDER_PROFILE_OPTIONS.map((option) => {
              const selected = renderProfilePreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onRenderProfilePreferenceChange(option.value)}
                  className={
                    selected
                      ? "rounded-[1.45rem] border border-[#d3bea8] bg-[#f3eadf] px-3 py-2.5 text-left text-[0.76rem] uppercase tracking-[0.16em] text-[#241913] shadow-[0_10px_28px_rgba(0,0,0,0.2)]"
                      : "rounded-[1.45rem] border border-[#6a5748] bg-[#201713] px-3 py-2.5 text-left text-[0.76rem] uppercase tracking-[0.16em] text-[#efe1d1] hover:bg-[#2a1e19]"
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[0.68rem] uppercase tracking-[0.14em] text-[#c9b29b]">
              {t("gallery.settings.activeNow")}
            </span>
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
            {t("gallery.settings.controls")}
          </p>
          <div className="mt-3 space-y-3 text-sm text-[#f6ede2]">
            <label className="block">
              <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
                <span>{t("gallery.settings.mouse")}</span>
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
                <span>{t("gallery.settings.lookTouch")}</span>
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
                  <span>{t("gallery.settings.joystickRadius")}</span>
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
              {invertLook ? t("gallery.settings.invertedLook") : t("gallery.settings.normalLook")}
            </button>
            <button
              onClick={onToggleReducedCameraMotion}
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {reducedCameraMotion ? t("gallery.settings.softCamera") : t("gallery.settings.fullCamera")}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[#c9b29b]">
            {t("gallery.settings.hudAudio")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                onHudModeChange(hudMode === "player" ? "debug" : "player")
              }
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {t("gallery.settings.hudMode", { mode: hudMode === "player" ? "player" : "debug" })}
            </button>
            <button
              onClick={onToggleAmbienceMuted}
              className="rounded-full border border-[#665244] bg-[#1b1411] px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-[#f4e8da]"
            >
              {ambienceMuted ? t("gallery.settings.unmuteAudio") : t("gallery.settings.muteAudio")}
            </button>
          </div>
          <label className="mt-3 block">
            <div className="flex items-center justify-between text-[0.72rem] uppercase tracking-[0.14em] text-[#d6c5b4]">
              <span>{t("gallery.settings.ambienceVolume")}</span>
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
            {t("gallery.settings.reopenGuide")}
          </button>
          <button
            onClick={onToggleFullscreen}
            className="rounded-full border border-[#665244] bg-[#1b1411] px-4 py-2.5 text-left text-[0.72rem] uppercase tracking-[0.14em] text-[#f4e8da]"
          >
            {fullscreen ? t("gallery.settings.exitFullscreen") : t("gallery.settings.enterFullscreen")}
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
  const { t } = useTranslation();
  if (!descriptor) return null;
  const translatedTitle = isMobile
    ? t(`gallery.guide.steps.${descriptor.stepKey}.titleMobile`)
    : t(`gallery.guide.steps.${descriptor.stepKey}.titleDesktop`);
  const translatedBody = isMobile
    ? t(`gallery.guide.steps.${descriptor.stepKey}.bodyMobile`)
    : t(`gallery.guide.steps.${descriptor.stepKey}.bodyDesktop`);
  const translatedHints = isMobile
    ? [
        t(`gallery.guide.steps.${descriptor.stepKey}.hint1Mobile`),
        t(`gallery.guide.steps.${descriptor.stepKey}.hint2Mobile`),
        t(`gallery.guide.steps.${descriptor.stepKey}.hint3Mobile`),
      ]
    : [
        t(`gallery.guide.steps.${descriptor.stepKey}.hint1Desktop`),
        t(`gallery.guide.steps.${descriptor.stepKey}.hint2Desktop`),
        t(`gallery.guide.steps.${descriptor.stepKey}.hint3Desktop`),
      ];
  const translatedCompactLabel = t(`gallery.guide.steps.${descriptor.stepKey}.compactLabel`);
  const guideCopy = isMobile
    ? translatedCompactLabel
    : expanded
      ? translatedBody
      : translatedCompactLabel;

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
      <div className="rounded-[1.8rem] border border-[#876f5d] bg-[linear-gradient(180deg,_rgba(16,12,10,0.95),_rgba(10,8,8,0.92))] px-4 py-3.5 text-[#fff8ef] shadow-[0_24px_72px_rgba(0,0,0,0.46)] backdrop-blur-[18px]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#efd3b4]">
              {t("gallery.guide.fieldNote")}
            </p>
            <h2
              className={`mt-1.5 font-light leading-tight text-[#fff8ef] ${
                isMobile ? "text-[1.05rem]" : "text-[1.45rem]"
              }`}
            >
              {translatedTitle}
            </h2>
            <p
              className={`mt-1.5 leading-relaxed text-[#fff1e1] ${
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
              className="rounded-full border border-[#8e7560] bg-[#241814] px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff6e9] transition-colors hover:bg-[#32221b]"
            >
              {expanded ? t("gallery.guide.close") : t("gallery.guide.open")}
            </button>
            <button
              onClick={onHide}
              className="rounded-full border border-[#8e7560] bg-[#241814] px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff6e9] transition-colors hover:bg-[#32211b]"
            >
              {t("gallery.guide.hide")}
            </button>
          </div>
        </div>

        {expanded && !isMobile && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {translatedHints.map((hint, i) => (
              <div
                key={i}
                className="rounded-full border border-[#896f58] bg-[#1a1310] px-3 py-1.5 text-[0.58rem] uppercase tracking-[0.18em] text-[#fff4e4]"
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
  const { t } = useTranslation();
  if (!descriptor) return null;
  const translatedCompactLabel = t(`gallery.guide.steps.${descriptor.stepKey}.compactLabel`);

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
      <div className="flex items-center gap-3 rounded-full border border-[#806958] bg-[linear-gradient(180deg,_rgba(16,12,10,0.95),_rgba(10,8,8,0.92))] px-4 py-2 shadow-[0_18px_48px_rgba(0,0,0,0.38)] backdrop-blur-[18px]">
        <div className="min-w-0 flex-1 text-[0.82rem] text-[#fff8ee]">
          {translatedCompactLabel}
        </div>
        {!isMobile && (
          <button
            onClick={onOpen}
            className="rounded-full border border-[#8e7560] bg-[#241814] px-3 py-1 text-[0.56rem] uppercase tracking-[0.18em] text-[#fff6e9] transition-colors hover:bg-[#32221b]"
          >
            {t("gallery.guide.note")}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function MobileActionLink() {
  const { t } = useTranslation();
  return (
    <Link
      to="/offri"
      className="absolute right-4 top-14 z-20 rounded-full border border-[#ded2c2] bg-[linear-gradient(180deg,_rgba(244,236,226,0.94),_rgba(235,223,207,0.88))] px-4 py-2 text-[0.58rem] uppercase tracking-[0.18em] text-[#261c15] shadow-[0_12px_28px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      {t("gallery.actions.offer")}
    </Link>
  );
}
