import * as THREE from "three";

export type MeadowSector =
  | "return_court"
  | "lantern_ridge"
  | "whisper_grove"
  | "shrine_basin"
  | "far_rim";

export type MeadowLandmarkKind =
  | "arch"
  | "lantern"
  | "beacon"
  | "tree"
  | "obelisk"
  | "house"
  | "shrine";

export type MeadowCreatureKind = "walker" | "percher" | "floater";

export type MeadowCreatureShape =
  | "seahorse"
  | "owl"
  | "lizard"
  | "snail"
  | "cat"
  | "frog";

export type AmbientAudioCue =
  | "gallery_hush"
  | "meadow_wind"
  | "creature_call"
  | "shrine_hum"
  | "return_hum";

export type GroundContactMode = "grounded" | "embedded" | "hover";

export interface MeadowSurfaceAnchor {
  planar: [number, number];
  contactMode: GroundContactMode;
  offset: number;
}

export interface CloudLayer {
  id: string;
  anchor: MeadowSurfaceAnchor;
  scale: number;
  opacity: number;
  tone: string;
  puffCount: number;
  spread: number;
  drift: number;
}

export interface TerrainScatterBand {
  id: string;
  sector: MeadowSector;
  center: [number, number];
  spread: [number, number];
  tone: string;
  opacity: number;
  accentTone: string;
  clusterCount: number;
}

export interface MeadowSectorDescriptor {
  id: MeadowSector;
  label: string;
  center: [number, number];
  radius: number;
  accent: string;
  summary: string;
}

export interface MeadowClearZone {
  id: string;
  center: [number, number];
  radius: number;
}

export interface MeadowLandmark {
  id: string;
  label: string;
  kind: MeadowLandmarkKind;
  sector: MeadowSector;
  planar: [number, number];
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  accent: string;
  scale: number;
  visibleDistance: number;
}

export interface MeadowDoorTrigger {
  id: "return";
  label: string;
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  radius: number;
}

export interface MeadowDepositSite {
  id: string;
  label: string;
  subtitle: string;
  planar: [number, number];
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  accent: string;
  sector: MeadowSector;
  landmarkId: string;
  interactionRadius: number;
}

export interface MeadowTree {
  id: string;
  anchor: MeadowSurfaceAnchor;
  scale: number;
  tone: string;
  secondaryTone: string;
  height: number;
  canopy: number;
  lean: number;
  sector: MeadowSector;
  landmark?: boolean;
}

export interface MeadowMonolith {
  id: string;
  anchor: MeadowSurfaceAnchor;
  width: number;
  height: number;
  rotation: number;
  color: string;
  glow: string;
  sector: MeadowSector;
}

export interface MeadowGrassPatch {
  id: string;
  center: [number, number];
  spread: [number, number];
  density: number;
  sector: MeadowSector;
}

export interface MeadowCreatureDefinition {
  id: string;
  label: string;
  kind: MeadowCreatureKind;
  shape: MeadowCreatureShape;
  sector: MeadowSector;
  color: string;
  accent: string;
  caption: string;
  scale: number;
  triggerDistance: number;
  visibleDistance: number;
  route?: Array<[number, number]>;
  perch?: [number, number];
  relocations?: Array<[number, number]>;
  orbitCenter?: [number, number];
  orbitRadius?: number;
  reactsToDepositId?: string;
}

export const MEADOW_WORLD_SCALE = 3;
export const MEADOW_PLANET_RADIUS = 108;
export const MEADOW_STAND_HEIGHT = 1.55;
export const MEADOW_PLANET_CENTER = new THREE.Vector3(0, -111, 0);
export const MEADOW_SURFACE_REFERENCE = new THREE.Vector3(0, 0, 1);
export const MEADOW_SURFACE_FALLBACK = new THREE.Vector3(1, 0, 0);

const scalePlanarPoint = (x: number, z: number) =>
  [x * MEADOW_WORLD_SCALE, z * MEADOW_WORLD_SCALE] as [number, number];

const scaleDistance = (value: number) => value * MEADOW_WORLD_SCALE;

const baseAnchor = (
  x: number,
  z: number,
  contactMode: GroundContactMode,
  offset: number,
): MeadowSurfaceAnchor => ({
  planar: scalePlanarPoint(x, z),
  contactMode,
  offset,
});

