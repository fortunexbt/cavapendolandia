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

export type MeadowSkylineLandmarkKind = "tree" | "beacon" | "stone";

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
  | "wind"
  | "birds"
  | "grass"
  | "return_court_accent"
  | "lantern_ridge_accent"
  | "whisper_grove_accent"
  | "shrine_basin_accent"
  | "far_rim_accent"
  | "portal_hit_out"
  | "portal_hit_in"
  | "bird_call"
  | "gust"
  | "grass_rustle"
  | "wood_creak"
  | "wing_flutter";

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
  coreVisual?: boolean;
}

export interface MeadowSkylineLandmark {
  id: string;
  label: string;
  kind: MeadowSkylineLandmarkKind;
  sector: MeadowSector;
  planar: [number, number];
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  scale: number;
  visibleDistance: number;
  tone: string;
  accent: string;
  secondaryTone?: string;
  height?: number;
  canopy?: number;
  lean?: number;
  coreVisual?: boolean;
}

export interface MeadowSkylineRidge {
  id: string;
  label: string;
  sector: MeadowSector;
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  rotation: number;
  tone: string;
  accent: string;
  opacity: number;
  visibleDistance: number;
  coreVisual?: boolean;
}

export interface MeadowDoorTrigger {
  id: "return";
  label: string;
  anchor: MeadowSurfaceAnchor;
  position: [number, number, number];
  radius: number;
}

export type MeadowColliderKind =
  | "tree"
  | "monolith"
  | "house"
  | "shrine"
  | "obelisk"
  | "deposit";

export interface MeadowCollider {
  id: string;
  kind: MeadowColliderKind;
  center: [number, number];
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
  coreVisual?: boolean;
}

export interface MeadowGrassPatch {
  id: string;
  center: [number, number];
  spread: [number, number];
  density: number;
  sector: MeadowSector;
}

export interface MeadowReedStand {
  id: string;
  sector: MeadowSector;
  anchor: MeadowSurfaceAnchor;
  height: number;
  radius: number;
  density: number;
  tone: string;
  accent: string;
  coreVisual?: boolean;
}

export interface MeadowTerrainZone {
  id: string;
  center: [number, number];
  spread: [number, number];
  height: number;
  rotation?: number;
}

