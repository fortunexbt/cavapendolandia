import { Suspense, useMemo, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Stars, Float, Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import * as THREE from "three";

// Types
interface Offering {
  id: string;
  title: string | null;
  note?: string | null;
  text_content?: string | null;
  media_type: string;
  file_url: string | null;
  link_url: string | null;
  author_name: string | null;
  author_type: string;
  created_at: string;
}

interface GalleryRoomProps {
  offerings: Offering[];
  onSelectOffering: (offering: Offering) => void;
}

const FRAME_COLORS = [
  "#6b5b4b",
  "#8b7355", 
  "#7a6250",
  "#5b4b3b",
  "#9b8365",
  "#4b3b2b",
];

// Artistic frame pinned to wall
function ArtisticFrame({ 
  offering, 
  position, 
  rotation = [0, 0, 0],
  onClick 
}: { 
  offering: Offering;
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick: () => void;
}) {
  const colorIndex = offering.id.charCodeAt(0) % FRAME_COLORS.length;
  
  return (
    <group position={position} rotation={rotation}>
      <group 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Outer frame */}
        <mesh>
          <boxGeometry args={[1.4, 1.7, 0.12]} />
          <meshStandardMaterial 
            color={FRAME_COLORS[colorIndex]}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        
        {/* Inner frame detail */}
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[1.2, 1.5, 0.02]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
        </mesh>
        
        {/* Canvas/white space */}
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[1.05, 1.35, 0.01]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
        </mesh>
        
        {/* Content representation */}
        {offering.media_type === "text" && (
          <mesh position={[0, 0.1, 0.1]}>
            <boxGeometry args={[0.7, 0.8, 0.005]} />
            <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
          </mesh>
        )}
        {offering.media_type === "image" && (
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.9, 0.9, 0.005]} />
            <meshStandardMaterial color="#d4c4b0" roughness={0.85} />
          </mesh>
        )}
        {offering.media_type === "link" && (
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.75, 0.5, 0.005]} />
            <meshStandardMaterial color="#c4b4a0" roughness={0.85} />
          </mesh>
        )}
        {offering.media_type === "video" && (
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.85, 0.6, 0.005]} />
            <meshStandardMaterial color="#b4a490" roughness={0.85} />
          </mesh>
        )}
        
        {/* Pin/nail at top */}
        <mesh position={[0, 0.85, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// Seeded random for deterministic layout
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Gallery room with better atmosphere
function GalleryRoom() {
  return (
    <group>
      {/* Floor - warm stone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.85} />
      </mesh>
      
      {/* Floor center glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.99, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial
          color="#e8e0d5"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Back wall - warm white */}
      <mesh position={[0, 4, -18]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-18, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[18, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
    </group>
  );
}

// Dramatic gallery lighting
function GalleryLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      
      {/* Main overhead light */}
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.5} 
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Warm accent lights */}
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#f5e6d6" />
      <pointLight position={[-10, 3, 3]} intensity={0.25} color="#e6d6c6" />
      <pointLight position={[10, 3, 3]} intensity={0.25} color="#e6d6c6" />
      
      {/* Subtle floor reflection */}
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#d6c6b6" />
    </>
  );
}

// Floating dust particles
function GalleryDust() {
  return (
    <Sparkles
      count={200}
      scale={40}
      size={1}
      speed={0.15}
      color="#c9b896"
      opacity={0.25}
    />
  );
}

