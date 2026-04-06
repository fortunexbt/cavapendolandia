import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  useGrassTexture,
  useMeadowShadowTexture,
} from "@/components/cavapendo-gallery/assets";
import {
  ArchPortal,
  CreatureShape,
  MeadowSurfaceSocket,
  SkyDisc,
} from "@/components/cavapendo-gallery/scene-primitives";
import { seededRandom } from "@/components/cavapendo-gallery/scene-utils";
import {
  type QualityTier,
  type ResolvedRenderProfile,
} from "@/components/cavapendo-gallery/runtime";
import {
  type DepositSite,
  type MeadowCreatureRuntimeSnapshot,
} from "@/components/cavapendo-gallery/types";
import {
  createHoverAnchor,
  createGroundedAnchor,
  MEADOW_CLOUD_LAYERS,
  MEADOW_CREATURES,
  MEADOW_DEPOSIT_SITES,
  MEADOW_DOORS,
  MEADOW_GRASS_PATCHES,
  MEADOW_LANDMARKS,
  MEADOW_MONOLITHS,
  MEADOW_PLANET_CENTER,
  MEADOW_PLANET_RADIUS,
  MEADOW_REED_STANDS,
  MEADOW_TREE_LAYOUT,
  distanceBetweenPlanarPoints,
  getMeadowSkylineLandmarksForQuality,
  getMeadowSkylineRidgesForQuality,
  getMeadowTerrainLift,
  getPlanarFromMeadowNormal,
  getPlanarFromWorldPosition,
  projectPlanarPointToMeadowNormal,
  projectPlanarPointToMeadowSurface,
  type CloudLayer,
  type MeadowCreatureDefinition,
  type MeadowSector,
  type MeadowSkylineLandmark,
  type MeadowSkylineRidge,
} from "@/lib/meadowWorld";