export interface MeadowTerrainFlattenZone {
  id: string;
  center: [number, number];
  radius: number;
  strength: number;
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
export const MEADOW_PLANET_RADIUS = 1200;
export const MEADOW_STAND_HEIGHT = 1.9;
export const MEADOW_MIN_NAV_NORMAL_Y = 0.05;
export const MEADOW_PLANET_CENTER = new THREE.Vector3(0, -1200, 0);
export const MEADOW_SURFACE_REFERENCE = new THREE.Vector3(0, 0, 1);
export const MEADOW_SURFACE_FALLBACK = new THREE.Vector3(1, 0, 0);
const MEADOW_ROTATE_X_AXIS = new THREE.Vector3(1, 0, 0);
const MEADOW_ROTATE_Z_AXIS = new THREE.Vector3(0, 0, 1);

const scalePlanarPoint = (x: number, z: number) =>
  [x * MEADOW_WORLD_SCALE, z * MEADOW_WORLD_SCALE] as [number, number];

const scaleDistance = (value: number) => value * MEADOW_WORLD_SCALE;

const clampTerrainLift = (value: number) =>
  THREE.MathUtils.clamp(value, scaleDistance(-7.5), scaleDistance(10.5));

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

export const projectPlanarPointToMeadowRadialNormal = (x: number, z: number) => {
  const northSouthAngle = z / MEADOW_PLANET_RADIUS;
  const eastWestAngle = x / MEADOW_PLANET_RADIUS;

  return new THREE.Vector3(0, 1, 0)
    .applyAxisAngle(MEADOW_ROTATE_X_AXIS, northSouthAngle)
    .applyAxisAngle(MEADOW_ROTATE_Z_AXIS, -eastWestAngle)
    .normalize();
};

export const getPlanarFromMeadowNormal = (
  normal: Pick<THREE.Vector3, "x" | "y" | "z">,
) => {
  const clampedZ = THREE.MathUtils.clamp(normal.z, -1, 1);

  return {
    x: Math.atan2(normal.x, normal.y) * MEADOW_PLANET_RADIUS,
    z: Math.asin(clampedZ) * MEADOW_PLANET_RADIUS,
  };
};

const terrainZone = (
  id: string,
  x: number,
  z: number,
  spreadX: number,
  spreadZ: number,
  height: number,
  rotation = 0,
): MeadowTerrainZone => ({
  id,
  center: scalePlanarPoint(x, z),
  spread: scalePlanarPoint(spreadX, spreadZ),
  height: scaleDistance(height),
  rotation,
});

export const MEADOW_TERRAIN_ZONES: MeadowTerrainZone[] = [
  terrainZone("forecourt-shelf", 0, 10, 24, 14, -0.4, 0),
  terrainZone("forecourt-south-lane", 0, -4, 20, 12, -0.28, 0),
  terrainZone("southern-bowl", 4, -23, 32, 18, -0.6, 0.02),
  terrainZone("left-south-ridge", -24, -20, 26, 15, 1.2, -0.14),
  terrainZone("center-south-rise", 5, -31, 22, 13, 1.1, 0.04),
  terrainZone("right-south-shelf", 27, -19, 24, 14, 1, 0.08),
  terrainZone("grove-to-basin-saddle", -9, -22, 18, 10, 0.4, -0.04),
  terrainZone("rim-connector", 18, -11, 18, 10, 0.3, 0.06),
  terrainZone("deep-south-west-rise", -44, -49, 22, 15, 0.55, -0.08),
  terrainZone("deep-south-center-rise", 2, -63, 28, 17, 0.66, 0.03),
  terrainZone("deep-south-east-rise", 46, -50, 22, 15, 0.58, 0.1),
];

const terrainFlattenZone = (
  id: string,
  x: number,
  z: number,
  radius: number,
  strength: number,
): MeadowTerrainFlattenZone => ({
  id,
  center: scalePlanarPoint(x, z),
  radius: scaleDistance(radius),
  strength,
});

export const MEADOW_TERRAIN_FLATTEN_ZONES: MeadowTerrainFlattenZone[] = [
  terrainFlattenZone("return-court", 0, 24, 8.8, 0.4),
  terrainFlattenZone("forecourt", 0, 11, 14.5, 0.84),
  terrainFlattenZone("forecourt-lane", 0, -2, 10.6, 0.74),
  terrainFlattenZone("house-muta", -24, -6, 9.4, 0.9),
  terrainFlattenZone("bacino-della-luna", 8, -12, 8.4, 0.76),
  terrainFlattenZone("orto-sommerso", -8, -27, 9.4, 0.88),
  terrainFlattenZone("casa-del-sole-basso", 14, -29, 9.6, 0.92),
  terrainFlattenZone("obelisco-di-sotto", 31, -18, 6.8, 0.72),
  terrainFlattenZone("specola-della-conca", -30, -40, 6.4, 0.74),
  terrainFlattenZone("anello-del-rim-est", 42, -28, 7.2, 0.78),
];

const sampleTerrainZoneLift = (
  x: number,
  z: number,
  zone: MeadowTerrainZone,
) => {
  const rotation = zone.rotation ?? 0;
  const dx = x - zone.center[0];
  const dz = z - zone.center[1];
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const rx = dx * cos - dz * sin;
  const rz = dx * sin + dz * cos;
  const nx = rx / Math.max(zone.spread[0], 0.001);
  const nz = rz / Math.max(zone.spread[1], 0.001);
  const distanceSquared = nx * nx + nz * nz;
  if (distanceSquared >= 1) return 0;
  const weight = 1 - distanceSquared;
  return zone.height * weight * weight * (3 - 2 * weight);
};

const getBaseMeadowTerrainLift = (x: number, z: number) =>
  MEADOW_TERRAIN_ZONES.reduce(
    (sum, zone) => sum + sampleTerrainZoneLift(x, z, zone),
    0,
  );

const sampleTerrainFlattenBlend = (
  x: number,
  z: number,
  zone: MeadowTerrainFlattenZone,
) => {
  const distance = distanceBetweenPlanarPoints([x, z], zone.center) / zone.radius;
  if (distance >= 1) return 0;
  const weight = 1 - distance;
  return zone.strength * weight * weight * (3 - 2 * weight);
};

export const getMeadowTerrainLift = (x: number, z: number) => {
  const rawLift = getBaseMeadowTerrainLift(x, z);
  let flattenWeight = 0;
  let flattenTarget = 0;

  MEADOW_TERRAIN_FLATTEN_ZONES.forEach((zone) => {
    const blend = sampleTerrainFlattenBlend(x, z, zone);
    if (blend <= 0) return;
    flattenWeight += blend;
    flattenTarget += getBaseMeadowTerrainLift(zone.center[0], zone.center[1]) * blend;
  });

  if (flattenWeight <= 0.0001) {
    return clampTerrainLift(rawLift);
  }

  const normalizedWeight = THREE.MathUtils.clamp(flattenWeight, 0, 0.94);
  const targetLift = flattenTarget / flattenWeight;
  return clampTerrainLift(
    THREE.MathUtils.lerp(rawLift, targetLift, normalizedWeight),
  );
};

export const getMeadowSurfaceRadius = (x: number, z: number, extraLift = 0) =>
  MEADOW_PLANET_RADIUS + getMeadowTerrainLift(x, z) + extraLift;

export const projectPlanarPointToMeadowNormal = (x: number, z: number) => {
  const surfacePoint = projectPlanarPointToMeadowSurface(x, z, 0);
  const eastPoint = projectPlanarPointToMeadowSurface(x + 1.2, z, 0);
  const northPoint = projectPlanarPointToMeadowSurface(x, z + 1.2, 0);
  const tangentEast = eastPoint.sub(surfacePoint);
  const tangentNorth = northPoint.sub(surfacePoint);
  const normal = tangentNorth.cross(tangentEast).normalize();
  const outward = surfacePoint.sub(MEADOW_PLANET_CENTER).normalize();
  if (normal.dot(outward) < 0) {
    normal.multiplyScalar(-1);
  }
  return normal;
};

export const projectPlanarPointToMeadowSurface = (
  x: number,
  z: number,
  lift = 0,
) =>
  MEADOW_PLANET_CENTER.clone().add(
    projectPlanarPointToMeadowRadialNormal(x, z).multiplyScalar(
      getMeadowSurfaceRadius(x, z, lift),
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
  return getPlanarFromMeadowNormal(normal);
};

export const distanceBetweenPlanarPoints = (
  a: [number, number],
  b: [number, number],
) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const MEADOW_SPAWN = {
  position: projectPlanarPointToMeadowSurface(0, scaleDistance(18), MEADOW_STAND_HEIGHT),
  yaw: Math.PI + 0.08,
  pitch: -0.08,
};

export const MEADOW_SECTORS: MeadowSectorDescriptor[] = [
  {
    id: "return_court",
    label: "Corte della soglia",
    center: scalePlanarPoint(0, 26),
    radius: scaleDistance(10.6),
    accent: "#efe2c7",
    summary: "Primo respiro fuori dal portale, aperto verso i tre cammini.",
  },
  {
    id: "lantern_ridge",
    label: "Radura di soglia",
    center: scalePlanarPoint(0, 9),
    radius: scaleDistance(13.5),
    accent: "#f6d98e",
    summary: "Una soglia allargata che accompagna lo sguardo verso ovest, sud ed est.",
  },
  {
    id: "whisper_grove",
    label: "Bosco Ovest",
    center: scalePlanarPoint(-19, 0),
    radius: scaleDistance(15),
    accent: "#a8c693",
    summary: "Canopie fitte, canneti bassi e creature che osservano da vicino.",
  },
  {
    id: "shrine_basin",
    label: "Bacino Meridiano",
    center: scalePlanarPoint(10, -13),
    radius: scaleDistance(14),
    accent: "#f0c9a7",
    summary: "Il cuore aperto dell'esterno: luce larga, pietra chiara e il rito principale.",
  },
  {
    id: "far_rim",
    label: "Orlo di Levante",
    center: scalePlanarPoint(25, 7),
    radius: scaleDistance(13.5),
    accent: "#d9e4ff",
    summary: "Un margine piu costruito, con pietra, soglie e vento piu freddo.",
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
    planar: scalePlanarPoint(-1, 14),
    anchor: createHoverAnchor(-1, 14, 13.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-1, 14, 13.6)),
    accent: "#f4d28c",
    scale: 1.9,
    visibleDistance: scaleDistance(24),
  },
  {
    id: "lantern-crown",
    label: "Corona di lanterne",
    kind: "beacon",
    sector: "lantern_ridge",
    planar: scalePlanarPoint(0, 4),
    anchor: createHoverAnchor(0, 4, 10.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(0, 4, 10.6)),
    accent: "#f7d271",
    scale: 2.6,
    visibleDistance: scaleDistance(38),
    coreVisual: true,
  },
  {
    id: "cedro-vecchio",
    label: "Cedro inclinato",
    kind: "tree",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-17, 6),
    anchor: createGroundedAnchor(-17, 6),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(-17, 6), 18),
    accent: "#8aa96d",
    scale: 4.9,
    visibleDistance: scaleDistance(38),
    coreVisual: true,
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
    coreVisual: true,
  },
  {
    id: "obelisco-pallido",
    label: "Obelisco pallido",
    kind: "obelisk",
    sector: "far_rim",
    planar: scalePlanarPoint(18, 5),
    anchor: createGroundedAnchor(18, 5),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(18, 5), 12),
    accent: "#dbe6ff",
    scale: 3.4,
    visibleDistance: scaleDistance(38),
    coreVisual: true,
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
    planar: scalePlanarPoint(-12, 3),
    anchor: createEmbeddedAnchor(-12, 3, 0.14),
    position: resolveMeadowAnchorTuple(createEmbeddedAnchor(-12, 3, 0.14), 4.2),
    accent: "#d7ebb4",
    scale: 2.15,
    visibleDistance: scaleDistance(32),
  },
  {
    id: "sentinella-dei-sussurri",
    label: "Sentinella dei sussurri",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-31, 9),
    anchor: createHoverAnchor(-31, 9, 11.2),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-31, 9, 11.2)),
    accent: "#dcecc0",
    scale: 1.82,
    visibleDistance: scaleDistance(33),
  },
  {
    id: "meridiana-del-bacino",
    label: "Meridiana del bacino",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(2, -18),
    anchor: createHoverAnchor(2, -18, 15.8),
    position: resolveMeadowAnchorTuple(createHoverAnchor(2, -18, 15.8)),
    accent: "#ffd7a8",
    scale: 2.8,
    visibleDistance: scaleDistance(42),
    coreVisual: true,
  },
  {
    id: "soglia-del-rim",
    label: "Soglia del rim",
    kind: "obelisk",
    sector: "far_rim",
    planar: scalePlanarPoint(31, -3),
    anchor: createGroundedAnchor(31, -3),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(31, -3), 10.8),
    accent: "#dbe4f6",
    scale: 3.4,
    visibleDistance: scaleDistance(44),
    coreVisual: true,
  },
  {
    id: "campana-del-sud",
    label: "Campana del sud",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-29, -17),
    anchor: createHoverAnchor(-29, -17, 15.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-29, -17, 15.6)),
    accent: "#e2f0c8",
    scale: 3.3,
    visibleDistance: scaleDistance(56),
    coreVisual: true,
  },
  {
    id: "orto-sommerso",
    label: "Orto sommerso",
    kind: "shrine",
    sector: "shrine_basin",
    planar: scalePlanarPoint(-8, -27),
    anchor: createEmbeddedAnchor(-8, -27, 0.16),
    position: resolveMeadowAnchorTuple(createEmbeddedAnchor(-8, -27, 0.16), 3.9),
    accent: "#efcfac",
    scale: 2.8,
    visibleDistance: scaleDistance(46),
    coreVisual: true,
  },
  {
    id: "casa-del-sole-basso",
    label: "Casa del sole basso",
    kind: "house",
    sector: "shrine_basin",
    planar: scalePlanarPoint(14, -29),
    anchor: createGroundedAnchor(14, -29),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(14, -29), 6.4),
    accent: "#f0e4d3",
    scale: 3.2,
    visibleDistance: scaleDistance(48),
    coreVisual: true,
  },
  {
    id: "obelisco-di-sotto",
    label: "Obelisco di sotto",
    kind: "obelisk",
    sector: "far_rim",
    planar: scalePlanarPoint(31, -18),
    anchor: createGroundedAnchor(31, -18),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(31, -18), 11.6),
    accent: "#d8e3f6",
    scale: 4.3,
    visibleDistance: scaleDistance(54),
    coreVisual: true,
  },
  {
    id: "lanterna-del-meriggio",
    label: "Lanterna del meriggio",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(0, -18),
    anchor: createHoverAnchor(0, -18, 18.4),
    position: resolveMeadowAnchorTuple(createHoverAnchor(0, -18, 18.4)),
    accent: "#ffe1ad",
    scale: 3.9,
    visibleDistance: scaleDistance(54),
    coreVisual: true,
  },
  {
    id: "faro-del-bordo-basso",
    label: "Faro del bordo basso",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(26, -14),
    anchor: createHoverAnchor(26, -14, 15.8),
    position: resolveMeadowAnchorTuple(createHoverAnchor(26, -14, 15.8)),
    accent: "#dde9ff",
    scale: 3.2,
    visibleDistance: scaleDistance(56),
    coreVisual: true,
  },
  {
    id: "veglia-del-bosco-basso",
    label: "Veglia del bosco basso",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-40, -14),
    anchor: createHoverAnchor(-40, -14, 15.4),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-40, -14, 15.4)),
    accent: "#dcecc2",
    scale: 2.9,
    visibleDistance: scaleDistance(58),
    coreVisual: true,
  },
  {
    id: "specchio-del-fondo",
    label: "Specchio del fondo",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(-1, -36),
    anchor: createHoverAnchor(-1, -36, 16.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-1, -36, 16.6)),
    accent: "#ffe0b5",
    scale: 3.2,
    visibleDistance: scaleDistance(58),
    coreVisual: true,
  },
  {
    id: "veglia-dell-orlo-alto",
    label: "Veglia dell'orlo alto",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(38, 16),
    anchor: createHoverAnchor(38, 16, 15.2),
    position: resolveMeadowAnchorTuple(createHoverAnchor(38, 16, 15.2)),
    accent: "#dfe9ff",
    scale: 2.8,
    visibleDistance: scaleDistance(56),
    coreVisual: true,
  },
  {
    id: "brace-del-sud-ovest",
    label: "Brace del sud ovest",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-44, -30),
    anchor: createHoverAnchor(-44, -30, 15.8),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-44, -30, 15.8)),
    accent: "#dcebbf",
    scale: 3,
    visibleDistance: scaleDistance(60),
    coreVisual: true,
  },
  {
    id: "lanterna-del-fondo-centrale",
    label: "Lanterna del fondo centrale",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(4, -43),
    anchor: createHoverAnchor(4, -43, 15.9),
    position: resolveMeadowAnchorTuple(createHoverAnchor(4, -43, 15.9)),
    accent: "#ffe3b4",
    scale: 3.1,
    visibleDistance: scaleDistance(60),
    coreVisual: true,
  },
  {
    id: "veglia-del-sud-est",
    label: "Veglia del sud est",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(39, -32),
    anchor: createHoverAnchor(39, -32, 15.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(39, -32, 15.6)),
    accent: "#deebff",
    scale: 2.9,
    visibleDistance: scaleDistance(60),
    coreVisual: true,
  },
  {
    id: "lanterna-della-curva-bassa",
    label: "Lanterna della curva bassa",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(10, -50),
    anchor: createHoverAnchor(10, -50, 17.4),
    position: resolveMeadowAnchorTuple(createHoverAnchor(10, -50, 17.4)),
    accent: "#ffe0ae",
    scale: 3.2,
    visibleDistance: scaleDistance(64),
    coreVisual: true,
  },
  {
    id: "veglia-del-fianco-lungo",
    label: "Veglia del fianco lungo",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(44, -45),
    anchor: createHoverAnchor(44, -45, 16.9),
    position: resolveMeadowAnchorTuple(createHoverAnchor(44, -45, 16.9)),
    accent: "#deebff",
    scale: 3.1,
    visibleDistance: scaleDistance(64),
    coreVisual: true,
  },
  {
    id: "faro-del-sud-profondo",
    label: "Faro del sud profondo",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-46, -52),
    anchor: createHoverAnchor(-46, -52, 18.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-46, -52, 18.6)),
    accent: "#dcebc4",
    scale: 3.5,
    visibleDistance: scaleDistance(68),
    coreVisual: true,
  },
  {
    id: "sole-del-fondo",
    label: "Sole del fondo",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(2, -54),
    anchor: createHoverAnchor(2, -54, 19.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(2, -54, 19.6)),
    accent: "#ffe1ab",
    scale: 3.7,
    visibleDistance: scaleDistance(70),
    coreVisual: true,
  },
  {
    id: "arco-dell-orlo-profondo",
    label: "Arco dell'orlo profondo",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(44, -50),
    anchor: createHoverAnchor(44, -50, 18.2),
    position: resolveMeadowAnchorTuple(createHoverAnchor(44, -50, 18.2)),
    accent: "#dfeaff",
    scale: 3.4,
    visibleDistance: scaleDistance(68),
    coreVisual: true,
  },
  {
    id: "corona-del-ponente",
    label: "Corona del ponente",
    kind: "beacon",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-44, -14),
    anchor: createHoverAnchor(-44, -14, 17.4),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-44, -14, 17.4)),
    accent: "#dfedc5",
    scale: 3.1,
    visibleDistance: scaleDistance(62),
    coreVisual: true,
  },
  {
    id: "specola-della-conca",
    label: "Specola della conca",
    kind: "obelisk",
    sector: "whisper_grove",
    planar: scalePlanarPoint(-30, -40),
    anchor: createGroundedAnchor(-30, -40),
    position: resolveMeadowAnchorTuple(createGroundedAnchor(-30, -40), 12.4),
    accent: "#e5efd4",
    scale: 3.6,
    visibleDistance: scaleDistance(64),
    coreVisual: true,
  },
  {
    id: "meridiano-della-brace",
    label: "Meridiano della brace",
    kind: "lantern",
    sector: "shrine_basin",
    planar: scalePlanarPoint(-1, -52),
    anchor: createHoverAnchor(-1, -52, 18.6),
    position: resolveMeadowAnchorTuple(createHoverAnchor(-1, -52, 18.6)),
    accent: "#ffe0ac",
    scale: 3.4,
    visibleDistance: scaleDistance(66),
    coreVisual: true,
  },
  {
    id: "anello-del-rim-est",
    label: "Anello del rim est",
    kind: "shrine",
    sector: "far_rim",
    planar: scalePlanarPoint(42, -28),
    anchor: createEmbeddedAnchor(42, -28, 0.16),
    position: resolveMeadowAnchorTuple(createEmbeddedAnchor(42, -28, 0.16), 4.2),
    accent: "#dfeaff",
    scale: 3.1,
    visibleDistance: scaleDistance(62),
    coreVisual: true,
  },
  {
    id: "vedetta-del-levante",
    label: "Vedetta del levante",
    kind: "beacon",
    sector: "far_rim",
    planar: scalePlanarPoint(53, -14),
    anchor: createHoverAnchor(53, -14, 17.8),
    position: resolveMeadowAnchorTuple(createHoverAnchor(53, -14, 17.8)),
    accent: "#e3ecff",
    scale: 3.2,
    visibleDistance: scaleDistance(64),
    coreVisual: true,
  },
];

