import { useEffect, useMemo, useState, type RefObject } from "react";
import * as THREE from "three";

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

export type WorldZone = "gallery" | "meadow";
export type QualityTier = "low" | "medium" | "high";
export type RenderProfile =
  | "desktop_showcase"
  | "desktop_balanced"
  | "mobile_balanced"
  | "mobile_safe";
export type RenderProfilePreference = "auto" | RenderProfile;
export type DeviceClass = "desktop" | "mobile";
export type HudMode = "player" | "debug";
export type MobileOrientationState =
  | "desktop"
  | "portrait_hint"
  | "portrait_dismissed"
  | "landscape";
export type MobileControlsLayout =
  | "desktop"
  | "mobile_portrait"
  | "mobile_landscape";
export type GuideStep =
  | "intro"
  | "find-outdoor"
  | "arrive-globe"
  | "meet-creatures"
  | "find-deposit"
  | "deposit-ready"
  | "complete";

export interface ViewportMetrics {
  width: number;
  height: number;
  shortSide: number;
  longSide: number;
  dpr: number;
  context: "embedded" | "fullscreen";
  fullscreen: boolean;
}

export interface ControlProfile {
  mouseLookSensitivity: number;
  touchLookSensitivity: number;
  moveJoystickRadius: number;
  lookJoystickRadius: number;
  invertLookFactor: 1 | -1;
  reducedCameraMotion: boolean;
}

export interface ResolvedRenderProfile {
  id: RenderProfile;
  label: string;
  description: string;
  tier: QualityTier;
  dpr: number | [number, number];
  antialias: boolean;
  powerPreference: "default" | "high-performance";
  grassDensity: number;
  creatureDensity: number;
  sparkleDensity: number;
  landmarkDrawDistance: number;
  transparencyStrength: number;
  atmosphereStrength: number;
}

export interface GuideDescriptor {
  step: number;
  total: number;
  title: string;
  body: string;
  hints: string[];
  compactLabel: string;
}

export const MOUSE_SENSITIVITY_STORAGE_KEY =
  "cavapendolandia-mouse-sensitivity";
export const TOUCH_SENSITIVITY_STORAGE_KEY =
  "cavapendolandia-touch-sensitivity";
export const JOYSTICK_RADIUS_STORAGE_KEY = "cavapendolandia-joystick-radius";
export const RENDER_PROFILE_STORAGE_KEY = "cavapendolandia-render-profile";
export const GUIDE_COMPLETED_STORAGE_KEY = "cavapendolandia-tour-completed-v2";
export const AMBIENCE_VOLUME_STORAGE_KEY = "cavapendolandia-ambience-volume";
export const AMBIENCE_MUTED_STORAGE_KEY = "cavapendolandia-ambience-muted";
export const INVERT_LOOK_STORAGE_KEY = "cavapendolandia-invert-look";
export const REDUCED_CAMERA_MOTION_STORAGE_KEY =
  "cavapendolandia-reduced-camera-motion";
export const HUD_MODE_STORAGE_KEY = "cavapendolandia-hud-mode";
export const MOBILE_LANDSCAPE_HINT_STORAGE_KEY =
  "cavapendolandia-mobile-landscape-hint-v1";

export const DEFAULT_MOUSE_SENSITIVITY = 1.06;
export const DEFAULT_TOUCH_SENSITIVITY = 1.02;
export const DEFAULT_JOYSTICK_RADIUS = 56;

const RENDER_PROFILE_ORDER: RenderProfile[] = [
  "desktop_showcase",
  "desktop_balanced",
  "mobile_balanced",
  "mobile_safe",
];

