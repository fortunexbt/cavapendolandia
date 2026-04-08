import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type {
  DepositSite,
  DoorTrigger,
  Offering,
  WorldStateSnapshot,
} from "@/components/cavapendo-gallery/types";
import type { WorldZone } from "@/components/cavapendo-gallery/runtime";
import { GALLERY_SPAWN } from "@/components/cavapendo-gallery/config";
import { MEADOW_PLANET_RADIUS } from "@/lib/meadowWorld";

export interface GalleryControllerState {
  scene: WorldZone;
  selectedOffering: Offering | null;
  selectedCreatureId: string | null;
  ritualSiteId: string | null;
  activeDepositId: string | null;
  depositCounts: Record<string, number>;
  lastDepositSiteId: string | null;
  settingsOpen: boolean;
  isFullscreen: boolean;
  isGuideVisible: boolean;
  guideExpanded: boolean;
  guideHidden: boolean;
  zoneTransition: {
    label: string;
    detail: string;
    phase: "cover" | "opening";
  } | null;
  nearbyTriggerId: DoorTrigger["id"] | null;
  nearbyDepositId: DepositSite["id"] | null;
  nearbyCreatureIds: string[];
  currentSector: string | null;
  hasInteracted: boolean;
  hasEncounteredMeadowCreature: boolean;
  meadowArrivalAcknowledged: boolean;
}

export interface GalleryControllerActions {
  setScene: (zone: WorldZone) => void;
  setSelectedOffering: (offering: Offering | null) => void;
  setSelectedCreatureId: (id: string | null) => void;
  setRitualSiteId: (id: string | null) => void;
  setActiveDepositId: (id: string | null) => void;
  setDepositCount: (siteId: string, count: number) => void;
  setLastDepositSiteId: (id: string | null) => void;
  setSettingsOpen: (open: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setGuideVisible: (visible: boolean) => void;
  setGuideExpanded: (expanded: boolean) => void;
  setGuideHidden: (hidden: boolean) => void;
  setZoneTransition: (
    transition: GalleryControllerState["zoneTransition"],
  ) => void;
  setNearbyTriggerId: (id: DoorTrigger["id"] | null) => void;
  setNearbyDepositId: (id: DepositSite["id"] | null) => void;
  setNearbyCreatureIds: (ids: string[]) => void;
  setCurrentSector: (sector: string | null) => void;
  setHasInteracted: (interacted: boolean) => void;
  setHasEncounteredMeadowCreature: (encountered: boolean) => void;
  setMeadowArrivalAcknowledged: (acknowledged: boolean) => void;
  handleDoorTrigger: (id: DoorTrigger["id"]) => void;
  handleExit: () => void;
}

export interface GalleryController {
  state: GalleryControllerState;
  actions: GalleryControllerActions;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  keysDownRef: React.MutableRefObject<Set<string>>;
  interactRequestedRef: React.MutableRefObject<boolean>;
  joystickRef: React.MutableRefObject<{
    moveX: number;
    moveZ: number;
    lookX: number;
    lookY: number;
  }>;
  jumpRequestedRef: React.MutableRefObject<boolean>;
  zoneTransitionTimersRef: React.MutableRefObject<number[]>;
  snapshotRef: React.MutableRefObject<WorldStateSnapshot>;
  clearZoneTransitionTimers: () => void;
}

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

export function useGalleryController({
  onExit,
  isMobile,
  viewport,
}: {
  onExit?: () => void;
  isMobile: boolean;
  viewport: { width: number; height: number };
}): GalleryController {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const keysDownRef = useRef(new Set<string>());
  const interactRequestedRef = useRef(false);
  const joystickRef = useRef({
    moveX: 0,
    moveZ: 0,
    lookX: 0,
    lookY: 0,
  });
  const jumpRequestedRef = useRef(false);
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
    mouseSensitivity: 1.06,
    touchSensitivity: 1.02,
    joystickRadius: 56,
    mouseLookSensitivity: 1.06,
    touchLookSensitivity: 0.6324,
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

  const [scene, setScene] = useState<WorldZone>("gallery");
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedCreatureId, setSelectedCreatureId] = useState<string | null>(
    null,
  );
  const [ritualSiteId, setRitualSiteId] = useState<string | null>(null);
  const [activeDepositId, setActiveDepositId] = useState<string | null>(null);
  const [depositCounts, setDepositCounts] = useState<Record<string, number>>({});
  const [lastDepositSiteId, setLastDepositSiteId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasEncounteredMeadowCreature, setHasEncounteredMeadowCreature] =
    useState(false);
  const [meadowArrivalAcknowledged, setMeadowArrivalAcknowledged] =
    useState(false);
  const [guideHidden, setGuideHidden] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const [zoneTransition, setZoneTransition] = useState<
    GalleryControllerState["zoneTransition"]
  >(null);
  const [nearbyTriggerId, setNearbyTriggerId] = useState<
    DoorTrigger["id"] | null
  >(null);
  const [nearbyDepositId, setNearbyDepositId] = useState<
    DepositSite["id"] | null
  >(null);
  const [nearbyCreatureIds, setNearbyCreatureIds] = useState<string[]>([]);
  const [currentSector, setCurrentSector] = useState<string | null>(null);