const skylineLandmark = (
  config: Omit<MeadowSkylineLandmark, "planar" | "position">,
): MeadowSkylineLandmark => ({
  ...config,
  planar: config.anchor.planar,
  position: resolveMeadowAnchorTuple(config.anchor),
});

const skylineRidge = (
  config: Omit<MeadowSkylineRidge, "position">,
): MeadowSkylineRidge => ({
  ...config,
  position: resolveMeadowAnchorTuple(config.anchor),
});

export const MEADOW_SKYLINE_LANDMARKS: MeadowSkylineLandmark[] = [
  skylineLandmark({
    id: "skyline-return-left-crown",
    label: "Corona della soglia sinistra",
    kind: "tree",
    sector: "lantern_ridge",
    anchor: createGroundedAnchor(-12, -7, 0.08),
    scale: 6.1,
    visibleDistance: scaleDistance(114),
    tone: "#5a7944",
    accent: "#ece7ca",
    secondaryTone: "#88a968",
    height: 21.6,
    canopy: 7.6,
    lean: -0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-return-threshold-beacon",
    label: "Lanterna del varco",
    kind: "beacon",
    sector: "lantern_ridge",
    anchor: createHoverAnchor(0, -12, 24.8),
    scale: 1.92,
    visibleDistance: scaleDistance(118),
    tone: "#fff0cf",
    accent: "#fff7e1",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-return-right-crown",
    label: "Corona della soglia destra",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(12, -7, 0.08),
    scale: 6,
    visibleDistance: scaleDistance(114),
    tone: "#5d7b48",
    accent: "#e7edff",
    secondaryTone: "#8cab6d",
    height: 21.2,
    canopy: 7.5,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-return-south-left",
    label: "Canopia del passaggio ovest",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-34, -24, 0.08),
    scale: 5.9,
    visibleDistance: scaleDistance(122),
    tone: "#557644",
    accent: "#e9ebc8",
    secondaryTone: "#89ab6d",
    height: 21.8,
    canopy: 7.3,
    lean: -0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-return-south-meridian",
    label: "Meridiano della soglia",
    kind: "tree",
    sector: "shrine_basin",
    anchor: createGroundedAnchor(0, -28, 0.08),
    scale: 6.2,
    visibleDistance: scaleDistance(126),
    tone: "#597747",
    accent: "#ffe0b3",
    secondaryTone: "#8eae72",
    height: 22.6,
    canopy: 7.6,
    lean: 0.01,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-return-south-right",
    label: "Canopia del passaggio est",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(34, -24, 0.08),
    scale: 5.9,
    visibleDistance: scaleDistance(122),
    tone: "#587947",
    accent: "#e4ebff",
    secondaryTone: "#8eaf73",
    height: 21.7,
    canopy: 7.2,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-west-ridge",
    label: "Crinale del ponente",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-62, 18, 0.08),
    scale: 5.3,
    visibleDistance: scaleDistance(126),
    tone: "#506f3a",
    accent: "#dceac2",
    secondaryTone: "#819f62",
    height: 19.6,
    canopy: 6.9,
    lean: -0.04,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-west-basin",
    label: "Bacino del bosco basso",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-56, -28, 0.08),
    scale: 5.8,
    visibleDistance: scaleDistance(128),
    tone: "#557644",
    accent: "#e0ecc7",
    secondaryTone: "#87a86a",
    height: 21.4,
    canopy: 7.3,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-west-lower-crown",
    label: "Corona del fianco basso",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-50, -38, 0.08),
    scale: 5.7,
    visibleDistance: scaleDistance(130),
    tone: "#557544",
    accent: "#e3edca",
    secondaryTone: "#89a86d",
    height: 21.3,
    canopy: 7.1,
    lean: -0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-west-outer-beacon",
    label: "Faro del bordo del ponente",
    kind: "beacon",
    sector: "whisper_grove",
    anchor: createHoverAnchor(-68, -8, 23.4),
    scale: 1.46,
    visibleDistance: scaleDistance(128),
    tone: "#eff7e3",
    accent: "#fbfff2",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southwest-spine",
    label: "Spine della conca ovest",
    kind: "stone",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-48, -48, 0.12),
    scale: 4,
    visibleDistance: scaleDistance(132),
    tone: "#6c5c51",
    accent: "#ead6bb",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southwest-near-beacon",
    label: "Veglia della conca bassa",
    kind: "beacon",
    sector: "whisper_grove",
    anchor: createHoverAnchor(-38, -42, 18.4),
    scale: 1.36,
    visibleDistance: scaleDistance(130),
    tone: "#f3f6df",
    accent: "#fbfff0",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-left-crown",
    label: "Coro delle canopie basse",
    kind: "tree",
    sector: "shrine_basin",
    anchor: createGroundedAnchor(-28, -54, 0.08),
    scale: 6.2,
    visibleDistance: scaleDistance(136),
    tone: "#587747",
    accent: "#ece1c3",
    secondaryTone: "#8baa6d",
    height: 23.1,
    canopy: 7.8,
    lean: 0.04,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southwest-outer-crown",
    label: "Corona del sud ovest profondo",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-60, -55, 0.08),
    scale: 6.5,
    visibleDistance: scaleDistance(142),
    tone: "#567645",
    accent: "#e7efca",
    secondaryTone: "#8bab70",
    height: 24.2,
    canopy: 8.2,
    lean: -0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-inner-west-crown",
    label: "Canopia del mezzo sud ovest",
    kind: "tree",
    sector: "whisper_grove",
    anchor: createGroundedAnchor(-24, -46, 0.08),
    scale: 5.9,
    visibleDistance: scaleDistance(134),
    tone: "#587746",
    accent: "#efe3c4",
    secondaryTone: "#8dad72",
    height: 22.4,
    canopy: 7.4,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-meridian-crown",
    label: "Meridiano profondo",
    kind: "tree",
    sector: "shrine_basin",
    anchor: createGroundedAnchor(8, -54, 0.08),
    scale: 6.8,
    visibleDistance: scaleDistance(140),
    tone: "#557645",
    accent: "#ffe3af",
    secondaryTone: "#89aa6e",
    height: 24.4,
    canopy: 8.2,
    lean: 0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-near-meridian",
    label: "Meridiano vivo",
    kind: "tree",
    sector: "shrine_basin",
    anchor: createGroundedAnchor(2, -48, 0.08),
    scale: 6.1,
    visibleDistance: scaleDistance(136),
    tone: "#5c7947",
    accent: "#ffe5b8",
    secondaryTone: "#90ad70",
    height: 22.8,
    canopy: 7.5,
    lean: 0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-sun-beacon",
    label: "Sole del meridiano",
    kind: "beacon",
    sector: "shrine_basin",
    anchor: createHoverAnchor(6, -55, 24.2),
    scale: 1.56,
    visibleDistance: scaleDistance(142),
    tone: "#fff0cd",
    accent: "#fff4d9",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-outer-meridian",
    label: "Corona del sud profondo",
    kind: "tree",
    sector: "shrine_basin",
    anchor: createGroundedAnchor(0, -55, 0.08),
    scale: 7,
    visibleDistance: scaleDistance(146),
    tone: "#587547",
    accent: "#ffe4b8",
    secondaryTone: "#8eae72",
    height: 25.2,
    canopy: 8.5,
    lean: 0.01,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-south-inner-east-crown",
    label: "Canopia del mezzo sud est",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(28, -46, 0.08),
    scale: 5.8,
    visibleDistance: scaleDistance(134),
    tone: "#597846",
    accent: "#e4ecff",
    secondaryTone: "#8daf73",
    height: 22,
    canopy: 7.2,
    lean: -0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southeast-spine",
    label: "Spine del rim basso",
    kind: "stone",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(48, -48, 0.12),
    scale: 4.1,
    visibleDistance: scaleDistance(132),
    tone: "#726762",
    accent: "#dbe8ff",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southeast-near-beacon",
    label: "Veglia del rim basso",
    kind: "beacon",
    sector: "far_rim",
    anchor: createHoverAnchor(38, -42, 18.8),
    scale: 1.34,
    visibleDistance: scaleDistance(130),
    tone: "#eef4ff",
    accent: "#f6fbff",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-southeast-outer-crown",
    label: "Corona del sud est profondo",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(60, -55, 0.08),
    scale: 6.4,
    visibleDistance: scaleDistance(142),
    tone: "#587747",
    accent: "#e4ecff",
    secondaryTone: "#8eae73",
    height: 24,
    canopy: 8.1,
    lean: 0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-east-rim-crown",
    label: "Corona del rim est",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(60, -28, 0.08),
    scale: 6,
    visibleDistance: scaleDistance(132),
    tone: "#577845",
    accent: "#e1ebff",
    secondaryTone: "#89a96c",
    height: 21.8,
    canopy: 7.2,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-east-lower-crown",
    label: "Corona del fianco levante",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(50, -38, 0.08),
    scale: 5.6,
    visibleDistance: scaleDistance(130),
    tone: "#5a7b49",
    accent: "#e6edff",
    secondaryTone: "#8eaf73",
    height: 21.1,
    canopy: 7,
    lean: 0.03,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-east-ridge-beacon",
    label: "Vedetta dell'orlo chiaro",
    kind: "beacon",
    sector: "far_rim",
    anchor: createHoverAnchor(62, -20, 22.2),
    scale: 1.4,
    visibleDistance: scaleDistance(128),
    tone: "#ebf1ff",
    accent: "#f3f7ff",
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-east-north-ridge",
    label: "Crinale del levante",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(58, 24, 0.08),
    scale: 5.1,
    visibleDistance: scaleDistance(122),
    tone: "#607f4d",
    accent: "#e4ecff",
    secondaryTone: "#93b176",
    height: 18.8,
    canopy: 6.5,
    lean: 0.02,
    coreVisual: true,
  }),
  skylineLandmark({
    id: "skyline-west-far-beacon",
    label: "Veglia del ponente basso",
    kind: "beacon",
    sector: "whisper_grove",
    anchor: createHoverAnchor(-66, -22, 21),
    scale: 1.32,
    visibleDistance: scaleDistance(122),
    tone: "#eff6dd",
    accent: "#f7fbeb",
  }),
  skylineLandmark({
    id: "skyline-east-deep-crown",
    label: "Cresta del levante basso",
    kind: "tree",
    sector: "far_rim",
    anchor: createGroundedAnchor(62, -44, 0.08),
    scale: 5.5,
    visibleDistance: scaleDistance(126),
    tone: "#5c7d49",
    accent: "#e3ecff",
    secondaryTone: "#8faf72",
    height: 20.2,
    canopy: 6.9,
    lean: -0.02,
  }),
  skylineLandmark({
    id: "skyline-east-outer-beacon",
    label: "Faro del bordo di levante",
    kind: "beacon",
    sector: "far_rim",
    anchor: createHoverAnchor(70, -8, 23.8),
    scale: 1.46,
    visibleDistance: scaleDistance(128),
    tone: "#eef3ff",
    accent: "#f8fbff",
    coreVisual: true,
  }),
];