const RENDER_PROFILES: Record<RenderProfile, ResolvedRenderProfile> = {
  desktop_showcase: {
    id: "desktop_showcase",
    label: "Desktop Showcase",
    description: "Piu atmosfera, densita piena, resa prioritaria.",
    tier: "high",
    dpr: [1, 2],
    antialias: true,
    powerPreference: "high-performance",
    grassDensity: 1,
    creatureDensity: 1,
    sparkleDensity: 1,
    landmarkDrawDistance: 1,
    transparencyStrength: 1,
    atmosphereStrength: 1,
  },
  desktop_balanced: {
    id: "desktop_balanced",
    label: "Desktop Balanced",
    description: "Desktop stabile con atmosfera ridotta il minimo possibile.",
    tier: "medium",
    dpr: [1, 1.6],
    antialias: true,
    powerPreference: "default",
    grassDensity: 0.78,
    creatureDensity: 0.9,
    sparkleDensity: 0.68,
    landmarkDrawDistance: 0.92,
    transparencyStrength: 0.84,
    atmosphereStrength: 0.86,
  },
  mobile_balanced: {
    id: "mobile_balanced",
    label: "Mobile Balanced",
    description: "Mobile moderno con look preservato e draw cost controllato.",
    tier: "medium",
    dpr: [1, 1.35],
    antialias: false,
    powerPreference: "default",
    grassDensity: 0.74,
    creatureDensity: 0.9,
    sparkleDensity: 0.62,
    landmarkDrawDistance: 0.9,
    transparencyStrength: 0.82,
    atmosphereStrength: 0.86,
  },
  mobile_safe: {
    id: "mobile_safe",
    label: "Mobile Safe",
    description: "Fallback mobile leggibile e stabile.",
    tier: "low",
    dpr: 1,
    antialias: false,
    powerPreference: "default",
    grassDensity: 0.56,
    creatureDensity: 0.74,
    sparkleDensity: 0.4,
    landmarkDrawDistance: 0.78,
    transparencyStrength: 0.58,
    atmosphereStrength: 0.72,
  },
};

export const RENDER_PROFILE_OPTIONS: Array<{
  value: RenderProfilePreference;
  label: string;
}> = [
  { value: "auto", label: "Auto" },
  { value: "desktop_showcase", label: "Desktop Showcase" },
  { value: "desktop_balanced", label: "Desktop Balanced" },
  { value: "mobile_balanced", label: "Mobile Balanced" },
  { value: "mobile_safe", label: "Mobile Safe" },
];

const getViewportSize = () => {
  const visualViewport = window.visualViewport;
  const width = Math.round(visualViewport?.width || window.innerWidth || 0);
  const height = Math.round(visualViewport?.height || window.innerHeight || 0);
  return { width, height };
};

const getActiveFullscreenElement = () => {
  const fullscreenDocument = document as FullscreenDocument;
  return document.fullscreenElement || fullscreenDocument.webkitFullscreenElement || null;
};

export function readViewportMetrics({
  target,
  fullscreenElement,
  viewportWidth,
  viewportHeight,
  dpr,
}: {
  target?: HTMLElement | null;
  fullscreenElement?: Element | null;
  viewportWidth?: number;
  viewportHeight?: number;
  dpr?: number;
} = {}): ViewportMetrics {
  const { width: fallbackWidth, height: fallbackHeight } = getViewportSize();
  const resolvedViewportWidth = Math.round(viewportWidth ?? fallbackWidth);
  const resolvedViewportHeight = Math.round(viewportHeight ?? fallbackHeight);
  const activeFullscreenElement =
    fullscreenElement === undefined ? getActiveFullscreenElement() : fullscreenElement;
  const fullscreen = Boolean(
    target &&
      activeFullscreenElement &&
      (activeFullscreenElement === target ||
        activeFullscreenElement.contains(target)),
  );
  const rect = target?.getBoundingClientRect();
  const rectWidth = Math.round(rect?.width || 0);
  const rectHeight = Math.round(rect?.height || 0);
  const width =
    rectWidth > 0
      ? fullscreen
        ? Math.max(rectWidth, resolvedViewportWidth)
        : rectWidth
      : resolvedViewportWidth;
  const height =
    rectHeight > 0
      ? fullscreen
        ? Math.max(rectHeight, resolvedViewportHeight)
        : rectHeight
      : resolvedViewportHeight;

  return {
    width,
    height,
    shortSide: Math.min(width, height),
    longSide: Math.max(width, height),
    dpr: dpr ?? (window.devicePixelRatio || 1),
    context: fullscreen ? "fullscreen" : "embedded",
    fullscreen,
  };
}