function createTerrainSphereGeometry(
  widthSegments: number,
  heightSegments: number,
  shellOffset = 0,
) {
  const geometry = new THREE.SphereGeometry(
    MEADOW_PLANET_RADIUS + shellOffset,
    widthSegments,
    heightSegments,
  );
  const positions = geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let index = 0; index < positions.count; index += 1) {
    vertex.fromBufferAttribute(positions, index);
    normal.copy(vertex).normalize();
    const planar = getPlanarFromMeadowNormal(normal);
    const terrainRadius =
      MEADOW_PLANET_RADIUS + getMeadowTerrainLift(planar.x, planar.z) + shellOffset;
    vertex.copy(normal).multiplyScalar(terrainRadius);
    positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function GrassField({
  tier,
  densityMultiplier,
}: {
  tier: QualityTier;
  densityMultiplier: number;
}) {
  const clumpRefs = useRef<Array<THREE.Group | null>>([]);
  const clumps = useMemo(
    () =>
      MEADOW_GRASS_PATCHES.flatMap((patch, patchIndex) => {
        const baseCount =
          tier === "low"
            ? Math.round(patch.density * 8)
            : tier === "medium"
              ? Math.round(patch.density * 14)
              : Math.round(patch.density * 22);
        const count = Math.max(6, Math.round(baseCount * densityMultiplier));

        return Array.from({ length: count }, (_, clumpIndex) => {
          const seedBase = patchIndex * 109 + clumpIndex * 13;
          const x =
            patch.center[0] +
            (seededRandom(seedBase + 50) * 2 - 1) * patch.spread[0];
          const z =
            patch.center[1] +
            (seededRandom(seedBase + 80) * 2 - 1) * patch.spread[1];

          if (
            MEADOW_DEPOSIT_SITES.some(
              (site) => distanceBetweenPlanarPoints(site.planar, [x, z]) < 7.8,
            )
          ) {
            return null;
          }

          return {
            id: `${patch.id}-grass-${clumpIndex}`,
            x,
            z,
            scale: 0.86 + seededRandom(seedBase + 110) * 1.28,
            yaw: seededRandom(seedBase + 140) * Math.PI,
            lean: (seededRandom(seedBase + 170) - 0.5) * 0.14,
            hueIndex: Math.floor(seededRandom(seedBase + 180) * 4),
          };
        }).filter(Boolean) as Array<{
          id: string;
          x: number;
          z: number;
          scale: number;
          yaw: number;
          lean: number;
          hueIndex: number;
        }>;
      }),
    [densityMultiplier, tier],
  );

  const tuftPalette = ["#6f8751", "#78915a", "#64804a", "#819a63"];
  const bladeAngles = [-0.78, -0.24, 0.32, 0.84] as const;

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const motionStrength =
      tier === "high" ? 1 : tier === "medium" ? 0.72 : 0.42;

    clumps.forEach((clump, index) => {
      const node = clumpRefs.current[index];
      if (!node) return;

      const phase = index * 0.37 + clump.hueIndex * 0.8;
      node.rotation.z =
        clump.lean + Math.sin(elapsed * 0.82 + phase) * 0.08 * motionStrength;
      node.rotation.x =
        Math.cos(elapsed * 0.58 + phase * 0.7) * 0.035 * motionStrength;
      node.position.y = Math.sin(elapsed * 0.9 + phase) * 0.022 * motionStrength;
    });
  });

  return (
    <group>
      {clumps.map((clump, index) => (
        <MeadowSurfaceSocket
          key={clump.id}
          anchor={{
            planar: [clump.x, clump.z],
            contactMode: "grounded",
            offset: 0.12,
          }}
          rotationY={clump.yaw}
          disableCulling
        >
          <group
            ref={(node) => {
              clumpRefs.current[index] = node;
            }}
            scale={clump.scale}
            rotation={[0, 0, clump.lean]}
          >
            <mesh
              position={[0, 0.05, 0]}
              scale={[0.32, 0.14, 0.32]}
              frustumCulled={false}
            >
              <sphereGeometry args={[0.54, tier === "high" ? 10 : 7, tier === "high" ? 10 : 7]} />
              <meshStandardMaterial color="#597044" roughness={1} />
            </mesh>
            {bladeAngles.map((angle, bladeIndex) => (
              <mesh
                key={`${clump.id}-blade-${bladeIndex}`}
                position={[
                  Math.cos(angle) * 0.18,
                  0.14 + Math.abs(Math.sin(angle)) * 0.08,
                  Math.sin(angle) * 0.16,
                ]}
                rotation={[0.14 + bladeIndex * 0.02, angle, angle * 0.16]}
                scale={[
                  0.24 + (bladeIndex % 2) * 0.04,
                  0.8 + (bladeIndex % 2) * 0.1,
                  0.16,
                ]}
                frustumCulled={false}
              >
                <sphereGeometry args={[0.46, tier === "high" ? 10 : 7, tier === "high" ? 10 : 7]} />
                <meshStandardMaterial
                  color={tuftPalette[(clump.hueIndex + bladeIndex) % tuftPalette.length]}
                  roughness={0.98}
                />
              </mesh>
            ))}
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function ReedStandField({ quality }: { quality: QualityTier }) {
  const standRefs = useRef<Array<THREE.Group | null>>([]);
  const stands = useMemo(() => {
    const filtered =
      quality === "high"
        ? MEADOW_REED_STANDS
        : quality === "medium"
          ? MEADOW_REED_STANDS.filter(
              (stand, index) => stand.coreVisual || index % 3 !== 1,
            )
          : MEADOW_REED_STANDS.filter((stand) => stand.coreVisual);

    return filtered.map((stand, standIndex) => {
      const stemCount =
        quality === "high"
          ? stand.density
          : quality === "medium"
            ? Math.max(9, Math.round(stand.density * 0.76))
            : Math.max(7, Math.round(stand.density * 0.58));

      return {
        ...stand,
        stems: Array.from({ length: stemCount }, (_, stemIndex) => {
          const seed = standIndex * 173 + stemIndex * 29;
          const angle = seededRandom(seed + 5) * Math.PI * 2;
          const distance =
            Math.sqrt(seededRandom(seed + 7)) * stand.radius * (0.24 + seededRandom(seed + 11));

          return {
            x: Math.cos(angle) * distance,
            z: Math.sin(angle) * distance,
            height:
              stand.height * (0.52 + seededRandom(seed + 13) * 0.56),
            width: 0.14 + seededRandom(seed + 17) * 0.13,
            lean: (seededRandom(seed + 19) - 0.5) * 0.18,
            yaw: seededRandom(seed + 23) * Math.PI,
            accent: stemIndex % 5 === 0,
          };
        }),
      };
    });
  }, [quality]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const motionScale =
      quality === "high" ? 1 : quality === "medium" ? 0.74 : 0.5;

    stands.forEach((stand, index) => {
      const node = standRefs.current[index];
      if (!node) return;

      const phase = index * 0.63;
      node.rotation.z =
        Math.sin(elapsed * 0.28 + phase) * 0.045 * motionScale;
      node.rotation.x =
        Math.cos(elapsed * 0.24 + phase * 0.7) * 0.018 * motionScale;
      node.position.y =
        Math.sin(elapsed * 0.36 + phase) * 0.04 * motionScale;
    });
  });

  return (
    <group>
      {stands.map((stand, index) => (
        <MeadowSurfaceSocket
          key={stand.id}
          anchor={stand.anchor}
          rotationY={seededRandom(index + 1240) * Math.PI}
          disableCulling
        >
          <group
            ref={(node) => {
              standRefs.current[index] = node;
            }}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.04, 0]}
              scale={[stand.radius * 0.9, 1, stand.radius * 0.66]}
              frustumCulled={false}
            >
              <circleGeometry args={[1, quality === "high" ? 30 : 20]} />
              <meshBasicMaterial
                color={stand.accent}
                transparent
                opacity={stand.coreVisual ? 0.08 : 0.045}
                depthWrite={false}
              />
            </mesh>
            {stand.stems.map((stem, stemIndex) => (
              <group
                key={`${stand.id}-stem-${stemIndex}`}
                position={[stem.x, stem.height * 0.5, stem.z]}
                rotation={[0, stem.yaw, stem.lean]}
              >
                <mesh frustumCulled={false}>
                  <cylinderGeometry
                    args={[stem.width * 0.42, stem.width, stem.height, 6]}
                  />
                  <meshStandardMaterial color={stand.tone} roughness={0.94} />
                </mesh>
                <mesh
                  position={[0, stem.height * 0.46, 0]}
                  rotation={[0.12, 0, stem.accent ? 0.1 : 0]}
                  frustumCulled={false}
                >
                  <sphereGeometry
                    args={[
                      stem.accent ? stem.width * 0.86 : stem.width * 0.52,
                      quality === "high" ? 10 : 8,
                      quality === "high" ? 10 : 8,
                    ]}
                  />
                  <meshStandardMaterial
                    color={stem.accent ? stand.accent : "#7e5c3b"}
                    emissive={stem.accent ? stand.accent : "#6c4f36"}
                    emissiveIntensity={stem.accent ? 0.08 : 0.02}
                    roughness={0.74}
                  />
                </mesh>
              </group>
            ))}
            {stand.coreVisual && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.12, 0]}
                frustumCulled={false}
              >
                <ringGeometry
                  args={[stand.radius * 0.4, stand.radius * 0.58, 28]}
                />
                <meshBasicMaterial
                  color={stand.accent}
                  transparent
                  opacity={0.12}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function OuterScatterField({ quality }: { quality: QualityTier }) {
  const motionRefs = useRef<Array<THREE.Group | null>>([]);
  const clusters = useMemo(() => {
    const bands = [
      { id: "outer-west", center: [-34, -2], spread: [26, 22], count: 16 },
      { id: "south-handoff-west", center: [-18, -18], spread: [18, 10], count: 14 },
      { id: "south-handoff-center", center: [0, -22], spread: [20, 10], count: 18 },
      { id: "south-handoff-east", center: [18, -18], spread: [18, 10], count: 14 },
      { id: "southwest", center: [-24, -44], spread: [24, 18], count: 16 },
      { id: "lower-west-rim", center: [-46, -38], spread: [24, 16], count: 18 },
      { id: "deep-south", center: [2, -52], spread: [40, 18], count: 24 },
      { id: "lower-meridian", center: [4, -48], spread: [34, 18], count: 20 },
      { id: "lower-east-rim", center: [46, -38], spread: [24, 16], count: 18 },
      { id: "southeast", center: [26, -44], spread: [24, 18], count: 16 },
      { id: "outer-east", center: [36, -4], spread: [26, 22], count: 16 },
    ] as const;
    const perTierScale = quality === "high" ? 1.12 : quality === "medium" ? 0.86 : 0.64;

    return bands.flatMap((band, bandIndex) => {
      const count = Math.max(4, Math.round(band.count * perTierScale));
      return Array.from({ length: count }, (_, clusterIndex) => {
        const seed = bandIndex * 401 + clusterIndex * 43;
        const anchor = createGroundedAnchor(
          band.center[0] + (seededRandom(seed + 3) * 2 - 1) * band.spread[0],
          band.center[1] + (seededRandom(seed + 5) * 2 - 1) * band.spread[1],
          0.04,
        );
        const planar = anchor.planar;

        if (
          MEADOW_DEPOSIT_SITES.some(
            (site) => distanceBetweenPlanarPoints(site.anchor.planar, planar) < 8.8,
          )
        ) {
          return null;
        }

        if (
          MEADOW_LANDMARKS.some(
            (landmark) =>
              distanceBetweenPlanarPoints(landmark.anchor.planar, planar) < 11.2,
          )
        ) {
          return null;
        }

        return {
          id: `${band.id}-${clusterIndex}`,
          anchor,
          kind: clusterIndex % 4,
          rotation: seededRandom(seed + 7) * Math.PI,
          scale: 0.8 + seededRandom(seed + 11) * 0.9,
          accent: seededRandom(seed + 13),
        };
      }).filter(Boolean) as Array<{
        id: string;
        anchor: ReturnType<typeof createGroundedAnchor>;
        kind: number;
        rotation: number;
        scale: number;
        accent: number;
      }>;
    });
  }, [quality]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    const motionStrength = quality === "high" ? 1 : quality === "medium" ? 0.72 : 0.44;

    clusters.forEach((cluster, index) => {
      const node = motionRefs.current[index];
      if (!node) return;
      if (cluster.kind === 1 || cluster.kind === 3) {
        node.rotation.z = Math.sin(elapsed * 0.64 + index * 0.41) * 0.08 * motionStrength;
      }
      node.position.y = Math.sin(elapsed * 0.52 + index * 0.37) * 0.03 * motionStrength;
    });
  });

  return (
    <group>
      {clusters.map((cluster, index) => (
        <MeadowSurfaceSocket
          key={cluster.id}
          anchor={cluster.anchor}
          rotationY={cluster.rotation}
          disableCulling
        >
          <group
            ref={(node) => {
              motionRefs.current[index] = node;
            }}
            scale={cluster.scale}
          >
            {cluster.kind === 0 && (
              <>
                <mesh position={[0, 0.18, 0]} frustumCulled={false}>
                  <sphereGeometry args={[0.82, quality === "high" ? 12 : 8, quality === "high" ? 12 : 8]} />
                  <meshStandardMaterial color="#64804a" roughness={1} />
                </mesh>
                <mesh position={[0.36, 0.22, -0.14]} frustumCulled={false}>
                  <sphereGeometry args={[0.56, quality === "high" ? 10 : 7, quality === "high" ? 10 : 7]} />
                  <meshStandardMaterial color="#75925b" roughness={1} />
                </mesh>
              </>
            )}
            {cluster.kind === 1 && (
              <>
                {[-0.18, 0, 0.18].map((x) => (
                  <mesh key={`${cluster.id}-${x}`} position={[x, 0.54, 0]} frustumCulled={false}>
                    <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
                    <meshStandardMaterial color="#6d8a4d" roughness={0.96} />
                  </mesh>
                ))}
                <mesh position={[0, 1.02, 0]} frustumCulled={false}>
                  <sphereGeometry args={[0.14, 10, 10]} />
                  <meshStandardMaterial color="#e7dcb7" roughness={0.64} />
                </mesh>
              </>
            )}
            {cluster.kind === 2 && (
              <>
                <mesh position={[0, 0.5, 0]} frustumCulled={false}>
                  <cylinderGeometry args={[0.22, 0.34, 1.06, 6]} />
                  <meshStandardMaterial color="#7a6a60" roughness={0.94} />
                </mesh>
                <mesh position={[0.08, 1.06, 0.03]} frustumCulled={false}>
                  <octahedronGeometry args={[0.18, 0]} />
                  <meshStandardMaterial
                    color={cluster.accent > 0.5 ? "#f2e5c7" : "#dbe9ff"}
                    emissive={cluster.accent > 0.5 ? "#f2e5c7" : "#dbe9ff"}
                    emissiveIntensity={0.1}
                    roughness={0.52}
                  />
                </mesh>
              </>
            )}
            {cluster.kind === 3 && (
              <>
                <mesh position={[0, 0.62, 0]} frustumCulled={false}>
                  <cylinderGeometry args={[0.05, 0.08, 1.4, 6]} />
                  <meshStandardMaterial color="#7b654f" roughness={0.96} />
                </mesh>
                <mesh position={[0, 1.34, 0]} frustumCulled={false}>
                  <sphereGeometry args={[0.18, 12, 12]} />
                  <meshStandardMaterial
                    color="#fff1cb"
                    emissive={cluster.accent > 0.5 ? "#d8efb8" : "#ffe4b1"}
                    emissiveIntensity={0.22}
                    roughness={0.34}
                  />
                </mesh>
              </>
            )}
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function ThresholdForecourtComposition({
  quality,
}: {
  quality: QualityTier;
}) {
  const pathMarkers = [
    { id: "threshold-1", x: 0, z: 15, radius: 3.2, rotation: 0.05, scale: 1 },
    { id: "threshold-2", x: -0.8, z: 10, radius: 3.6, rotation: -0.08, scale: 1.04 },
    { id: "threshold-3", x: 0.4, z: 5, radius: 4.1, rotation: 0.12, scale: 1.08 },
    { id: "threshold-4", x: -0.6, z: 0, radius: 4.6, rotation: -0.06, scale: 1.1 },
    { id: "threshold-5", x: 0.8, z: -6, radius: 5.2, rotation: 0.08, scale: 1.14 },
  ] as const;
  const sentinels = [
    {
      id: "west-sentinel",
      anchor: createGroundedAnchor(-13.5, 4, 0.06),
      height: 3.8,
      accent: "#d8ecb7",
      stone: "#7b7262",
    },
    {
      id: "east-sentinel",
      anchor: createGroundedAnchor(13.5, 4, 0.06),
      height: 4,
      accent: "#dae6ff",
      stone: "#736e68",
    },
    {
      id: "south-beacon",
      anchor: createHoverAnchor(0, -11, 4.2),
      height: 5.1,
      accent: "#ffe0b8",
      stone: "#847968",
    },
  ] as const;
  const pathScale = quality === "high" ? 1 : quality === "medium" ? 0.92 : 0.84;

  return (
    <group>
      {pathMarkers.map((marker, index) => (
        <MeadowSurfaceSocket
          key={marker.id}
          anchor={createGroundedAnchor(marker.x, marker.z, 0.05)}
          rotationY={marker.rotation}
          disableCulling
        >
          <group scale={marker.scale * pathScale}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry
                args={[marker.radius, quality === "high" ? 48 : 28]}
              />
              <meshBasicMaterial
                color={index < 2 ? "#b9ad90" : "#c6b597"}
                transparent
                opacity={0.3}
                depthWrite={false}
              />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
              <ringGeometry
                args={[marker.radius * 0.68, marker.radius * 0.94, quality === "high" ? 42 : 26]}
              />
              <meshBasicMaterial
                color={index === pathMarkers.length - 1 ? "#f4ddb7" : "#e8d3af"}
                transparent
                opacity={0.18}
                depthWrite={false}
              />
            </mesh>
          </group>
        </MeadowSurfaceSocket>
      ))}

      {sentinels.map((sentinel) => (
        <MeadowSurfaceSocket
          key={sentinel.id}
          anchor={sentinel.anchor}
          disableCulling
        >
          <group>
            <mesh position={[0, sentinel.height * 0.44, 0]}>
              <cylinderGeometry args={[0.26, 0.42, sentinel.height, 8]} />
              <meshStandardMaterial color={sentinel.stone} roughness={0.95} />
            </mesh>
            <mesh position={[0, sentinel.height + 0.22, 0]}>
              <sphereGeometry args={[0.34, 16, 16]} />
              <meshStandardMaterial
                color="#fff4da"
                emissive={sentinel.accent}
                emissiveIntensity={0.36}
                roughness={0.3}
              />
            </mesh>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, sentinel.height * 0.64, 0]}
            >
              <ringGeometry args={[0.82, 1.08, 28]} />
              <meshBasicMaterial
                color={sentinel.accent}
                transparent
                opacity={0.16}
                depthWrite={false}
              />
            </mesh>
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function OrganicTree({
  tree,
  index,
  quality,
}: {
  tree: (typeof MEADOW_TREE_LAYOUT)[number];
  index: number;
  quality: QualityTier;
}) {
  const canopyBlobs = useMemo(
    () =>
      Array.from({
        length:
          quality === "high"
            ? tree.landmark
              ? 9
              : 6
            : quality === "medium"
              ? tree.landmark
                ? 7
                : 4
              : tree.landmark
                ? 5
                : 3,
      }, (_, blobIndex) => ({
        x: (seededRandom(index * 17 + blobIndex * 31) * 2 - 1) *
          tree.canopy *
          0.42,
        y:
          tree.height * (tree.landmark ? 0.9 : 0.84) +
          blobIndex * tree.canopy * 0.18,
        z: (seededRandom(index * 29 + blobIndex * 19) * 2 - 1) *
          tree.canopy *
          0.36,
        scale:
          tree.canopy *
          (tree.landmark ? 0.62 : 0.54) *
          (0.78 + seededRandom(index * 11 + blobIndex * 7) * 0.42),
      })),
    [index, quality, tree.canopy, tree.height, tree.landmark],
  );
  const branchArms = useMemo(
    () =>
      Array.from(
        {
          length:
            quality === "high"
              ? tree.landmark
                ? 4
                : 3
              : quality === "medium"
                ? 3
                : 2,
        },
        (_, armIndex) => ({
          y: tree.height * (0.5 + armIndex * 0.09),
          yaw:
            (armIndex / Math.max(3, tree.landmark ? 4 : 3)) * Math.PI * 2 +
            seededRandom(index * 53 + armIndex * 17) * 0.4,
          pitch: -0.42 - seededRandom(index * 61 + armIndex * 19) * 0.18,
          roll: (seededRandom(index * 67 + armIndex * 23) - 0.5) * 0.26,
          length:
            tree.canopy * (tree.landmark ? 1.15 : 0.88) *
            (0.78 + seededRandom(index * 71 + armIndex * 29) * 0.34),
          thickness: tree.landmark ? 0.13 : 0.11,
        }),
      ),
    [index, quality, tree.canopy, tree.height, tree.landmark],
  );
  const canopyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!canopyRef.current) return;

    const elapsed = state.clock.elapsedTime;
    const motionStrength =
      quality === "high" ? 1 : quality === "medium" ? 0.7 : 0.44;
    const landmarkMultiplier = tree.landmark ? 1.15 : 0.86;
    const sway = Math.sin(elapsed * 0.34 + index * 0.91) * 0.04;
    const nod = Math.cos(elapsed * 0.28 + index * 0.47) * 0.028;

    canopyRef.current.rotation.z = sway * motionStrength * landmarkMultiplier;
    canopyRef.current.rotation.x = nod * motionStrength * landmarkMultiplier;
    canopyRef.current.position.y =
      Math.sin(elapsed * 0.42 + index * 0.63) * 0.05 * motionStrength;
  });

  return (
    <MeadowSurfaceSocket
      anchor={tree.anchor}
      rotationY={seededRandom(index + 900) * Math.PI}
    >
      <group scale={tree.scale}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <circleGeometry
            args={[tree.canopy * 0.56, quality === "high" ? 24 : 16]}
          />
          <meshBasicMaterial
            color="#8cac68"
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, tree.height * 0.28, 0.03]} rotation={[0, 0, tree.lean * 0.4]}>
          <cylinderGeometry args={[0.34, 0.52, tree.height * 0.56, 10]} />
          <meshStandardMaterial color="#71543a" roughness={1} />
        </mesh>
        <mesh position={[0.02, tree.height * 0.66, -0.03]} rotation={[0, 0, tree.lean]}>
          <cylinderGeometry args={[0.18, 0.3, tree.height * 0.54, 10]} />
          <meshStandardMaterial color="#77583e" roughness={0.98} />
        </mesh>

        {[-0.18, 0.18].map((side, rootIndex) => (
          <mesh
            key={`${tree.anchor.planar.join("-")}-root-${rootIndex}`}
            position={[side, 0.18, 0.12 * side]}
            rotation={[0, side * 0.4, side * 0.22]}
          >
            <cylinderGeometry args={[0.14, 0.08, 0.42, 6]} />
            <meshStandardMaterial color="#7a5b3e" roughness={1} />
          </mesh>
        ))}

        {branchArms.map((arm, armIndex) => (
          <mesh
            key={`${tree.anchor.planar.join("-")}-branch-${armIndex}`}
            position={[0, arm.y, 0]}
            rotation={[arm.pitch, arm.yaw, arm.roll]}
          >
            <cylinderGeometry args={[arm.thickness * 0.58, arm.thickness, arm.length, 8]} />
            <meshStandardMaterial color="#6e533b" roughness={0.98} />
          </mesh>
        ))}

        <group ref={canopyRef}>
          {canopyBlobs.map((blob, blobIndex) => (
            <mesh
              key={`${tree.anchor.planar.join("-")}-blob-${blobIndex}`}
              position={[blob.x, blob.y, blob.z]}
              scale={[1.18, 0.8, 1.06]}
            >
              <sphereGeometry
                args={[blob.scale, quality === "high" ? 18 : 12, quality === "high" ? 18 : 12]}
              />
              <meshStandardMaterial
                color={blobIndex % 2 === 0 ? tree.tone : tree.secondaryTone}
                roughness={1}
                emissive={blobIndex % 2 === 0 ? tree.tone : tree.secondaryTone}
                emissiveIntensity={0.04}
              />
            </mesh>
          ))}
          <mesh
            position={[0.08, tree.height * (tree.landmark ? 1.14 : 1.02), -0.06]}
            scale={[1.08, 0.54, 1]}
          >
            <sphereGeometry
              args={[
                tree.canopy * (tree.landmark ? 0.56 : 0.44),
                quality === "high" ? 18 : 12,
                quality === "high" ? 18 : 12,
              ]}
            />
            <meshStandardMaterial
              color={tree.secondaryTone}
              roughness={1}
              emissive={tree.secondaryTone}
              emissiveIntensity={0.03}
            />
          </mesh>

          {tree.landmark && (
            <>
              <mesh position={[0.8, tree.height * 1.02, 0.3]}>
                <sphereGeometry
                  args={[0.34, quality === "high" ? 14 : 10, quality === "high" ? 14 : 10]}
                />
                <meshStandardMaterial
                  color="#fff3cf"
                  emissive="#fff1bb"
                  emissiveIntensity={0.38}
                  roughness={0.34}
                />
              </mesh>
              <mesh position={[-0.78, tree.height * 0.98, 0.22]}>
                <sphereGeometry args={[0.18, 12, 12]} />
                <meshStandardMaterial
                  color="#f4e0b7"
                  emissive="#f4e0b7"
                  emissiveIntensity={0.22}
                  roughness={0.44}
                />
              </mesh>
              <mesh position={[-0.4, tree.height * 1.22, -0.2]}>
                <torusGeometry args={[0.5, 0.04, 8, 28]} />
                <meshStandardMaterial
                  color="#dbe9b8"
                  emissive="#dbe9b8"
                  emissiveIntensity={0.16}
                  roughness={0.44}
                />
              </mesh>
            </>
          )}
        </group>
      </group>
    </MeadowSurfaceSocket>
  );
}

function SkylineTreeSilhouette({
  landmark,
  index,
  quality,
}: {
  landmark: MeadowSkylineLandmark;
  index: number;
  quality: QualityTier;
}) {
  const canopyRef = useRef<THREE.Group>(null);
  const massScale =
    0.88 + THREE.MathUtils.clamp(landmark.scale, 1, 8) * 0.1;
  const canopyRadius = (landmark.canopy || 6.4) * massScale;
  const trunkHeight = (landmark.height || 18) * massScale;
  const trunkRadiusTop = 0.22 * massScale;
  const trunkRadiusBase = 0.38 * massScale;
  const silhouetteStrength = landmark.coreVisual ? 1 : 0.82;
  const canopyBlobs = useMemo(
    () =>
      Array.from(
        {
          length: quality === "high" ? 5 : quality === "medium" ? 4 : 3,
        },
        (_, blobIndex) => ({
          x:
            (seededRandom(index * 37 + blobIndex * 17) * 2 - 1) *
            canopyRadius *
            0.36,
          y:
            trunkHeight * 0.88 +
            blobIndex * canopyRadius * 0.1,
          z:
            (seededRandom(index * 23 + blobIndex * 19) * 2 - 1) *
            canopyRadius *
            0.32,
          scale:
            canopyRadius *
            (0.3 + seededRandom(index * 29 + blobIndex * 13) * 0.12),
        }),
      ),
    [canopyRadius, index, quality, trunkHeight],
  );

  useFrame((state) => {
    if (!canopyRef.current) return;

    const elapsed = state.clock.elapsedTime;
    const motionStrength =
      quality === "high" ? 1 : quality === "medium" ? 0.72 : 0.48;

    canopyRef.current.rotation.z =
      Math.sin(elapsed * 0.22 + index * 0.67) * 0.024 * motionStrength;
    canopyRef.current.rotation.x =
      Math.cos(elapsed * 0.19 + index * 0.51) * 0.014 * motionStrength;
  });

  return (
    <MeadowSurfaceSocket
      anchor={landmark.anchor}
      rotationY={seededRandom(index + 2400) * Math.PI}
      disableCulling
    >
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} frustumCulled={false}>
          <circleGeometry args={[canopyRadius * 0.56, quality === "high" ? 28 : 18]} />
          <meshBasicMaterial
            color={landmark.accent}
            transparent
            opacity={landmark.coreVisual ? 0.15 : 0.065}
            depthWrite={false}
          />
        </mesh>
        <mesh
          position={[0, trunkHeight * 0.34, 0]}
          rotation={[0, 0, (landmark.lean || 0) * 0.5]}
          frustumCulled={false}
        >
          <cylinderGeometry args={[trunkRadiusTop, trunkRadiusBase, trunkHeight * 0.68, 8]} />
          <meshStandardMaterial color="#5e4330" roughness={1} />
        </mesh>
        <group ref={canopyRef}>
          {canopyBlobs.map((blob, blobIndex) => (
            <mesh
              key={`${landmark.id}-sky-blob-${blobIndex}`}
              position={[blob.x, blob.y, blob.z]}
              scale={[1.2, 0.82, 1.08]}
              frustumCulled={false}
            >
              <sphereGeometry
                args={[blob.scale, quality === "high" ? 18 : 12, quality === "high" ? 18 : 12]}
              />
              <meshStandardMaterial
                color={blobIndex % 2 === 0 ? landmark.tone : landmark.secondaryTone || landmark.tone}
                emissive={blobIndex % 2 === 0 ? landmark.tone : landmark.secondaryTone || landmark.tone}
                emissiveIntensity={0.065 * silhouetteStrength}
                roughness={0.96}
              />
            </mesh>
          ))}
          {landmark.coreVisual && (
            <mesh
              position={[0.42 * massScale, trunkHeight * 1.02, 0.18 * massScale]}
              frustumCulled={false}
            >
              <sphereGeometry args={[0.24 * massScale, 12, 12]} />
              <meshStandardMaterial
                color="#fff1cb"
                emissive={landmark.accent}
                emissiveIntensity={0.34}
                roughness={0.24}
              />
            </mesh>
          )}
        </group>
      </group>
    </MeadowSurfaceSocket>
  );
}

function SkylineRidgeSilhouette({
  ridge,
  index,
  quality,
}: {
  ridge: MeadowSkylineRidge;
  index: number;
  quality: QualityTier;
}) {
  const ridgeScale =
    quality === "high" ? 1.08 : quality === "medium" ? 0.98 : 0.9;
  const width = ridge.width * ridgeScale;
  const depth = ridge.depth * ridgeScale;
  const height = ridge.height * ridgeScale;

  return (
    <MeadowSurfaceSocket
      anchor={ridge.anchor}
      rotationY={ridge.rotation}
      disableCulling
    >
      <group>
        <mesh
          position={[0, height * 0.28, 0]}
          scale={[width, height, depth]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, quality === "high" ? 24 : 16, quality === "high" ? 20 : 14]} />
          <meshStandardMaterial
            color={ridge.tone}
            roughness={0.96}
            transparent
            opacity={ridge.opacity}
          />
        </mesh>
        <mesh
          position={[0, height * 0.42, 0.18]}
          scale={[width * 0.82, height * 0.56, depth * 0.72]}
          frustumCulled={false}
        >
          <sphereGeometry args={[1, quality === "high" ? 18 : 12, quality === "high" ? 16 : 10]} />
          <meshStandardMaterial
            color={ridge.accent}
            emissive={ridge.accent}
            emissiveIntensity={ridge.coreVisual ? 0.08 : 0.04}
            roughness={0.92}
            transparent
            opacity={ridge.opacity * 0.3}
          />
        </mesh>
      </group>
    </MeadowSurfaceSocket>
  );
}

function TreeCluster({
  tier,
  densityMultiplier,
}: {
  tier: QualityTier;
  densityMultiplier: number;
}) {
  const trees = useMemo(() => {
    const baseTrees =
      tier === "high"
        ? MEADOW_TREE_LAYOUT
        : tier === "medium"
          ? MEADOW_TREE_LAYOUT.filter((tree, index) => tree.landmark || index % 5 !== 0)
          : MEADOW_TREE_LAYOUT.filter((tree, index) => tree.landmark || index % 3 === 0);

    if (densityMultiplier >= 0.95) return baseTrees;

    const interval =
      densityMultiplier >= 0.82 ? 6 : densityMultiplier >= 0.66 ? 4 : 3;
    return baseTrees.filter((tree, index) => tree.landmark || index % interval !== 0);
  }, [densityMultiplier, tier]);

  return (
    <group>
      {trees.map((tree, index) => (
        <OrganicTree key={tree.id} tree={tree} index={index} quality={tier} />
      ))}
    </group>
  );
}

function PeripheralSilhouetteBand({ quality }: { quality: QualityTier }) {
  const skylineRidges = useMemo(
    () => getMeadowSkylineRidgesForQuality(quality),
    [quality],
  );
  const skylineLandmarks = useMemo(
    () => getMeadowSkylineLandmarksForQuality(quality),
    [quality],
  );
  const treeSilhouettes = useMemo(
    () => skylineLandmarks.filter((landmark) => landmark.kind === "tree"),
    [skylineLandmarks],
  );
  const stoneSilhouettes = useMemo(
    () => skylineLandmarks.filter((landmark) => landmark.kind === "stone"),
    [skylineLandmarks],
  );
  const beacons = useMemo(
    () => skylineLandmarks.filter((landmark) => landmark.kind === "beacon"),
    [skylineLandmarks],
  );

  return (
    <group>
      {skylineRidges.map((ridge, index) => (
        <SkylineRidgeSilhouette
          key={ridge.id}
          ridge={ridge}
          index={8600 + index}
          quality={quality}
        />
      ))}
      {treeSilhouettes.map((tree, index) => (
        <SkylineTreeSilhouette
          key={tree.id}
          landmark={tree}
          index={9000 + index}
          quality={quality}
        />
      ))}
      {stoneSilhouettes.map((stone, index) => (
        <MeadowSurfaceSocket
          key={stone.id}
          anchor={stone.anchor}
          rotationY={0.18 + index * 0.27}
          disableCulling
        >
          <group>
            <mesh
              position={[0, (5.4 + stone.scale * 0.9) * 0.52, 0]}
              frustumCulled={false}
            >
              <cylinderGeometry
                args={[
                  0.54 + stone.scale * 0.08,
                  0.92 + stone.scale * 0.11,
                  5.4 + stone.scale * 0.9,
                  quality === "high" ? 8 : 6,
                ]}
              />
              <meshStandardMaterial color={stone.tone} roughness={0.9} />
            </mesh>
            <mesh
              position={[0.34, 4.8 + stone.scale * 0.62, -0.18]}
              rotation={[0.1, 0.08, 0.06]}
              frustumCulled={false}
            >
              <cylinderGeometry args={[0.22, 0.3, 3.6 + stone.scale * 0.5, 5]} />
              <meshStandardMaterial color="#8b7a6d" roughness={0.92} />
            </mesh>
            <mesh
              position={[0, 6.5 + stone.scale * 0.9, 0]}
              frustumCulled={false}
            >
              <octahedronGeometry args={[0.34 + stone.scale * 0.05, 0]} />
              <meshStandardMaterial
                color="#f4f6ff"
                emissive={stone.accent}
                emissiveIntensity={0.34}
                roughness={0.28}
              />
            </mesh>
          </group>
        </MeadowSurfaceSocket>
      ))}
      {beacons.map((beacon, index) => (
        <MeadowSurfaceSocket
          key={beacon.id}
          anchor={beacon.anchor}
          rotationY={index * 0.8}
          disableCulling
        >
          <group scale={0.72 + beacon.scale * 0.22}>
            <mesh frustumCulled={false}>
              <sphereGeometry args={[0.34, quality === "high" ? 18 : 12, quality === "high" ? 18 : 12]} />
              <meshStandardMaterial
                color={beacon.tone}
                emissive={beacon.accent}
                emissiveIntensity={quality === "high" ? 0.66 : 0.42}
                roughness={0.24}
              />
            </mesh>
            <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
              <torusGeometry args={[0.72, 0.06, 10, 28]} />
              <meshStandardMaterial
                color={beacon.accent}
                emissive={beacon.accent}
                emissiveIntensity={0.22}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, -0.72, 0]} frustumCulled={false}>
              <cylinderGeometry args={[0.04, 0.02, 1.2, 6]} />
              <meshStandardMaterial color="#d7c6a7" roughness={0.88} />
            </mesh>
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function MeadowCloudCluster({
  cloud,
  index,
  quality,
}: {
  cloud: CloudLayer;
  index: number;
  quality: QualityTier;
}) {
  const puffs = useMemo(
    () =>
      Array.from({
        length:
          quality === "high"
            ? cloud.puffCount
            : quality === "medium"
              ? Math.max(3, Math.round(cloud.puffCount * 0.8))
              : Math.max(2, Math.round(cloud.puffCount * 0.6)),
      }, (_, puffIndex) => ({
        x:
          (seededRandom(index * 29 + puffIndex * 17) * 2 - 1) *
          cloud.spread *
          0.56,
        y:
          (seededRandom(index * 11 + puffIndex * 13) - 0.5) *
          cloud.spread *
          0.12,
        z:
          (seededRandom(index * 41 + puffIndex * 7) * 2 - 1) *
          cloud.spread *
          0.38,
        scale: cloud.scale * (0.38 + seededRandom(index * 23 + puffIndex * 19) * 0.28),
      })),
    [cloud.puffCount, cloud.scale, cloud.spread, index, quality],
  );

  return (
    <MeadowSurfaceSocket anchor={cloud.anchor} rotationY={seededRandom(index + 300) * Math.PI}>
      <group>
        {puffs.map((puff, puffIndex) => (
          <mesh
            key={`${cloud.id}-puff-${puffIndex}`}
            position={[puff.x, puff.y, puff.z]}
            scale={[1.3, 0.74, 1]}
          >
            <sphereGeometry
              args={[puff.scale, quality === "high" ? 18 : 12, quality === "high" ? 18 : 12]}
            />
            <meshStandardMaterial
              color={cloud.tone}
              transparent
              opacity={cloud.opacity * 0.44}
              roughness={0.96}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </MeadowSurfaceSocket>
  );
}

function CloudField({ tier }: { tier: QualityTier }) {
  const clouds = useMemo(() => {
    const baseClouds = MEADOW_CLOUD_LAYERS.filter(
      (cloud) => cloud.id !== "court-cloudbank",
    );
    if (tier === "high") return baseClouds;
    if (tier === "medium") return baseClouds.filter((_, index) => index % 3 !== 2);
    return baseClouds.filter((_, index) => index % 3 === 0);
  }, [tier]);

  return (
    <group>
      {clouds.map((cloud, index) => (
        <MeadowCloudCluster
          key={cloud.id}
          cloud={cloud}
          index={index}
          quality={tier}
        />
      ))}
    </group>
  );
}

function ReturnCourtTerrace({ quality }: { quality: QualityTier }) {
  const postAngles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        angle: (index / 8) * Math.PI * 2 + 0.12,
        height: index % 2 === 0 ? 0.78 : 0.58,
      })),
    [],
  );
  const pathMarkers = useMemo(
    () =>
      [
        { z: -4.8, width: 1.28, depth: 1.56, height: 0.16, light: true },
        { z: -7.3, width: 1.04, depth: 1.24, height: 0.14, light: true },
        { z: -9.3, width: 0.92, depth: 1.08, height: 0.12, light: false },
        { z: -11.1, width: 0.78, depth: 0.92, height: 0.1, light: false },
      ] as const,
    [],
  );
  const sentinels = useMemo(
    () =>
      [
        { x: -1.9, z: -3.8, height: 3.4, glow: "#f2ddb2" },
        { x: 0, z: -6.2, height: 4.5, glow: "#fff0cc" },
        { x: 1.9, z: -3.6, height: 3.3, glow: "#efe1b8" },
      ] as const,
    [],
  );

  return (
    <MeadowSurfaceSocket
      anchor={createGroundedAnchor(0, 24, 0.06)}
      rotationY={Math.PI}
      disableCulling
    >
      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          scale={[8.3, 1, 8.3]}
          frustumCulled={false}
        >
          <circleGeometry args={[1, 52]} />
          <meshBasicMaterial
            color="#fff4de"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.12, 0]} frustumCulled={false}>
          <cylinderGeometry args={[6.2, 6.8, 0.22, 40]} />
          <meshStandardMaterial color="#b8a18a" roughness={0.98} />
        </mesh>
        <mesh position={[0, 0.2, 0]} frustumCulled={false}>
          <cylinderGeometry args={[5.2, 5.6, 0.16, 40]} />
          <meshStandardMaterial color="#d5c3ae" roughness={0.95} />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.29, -1.6]}
          scale={[2.6, 1, 5.8]}
          frustumCulled={false}
        >
          <circleGeometry args={[1, 34]} />
          <meshStandardMaterial color="#cab394" roughness={0.98} />
        </mesh>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.305, -1.6]}
          scale={[1.7, 1, 4.5]}
          frustumCulled={false}
        >
          <circleGeometry args={[1, 28]} />
          <meshBasicMaterial
            color="#f2e4cf"
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </mesh>
        {pathMarkers.map((marker, index) => (
          <group key={`return-court-marker-${marker.z}`} position={[0, 0.16, marker.z]}>
            <mesh frustumCulled={false}>
              <cylinderGeometry args={[marker.width, marker.width * 1.08, marker.height, 24]} />
              <meshStandardMaterial color="#bda789" roughness={0.96} />
            </mesh>
            <mesh position={[0, marker.height * 0.62, 0]} frustumCulled={false}>
              <cylinderGeometry args={[marker.width * 0.72, marker.width * 0.76, 0.04, 24]} />
              <meshStandardMaterial color="#eadac4" roughness={0.82} />
            </mesh>
            {marker.light && (
              <>
                {[-marker.width * 0.72, marker.width * 0.72].map((x) => (
                  <group key={`marker-light-${marker.z}-${x}`} position={[x, 0.1, 0]}>
                    <mesh frustumCulled={false}>
                      <cylinderGeometry args={[0.07, 0.09, 0.54, 8]} />
                      <meshStandardMaterial color="#856f59" roughness={0.94} />
                    </mesh>
                    <mesh position={[0, 0.3, 0]} frustumCulled={false}>
                      <sphereGeometry
                        args={[0.09, quality === "high" ? 10 : 8, quality === "high" ? 10 : 8]}
                      />
                      <meshStandardMaterial
                        color="#fff3da"
                        emissive="#f5e4bf"
                        emissiveIntensity={quality === "high" ? 0.22 : 0.14}
                        roughness={0.34}
                      />
                    </mesh>
                  </group>
                ))}
              </>
            )}
            {index === 0 && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, marker.height * 0.7, 0]}
                frustumCulled={false}
              >
                <ringGeometry args={[marker.width * 0.34, marker.width * 0.42, 28]} />
                <meshBasicMaterial color="#fff3d6" transparent opacity={0.16} depthWrite={false} />
              </mesh>
            )}
          </group>
        ))}
        {sentinels.map((sentinel, index) => (
          <group
            key={`return-court-sentinel-${sentinel.x}-${sentinel.z}`}
            position={[sentinel.x, 0.24, sentinel.z]}
          >
            <mesh frustumCulled={false}>
              <cylinderGeometry args={[0.18, 0.24, sentinel.height, 10]} />
              <meshStandardMaterial color="#8b755f" roughness={0.94} />
            </mesh>
            <mesh position={[0, sentinel.height * 0.52, 0]} frustumCulled={false}>
              <cylinderGeometry args={[0.28, 0.36, 0.18, 12]} />
              <meshStandardMaterial color="#c5b094" roughness={0.86} />
            </mesh>
            <mesh position={[0, sentinel.height * 0.72, 0]} frustumCulled={false}>
              <sphereGeometry
                args={[0.18, quality === "high" ? 14 : 10, quality === "high" ? 14 : 10]}
              />
              <meshStandardMaterial
                color="#fff3dd"
                emissive={sentinel.glow}
                emissiveIntensity={quality === "high" ? 0.28 : 0.18}
                roughness={0.28}
              />
            </mesh>
            {index === 1 && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, sentinel.height * 0.7, 0]}
                frustumCulled={false}
              >
                <ringGeometry args={[0.38, 0.52, 28]} />
                <meshBasicMaterial color="#f7ead2" transparent opacity={0.18} depthWrite={false} />
              </mesh>
            )}
          </group>
        ))}
        {postAngles.map((post, index) => (
          <group
            key={`return-court-post-${index}`}
            position={[
              Math.cos(post.angle) * 5.7,
              0.26,
              Math.sin(post.angle) * 5.5,
            ]}
            rotation={[0, post.angle, 0]}
          >
            <mesh frustumCulled={false}>
              <cylinderGeometry args={[0.14, 0.18, post.height, 8]} />
              <meshStandardMaterial color="#8a7562" roughness={0.96} />
            </mesh>
            <mesh position={[0, post.height * 0.56, 0]} frustumCulled={false}>
              <sphereGeometry args={[0.12, quality === "high" ? 12 : 8, quality === "high" ? 12 : 8]} />
              <meshStandardMaterial
                color="#fff3d8"
                emissive="#f3e3b9"
                emissiveIntensity={quality === "high" ? 0.26 : 0.18}
                roughness={0.42}
              />
            </mesh>
          </group>
        ))}
      </group>
    </MeadowSurfaceSocket>
  );
}