export const createGroundedAnchor = (x: number, z: number, offset = 0) =>
  baseAnchor(x, z, "grounded", offset);

export const createEmbeddedAnchor = (x: number, z: number, depth = 0.18) =>
  baseAnchor(x, z, "embedded", -Math.abs(depth));

export const createHoverAnchor = (x: number, z: number, height: number) =>
  baseAnchor(x, z, "hover", Math.max(height, 0));

export const projectPlanarPointToMeadowNormal = (x: number, z: number) =>
  new THREE.Vector3(x, MEADOW_PLANET_RADIUS, z).normalize();

export const projectPlanarPointToMeadowSurface = (
  x: number,
  z: number,
  lift = 0,
) =>
  MEADOW_PLANET_CENTER.clone().add(
    projectPlanarPointToMeadowNormal(x, z).multiplyScalar(
      MEADOW_PLANET_RADIUS + lift,
    ),
  );

export const resolveMeadowAnchorPosition = (
  anchor: MeadowSurfaceAnchor,
  extraOffset = 0,
) =>
  projectPlanarPointToMeadowSurface(
    anchor.planar[0],
    anchor.planar[1],
    anchor.offset + extraOffset,
  );

export const resolveMeadowAnchorTuple = (
  anchor: MeadowSurfaceAnchor,
  extraOffset = 0,
) => {
  const position = resolveMeadowAnchorPosition(anchor, extraOffset);
  return [position.x, position.y, position.z] as [number, number, number];
};

export const getMeadowNormalFromWorldPosition = (
  position: [number, number, number],
) =>
  new THREE.Vector3(position[0], position[1], position[2])
    .sub(MEADOW_PLANET_CENTER)
    .normalize();

export const getMeadowReferenceForward = (normal: THREE.Vector3) => {
  const forward = MEADOW_SURFACE_REFERENCE.clone().projectOnPlane(normal);
  if (forward.lengthSq() > 0.0001) return forward.normalize();
  return MEADOW_SURFACE_FALLBACK.clone().projectOnPlane(normal).normalize();
};

export const createMeadowDoorPosition = (x: number, z: number) =>
  resolveMeadowAnchorTuple(createGroundedAnchor(x, z), MEADOW_STAND_HEIGHT);

export const createMeadowSurfaceTuple = (x: number, z: number, lift = 0) => {
  const scaled = scalePlanarPoint(x, z);
  const position = projectPlanarPointToMeadowSurface(scaled[0], scaled[1], lift);
  return [position.x, position.y, position.z] as [number, number, number];
};

export const getPlanarFromWorldPosition = (position: THREE.Vector3) => {
  const normal = position.clone().sub(MEADOW_PLANET_CENTER).normalize();
  const safeY = Math.max(normal.y, 0.22);
  return {
    x: (normal.x / safeY) * MEADOW_PLANET_RADIUS,
    z: (normal.z / safeY) * MEADOW_PLANET_RADIUS,
  };
};

export const distanceBetweenPlanarPoints = (
  a: [number, number],
  b: [number, number],
) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const MEADOW_SPAWN = {
  position: projectPlanarPointToMeadowSurface(0, scaleDistance(22), MEADOW_STAND_HEIGHT),
  yaw: Math.PI + 0.04,
  pitch: -0.22,
};

export const MEADOW_SECTORS: MeadowSectorDescriptor[] = [
  {
    id: "return_court",
    label: "Corte del ritorno",
    center: scalePlanarPoint(0, 26),
    radius: scaleDistance(10.6),
    accent: "#efe2c7",
    summary: "Terrazza ampia e leggibile attorno a GALLERIA.",
  },
  {
    id: "lantern_ridge",
    label: "Dorsale delle lanterne",
    center: scalePlanarPoint(0, 9),
    radius: scaleDistance(13.5),
    accent: "#f6d98e",
    summary: "Prima cresta viva, piena di luci sospese.",
  },
  {
    id: "whisper_grove",
    label: "Bosco dei sussurri",
    center: scalePlanarPoint(-19, 0),
    radius: scaleDistance(15),
    accent: "#a8c693",
    summary: "Alberi profondi, vento basso, creature in ascolto.",
  },
  {
    id: "shrine_basin",
    label: "Bacino dei santuari",
    center: scalePlanarPoint(10, -13),
    radius: scaleDistance(14),
    accent: "#f0c9a7",
    summary: "Rituali, bagliori e pietra chiara oltre la curva.",
  },
  {
    id: "far_rim",
    label: "Orlo lontano",
    center: scalePlanarPoint(25, 7),
    radius: scaleDistance(13.5),
    accent: "#d9e4ff",
    summary: "Un margine pallido con obelischi e casa muta.",
  },
];

