import React from "react";
import { Canvas } from "@react-three/fiber";
import type { ResolvedRenderProfile, ViewportMetrics } from "@/components/cavapendo-gallery/runtime";
import type { Offering, DepositSite, WorldStateSnapshot } from "@/components/cavapendo-gallery/types";
import type { MeadowCreatureRuntimeSnapshot } from "@/components/cavapendo-gallery/types";
import { GalleryScene } from "@/components/cavapendo-gallery/gallery-scene";
import { MeadowScene as PremiumMeadowScene } from "@/components/cavapendo-gallery/meadow-scene";
import {
  RenderProfileGuardian,
  WorldController,
  VirtualJoystick,
} from "@/components/cavapendo-gallery/gameplay";
import { EYE_HEIGHT } from "@/components/cavapendo-gallery/config";
import { useTranslation } from "react-i18next";

class WebGLCrashBoundary extends React.Component<
  React.ComponentProps<"div">,
  { hasError: boolean }
> {
  constructor(props: React.ComponentProps<"div">) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[GalleryCanvas] WebGL render error:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#efe3d7]">
          <div className="text-center">
            <p className="text-sm font-light tracking-widest text-[#7d5f47] uppercase">
              WebGL non disponibile
            </p>
            <p className="mt-2 text-xs text-[#a08060]">
              La grafica 3D richiede WebGL. Prova con un altro browser.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface GalleryCanvasProps {
  zone: "gallery" | "meadow";
  isMobile: boolean;
  offerings: Offering[];
  renderProfile: ResolvedRenderProfile;
  depositCounts: Record<string, number>;
  activeRenderProfileId: string;
  deviceClass: "desktop" | "mobile";
  renderProfilePreference: string;
  sceneInterrupted: boolean;
  guideExpanded: boolean;
  showOrientationOverlay: boolean;
  mobileControlsLandscape: boolean;
  controlProfile: {
    mouseLookSensitivity: number;
    touchLookSensitivity: number;
    moveJoystickRadius: number;
    lookJoystickRadius: number;
    invertLookFactor: 1 | -1;
    reducedCameraMotion: boolean;
  };
  viewport: ViewportMetrics;
  fullscreen: boolean;
  keysDownRef: React.MutableRefObject<Set<string>>;
  interactRequestedRef: React.MutableRefObject<boolean>;
  joystickRef: React.MutableRefObject<{ moveX: number; moveZ: number; lookX: number; lookY: number }>;
  jumpRequestedRef: React.MutableRefObject<boolean>;
  meadowCreatureRuntimeRef: React.MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  meadowDebugPoseRef: React.MutableRefObject<((pose: { planarX: number; planarZ: number; yaw?: number; pitch?: number; jumpHeight?: number }) => void) | null>;
  snapshotRef: React.MutableRefObject<WorldStateSnapshot>;
  stepRef: React.RefObject<((deltaSeconds: number) => void) | null>;
  stepReadyRef: React.MutableRefObject<boolean>;
  stepWaitersRef: React.MutableRefObject<Array<() => void>>;
  onSelectOffering: (offering: Offering | null) => void;
  onSelectDeposit: (site: DepositSite) => void;
  onSelectCreature: (creatureId: string) => void;
  onDoorTrigger: (id: "exit" | "outdoor" | "return") => void;
  onInteraction: (target: { type: string; id: string }) => void;
  onActivity: () => void;
  onTriggerProximityChange: (id: "exit" | "outdoor" | "return" | null) => void;
  onDepositProximityChange: (id: string | null) => void;
  onCreatureProximityChange: (ids: string[]) => void;
  onSectorChange: (sector: string | null) => void;
  onVisibleLandmarksChange: (ids: string[]) => void;
  onHorizonLandmarksChange: (ids: string[]) => void;
  onDowngradeProfile: (profile: string) => void;
  onJoystickInput: (axis: "move" | "look", x: number, y: number) => void;
  nearbyDeposit: DepositSite | null;
  ritualSiteId: string | null;
  lastDepositSiteId: string | null;
  mobilePrimaryAction: { label: string; detail: string } | null;
  automationProfileLock: boolean;
  profileShiftLocked: boolean;
}

export function GalleryCanvas(props: GalleryCanvasProps) {
  const { t } = useTranslation();
  const {
    zone,
    isMobile,
    offerings,
    renderProfile,
    depositCounts,
    activeRenderProfileId,
    deviceClass,
    renderProfilePreference,
    sceneInterrupted,
    guideExpanded,
    showOrientationOverlay,
    mobileControlsLandscape,
    controlProfile,
    viewport,
    fullscreen,
    keysDownRef,
    interactRequestedRef,
    joystickRef,
    jumpRequestedRef,
    meadowCreatureRuntimeRef,
    meadowDebugPoseRef,
    snapshotRef,
    stepRef,
    stepReadyRef,
    stepWaitersRef,
    onSelectOffering,
    onSelectDeposit,
    onSelectCreature,
    onDoorTrigger,
    onInteraction,
    onActivity,
    onTriggerProximityChange,
    onDepositProximityChange,
    onCreatureProximityChange,
    onSectorChange,
    onVisibleLandmarksChange,
    onHorizonLandmarksChange,
    onDowngradeProfile,
    onJoystickInput,
    nearbyDeposit,
    ritualSiteId,
    lastDepositSiteId,
    mobilePrimaryAction,
    automationProfileLock,
    profileShiftLocked,
  } = props;

  return (
    <div className="absolute inset-0">
      <WebGLCrashBoundary>
        <Canvas
          camera={{ position: [0, EYE_HEIGHT, 8], fov: isMobile ? 62 : 56 }}
          dpr={renderProfile.dpr}
          gl={{
            antialias: renderProfile.antialias,
            alpha: false,
            powerPreference: renderProfile.powerPreference,
            failIfMajorPerformanceCaveat: false,
          }}
          style={{
            width: "100%",
            height: "100%",
            background: zone === "gallery" ? "#e2d5c7" : "#d1dfff",
          }}
          onError={(error) => {
            console.warn("[Canvas] WebGL error:", error);
          }}
        >
          {zone === "gallery" ? (
            <GalleryScene
              offerings={offerings}
              renderProfile={renderProfile}
              onSelectOffering={onSelectOffering}
            />
          ) : (
            <PremiumMeadowScene
              renderProfile={renderProfile}
              depositCounts={depositCounts}
              onSelectDeposit={onSelectDeposit}
              onSelectCreature={onSelectCreature}
              creatureRuntimeRef={meadowCreatureRuntimeRef}
              reactionSiteId={lastDepositSiteId}
            />
          )}

          <RenderProfileGuardian
            profileId={activeRenderProfileId as "desktop_showcase" | "desktop_balanced" | "mobile_balanced" | "mobile_safe"}
            deviceClass={deviceClass}
            allowAutoDowngrade={renderProfilePreference === "auto"}
            locked={
              automationProfileLock ||
              profileShiftLocked ||
              sceneInterrupted ||
              guideExpanded ||
              showOrientationOverlay
            }
            onDowngrade={onDowngradeProfile}
          />
          <WorldController
            zone={zone}
            modalOpen={sceneInterrupted}
            isMobile={isMobile}
            mouseLookSensitivity={controlProfile.mouseLookSensitivity}
            touchLookSensitivity={controlProfile.touchLookSensitivity}
            invertLookFactor={controlProfile.invertLookFactor}
            reducedCameraMotion={controlProfile.reducedCameraMotion}
            qualityTier={renderProfile.tier}
            landmarkDrawDistance={renderProfile.landmarkDrawDistance}
            viewport={viewport}
            fullscreen={fullscreen}
            keysDownRef={keysDownRef}
            interactRequestedRef={interactRequestedRef}
            joystickRef={joystickRef}
            jumpRequestedRef={jumpRequestedRef}
            onDoorTrigger={onDoorTrigger}
            onInteraction={onInteraction}
            onActivity={onActivity}
            onTriggerProximityChange={onTriggerProximityChange}
            onDepositProximityChange={onDepositProximityChange}
            onCreatureProximityChange={onCreatureProximityChange}
            onSectorChange={onSectorChange}
            onVisibleLandmarksChange={onVisibleLandmarksChange}
            onHorizonLandmarksChange={onHorizonLandmarksChange}
            registerStep={(step) => {
              (stepRef as React.MutableRefObject<((deltaSeconds: number) => void) | null>).current = step;
              if (!stepReadyRef.current) {
                stepReadyRef.current = true;
                stepWaitersRef.current.splice(0).forEach((resolve) => resolve());
              }
            }}
            debugPoseRef={meadowDebugPoseRef}
            creatureRuntimeRef={meadowCreatureRuntimeRef}
            snapshotRef={snapshotRef}
          />
        </Canvas>
      </WebGLCrashBoundary>

      {isMobile && !sceneInterrupted && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <VirtualJoystick
            label={t("gallery.mobileControls.steps")}
            hint={mobileControlsLandscape ? t("gallery.mobileControls.movement") : t("gallery.mobileControls.move")}
            deadZone={0.08}
            curveExponent={1.15}
            radius={controlProfile.moveJoystickRadius}
            className="left-0"
            style={{
              left: "calc(env(safe-area-inset-left, 0px) + 0.9rem)",
              bottom: mobileControlsLandscape
                ? "calc(env(safe-area-inset-bottom, 0px) + 1rem)"
                : "calc(env(safe-area-inset-bottom, 0px) + 0.85rem)",
            }}
            onInput={(x, y) => onJoystickInput("move", x, y)}
          />
          <VirtualJoystick
            label={t("gallery.mobileControls.camera")}
            hint={
              mobileControlsLandscape
                ? `${t("gallery.mobileControls.look")} ${controlProfile.touchLookSensitivity.toFixed(2)}`
                : t("gallery.mobileControls.look")
            }
            deadZone={0.14}
            curveExponent={1.75}
            radius={controlProfile.lookJoystickRadius}
            className="right-0"
            style={{
              right: "calc(env(safe-area-inset-right, 0px) + 0.9rem)",
              bottom: mobileControlsLandscape
                ? "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)"
                : "calc(env(safe-area-inset-bottom, 0px) + 5.85rem)",
            }}
            onInput={(x, y) => onJoystickInput("look", x, y)}
          />

          <div
            className="absolute right-0 flex flex-col items-end gap-3"
            style={{
              right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
              bottom: mobileControlsLandscape
                ? "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)"
                : "calc(env(safe-area-inset-bottom, 0px) + 13.25rem)",
            }}
          >
            {mobilePrimaryAction && (
              <button
                onClick={() => {
                  if (nearbyDeposit) {
                    onDoorTrigger(nearbyDeposit.id as "exit" | "outdoor" | "return");
                  }
                  onActivity();
                }}
                className="pointer-events-auto min-w-[8.8rem] rounded-[1.3rem] border border-[#d1c0ab] bg-[#f3eadf] px-4 py-3 text-left text-[#241a14] shadow-[0_18px_42px_rgba(0,0,0,0.24)]"
              >
                <div className="text-[0.62rem] uppercase tracking-[0.18em] text-[#6b5544]">
                  Azione
                </div>
                <div className="mt-1 text-sm font-medium uppercase tracking-[0.1em]">
                  {mobilePrimaryAction.label}
                </div>
                <div className="mt-0.5 text-[0.72rem] text-[#4d3a2e]">
                  {mobilePrimaryAction.detail}
                </div>
              </button>
            )}
            <button
              onPointerDown={() => {
                jumpRequestedRef.current = true;
                onActivity();
              }}
              className="pointer-events-auto rounded-full border border-white/10 bg-[#17110f]/88 px-5 py-3 text-[0.68rem] uppercase tracking-[0.18em] text-[#f7eee3] shadow-[0_18px_42px_rgba(0,0,0,0.3)] backdrop-blur-xl"
            >
              Salta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
