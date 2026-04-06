import {
  type DeviceClass,
  type GuideStep,
  type HudMode,
  type MobileControlsLayout,
  type MobileOrientationState,
  type QualityTier,
  type RenderProfile,
  type RenderProfilePreference,
  type ViewportMetrics,
  type WorldZone,
} from "@/components/cavapendo-gallery/runtime";
import type { AmbientAudioCue, MeadowDepositSite, MeadowSector } from "@/lib/meadowWorld";

export type AmbientTransitionCue = "portal_hit_out" | "portal_hit_in";

export interface Offering {
  id: string;
  title: string | null;
  note?: string | null;
  text_content?: string | null;
  media_type: string;
  file_url: string | null;
  link_url: string | null;
  author_name: string | null;
  author_type: string;
  created_at: string;
  approved_at?: string | null;
}

export interface DoorTrigger {
  id: "exit" | "outdoor" | "return";
  label: string;
  position: [number, number, number];
  radius: number;
}

export type DepositSite = MeadowDepositSite;

export type StoryCreatureKind =
  | "seahorse"
  | "owl"
  | "lizard"
  | "snail"
  | "cat"
  | "frog";

export interface StoryCreatureData {
  id: string;
  name: string;
  story: string;
  position: [number, number, number];
  color: string;
  kind: StoryCreatureKind;
  scale: number;
}

export interface JoystickInput {
  moveX: number;
  moveZ: number;
  lookX: number;
  lookY: number;
}

export interface InteractionTarget {
  type: "offering" | "creature" | "deposit" | "meadow-creature";
  id: string;
}

export interface MeadowCreatureRuntimeSnapshot {
  position: [number, number, number];
  sector: MeadowSector;
}

export interface MeadowDebugPose {
  planarX: number;
  planarZ: number;
  yaw?: number;
  pitch?: number;
  jumpHeight?: number;
}

export interface AmbientStateSnapshot {
  activeCues: AmbientAudioCue[];
  muted: boolean;
  volume: number;
  zone: WorldZone;
  galleryTrack: string | null;
  transition: {
    cue: AmbientTransitionCue | null;
    active: boolean;
  };
}

export interface WorldStateSnapshot {
  zone: WorldZone;
  sector: MeadowSector | null;
  deviceClass: DeviceClass;
  renderProfile: RenderProfile;
  resolvedRenderProfile: RenderProfile;
  renderProfilePreference: RenderProfilePreference;
  renderProfileSource: "manual" | "auto" | "auto_downgraded";
  renderProfileAutoFloor: RenderProfile;
  renderProfileReason: string | null;
  profileLocked: boolean;
  quality: QualityTier;
  hudMode: HudMode;
  mouseSensitivity: number;
  touchSensitivity: number;
  joystickRadius: number;
  mouseLookSensitivity: number;
  touchLookSensitivity: number;
  fullscreen: boolean;
  guideStep: GuideStep;
  outdoorRadius: number;
  mobileOrientationState: MobileOrientationState;
  controlsLayout: MobileControlsLayout;
  viewport: Pick<
    ViewportMetrics,
    "width" | "height" | "dpr" | "context" | "fullscreen"
  >;
  modal:
    | { type: "none"; id: null }
    | { type: "offering" | "creature" | "deposit" | "ritual"; id: string };
  player: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    vy: number;
    grounded: boolean;
  };
  nearbyTriggerId: DoorTrigger["id"] | null;
  nearbyDepositId: DepositSite["id"] | null;
  nearbyCreatureIds: string[];
  visibleLandmarkIds: string[];
  horizonLandmarkIds: string[];
  doorPrompt: string | null;
  ambience: AmbientStateSnapshot;
}
