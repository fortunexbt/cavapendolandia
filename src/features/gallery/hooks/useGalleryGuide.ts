import { useState, useEffect, useCallback, useRef } from "react";
import type { GuideStep } from "@/components/cavapendo-gallery/runtime";
import {
  GUIDE_COMPLETED_STORAGE_KEY,
  MOBILE_LANDSCAPE_HINT_STORAGE_KEY,
} from "@/components/cavapendo-gallery/runtime";

export interface UseGalleryGuideOptions {
  isMobile: boolean;
  guideCompleted: boolean;
  lastDepositSiteId: string | null;
  zone: "gallery" | "meadow";
  hasInteracted: boolean;
  meadowArrivalAcknowledged: boolean;
  hasEncounteredMeadowCreature: boolean;
  nearbyDepositId: string | null;
  ritualSiteId: string | null;
  activeDepositId: string | null;
}

export interface GalleryGuideState {
  guideStep: GuideStep;
  guideHidden: boolean;
  guideExpanded: boolean;
  guideCompleted: boolean;
}

export interface GalleryGuideActions {
  setGuideHidden: (hidden: boolean) => void;
  setGuideExpanded: (expanded: boolean) => void;
  setGuideCompleted: (completed: boolean) => void;
  setLandscapeHintAcknowledged: (acknowledged: boolean) => void;
}

export interface UseGalleryGuideResult {
  state: GalleryGuideState;
  actions: GalleryGuideActions;
}

function usePersistedFlag(key: string, fallbackValue: boolean) {
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

export function useGalleryGuide(
  options: UseGalleryGuideOptions,
): UseGalleryGuideResult {
  const {
    isMobile,
    guideCompleted: guideCompletedProp,
    lastDepositSiteId,
    zone,
    hasInteracted,
    meadowArrivalAcknowledged,
    hasEncounteredMeadowCreature,
    nearbyDepositId,
    ritualSiteId,
    activeDepositId,
  } = options;

  const [guideCompleted, setGuideCompleted] = usePersistedFlag(
    GUIDE_COMPLETED_STORAGE_KEY,
    false,
  );
  const [landscapeHintAcknowledged, setLandscapeHintAcknowledged] =
    usePersistedFlag(MOBILE_LANDSCAPE_HINT_STORAGE_KEY, false);
  const [guideHidden, setGuideHidden] = useState(guideCompleted);
  const [guideExpanded, setGuideExpanded] = useState(false);
  const previousGuideStepRef = useRef<GuideStep>("intro");

  const guideStep = (() => {
    if (guideCompleted || lastDepositSiteId) return "complete";
    if (zone === "gallery") return hasInteracted ? "find-outdoor" : "intro";
    if (!meadowArrivalAcknowledged) return "arrive-globe";
    if (!hasEncounteredMeadowCreature) return "meet-creatures";
    if (nearbyDepositId || ritualSiteId || activeDepositId)
      return "deposit-ready";
    return "find-deposit";
  })() as GuideStep;

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
    if (!lastDepositSiteId || guideCompleted) return;
    setGuideCompleted(true);
    setGuideHidden(true);
  }, [guideCompleted, lastDepositSiteId, setGuideCompleted]);

  useEffect(() => {
    if (!lastDepositSiteId) return;
    const timer = window.setTimeout(() => { /* lastDepositSiteId cleared externally */ }, 2400);
    return () => window.clearTimeout(timer);
  }, [lastDepositSiteId]);

  const state: GalleryGuideState = {
    guideStep,
    guideHidden,
    guideExpanded,
    guideCompleted,
  };

  const actions: GalleryGuideActions = {
    setGuideHidden,
    setGuideExpanded,
    setGuideCompleted,
    setLandscapeHintAcknowledged,
  };

  return { state, actions };
}
