import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import * as THREE from "three";
import {
  CREATURES,
  DEPOSIT_SITES,
  DEMO_OFFERINGS,
  DOOR_LABELS,
  EYE_HEIGHT,
  GALLERY_DOORS,
  GALLERY_SPAWN,
  UP_VECTOR,
} from "@/components/cavapendo-gallery/config";
import { useAmbientAudio } from "@/components/cavapendo-gallery/audio";
import {
  RenderProfileGuardian,
  VirtualJoystick,
  WorldController,
} from "@/components/cavapendo-gallery/gameplay";
import {
  CreatureModal,
  DepositModal,
  OfferingModal,
  RitualPrompt,
} from "@/components/cavapendo-gallery/modals";
import {
  DebugHud,
  GuideObjectivePill,
  GuidePanel,
  MobileActionLink,
  MobileOrientationOverlay,
  PlayerHud,
  SettingsPanel,
  ZoneTransitionOverlay,
} from "@/components/cavapendo-gallery/overlays";
import {
  MeadowScene as PremiumMeadowScene,
} from "@/components/cavapendo-gallery/meadow-scene";
import {
  type ControlProfile,
  type GuideStep,
  type HudMode,
  type MeadowSector,
  type MobileControlsLayout,
  type MobileOrientationState,
  type QualityTier,
  type RenderProfile,
  type RenderProfilePreference,
  type ResolvedRenderProfile,
  type ViewportMetrics,
  type WorldZone,
  getAutoDowngradeFloor,
  getControlProfile,
  getDeviceClass,
  getGuideDescriptor,
  getRenderProfileSource,
  getResolvedRenderProfile,
  usePersistedFlag,
  usePersistedHudMode,
  usePersistedNumber,
  usePersistedPreference,
  useResolvedRenderProfile,
  useViewportMetrics,
  GUIDE_COMPLETED_STORAGE_KEY,
  MOBILE_LANDSCAPE_HINT_STORAGE_KEY,
  AMBIENCE_MUTED_STORAGE_KEY,
  AMBIENCE_VOLUME_STORAGE_KEY,
  DEFAULT_JOYSTICK_RADIUS,
  DEFAULT_MOUSE_SENSITIVITY,
  DEFAULT_TOUCH_SENSITIVITY,
  TOUCH_SENSITIVITY_STORAGE_KEY,
  HUD_MODE_STORAGE_KEY,
  INVERT_LOOK_STORAGE_KEY,
  JOYSTICK_RADIUS_STORAGE_KEY,
  MOUSE_SENSITIVITY_STORAGE_KEY,
  REDUCED_CAMERA_MOTION_STORAGE_KEY,
  RENDER_PROFILE_STORAGE_KEY,
} from "@/components/cavapendo-gallery/runtime";
import {
  type DepositSite,
  type DoorTrigger,
  type InteractionTarget,
  type JoystickInput,
  type MeadowDebugPose,
  type MeadowCreatureRuntimeSnapshot,
  type Offering,
  type WorldStateSnapshot,
} from "@/components/cavapendo-gallery/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import {
  MEADOW_CREATURES,
  MEADOW_DOORS,
  MEADOW_LANDMARKS,
  MEADOW_PLANET_RADIUS,
  MEADOW_SECTORS,
  MEADOW_SKYLINE_LANDMARKS,
  MEADOW_SPAWN,
  type MeadowCreatureDefinition,
} from "@/lib/meadowWorld";
import { withSignedFileUrls } from "@/lib/offeringMedia";
import { useGalleryController } from "@/features/gallery/hooks/useGalleryController";
import { useGalleryData } from "@/features/gallery/hooks/useGalleryData";
import { GalleryHud } from "@/features/gallery/components/GalleryHud";
import { GalleryCanvas } from "@/features/gallery/components/GalleryCanvas";

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

type FullscreenTarget = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const getActiveFullscreenElement = (ownerDocument: Document = document) => {
  const fullscreenDocument = ownerDocument as FullscreenDocument;
  return (
    ownerDocument.fullscreenElement ||
    fullscreenDocument.webkitFullscreenElement ||
    null
  );
};

const requestElementFullscreen = async (element: HTMLElement) => {
  const fullscreenTarget = element as FullscreenTarget;
  if (fullscreenTarget.requestFullscreen) {
    await fullscreenTarget.requestFullscreen();
    return;
  }
  if (fullscreenTarget.webkitRequestFullscreen) {
    await fullscreenTarget.webkitRequestFullscreen();
  }
};

const exitElementFullscreen = async (ownerDocument: Document = document) => {
  const fullscreenDocument = ownerDocument as FullscreenDocument;
  if (ownerDocument.exitFullscreen) {
    await ownerDocument.exitFullscreen();
    return;
  }
  if (fullscreenDocument.webkitExitFullscreen) {
    await fullscreenDocument.webkitExitFullscreen();
  }
};

