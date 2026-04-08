import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { GuideDescriptor } from "@/components/cavapendo-gallery/runtime";
import {
  ZoneTransitionOverlay,
  GuidePanel,
  GuideObjectivePill,
  PlayerHud,
  DebugHud,
  SettingsPanel,
  MobileOrientationOverlay,
  MobileActionLink,
} from "@/components/cavapendo-gallery/overlays";
import type { ResolvedRenderProfile, RenderProfilePreference, HudMode, MobileOrientationState } from "@/components/cavapendo-gallery/runtime";

export interface GalleryHudProps {
  zone: "gallery" | "meadow";
  isMobile: boolean;
  hudMode: HudMode;
  guideStep: string;
  guideDescriptor: GuideDescriptor | null;
  guideHidden: boolean;
  guideExpanded: boolean;
  currentSectorDescriptor: { label: string } | null;
  visibleLandmarkLabel: string | null;
  ambienceLabel: string | null;
  nearbyCreatureDefinitions: Array<{ id: string }>;
  nearbyDeposit: { id: string } | null;
  nearbyTriggerLabel: string | null;
  mouseSensitivity: number;
  touchSensitivity: number;
  joystickRadius: number;
  playerPromptLabel: string | null;
  modalOpen: boolean;
  settingsOpen: boolean;
  sceneInterrupted: boolean;
  showOrientationOverlay: boolean;
  mobileOrientationState: MobileOrientationState;
  landscapeHintAcknowledged: boolean;
  guideCompleted: boolean;
  lastDepositSiteId: string | null;
  depositCounts: Record<string, number>;
  activeDepositId: string | null;
  ritualSiteId: string | null;
  selectedOffering: { id: string } | null;
  selectedCreatureId: string | null;
  activeCreature: { id: string; name: string; story: string; color: string } | null;
  activeRitualSite: { id: string; label: string; subtitle: string } | null;
  activeDeposit: { id: string; label: string; subtitle: string } | null;
  ambientCreatureCue: { id: string; label: string; caption: string } | null;
  showGuidePill: boolean;
  showGuideUi: boolean;
  zoneTransition: { label: string; detail: string; phase: "cover" | "opening" } | null;
  activeRenderProfile: ResolvedRenderProfile;
  renderProfilePreference: RenderProfilePreference;
  ambienceVolume: number;
  ambienceMuted: boolean;
  invertLook: boolean;
  reducedCameraMotion: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenGuide: () => void;
  onHideGuide: () => void;
  onToggleGuideExpanded: () => void;
  onDismissLandscapeHint: () => void;
  onSetRitualSiteId: (id: string | null) => void;
  onSetActiveDepositId: (id: string | null) => void;
  onSetSelectedOffering: (offering: { id: string } | null) => void;
  onSetSelectedCreatureId: (id: string | null) => void;
  onDepositSubmitted: (siteId: string) => void;
  onRenderProfilePreferenceChange: (preference: RenderProfilePreference) => void;
  onMouseSensitivityChange: (sensitivity: number) => void;
  onTouchSensitivityChange: (sensitivity: number) => void;
  onJoystickRadiusChange: (radius: number) => void;
  onToggleInvertLook: () => void;
  onToggleReducedCameraMotion: () => void;
  onHudModeChange: (mode: HudMode) => void;
  onAmbienceVolumeChange: (volume: number) => void;
  onToggleAmbienceMuted: () => void;
  onSetSettingsOpen: (open: boolean) => void;
}