export const MEADOW_SKYLINE_RIDGES: MeadowSkylineRidge[] = [
  skylineRidge({
    id: "ridge-return-forward",
    label: "Spalla della soglia",
    sector: "lantern_ridge",
    anchor: createEmbeddedAnchor(0, -12, 0.18),
    width: 11.5,
    depth: 8,
    height: 4.2,
    rotation: 0.01,
    tone: "#68804f",
    accent: "#96b776",
    opacity: 0.78,
    visibleDistance: scaleDistance(110),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-return-left-shoulder",
    label: "Spalla della soglia ovest",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-11, -11, 0.18),
    width: 14,
    depth: 8,
    height: 5.6,
    rotation: -0.12,
    tone: "#61784b",
    accent: "#87a667",
    opacity: 0.82,
    visibleDistance: scaleDistance(116),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-return-right-shoulder",
    label: "Spalla della soglia est",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(11, -11, 0.18),
    width: 14,
    depth: 8,
    height: 5.6,
    rotation: 0.12,
    tone: "#627a4d",
    accent: "#88a96b",
    opacity: 0.82,
    visibleDistance: scaleDistance(116),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-west-shoulder",
    label: "Dorsale del ponente alto",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-62, 24, 0.22),
    width: 22,
    depth: 10,
    height: 7.2,
    rotation: -0.18,
    tone: "#5f7549",
    accent: "#7f9d61",
    opacity: 0.94,
    visibleDistance: scaleDistance(126),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-west-basin",
    label: "Conca bassa del ponente",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-56, -28, 0.24),
    width: 24,
    depth: 12,
    height: 8.4,
    rotation: 0.11,
    tone: "#5a7145",
    accent: "#78955b",
    opacity: 0.96,
    visibleDistance: scaleDistance(132),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-west-lower-step",
    label: "Spalla bassa del ponente",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-48, -36, 0.24),
    width: 24,
    depth: 11,
    height: 8.6,
    rotation: 0.03,
    tone: "#5b7246",
    accent: "#7f9f61",
    opacity: 0.97,
    visibleDistance: scaleDistance(132),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-southwest-bowl",
    label: "Bacino del sud ovest",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-46, -52, 0.26),
    width: 26,
    depth: 12,
    height: 9.8,
    rotation: -0.09,
    tone: "#587243",
    accent: "#7ea261",
    opacity: 0.98,
    visibleDistance: scaleDistance(136),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-deep-southwest-shoulder",
    label: "Spalla profonda del sud ovest",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-58, -55, 0.26),
    width: 28,
    depth: 13,
    height: 10.6,
    rotation: -0.12,
    tone: "#557142",
    accent: "#80a362",
    opacity: 0.99,
    visibleDistance: scaleDistance(142),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-southwest-inner",
    label: "Conca del mezzo sud ovest",
    sector: "whisper_grove",
    anchor: createEmbeddedAnchor(-30, -44, 0.25),
    width: 26,
    depth: 12,
    height: 9.2,
    rotation: -0.06,
    tone: "#587244",
    accent: "#80a263",
    opacity: 0.99,
    visibleDistance: scaleDistance(136),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-south-meridian",
    label: "Conca del meridiano",
    sector: "shrine_basin",
    anchor: createEmbeddedAnchor(3, -55, 0.28),
    width: 30,
    depth: 14,
    height: 11.2,
    rotation: 0.03,
    tone: "#5f7647",
    accent: "#8bad67",
    opacity: 1,
    visibleDistance: scaleDistance(142),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-south-inner-ring",
    label: "Anello basso del meridiano",
    sector: "shrine_basin",
    anchor: createEmbeddedAnchor(2, -50, 0.26),
    width: 28,
    depth: 13,
    height: 10,
    rotation: 0.02,
    tone: "#5d7648",
    accent: "#8daf69",
    opacity: 1,
    visibleDistance: scaleDistance(140),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-deep-south-meridian",
    label: "Spalla profonda del meridiano",
    sector: "shrine_basin",
    anchor: createEmbeddedAnchor(0, -55, 0.28),
    width: 32,
    depth: 15,
    height: 12.2,
    rotation: 0.02,
    tone: "#5d7546",
    accent: "#8dae69",
    opacity: 1,
    visibleDistance: scaleDistance(146),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-southeast-shelf",
    label: "Spalla del rim basso",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(46, -52, 0.24),
    width: 25,
    depth: 12,
    height: 9.1,
    rotation: 0.12,
    tone: "#5d7548",
    accent: "#86a867",
    opacity: 0.98,
    visibleDistance: scaleDistance(136),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-deep-southeast-shoulder",
    label: "Spalla profonda del sud est",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(58, -55, 0.26),
    width: 28,
    depth: 13,
    height: 10.4,
    rotation: 0.13,
    tone: "#5a7448",
    accent: "#87a969",
    opacity: 0.99,
    visibleDistance: scaleDistance(142),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-southeast-inner",
    label: "Spalla del mezzo sud est",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(34, -44, 0.24),
    width: 26,
    depth: 12,
    height: 9.3,
    rotation: 0.08,
    tone: "#5b7548",
    accent: "#87a966",
    opacity: 0.99,
    visibleDistance: scaleDistance(136),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-east-rim",
    label: "Spalla del levante",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(58, -28, 0.22),
    width: 22,
    depth: 10,
    height: 7.8,
    rotation: 0.18,
    tone: "#627a4c",
    accent: "#88aa6c",
    opacity: 0.94,
    visibleDistance: scaleDistance(130),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-east-lower-step",
    label: "Spalla bassa del levante",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(48, -36, 0.22),
    width: 24,
    depth: 11,
    height: 8.5,
    rotation: 0.14,
    tone: "#60794c",
    accent: "#89ab6b",
    opacity: 0.96,
    visibleDistance: scaleDistance(132),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-east-high",
    label: "Crinale chiaro del levante",
    sector: "far_rim",
    anchor: createEmbeddedAnchor(62, 24, 0.18),
    width: 18,
    depth: 9,
    height: 6.4,
    rotation: -0.14,
    tone: "#688253",
    accent: "#91b274",
    opacity: 0.9,
    visibleDistance: scaleDistance(124),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-northwest-hush",
    label: "Spalla quieta di ritorno",
    sector: "return_court",
    anchor: createEmbeddedAnchor(-46, 34, 0.18),
    width: 16,
    depth: 8,
    height: 5.5,
    rotation: -0.1,
    tone: "#6a8054",
    accent: "#97b777",
    opacity: 0.84,
    visibleDistance: scaleDistance(112),
    coreVisual: true,
  }),
  skylineRidge({
    id: "ridge-northeast-hush",
    label: "Spalla chiara di ritorno",
    sector: "return_court",
    anchor: createEmbeddedAnchor(46, 34, 0.18),
    width: 16,
    depth: 8,
    height: 5.4,
    rotation: 0.1,
    tone: "#6d8458",
    accent: "#9aba7a",
    opacity: 0.84,
    visibleDistance: scaleDistance(112),
    coreVisual: true,
  }),
];

export const getMeadowSkylineLandmarksForQuality = (
  quality: "high" | "medium" | "low",
) => {
  if (quality === "high") return MEADOW_SKYLINE_LANDMARKS;
  if (quality === "medium") {
    return MEADOW_SKYLINE_LANDMARKS.filter(
      (landmark, index) => landmark.coreVisual || index % 3 !== 1,
    );
  }
  return MEADOW_SKYLINE_LANDMARKS.filter((landmark) => landmark.coreVisual);
};

export const getMeadowSkylineRidgesForQuality = (
  quality: "high" | "medium" | "low",
) => {
  if (quality === "high") return MEADOW_SKYLINE_RIDGES;
  if (quality === "medium") {
    return MEADOW_SKYLINE_RIDGES.filter(
      (ridge, index) => ridge.coreVisual || index % 4 !== 1,
    );
  }
  return MEADOW_SKYLINE_RIDGES.filter((ridge) => ridge.coreVisual);
};