export function usePersistedNumber(key: string, fallbackValue: number) {
  const [value, setValue] = useState(() => {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallbackValue;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : fallbackValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function usePersistedPreference(
  key: string,
  fallbackValue: RenderProfilePreference,
) {
  const [value, setValue] = useState<RenderProfilePreference>(() => {
    const stored = window.localStorage.getItem(key);
    return stored === "auto" ||
      (typeof stored === "string" && stored in RENDER_PROFILES)
      ? (stored as RenderProfilePreference)
      : fallbackValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

export function usePersistedFlag(key: string, fallbackValue: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = window.localStorage.getItem(key);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return fallbackValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value ? "true" : "false");
  }, [key, value]);

  return [value, setValue] as const;
}

export function usePersistedHudMode(key: string, fallbackValue: HudMode) {
  const [value, setValue] = useState<HudMode>(() => {
    const stored = window.localStorage.getItem(key);
    return stored === "player" || stored === "debug" ? stored : fallbackValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

export function useViewportMetrics(targetRef?: RefObject<HTMLElement | null>) {
  const [metrics, setMetrics] = useState<ViewportMetrics>(() =>
    readViewportMetrics({ target: targetRef?.current }),
  );

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(readViewportMetrics({ target: targetRef?.current }));
    };

    const visualViewport = window.visualViewport;
    const resizeObserver = new window.ResizeObserver(() => updateMetrics());
    const target = targetRef?.current;
    window.addEventListener("resize", updateMetrics);
    window.addEventListener("orientationchange", updateMetrics);
    window.addEventListener("pageshow", updateMetrics);
    document.addEventListener("visibilitychange", updateMetrics);
    document.addEventListener("fullscreenchange", updateMetrics);
    document.addEventListener("webkitfullscreenchange", updateMetrics as EventListener);
    visualViewport?.addEventListener("resize", updateMetrics);
    visualViewport?.addEventListener("scroll", updateMetrics);
    if (target) resizeObserver.observe(target);
    updateMetrics();

    return () => {
      window.removeEventListener("resize", updateMetrics);
      window.removeEventListener("orientationchange", updateMetrics);
      window.removeEventListener("pageshow", updateMetrics);
      document.removeEventListener("visibilitychange", updateMetrics);
      document.removeEventListener("fullscreenchange", updateMetrics);
      document.removeEventListener(
        "webkitfullscreenchange",
        updateMetrics as EventListener,
      );
      visualViewport?.removeEventListener("resize", updateMetrics);
      visualViewport?.removeEventListener("scroll", updateMetrics);
      resizeObserver.disconnect();
    };
  }, [targetRef]);

  return metrics;
}

export const getDeviceClass = (isMobile: boolean): DeviceClass =>
  isMobile ? "mobile" : "desktop";

export const getAutoRenderProfile = (
  deviceClass: DeviceClass,
  reduceMotion: boolean | null | undefined,
) => {
  if (reduceMotion) {
    return deviceClass === "mobile" ? "mobile_safe" : "desktop_balanced";
  }

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const memory = nav.deviceMemory ?? 4;
  const cores = nav.hardwareConcurrency ?? 4;

  if (deviceClass === "mobile") {
    return memory >= 8 && cores >= 8 ? "mobile_balanced" : "mobile_safe";
  }

  if (memory >= 8 && cores >= 8) return "desktop_showcase";
  return "desktop_balanced";
};

export const getResolvedRenderProfile = (profile: RenderProfile) =>
  RENDER_PROFILES[profile];

export const resolveRenderProfileId = ({
  deviceClass,
  reduceMotion,
  preference,
}: {
  deviceClass: DeviceClass;
  reduceMotion: boolean | null | undefined;
  preference: RenderProfilePreference;
}) =>
  clampRenderProfileForDevice(
    preference === "auto"
      ? getAutoRenderProfile(deviceClass, reduceMotion)
      : preference,
    deviceClass,
  );

export function useResolvedRenderProfile(
  deviceClass: DeviceClass,
  reduceMotion: boolean | null | undefined,
  preference: RenderProfilePreference,
) {
  return useMemo(
    () =>
      getResolvedRenderProfile(
        resolveRenderProfileId({
          deviceClass,
          reduceMotion,
          preference,
        }),
      ),
    [deviceClass, preference, reduceMotion],
  );
}

export const getNextLowerRenderProfile = (
  currentProfile: RenderProfile,
): RenderProfile | null => {
  const currentIndex = RENDER_PROFILE_ORDER.indexOf(currentProfile);
  if (currentIndex < 0 || currentIndex >= RENDER_PROFILE_ORDER.length - 1) {
    return null;
  }
  return RENDER_PROFILE_ORDER[currentIndex + 1];
};

export const clampRenderProfileForDevice = (
  profile: RenderProfile,
  deviceClass: DeviceClass,
) => {
  if (
    deviceClass === "mobile" &&
    (profile === "desktop_showcase" || profile === "desktop_balanced")
  ) {
    return "mobile_balanced" as RenderProfile;
  }
  return profile;
};

export const getRenderProfileSource = ({
  preference,
  resolvedProfile,
  activeProfile,
}: {
  preference: RenderProfilePreference;
  resolvedProfile: RenderProfile;
  activeProfile: RenderProfile;
}) => {
  if (preference !== "auto") return "manual" as const;
  return activeProfile === resolvedProfile
    ? ("auto" as const)
    : ("auto_downgraded" as const);
};

export const getControlProfile = ({
  deviceClass,
  mouseSensitivity,
  touchSensitivity,
  viewport,
  joystickRadius,
  invertLook,
  reducedCameraMotion,
}: {
  deviceClass: DeviceClass;
  mouseSensitivity: number;
  touchSensitivity: number;
  viewport: ViewportMetrics;
  joystickRadius: number;
  invertLook: boolean;
  reducedCameraMotion: boolean;
}): ControlProfile => {
  const desktopWindowFactor = THREE.MathUtils.clamp(
    1080 / Math.max(viewport.width || 1080, 960),
    0.9,
    1.1,
  );
  const desktopDensityFactor = THREE.MathUtils.clamp(
    1.04 - Math.max(0, viewport.dpr - 1) * 0.05,
    0.86,
    1.04,
  );

  const shortSideFactor = THREE.MathUtils.clamp(
    viewport.shortSide / 430,
    0.8,
    1.08,
  );
  const longSideFactor = THREE.MathUtils.clamp(
    viewport.longSide / 900,
    0.88,
    1.08,
  );
  const mobileDensityFactor = THREE.MathUtils.clamp(
    1.1 - Math.max(0, viewport.dpr - 1) * 0.07,
    0.84,
    1.06,
  );
  const mobileLookFactor = THREE.MathUtils.clamp(
    0.74 * shortSideFactor * longSideFactor * mobileDensityFactor,
    0.52,
    0.92,
  );

  const joystickScale =
    deviceClass === "mobile"
      ? THREE.MathUtils.clamp(viewport.shortSide / 430, 0.96, 1.16)
      : 1;

  return {
    mouseLookSensitivity:
      mouseSensitivity * desktopWindowFactor * desktopDensityFactor,
    touchLookSensitivity: touchSensitivity * mobileLookFactor,
    moveJoystickRadius: THREE.MathUtils.clamp(
      joystickRadius * joystickScale,
      46,
      74,
    ),
    lookJoystickRadius: THREE.MathUtils.clamp(
      (joystickRadius + 8) * joystickScale,
      52,
      82,
    ),
    invertLookFactor: invertLook ? -1 : 1,
    reducedCameraMotion,
  };
};

export const getGuideDescriptor = (
  step: GuideStep,
  isMobile: boolean,
): GuideDescriptor | null => {
  if (step === "complete") return null;

  if (step === "intro") {
    return {
      step: 1,
      total: 3,
      title: isMobile
        ? "Ruota il telefono e prendi il globo"
        : "Prendi il ritmo della galleria",
      body: isMobile
        ? "In orizzontale il globo respira meglio. Il pad sinistro sposta il corpo, il destro curva lo sguardo: resta vicino al centro per micro-movimenti, spingiti al bordo per girarti piu in fretta."
        : "WASD sposta il corpo, il mouse prende lo sguardo. Un clic aggancia la visuale: appena senti il ritmo, cerca l'arco ESTERNO sul muro opposto.",
      hints: isMobile
        ? ["Ruota in orizzontale", "Sinistra: muovi", "Destra: guarda"]
        : ["WASD muove", "Mouse guarda", "F entra in fullscreen"],
      compactLabel: "Trova l'arco ESTERNO",
    };
  }

  if (step === "find-outdoor") {
    return {
      step: 1,
      total: 3,
      title: "Attraversa la soglia",
      body: "L'interno resta caldo e raccolto. Sul muro opposto c'e l'arco ESTERNO: avvicinati e usa Enter o E per aprire il passaggio.",
      hints: ["Muro opposto", "Usa E o Enter", "La scena non cambia route"],
      compactLabel: "Raggiungi ESTERNO",
    };
  }

  if (step === "arrive-globe") {
    return {
      step: 2,
      total: 4,
      title: "Leggi il pianeta",
      body: "Fuori la terra curva davvero. Segui la linea di lanterne davanti a te: ti porta nella prima fascia viva del globo senza perdere GALLERIA di riferimento.",
      hints: [
        "Segui le lanterne",
        "La curva e reale",
        "GALLERIA resta alle spalle",
      ],
      compactLabel: "Segui la cresta accesa",
    };
  }

  if (step === "meet-creatures") {
    return {
      step: 3,
      total: 4,
      title: "Osserva chi abita il vento",
      body: "Le creature non assegnano missioni. Ti orientano con sguardi, spostamenti e richiami: dove qualcosa insiste, li vicino di solito c'e un luogo da notare.",
      hints: ["Camminatori", "Posatoi", "Aloni mobili"],
      compactLabel: "Segui un movimento vivo",
    };
  }

  if (step === "find-deposit") {
    return {
      step: 4,
      total: 4,
      title: "Trova una radura rituale",
      body: "Anelli sospesi, bagliori verticali e creature che ritornano su un punto indicano una radura. Li puoi fermarti, ascoltare il luogo e decidere se lasciare qualcosa.",
      hints: ["Tre radure", "Bagliori verticali", "Il rito resta nel globo"],
      compactLabel: "Cerca un santuario",
    };
  }

  return {
    step: 4,
    total: 4,
    title: "Apri il rito del santuario",
    body: isMobile
      ? "Usa il bottone del rito quando sei vicino a una radura, poi scegli se lasciare davvero una cavapendolata."
      : "Premi Enter o E vicino a una radura per aprire il rito. Da li puoi scegliere se lasciare davvero una cavapendolata.",
    hints: isMobile
      ? ["Apri il rito", "Poi lascia qui", "Il globo conserva il deposito"]
      : ["Enter o E", "Rito prima del form", "Il globo conserva il deposito"],
    compactLabel: "Apri il rito",
  };
};
