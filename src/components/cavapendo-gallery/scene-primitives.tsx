import { useMemo, type ReactNode } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { type QualityTier } from "@/components/cavapendo-gallery/runtime";
import { type StoryCreatureData } from "@/components/cavapendo-gallery/types";
import {
  projectPlanarPointToMeadowNormal,
  resolveMeadowAnchorTuple,
  type MeadowSurfaceAnchor,
} from "@/lib/meadowWorld";

const UP_VECTOR = new THREE.Vector3(0, 1, 0);

export function CreatureShape({
  color,
  kind,
}: {
  color: string;
  kind: StoryCreatureData["kind"];
}) {
  const matProps = {
    color,
    roughness: 0.72,
    emissive: color,
    emissiveIntensity: 0.12,
  } as const;
  const darkMat = {
    color: "#1a1511",
    roughness: 0.84,
  } as const;

  if (kind === "owl") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.9, 1.2, 0.8]}>
          <sphereGeometry args={[0.45, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, -0.05, 0.3]} scale={[0.6, 0.8, 0.3]}>
          <sphereGeometry args={[0.35, 14, 14]} />
          <meshStandardMaterial color="#a09070" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0.05]}>
          <sphereGeometry args={[0.35, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.58, 0.28]} scale={[1, 1.1, 0.3]}>
          <sphereGeometry args={[0.28, 14, 14]} />
          <meshStandardMaterial color="#9a8565" roughness={0.9} />
        </mesh>
        <mesh position={[-0.12, 0.62, 0.32]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial
            color="#f6e6a7"
            emissive="#f6e6a7"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0.12, 0.62, 0.32]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial
            color="#f6e6a7"
            emissive="#f6e6a7"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[-0.12, 0.62, 0.42]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.12, 0.62, 0.42]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[-0.4, 0.05, -0.1]} rotation={[0, 0, 0.4]} scale={[0.2, 0.7, 0.5]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.4, 0.05, -0.1]} rotation={[0, 0, -0.4]} scale={[0.2, 0.7, 0.5]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
        <mesh position={[0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
      </group>
    );
  }

  if (kind === "cat") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.7, 1, 0.95]}>
          <sphereGeometry args={[0.4, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, -0.1, 0.2]} scale={[0.5, 0.6, 0.4]}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial color="#5a5a6a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0.18]}>
          <sphereGeometry args={[0.3, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.52, 0.42]} scale={[0.6, 0.4, 0.5]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#5a5a6a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.55, 0.47]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#d4707a" />
        </mesh>
        <mesh position={[-0.2, 0.85, 0.12]} rotation={[0, 0, 0.45]} scale={[0.35, 0.95, 0.18]}>
          <coneGeometry args={[0.18, 0.4, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.2, 0.85, 0.12]} rotation={[0, 0, -0.45]} scale={[0.35, 0.95, 0.18]}>
          <coneGeometry args={[0.18, 0.4, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.1, 0.64, 0.4]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial
            color="#c4e060"
            emissive="#c4e060"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[0.1, 0.64, 0.4]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial
            color="#c4e060"
            emissive="#c4e060"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh position={[-0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[-0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.3, 0.55, -0.75]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  if (kind === "snail") {
    return (
      <group>
        <mesh position={[0, 0.25, -0.1]}>
          <sphereGeometry args={[0.35, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.08, 0.35, -0.15]} scale={[0.8, 0.8, 0.8]}>
          <torusGeometry args={[0.15, 0.06, 8, 18, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c0a878" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.3, -0.12]} scale={[0.5, 0.5, 0.5]}>
          <torusGeometry args={[0.1, 0.04, 8, 14, Math.PI * 1.8]} />
          <meshStandardMaterial color="#d0b888" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.08, 0.15]} scale={[0.7, 0.4, 1.5]}>
          <sphereGeometry args={[0.22, 14, 14]} />
          <meshStandardMaterial color="#a39384" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.0, 0.4]} scale={[0.5, 0.35, 0.6]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#a09080" roughness={0.8} />
        </mesh>
        <mesh position={[-0.08, 0.28, 0.53]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.08, 0.28, 0.53]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
      </group>
    );
  }

  if (kind === "lizard") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.55, 0.35, 1.3]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.06, 0.4]} scale={[0.8, 0.55, 0.9]}>
          <sphereGeometry args={[0.18, 14, 14]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.04, 0.55]} scale={[0.5, 0.35, 0.6]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.1, 0.12, 0.48]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#e8c020"
            emissive="#e8c020"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0.1, 0.12, 0.48]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#e8c020"
            emissive="#e8c020"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[-0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0, -0.03, -0.52]} rotation={[0.2, 0, 0]} scale={[0.1, 0.1, 1.7]}>
          <cylinderGeometry args={[0.08, 0.02, 0.6, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {[
          [-0.2, -0.08, 0.18, -0.6],
          [0.2, -0.08, 0.18, 0.6],
          [-0.24, -0.1, -0.02, -0.4],
          [0.24, -0.1, -0.02, 0.4],
        ].map(([x, y, z, roll], index) => (
          <mesh
            key={`lizard-leg-${index}`}
            position={[x, y, z]}
            rotation={[0, 0, roll]}
            scale={[0.1, 0.1, 0.8]}
          >
            <cylinderGeometry args={[0.04, 0.02, 0.26, 8]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))}
      </group>
    );
  }

  if (kind === "frog") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[1.1, 0.7, 1]}>
          <sphereGeometry args={[0.35, 18, 18]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, -0.08, 0.15]} scale={[0.8, 0.5, 0.7]}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial color="#7aab6a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.12, 0.2]} scale={[0.9, 0.6, 0.8]}>
          <sphereGeometry args={[0.25, 14, 14]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.18, 0.3, 0.18]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
        <mesh position={[0.18, 0.3, 0.18]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
        <mesh position={[-0.18, 0.33, 0.28]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.18, 0.33, 0.28]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[-0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {[
          [-0.08, 0.18, -0.18],
          [0.08, 0.18, -0.16],
          [-0.05, 0.08, -0.28],
          [0.05, 0.08, -0.3],
        ].map(([x, y, z], index) => (
          <mesh key={`frog-bump-${index}`} position={[x, y, z]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#4a7a4a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  if (kind === "seahorse") {
    return (
      <group>
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.12, 1.08, 0.25]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#e8e0d0" />
        </mesh>
        <mesh position={[0.14, 1.08, 0.3]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {[
          [0, 0.62],
          [0.04, 0.34],
          [0.06, 0.06],
          [0.04, -0.2],
          [0, -0.42],
        ].map(([x, y], index) => (
          <mesh
            key={`seahorse-body-${index}`}
            position={[x, y, 0.03 * Math.sin(index)]}
            scale={[0.7 - index * 0.05, 0.8, 0.6 - index * 0.04]}
          >
            <sphereGeometry args={[0.3, 14, 14]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))}
        <mesh position={[-0.18, 0.72, 0]} rotation={[0, 0, 0.8]} scale={[0.4, 0.14, 0.08]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial {...matProps} transparent opacity={0.55} />
        </mesh>
        <mesh position={[0.15, 0.45, 0.2]} rotation={[0.5, 0.3, -0.3]} scale={[0.5, 0.3, 0.1]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial {...matProps} transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.15, -0.7, 0]} rotation={[0.3, 0, -0.8]}>
          <torusGeometry args={[0.25, 0.07, 8, 18, Math.PI * 1.3]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[0.4, 18, 18]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}

export function ArchPortal({
  position,
  rotationY = 0,
  label,
  glowColor,
  stoneColor,
  labelColor,
  outlineColor,
  veilColor,
  plaqueColor = "#efe3d2",
  quality,
  grounded = false,
  veilOpacity,
  thresholdColor,
  thresholdOpacity,
  innerFrameColor,
  innerFrameGlowColor,
  innerFrameGlowIntensity,
}: {
  position: [number, number, number];
  rotationY?: number;
  label: string;
  glowColor: string;
  stoneColor: string;
  labelColor: string;
  outlineColor: string;
  veilColor: string;
  plaqueColor?: string;
  quality: QualityTier;
  grounded?: boolean;
  veilOpacity?: number;
  thresholdColor?: string;
  thresholdOpacity?: number;
  innerFrameColor?: string;
  innerFrameGlowColor?: string;
  innerFrameGlowIntensity?: number;
}) {
  const resolvedVeilOpacity =
    veilOpacity ?? (quality === "low" ? 0.06 : 0.1);
  const resolvedThresholdOpacity =
    thresholdOpacity ?? (quality === "low" ? 0.4 : quality === "medium" ? 0.5 : 0.6);
  const resolvedInnerFrameGlowIntensity = innerFrameGlowIntensity ?? 0.55;
  const resolvedTrimColor = innerFrameColor || "#d2c6b5";
  const resolvedTrimGlowColor = innerFrameGlowColor || innerFrameColor || "#d2c6b5";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {grounded && (
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[3.4, 3.9, 0.3, 24]} />
          <meshStandardMaterial color="#8a7765" roughness={0.96} />
        </mesh>
      )}
      <mesh position={[-2.04, 3.16, 0]}>
        <boxGeometry args={[0.82, 6.68, 0.9]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[2.04, 3.16, 0]}>
        <boxGeometry args={[0.82, 6.68, 0.9]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 6.28, 0]}>
        <boxGeometry args={[5.3, 0.76, 0.9]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[-1.58, 3.1, 0.14]}>
        <boxGeometry args={[0.2, 5.14, 0.18]} />
        <meshStandardMaterial
          color={resolvedTrimColor}
          emissive={resolvedTrimGlowColor}
          emissiveIntensity={innerFrameColor ? resolvedInnerFrameGlowIntensity : 0}
          roughness={innerFrameColor ? 0.22 : 0.86}
        />
      </mesh>
      <mesh position={[1.58, 3.1, 0.14]}>
        <boxGeometry args={[0.2, 5.14, 0.18]} />
        <meshStandardMaterial
          color={resolvedTrimColor}
          emissive={resolvedTrimGlowColor}
          emissiveIntensity={innerFrameColor ? resolvedInnerFrameGlowIntensity : 0}
          roughness={innerFrameColor ? 0.22 : 0.86}
        />
      </mesh>
      <mesh position={[0, 5.6, 0.14]}>
        <boxGeometry args={[3.3, 0.18, 0.18]} />
        <meshStandardMaterial
          color={resolvedTrimColor}
          emissive={resolvedTrimGlowColor}
          emissiveIntensity={innerFrameColor ? resolvedInnerFrameGlowIntensity : 0}
          roughness={innerFrameColor ? 0.22 : 0.86}
        />
      </mesh>
      <mesh position={[0, 3.38, 0.08]}>
        <planeGeometry args={[3.66, 5.12]} />
        <meshBasicMaterial
          color={veilColor}
          transparent
          opacity={resolvedVeilOpacity}
        />
      </mesh>
      {thresholdColor && (
        <>
          <mesh position={[0, 3.38, 0]}>
            <planeGeometry args={[2.82, 4.38]} />
            <meshBasicMaterial
              color={thresholdColor}
              transparent
              opacity={resolvedThresholdOpacity}
            />
          </mesh>
          <mesh position={[0, 3.38, -0.06]}>
            <planeGeometry args={[3.18, 4.82]} />
            <meshBasicMaterial
              color={thresholdColor}
              transparent
              opacity={resolvedThresholdOpacity * 0.12}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      <mesh position={[0, 3.38, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.66, 0.06, 14, 64]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={innerFrameColor ? (quality === "high" ? 0.6 : 0.42) : quality === "high" ? 0.34 : 0.22}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 7.18, 0.18]}>
        <boxGeometry args={[3.18, 0.78, 0.34]} />
        <meshStandardMaterial color="#c9b7a1" roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.2, 0.28]}>
        <boxGeometry args={[2.9, 0.52, 0.18]} />
        <meshStandardMaterial color={plaqueColor} roughness={0.94} />
      </mesh>
      {quality !== "low" && (
        <>
          <mesh position={[-1.64, 6.72, 0.26]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[1.64, 6.72, 0.26]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[0, 0.02, 0.26]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.62, 2.16, 32]} />
            <meshBasicMaterial color={glowColor} transparent opacity={0.08} />
          </mesh>
        </>
      )}
      <Text
        position={[0, 7.22, 0.46]}
        fontSize={0.46}
        color={labelColor}
        outlineWidth={0.022}
        outlineColor={outlineColor}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export function MeadowSurfaceSocket({
  anchor,
  rotationY = 0,
  alignment = 1,
  disableCulling = false,
  children,
}: {
  anchor: MeadowSurfaceAnchor;
  rotationY?: number;
  alignment?: number;
  disableCulling?: boolean;
  children: ReactNode;
}) {
  const position = useMemo(
    () => resolveMeadowAnchorTuple(anchor),
    [anchor],
  );
  const normal = useMemo(
    () => projectPlanarPointToMeadowNormal(anchor.planar[0], anchor.planar[1]),
    [anchor],
  );
  const quaternion = useMemo(
    () => {
      const surfaceQuaternion = new THREE.Quaternion().setFromUnitVectors(
        UP_VECTOR,
        normal,
      );
      if (alignment >= 0.999) return surfaceQuaternion;
      return new THREE.Quaternion().slerpQuaternions(
        new THREE.Quaternion(),
        surfaceQuaternion,
        THREE.MathUtils.clamp(alignment, 0, 1),
      );
    },
    [alignment, normal],
  );

  return (
    <group
      position={position}
      quaternion={quaternion}
      frustumCulled={!disableCulling}
    >
      <group rotation={[0, rotationY, 0]} frustumCulled={!disableCulling}>
        {children}
      </group>
    </group>
  );
}

export function SkyDisc({
  position,
  color,
  glowColor,
  radius = 4.4,
}: {
  position: [number, number, number];
  color: string;
  glowColor: string;
  radius?: number;
}) {
  return (
    <group position={position}>
      <mesh>
        <circleGeometry args={[radius, 64]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <ringGeometry args={[radius * 1.1, radius * 1.42, 64]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}
