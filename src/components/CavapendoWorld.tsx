import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial, Sparkles, Stars } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";

interface CavapendoWorldProps {
  className?: string;
}

type DistortMaterialHandle = THREE.Material & {
  distort: number;
  emissiveIntensity: number;
};

interface SwarmParticle {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}

const CRYSTAL_POSITIONS = [
  { position: [-4.4, 2.1, -3.2] as [number, number, number], scale: 0.7, color: "#8c7055", rotationSpeed: 0.85 },
  { position: [4, 0.1, -1.9] as [number, number, number], scale: 0.42, color: "#b48664", rotationSpeed: 1.35 },
  { position: [-2.2, -1.4, 2.4] as [number, number, number], scale: 0.52, color: "#9b7d60", rotationSpeed: 0.74 },
  { position: [2.8, 2.6, 0.7] as [number, number, number], scale: 0.62, color: "#7d5f47", rotationSpeed: 1.08 },
  { position: [-1.3, 2.9, -0.7] as [number, number, number], scale: 0.36, color: "#d6b38c", rotationSpeed: 1.55 },
  { position: [0.9, -0.8, -3.3] as [number, number, number], scale: 0.3, color: "#5e4938", rotationSpeed: 0.9 },
];

function CavapendoloOrb({
  position = [0, 0.55, 0],
}: {
  position?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<DistortMaterialHandle | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.distort = 0.42 + Math.sin(t * 0.55) * 0.12;
      materialRef.current.emissiveIntensity = 0.24 + Math.sin(t * 0.42) * 0.12;
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.15;
      meshRef.current.rotation.z = Math.sin(t * 0.28) * 0.08;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.08;
    }
  });

  return (
    <Float speed={1.15} rotationIntensity={0.4} floatIntensity={0.55}>
      <mesh ref={meshRef} position={position} scale={1.35}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          ref={materialRef as any}
          color="#87644b"
          emissive="#4d3527"
          emissiveIntensity={0.24}
          roughness={0.24}
          metalness={0.12}
          distort={0.42}
          speed={2.1}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function CavapendoliSwarm({ count = 40 }: { count?: number }) {
  const particles = useMemo<SwarmParticle[]>(
    () =>
      Array.from({ length: count }, (_, index) => ({
        position: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 8.5,
          (Math.random() - 0.5) * 12 - 2,
        ],
        scale: 0.03 + Math.random() * 0.05,
        speed: 0.18 + Math.random() * 0.32,
        color:
          index % 4 === 0
            ? "#efd0aa"
            : index % 4 === 1
              ? "#b38a65"
              : index % 4 === 2
                ? "#a16f59"
                : "#c4a882",
      })),
    [count],
  );

  return (
    <>
      {particles.map((particle, index) => (
        <Float
          key={`swarm-${index}`}
          speed={particle.speed}
          rotationIntensity={2}
          floatIntensity={1.2}
        >
          <mesh position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color={particle.color}
              emissive={particle.color}
              emissiveIntensity={0.58}
              transparent
              opacity={0.75}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function FloatingCrystal({
  position,
  scale = 1,
  color = "#a08060",
  rotationSpeed = 1,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
  rotationSpeed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.006 * rotationSpeed;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.55) * 0.14;
  });

  return (
    <Float speed={1.4 + rotationSpeed * 0.25} rotationIntensity={0.55} floatIntensity={0.85}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={[0.5, 0.35, 0]}>
        <octahedronGeometry args={[0.46, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.22}
          transparent
          opacity={0.55}
          roughness={0.12}
          metalness={0.42}
        />
      </mesh>
    </Float>
  );
}

function DreamGate() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.12;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.18;
    }
  });

  return (
    <group position={[0, 0.9, -2.5]}>
      <mesh ref={outerRingRef}>
        <torusGeometry args={[2.75, 0.08, 16, 80]} />
        <meshStandardMaterial color="#d8c3a4" emissive="#d8c3a4" emissiveIntensity={0.18} />
      </mesh>
      <mesh ref={innerRingRef} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.75, 0.04, 16, 60]} />
        <meshStandardMaterial color="#b58f69" emissive="#b58f69" emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[1.5, 48]} />
        <meshBasicMaterial color="#f5ede3" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