export const MEADOW_CLEAR_ZONES: MeadowClearZone[] = [
  { id: "return-arch", center: scalePlanarPoint(0, 31), radius: scaleDistance(7.2) },
  { id: "arrival-terrace", center: scalePlanarPoint(0, 23), radius: scaleDistance(9.4) },
  { id: "arrival-path", center: scalePlanarPoint(0, 12), radius: scaleDistance(5.6) },
];

export const isPointInsideMeadowClearZone = (x: number, z: number) =>
  MEADOW_CLEAR_ZONES.some(
    (zone) => distanceBetweenPlanarPoints(zone.center, [x, z]) < zone.radius,
  );

const RETURN_DOOR_ANCHOR = createGroundedAnchor(0, 31);

export const MEADOW_DOORS: MeadowDoorTrigger[] = [
  {
    id: "return",
    label: "GALLERIA",
    anchor: RETURN_DOOR_ANCHOR,
    position: resolveMeadowAnchorTuple(RETURN_DOOR_ANCHOR, MEADOW_STAND_HEIGHT),
    radius: 8.1,
  },
];

export const MEADOW_LANDMARKS: MeadowLandmark[] = [
  {
    id: "galleria-arch",
    label: "GALLERIA",
    kind: "arch",
    sector: "return_court",
    planar: RETURN_DOOR_ANCHOR.planar,
    anchor: RETURN_DOOR_ANCHOR,
    position: resolveMeadowAnchorTuple(RETURN_DOOR_ANCHOR, 6.8),
    accent: "#efe2c7",
    scale: 1.38,
    visibleDistance: scaleDistance(28),
  },
  {
    id: "lantern-threshold",
    label: "Lanterna di soglia",
    kind: "lantern",
    sector: "return_court",
    planar: scalePlanarPoint(0, 18),
    anchor: createHoverAnchor(0, 18, 10.8),
    position: resolveMeadowAnchorTuple(createHoverAnchor(0, 18, 10.8)),
    accent: "#f4d28c",
    scale: 1.4,
    visibleDistance: scaleDistance(24),
  },
  {
    id: "lantern-crown",
    label: "Corona di lanterne",
    kind: "beacon",
    sector: "lantern_ridge",
    planar: scalePlanarPoint(0, 8),
    anchor: createHoverAnchor(0, 8, 7.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(0, 8, 7.6)),
    accent: "#f7d271",
    scale: 2.1,
    visibleDistance: scaleDistance(34),
  },
  {
    id: "cedro-vecchio",
    label: "Cedro inclinato",
    kind: "tree",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-20, 8),
    anchor: createGroundedAnchor(-20, 8),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(-20, 8), 18),
    accent: "#8aa96d",
    scale: 4.9,
    visibleDistance: scaleDistance(38),
  },
  {
    id: "casa-muta",
    label: "Casa muta",
    kind: "house",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-24, -6),
    anchor: createGroundedAnchor(-24, -6),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(-24, -6), 6),
    accent: "#efe7d8",
    scale: 2.4,
    visibleDistance: scaleDistance(32),
  },
  {
    id: "bacino-della-luna",
    label: "Bacino della luna",
    kind: "shrine",
    sector: "shrine_basin",
    planar: scalePlanarPoint(8, -12),
    anchor: createEmbeddedAnchor(8, -12, 0.18),
    position: resolveMeadowAnchorTuple(createEmbeddedAnchor(8, -12, 0.18), 4.2),
    accent: "#f1c8a2",
    scale: 2.2,
    visibleDistance: scaleDistance(34),
  },
  {
    id: "obelisco-pallido",
    label: "Obelisco pallido",
    kind: "obelisk",
    sector: "far_rim",
    planar: scalePlanarPoint(22, 7),
    anchor: createGroundedAnchor(22, 7),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(22, 7), 12),
    accent: "#dbe6ff",
    scale: 3.15,
    visibleDistance: scaleDistance(34),
  },
  {
    id: "bocca-del-cielo",
    label: "Bocca del cielo",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(14, 20),
    anchor: createHoverAnchor(14, 20, 13.2),
    position: resolveMeadowAnchorTuple(createHoverAnchor(14, 20, 13.2)),
    accent: "#c9dbff",
    scale: 1.8,
    visibleDistance: scaleDistance(30),
  },
  {
    id: "spirale-dei-reeds",
    label: "Spirale dei canneti",
    kind: "shrine",
    sector: "lantern_ridge",
    planar: scalePlanarPoint(-10, 0),
    anchor: createEmbeddedAnchor(-10, 0, 0.14),
    position: resolveMeadowAnchorTuple(createEmbeddedAnchor(-10, 0, 0.14), 3.8),
    accent: "#d7ebb4",
    scale: 1.7,
    visibleDistance: scaleDistance(26),
  },
];

