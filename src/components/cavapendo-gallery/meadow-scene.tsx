import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Sparkles } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGrassTexture } from "@/components/cavapendo-gallery/assets";
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
  MEADOW_CLOUD_LAYERS,
  MEADOW_CREATURES,
  MEADOW_DEPOSIT_SITES,
  MEADOW_DOORS,
  MEADOW_GRASS_PATCHES,
  MEADOW_LANDMARKS,
  MEADOW_MONOLITHS,
  MEADOW_PLANET_CENTER,
  MEADOW_PLANET_RADIUS,
  MEADOW_TERRAIN_BANDS,
  MEADOW_TREE_LAYOUT,
  distanceBetweenPlanarPoints,
  getPlanarFromWorldPosition,
  projectPlanarPointToMeadowNormal,
  projectPlanarPointToMeadowSurface,
  type CloudLayer,
  type MeadowCreatureDefinition,
  type MeadowSector,
  type TerrainScatterBand,
} from "@/lib/meadowWorld";

function TerrainScatter({ band }: { band: TerrainScatterBand }) {
  return (
    <MeadowSurfaceSocket
      anchor={{
        planar: band.center,
        contactMode: "grounded",
        offset: 0.04,
      }}
      rotationY={(band.center[0] + band.center[1]) * 0.0025}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[band.spread[0] * 0.78, 1, band.spread[1] * 0.74]}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial
          color="#fff4dc"
          transparent
          opacity={band.opacity * 0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[band.spread[0], 1, band.spread[1]]}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial
          color={band.tone}
          transparent
          opacity={band.opacity}
          depthWrite={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        scale={[band.spread[0] * 0.58, 1, band.spread[1] * 0.54]}
      >
        <circleGeometry args={[1, 28]} />
        <meshBasicMaterial
          color={band.accentTone}
          transparent
          opacity={band.opacity * 0.18}
          depthWrite={false}
        />
      </mesh>

      {Array.from({ length: band.clusterCount }).map((_, index) => {
        const radius = seededRandom(index + band.center[0]) * 0.82;
        const angle = seededRandom(index + band.center[1]) * Math.PI * 2;
        const x = Math.cos(angle) * band.spread[0] * radius;
        const z = Math.sin(angle) * band.spread[1] * radius;
        const scale = 0.24 + seededRandom(index + band.clusterCount) * 0.48;
        return (
          <group key={`${band.id}-cluster-${index}`} position={[x, 0.04, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <circleGeometry args={[0.65 * scale, 16]} />
              <meshBasicMaterial
                color={band.accentTone}
                transparent
                opacity={band.opacity * 0.72}
                depthWrite={false}
              />
            </mesh>
            <mesh position={[0, 0.06 + scale * 0.04, 0]} scale={scale}>
              <dodecahedronGeometry args={[0.16, 0]} />
              <meshStandardMaterial color="#8a7a66" roughness={0.96} />
            </mesh>
            <mesh
              position={[-0.14 * scale, 0.12 + scale * 0.1, 0.08 * scale]}
              scale={scale * 0.56}
            >
              <dodecahedronGeometry args={[0.14, 0]} />
              <meshStandardMaterial color="#978672" roughness={0.96} />
            </mesh>
            <mesh position={[0.12 * scale, 0.22 * scale, -0.08 * scale]}>
              <sphereGeometry args={[0.05 + scale * 0.02, 8, 8]} />
              <meshStandardMaterial
                color={band.accentTone}
                emissive={band.accentTone}
                emissiveIntensity={0.08}
                roughness={0.82}
              />
            </mesh>
          </group>
        );
      })}
    </MeadowSurfaceSocket>
  );
}

function GrassField({
  tier,
  densityMultiplier,
}: {
  tier: QualityTier;
  densityMultiplier: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const blades = useMemo(
    () =>
      MEADOW_GRASS_PATCHES.flatMap((patch, patchIndex) => {
        const baseCount =
          tier === "low"
            ? Math.round(patch.density * 24)
            : tier === "medium"
              ? Math.round(patch.density * 52)
              : Math.round(patch.density * 98);
        const count = Math.max(18, Math.round(baseCount * densityMultiplier));

        return Array.from({ length: count }, (_, bladeIndex) => {
          const seedBase = patchIndex * 109 + bladeIndex * 13;
          const x =
            patch.center[0] +
            (seededRandom(seedBase + 50) * 2 - 1) * patch.spread[0];
          const z =
            patch.center[1] +
            (seededRandom(seedBase + 80) * 2 - 1) * patch.spread[1];

          if (
            MEADOW_DEPOSIT_SITES.some(
              (site) => distanceBetweenPlanarPoints(site.planar, [x, z]) < 7.4,
            )
          ) {
            return null;
          }

          return {
            x,
            z,
            scale: 0.7 + seededRandom(seedBase + 110) * 1.9,
            yaw: seededRandom(seedBase + 140) * Math.PI,
            lean: (seededRandom(seedBase + 170) - 0.5) * 0.2,
          };
        }).filter(Boolean) as Array<{
          x: number;
          z: number;
          scale: number;
          yaw: number;
          lean: number;
        }>;
      }),
    [densityMultiplier, tier],
  );

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const normal = new THREE.Vector3();
    blades.forEach((blade, index) => {
      const position = projectPlanarPointToMeadowSurface(blade.x, blade.z, 0.02);
      normal.copy(projectPlanarPointToMeadowNormal(blade.x, blade.z));
      dummy.position.copy(position);
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      dummy.rotateY(blade.yaw);
      dummy.rotateZ(blade.lean);
      dummy.scale.set(0.12 * blade.scale, 1 * blade.scale, 0.12 * blade.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(index, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [blades]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, blades.length]}>
      <planeGeometry args={[1, 1.35]} />
      <meshStandardMaterial
        color="#74a24f"
        roughness={0.98}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
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
        <mesh position={[0, tree.height * 0.48, 0]} rotation={[0, 0, tree.lean]}>
          <cylinderGeometry args={[0.28, 0.48, tree.height, 10]} />
          <meshStandardMaterial color="#6b4d32" roughness={0.92} />
        </mesh>

        {[-0.18, 0.18].map((side, rootIndex) => (
          <mesh
            key={`${tree.anchor.planar.join("-")}-root-${rootIndex}`}
            position={[side, 0.18, 0.12 * side]}
            rotation={[0, side * 0.4, side * 0.22]}
          >
            <cylinderGeometry args={[0.14, 0.08, 0.42, 6]} />
            <meshStandardMaterial color="#735236" roughness={0.94} />
          </mesh>
        ))}

        {canopyBlobs.map((blob, blobIndex) => (
          <mesh
            key={`${tree.anchor.planar.join("-")}-blob-${blobIndex}`}
            position={[blob.x, blob.y, blob.z]}
            scale={[1.1, 0.82, 1]}
          >
            <sphereGeometry
              args={[blob.scale, quality === "high" ? 18 : 12, quality === "high" ? 18 : 12]}
            />
            <meshStandardMaterial
              color={blobIndex % 2 === 0 ? tree.tone : tree.secondaryTone}
              roughness={0.9}
            />
          </mesh>
        ))}

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
              opacity={cloud.opacity}
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
    if (tier === "high") return MEADOW_CLOUD_LAYERS;
    if (tier === "medium") return MEADOW_CLOUD_LAYERS.filter((_, index) => index % 3 !== 2);
    return MEADOW_CLOUD_LAYERS.filter((_, index) => index % 3 === 0);
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
            ? Math.round(patch.density * 3)
            : tier === "medium"
              ? Math.round(patch.density * 6)
              : Math.round(patch.density * 12);
        const count = Math.max(3, Math.round(baseCount * densityMultiplier));

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
            offset: 0.02,
          }}
          rotationY={seededRandom(index + 670) * Math.PI}
        >
          <mesh position={[0, 0.02, 0]}>
            <sphereGeometry
              args={[0.06 * clump.scale, tier === "high" ? 8 : 6, tier === "high" ? 8 : 6]}
            />
            <meshStandardMaterial color="#6f8e48" roughness={0.94} />
          </mesh>
          {[-0.08, 0, 0.08].map((offset, offsetIndex) => (
            <mesh
              key={`${clump.id}-petal-${offsetIndex}`}
              position={[offset * clump.scale, 0.15 * clump.scale, 0.05 * (offsetIndex - 1)]}
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
    if (quality === "medium") return MEADOW_MONOLITHS.filter((_, index) => index !== 4);
    return MEADOW_MONOLITHS.filter((_, index) => index < 4);
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
              <boxGeometry args={[monolith.width, monolith.height, monolith.width * 1.14]} />
              <meshStandardMaterial color={monolith.color} roughness={0.9} />
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
          (quality !== "low" && landmark.kind === "obelisk"),
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
        >
          {landmark.kind === "house" && (
            <group scale={landmark.scale}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <circleGeometry args={[2.6, 28]} />
                <meshBasicMaterial
                  color="#cbb28d"
                  transparent
                  opacity={0.14}
                  depthWrite={false}
                />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[1.6, 2, 0.46, 18]} />
                <meshStandardMaterial color="#9a856f" roughness={0.94} />
              </mesh>
              <mesh position={[0, 1.2, 0]}>
                <cylinderGeometry args={[1.42, 1.7, 1.9, 18]} />
                <meshStandardMaterial color="#eee5d8" roughness={0.92} />
              </mesh>
              <mesh position={[0, 2.55, 0]}>
                <coneGeometry args={[1.94, 1.8, 18]} />
                <meshStandardMaterial color="#846651" roughness={0.9} />
              </mesh>
              <mesh position={[0, 1.26, 1.38]}>
                <planeGeometry args={[0.56, 0.8]} />
                <meshBasicMaterial color="#ffeab6" transparent opacity={0.82} />
              </mesh>
            </group>
          )}
          {landmark.kind === "shrine" && (
            <group scale={landmark.scale}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
                <ringGeometry args={[2.6, 4.2, 42]} />
                <meshBasicMaterial
                  color={landmark.accent}
                  transparent
                  opacity={0.18}
                />
              </mesh>
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[1.8, 2.2, 0.56, 22]} />
                <meshStandardMaterial color="#8d7058" roughness={0.92} />
              </mesh>
              <mesh position={[0, 0.76, 0]}>
                <cylinderGeometry args={[1.1, 1.4, 0.48, 18]} />
                <meshStandardMaterial color="#b79376" roughness={0.88} />
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
    <MeadowSurfaceSocket anchor={site.anchor}>
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
  quality,
  renderProfile,
  depositCounts,
  onSelectDeposit,
  onSelectCreature,
  creatureRuntimeRef,
  reactionSiteId,
}: {
  grassTexture: THREE.Texture | null;
  quality: QualityTier;
  renderProfile: ResolvedRenderProfile;
  depositCounts: Record<string, number>;
  onSelectDeposit: (site: DepositSite) => void;
  onSelectCreature: (creatureId: string) => void;
  creatureRuntimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  reactionSiteId: string | null;
}) {
  return (
    <group>
      <SkyDisc position={[0, 46, -24]} color="#fff1cc" glowColor="#fff7ec" radius={8.8} />
      <SkyDisc position={[32, 22, -50]} color="#d9ebff" glowColor="#eef5ff" radius={4.8} />
      <SkyDisc position={[-56, 18, -34]} color="#f5efe4" glowColor="#fff8ee" radius={3.2} />
      <SkyDisc
        position={[64, 28, -92]}
        color="#ffe7c0"
        glowColor="#fff1d7"
        radius={quality === "high" ? 12.6 : 9.4}
      />
      <SkyDisc
        position={[-74, 26, -88]}
        color="#dce8ff"
        glowColor="#eef4ff"
        radius={quality === "high" ? 7.8 : 5.8}
      />

      <mesh position={MEADOW_PLANET_CENTER.toArray()}>
        <sphereGeometry
          args={[
            MEADOW_PLANET_RADIUS,
            quality === "low" ? 78 : 108,
            quality === "low" ? 52 : 78,
          ]}
        />
        <meshStandardMaterial
          map={grassTexture || undefined}
          color="#6f9652"
          roughness={1}
        />
      </mesh>
      <mesh position={MEADOW_PLANET_CENTER.toArray()}>
        <sphereGeometry
          args={[
            MEADOW_PLANET_RADIUS + 1.8,
            quality === "high" ? 72 : quality === "medium" ? 52 : 40,
            quality === "high" ? 58 : quality === "medium" ? 40 : 28,
          ]}
        />
        <meshBasicMaterial
          color="#d6ecff"
          transparent
          opacity={0.1 * renderProfile.transparencyStrength}
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
          color="#fff3e0"
          transparent
          opacity={0.03 * renderProfile.transparencyStrength}
          side={THREE.BackSide}
        />
      </mesh>
      {quality !== "low" && (
        <mesh position={MEADOW_PLANET_CENTER.toArray()}>
          <sphereGeometry args={[MEADOW_PLANET_RADIUS + 8.6, 44, 32]} />
          <meshBasicMaterial
            color="#f6ead2"
            transparent
            opacity={0.028 * renderProfile.transparencyStrength}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      <CloudField tier={quality} />

      {MEADOW_TERRAIN_BANDS.map((band) => (
        <TerrainScatter key={band.id} band={band} />
      ))}

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
      <TreeCluster
        tier={quality}
        densityMultiplier={renderProfile.grassDensity}
      />
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

  return (
    <>
      <color attach="background" args={["#c8dbf5"]} />
      <fog
        attach="fog"
        args={["#9db5b3", 78, 262 * renderProfile.landmarkDrawDistance]}
      />
      <ambientLight intensity={0.95} color="#eff6ff" />
      <hemisphereLight intensity={1.08} color="#f7fbff" groundColor="#43593b" />
      <directionalLight
        position={[34, 56, 28]}
        intensity={1.52}
        color="#fff2d1"
      />
      <pointLight
        position={[52, 34, -48]}
        intensity={0.9}
        color="#ffe9bc"
        distance={132}
      />
      {quality !== "low" && (
        <pointLight
          position={[-30, 22, 24]}
          intensity={0.3}
          color="#def6e0"
          distance={88}
        />
      )}

      <MeadowArchitecture
        grassTexture={grassTexture}
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
