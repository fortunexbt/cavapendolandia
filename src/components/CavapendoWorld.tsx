import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import { Float, Sparkles, Environment, MeshDistortMaterial, Stars } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

interface CavapendoWorldProps {
  className?: string;
}

// The main Cavapendolo - a mystical orb that transforms
function CavapendoloOrb({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    if (materialRef.current) {
      // Breathing distortion
      materialRef.current.distort = 0.3 + Math.sin(t * 0.5) * 0.15;
      // Subtle color shift
      materialRef.current.emissiveIntensity = 0.15 + Math.sin(t * 0.3) * 0.1;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.1;
      meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.05;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={1.2}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#7a6350"
          emissive="#4a3a2a"
          emissiveIntensity={0.2}
          roughness={0.25}
          metalness={0.15}
          distort={0.4}
          speed={2.5}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

// Floating cavapendoli - small magical creatures/spirits
function CavapendoliSwarm() {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 40; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 10 - 2
        ] as [number, number, number],
        scale: 0.03 + Math.random() * 0.05,
        speed: 0.2 + Math.random() * 0.3,
        color: i % 3 === 0 ? "#8b7355" : i % 3 === 1 ? "#a08060" : "#c4a882"
      });
    }
    return temp;
  }, []);

  return (
    <>
      {particles.map((p, i) => (
        <Float key={i} speed={p.speed} rotationIntensity={2} floatIntensity={1}>
          <mesh position={p.position} scale={p.scale}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial
              color={p.color}
              emissive={p.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

// Decorative floating crystals
function FloatingCrystal({ 
  position, 
  scale = 1, 
  color = "#a08060",
  rotationSpeed = 1
}: { 
  position: [number, number, number], 
  scale?: number, 
  color?: string,
  rotationSpeed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005 * rotationSpeed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={1.5 + Math.random()} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={[0.5, 0.3, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
    </Float>
  );
}

// Mystical floor with subtle pattern
function MysticalFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial 
          color="#e8e0d5"
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Subtle glow in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.99, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color="#d4c4b0"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Dramatic lighting setup
function DramaticLighting() {
  return (
    <>
      {/* Soft ambient */}
      <ambientLight intensity={0.3} />
      
      {/* Main key light - warm */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={0.6} 
        color="#fff5e6"
        castShadow
      />
      
      {/* Fill light - cool */}
      <pointLight position={[-5, 3, 2]} intensity={0.3} color="#d4e0f0" />
      
      {/* Rim light - golden */}
      <pointLight position={[0, -2, 5]} intensity={0.2} color="#f0e6d0" />
      
      {/* Under-glow from the orb */}
      <pointLight position={[0, 0, 0]} intensity={0.4} color="#8b7355" distance={8} />
    </>
  );
}

// Main 3D Scene
function Scene() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Fog for atmosphere */}
      <fog attach="fog" args={["#f5f0e8", 8, 30]} />
      
      <DramaticLighting />
      
      {/* Floor */}
      <MysticalFloor />
      
      {/* Main mystical orb */}
      <CavapendoloOrb position={[0, 0.5, 0]} />
      
      {/* Floating crystals scattered around */}
      <FloatingCrystal position={[-4, 2, -3]} scale={0.5} color="#8b7355" rotationSpeed={0.8} />
      <FloatingCrystal position={[3.5, 0, -2]} scale={0.35} color="#a08060" rotationSpeed={1.2} />
      <FloatingCrystal position={[-2, -1, 2]} scale={0.4} color="#9a8468" rotationSpeed={0.6} />
      <FloatingCrystal position={[2.5, 2, 1]} scale={0.45} color="#7a6350" rotationSpeed={1} />
      <FloatingCrystal position={[-1.5, 2.5, -1]} scale={0.3} color="#b09070" rotationSpeed={1.5} />
      <FloatingCrystal position={[1, -0.5, -3]} scale={0.25} color="#6a5545" rotationSpeed={0.9} />
      
      {/* Swarm of tiny cavapendoli particles */}
      <CavapendoliSwarm />
      
      {/* Ambient sparkles */}
      <Sparkles
        count={120}
        scale={15}
        size={1.5}
        speed={0.3}
        color="#c4a882"
        opacity={0.4}
      />
      
      {/* Distant stars for depth */}
      <Stars
        radius={50}
        depth={50}
        count={1000}
        factor={2}
        saturation={0}
        fade
        speed={0.2}
      />
      
      {/* Environment for reflections */}
      <Environment preset="dawn" />
    </>
  );
}

// Main component
function CavapendoWorld({ className = "" }: CavapendoWorldProps) {
  const reduceMotion = useReducedMotion();

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
      
      {/* Fallback for reduced motion */}
      {reduceMotion && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f5f0e8] to-[#e8e0d5]" />
      )}
    </div>
  );
}

export default CavapendoWorld;