export function GalleryHud(props: GalleryHudProps) {
  const { t } = useTranslation();
  const {
    zone,
    isMobile,
    hudMode,
    guideStep,
    guideDescriptor,
    guideHidden,
    guideExpanded,
    currentSectorDescriptor,
    visibleLandmarkLabel,
    ambienceLabel,
    nearbyCreatureDefinitions,
    nearbyDeposit,
    nearbyTriggerLabel,
    mouseSensitivity,
    touchSensitivity,
    joystickRadius,
    playerPromptLabel,
    modalOpen,
    settingsOpen,
    sceneInterrupted,
    showOrientationOverlay,
    mobileOrientationState,
    landscapeHintAcknowledged,
    guideCompleted,
    lastDepositSiteId,
    depositCounts,
    activeDepositId,
    ritualSiteId,
    selectedOffering,
    selectedCreatureId,
    activeCreature,
    activeRitualSite,
    activeDeposit,
    ambientCreatureCue,
    showGuidePill,
    showGuideUi,
    zoneTransition,
    activeRenderProfile,
    renderProfilePreference,
    ambienceVolume,
    ambienceMuted,
    invertLook,
    reducedCameraMotion,
    isFullscreen,
    onToggleFullscreen,
    onOpenGuide,
    onHideGuide,
    onToggleGuideExpanded,
    onDismissLandscapeHint,
    onSetRitualSiteId,
    onSetActiveDepositId,
    onSetSelectedOffering,
    onSetSelectedCreatureId,
    onDepositSubmitted,
    onRenderProfilePreferenceChange,
    onMouseSensitivityChange,
    onTouchSensitivityChange,
    onJoystickRadiusChange,
    onToggleInvertLook,
    onToggleReducedCameraMotion,
    onHudModeChange,
    onAmbienceVolumeChange,
    onToggleAmbienceMuted,
    onSetSettingsOpen,
  } = props;

  return (
    <>
      <ZoneTransitionOverlay transition={zoneTransition} />

      <AnimatePresence>
        {showGuideUi &&
          !isMobile &&
          !guideHidden &&
          guideDescriptor &&
          guideExpanded && (
            <GuidePanel
              descriptor={guideDescriptor}
              expanded={guideExpanded}
              isMobile={isMobile}
              onToggleExpanded={onToggleGuideExpanded}
              onHide={onHideGuide}
            />
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showGuidePill &&
          guideDescriptor &&
          (guideHidden || !guideExpanded || isMobile) && (
            <GuideObjectivePill
              descriptor={guideDescriptor}
              isMobile={isMobile}
              onOpen={() => {
                onOpenGuide();
              }}
            />
          )}
      </AnimatePresence>

      {hudMode === "player" &&
        showGuideUi &&
        (!guideDescriptor || guideHidden || !guideExpanded) && (
          <PlayerHud
            zoneLabel={t(zone === "gallery" ? "gallery.zoneInterior" : "gallery.zoneExterior")}
            sectorLabel={
              zone === "meadow" ? currentSectorDescriptor?.label || null : null
            }
            objectiveLabel={null}
            promptLabel={!modalOpen ? playerPromptLabel : null}
            landmarkLabel={zone === "gallery" ? visibleLandmarkLabel : null}
            ambienceLabel={ambienceLabel}
            creatureCount={nearbyCreatureDefinitions.length}
            depositReady={Boolean(nearbyDeposit)}
            isMobile={isMobile}
            showGuideButton={guideHidden}
            onOpenGuide={onOpenGuide}
          />
        )}
      {hudMode === "debug" && (
        <DebugHud
          zoneLabel={t(zone === "gallery" ? "gallery.zoneInterior" : "gallery.zoneExterior")}
          sectorLabel={currentSectorDescriptor?.label || null}
          renderProfile={activeRenderProfile.label}
          ambienceLabel={ambienceLabel}
          sensitivitySummary={`Mouse ${mouseSensitivity.toFixed(2)} • touch ${touchSensitivity.toFixed(2)} • joy ${Math.round(joystickRadius)}px`}
          nearbyTriggerLabel={
            nearbyTriggerLabel ? `Vicino a ${nearbyTriggerLabel}` : null
          }
          nearbyCreatureCount={nearbyCreatureDefinitions.length}
        />
      )}

      {!showOrientationOverlay && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-4 z-20 flex items-center gap-2"
        >
          <button
            onClick={() => onSetSettingsOpen(!settingsOpen)}
            className="pointer-events-auto rounded-full border border-[#7d6857] bg-[#17110f] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#fff7ea] shadow-[0_18px_46px_rgba(0,0,0,0.34)] hover:bg-[#281c17]"
          >
            Impostazioni
          </button>
          {!isMobile && (
            <Link
              to="/offri"
              className="pointer-events-auto rounded-full border border-[#f2e4d3] bg-[#f7efe4] px-4 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-[#221710] shadow-[0_18px_46px_rgba(0,0,0,0.24)]"
            >
              + Offri
            </Link>
          )}
        </motion.div>
      )}

      {settingsOpen && (
        <SettingsPanel
          renderProfilePreference={renderProfilePreference}
          onRenderProfilePreferenceChange={onRenderProfilePreferenceChange}
          resolvedProfile={activeRenderProfile}
          mouseSensitivity={mouseSensitivity}
          touchSensitivity={touchSensitivity}
          joystickRadius={joystickRadius}
          invertLook={invertLook}
          reducedCameraMotion={reducedCameraMotion}
          hudMode={hudMode}
          isMobile={isMobile}
          onMouseSensitivityChange={onMouseSensitivityChange}
          onTouchSensitivityChange={onTouchSensitivityChange}
          onJoystickRadiusChange={onJoystickRadiusChange}
          onToggleInvertLook={onToggleInvertLook}
          onToggleReducedCameraMotion={onToggleReducedCameraMotion}
          onHudModeChange={onHudModeChange}
          ambienceVolume={ambienceVolume}
          ambienceMuted={ambienceMuted}
          onAmbienceVolumeChange={onAmbienceVolumeChange}
          onToggleAmbienceMuted={onToggleAmbienceMuted}
          fullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          onOpenGuide={onOpenGuide}
        />
      )}

      <MobileOrientationOverlay
        orientationState={mobileOrientationState}
        onDismiss={onDismissLandscapeHint}
      />

      {!isMobile && !sceneInterrupted && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-foreground/45" />
        </div>
      )}

      <AnimatePresence>
        {lastDepositSiteId && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-full border border-[#816d5b] bg-[#130d0c]/94 px-4 py-2 text-sm italic text-[#fff3e6] backdrop-blur-xl"
          >
            Una cavapendolata è stata lasciata in {lastDepositSiteId}.
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!modalOpen && ambientCreatureCue && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-none absolute bottom-32 left-1/2 z-20 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2 rounded-3xl border border-[#816c58] bg-[#130d0c]/95 px-5 py-4 text-[#fff6eb] shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl"
          >
            <div className="font-mono-light text-[0.62rem] uppercase tracking-[0.18em] text-[#ebd0b3]">
              {ambientCreatureCue.label}
            </div>
            <div className="mt-1 text-sm leading-relaxed text-[#fff1e0]">
              {ambientCreatureCue.caption}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