// Cavapendoli story creatures
const CREATURES = [
  {
    name: "Cavalluccio Marino",
    story: "«Noi cavallucci siamo i primi cavapendoli: oscilliamo nell'acqua come pendoli viventi.»",
    position: [-6, -2.5, -8] as [number, number, number],
    rotation: [0, 0.4, 0] as [number, number, number],
    color: "#7a9b8a",
    emissive: "#4a6b5a",
    geometry: "seahorse" as const,
    scale: 0.6,
  },
  {
    name: "Gufo Saggio",
    story: "«Di notte conto i cavapendoli che dondolano tra le stelle. Non finiscono mai.»",
    position: [8, -1.5, -5] as [number, number, number],
    rotation: [0, -0.8, 0] as [number, number, number],
    color: "#8b7355",
    emissive: "#5a4a35",
    geometry: "owl" as const,
    scale: 0.5,
  },
  {
    name: "Lucertola Sognatrice",
    story: "«Mi fermo al sole e sogno cavapendoli fatti di luce, che oscillano senza ombra.»",
    position: [3, -2.8, 4] as [number, number, number],
    rotation: [-0.3, 1.2, 0] as [number, number, number],
    color: "#6b8b5b",
    emissive: "#3a5a2b",
    geometry: "lizard" as const,
    scale: 0.45,
  },
  {
    name: "Lumaca Filosofa",
    story: "«Ogni cavapendolo è una spirale, come la mia casa. Il tempo gira, mai dritto.»",
    position: [-4, -2.85, 5] as [number, number, number],
    rotation: [0, 2.1, 0] as [number, number, number],
    color: "#b09878",
    emissive: "#806848",
    geometry: "snail" as const,
    scale: 0.4,
  },
  {
    name: "Gatto Lunare",
    story: "«I cavapendoli migliori appaiono a mezzanotte, quando nessuno guarda.»",
    position: [10, -2.3, 2] as [number, number, number],
    rotation: [0, -1.5, 0] as [number, number, number],
    color: "#4a4a5a",
    emissive: "#2a2a3a",
    geometry: "cat" as const,
    scale: 0.55,
  },
  {
    name: "Rana Cantante",
    story: "«Canto per i cavapendoli: cra-cra-pendolo, cra-cra-pendolo… è la mia ninna nanna.»",
    position: [-9, -2.7, 0] as [number, number, number],
    rotation: [0, 1.0, 0] as [number, number, number],
    color: "#5a8b5a",
    emissive: "#2a5b2a",
    geometry: "frog" as const,
    scale: 0.4,
  },
];