function CavapendoGallery({
  className = "",
  onExit,
}: {
  className?: string;
  onExit?: () => void;
}) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const keysDownRef = useRef(new Set<string>());
  const interactRequestedRef = useRef(false);
  const joystickRef = useRef<JoystickInput>({
    moveX: 0,
    moveZ: 0,
    lookX: 0,
    lookY: 0,
  });
  const jumpRequestedRef = useRef(false);
  const stepRef = useRef<(deltaSeconds: number) => void>(() => undefined);
  const stepReadyRef = useRef(false);
  const stepWaitersRef = useRef<Array<() => void>>([]);
  const meadowDebugPoseRef = useRef<((pose: MeadowDebugPose) => void) | null>(
    null,
  );
  const meadowCreatureRuntimeRef = useRef<
    Record<string, MeadowCreatureRuntimeSnapshot>
  >({});
  const creatureCueCooldownRef = useRef<Record<string, number>>({});
  const zoneTransitionTimersRef = useRef<number[]>([]);
  const snapshotRef = useRef<WorldStateSnapshot>({
    zone: "gallery",
    sector: null,
    deviceClass: "desktop",
    renderProfile: "desktop_balanced",
    resolvedRenderProfile: "desktop_balanced",
    renderProfilePreference: "auto",
    renderProfileSource: "auto",
    renderProfileAutoFloor: "desktop_balanced",
    renderProfileReason: "desktop_auto_default",
    profileLocked: true,
    quality: "medium",
    hudMode: "player",
    mouseSensitivity: DEFAULT_MOUSE_SENSITIVITY,
    touchSensitivity: DEFAULT_TOUCH_SENSITIVITY,
    joystickRadius: DEFAULT_JOYSTICK_RADIUS,
    mouseLookSensitivity: DEFAULT_MOUSE_SENSITIVITY,
    touchLookSensitivity: DEFAULT_TOUCH_SENSITIVITY * 0.62,
    fullscreen: false,
    guideStep: "intro",
    outdoorRadius: MEADOW_PLANET_RADIUS,
    mobileOrientationState: "desktop",
    controlsLayout: "desktop",
    viewport: {
      width: 0,
      height: 0,
      dpr: 1,
      context: "embedded",
      fullscreen: false,
    },
    modal: { type: "none", id: null },
    nearbyTriggerId: null,
    nearbyDepositId: null,
    nearbyCreatureIds: [],
    visibleLandmarkIds: [],
    horizonLandmarkIds: [],
    doorPrompt: null,
    ambience: {
      activeCues: [],
      muted: false,
      volume: 0.72,
      zone: "gallery",
      galleryTrack: null,
      transition: {
        cue: null,
        active: false,
      },
    },
    player: {
      x: GALLERY_SPAWN.position.x,
      y: GALLERY_SPAWN.position.y,
      z: GALLERY_SPAWN.position.z,
      yaw: GALLERY_SPAWN.yaw,
      pitch: GALLERY_SPAWN.pitch,
      vy: 0,
      grounded: true,
    },
  });

  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(
    null,
  );
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
  const [ritualSiteId, setRitualSiteId] = useState<string | null>(null);
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [depositCounts, setDepositCounts] = useState<Record<string, number>>(
    {},
  );
  const [lastDepositSiteId, setLastDepositSiteId] = useState<string | null>(
    null,
  );
  const [ambientCreatureCue, setAmbientCreatureCue] = useState<{
    id: string;
    label: string;
    caption: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasEncounteredMeadowCreature, setHasEncounteredMeadowCreature] =
    useState(false);
  const [meadowArrivalAcknowledged, setMeadowArrivalAcknowledged] =
    useState(false);
  const [guideCompleted, setGuideCompleted] = usePersistedFlag(
    GUIDE_COMPLETED_STORAGE_KEY,
    false,
  );
  const [landscapeHintAcknowledged, setLandscapeHintAcknowledged] =
    usePersistedFlag(MOBILE_LANDSCAPE_HINT_STORAGE_KEY, false);
  const [guideHidden, setGuideHidden] = useState(guideCompleted);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const previousGuideStepRef = useRef<GuideStep>("intro");
  const [nearbyTriggerId, setNearbyTriggerId] = useState<
    DoorTrigger["id"] | null
  >(null);
  const [nearbyDepositId, setNearbyDepositId] = useState<
    DepositSite["id"] | null
  >(null);
  const [nearbyCreatureIds, setNearbyCreatureIds] = useState<string[]>([]);
  const [visibleLandmarkIds, setVisibleLandmarkIds] = useState<string[]>([]);
  const [horizonLandmarkIds, setHorizonLandmarkIds] = useState<string[]>([]);
  const [currentSector, setCurrentSector] = useState<MeadowSector | null>(null);
  const [zoneTransition, setZoneTransition] = useState<{
    label: string;
    detail: string;
    phase: "cover" | "opening";
  } | null>(null);
  const [mouseSensitivity, setMouseSensitivity] = usePersistedNumber(
    MOUSE_SENSITIVITY_STORAGE_KEY,
    DEFAULT_MOUSE_SENSITIVITY,
  );
  const [touchSensitivity, setTouchSensitivity] = usePersistedNumber(
    TOUCH_SENSITIVITY_STORAGE_KEY,
    DEFAULT_TOUCH_SENSITIVITY,
  );
  const [joystickRadius, setJoystickRadius] = usePersistedNumber(
    JOYSTICK_RADIUS_STORAGE_KEY,
    DEFAULT_JOYSTICK_RADIUS,
  );
  const [ambienceVolume, setAmbienceVolume] = usePersistedNumber(
    AMBIENCE_VOLUME_STORAGE_KEY,
    0.72,
  );
  const [ambienceMuted, setAmbienceMuted] = usePersistedFlag(
    AMBIENCE_MUTED_STORAGE_KEY,
    false,
  );
  const [invertLook, setInvertLook] = usePersistedFlag(
    INVERT_LOOK_STORAGE_KEY,
    false,
  );
  const [reducedCameraMotion, setReducedCameraMotion] = usePersistedFlag(
    REDUCED_CAMERA_MOTION_STORAGE_KEY,
    Boolean(reduceMotion),
  );
  const [hudMode, setHudMode] = usePersistedHudMode(
    HUD_MODE_STORAGE_KEY,
    "player",
  );
  const [renderProfilePreference, setRenderProfilePreference] =
    usePersistedPreference(RENDER_PROFILE_STORAGE_KEY, "auto");
  const deviceClass = getDeviceClass(isMobile);
  const viewport = useViewportMetrics(wrapperRef);
  const resolvedPreferredProfile = useResolvedRenderProfile(
    deviceClass,
    reduceMotion || reducedCameraMotion,
    renderProfilePreference,
  );
  const [activeRenderProfileId, setActiveRenderProfileId] =
    useState<RenderProfile>(resolvedPreferredProfile.id);
  const activeRenderProfile = useMemo(
    () => getResolvedRenderProfile(activeRenderProfileId),
    [activeRenderProfileId],
  );
  const renderProfileSource = useMemo(
    () =>
      getRenderProfileSource({
        preference: renderProfilePreference,
        resolvedProfile: resolvedPreferredProfile.id,
        activeProfile: activeRenderProfileId,
      }),
    [
      activeRenderProfileId,
      renderProfilePreference,
      resolvedPreferredProfile.id,
    ],
  );
  const autoDowngradeFloor = useMemo(
    () => getAutoDowngradeFloor(deviceClass),
    [deviceClass],
  );
  const renderProfileReason = useMemo(() => {
    if (renderProfilePreference !== "auto") return "manual_selection";
    if (activeRenderProfileId === resolvedPreferredProfile.id) {
      return deviceClass === "desktop"
        ? "desktop_auto_default"
        : "mobile_auto_default";
    }
    return deviceClass === "desktop"
      ? "runtime_slow_windows_desktop_floor_desktop_balanced"
      : `runtime_slow_windows_mobile_floor_${autoDowngradeFloor}`;
  }, [
    activeRenderProfileId,
    autoDowngradeFloor,
    deviceClass,
    renderProfilePreference,
    resolvedPreferredProfile.id,
  ]);
  const quality = activeRenderProfile.tier;
  const controlProfile = useMemo(
    () =>
      getControlProfile({
        deviceClass,
        mouseSensitivity,
        touchSensitivity,
        viewport,
        joystickRadius,
        invertLook,
        reducedCameraMotion,
      }),
    [
      deviceClass,
      invertLook,
      joystickRadius,
      mouseSensitivity,
      reducedCameraMotion,
      touchSensitivity,
      viewport,
    ],
  );
  const [profileShiftLocked, setProfileShiftLocked] = useState(true);
  const automationProfileLock =
    typeof navigator !== "undefined" &&
    Boolean((navigator as Navigator & { webdriver?: boolean }).webdriver);
  const mobileOrientationState = useMemo<MobileOrientationState>(() => {
    if (!isMobile) return "desktop";
    if (viewport.width >= viewport.height) return "landscape";
    return landscapeHintAcknowledged ? "portrait_dismissed" : "portrait_hint";
  }, [
    isMobile,
    landscapeHintAcknowledged,
    viewport.height,
    viewport.width,
  ]);
  const controlsLayout = useMemo<MobileControlsLayout>(() => {
    if (!isMobile) return "desktop";
    return viewport.width >= viewport.height
      ? "mobile_landscape"
      : "mobile_portrait";
  }, [isMobile, viewport.height, viewport.width]);
  const showOrientationOverlay =
    isMobile && mobileOrientationState === "portrait_hint";

  const [zone, setZone] = useState<WorldZone>("gallery");

  useEffect(() => {
    setActiveRenderProfileId(resolvedPreferredProfile.id);
  }, [resolvedPreferredProfile.id]);

  const activeCreature =
    CREATURES.find((creature) => creature.id === selectedCreatureId) || null;
  const activeRitualSite =
    DEPOSIT_SITES.find((site) => site.id === ritualSiteId) || null;
  const activeDeposit =
    DEPOSIT_SITES.find((site) => site.id === activeDepositId) || null;
  const nearbyDeposit =
    DEPOSIT_SITES.find((site) => site.id === nearbyDepositId) || null;
  const nearbyCreatureDefinitions = nearbyCreatureIds
    .map((creatureId) =>
      MEADOW_CREATURES.find((creature) => creature.id === creatureId),
    )
    .filter(Boolean) as MeadowCreatureDefinition[];
  const currentSectorDescriptor =
    MEADOW_SECTORS.find((sector) => sector.id === currentSector) || null;
  const visibleLandmarkLabel =
    MEADOW_LANDMARKS.find((landmark) =>
      visibleLandmarkIds.includes(landmark.id),
    )?.label || null;
  const modalOpen = Boolean(
    selectedOffering || selectedCreatureId || ritualSiteId || activeDepositId,
  );
  const sceneInterrupted =
    modalOpen || settingsOpen || showOrientationOverlay || Boolean(zoneTransition);
  const showGuideUi = !sceneInterrupted;
  const ambienceState = useAmbientAudio({
    enabled: hasInteracted,
    zone,
    sector: currentSector,
    nearbyTriggerId,
    nearbyDepositId,
    volume: ambienceVolume,
    muted: ambienceMuted,
    renderProfileId: activeRenderProfile.id,
  });

  const guideStep = useMemo<GuideStep>(() => {
    if (guideCompleted || lastDepositSiteId) return "complete";
    if (zone === "gallery") return hasInteracted ? "find-outdoor" : "intro";
    if (!meadowArrivalAcknowledged) return "arrive-globe";
    if (!hasEncounteredMeadowCreature) return "meet-creatures";
    if (nearbyDepositId || ritualSiteId || activeDepositId)
      return "deposit-ready";
    return "find-deposit";
  }, [
    activeDepositId,
    guideCompleted,
    hasEncounteredMeadowCreature,
    hasInteracted,
    lastDepositSiteId,
    meadowArrivalAcknowledged,
    nearbyDepositId,
    ritualSiteId,
    zone,
  ]);
  const guideDescriptor = useMemo(
    () => getGuideDescriptor(guideStep, isMobile),
    [guideStep, isMobile],
  );
  const nearbyTriggerLabel = nearbyTriggerId
    ? DOOR_LABELS[nearbyTriggerId]
    : null;
  const doorPromptLabel = useMemo(() => {
    if (!nearbyTriggerId || modalOpen) return null;
    if (nearbyTriggerId === "outdoor") return "Varco · ESTERNO";
    if (nearbyTriggerId === "return") return "Rientro · GALLERIA";
    return "Soglia · USCITA";
  }, [modalOpen, nearbyTriggerId]);
  const ritualPromptLabel =
    zone === "meadow" && nearbyDeposit && !modalOpen
      ? `Sosta rituale · ${nearbyDeposit.label}`
      : null;
  const playerPromptLabel = ritualPromptLabel || doorPromptLabel;
  const mobileControlsLandscape = controlsLayout === "mobile_landscape";
  const mobilePrimaryAction = useMemo(() => {
    if (modalOpen) return null;
    if (zone === "meadow" && nearbyDeposit) {
      return {
        label: "Apri rito",
        detail: nearbyDeposit.label,
      };
    }
    return null;
  }, [modalOpen, nearbyDeposit, zone]);
  const ambienceLabel =
    !ambienceMuted && ambienceState.activeCues.length > 0
      ? `Ambiente ${ambienceState.activeCues.length > 1 ? "vivo" : "attivo"}`
      : null;
  const showGuidePill =
    showGuideUi &&
    Boolean(guideDescriptor) &&
    (zone === "gallery" ||
      Boolean(nearbyDeposit) ||
      Boolean(ritualSiteId) ||
      Boolean(activeDepositId));

  const { data: liveOfferings } = useGalleryData({ quality });

  const offerings = useMemo(() => {
    const source =
      liveOfferings && liveOfferings.length > 0
        ? liveOfferings
        : DEMO_OFFERINGS;
    const visibleCount =
      quality === "high" ? 18 : quality === "medium" ? 14 : 10;
    return source.slice(0, visibleCount);
  }, [liveOfferings, quality]);

  const revealMeadowCreature = useCallback((creatureId: string) => {
    const creature = MEADOW_CREATURES.find((entry) => entry.id === creatureId);
    if (!creature) return;
    setHasEncounteredMeadowCreature(true);
    setAmbientCreatureCue({
      id: creature.id,
      label: creature.label,
      caption: creature.caption,
    });
    creatureCueCooldownRef.current[creatureId] = Date.now() + 6500;
  }, []);

  const handleActivity = useCallback(() => {
    wrapperRef.current?.focus();
    setHasInteracted(true);
    if (!guideCompleted && guideExpanded) {
      setGuideExpanded(false);
    }
  }, [guideCompleted, guideExpanded]);

  const clearZoneTransitionTimers = useCallback(() => {
    zoneTransitionTimersRef.current.forEach((timer) =>
      window.clearTimeout(timer),
    );
    zoneTransitionTimersRef.current = [];
  }, []);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const focusWrapper = () => wrapper.focus();
    focusWrapper();
    const frameId = window.requestAnimationFrame(focusWrapper);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => () => clearZoneTransitionTimers(), [clearZoneTransitionTimers]);

  useEffect(() => {
    if (zone !== "meadow") {
      setAmbientCreatureCue(null);
      return;
    }
    setMeadowArrivalAcknowledged(false);
    const timer = window.setTimeout(() => {
      setMeadowArrivalAcknowledged(true);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [zone]);

  useEffect(() => {
    if (!ambientCreatureCue) return;
    const timer = window.setTimeout(() => setAmbientCreatureCue(null), 4200);
    return () => window.clearTimeout(timer);
  }, [ambientCreatureCue]);

  useEffect(() => {
    if (zone !== "meadow" || nearbyCreatureIds.length === 0) return;
    const candidate = nearbyCreatureIds.find((creatureId) => {
      const cooldown = creatureCueCooldownRef.current[creatureId] || 0;
      return cooldown < Date.now();
    });
    if (!candidate) return;
    revealMeadowCreature(candidate);
  }, [nearbyCreatureIds, revealMeadowCreature, zone]);

  useEffect(() => {
    if (automationProfileLock) {
      setProfileShiftLocked(true);
      return;
    }
    setProfileShiftLocked(true);
    const timer = window.setTimeout(
      () => {
        setProfileShiftLocked(false);
      },
      zone === "meadow" ? 2200 : 1200,
    );
    return () => window.clearTimeout(timer);
  }, [automationProfileLock, zone]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.code)
      ) {
        event.preventDefault();
        keysDownRef.current.add(event.code);
        handleActivity();
      }

      if (event.code === "Space") {
        event.preventDefault();
        jumpRequestedRef.current = true;
        handleActivity();
      }

      if (event.code === "Enter" || event.code === "KeyE") {
        event.preventDefault();
        interactRequestedRef.current = true;
        handleActivity();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysDownRef.current.delete(event.code);
    };

    const handleBlur = () => {
      keysDownRef.current.clear();
      jumpRequestedRef.current = false;
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [handleActivity]);

  const handleDoorTrigger = useCallback(
    (id: DoorTrigger["id"]) => {
      if (zoneTransition) return;

      if (id === "exit") {
        onExit?.();
        return;
      }

      const resetInputs = () => {
        keysDownRef.current.clear();
        interactRequestedRef.current = false;
        jumpRequestedRef.current = false;
        joystickRef.current = {
          moveX: 0,
          moveZ: 0,
          lookX: 0,
          lookY: 0,
        };
      };

      const startTransition = (
        nextZone: WorldZone,
        label: string,
        detail: string,
      ) => {
        clearZoneTransitionTimers();
        resetInputs();
        setSettingsOpen(false);
        setGuideExpanded(false);
        setAmbientCreatureCue(null);
        if (nextZone === "meadow") {
          setMeadowArrivalAcknowledged(false);
        }

        setZoneTransition({
          label,
          detail,
          phase: "cover",
        });

        zoneTransitionTimersRef.current.push(
          window.setTimeout(() => {
            setZone(nextZone);
            setZoneTransition((current) =>
              current
                ? {
                    ...current,
                    phase: "opening",
                  }
                : current,
            );
          }, 260),
        );

        zoneTransitionTimersRef.current.push(
          window.setTimeout(() => {
            setZoneTransition(null);
            wrapperRef.current?.focus();
          }, 1160),
        );
      };

      if (id === "outdoor") {
        startTransition(
          "meadow",
          "Attraverso ESTERNO",
          "Le palpebre si aprono sul globo. Il prato si prepara oltre la soglia.",
        );
        return;
      }
      if (id === "return") {
        startTransition(
          "gallery",
          "Rientro nella galleria",
          "La luce si richiude e il padiglione torna a respirare attorno alle opere.",
        );
      }
    },
    [clearZoneTransitionTimers, onExit, zoneTransition],
  );

  const handleInteraction = useCallback(
    (target: InteractionTarget) => {
      if (target.type === "offering") {
        const offering = offerings.find((item) => item.id === target.id);
        if (offering) setSelectedOffering(offering);
        return;
      }
      if (target.type === "creature") {
        setSelectedCreatureId(target.id);
        return;
      }
      if (target.type === "meadow-creature") {
        revealMeadowCreature(target.id);
        return;
      }
      if (target.type === "deposit") {
        setRitualSiteId(target.id);
      }
    },
    [offerings, revealMeadowCreature],
  );

  const handleToggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ownerDocument = wrapper.ownerDocument;
    const fullscreenElement = getActiveFullscreenElement(ownerDocument);

    const toggleFullscreen = async () => {
      if (
        fullscreenElement &&
        (fullscreenElement === wrapper ||
          fullscreenElement.contains(wrapper))
      ) {
        await exitElementFullscreen(ownerDocument);
        screen.orientation?.unlock?.();
        return;
      }

      setSettingsOpen(false);
      setGuideExpanded(false);
      await requestElementFullscreen(wrapper);
      if (isMobile && viewport.width < viewport.height) {
        await screen.orientation?.lock?.("landscape").catch(() => undefined);
      }
    };

    toggleFullscreen().catch(() => undefined);
  }, [isMobile, viewport.height, viewport.width]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const wrapper = wrapperRef.current;
      const activeFullscreenElement = getActiveFullscreenElement();
      const nextFullscreen = Boolean(
        wrapper &&
          activeFullscreenElement &&
          (activeFullscreenElement === wrapper ||
            activeFullscreenElement.contains(wrapper)),
      );

      setFullscreen(nextFullscreen);
      if (!nextFullscreen) {
        screen.orientation?.unlock?.();
      } else {
        setSettingsOpen(false);
      }
      wrapper?.focus();
      snapshotRef.current = {
        ...snapshotRef.current,
        fullscreen: nextFullscreen,
      };
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyF") {
        event.preventDefault();
        handleToggleFullscreen();
      }
      if (event.key === "Escape") {
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (ritualSiteId) {
          setRitualSiteId(null);
          return;
        }
        if (activeDepositId) {
          setActiveDepositId(null);
          return;
        }
        if (selectedOffering) {
          setSelectedOffering(null);
          return;
        }
        if (selectedCreatureId) {
          setSelectedCreatureId(null);
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange as EventListener,
    );
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange as EventListener,
      );
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeDepositId,
    handleToggleFullscreen,
    ritualSiteId,
    selectedCreatureId,
    selectedOffering,
    settingsOpen,
  ]);

  useEffect(() => {
    snapshotRef.current = {
      ...snapshotRef.current,
      zone,
      sector: currentSector,
      deviceClass,
      renderProfile: activeRenderProfile.id,
      resolvedRenderProfile: resolvedPreferredProfile.id,
      renderProfilePreference,
      renderProfileSource,
      renderProfileAutoFloor: autoDowngradeFloor,
      renderProfileReason,
      profileLocked: profileShiftLocked,
      quality,
      hudMode,
      mouseSensitivity,
      touchSensitivity,
      joystickRadius,
      mouseLookSensitivity: controlProfile.mouseLookSensitivity,
      touchLookSensitivity: controlProfile.touchLookSensitivity,
      fullscreen,
      guideStep,
      outdoorRadius: MEADOW_PLANET_RADIUS,
      mobileOrientationState,
      controlsLayout,
      viewport: {
        width: viewport.width,
        height: viewport.height,
        dpr: viewport.dpr,
        context: viewport.context,
        fullscreen: viewport.fullscreen,
      },
      doorPrompt: playerPromptLabel,
      ambience: ambienceState,
      nearbyCreatureIds,
      visibleLandmarkIds,
      horizonLandmarkIds,
      modal: activeDepositId
        ? { type: "deposit", id: activeDepositId }
        : ritualSiteId
          ? { type: "ritual", id: ritualSiteId }
          : selectedOffering
            ? { type: "offering", id: selectedOffering.id }
            : selectedCreatureId
              ? { type: "creature", id: selectedCreatureId }
              : { type: "none", id: null },
    };
  }, [
    activeDepositId,
    activeRenderProfile.id,
    ambienceState,
    autoDowngradeFloor,
    controlProfile.mouseLookSensitivity,
    controlProfile.touchLookSensitivity,
    currentSector,
    deviceClass,
    fullscreen,
    guideStep,
    horizonLandmarkIds,
    hudMode,
    joystickRadius,
    controlsLayout,
    mobileOrientationState,
    mouseSensitivity,
    nearbyCreatureIds,
    playerPromptLabel,
    profileShiftLocked,
    quality,
    renderProfilePreference,
    renderProfileReason,
    renderProfileSource,
    ritualSiteId,
    selectedCreatureId,
    selectedOffering,
    touchSensitivity,
    visibleLandmarkIds,
    viewport.context,
    viewport.dpr,
    viewport.fullscreen,
    viewport.height,
    viewport.width,
    resolvedPreferredProfile.id,
    zone,
  ]);

  useEffect(() => {
    if (fullscreen === viewport.fullscreen) return;
    setFullscreen(viewport.fullscreen);
    snapshotRef.current = {
      ...snapshotRef.current,
      fullscreen: viewport.fullscreen,
    };
  }, [fullscreen, viewport.fullscreen]);

  useEffect(() => {
    if (!lastDepositSiteId || guideCompleted) return;
    setGuideCompleted(true);
    setGuideHidden(true);
  }, [guideCompleted, lastDepositSiteId, setGuideCompleted]);

  useEffect(() => {
    if (guideStep === "complete") {
      previousGuideStepRef.current = guideStep;
      return;
    }

    if (previousGuideStepRef.current === guideStep) return;
    previousGuideStepRef.current = guideStep;
    setGuideHidden(false);
    setGuideExpanded(!isMobile);

    const timer = window.setTimeout(
      () => {
        setGuideExpanded(false);
      },
      isMobile ? 2000 : 2800,
    );

    return () => window.clearTimeout(timer);
  }, [guideStep, isMobile]);

  useEffect(() => {
    if (!lastDepositSiteId) return;
    const timer = window.setTimeout(() => setLastDepositSiteId(null), 2400);
    return () => window.clearTimeout(timer);
  }, [lastDepositSiteId]);

  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  useEffect(() => {
    const windowWithGameHooks = window as Window & {
      advanceTime?: (ms: number) => Promise<void>;
      render_game_to_text?: () => string;
      set_meadow_debug_pose?: (pose: MeadowDebugPose) => Promise<boolean>;
    };

    windowWithGameHooks.advanceTime = async (ms: number) => {
      if (!stepReadyRef.current) {
        await new Promise<void>((resolve) => {
          stepWaitersRef.current.push(resolve);
        });
      }
      const steps = Math.max(1, Math.round(ms / (1000 / 60)));
      for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
        stepRef.current(1 / 60);
      }
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    };

    windowWithGameHooks.render_game_to_text = () => {
      const player = snapshotRef.current.player;
      const doorList = (
        snapshotRef.current.zone === "gallery" ? GALLERY_DOORS : MEADOW_DOORS
      ).map((door) => {
        const dx = player.x - door.position[0];
        const dy = player.y - door.position[1];
        const dz = player.z - door.position[2];
        return {
          id: door.id,
          label: door.label,
          distance: Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2)),
        };
      });

      return JSON.stringify({
        coordinate_system:
          "world-space position; +x right; +y up; in gallery +z points to USCITA and -z points to ESTERNO; in meadow movement follows a larger small-planet globe around the planet center",
        zone: snapshotRef.current.zone,
        sector: snapshotRef.current.sector,
        device_class: snapshotRef.current.deviceClass,
        render_profile: snapshotRef.current.renderProfile,
        resolved_render_profile: snapshotRef.current.resolvedRenderProfile,
        render_profile_preference: snapshotRef.current.renderProfilePreference,
        render_profile_source: snapshotRef.current.renderProfileSource,
        auto_downgrade_floor: snapshotRef.current.renderProfileAutoFloor,
        render_profile_reason: snapshotRef.current.renderProfileReason,
        profile_locked: snapshotRef.current.profileLocked,
        guide_step: snapshotRef.current.guideStep,
        hud_mode: snapshotRef.current.hudMode,
        quality: snapshotRef.current.quality,
        outdoor_radius: snapshotRef.current.outdoorRadius,
        surface: snapshotRef.current.viewport,
        mobile_orientation_state: snapshotRef.current.mobileOrientationState,
        controls_layout: snapshotRef.current.controlsLayout,
        mouse_sensitivity_setting: Number(
          snapshotRef.current.mouseSensitivity.toFixed(2),
        ),
        touch_sensitivity_setting: Number(
          snapshotRef.current.touchSensitivity.toFixed(2),
        ),
        joystick_radius: Number(snapshotRef.current.joystickRadius.toFixed(0)),
        mouse_sensitivity: Number(
          snapshotRef.current.mouseLookSensitivity.toFixed(2),
        ),
        touch_look_sensitivity: Number(
          snapshotRef.current.touchLookSensitivity.toFixed(2),
        ),
        fullscreen: snapshotRef.current.fullscreen,
        modal: snapshotRef.current.modal,
        player,
        nearby_trigger: snapshotRef.current.nearbyTriggerId,
        door_prompt: snapshotRef.current.doorPrompt,
        nearby_deposit: snapshotRef.current.nearbyDepositId,
        nearby_creatures: snapshotRef.current.nearbyCreatureIds,
        visible_landmarks: snapshotRef.current.visibleLandmarkIds,
        horizon_landmarks: snapshotRef.current.horizonLandmarkIds,
        nearby_landmark_summary: snapshotRef.current.visibleLandmarkIds
          .map(
            (landmarkId) =>
              MEADOW_LANDMARKS.find((landmark) => landmark.id === landmarkId)
                ?.label,
          )
          .filter(Boolean),
        horizon_landmark_summary: snapshotRef.current.horizonLandmarkIds
          .map(
            (landmarkId) =>
              MEADOW_SKYLINE_LANDMARKS.find((landmark) => landmark.id === landmarkId)
                ?.label,
          )
          .filter(Boolean),
        ambience: snapshotRef.current.ambience,
        doors: doorList,
        deposit_sites: DEPOSIT_SITES.map((site) => ({
          id: site.id,
          label: site.label,
          deposited_here: depositCounts[site.id] || 0,
        })),
      });
    };

    windowWithGameHooks.set_meadow_debug_pose = async (pose) => {
      meadowDebugPoseRef.current?.(pose);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      return Boolean(meadowDebugPoseRef.current);
    };

    return () => {
      delete windowWithGameHooks.advanceTime;
      delete windowWithGameHooks.render_game_to_text;
      delete windowWithGameHooks.set_meadow_debug_pose;
    };
  }, [depositCounts]);

  const handleJoystickInput = useCallback(
    (axis: "move" | "look", x: number, y: number) => {
      if (axis === "move") {
        joystickRef.current.moveX = x;
        joystickRef.current.moveZ = y;
      } else {
        joystickRef.current.lookX = x;
        joystickRef.current.lookY = y;
      }
      handleActivity();
    },
    [handleActivity],
  );

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full touch-none overflow-hidden ${className}`}
      style={{
        isolation: "isolate",
        width: viewport.fullscreen ? "100vw" : undefined,
        height: viewport.fullscreen ? "100vh" : "100%",
        minHeight: viewport.fullscreen ? "100vh" : undefined,
      }}
      tabIndex={0}
      onClick={handleActivity}
      onPointerDown={handleActivity}
    >
      <div className="absolute inset-0">
        <GalleryCanvas
          zone={zone}
          isMobile={isMobile}
          offerings={offerings}
          renderProfile={activeRenderProfile}
          depositCounts={depositCounts}
          activeRenderProfileId={activeRenderProfile.id}
          deviceClass={deviceClass}
          renderProfilePreference={renderProfilePreference}
          sceneInterrupted={sceneInterrupted}
          guideExpanded={guideExpanded}
          showOrientationOverlay={showOrientationOverlay}
          mobileControlsLandscape={mobileControlsLandscape}
          controlProfile={controlProfile}
          viewport={viewport}
          fullscreen={fullscreen}
          keysDownRef={keysDownRef}
          interactRequestedRef={interactRequestedRef}
          joystickRef={joystickRef}
          jumpRequestedRef={jumpRequestedRef}
          meadowCreatureRuntimeRef={meadowCreatureRuntimeRef}
          meadowDebugPoseRef={meadowDebugPoseRef}
          snapshotRef={snapshotRef as React.MutableRefObject<Record<string, unknown>>}
          stepRef={stepRef}
          stepReadyRef={stepReadyRef}
          stepWaitersRef={stepWaitersRef}
          onSelectOffering={setSelectedOffering}
          onSelectDeposit={(site) => setRitualSiteId(site.id)}
          onSelectCreature={revealMeadowCreature}
          onDoorTrigger={handleDoorTrigger}
          onInteraction={handleInteraction}
          onActivity={handleActivity}
          onTriggerProximityChange={setNearbyTriggerId}
          onDepositProximityChange={setNearbyDepositId}
          onCreatureProximityChange={setNearbyCreatureIds}
          onSectorChange={setCurrentSector}
          onVisibleLandmarksChange={setVisibleLandmarkIds}
          onHorizonLandmarksChange={setHorizonLandmarkIds}
          onDowngradeProfile={setActiveRenderProfileId}
          onJoystickInput={handleJoystickInput}
          nearbyDeposit={nearbyDeposit}
          ritualSiteId={ritualSiteId}
          lastDepositSiteId={lastDepositSiteId}
          mobilePrimaryAction={mobilePrimaryAction}
          automationProfileLock={automationProfileLock}
          profileShiftLocked={profileShiftLocked}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,_rgba(255,248,240,0)_42%,_rgba(11,8,7,0.08)_74%,_rgba(5,4,4,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_0_1px_rgba(255,245,232,0.08),inset_0_70px_90px_rgba(0,0,0,0.14),inset_0_-110px_130px_rgba(0,0,0,0.24)]" />

      <GalleryHud
        zone={zone}
        isMobile={isMobile}
        hudMode={hudMode}
        guideStep={guideStep}
        guideDescriptor={guideDescriptor}
        guideHidden={guideHidden}
        guideExpanded={guideExpanded}
        currentSectorDescriptor={currentSectorDescriptor}
        visibleLandmarkLabel={visibleLandmarkLabel}
        ambienceLabel={ambienceLabel}
        nearbyCreatureDefinitions={nearbyCreatureDefinitions}
        nearbyDeposit={nearbyDeposit}
        nearbyTriggerLabel={nearbyTriggerLabel}
        mouseSensitivity={mouseSensitivity}
        touchSensitivity={touchSensitivity}
        joystickRadius={joystickRadius}
        playerPromptLabel={playerPromptLabel}
        modalOpen={modalOpen}
        settingsOpen={settingsOpen}
        sceneInterrupted={sceneInterrupted}
        showOrientationOverlay={showOrientationOverlay}
        mobileOrientationState={mobileOrientationState}
        landscapeHintAcknowledged={landscapeHintAcknowledged}
        guideCompleted={guideCompleted}
        lastDepositSiteId={lastDepositSiteId}
        depositCounts={depositCounts}
        activeDepositId={activeDepositId}
        ritualSiteId={ritualSiteId}
        selectedOffering={selectedOffering}
        selectedCreatureId={selectedCreatureId}
        activeCreature={activeCreature}
        activeRitualSite={activeRitualSite}
        activeDeposit={activeDeposit}
        ambientCreatureCue={ambientCreatureCue}
        showGuidePill={showGuidePill}
        showGuideUi={showGuideUi}
        zoneTransition={zoneTransition}
        activeRenderProfile={activeRenderProfile}
        renderProfilePreference={renderProfilePreference}
        ambienceVolume={ambienceVolume}
        ambienceMuted={ambienceMuted}
        invertLook={invertLook}
        reducedCameraMotion={reducedCameraMotion}
        isFullscreen={fullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenGuide={() => {
          setGuideHidden(false);
          setGuideExpanded(true);
        }}
        onHideGuide={() => setGuideHidden(true)}
        onToggleGuideExpanded={() => setGuideExpanded((current) => !current)}
        onDismissLandscapeHint={() => setLandscapeHintAcknowledged(true)}
        onSetRitualSiteId={setRitualSiteId}
        onSetActiveDepositId={setActiveDepositId}
        onSetSelectedOffering={setSelectedOffering}
        onSetSelectedCreatureId={setSelectedCreatureId}
        onDepositSubmitted={(siteId) => {
          setDepositCounts((current) => ({
            ...current,
            [siteId]: (current[siteId] || 0) + 1,
          }));
          setLastDepositSiteId(siteId);
          const reactedCreature = MEADOW_CREATURES.find(
            (creature) => creature.reactsToDepositId === siteId,
          );
          if (reactedCreature) {
            setAmbientCreatureCue({
              id: reactedCreature.id,
              label: reactedCreature.label,
              caption:
                "Il luogo trattiene un'eco per qualche istante: qualcosa, li vicino, ha sentito la traccia lasciata.",
            });
          }
        }}
        onRenderProfilePreferenceChange={setRenderProfilePreference}
        onMouseSensitivityChange={setMouseSensitivity}
        onTouchSensitivityChange={setTouchSensitivity}
        onJoystickRadiusChange={setJoystickRadius}
        onToggleInvertLook={() => setInvertLook((current) => !current)}
        onToggleReducedCameraMotion={() =>
          setReducedCameraMotion((current) => !current)
        }
        onHudModeChange={setHudMode}
        onAmbienceVolumeChange={setAmbienceVolume}
        onToggleAmbienceMuted={() => setAmbienceMuted((current) => !current)}
        onSetSettingsOpen={setSettingsOpen}
      />

      {isMobile && !sceneInterrupted && <MobileActionLink />}

      <OfferingModal
        offering={selectedOffering}
        onClose={() => setSelectedOffering(null)}
      />
      <CreatureModal
        creature={activeCreature}
        onClose={() => setSelectedCreatureId(null)}
      />
      <RitualPrompt
        site={activeRitualSite}
        count={activeRitualSite ? depositCounts[activeRitualSite.id] || 0 : 0}
        onClose={() => setRitualSiteId(null)}
        onBeginOffering={() => {
          if (!activeRitualSite) return;
          setRitualSiteId(null);
          setActiveDepositId(activeRitualSite.id);
        }}
      />
      <DepositModal
        site={activeDeposit}
        onClose={() => setActiveDepositId(null)}
        onSubmitted={(siteId) => {
          setDepositCounts((current) => ({
            ...current,
            [siteId]: (current[siteId] || 0) + 1,
          }));
          setLastDepositSiteId(siteId);
          const reactedCreature = MEADOW_CREATURES.find(
            (creature) => creature.reactsToDepositId === siteId,
          );
          if (reactedCreature) {
            setAmbientCreatureCue({
              id: reactedCreature.id,
              label: reactedCreature.label,
              caption:
                "Il luogo trattiene un'eco per qualche istante: qualcosa, li vicino, ha sentito la traccia lasciata.",
            });
          }
        }}
      />
    </div>
  );
}

export default CavapendoGallery;