function VeilPlane({
  position,
  rotation,
  color,
  opacity,
  scale,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  opacity: number;
  scale: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}

function MysticalFloor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#dfd1c1" roughness={0.94} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.98, 0]}>
        <ringGeometry args={[2.3, 4.6, 40]} />
        <meshStandardMaterial color="#c9b19a" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.97, 0]}>
        <circleGeometry args={[2.1, 40]} />
        <meshStandardMaterial color="#f4e7d5" transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function DramaticLighting() {
  return (
    <>
      <ambientLight intensity={0.36} color="#f7efe5" />
      <hemisphereLight intensity={0.26} color="#f7f2eb" groundColor="#5a4534" />
      <directionalLight position={[6, 10, 7]} intensity={0.72} color="#fff1d8" castShadow />
      <pointLight position={[-5, 4, 3]} intensity={0.38} color="#d8deef" distance={16} />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#b38766" distance={12} />
      <pointLight position={[4, -1, -1]} intensity={0.18} color="#f5d9b6" distance={12} />
    </>
  );
}

function Scene() {
  const isMobile = useIsMobile();

  return (
    <>
      <fog attach="fog" args={["#efe3d7", 8, 28]} />

      <DramaticLighting />
      <MysticalFloor />
      <DreamGate />

      <VeilPlane
        position={[-2.4, 3.6, -4.5]}
        rotation={[0.18, 0.46, -0.24]}
        color="#f1dfc6"
        opacity={0.14}
        scale={[4.4, 6.2, 1]}
      />
      <VeilPlane
        position={[2.8, 2.5, -4]}
        rotation={[-0.2, -0.38, 0.14]}
        color="#dbc0a4"
        opacity={0.1}
        scale={[3.6, 5.4, 1]}
      />

      <CavapendoloOrb />

      {CRYSTAL_POSITIONS.map((crystal) => (
        <FloatingCrystal
          key={crystal.position.join("-")}
          position={crystal.position}
          scale={crystal.scale}
          color={crystal.color}
          rotationSpeed={crystal.rotationSpeed}
        />
      ))}

      <CavapendoliSwarm count={isMobile ? 16 : 48} />

      <Sparkles
        count={isMobile ? 45 : 140}
        scale={16}
        size={1.5}
        speed={0.28}
        color="#e5c6a4"
        opacity={0.5}
      />

      <Stars
        radius={48}
        depth={42}
        count={isMobile ? 360 : 1100}
        factor={2.2}
        saturation={0.15}
        fade
        speed={0.2}
      />

      <Environment preset="sunset" />
    </>
  );
}

function CavapendoWorld({ className = "" }: CavapendoWorldProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--trace)/0.55),transparent_36%),radial-gradient(circle_at_20%_30%,rgba(231,211,183,0.55),transparent_26%),radial-gradient(circle_at_80%_28%,rgba(202,181,155,0.32),transparent_24%),linear-gradient(180deg,#fbf4ec_0%,#efe3d7_52%,#d8c3b1_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_center,rgba(95,58,38,0.18),transparent_58%)] blur-2xl" />

      <WebGLCanvasFallback
        camera={{ position: [0, 0.4, 6.2], fov: 50 }}
        dpr={[1, 1.6]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      />

      {reduceMotion && (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(231,211,183,0.45),transparent_30%),linear-gradient(180deg,#fbf4ec_0%,#efe3d7_50%,#d8c3b1_100%)]" />
      )}
    </div>
  );
}

class WebGLCrashBoundary extends React.Component<
  Record<string, unknown> & { t: ReturnType<typeof useTranslation>["t"] },
  { hasError: boolean }
> {
  constructor(props: Record<string, unknown> & { t: ReturnType<typeof useTranslation>["t"] }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("[CavapendoWorld] WebGL render error:", error.message);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-[#efe3d7]">
          <div className="text-center">
            <p className="text-sm font-light tracking-widest text-[#7d5f47] uppercase">
              {t("gallery.shell.webglUnavailable")}
            </p>
            <p className="mt-2 text-xs text-[#a08060]">
              {t("gallery.shell.webglUnavailableHint")}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

function WebGLCanvasFallback(props: React.ComponentProps<typeof Canvas>) {
  const { t } = useTranslation();
  return (
    <WebGLCrashBoundary t={t}>
      <Canvas
        {...props}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
        onError={(error) => {
          console.warn("[Canvas] WebGL error:", error);
        }}
      >
        <Scene />
      </Canvas>
    </WebGLCrashBoundary>
  );
}

export default CavapendoWorld;