// Build a simple creature mesh based on type
function CreatureBody({ type, color, emissive }: { type: string; color: string; emissive: string }) {
  const matProps = { color, emissive, emissiveIntensity: 0.3, roughness: 0.7, metalness: 0.1 };
  
  if (type === "seahorse") {
    return (
      <group>
        {/* Body - curved S shape */}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0.15, 0.05]} scale={[0.8, 1, 0.7]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.05, -0.2, 0]} scale={[0.6, 0.8, 0.5]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Tail curl */}
        <mesh position={[0.1, -0.5, 0]} rotation={[0, 0, -0.5]} scale={[0.4, 0.6, 0.35]}>
          <torusGeometry args={[0.2, 0.06, 8, 12, Math.PI]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Snout */}
        <mesh position={[0.15, 0.7, 0.15]} rotation={[0, 0, -0.3]} scale={[1.5, 0.4, 0.4]}>
          <cylinderGeometry args={[0.04, 0.06, 0.3, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eye */}
        <mesh position={[0.08, 0.72, 0.2]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Dorsal fin */}
        <mesh position={[-0.15, 0.4, 0]} rotation={[0, 0, 0.3]} scale={[0.1, 0.5, 0.4]}>
          <coneGeometry args={[0.3, 0.6, 6]} />
          <meshStandardMaterial {...matProps} transparent opacity={0.7} />
        </mesh>
      </group>
    );
  }
  
  if (type === "owl") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[0.8, 1, 0.7]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.5, 0.05]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.55, 0.25]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.1, 0.55, 0.25]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.5} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.1, 0.55, 0.33]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.1, 0.55, 0.33]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[-0.2, 0.75, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.06, 0.2, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.2, 0.75, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.06, 0.2, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.45, 0.3]} rotation={[0.3, 0, 0]}>
          <coneGeometry args={[0.04, 0.1, 4]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
      </group>
    );
  }
  
  if (type === "cat") {
    return (
      <group>
        {/* Body - sitting */}
        <mesh position={[0, 0, 0]} scale={[0.6, 0.8, 0.9]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.5, 0.15]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.15, 0.72, 0.1]} rotation={[0, 0, 0.2]}>
          <coneGeometry args={[0.07, 0.15, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.15, 0.72, 0.1]} rotation={[0, 0, -0.2]}>
          <coneGeometry args={[0.07, 0.15, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.08, 0.53, 0.35]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.08, 0.53, 0.35]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.4} />
        </mesh>
        {/* Tail */}
        <mesh position={[-0.1, 0.1, -0.35]} rotation={[0.8, 0.3, 0]} scale={[0.15, 0.15, 1]}>
          <cylinderGeometry args={[0.15, 0.05, 0.7, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }
  
  if (type === "frog") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[1, 0.6, 0.9]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes - bulging */}
        <mesh position={[-0.15, 0.25, 0.15]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
        <mesh position={[0.15, 0.25, 0.15]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
        <mesh position={[-0.15, 0.27, 0.23]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.15, 0.27, 0.23]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        {/* Front legs */}
        <mesh position={[-0.2, -0.12, 0.2]} rotation={[0.4, 0, 0.3]} scale={[0.3, 0.15, 0.5]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.2, -0.12, 0.2]} rotation={[0.4, 0, -0.3]} scale={[0.3, 0.15, 0.5]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }
  
  if (type === "snail") {
    return (
      <group>
        {/* Shell - spiral */}
        <mesh position={[0, 0.15, -0.05]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.05, 0.25, -0.1]} scale={[0.7, 0.7, 0.7]}>
          <torusGeometry args={[0.12, 0.05, 8, 12, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c0a878" roughness={0.6} />
        </mesh>
        {/* Body */}
        <mesh position={[0, -0.05, 0.1]} scale={[0.6, 0.35, 1.2]}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color="#a09080" roughness={0.8} />
        </mesh>
        {/* Eye stalks */}
        <mesh position={[-0.06, 0.15, 0.25]} rotation={[0.5, 0, 0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        <mesh position={[0.06, 0.15, 0.25]} rotation={[0.5, 0, -0.1]}>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.22, 0.3]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0.07, 0.22, 0.3]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
    );
  }

  if (type === "lizard") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[0.5, 0.3, 1.2]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.05, 0.3]} scale={[0.7, 0.5, 0.8]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.07, 0.1, 0.4]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0.07, 0.1, 0.4]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.3} />
        </mesh>
        {/* Tail */}
        <mesh position={[0, -0.02, -0.35]} rotation={[0.1, 0, 0]} scale={[0.2, 0.15, 1.5]}>
          <cylinderGeometry args={[0.08, 0.02, 0.4, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.15, -0.08, 0.1]} rotation={[0, 0, 0.6]}>
          <cylinderGeometry args={[0.025, 0.02, 0.15, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.15, -0.08, 0.1]} rotation={[0, 0, -0.6]}>
          <cylinderGeometry args={[0.025, 0.02, 0.15, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }
  
  // Fallback sphere
  return (
    <mesh>
      <sphereGeometry args={[0.3, 12, 12]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}

// A story creature that bobs gently and shows its story on click
function StoryCreature({ 
  creature, 
  onSelect 
}: { 
  creature: typeof CREATURES[number];
  onSelect: (creature: typeof CREATURES[number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = creature.position[1] + Math.sin(state.clock.elapsedTime * 0.8 + creature.position[0]) * 0.08;
    }
  });

  return (
    <group
      ref={groupRef}
      position={creature.position}
      rotation={creature.rotation}
      scale={creature.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(creature);
      }}
    >
      <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0}>
        <CreatureBody type={creature.geometry} color={creature.color} emissive={creature.emissive} />
      </Float>
      {/* Subtle glow underneath */}
      <pointLight position={[0, -0.2, 0]} intensity={0.15} color={creature.color} distance={3} />
    </group>
  );
}