const WEST_DEPOSIT_ANCHOR = createEmbeddedAnchor(-15, -7, 0.08);
const HOUSE_DEPOSIT_ANCHOR = createEmbeddedAnchor(-24, -1, 0.06);
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
    id: "soglia-casa-muta",
    label: "Casa Muta",
    subtitle: "Alla soglia chiara, dove il vento entra piano e trattiene la voce",
    planar: HOUSE_DEPOSIT_ANCHOR.planar,
    anchor: HOUSE_DEPOSIT_ANCHOR,
    position: resolveMeadowAnchorTuple(HOUSE_DEPOSIT_ANCHOR, 1.3),
    accent: "#efe3d2",
    sector: "whisper_grove",
    landmarkId: "casa-muta",
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
  tree("return-south-west-crown", -10, -8, {
    scale: 3.1,
    tone: "#577744",
    secondaryTone: "#8dad6d",
    height: 11.8,
    canopy: 4.2,
    lean: -0.03,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("return-south-east-crown", 10, -8, {
    scale: 3.08,
    tone: "#5c7b46",
    secondaryTone: "#91b171",
    height: 11.6,
    canopy: 4.18,
    lean: 0.03,
    sector: "far_rim",
    landmark: true,
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
  tree("grove-west-watch", -32, 9, {
    scale: 2.16,
    tone: "#4d6d39",
    secondaryTone: "#7f9d5b",
    height: 9.1,
    canopy: 3.45,
    lean: -0.04,
    sector: "whisper_grove",
  }),
  tree("grove-west-hollow", -30, -12, {
    scale: 1.94,
    tone: "#567645",
    secondaryTone: "#88a86a",
    height: 8.2,
    canopy: 3.12,
    lean: 0.03,
    sector: "whisper_grove",
  }),
  tree("grove-south-ridge", -18, -16, {
    scale: 1.9,
    tone: "#5a7c49",
    secondaryTone: "#8cab6b",
    height: 8,
    canopy: 3.04,
    lean: 0.05,
    sector: "whisper_grove",
  }),
  tree("grove-deep-south", -28, -22, {
    scale: 3.1,
    tone: "#4f6f3b",
    secondaryTone: "#809e5e",
    height: 11.8,
    canopy: 4.2,
    lean: -0.04,
    sector: "whisper_grove",
  }),
  tree("grove-lower-west", -34, -18, {
    scale: 3.85,
    tone: "#577747",
    secondaryTone: "#89a66a",
    height: 14.6,
    canopy: 4.8,
    lean: 0.02,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("grove-outer-west", -41, -12, {
    scale: 3.2,
    tone: "#4f6f3c",
    secondaryTone: "#82a163",
    height: 12.4,
    canopy: 4.4,
    lean: -0.04,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("grove-bottom-watch", -37, -24, {
    scale: 2.76,
    tone: "#557644",
    secondaryTone: "#88a76a",
    height: 10.6,
    canopy: 4,
    lean: 0.03,
    sector: "whisper_grove",
  }),
  tree("grove-far-south-west", -45, -24, {
    scale: 3.1,
    tone: "#4d6c3a",
    secondaryTone: "#7f9d5e",
    height: 12.1,
    canopy: 4.3,
    lean: -0.05,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("grove-far-south-deep", -38, -34, {
    scale: 2.9,
    tone: "#567745",
    secondaryTone: "#88a76a",
    height: 11.2,
    canopy: 4.1,
    lean: 0.04,
    sector: "whisper_grove",
  }),
  tree("grove-south-bridge-low", -26, -40, {
    scale: 2.7,
    tone: "#59784a",
    secondaryTone: "#8dac70",
    height: 10.5,
    canopy: 3.9,
    lean: -0.03,
    sector: "whisper_grove",
  }),
  tree("grove-basin-bridge", -12, -24, {
    scale: 2.5,
    tone: "#5b7c49",
    secondaryTone: "#8eac6d",
    height: 9.8,
    canopy: 3.8,
    lean: 0.04,
    sector: "whisper_grove",
  }),
  tree("south-handoff-west", -20, -20, {
    scale: 2.95,
    tone: "#587746",
    secondaryTone: "#8bac6c",
    height: 10.8,
    canopy: 4.1,
    lean: -0.03,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("south-handoff-center-left", -7, -24, {
    scale: 2.54,
    tone: "#5d7d48",
    secondaryTone: "#8faf70",
    height: 9.8,
    canopy: 3.8,
    lean: 0.03,
    sector: "shrine_basin",
  }),
  tree("south-handoff-center-right", 9, -24, {
    scale: 2.58,
    tone: "#607f49",
    secondaryTone: "#92b171",
    height: 9.9,
    canopy: 3.82,
    lean: -0.02,
    sector: "shrine_basin",
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
  tree("basin-meridian", 1, -28, {
    scale: 1.88,
    tone: "#5f7d47",
    secondaryTone: "#8cac67",
    height: 8,
    canopy: 3.08,
    lean: -0.05,
    sector: "shrine_basin",
  }),
  tree("basin-south-east", 17, -24, {
    scale: 1.96,
    tone: "#587845",
    secondaryTone: "#86a766",
    height: 8.4,
    canopy: 3.18,
    lean: 0.04,
    sector: "shrine_basin",
  }),
  tree("basin-outer-east", 24, -15, {
    scale: 1.82,
    tone: "#628450",
    secondaryTone: "#94b473",
    height: 7.8,
    canopy: 2.94,
    lean: 0.02,
    sector: "shrine_basin",
  }),
  tree("basin-lower-west", -6, -29, {
    scale: 1.9,
    tone: "#5d7e46",
    secondaryTone: "#8cad69",
    height: 8.3,
    canopy: 3.18,
    lean: -0.03,
    sector: "shrine_basin",
  }),
  tree("basin-lower-center", 6, -31, {
    scale: 3.65,
    tone: "#587848",
    secondaryTone: "#88a86d",
    height: 13.8,
    canopy: 4.6,
    lean: 0.05,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("basin-lower-east", 19, -30, {
    scale: 2.64,
    tone: "#62814c",
    secondaryTone: "#95b271",
    height: 9.8,
    canopy: 3.9,
    lean: -0.04,
    sector: "shrine_basin",
  }),
  tree("south-handoff-east", 23, -21, {
    scale: 2.9,
    tone: "#5d7c48",
    secondaryTone: "#8dae70",
    height: 10.9,
    canopy: 4.1,
    lean: 0.04,
    sector: "far_rim",
    landmark: true,
  }),
  tree("basin-deep-south-west", -2, -37, {
    scale: 2.7,
    tone: "#587646",
    secondaryTone: "#88a86c",
    height: 10.1,
    canopy: 3.9,
    lean: -0.02,
    sector: "shrine_basin",
  }),
  tree("basin-deep-south-east", 16, -38, {
    scale: 2.84,
    tone: "#617f4c",
    secondaryTone: "#93b070",
    height: 10.7,
    canopy: 4.1,
    lean: 0.04,
    sector: "shrine_basin",
  }),
  tree("basin-floor-west", -10, -42, {
    scale: 2.76,
    tone: "#587649",
    secondaryTone: "#88a96f",
    height: 10.8,
    canopy: 4,
    lean: -0.04,
    sector: "shrine_basin",
  }),
  tree("basin-floor-center", 5, -44, {
    scale: 3.18,
    tone: "#5d7a4a",
    secondaryTone: "#91ad6f",
    height: 12.2,
    canopy: 4.5,
    lean: 0.03,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("basin-floor-east", 18, -41, {
    scale: 2.82,
    tone: "#648252",
    secondaryTone: "#97b576",
    height: 10.9,
    canopy: 4.1,
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
  tree("rim-south-gate", 30, -5, {
    scale: 1.92,
    tone: "#56783f",
    secondaryTone: "#839f62",
    height: 8.2,
    canopy: 3.14,
    lean: 0.03,
    sector: "far_rim",
  }),
  tree("rim-east-crest", 31, 20, {
    scale: 2.02,
    tone: "#5c8045",
    secondaryTone: "#8ea969",
    height: 8.7,
    canopy: 3.28,
    lean: -0.06,
    sector: "far_rim",
  }),
  tree("rim-low-east", 24, -10, {
    scale: 1.76,
    tone: "#64884f",
    secondaryTone: "#95b371",
    height: 7.6,
    canopy: 2.92,
    lean: 0.04,
    sector: "far_rim",
  }),
  tree("rim-south-deep", 28, -19, {
    scale: 3.85,
    tone: "#587744",
    secondaryTone: "#88a266",
    height: 14.8,
    canopy: 4.9,
    lean: 0.03,
    sector: "far_rim",
    landmark: true,
  }),
  tree("rim-bottom-east", 34, -12, {
    scale: 2.56,
    tone: "#62824e",
    secondaryTone: "#93af71",
    height: 9.4,
    canopy: 3.8,
    lean: -0.02,
    sector: "far_rim",
  }),
  tree("rim-bottom-crest", 22, -27, {
    scale: 2.82,
    tone: "#56753f",
    secondaryTone: "#839d61",
    height: 10.4,
    canopy: 4.1,
    lean: 0.05,
    sector: "far_rim",
  }),
  tree("rim-high-east", 39, 14, {
    scale: 2.92,
    tone: "#567741",
    secondaryTone: "#86a266",
    height: 10.8,
    canopy: 4.2,
    lean: -0.04,
    sector: "far_rim",
    landmark: true,
  }),
  tree("rim-deep-back", 36, -26, {
    scale: 2.74,
    tone: "#60804c",
    secondaryTone: "#90ad70",
    height: 10.2,
    canopy: 3.9,
    lean: 0.03,
    sector: "far_rim",
  }),
  tree("rim-far-south-west", 30, -38, {
    scale: 2.92,
    tone: "#587748",
    secondaryTone: "#8aa96e",
    height: 11.1,
    canopy: 4.2,
    lean: 0.04,
    sector: "far_rim",
  }),
  tree("rim-far-south-east", 42, -28, {
    scale: 3.16,
    tone: "#547542",
    secondaryTone: "#84a266",
    height: 12.4,
    canopy: 4.4,
    lean: -0.04,
    sector: "far_rim",
    landmark: true,
  }),
  tree("rim-far-east-crest", 44, -16, {
    scale: 2.7,
    tone: "#618051",
    secondaryTone: "#92af75",
    height: 10.4,
    canopy: 4,
    lean: 0.02,
    sector: "far_rim",
  }),
  tree("south-west-crown", -58, -48, {
    scale: 4.45,
    tone: "#4f703b",
    secondaryTone: "#809f60",
    height: 17.2,
    canopy: 5.9,
    lean: -0.04,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("south-west-inner", -46, -52, {
    scale: 3.16,
    tone: "#587845",
    secondaryTone: "#89a96b",
    height: 12.4,
    canopy: 4.3,
    lean: 0.03,
    sector: "whisper_grove",
  }),
  tree("south-basin-west", -20, -52, {
    scale: 3.34,
    tone: "#5a7a48",
    secondaryTone: "#8bab6d",
    height: 13.1,
    canopy: 4.6,
    lean: -0.02,
    sector: "shrine_basin",
  }),
  tree("south-meridian-crown", 2, -54, {
    scale: 4.82,
    tone: "#557644",
    secondaryTone: "#89a96c",
    height: 18.4,
    canopy: 6.2,
    lean: 0.02,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("south-basin-east", 20, -52, {
    scale: 3.28,
    tone: "#5e7d4a",
    secondaryTone: "#92b173",
    height: 12.8,
    canopy: 4.5,
    lean: 0.04,
    sector: "shrine_basin",
  }),
  tree("south-rim-sentinel", 38, -50, {
    scale: 4.38,
    tone: "#537443",
    secondaryTone: "#86a567",
    height: 16.9,
    canopy: 5.8,
    lean: -0.03,
    sector: "far_rim",
    landmark: true,
  }),
  tree("south-east-watch", 56, -50, {
    scale: 4.06,
    tone: "#587846",
    secondaryTone: "#8cac6e",
    height: 15.8,
    canopy: 5.3,
    lean: 0.03,
    sector: "far_rim",
    landmark: true,
  }),
  tree("south-east-inner", 46, -50, {
    scale: 3.06,
    tone: "#60814d",
    secondaryTone: "#93b172",
    height: 12.2,
    canopy: 4.2,
    lean: -0.02,
    sector: "far_rim",
  }),
  tree("outer-west-arc-sentinel", -46, -18, {
    scale: 3.42,
    tone: "#567744",
    secondaryTone: "#88a86a",
    height: 13.6,
    canopy: 4.8,
    lean: 0.02,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("southwest-basin-crown", -32, -40, {
    scale: 3.72,
    tone: "#52723f",
    secondaryTone: "#84a264",
    height: 14.8,
    canopy: 5.2,
    lean: -0.03,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("deep-meridian-sentinel", 4, -54, {
    scale: 3.84,
    tone: "#577645",
    secondaryTone: "#8aa96c",
    height: 15.2,
    canopy: 5.1,
    lean: 0.02,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("lower-west-sentinel", -52, -40, {
    scale: 4.12,
    tone: "#516f3d",
    secondaryTone: "#83a362",
    height: 16.1,
    canopy: 5.4,
    lean: -0.03,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("lower-west-inner-crown", -38, -46, {
    scale: 3.88,
    tone: "#567644",
    secondaryTone: "#89a86a",
    height: 15.2,
    canopy: 5.1,
    lean: 0.02,
    sector: "whisper_grove",
    landmark: true,
  }),
  tree("lower-meridian-west", -16, -50, {
    scale: 3.54,
    tone: "#5b7947",
    secondaryTone: "#8dad70",
    height: 13.8,
    canopy: 4.8,
    lean: -0.02,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("lower-meridian-east", 16, -52, {
    scale: 3.62,
    tone: "#5f7d4b",
    secondaryTone: "#93b174",
    height: 14.1,
    canopy: 4.9,
    lean: 0.03,
    sector: "shrine_basin",
    landmark: true,
  }),
  tree("lower-east-inner-crown", 38, -46, {
    scale: 3.92,
    tone: "#587746",
    secondaryTone: "#8bab6e",
    height: 15.3,
    canopy: 5.1,
    lean: -0.02,
    sector: "far_rim",
    landmark: true,
  }),
  tree("lower-east-sentinel", 52, -40, {
    scale: 4.08,
    tone: "#567545",
    secondaryTone: "#89a86c",
    height: 16,
    canopy: 5.3,
    lean: 0.03,
    sector: "far_rim",
    landmark: true,
  }),
  tree("east-rim-shoulder", 39, -34, {
    scale: 3.56,
    tone: "#587847",
    secondaryTone: "#8cad6e",
    height: 14.2,
    canopy: 4.9,
    lean: -0.02,
    sector: "far_rim",
    landmark: true,
  }),
  tree("east-outer-crest", 53, -14, {
    scale: 3.28,
    tone: "#5d7c4a",
    secondaryTone: "#90af73",
    height: 13,
    canopy: 4.6,
    lean: 0.03,
    sector: "far_rim",
  }),
  tree("west-outer-shoulder", -52, 2, {
    scale: 3.2,
    tone: "#577644",
    secondaryTone: "#89a869",
    height: 12.8,
    canopy: 4.5,
    lean: -0.02,
    sector: "whisper_grove",
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
  coreVisual: config.coreVisual,
});

export const MEADOW_MONOLITHS: MeadowMonolith[] = [
  monolith("ridge-observer", 10, 6, {
    width: 2.5,
    height: 17.5,
    rotation: 0.14,
    color: "#655c56",
    glow: "#dec7a7",
    sector: "lantern_ridge",
    coreVisual: true,
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
    coreVisual: true,
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
  monolith("grove-west-watch", -31, 4, {
    width: 2.35,
    height: 16.6,
    rotation: -0.12,
    color: "#6d5c51",
    glow: "#dcc7ab",
    sector: "whisper_grove",
  }),
  monolith("basin-south-spire", 5, -29, {
    width: 2.7,
    height: 18.9,
    rotation: 0.16,
    color: "#73635b",
    glow: "#efd0ae",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("return-south-core", 0, -12, {
    width: 2.35,
    height: 16.2,
    rotation: 0.04,
    color: "#76675e",
    glow: "#f2d7ae",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("rim-threshold-stone", 31, -2, {
    width: 2.5,
    height: 17.4,
    rotation: 0.18,
    color: "#746b67",
    glow: "#d9e7ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("grove-south-needle", -26, -24, {
    width: 2.55,
    height: 17.2,
    rotation: -0.16,
    color: "#6d5d52",
    glow: "#e1cfaf",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("orchard-spire", -7, -29, {
    width: 2.7,
    height: 18.2,
    rotation: 0.14,
    color: "#726258",
    glow: "#efcfad",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("low-sun-marker", 16, -31, {
    width: 2.6,
    height: 17.8,
    rotation: -0.1,
    color: "#766863",
    glow: "#f2dcc0",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("rim-south-observer", 31, -18, {
    width: 2.8,
    height: 19.4,
    rotation: 0.2,
    color: "#786f69",
    glow: "#d7e4ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("grove-outer-needle", -40, -16, {
    width: 2.65,
    height: 18.1,
    rotation: -0.18,
    color: "#6e5e53",
    glow: "#e2d1b5",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("basin-floor-marker", -2, -37, {
    width: 2.5,
    height: 17.6,
    rotation: 0.08,
    color: "#75655b",
    glow: "#f1d4b2",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("south-handoff-west-marker", -20, -20, {
    width: 2.5,
    height: 16.4,
    rotation: -0.1,
    color: "#716158",
    glow: "#e6d5bb",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("south-handoff-east-marker", 22, -20, {
    width: 2.55,
    height: 16.6,
    rotation: 0.12,
    color: "#756a62",
    glow: "#dfe9ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("rim-high-observer", 39, 13, {
    width: 2.7,
    height: 18.2,
    rotation: 0.14,
    color: "#776d68",
    glow: "#dbe7ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("deep-south-west-spine", -50, -50, {
    width: 3.1,
    height: 23.6,
    rotation: -0.14,
    color: "#6b5b51",
    glow: "#e2d0b5",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("deep-south-meridian-spire", 0, -54, {
    width: 3.5,
    height: 26.4,
    rotation: 0.06,
    color: "#776761",
    glow: "#f0d7af",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("deep-south-east-spine", 50, -50, {
    width: 3.2,
    height: 24.2,
    rotation: 0.18,
    color: "#766d67",
    glow: "#dbe8ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("west-basin-observer", -28, -42, {
    width: 2.9,
    height: 19.8,
    rotation: -0.18,
    color: "#6b5f57",
    glow: "#e6d5bb",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("deep-meridian-observer", 3, -54, {
    width: 3.1,
    height: 20.6,
    rotation: 0.04,
    color: "#73635d",
    glow: "#f3d8af",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("lower-west-spine", -56, -44, {
    width: 3.1,
    height: 22.4,
    rotation: -0.12,
    color: "#6f6057",
    glow: "#e5d3b7",
    sector: "whisper_grove",
    coreVisual: true,
  }),
  monolith("lower-meridian-spire", 4, -54, {
    width: 3.4,
    height: 24.8,
    rotation: 0.05,
    color: "#776962",
    glow: "#f1d9b3",
    sector: "shrine_basin",
    coreVisual: true,
  }),
  monolith("lower-east-spine", 56, -44, {
    width: 3.15,
    height: 22.8,
    rotation: 0.14,
    color: "#756b65",
    glow: "#dfe9ff",
    sector: "far_rim",
    coreVisual: true,
  }),
  monolith("east-rim-observer", 43, -30, {
    width: 3,
    height: 20.1,
    rotation: 0.16,
    color: "#736a64",
    glow: "#dfe9ff",
    sector: "far_rim",
    coreVisual: true,
  }),
];

export const MEADOW_PLAYER_COLLIDER_RADIUS = 1.45;

const toTreeCollider = (tree: MeadowTree): MeadowCollider => ({
  id: `tree:${tree.id}`,
  kind: "tree",
  center: tree.anchor.planar,
  radius: tree.landmark
    ? Math.max(3.55, tree.scale * 0.68)
    : Math.max(1.52, tree.scale * 0.58),
});

const toMonolithCollider = (monolith: MeadowMonolith): MeadowCollider => ({
  id: `monolith:${monolith.id}`,
  kind: "monolith",
  center: monolith.anchor.planar,
  radius: Math.max(1.3, monolith.width * 0.56),
});

const toLandmarkCollider = (
  landmark: MeadowLandmark,
): MeadowCollider | null => {
  if (landmark.kind === "house") {
    return {
      id: `landmark:${landmark.id}`,
      kind: "house",
      center: landmark.anchor.planar,
      radius: Math.max(2.35, landmark.scale * 0.96),
    };
  }

  if (landmark.kind === "shrine") {
    return {
      id: `landmark:${landmark.id}`,
      kind: "shrine",
      center: landmark.anchor.planar,
      radius: Math.max(2.8, landmark.scale * 1.24),
    };
  }

  if (landmark.kind === "obelisk") {
    return {
      id: `landmark:${landmark.id}`,
      kind: "obelisk",
      center: landmark.anchor.planar,
      radius: Math.max(2.02, landmark.scale * 0.8),
    };
  }

  return null;
};

const toDepositCollider = (site: MeadowDepositSite): MeadowCollider => ({
  id: `deposit:${site.id}`,
  kind: "deposit",
  center: site.anchor.planar,
  radius: 2.1,
});

export const MEADOW_COLLIDERS: MeadowCollider[] = [
  ...MEADOW_TREE_LAYOUT.map(toTreeCollider),
  ...MEADOW_MONOLITHS.map(toMonolithCollider),
  ...MEADOW_LANDMARKS.map(toLandmarkCollider).filter(Boolean),
  ...MEADOW_DEPOSIT_SITES.map(toDepositCollider),
] as MeadowCollider[];

export const resolvePlanarMeadowCollisions = (
  point: [number, number],
  playerRadius: number,
  colliders: MeadowCollider[] = MEADOW_COLLIDERS,
) => {
  const resolved: [number, number] = [point[0], point[1]];

  for (let iteration = 0; iteration < 4; iteration += 1) {
    let adjusted = false;

    for (const collider of colliders) {
      const dx = resolved[0] - collider.center[0];
      const dz = resolved[1] - collider.center[1];
      const minDistance = collider.radius + playerRadius;
      const distanceSq = dx * dx + dz * dz;

      if (distanceSq >= minDistance * minDistance) continue;

      if (distanceSq < 0.0001) {
        resolved[0] += minDistance;
        adjusted = true;
        continue;
      }

      const distance = Math.sqrt(distanceSq);
      const push = minDistance - distance + 0.001;
      resolved[0] += (dx / distance) * push;
      resolved[1] += (dz / distance) * push;
      adjusted = true;
    }

    if (!adjusted) break;
  }

  return resolved;
};

export const MEADOW_GRASS_PATCHES: MeadowGrassPatch[] = [
  { id: "court-left", center: scalePlanarPoint(-10, 24), spread: scalePlanarPoint(9, 6), density: 1.1, sector: "return_court" },
  { id: "court-right", center: scalePlanarPoint(10, 23), spread: scalePlanarPoint(9, 6), density: 1.08, sector: "return_court" },
  { id: "ridge", center: scalePlanarPoint(0, 8), spread: scalePlanarPoint(15, 12), density: 1.32, sector: "lantern_ridge" },
  { id: "ridge-east", center: scalePlanarPoint(16, 4), spread: scalePlanarPoint(10, 8), density: 1.08, sector: "lantern_ridge" },
  { id: "return-south-window-left", center: scalePlanarPoint(-18, -14), spread: scalePlanarPoint(13, 8), density: 1.08, sector: "whisper_grove" },
  { id: "return-south-window-center", center: scalePlanarPoint(0, -18), spread: scalePlanarPoint(16, 9), density: 1.04, sector: "shrine_basin" },
  { id: "return-south-window-right", center: scalePlanarPoint(18, -14), spread: scalePlanarPoint(13, 8), density: 1.04, sector: "far_rim" },
  { id: "grove-front", center: scalePlanarPoint(-16, 4), spread: scalePlanarPoint(12, 10), density: 1.42, sector: "whisper_grove" },
  { id: "grove-deep", center: scalePlanarPoint(-22, -4), spread: scalePlanarPoint(11, 10), density: 1.48, sector: "whisper_grove" },
  { id: "grove-arc", center: scalePlanarPoint(-10, -2), spread: scalePlanarPoint(8, 8), density: 1.28, sector: "whisper_grove" },
  { id: "grove-west", center: scalePlanarPoint(-29, 6), spread: scalePlanarPoint(9, 9), density: 1.2, sector: "whisper_grove" },
  { id: "grove-south-rim", center: scalePlanarPoint(-20, -14), spread: scalePlanarPoint(12, 8), density: 1.12, sector: "whisper_grove" },
  { id: "grove-deep-south", center: scalePlanarPoint(-28, -24), spread: scalePlanarPoint(12, 8), density: 1.08, sector: "whisper_grove" },
  { id: "grove-basin-bridge", center: scalePlanarPoint(-10, -25), spread: scalePlanarPoint(10, 8), density: 0.96, sector: "whisper_grove" },
  { id: "basin", center: scalePlanarPoint(7, -12), spread: scalePlanarPoint(15, 11), density: 1.34, sector: "shrine_basin" },
  { id: "basin-east", center: scalePlanarPoint(15, -8), spread: scalePlanarPoint(10, 8), density: 1.12, sector: "shrine_basin" },
  { id: "basin-south", center: scalePlanarPoint(7, -25), spread: scalePlanarPoint(13, 9), density: 1.16, sector: "shrine_basin" },
  { id: "basin-outer-east", center: scalePlanarPoint(22, -16), spread: scalePlanarPoint(10, 8), density: 1.02, sector: "shrine_basin" },
  { id: "basin-lower-band", center: scalePlanarPoint(8, -31), spread: scalePlanarPoint(17, 7), density: 1.04, sector: "shrine_basin" },
  { id: "far-rim", center: scalePlanarPoint(22, 8), spread: scalePlanarPoint(12, 10), density: 1.22, sector: "far_rim" },
  { id: "far-rim-high", center: scalePlanarPoint(14, 18), spread: scalePlanarPoint(10, 7), density: 0.96, sector: "far_rim" },
  { id: "far-rim-east", center: scalePlanarPoint(29, 9), spread: scalePlanarPoint(9, 8), density: 1.06, sector: "far_rim" },
  { id: "far-rim-south", center: scalePlanarPoint(24, -5), spread: scalePlanarPoint(12, 8), density: 0.98, sector: "far_rim" },
  { id: "far-rim-bottom", center: scalePlanarPoint(28, -20), spread: scalePlanarPoint(13, 8), density: 0.92, sector: "far_rim" },
  { id: "deep-south-west", center: scalePlanarPoint(-48, -54), spread: scalePlanarPoint(18, 10), density: 1.04, sector: "whisper_grove" },
  { id: "deep-south-meridian", center: scalePlanarPoint(1, -52), spread: scalePlanarPoint(21, 11), density: 1, sector: "shrine_basin" },
  { id: "deep-south-east", center: scalePlanarPoint(46, -50), spread: scalePlanarPoint(18, 10), density: 1, sector: "far_rim" },
  { id: "deep-south-west-outer", center: scalePlanarPoint(-60, -55), spread: scalePlanarPoint(17, 10), density: 0.98, sector: "whisper_grove" },
  { id: "deep-south-center-outer", center: scalePlanarPoint(0, -55), spread: scalePlanarPoint(24, 12), density: 0.96, sector: "shrine_basin" },
  { id: "deep-south-east-outer", center: scalePlanarPoint(60, -55), spread: scalePlanarPoint(17, 10), density: 0.98, sector: "far_rim" },
  { id: "lower-west-shoulder", center: scalePlanarPoint(-46, -38), spread: scalePlanarPoint(18, 10), density: 0.98, sector: "whisper_grove" },
  { id: "lower-meridian-band", center: scalePlanarPoint(2, -46), spread: scalePlanarPoint(24, 12), density: 0.98, sector: "shrine_basin" },
  { id: "lower-east-shoulder", center: scalePlanarPoint(46, -38), spread: scalePlanarPoint(18, 10), density: 0.98, sector: "far_rim" },
  { id: "far-south-west-band", center: scalePlanarPoint(-52, -46), spread: scalePlanarPoint(20, 12), density: 0.94, sector: "whisper_grove" },
  { id: "far-south-east-band", center: scalePlanarPoint(52, -46), spread: scalePlanarPoint(20, 12), density: 0.94, sector: "far_rim" },
  { id: "far-south-meridian-halo", center: scalePlanarPoint(4, -54), spread: scalePlanarPoint(24, 12), density: 0.92, sector: "shrine_basin" },
  { id: "south-rim-route", center: scalePlanarPoint(31, -44), spread: scalePlanarPoint(15, 8), density: 0.96, sector: "far_rim" },
  { id: "outer-west-band", center: scalePlanarPoint(-44, -18), spread: scalePlanarPoint(16, 10), density: 1.02, sector: "whisper_grove" },
  { id: "southwest-basin-floor", center: scalePlanarPoint(-29, -41), spread: scalePlanarPoint(16, 9), density: 0.98, sector: "whisper_grove" },
  { id: "south-meridian-shoulder", center: scalePlanarPoint(3, -52), spread: scalePlanarPoint(18, 10), density: 1.02, sector: "shrine_basin" },
  { id: "southeast-rim-shelf", center: scalePlanarPoint(40, -33), spread: scalePlanarPoint(16, 9), density: 0.98, sector: "far_rim" },
  { id: "east-outer-ridge", center: scalePlanarPoint(52, -16), spread: scalePlanarPoint(14, 8), density: 0.94, sector: "far_rim" },
];

const reedStand = (
  id: string,
  x: number,
  z: number,
  config: Omit<MeadowReedStand, "id" | "sector" | "anchor"> & {
    sector: MeadowSector;
  },
): MeadowReedStand => ({
  id,
  sector: config.sector,
  anchor: createGroundedAnchor(x, z, 0.12),
  height: config.height,
  radius: config.radius,
  density: config.density,
  tone: config.tone,
  accent: config.accent,
  coreVisual: config.coreVisual,
});

export const MEADOW_REED_STANDS: MeadowReedStand[] = [
  reedStand("return-south-left-reeds", -22, -18, {
    sector: "whisper_grove",
    height: 8.4,
    radius: 3.3,
    density: 15,
    tone: "#86a261",
    accent: "#deebc4",
    coreVisual: true,
  }),
  reedStand("return-south-meridian-reeds", 0, -22, {
    sector: "shrine_basin",
    height: 8.8,
    radius: 3.7,
    density: 17,
    tone: "#8aa665",
    accent: "#ffe0b2",
    coreVisual: true,
  }),
  reedStand("return-south-right-reeds", 22, -18, {
    sector: "far_rim",
    height: 8.4,
    radius: 3.3,
    density: 15,
    tone: "#88a566",
    accent: "#e2ebff",
    coreVisual: true,
  }),
  reedStand("grove-south-reeds", -28, -20, {
    sector: "whisper_grove",
    height: 8.8,
    radius: 3.6,
    density: 17,
    tone: "#86a65d",
    accent: "#e3efc3",
    coreVisual: true,
  }),
  reedStand("grove-bridge-reeds", -14, -24, {
    sector: "whisper_grove",
    height: 7.2,
    radius: 2.8,
    density: 13,
    tone: "#7da05a",
    accent: "#d5e8b6",
  }),
  reedStand("sunken-basin-reeds", -1, -28, {
    sector: "shrine_basin",
    height: 9.4,
    radius: 4.2,
    density: 18,
    tone: "#8aa561",
    accent: "#f2d9ae",
    coreVisual: true,
  }),
  reedStand("meridian-reeds", 10, -31, {
    sector: "shrine_basin",
    height: 8.4,
    radius: 3.4,
    density: 15,
    tone: "#84a35e",
    accent: "#ffe3b0",
    coreVisual: true,
  }),
  reedStand("rim-shelf-reeds", 23, -22, {
    sector: "far_rim",
    height: 7.8,
    radius: 3.3,
    density: 14,
    tone: "#86a15f",
    accent: "#dfeaff",
  }),
  reedStand("rim-bottom-reeds", 31, -18, {
    sector: "far_rim",
    height: 9.2,
    radius: 3.9,
    density: 18,
    tone: "#89a767",
    accent: "#e4efff",
    coreVisual: true,
  }),
  reedStand("grove-west-deep-reeds", -40, -15, {
    sector: "whisper_grove",
    height: 8.4,
    radius: 3.4,
    density: 15,
    tone: "#86a262",
    accent: "#dcebc3",
    coreVisual: true,
  }),
  reedStand("basin-floor-reeds", -1, -36, {
    sector: "shrine_basin",
    height: 8.7,
    radius: 3.6,
    density: 16,
    tone: "#89a564",
    accent: "#ffe2b2",
    coreVisual: true,
  }),
  reedStand("rim-high-reeds", 39, 14, {
    sector: "far_rim",
    height: 8.2,
    radius: 3.1,
    density: 14,
    tone: "#86a265",
    accent: "#dfeaff",
    coreVisual: true,
  }),
  reedStand("deep-south-west-reeds", -52, -54, {
    sector: "whisper_grove",
    height: 9,
    radius: 3.7,
    density: 16,
    tone: "#88a465",
    accent: "#deebc6",
    coreVisual: true,
  }),
  reedStand("deep-south-center-reeds", 0, -54, {
    sector: "shrine_basin",
    height: 9.6,
    radius: 4.1,
    density: 18,
    tone: "#8ca667",
    accent: "#ffe2b3",
    coreVisual: true,
  }),
  reedStand("deep-south-meridian-outer-reeds", 1, -55, {
    sector: "shrine_basin",
    height: 9.2,
    radius: 3.9,
    density: 17,
    tone: "#8ca869",
    accent: "#ffe3b4",
    coreVisual: true,
  }),
  reedStand("deep-south-west-outer-reeds", -60, -55, {
    sector: "whisper_grove",
    height: 8.8,
    radius: 3.5,
    density: 15,
    tone: "#86a363",
    accent: "#dfecc5",
    coreVisual: true,
  }),
  reedStand("deep-south-east-outer-reeds", 60, -55, {
    sector: "far_rim",
    height: 8.8,
    radius: 3.5,
    density: 15,
    tone: "#88a667",
    accent: "#e4efff",
    coreVisual: true,
  }),
  reedStand("deep-south-east-reeds", 52, -52, {
    sector: "far_rim",
    height: 9.1,
    radius: 3.8,
    density: 17,
    tone: "#88a467",
    accent: "#dfeaff",
    coreVisual: true,
  }),
  reedStand("lower-west-rim-reeds", -50, -40, {
    sector: "whisper_grove",
    height: 8.8,
    radius: 3.6,
    density: 15,
    tone: "#88a465",
    accent: "#deebc6",
    coreVisual: true,
  }),
  reedStand("lower-meridian-halo-reeds", 0, -48, {
    sector: "shrine_basin",
    height: 9.3,
    radius: 3.9,
    density: 17,
    tone: "#8ca767",
    accent: "#ffe2b6",
    coreVisual: true,
  }),
  reedStand("lower-east-rim-reeds", 50, -40, {
    sector: "far_rim",
    height: 8.9,
    radius: 3.6,
    density: 15,
    tone: "#89a567",
    accent: "#deebff",
    coreVisual: true,
  }),
  reedStand("outer-west-reeds", -42, -18, {
    sector: "whisper_grove",
    height: 8.1,
    radius: 3.2,
    density: 14,
    tone: "#86a261",
    accent: "#dceac2",
    coreVisual: true,
  }),
  reedStand("southwest-basin-reeds", -30, -41, {
    sector: "whisper_grove",
    height: 8.6,
    radius: 3.5,
    density: 15,
    tone: "#88a464",
    accent: "#e6efd0",
    coreVisual: true,
  }),
  reedStand("deep-meridian-reeds", 3, -52, {
    sector: "shrine_basin",
    height: 9,
    radius: 3.6,
    density: 16,
    tone: "#8aa565",
    accent: "#ffe1b3",
    coreVisual: true,
  }),
  reedStand("east-rim-shoulder-reeds", 42, -34, {
    sector: "far_rim",
    height: 8.4,
    radius: 3.4,
    density: 15,
    tone: "#87a465",
    accent: "#dfeaff",
    coreVisual: true,
  }),
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
    id: "south-handoff",
    sector: "shrine_basin",
    center: scalePlanarPoint(0, -20),
    spread: scalePlanarPoint(44, 16),
    tone: "#76945b",
    opacity: 0.18,
    accentTone: "#b8c88a",
    clusterCount: 14,
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
    id: "grove-south-bloom",
    sector: "whisper_grove",
    center: scalePlanarPoint(-24, -22),
    spread: scalePlanarPoint(18, 10),
    tone: "#617f4d",
    opacity: 0.22,
    accentTone: "#a4bb7e",
    clusterCount: 10,
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
    id: "basin-low-sun",
    sector: "shrine_basin",
    center: scalePlanarPoint(8, -28),
    spread: scalePlanarPoint(18, 9),
    tone: "#839b67",
    opacity: 0.2,
    accentTone: "#e3b98f",
    clusterCount: 11,
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
  {
    id: "rim-south-cool",
    sector: "far_rim",
    center: scalePlanarPoint(28, -18),
    spread: scalePlanarPoint(15, 9),
    tone: "#7a9a67",
    opacity: 0.18,
    accentTone: "#d4def2",
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
    id: "grove-west-bank",
    anchor: createHoverAnchor(-31, 8, 17.2),
    scale: 5.6,
    opacity: 0.48,
    tone: "#f2eee5",
    puffCount: 6,
    spread: 5.9,
    drift: 0.09,
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
    id: "basin-south-sheet",
    anchor: createHoverAnchor(7, -26, 18.2),
    scale: 6.1,
    opacity: 0.52,
    tone: "#fdf7ee",
    puffCount: 6,
    spread: 6.2,
    drift: 0.13,
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
  {
    id: "rim-south-vapor",
    anchor: createHoverAnchor(27, -4, 19.4),
    scale: 5.9,
    opacity: 0.48,
    tone: "#f5f6f2",
    puffCount: 6,
    spread: 6,
    drift: 0.1,
  },
  {
    id: "deep-south-west-cloudbank",
    anchor: createHoverAnchor(-52, -50, 18.6),
    scale: 6.8,
    opacity: 0.5,
    tone: "#f5f0e7",
    puffCount: 6,
    spread: 6.4,
    drift: 0.1,
  },
  {
    id: "deep-south-meridian-cloudbank",
    anchor: createHoverAnchor(2, -55, 19.4),
    scale: 7.2,
    opacity: 0.54,
    tone: "#faf4ea",
    puffCount: 7,
    spread: 7.1,
    drift: 0.12,
  },
  {
    id: "deep-south-east-cloudbank",
    anchor: createHoverAnchor(52, -50, 18.8),
    scale: 6.8,
    opacity: 0.5,
    tone: "#f5f4ef",
    puffCount: 6,
    spread: 6.4,
    drift: 0.1,
  },
  {
    id: "grove-south-vapor",
    anchor: createHoverAnchor(-24, -22, 17.6),
    scale: 5.7,
    opacity: 0.46,
    tone: "#f4efe6",
    puffCount: 6,
    spread: 5.8,
    drift: 0.08,
  },
  {
    id: "lower-basin-sheet",
    anchor: createHoverAnchor(9, -30, 18),
    scale: 6.3,
    opacity: 0.5,
    tone: "#fbf7ee",
    puffCount: 7,
    spread: 6.4,
    drift: 0.12,
  },
  {
    id: "rim-bottom-bank",
    anchor: createHoverAnchor(30, -18, 20.2),
    scale: 6.5,
    opacity: 0.49,
    tone: "#f5f5f0",
    puffCount: 7,
    spread: 6.6,
    drift: 0.11,
  },
  {
    id: "deep-south-west-bank",
    anchor: createHoverAnchor(-46, -55, 19.2),
    scale: 6.8,
    opacity: 0.5,
    tone: "#f4efe6",
    puffCount: 7,
    spread: 6.9,
    drift: 0.09,
  },
  {
    id: "deep-south-meridian-halo",
    anchor: createHoverAnchor(2, -52, 21.4),
    scale: 7.1,
    opacity: 0.52,
    tone: "#fbf7ee",
    puffCount: 8,
    spread: 7.4,
    drift: 0.12,
  },
  {
    id: "deep-south-east-bank",
    anchor: createHoverAnchor(49, -55, 20.1),
    scale: 6.9,
    opacity: 0.48,
    tone: "#f4f5f0",
    puffCount: 7,
    spread: 6.8,
    drift: 0.1,
  },
  {
    id: "outer-west-ridge-bank",
    anchor: createHoverAnchor(-52, -18, 18.9),
    scale: 6.4,
    opacity: 0.48,
    tone: "#f4efe6",
    puffCount: 6,
    spread: 6.5,
    drift: 0.08,
  },
  {
    id: "outer-east-ridge-bank",
    anchor: createHoverAnchor(56, -18, 19.2),
    scale: 6.5,
    opacity: 0.48,
    tone: "#f5f6f1",
    puffCount: 6,
    spread: 6.4,
    drift: 0.09,
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
  {
    id: "custode-del-meridiano",
    label: "Custode del meridiano",
    kind: "walker",
    shape: "lizard",
    sector: "shrine_basin",
    color: "#d5d0b3",
    accent: "#fff6d8",
    caption:
      "Passa in silenzio tra la meridiana e il bacino, come se stesse contando i raggi.",
    scale: 1.12,
    triggerDistance: 11.4,
    visibleDistance: 36,
    route: scaleRoute([
      [2, -29],
      [8, -25],
      [14, -20],
      [10, -15],
      [4, -19],
    ]),
  },
  {
    id: "riverbero-del-rim",
    label: "Riverbero del rim",
    kind: "floater",
    shape: "owl",
    sector: "far_rim",
    color: "#d5e2ef",
    accent: "#f7fbff",
    caption:
      "Quando il bordo si apre, attraversa il cielo basso con un arco quasi perfetto.",
    scale: 1.08,
    triggerDistance: 12,
    visibleDistance: 38,
    orbitCenter: scalePlanarPoint(29, -2),
    orbitRadius: scaleDistance(3),
  },
  {
    id: "custode-della-campana",
    label: "Custode della campana",
    kind: "percher",
    shape: "owl",
    sector: "whisper_grove",
    color: "#8d7961",
    accent: "#efe5cf",
    caption:
      "Resta nella parte bassa del bosco e cambia posatoio solo quando il vento gira davvero.",
    scale: 1.18,
    triggerDistance: 12,
    visibleDistance: 38,
    perch: scalePlanarPoint(-27, -23),
    relocations: scaleRoute([
      [-31, -19],
      [-22, -26],
      [-16, -22],
    ]),
  },
  {
    id: "viandante-del-sole-basso",
    label: "Viandante del sole basso",
    kind: "walker",
    shape: "frog",
    sector: "shrine_basin",
    color: "#d8cb9e",
    accent: "#fff1c7",
    caption:
      "Abita la fascia piu bassa del globo, tra orto sommerso e casa del sole basso.",
    scale: 1.2,
    triggerDistance: 11.8,
    visibleDistance: 36,
    route: scaleRoute([
      [-8, -28],
      [0, -31],
      [10, -31],
      [17, -28],
      [6, -24],
    ]),
  },
  {
    id: "ronzatore-dell-orlo-basso",
    label: "Ronzatore dell'orlo basso",
    kind: "floater",
    shape: "seahorse",
    sector: "far_rim",
    color: "#d9e4f4",
    accent: "#f4fbff",
    caption:
      "Taglia la parte piu bassa dell'orlo e fa sembrare il margine meno vuoto di quanto sia.",
    scale: 1.06,
    triggerDistance: 11.6,
    visibleDistance: 37,
    orbitCenter: scalePlanarPoint(29, -18),
    orbitRadius: scaleDistance(3.2),
  },
  {
    id: "custode-del-fondo-ovest",
    label: "Custode del fondo ovest",
    kind: "walker",
    shape: "cat",
    sector: "whisper_grove",
    color: "#c9d7bf",
    accent: "#f6fff0",
    caption:
      "Tiene il margine basso del bosco: compare solo quando la curva smette di sembrare vuota.",
    scale: 1.18,
    triggerDistance: 12,
    visibleDistance: 40,
    route: scaleRoute([
      [-52, -48],
      [-44, -52],
      [-36, -54],
      [-27, -52],
      [-35, -50],
    ]),
  },
  {
    id: "nastro-del-sole-profondo",
    label: "Nastro del sole profondo",
    kind: "floater",
    shape: "seahorse",
    sector: "shrine_basin",
    color: "#f1d6aa",
    accent: "#fff7d9",
    caption:
      "Orbita nel fondo basso: quando lo vedi, il sud del globo smette di sembrare finito troppo presto.",
    scale: 1.1,
    triggerDistance: 12,
    visibleDistance: 42,
    orbitCenter: scalePlanarPoint(2, -54),
    orbitRadius: scaleDistance(3.8),
  },
  {
    id: "lucertola-dell-orlo-profondo",
    label: "Lucertola dell'orlo profondo",
    kind: "percher",
    shape: "lizard",
    sector: "far_rim",
    color: "#9ab17b",
    accent: "#f1ffe5",
    caption:
      "Resta sulle spine del bordo piu basso e costringe l'occhio ad andare oltre l'ingresso del prato.",
    scale: 1.14,
    triggerDistance: 11.8,
    visibleDistance: 40,
    perch: scalePlanarPoint(55, -52),
    relocations: scaleRoute([
      [47, -52],
      [59, -47],
      [42, -54],
    ]),
  },
  {
    id: "viandante-del-ponente-profondo",
    label: "Viandante del ponente profondo",
    kind: "walker",
    shape: "frog",
    sector: "whisper_grove",
    color: "#d4d2b2",
    accent: "#f6ffe9",
    caption:
      "Segue il bordo ovest basso e impedisce che il globo si spenga appena esci dalla cresta principale.",
    scale: 1.16,
    triggerDistance: 11.8,
    visibleDistance: 39,
    route: scaleRoute([
      [-48, -18],
      [-42, -26],
      [-34, -36],
      [-27, -44],
      [-36, -48],
    ]),
  },
  {
    id: "riverbero-del-levante-profondo",
    label: "Riverbero del levante profondo",
    kind: "floater",
    shape: "owl",
    sector: "far_rim",
    color: "#d7e3f1",
    accent: "#f4f9ff",
    caption:
      "Taglia l'orlo basso orientale in archi larghi: serve a tenere vivo il lato che prima sembrava finire nel niente.",
    scale: 1.08,
    triggerDistance: 12,
    visibleDistance: 40,
    orbitCenter: scalePlanarPoint(48, -28),
    orbitRadius: scaleDistance(4.1),
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