const WEST_DEPOSIT_ANCHOR = createEmbeddedAnchor(-15, -7, 0.08);
const CENTER_DEPOSIT_ANCHOR = createEmbeddedAnchor(7, -12, 0.08);
const EAST_DEPOSIT_ANCHOR = createEmbeddedAnchor(20, 11, 0.08);

export const MEADOW_DEPOSIT_SITES: MeadowDepositSite[] = [
  {
    id: "radura-ovest",
    label: "Radura Ovest",
    subtitle: "Fra felci alte, pietre basse e vento che gira nel cedro",
    planar: WEST_DEPOSIT_ANCHOR.planar,
    anchor: WEST_DEPOSIT_ANCHOR,
    position: resolveMeadowAnchorTuple(WEST_DEPOSIT_ANCHOR, 1.4),
    accent: "#d8e7b2",
    sector: "whisper_grove",
    landmarkId: "cedro-vecchio",
    interactionRadius: 7.2,
  },
  {
    id: "radura-centrale",
    label: "Radura Centrale",
    subtitle: "Nel bacino che raccoglie il vento e lo restituisce piu caldo",
    planar: CENTER_DEPOSIT_ANCHOR.planar,
    anchor: CENTER_DEPOSIT_ANCHOR,
    position: resolveMeadowAnchorTuple(CENTER_DEPOSIT_ANCHOR, 1.4),
    accent: "#ffd6b3",
    sector: "shrine_basin",
    landmarkId: "bacino-della-luna",
    interactionRadius: 7.4,
  },
  {
    id: "radura-est",
    label: "Radura Est",
    subtitle: "Sotto l'obelisco pallido, dove il bordo diventa piu quieto",
    planar: EAST_DEPOSIT_ANCHOR.planar,
    anchor: EAST_DEPOSIT_ANCHOR,
    position: resolveMeadowAnchorTuple(EAST_DEPOSIT_ANCHOR, 1.4),
    accent: "#d7e1ff",
    sector: "far_rim",
    landmarkId: "obelisco-pallido",
    interactionRadius: 7.4,
  },
];

const tree = (
  id: string,
  x: number,
  z: number,
  config: Omit<MeadowTree, "id" | "anchor"> & { offset?: number },
): MeadowTree => ({
  id,
  anchor: createGroundedAnchor(x, z, config.offset ?? 0),
  scale: config.scale,
  tone: config.tone,
  secondaryTone: config.secondaryTone,
  height: config.height,
  canopy: config.canopy,
  lean: config.lean,
  sector: config.sector,
  landmark: config.landmark,
});

