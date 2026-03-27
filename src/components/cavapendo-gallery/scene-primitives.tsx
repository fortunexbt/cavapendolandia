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
  if (kind === "owl") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.8, 1.1, 0.75]}>
          <sphereGeometry args={[0.45, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
        <mesh position={[0, 0.5, 0.1]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.75} />
        </mesh>
        <mesh position={[-0.12, 0.58, 0.24]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#f6e6a7"
            emissive="#f6e6a7"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh position={[0.12, 0.58, 0.24]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial
            color="#f6e6a7"
            emissive="#f6e6a7"
            emissiveIntensity={0.35}
          />
        </mesh>
      </group>
    );
  }

  if (kind === "cat") {
    return (
      <group>
        <mesh scale={[0.8, 1.05, 0.9]}>
          <sphereGeometry args={[0.38, 18, 18]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.52, 0.16]}>
          <sphereGeometry args={[0.27, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        <mesh position={[-0.14, 0.77, 0.08]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.08, 0.22, 4]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
        <mesh position={[0.14, 0.77, 0.08]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.08, 0.22, 4]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      </group>
    );
  }

  if (kind === "snail") {
    return (
      <group>
        <mesh position={[0, 0.05, 0.05]} scale={[0.9, 0.5, 1.2]}>
          <sphereGeometry args={[0.34, 18, 18]} />
          <meshStandardMaterial color="#a39384" roughness={0.82} />
        </mesh>
        <mesh position={[0.08, 0.22, -0.1]}>
          <torusGeometry args={[0.18, 0.06, 10, 22]} />
          <meshStandardMaterial color={color} roughness={0.66} />
        </mesh>
      </group>
    );
  }

  if (kind === "lizard") {
    return (
      <group>
        <mesh scale={[0.55, 0.3, 1.2]}>
          <sphereGeometry args={[0.36, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
        <mesh position={[0, 0.03, 0.44]} scale={[0.7, 0.45, 0.8]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
        <mesh
          position={[0, -0.03, -0.52]}
          rotation={[0.2, 0, 0]}
          scale={[0.1, 0.1, 1.5]}
        >
          <cylinderGeometry args={[0.08, 0.02, 0.56, 8]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
      </group>
    );
  }

  if (kind === "frog") {
    return (
      <group>
        <mesh scale={[1.05, 0.55, 0.95]}>
          <sphereGeometry args={[0.34, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.78} />
        </mesh>
        <mesh position={[-0.16, 0.2, 0.18]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#edf0d3" />
        </mesh>
        <mesh position={[0.16, 0.2, 0.18]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#edf0d3" />
        </mesh>
      </group>
    );
  }

  if (kind === "seahorse") {
    return (
      <group>
        <mesh position={[0, 0.36, 0]}>
          <sphereGeometry args={[0.24, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.04, 0]} scale={[0.7, 1.35, 0.6]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color={color} roughness={0.72} />
        </mesh>
        <mesh position={[0.14, -0.48, 0]} rotation={[0, 0, -0.8]}>
          <torusGeometry args={[0.2, 0.05, 10, 22, Math.PI * 1.6]} />
          <meshStandardMaterial color={color} roughness={0.72} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[0.4, 18, 18]} />
      <meshStandardMaterial color={color} roughness={0.72} />
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
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {grounded && (
        <>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[3.6, 4.2, 0.42, 22]} />
            <meshStandardMaterial color="#8a7765" roughness={0.96} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh
              key={`arch-stone-${side}`}
              position={[side * 1.86, -0.05, 0.12]}
              rotation={[0, side * 0.18, 0]}
            >
              <dodecahedronGeometry args={[0.42, 0]} />
              <meshStandardMaterial color="#7a6857" roughness={0.96} />
            </mesh>
          ))}
        </>
      )}
      <mesh position={[-2.12, 3.2, 0]}>
        <boxGeometry args={[0.88, 6.95, 1.04]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[2.12, 3.2, 0]}>
        <boxGeometry args={[0.88, 6.95, 1.04]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 6.48, 0]}>
        <boxGeometry args={[5.5, 0.84, 1.04]} />
        <meshStandardMaterial color={stoneColor} roughness={0.82} />
      </mesh>
      <mesh position={[-1.64, 3.18, 0.18]}>
        <boxGeometry args={[0.22, 5.3, 0.2]} />
        <meshStandardMaterial color="#d2c6b5" roughness={0.86} />
      </mesh>
      <mesh position={[1.64, 3.18, 0.18]}>
        <boxGeometry args={[0.22, 5.3, 0.2]} />
        <meshStandardMaterial color="#d2c6b5" roughness={0.86} />
      </mesh>
      <mesh position={[0, 5.82, 0.18]}>
        <boxGeometry args={[3.48, 0.22, 0.2]} />
        <meshStandardMaterial color="#d2c6b5" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.36, 0.08]}>
        <boxGeometry args={[4.8, 0.3, 1.1]} />
        <meshStandardMaterial color={stoneColor} roughness={0.84} />
      </mesh>
      {quality !== "low" && (
        <mesh position={[0, 3.2, -0.28]}>
          <planeGeometry args={[4.35, 6.1]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.12} />
        </mesh>
      )}
      <mesh position={[0, 3.48, -0.08]}>
        <planeGeometry args={[3.84, 5.34]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={quality === "low" ? 0.08 : 0.15}
        />
      </mesh>
      <mesh position={[0, 3.48, 0.16]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.74, 0.07, 14, 72]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={quality === "high" ? 0.4 : 0.24}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 7.42, 0.28]}>
        <boxGeometry args={[3.38, 0.94, 0.46]} />
        <meshStandardMaterial color="#cab9a3" roughness={0.9} />
      </mesh>
      <mesh position={[0, 7.44, 0.34]}>
        <boxGeometry args={[3.06, 0.64, 0.2]} />
        <meshStandardMaterial color={plaqueColor} roughness={0.94} />
      </mesh>
      {quality !== "low" && (
        <>
          <mesh position={[-1.72, 6.96, 0.35]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[1.72, 6.96, 0.35]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshBasicMaterial color={glowColor} />
          </mesh>
          <mesh position={[0, 4.08, -0.22]}>
            <planeGeometry args={[2.26, 4.2]} />
            <meshBasicMaterial color={veilColor} transparent opacity={0.12} />
          </mesh>
        </>
      )}
      <Text
        position={[0, 7.46, 0.54]}
        fontSize={0.52}
        color={labelColor}
        outlineWidth={0.024}
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
  children,
}: {
  anchor: MeadowSurfaceAnchor;
  rotationY?: number;
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
    () => new THREE.Quaternion().setFromUnitVectors(UP_VECTOR, normal),
    [normal],
  );

  return (
    <group position={position} quaternion={quaternion}>
      <group rotation={[0, rotationY, 0]}>{children}</group>
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
        <meshBasicMaterial color={glowColor} transparent opacity={0.22} />
      </mesh>
    </group>
  );
}