function WildflowerField({
  tier,
  densityMultiplier,
}: {
  tier: QualityTier;
  densityMultiplier: number;
}) {
  const clumps = useMemo(
    () =>
      MEADOW_GRASS_PATCHES.flatMap((patch, patchIndex) => {
        const baseCount =
          tier === "low"
            ? Math.round(patch.density * 1)
            : tier === "medium"
              ? Math.round(patch.density * 3)
              : Math.round(patch.density * 5);
        const count = Math.max(1, Math.round(baseCount * densityMultiplier));

        return Array.from({ length: count }, (_, clumpIndex) => {
          const seed = patchIndex * 157 + clumpIndex * 23;
          const x =
            patch.center[0] +
            (seededRandom(seed + 1) * 2 - 1) * patch.spread[0] * 0.88;
          const z =
            patch.center[1] +
            (seededRandom(seed + 5) * 2 - 1) * patch.spread[1] * 0.88;

          if (
            MEADOW_DEPOSIT_SITES.some(
              (site) => distanceBetweenPlanarPoints(site.planar, [x, z]) < 8.2,
            )
          ) {
            return null;
          }

          return {
            id: `${patch.id}-flowers-${clumpIndex}`,
            x,
            z,
            scale: 0.7 + seededRandom(seed + 9) * 1.4,
            hueIndex: Math.floor(seededRandom(seed + 11) * 4),
          };
        }).filter(Boolean) as Array<{
          id: string;
          x: number;
          z: number;
          scale: number;
          hueIndex: number;
        }>;
      }),
    [densityMultiplier, tier],
  );

  const palette = ["#f6e8b0", "#dfe4ff", "#f5d7be", "#fff8ea"];

  return (
    <group>
      {clumps.map((clump, index) => (
        <MeadowSurfaceSocket
          key={clump.id}
          anchor={{
            planar: [clump.x, clump.z],
            contactMode: "grounded",
            offset: 0.1,
          }}
          rotationY={seededRandom(index + 670) * Math.PI}
          disableCulling
        >
          <mesh position={[0, 0.06, 0]} frustumCulled={false}>
            <sphereGeometry
              args={[0.06 * clump.scale, tier === "high" ? 8 : 6, tier === "high" ? 8 : 6]}
            />
            <meshStandardMaterial color="#6f8e48" roughness={0.94} />
          </mesh>
          {[-0.08, 0, 0.08].map((offset, offsetIndex) => (
            <mesh
              key={`${clump.id}-petal-${offsetIndex}`}
              position={[offset * clump.scale, 0.15 * clump.scale, 0.05 * (offsetIndex - 1)]}
              frustumCulled={false}
            >
              <sphereGeometry
                args={[0.08 * clump.scale, tier === "high" ? 8 : 6, tier === "high" ? 8 : 6]}
              />
              <meshStandardMaterial
                color={palette[(clump.hueIndex + offsetIndex) % palette.length]}
                roughness={0.72}
                emissive={palette[(clump.hueIndex + offsetIndex) % palette.length]}
                emissiveIntensity={0.05}
              />
            </mesh>
          ))}
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function MeadowLanternGuides({ quality }: { quality: QualityTier }) {
  const floatingLanterns = useMemo(
    () =>
      MEADOW_LANDMARKS.filter((landmark) =>
        ["lantern", "beacon"].includes(landmark.kind),
      ),
    [],
  );

  return (
    <group>
      {floatingLanterns.map((lantern, index) => (
        <MeadowSurfaceSocket
          key={lantern.id}
          anchor={lantern.anchor}
          rotationY={seededRandom(index + 910) * Math.PI}
        >
          <mesh position={[0, 0, 0]}>
            <sphereGeometry
              args={[0.32 * lantern.scale, quality === "high" ? 16 : 10, quality === "high" ? 16 : 10]}
            />
            <meshStandardMaterial
              color="#fff4d0"
              emissive={lantern.accent}
              emissiveIntensity={quality === "high" ? 1.2 : 0.88}
              roughness={0.18}
            />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry
              args={[0.46 * lantern.scale, 0.62 * lantern.scale, quality === "high" ? 30 : 20]}
            />
            <meshBasicMaterial
              color={lantern.accent}
              transparent
              opacity={0.28}
            />
          </mesh>
          <mesh position={[0, -0.24 * lantern.scale, 0]}>
            <sphereGeometry
              args={[0.08 * lantern.scale, quality === "high" ? 10 : 8, quality === "high" ? 10 : 8]}
            />
            <meshStandardMaterial color="#7a6548" roughness={0.92} />
          </mesh>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function HorizonMonoliths({ quality }: { quality: QualityTier }) {
  const monoliths = useMemo(() => {
    if (quality === "high") return MEADOW_MONOLITHS;
    if (quality === "medium") {
      return MEADOW_MONOLITHS.filter(
        (monolith, index) => monolith.coreVisual || index % 3 !== 1,
      );
    }
    return MEADOW_MONOLITHS.filter((monolith) => monolith.coreVisual);
  }, [quality]);

  return (
    <group>
      {monoliths.map((monolith, index) => (
        <MeadowSurfaceSocket
          key={monolith.id}
          anchor={monolith.anchor}
          rotationY={monolith.rotation}
        >
          <group>
            <mesh position={[0, monolith.height * 0.5, 0]}>
              <cylinderGeometry
                args={[
                  monolith.width * 0.32,
                  monolith.width * 0.72,
                  monolith.height,
                  quality === "high" ? 7 : 6,
                ]}
              />
              <meshStandardMaterial color={monolith.color} roughness={0.9} />
            </mesh>
            <mesh
              position={[monolith.width * 0.2, monolith.height * 0.58, -monolith.width * 0.18]}
              rotation={[0.08, 0.12, 0.06]}
            >
              <cylinderGeometry
                args={[
                  monolith.width * 0.12,
                  monolith.width * 0.22,
                  monolith.height * 0.74,
                  5,
                ]}
              />
              <meshStandardMaterial color="#8a7a70" roughness={0.92} />
            </mesh>
            <mesh position={[0, monolith.height + 0.68, 0]}>
              <octahedronGeometry args={[0.46 + seededRandom(index + 400) * 0.18, 0]} />
              <meshStandardMaterial
                color="#f5f7ff"
                emissive={monolith.glow}
                emissiveIntensity={0.42}
                roughness={0.32}
              />
            </mesh>
          </group>
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function MeadowLandmarkProps({ quality }: { quality: QualityTier }) {
  const props = useMemo(
    () =>
      MEADOW_LANDMARKS.filter(
        (landmark) =>
          landmark.kind === "house" ||
          landmark.kind === "shrine" ||
          (landmark.kind === "obelisk" &&
            (quality !== "low" || landmark.coreVisual)),
      ),
    [quality],
  );

  return (
    <group>
      {props.map((landmark, index) => (
        <MeadowSurfaceSocket
          key={landmark.id}
          anchor={landmark.anchor}
          rotationY={(landmark.planar[0] + landmark.planar[1]) * 0.004}
          alignment={
            landmark.kind === "house"
              ? 0.52
              : landmark.kind === "shrine"
                ? 0.72
                : landmark.kind === "obelisk"
                  ? 0.84
                  : 1
          }
          disableCulling={landmark.kind !== "obelisk"}
        >
          {landmark.kind === "house" && (
            <group scale={landmark.scale}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[3.4, 32]} />
                <meshBasicMaterial
                  color="#d9c3a4"
                  transparent
                  opacity={0.12}
                  depthWrite={false}
                />
              </mesh>
              <mesh position={[0, 0.18, 0]} frustumCulled={false}>
                <cylinderGeometry args={[2.1, 2.45, 0.26, 20]} />
                <meshStandardMaterial color="#8f7761" roughness={0.96} />
              </mesh>
              <mesh position={[0, 0.22, 1.42]} frustumCulled={false}>
                <boxGeometry args={[1.58, 0.16, 1.12]} />
                <meshStandardMaterial color="#b79c82" roughness={0.92} />
              </mesh>
              <mesh position={[0, 1.28, 0]} frustumCulled={false}>
                <boxGeometry args={[3.2, 2.05, 2.9]} />
                <meshStandardMaterial color="#efe4d6" roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.04, 1.46]} frustumCulled={false}>
                <boxGeometry args={[0.88, 1.36, 0.12]} />
                <meshStandardMaterial color="#644b37" roughness={0.86} />
              </mesh>
              <mesh position={[0, 1.14, 1.53]} frustumCulled={false}>
                <planeGeometry args={[0.54, 0.92]} />
                <meshBasicMaterial
                  color="#fff0d2"
                  transparent
                  opacity={0.4}
                />
              </mesh>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.32, 1.72]}
                frustumCulled={false}
              >
                <ringGeometry args={[0.42, 0.6, 28]} />
                <meshBasicMaterial
                  color={landmark.accent}
                  transparent
                  opacity={0.24}
                  depthWrite={false}
                />
              </mesh>
              {[-0.92, 0.92].map((windowX) => (
                <mesh
                  key={`${landmark.id}-window-${windowX}`}
                  position={[windowX, 1.46, 1.47]}
                  frustumCulled={false}
                >
                  <planeGeometry args={[0.44, 0.56]} />
                  <meshBasicMaterial
                    color="#ffe7b6"
                    transparent
                    opacity={0.86}
                  />
                </mesh>
              ))}
              {[-0.72, 0.72].map((lanternX) => (
                <group
                  key={`${landmark.id}-lantern-${lanternX}`}
                  position={[lanternX, 1.38, 1.56]}
                >
                  <mesh frustumCulled={false}>
                    <sphereGeometry args={[0.11, 10, 10]} />
                    <meshStandardMaterial
                      color="#fff2d5"
                      emissive={landmark.accent}
                      emissiveIntensity={0.24}
                      roughness={0.26}
                    />
                  </mesh>
                </group>
              ))}
              <mesh position={[0, 2.72, 0]} rotation={[0, Math.PI / 4, 0]} frustumCulled={false}>
                <coneGeometry args={[2.34, 1.9, 4]} />
                <meshStandardMaterial color="#7d5d4c" roughness={0.94} />
              </mesh>
              <mesh position={[0, 3.22, 0]} frustumCulled={false}>
                <cylinderGeometry args={[0.12, 0.16, 0.7, 8]} />
                <meshStandardMaterial color="#6a5243" roughness={0.92} />
              </mesh>
              <mesh position={[0, 3.68, 0]} frustumCulled={false}>
                <sphereGeometry args={[0.18, 10, 10]} />
                <meshStandardMaterial
                  color="#fff1d4"
                  emissive={landmark.accent}
                  emissiveIntensity={0.34}
                  roughness={0.3}
                />
              </mesh>
            </group>
          )}
          {landmark.kind === "shrine" && (
            <group scale={landmark.scale}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <ringGeometry args={[2.8, 4.6, 46]} />
                <meshBasicMaterial
                  color={landmark.accent}
                  transparent
                  opacity={0.14}
                />
              </mesh>
              <mesh position={[0, 0.18, 0]} frustumCulled={false}>
                <cylinderGeometry args={[2.3, 2.8, 0.22, 26]} />
                <meshStandardMaterial color="#776352" roughness={0.98} />
              </mesh>
              <mesh position={[0, 0.38, 0]} frustumCulled={false}>
                <cylinderGeometry args={[1.6, 2.1, 0.22, 24]} />
                <meshStandardMaterial color="#a88a70" roughness={0.94} />
              </mesh>
              <mesh position={[0, 1.64, 0]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
                <torusGeometry args={[1.18, 0.08, 12, 40]} />
                <meshStandardMaterial
                  color="#f0e7d6"
                  emissive={landmark.accent}
                  emissiveIntensity={0.18}
                  roughness={0.46}
                />
              </mesh>
              <mesh position={[0, 1.64, 0]} frustumCulled={false}>
                <cylinderGeometry args={[0.18, 0.24, 2.4, 10]} />
                <meshStandardMaterial color="#b59a7f" roughness={0.9} />
              </mesh>
              {Array.from({ length: 7 }).map((_, stoneIndex) => {
                const angle = (stoneIndex / 7) * Math.PI * 2;
                return (
                  <mesh
                    key={`${landmark.id}-shrine-stone-${stoneIndex}`}
                    position={[Math.cos(angle) * 2.3, 0.2, Math.sin(angle) * 2.1]}
                    rotation={[0, angle, 0]}
                  >
                    <dodecahedronGeometry args={[0.34, 0]} />
                    <meshStandardMaterial color="#7b6654" roughness={0.94} />
                  </mesh>
                );
              })}
              {Array.from({ length: 5 }).map((_, tuftIndex) => {
                const angle = (tuftIndex / 5) * Math.PI * 2 + 0.18;
                return (
                  <mesh
                    key={`${landmark.id}-tuft-${tuftIndex}`}
                    position={[Math.cos(angle) * 1.6, 0.42, Math.sin(angle) * 1.4]}
                    rotation={[0, angle, 0.14]}
                  >
                    <cylinderGeometry args={[0.05, 0.02, 0.9, 6]} />
                    <meshStandardMaterial color="#86a65e" roughness={0.92} />
                  </mesh>
                );
              })}
            </group>
          )}
          {landmark.kind === "obelisk" && (
            <group scale={landmark.scale}>
              <mesh position={[0, 0.48, 0]}>
                <cylinderGeometry args={[1.1, 1.5, 0.96, 12]} />
                <meshStandardMaterial color="#736760" roughness={0.92} />
              </mesh>
              <mesh position={[0, 6.4, 0]}>
                <boxGeometry args={[1.28, 12.8, 1.44]} />
                <meshStandardMaterial color="#5d5655" roughness={0.86} />
              </mesh>
              <mesh position={[0, 12.9, 0]}>
                <octahedronGeometry args={[0.62, 0]} />
                <meshStandardMaterial
                  color="#f4f7ff"
                  emissive={landmark.accent}
                  emissiveIntensity={0.54}
                  roughness={0.24}
                />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <ringGeometry args={[1.8, 2.8, 28]} />
                <meshBasicMaterial
                  color={landmark.accent}
                  transparent
                  opacity={0.14}
                />
              </mesh>
            </group>
          )}
        </MeadowSurfaceSocket>
      ))}
    </group>
  );
}

function DepositMarker({
  site,
  count,
  onSelect,
}: {
  site: DepositSite;
  count: number;
  onSelect: (site: DepositSite) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const shrinePieces = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        return {
          x: Math.cos(angle) * 1.8,
          z: Math.sin(angle) * 1.5,
          scale: 0.16 + seededRandom(index + site.label.length) * 0.22,
          rotation: seededRandom(index + site.label.length * 2) * Math.PI,
        };
      }),
    [site.label],
  );

  return (
    <MeadowSurfaceSocket
      anchor={{
        planar: site.anchor.planar,
        contactMode: "grounded",
        offset: 0.14,
      }}
      disableCulling
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.5, 2.8, 30]} />
        <meshBasicMaterial
          color={site.accent}
          transparent
          opacity={hovered ? 0.44 : 0.24}
        />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[1.3, 1.8, 0.36, 18]} />
        <meshStandardMaterial color="#796653" roughness={0.95} />
      </mesh>
      {shrinePieces.map((piece, index) => (
        <mesh
          key={`${site.id}-stone-${index}`}
          position={[piece.x, 0.08, piece.z]}
          rotation={[0, piece.rotation, 0]}
          scale={piece.scale}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8b735e" roughness={0.95} />
        </mesh>
      ))}
      {Array.from({ length: 5 }).map((_, index) => {
        const angle = (index / 5) * Math.PI * 2 + 0.2;
        return (
          <mesh
          key={`${site.id}-reed-${index}`}
          position={[Math.cos(angle) * 1.1, 0.54, Math.sin(angle) * 0.92]}
          rotation={[0, angle, 0.18]}
          frustumCulled={false}
        >
          <cylinderGeometry args={[0.04, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#7fa25c" roughness={0.92} />
          </mesh>
        );
      })}
      {Array.from({ length: 7 }).map((_, index) => {
        const angle = (index / 7) * Math.PI * 2 + 0.08;
        return (
          <mesh
            key={`${site.id}-petals-${index}`}
            position={[Math.cos(angle) * 1.7, 0.16, Math.sin(angle) * 1.45]}
            frustumCulled={false}
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#f0dfb8" : "#dfe2ff"}
              roughness={0.78}
              emissive={site.accent}
              emissiveIntensity={0.04}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 1.84, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color={hovered ? "#fff4dd" : site.accent}
          emissive={site.accent}
          emissiveIntensity={count > 0 ? 0.64 : 0.32}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <cylinderGeometry args={[0.08, 0.18, 4.4, 10]} />
        <meshBasicMaterial
          color={site.accent}
          transparent
          opacity={hovered ? 0.22 : 0.12}
        />
      </mesh>
      <mesh position={[0, 6.52, 0]}>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial
          color="#fff3d6"
          emissive={site.accent}
          emissiveIntensity={count > 0 ? 1 : hovered ? 0.88 : 0.7}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0, 6.52, 0]}>
        <sphereGeometry args={[0.52, 12, 12]} />
        <meshBasicMaterial
          color={site.accent}
          transparent
          opacity={hovered ? 0.14 : 0.08}
        />
      </mesh>
      <mesh position={[0, 6.52, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.6, 0.04, 10, 36]} />
        <meshStandardMaterial
          color={site.accent}
          emissive={site.accent}
          emissiveIntensity={0.48}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 5.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 1.18, 28]} />
        <meshBasicMaterial
          color={site.accent}
          transparent
          opacity={hovered ? 0.18 : 0.1}
        />
      </mesh>
      <mesh
        position={[0, 1.2, 0]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(site);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        userData={{ interaction: { type: "deposit", id: site.id } }}
      >
        <cylinderGeometry args={[2.4, 2.4, 3.8, 18]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </MeadowSurfaceSocket>
  );
}

function MeadowAmbientCreature({
  creature,
  runtimeRef,
  onSelect,
  reactionSiteId,
}: {
  creature: MeadowCreatureDefinition;
  runtimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  onSelect: (creatureId: string) => void;
  reactionSiteId: string | null;
}) {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Group>(null);
  const currentPerchIndexRef = useRef(0);
  const lastRelocationRef = useRef(0);
  const reactionUntilRef = useRef(0);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (reactionSiteId && creature.reactsToDepositId === reactionSiteId) {
      reactionUntilRef.current = performance.now() + 3600;
    }
  }, [creature.reactsToDepositId, reactionSiteId]);

  useEffect(
    () => () => {
      delete runtimeRef.current[creature.id];
    },
    [creature.id, runtimeRef],
  );

  useFrame((state) => {
    if (!groupRef.current || !innerRef.current) return;

    const time = state.clock.elapsedTime;
    let planarX = 0;
    let planarZ = 0;
    let facingX = 0;
    let facingZ = 0;

    if (creature.kind === "walker" && creature.route && creature.route.length > 1) {
      const route = creature.route;
      const pace = 0.12;
      const segmentProgress =
        (time * pace + route.length * 0.13) % route.length;
      const segmentIndex = Math.floor(segmentProgress);
      const nextIndex = (segmentIndex + 1) % route.length;
      const t = THREE.MathUtils.smoothstep(segmentProgress - segmentIndex, 0, 1);
      const from = route[segmentIndex];
      const to = route[nextIndex];
      planarX = THREE.MathUtils.lerp(from[0], to[0], t);
      planarZ = THREE.MathUtils.lerp(from[1], to[1], t);
      facingX = to[0];
      facingZ = to[1];
    } else if (creature.kind === "percher" && creature.perch) {
      const cameraPlanar = getPlanarFromWorldPosition(camera.position);
      if (
        creature.relocations?.length &&
        distanceBetweenPlanarPoints(creature.perch, [cameraPlanar.x, cameraPlanar.z]) <
          creature.triggerDistance - 2.2 &&
        time - lastRelocationRef.current > 4.5
      ) {
        currentPerchIndexRef.current =
          (currentPerchIndexRef.current + 1) % creature.relocations.length;
        lastRelocationRef.current = time;
      }

      const currentPerch =
        creature.relocations?.[currentPerchIndexRef.current] || creature.perch;
      planarX = currentPerch[0];
      planarZ = currentPerch[1];
      facingX = cameraPlanar.x;
      facingZ = cameraPlanar.z;
    } else if (
      creature.kind === "floater" &&
      creature.orbitCenter &&
      creature.orbitRadius
    ) {
      const speed = performance.now() < reactionUntilRef.current ? 1.65 : 0.9;
      planarX =
        creature.orbitCenter[0] +
        Math.cos(time * speed + creature.scale) * creature.orbitRadius;
      planarZ =
        creature.orbitCenter[1] +
        Math.sin(time * speed + creature.scale) * creature.orbitRadius;
      facingX =
        creature.orbitCenter[0] +
        Math.cos(time * speed + creature.scale + 0.3) * creature.orbitRadius;
      facingZ =
        creature.orbitCenter[1] +
        Math.sin(time * speed + creature.scale + 0.3) * creature.orbitRadius;
    }

    const lift =
      creature.kind === "floater"
        ? 3.4 + Math.sin(time * 1.8 + creature.scale) * 0.38
        : creature.kind === "percher"
          ? 4.1 + Math.sin(time * 0.9 + creature.scale) * 0.12
          : 0.42 + Math.sin(time * 1.4 + creature.scale) * 0.08;
    const position = projectPlanarPointToMeadowSurface(planarX, planarZ, lift);
    const normal = projectPlanarPointToMeadowNormal(planarX, planarZ);

    groupRef.current.position.copy(position);
    tempQuaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    groupRef.current.quaternion.slerp(tempQuaternion, 0.22);

    const planarHeading = Math.atan2(facingX - planarX, facingZ - planarZ);
    innerRef.current.rotation.y = planarHeading;
    innerRef.current.position.y =
      creature.kind === "walker" ? 0.1 : creature.kind === "floater" ? 0.06 : 0;

    tempVector.set(position.x, position.y, position.z);
    runtimeRef.current[creature.id] = {
      position: [tempVector.x, tempVector.y, tempVector.z],
      sector: creature.sector,
    };
  });

  return (
    <group ref={groupRef}>
      <group ref={innerRef} scale={creature.scale}>
        <CreatureShape color={creature.color} kind={creature.shape} />
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.24, 14, 14]} />
          <meshStandardMaterial
            color={creature.accent}
            emissive={creature.accent}
            emissiveIntensity={creature.kind === "floater" ? 0.48 : 0.18}
            transparent
            opacity={creature.kind === "floater" ? 0.28 : 0.16}
          />
        </mesh>
      </group>

      <mesh
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(creature.id);
        }}
        userData={{ interaction: { type: "meadow-creature", id: creature.id } }}
      >
        <sphereGeometry args={[1.5, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MeadowCreatureField({
  quality,
  densityMultiplier,
  runtimeRef,
  onSelect,
  reactionSiteId,
}: {
  quality: QualityTier;
  densityMultiplier: number;
  runtimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  onSelect: (creatureId: string) => void;
  reactionSiteId: string | null;
}) {
  const creatures = useMemo(() => {
    const baseCreatures =
      quality === "high"
        ? MEADOW_CREATURES
        : quality === "medium"
          ? MEADOW_CREATURES.filter((_, index) => index !== 5)
          : MEADOW_CREATURES.filter(
              (creature) =>
                creature.kind !== "floater" ||
                creature.id === "nastro-del-bacino",
            );

    if (densityMultiplier >= 0.96) return baseCreatures;

    return baseCreatures.filter((creature, index) => {
      if ((creature.kind as string) === "walker") return true;
      if (densityMultiplier >= 0.84) return index % 3 !== 0;
      if (densityMultiplier >= 0.7) return creature.kind !== "floater";
      return (creature.kind as string) === "walker" || creature.id === "nastro-del-bacino";
    });
  }, [densityMultiplier, quality]);

  return (
    <group>
      {creatures.map((creature) => (
        <MeadowAmbientCreature
          key={creature.id}
          creature={creature}
          runtimeRef={runtimeRef}
          onSelect={onSelect}
          reactionSiteId={reactionSiteId}
        />
      ))}
    </group>
  );
}

function MeadowArchitecture({
  grassTexture,
  shadowTexture,
  quality,
  renderProfile,
  depositCounts,
  onSelectDeposit,
  onSelectCreature,
  creatureRuntimeRef,
  reactionSiteId,
}: {
  grassTexture: THREE.Texture | null;
  shadowTexture: THREE.Texture | null;
  quality: QualityTier;
  renderProfile: ResolvedRenderProfile;
  depositCounts: Record<string, number>;
  onSelectDeposit: (site: DepositSite) => void;
  onSelectCreature: (creatureId: string) => void;
  creatureRuntimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  reactionSiteId: string | null;
}) {
  const groundGeometry = useMemo(
    () =>
      createTerrainSphereGeometry(
        quality === "low" ? 78 : 108,
        quality === "low" ? 52 : 78,
      ),
    [quality],
  );
  const shadowGeometry = useMemo(
    () =>
      createTerrainSphereGeometry(
        quality === "high" ? 108 : quality === "medium" ? 80 : 58,
        quality === "high" ? 78 : quality === "medium" ? 56 : 40,
        0.42,
      ),
    [quality],
  );

  useFrame((state) => {
    if (!shadowTexture) return;

    const elapsed = state.clock.elapsedTime;
    const driftScale =
      quality === "high" ? 1 : quality === "medium" ? 0.72 : 0.44;

    shadowTexture.offset.x = (elapsed * 0.0034 * driftScale) % 1;
    shadowTexture.offset.y = (elapsed * 0.0015 * driftScale) % 1;
    shadowTexture.rotation = Math.sin(elapsed * 0.04) * 0.08;
  });

  return (
    <group>
      <SkyDisc
        position={[72, 38, -112]}
        color="#fff1ca"
        glowColor="#fff5df"
        radius={quality === "high" ? 11.6 : 9}
      />
      <SkyDisc
        position={[-92, 26, -136]}
        color="#d6e6fb"
        glowColor="#edf3ff"
        radius={quality === "high" ? 5.8 : 4.6}
      />
      <SkyDisc
        position={[94, 30, -96]}
        color="#f8efe1"
        glowColor="#fff7ef"
        radius={quality === "high" ? 3.4 : 2.8}
      />

      <mesh position={MEADOW_PLANET_CENTER.toArray()}>
        <primitive object={groundGeometry} attach="geometry" />
        <meshStandardMaterial
          map={grassTexture || undefined}
          color="#97ae79"
          emissive="#5a6f4d"
          emissiveIntensity={0.06}
          roughness={0.98}
        />
      </mesh>
      {shadowTexture && (
        <mesh position={MEADOW_PLANET_CENTER.toArray()}>
          <primitive object={shadowGeometry} attach="geometry" />
          <meshBasicMaterial
            map={shadowTexture}
            transparent
            opacity={0.036 * renderProfile.atmosphereStrength}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh position={MEADOW_PLANET_CENTER.toArray()}>
        <sphereGeometry
          args={[
            MEADOW_PLANET_RADIUS + 1.8,
            quality === "high" ? 72 : quality === "medium" ? 52 : 40,
            quality === "high" ? 58 : quality === "medium" ? 40 : 28,
          ]}
        />
        <meshBasicMaterial
          color="#dce7f2"
          transparent
          opacity={0.045 * renderProfile.transparencyStrength}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh position={MEADOW_PLANET_CENTER.toArray()}>
        <sphereGeometry
          args={[
            MEADOW_PLANET_RADIUS + 4.8,
            quality === "high" ? 72 : quality === "medium" ? 52 : 40,
            quality === "high" ? 58 : quality === "medium" ? 40 : 28,
          ]}
        />
        <meshBasicMaterial
          color="#f7f0e4"
          transparent
          opacity={0.012 * renderProfile.transparencyStrength}
          side={THREE.BackSide}
        />
      </mesh>
      {quality !== "low" && (
        <mesh position={MEADOW_PLANET_CENTER.toArray()}>
          <sphereGeometry args={[MEADOW_PLANET_RADIUS + 8.6, 44, 32]} />
          <meshBasicMaterial
            color="#f2eadf"
            transparent
            opacity={0.008 * renderProfile.transparencyStrength}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <CloudField tier={quality} />
      <PeripheralSilhouetteBand quality={quality} />
      <ReturnCourtTerrace quality={quality} />
      <ThresholdForecourtComposition quality={quality} />

      <MeadowSurfaceSocket anchor={MEADOW_DOORS[0].anchor} rotationY={Math.PI}>
        <ArchPortal
          position={[0, 0, 0]}
          label="GALLERIA"
          glowColor="#f2ddc2"
          stoneColor="#6f6052"
          labelColor="#5d4c3b"
          outlineColor="#f6f3e5"
          veilColor="#f6eee1"
          quality={quality}
          grounded
        />
      </MeadowSurfaceSocket>

      <MeadowLandmarkProps quality={quality} />
      <MeadowLanternGuides quality={quality} />
      <HorizonMonoliths quality={quality} />
      <OuterScatterField quality={quality} />
      <TreeCluster
        tier={quality}
        densityMultiplier={renderProfile.grassDensity}
      />
      <ReedStandField quality={quality} />
      <GrassField
        tier={quality}
        densityMultiplier={renderProfile.grassDensity}
      />
      <WildflowerField
        tier={quality}
        densityMultiplier={renderProfile.grassDensity}
      />

      {MEADOW_DEPOSIT_SITES.map((site) => (
        <DepositMarker
          key={site.id}
          site={site}
          count={depositCounts[site.id] || 0}
          onSelect={onSelectDeposit}
        />
      ))}

      <MeadowCreatureField
        quality={quality}
        densityMultiplier={renderProfile.creatureDensity}
        runtimeRef={creatureRuntimeRef}
        onSelect={onSelectCreature}
        reactionSiteId={reactionSiteId}
      />
    </group>
  );
}

export function MeadowScene({
  renderProfile,
  depositCounts,
  onSelectDeposit,
  onSelectCreature,
  creatureRuntimeRef,
  reactionSiteId,
}: {
  renderProfile: ResolvedRenderProfile;
  depositCounts: Record<string, number>;
  onSelectDeposit: (site: DepositSite) => void;
  onSelectCreature: (creatureId: string) => void;
  creatureRuntimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
      reactionSiteId: string | null;
}) {
  const quality = renderProfile.tier;
  const grassTexture = useGrassTexture(quality);
  const shadowTexture = useMeadowShadowTexture(quality);

  return (
    <>
      <color attach="background" args={["#eef4f8"]} />
      <fog
        attach="fog"
        args={["#d9e1dd", 112, 320 * renderProfile.landmarkDrawDistance]}
      />
      <ambientLight intensity={0.52} color="#fff3e4" />
      <hemisphereLight intensity={0.96} color="#f5fbff" groundColor="#70825f" />
      <directionalLight
        position={[40, 68, 18]}
        intensity={1.18}
        color="#ffe1b8"
      />
      <directionalLight
        position={[-38, 34, -14]}
        intensity={0.42}
        color="#dce8ff"
      />
      <directionalLight
        position={[0, 24, 96]}
        intensity={0.2}
        color="#fff7e2"
      />

      <MeadowArchitecture
        grassTexture={grassTexture}
        shadowTexture={shadowTexture}
        quality={quality}
        renderProfile={renderProfile}
        depositCounts={depositCounts}
        onSelectDeposit={onSelectDeposit}
        onSelectCreature={onSelectCreature}
        creatureRuntimeRef={creatureRuntimeRef}
        reactionSiteId={reactionSiteId}
      />

      {quality !== "low" && (
        <Sparkles
          count={Math.round(
            (quality === "high" ? 140 : 58) * renderProfile.sparkleDensity,
          )}
          scale={160}
          size={quality === "high" ? 2 : 1}
          speed={quality === "high" ? 0.2 : 0.1}
          color={quality === "high" ? "#fff4cb" : "#eef2bb"}
          opacity={0.18 * renderProfile.atmosphereStrength}
        />
      )}
    </>
  );
}