  const clearZoneTransitionTimers = useCallback(() => {
    zoneTransitionTimersRef.current.forEach((timer) =>
      window.clearTimeout(timer),
    );
    zoneTransitionTimersRef.current = [];
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ownerDocument = wrapper.ownerDocument;
    const fullscreenElement = getActiveFullscreenElement(ownerDocument);

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
  }, [isMobile, viewport.height, viewport.width]);

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
            setScene(nextZone);
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
          t("gallery.zoneTransition.transitionToMeadow"),
          t("gallery.zoneTransition.transitionToMeadowDetail"),
        );
        return;
      }
      if (id === "return") {
        startTransition(
          "gallery",
          t("gallery.zoneTransition.transitionToGallery"),
          t("gallery.zoneTransition.transitionToGalleryDetail"),
        );
      }
    },
    [clearZoneTransitionTimers, onExit, zoneTransition, t],
  );

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

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange as EventListener,
    );
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange as EventListener,
      );
    };
  }, []);

  const state: GalleryControllerState = {
    scene,
    selectedOffering,
    selectedCreatureId,
    ritualSiteId,
    activeDepositId,
    depositCounts,
    lastDepositSiteId,
    settingsOpen,
    isFullscreen,
    isGuideVisible: !guideHidden,
    guideExpanded,
    guideHidden,
    zoneTransition,
    nearbyTriggerId,
    nearbyDepositId,
    nearbyCreatureIds,
    currentSector,
    hasInteracted,
    hasEncounteredMeadowCreature,
    meadowArrivalAcknowledged,
  };

  const actions: GalleryControllerActions = {
    setScene,
    setSelectedOffering,
    setSelectedCreatureId,
    setRitualSiteId,
    setActiveDepositId,
    setDepositCount: (siteId, count) =>
      setDepositCounts((current) => ({
        ...current,
        [siteId]: count,
      })),
    setLastDepositSiteId,
    setSettingsOpen,
    setFullscreen,
    setGuideVisible: (visible) => setGuideHidden(!visible),
    setGuideExpanded,
    setGuideHidden,
    setZoneTransition,
    setNearbyTriggerId,
    setNearbyDepositId,
    setNearbyCreatureIds,
    setCurrentSector,
    setHasInteracted,
    setHasEncounteredMeadowCreature,
    setMeadowArrivalAcknowledged,
    handleDoorTrigger,
    handleExit: onExit,
  };

  return {
    state,
    actions,
    wrapperRef,
    keysDownRef,
    interactRequestedRef,
    joystickRef,
    jumpRequestedRef,
    zoneTransitionTimersRef,
    snapshotRef,
    clearZoneTransitionTimers,
  };
}