// Main 3D Scene
function Scene({ offerings, onSelectOffering }: GalleryRoomProps) {
  const reduceMotion = useReducedMotion();
  
  // Pin frames to walls with random tilt and placement
  const positions = useMemo(() => {
    const backSlots = { count: 0 };
    const leftSlots = { count: 0 };
    const rightSlots = { count: 0 };
    
    return offerings.map((o, i) => {
      const wall = i % 3; // cycle across 3 walls
      const seed = o.id.charCodeAt(0) * 100 + i;
      const tilt = (seededRandom(seed) - 0.5) * 0.2; // ±0.1 rad (~6°)
      const yJitter = (seededRandom(seed + 1) - 0.5) * 1.2;
      
      if (wall === 0) { // Back wall
        const slot = backSlots.count++;
        const x = (slot - 2) * 3.5 + (seededRandom(seed + 2) - 0.5) * 0.8;
        return {
          position: [x, 1 + yJitter, -17.8] as [number, number, number],
          rotation: [0, 0, tilt] as [number, number, number]
        };
      } else if (wall === 1) { // Left wall
        const slot = leftSlots.count++;
        const z = (slot - 1) * 3.5 + (seededRandom(seed + 3) - 0.5) * 0.8;
        return {
          position: [-17.8, 1 + yJitter, z] as [number, number, number],
          rotation: [0, Math.PI / 2, tilt] as [number, number, number]
        };
      } else { // Right wall
        const slot = rightSlots.count++;
        const z = (slot - 1) * 3.5 + (seededRandom(seed + 4) - 0.5) * 0.8;
        return {
          position: [17.8, 1 + yJitter, z] as [number, number, number],
          rotation: [0, -Math.PI / 2, tilt] as [number, number, number]
        };
      }
    });
  }, [offerings]);

  return (
    <>
      <fog attach="fog" args={["#f5f0e8", 15, 50]} />
      
      <GalleryLighting />
      
      <GalleryRoom />
      
      {/* Offerings as artistic frames */}
      {offerings.slice(0, 16).map((offering, i) => {
        const pos = positions[i];
        return (
          <ArtisticFrame
            key={offering.id}
            offering={offering}
            position={pos.position}
            rotation={pos.rotation}
            onClick={() => onSelectOffering(offering)}
          />
        );
      })}
      
      <GalleryDust />
      
      <Stars
        radius={80}
        depth={60}
        count={500}
        factor={1.5}
        saturation={0}
        fade
        speed={0.1}
      />
      
      <Environment preset="apartment" />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.75}
        target={[0, 1, 0]}
      />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial color="#d4c4b0" wireframe />
    </mesh>
  );
}

