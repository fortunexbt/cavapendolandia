import { Canvas } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, MeshDistortMaterial } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

interface CavapendoWorldProps {
  className?: string;
}

// Floating Cavapendolo orb
function CavapendoOrb({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.distort = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={0.8}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#8b7355"
          emissive="#5c4a3a"
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.1}
          distort={0.4}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

// Floating crystals
function FloatingCrystal({ position, scale = 1, color = "#a08060" }: { position: [number, number, number], scale?: number, color?: string }) {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh position={position} scale={scale} rotation={[0.5, 0.3, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          opacity={0.6}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </Float>
  );
}

// Mystical fog layer
function MysticalFog() {
  const fogRef = useRef<THREE.Fog>(null);

  return (
    <group>
      <fog attach="fog" args={["#f5f0e8", 5, 25]} />
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color="#f5f0e8"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Main 3D Scene
function Scene() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <>
      <MysticalFog />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#fff8f0" />
      <pointLight position={[-3, 2, 2]} intensity={0.4} color="#d4c4b0" />
      
      {/* Main orb in center */}
      <CavapendoOrb position={[0, 0, 0]} />
      
      {/* Floating crystals around */}
      <FloatingCrystal position={[-3, 1.5, -2]} scale={0.6} color="#8b7355" />
      <FloatingCrystal position={[2.5, -0.5, -1.5]} scale={0.4} color="#a08060" />
      <FloatingCrystal position={[-1.5, -1, 2]} scale={0.35} color="#9a8468" />
      <FloatingCrystal position={[2, 1.5, 1]} scale={0.5} color="#7a6350" />
      
      {/* Sparkles */}
      <Sparkles
        count={80}
        scale={12}
        size={2}
        speed={0.4}
        color="#c4a882"
        opacity={0.5}
      />
      
      {/* Environment for reflections */}
      <Environment preset="dawn" />
    </>
  );
}

// Main component
function CavapendoWorld({ className = "" }: CavapendoWorldProps) {
  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default CavapendoWorld;