export const MEADOW_TREE_LAYOUT: MeadowTree[] = [
  tree("return-left", -12, 29, {
    scale: 2.2,
    tone: "#5c7d43",
    secondaryTone: "#86a660",
    height: 9.2,
    canopy: 3.8,
    lean: -0.08,
    sector: "return_court",
  }),
  tree("return-right", 12, 28, {
    scale: 2.1,
    tone: "#5d8045",
    secondaryTone: "#88ab65",
    height: 8.8,
    canopy: 3.7,
    lean: 0.07,
    sector: "return_court",
  }),
  tree("terrace-left", -19, 20, {
    scale: 1.8,
    tone: "#63874d",
    secondaryTone: "#95b56c",
    height: 7.6,
    canopy: 3.1,
    lean: -0.04,
    sector: "return_court",
  }),
  tree("terrace-right", 18, 19, {
    scale: 1.7,
    tone: "#648a4f",
    secondaryTone: "#94b46b",
    height: 7.4,
    canopy: 3,
    lean: 0.05,
    sector: "return_court",
  }),
  tree("ridge-west", -12, 13, {
    scale: 1.9,
    tone: "#668b4d",
    secondaryTone: "#93b36a",
    height: 8.3,
    canopy: 3.2,
    lean: -0.02,
    sector: "lantern_ridge",
  }),
  tree("ridge-mid-west", -6, 8, {
    scale: 1.55,
    tone: "#6f9559",
    secondaryTone: "#9fbd78",
    height: 7.2,
    canopy: 2.9,
    lean: 0.03,
    sector: "lantern_ridge",
  }),
  tree("ridge-east", 13, 11, {
    scale: 1.95,
    tone: "#5c8144",
    secondaryTone: "#88a561",
    height: 8.5,
    canopy: 3.3,
    lean: 0.06,
    sector: "lantern_ridge",
  }),
  tree("ridge-east-low", 18, 3, {
    scale: 1.75,
    tone: "#557a3f",
    secondaryTone: "#7d9b58",
    height: 7.8,
    canopy: 3,
    lean: 0.04,
    sector: "lantern_ridge",
  }),
  tree("grove-cedar", -20, 8, {
    scale: 5.6,
    tone: "#577b43",
    secondaryTone: "#8bac69",
    height: 16.8,
    canopy: 6.1,
    lean: -0.12,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("grove-back", -24, 5, {
    scale: 2.35,
    tone: "#4e6f39",
    secondaryTone: "#7d9d59",
    height: 9.6,
    canopy: 3.7,
    lean: -0.06,
    sector: "whisper_grove",
  }),
  tree("grove-deep", -22, -1, {
    scale: 2.2,
    tone: "#567a3d",
    secondaryTone: "#89a966",
    height: 9.1,
    canopy: 3.5,
    lean: 0.03,
    sector: "whisper_grove",
  }),
  tree("grove-low", -18, -5, {
    scale: 2.05,
    tone: "#6b9150",
    secondaryTone: "#9cbb74",
    height: 8.7,
    canopy: 3.3,
    lean: 0.05,
    sector: "whisper_grove",
  }),
  tree("grove-rim", -12, -8, {
    scale: 1.9,
    tone: "#71985a",
    secondaryTone: "#a6c47e",
    height: 8.1,
    canopy: 3.1,
    lean: -0.02,
    sector: "whisper_grove",
  }),
  tree("grove-far", -27, -2, {
    scale: 1.95,
    tone: "#63864b",
    secondaryTone: "#95b26e",
    height: 8.2,
    canopy: 3.2,
    lean: -0.03,
    sector: "whisper_grove",
  }),
  tree("grove-east", -10, 0, {
    scale: 1.8,
    tone: "#557844",
    secondaryTone: "#7e9d60",
    height: 7.9,
    canopy: 3,
    lean: 0.04,
    sector: "whisper_grove",
  }),
  tree("grove-south", -26, -9, {
    scale: 2.05,
    tone: "#527240",
    secondaryTone: "#82a466",
    height: 8.6,
    canopy: 3.3,
    lean: -0.06,
    sector: "whisper_grove",
  }),
  tree("basin-west", 1, -18, {
    scale: 1.7,
    tone: "#6e8b55",
    secondaryTone: "#97b675",
    height: 7.4,
    canopy: 2.9,
    lean: -0.04,
    sector: "shrine_basin",
  }),
  tree("basin-south", 10, -21, {
    scale: 1.78,
    tone: "#63824d",
    secondaryTone: "#8fab6a",
    height: 7.7,
    canopy: 3,
    lean: 0.03,
    sector: "shrine_basin",
  }),
  tree("basin-east", 16, -13, {
    scale: 1.72,
    tone: "#5d7e45",
    secondaryTone: "#84a363",
    height: 7.5,
    canopy: 2.9,
    lean: 0.05,
    sector: "shrine_basin",
  }),
  tree("basin-north", 12, -7, {
    scale: 1.65,
    tone: "#678851",
    secondaryTone: "#92b26f",
    height: 7.1,
    canopy: 2.8,
    lean: -0.02,
    sector: "shrine_basin",
  }),
  tree("rim-front", 19, 15, {
    scale: 1.9,
    tone: "#5d8443",
    secondaryTone: "#8eaf67",
    height: 8.1,
    canopy: 3.2,
    lean: 0.05,
    sector: "far_rim",
  }),
  tree("rim-west", 18, 4, {
    scale: 1.78,
    tone: "#63894a",
    secondaryTone: "#94b36c",
    height: 7.7,
    canopy: 3,
    lean: -0.02,
    sector: "far_rim",
  }),
  tree("rim-east", 26, 10, {
    scale: 2.08,
    tone: "#56773e",
    secondaryTone: "#7d9b5f",
    height: 8.8,
    canopy: 3.4,
    lean: 0.07,
    sector: "far_rim",
  }),
  tree("rim-back", 27, 1, {
    scale: 1.84,
    tone: "#648b4d",
    secondaryTone: "#95b672",
    height: 7.9,
    canopy: 3,
    lean: 0.02,
    sector: "far_rim",
  }),
  tree("rim-crown", 24, 18, {
    scale: 2.15,
    tone: "#53763f",
    secondaryTone: "#7f9c61",
    height: 9.1,
    canopy: 3.6,
    lean: -0.04,
    sector: "far_rim",
  }),
];

const monolith = (
  id: string,
  x: number,
  z: number,
  config: Omit<MeadowMonolith, "id" | "anchor">,
): MeadowMonolith => ({
  id,
  anchor: createEmbeddedAnchor(x, z, 0.12),
  width: config.width,
  height: config.height,
  rotation: config.rotation,
  color: config.color,
  glow: config.glow,
  sector: config.sector,
});

export const MEADOW_MONOLITHS: MeadowMonolith[] = [
  monolith("ridge-observer", 10, 6, {
    width: 2.5,
    height: 17.5,
    rotation: 0.14,
    color: "#655c56",
    glow: "#dec7a7",
    sector: "lantern_ridge",
  }),
  monolith("grove-needle", -5, -14, {
    width: 3.1,
    height: 19,
    rotation: -0.2,
    color: "#67554b",
    glow: "#d7bea1",
    sector: "shrine_basin",
  }),
  monolith("quiet-obelisk", 22, 7, {
    width: 3.6,
    height: 25,
    rotation: 0.08,
    color: "#7b726d",
    glow: "#e4eef8",
    sector: "far_rim",
  }),
  monolith("rim-sister", 25, 13, {
    width: 2.7,
    height: 18.8,
    rotation: 0.22,
    color: "#72665f",
    glow: "#cad9ff",
    sector: "far_rim",
  }),
  monolith("grove-split", -24, -8, {
    width: 2.4,
    height: 15.8,
    rotation: -0.18,
    color: "#6b5b50",
    glow: "#e3cfb0",
    sector: "whisper_grove",
  }),
  monolith("return-cairn-left", -15, 26, {
    width: 2.1,
    height: 11.4,
    rotation: -0.05,
    color: "#7a6c60",
    glow: "#f2dec2",
    sector: "return_court",
  }),
  monolith("return-cairn-right", 15, 25, {
    width: 2.1,
    height: 11.2,
    rotation: 0.08,
    color: "#7d6e63",
    glow: "#f2dec2",
    sector: "return_court",
  }),
];

export const MEADOW_GRASS_PATCHES: MeadowGrassPatch[] = [
  { id: "court-left", center: scalePlanarPoint(-10, 24), spread: scalePlanarPoint(9, 6), density: 1.1, sector: "return_court" },
  { id: "court-right", center: scalePlanarPoint(10, 23), spread: scalePlanarPoint(9, 6), density: 1.08, sector: "return_court" },
  { id: "ridge", center: scalePlanarPoint(0, 8), spread: scalePlanarPoint(15, 12), density: 1.32, sector: "lantern_ridge" },
  { id: "grove-front", center: scalePlanarPoint(-16, 4), spread: scalePlanarPoint(12, 10), density: 1.42, sector: "whisper_grove" },
  { id: "grove-deep", center: scalePlanarPoint(-22, -4), spread: scalePlanarPoint(11, 10), density: 1.48, sector: "whisper_grove" },
  { id: "grove-arc", center: scalePlanarPoint(-10, -2), spread: scalePlanarPoint(8, 8), density: 1.28, sector: "whisper_grove" },
  { id: "basin", center: scalePlanarPoint(7, -12), spread: scalePlanarPoint(15, 11), density: 1.34, sector: "shrine_basin" },
  { id: "basin-east", center: scalePlanarPoint(15, -8), spread: scalePlanarPoint(10, 8), density: 1.12, sector: "shrine_basin" },
  { id: "far-rim", center: scalePlanarPoint(22, 8), spread: scalePlanarPoint(12, 10), density: 1.22, sector: "far_rim" },
  { id: "far-rim-high", center: scalePlanarPoint(14, 18), spread: scalePlanarPoint(10, 7), density: 0.96, sector: "far_rim" },
];

export const MEADOW_TERRAIN_BANDS: TerrainScatterBand[] = [
  {
    id: "court-moss",
    sector: "return_court",
    center: scalePlanarPoint(0, 24),
    spread: scalePlanarPoint(18, 9),
    tone: "#7ea864",
    opacity: 0.24,
    accentTone: "#a8bf7d",
    clusterCount: 8,
  },
  {
    id: "ridge-gold",
    sector: "lantern_ridge",
    center: scalePlanarPoint(0, 10),
    spread: scalePlanarPoint(18, 10),
    tone: "#85a45d",
    opacity: 0.2,
    accentTone: "#c8c282",
    clusterCount: 10,
  },
  {
    id: "grove-shade",
    sector: "whisper_grove",
    center: scalePlanarPoint(-18, 0),
    spread: scalePlanarPoint(16, 14),
    tone: "#5d7d48",
    opacity: 0.26,
    accentTone: "#7ea35f",
    clusterCount: 12,
  },
  {
    id: "basin-warmth",
    sector: "shrine_basin",
    center: scalePlanarPoint(8, -12),
    spread: scalePlanarPoint(16, 12),
    tone: "#8ba66b",
    opacity: 0.22,
    accentTone: "#d7b38d",
    clusterCount: 10,
  },
  {
    id: "rim-cool",
    sector: "far_rim",
    center: scalePlanarPoint(23, 9),
    spread: scalePlanarPoint(14, 12),
    tone: "#7ea06a",
    opacity: 0.2,
    accentTone: "#c7d8ef",
    clusterCount: 9,
  },
];

export const MEADOW_CLOUD_LAYERS: CloudLayer[] = [
  {
    id: "court-cloudbank",
    anchor: createHoverAnchor(-8, 34, 19),
    scale: 7.2,
    opacity: 0.66,
    tone: "#fff8ef",
    puffCount: 6,
    spread: 6.8,
    drift: 0.12,
  },
  {
    id: "threshold-cloud",
    anchor: createHoverAnchor(10, 25, 17),
    scale: 5.8,
    opacity: 0.58,
    tone: "#f8f1e5",
    puffCount: 5,
    spread: 5.6,
    drift: 0.1,
  },
  {
    id: "ridge-sails",
    anchor: createHoverAnchor(-4, 10, 18),
    scale: 6.6,
    opacity: 0.55,
    tone: "#fdf6eb",
    puffCount: 7,
    spread: 7.5,
    drift: 0.14,
  },
  {
    id: "ridge-east-sails",
    anchor: createHoverAnchor(18, 6, 20),
    scale: 6.9,
    opacity: 0.52,
    tone: "#f9f3e8",
    puffCount: 6,
    spread: 8.2,
    drift: 0.11,
  },
  {
    id: "grove-soft-bank",
    anchor: createHoverAnchor(-24, 2, 16.5),
    scale: 5.2,
    opacity: 0.5,
    tone: "#f3eee4",
    puffCount: 5,
    spread: 5.5,
    drift: 0.08,
  },
  {
    id: "basin-ring",
    anchor: createHoverAnchor(10, -10, 18.5),
    scale: 6.4,
    opacity: 0.54,
    tone: "#fff7ee",
    puffCount: 7,
    spread: 6.7,
    drift: 0.15,
  },
  {
    id: "far-rim-bank",
    anchor: createHoverAnchor(24, 12, 21),
    scale: 7.1,
    opacity: 0.56,
    tone: "#f9f7f2",
    puffCount: 8,
    spread: 7.4,
    drift: 0.12,
  },
];

const scaleRoute = (route: Array<[number, number]>) =>
  route.map(([x, z]) => scalePlanarPoint(x, z));

export const MEADOW_CREATURES: MeadowCreatureDefinition[] = [
  {
    id: "camminatore-delle-lanterne",
    label: "Camminatore delle lanterne",
    kind: "walker",
    shape: "frog",
    sector: "lantern_ridge",
    color: "#d7c587",
    accent: "#fff1b8",
    caption: "Segue le luci basse: se lo perdi, cerca il prossimo alone sospeso.",
    scale: 1.25,
    triggerDistance: 11.5,
    visibleDistance: 34,
    route: scaleRoute([
      [-4, 14],
      [2, 10],
      [8, 6],
      [2, 2],
      [-5, 6],
    ]),
  },
  {
    id: "pellegrino-del-bacino",
    label: "Pellegrino del bacino",
    kind: "walker",
    shape: "cat",
    sector: "shrine_basin",
    color: "#b6c9d1",
    accent: "#e6f7ff",
    caption:
      "Non custodisce nulla: gira attorno ai santuari finché qualcuno lascia qualcosa al vento.",
    scale: 1.18,
    triggerDistance: 11,
    visibleDistance: 34,
    route: scaleRoute([
      [11, -7],
      [14, -12],
      [9, -17],
      [3, -13],
      [6, -8],
    ]),
  },
  {
    id: "gufo-del-cedro",
    label: "Gufo del cedro",
    kind: "percher",
    shape: "owl",
    sector: "whisper_grove",
    color: "#89725a",
    accent: "#f2e2c1",
    caption:
      "Se ti avvicini troppo cambia ramo, ma continua a seguirti con il collo.",
    scale: 1.3,
    triggerDistance: 12.2,
    visibleDistance: 40,
    perch: scalePlanarPoint(-20, 8),
    relocations: scaleRoute([
      [-24, 2],
      [-16, 1],
      [-22, -5],
    ]),
  },
  {
    id: "lucertola-dell-obelisco",
    label: "Lucertola dell'obelisco",
    kind: "percher",
    shape: "lizard",
    sector: "far_rim",
    color: "#90ab6f",
    accent: "#f0ffe2",
    caption:
      "Prende sole sulle pietre chiare e scatta appena sente passi vicini.",
    scale: 1.14,
    triggerDistance: 11.4,
    visibleDistance: 37,
    perch: scalePlanarPoint(22, 7),
    relocations: scaleRoute([
      [25, 11],
      [19, 13],
      [24, 2],
    ]),
  },
  {
    id: "nastro-del-bacino",
    label: "Nastro del bacino",
    kind: "floater",
    shape: "seahorse",
    sector: "shrine_basin",
    color: "#f1cfab",
    accent: "#fff6da",
    caption:
      "Quando un santuario si accende, il nastro stringe l'orbita per qualche secondo.",
    scale: 1.12,
    triggerDistance: 11.8,
    visibleDistance: 36,
    orbitCenter: scalePlanarPoint(7, -12),
    orbitRadius: scaleDistance(2.6),
    reactsToDepositId: "radura-centrale",
  },
  {
    id: "falena-dell-ovest",
    label: "Falena dell'ovest",
    kind: "floater",
    shape: "snail",
    sector: "whisper_grove",
    color: "#d6e7c0",
    accent: "#f6fff0",
    caption:
      "Sotto il cedro le spirali d'aria restano sospese un attimo in piu.",
    scale: 1.06,
    triggerDistance: 10.8,
    visibleDistance: 34,
    orbitCenter: scalePlanarPoint(-15, -7),
    orbitRadius: scaleDistance(2.1),
    reactsToDepositId: "radura-ovest",
  },
];

export const getMeadowSectorForWorldPosition = (position: THREE.Vector3) => {
  const planar = getPlanarFromWorldPosition(position);
  return MEADOW_SECTORS.reduce((closest, sector) => {
    const closestDistance = distanceBetweenPlanarPoints(closest.center, [
      planar.x,
      planar.z,
    ]);
    const nextDistance = distanceBetweenPlanarPoints(sector.center, [
      planar.x,
      planar.z,
    ]);
    return nextDistance < closestDistance ? sector : closest;
  }, MEADOW_SECTORS[0]).id;
};