// Modal for showing offering details
function OfferingModal({ 
  offering, 
  onClose 
}: { 
  offering: Offering | null; 
  onClose: () => void;
}) {
  if (!offering) return null;
  
  const authorDisplay = offering.author_type === "anonymous" 
    ? "Anonimo" 
    : offering.author_name || "Artista";
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20 }}
          className="relative max-w-lg w-full bg-background p-8 rounded-lg shadow-2xl border border-border/30"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
          >
            ×
          </button>
          
          <h2 className="text-2xl font-serif text-foreground mb-4">
            {offering.title || "Senza titolo"}
          </h2>
          
          {offering.text_content && (
            <p className="text-lg italic text-foreground/80 mb-4 font-serif leading-relaxed">
              {offering.text_content}
            </p>
          )}
          
          {offering.note && (
            <p className="text-base text-foreground/60 mb-4 italic">
              "{offering.note}"
            </p>
          )}
          
          {offering.media_type === "image" && offering.file_url && (
            <div className="mb-4 bg-muted rounded overflow-hidden">
              <img 
                src={offering.file_url} 
                alt={offering.title || "Immagine"}
                className="max-w-full h-auto"
              />
            </div>
          )}
          
          {offering.media_type === "link" && offering.link_url && (
            <a 
              href={offering.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-4 text-accent-foreground hover:underline"
            >
              🔗 Apri link →
            </a>
          )}
          
          <div className="mt-6 pt-4 border-t border-border/30 text-sm text-muted-foreground">
            <p>
              Di <span className="font-medium text-foreground">{authorDisplay}</span>
            </p>
            <p className="mt-1 text-xs">
              {new Date(offering.created_at).toLocaleDateString("it-IT")}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Main component
function CavapendoGallery({ className = "" }: { className?: string }) {
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  
  // Demo offerings
  const demoOfferings: Offering[] = useMemo(() => [
    {
      id: "demo-1",
      title: "Il Primo Cavapendolo",
      note: "Ho immaginato un piccolo essere che oscilla nel vento",
      text_content: "I cavapendoli sono creature di luce, sospese tra il cielo e la terra.",
      media_type: "text",
      file_url: null,
      link_url: null,
      author_name: "Maria",
      author_type: "name",
      created_at: "2024-01-15",
    },
    {
      id: "demo-2",
      title: "Spirale d'Argento",
      note: "Un disegno che rappresenta il movimento",
      media_type: "image",
      file_url: "/cavapendoli/bw-sheet.png",
      link_url: null,
      author_name: "Roberto",
      author_type: "name",
      created_at: "2024-01-16",
    },
    {
      id: "demo-3",
      title: "Pensiero Sospeso",
      text_content: "Come un pendolo che non trova mai il fondo, così va la vita.",
      media_type: "text",
      file_url: null,
      link_url: null,
      author_type: "anonymous",
      author_name: null,
      created_at: "2024-01-17",
    },
    {
      id: "demo-4",
      title: "Movimento",
      note: "Il cavapendolo che si muove nell'aria",
      media_type: "image",
      file_url: "/cavapendoli/color-sheet-a.png",
      link_url: null,
      author_name: "@artista",
      author_type: "instagram",
      created_at: "2024-01-18",
    },
    {
      id: "demo-5",
      title: "Nel Vento",
      text_content: "Sospesi, fluttuando nel tempo che non passa mai.",
      media_type: "text",
      file_url: null,
      link_url: null,
      author_name: "Giulia",
      author_type: "name",
      created_at: "2024-01-19",
    },
    {
      id: "demo-6",
      title: "Colore B",
      media_type: "image",
      file_url: "/cavapendoli/color-sheet-b.png",
      link_url: null,
      author_name: "Luca",
      author_type: "name",
      created_at: "2024-01-20",
    },
    {
      id: "demo-7",
      title: "Attesa",
      text_content: "Nel silenzio, il cavapendolo aspetta di essere notato.",
      media_type: "text",
      file_url: null,
      link_url: null,
      author_name: "Marco",
      author_type: "name",
      created_at: "2024-01-21",
    },
    {
      id: "demo-8",
      title: "Spirale",
      media_type: "image",
      file_url: "/cavapendoli/bw-sheet.png",
      link_url: null,
      author_name: "Elena",
      author_type: "name",
      created_at: "2024-01-22",
    },
  ], []);

  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`} style={{ height: "100%", minHeight: "600px" }}>
      <Canvas
        camera={{ position: [0, 1, 12], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        style={{ background: "linear-gradient(180deg, #f5f0e8 0%, #e0d8d0 100%)", width: "100%", height: "100%" }}
        shadows
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene 
            offerings={demoOfferings}
            onSelectOffering={setSelectedOffering}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md border border-border/20">
          <p className="font-mono-light text-xs text-muted-foreground">
            🖱️ Trascina per ruotare • Zoom con scroll • Clicca un quadro
          </p>
        </div>
        <Link 
          to="/offri"
          className="pointer-events-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-md hover:bg-primary/90 transition-colors font-mono-light text-sm shadow-lg"
        >
          + Lascia una cavapendolata
        </Link>
      </div>
      
      <OfferingModal 
        offering={selectedOffering}
        onClose={() => setSelectedOffering(null)}
      />
    </div>
  );
}

export default CavapendoGallery;