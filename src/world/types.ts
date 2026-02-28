import type * as THREE from "three";

export type RoomId =
  | "home_atrium"
  | "manifesto_room"
  | "regole_room"
  | "rimozione_room"
  | "archivio_room"
  | "offri_room"
  | "offering_detail_room";

export type RouteTarget =
  | "/"
  | "/che-cose"
  | "/regole"
  | "/rimozione"
  | "/entra"
  | "/offri"
  | `/o/${string}`;

export type HotspotAction =
  | { type: "navigate"; route: RouteTarget }
  | { type: "open_overlay"; overlay: "offri_form" | "offering_card" | "intro_help" }
  | { type: "focus_offering"; offeringId: string };

export type WorldTransition = {
  from: RoomId;
  to: RoomId;
  durationMs: number;
  easing: "easeInOutCubic";
};

export type RoomNode = {
  id: RoomId;
  route: RouteTarget | "/o/:id";
  title: string;
  description: string;
  portals: Array<{ to: RoomId; label: string; splineId: string }>;
  ambience: { colorA: string; colorB: string; fogDensity: number; audioStem: string };
  anchor: {
    camera: [number, number, number];
    lookAt: [number, number, number];
    roomCenter: [number, number, number];
  };
};

export type OffriOverlayState = {
  isOpen: boolean;
  step: 1 | 2 | 3 | 4 | 5;
  mediaType: "image" | "video" | "audio" | "text" | "pdf" | "link" | null;
  submitting: boolean;
  submitted: boolean;
};

export type TransitionState = {
  active: boolean;
  from: RoomId;
  to: RoomId;
  startAt: number;
  durationMs: number;
  easing: "easeInOutCubic";
};

export type WorldHotspot = {
  id: string;
  roomId: RoomId;
  label: string;
  mesh: THREE.Object3D;
  action: HotspotAction;
  kind: "portal" | "artifact" | "utility";
};

export type ArchivioArtifact = {
  id: string;
  title: string;
  authorName: string | null;
  mediaType: string;
};

export type WorldRoomRuntime = {
  id: RoomId;
  group: THREE.Group;
  hotspots: WorldHotspot[];
};

export type CompatibilityState = {
  webgl2: boolean;
};
