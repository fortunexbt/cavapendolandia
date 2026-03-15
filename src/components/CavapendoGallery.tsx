import { Suspense, useMemo, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Stars, Float, Html } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { withSignedFileUrls } from "@/lib/offeringMedia";

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

// ─── Artistic Frame with inline media ───────────────────────────────────────

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
        
        {/* Inline media rendered via Html */}
        <Html
          position={[0, 0, 0.11]}
          transform
          distanceFactor={4}
          style={{
            width: "180px",
            height: "220px",
            overflow: "hidden",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            userSelect: "none",
          }}
          zIndexRange={[0, 0]}
        >
          <FrameContent offering={offering} />
        </Html>
        
        {/* Pin/nail at top */}
        <mesh position={[0, 0.85, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// Renders the actual content inside a frame
function FrameContent({ offering }: { offering: Offering }) {
  if (offering.media_type === "text" && offering.text_content) {
    return (
      <div style={{
        padding: "12px",
        fontFamily: "Georgia, serif",
        fontSize: "11px",
        lineHeight: "1.5",
        color: "#2a2a2a",
        textAlign: "center",
        fontStyle: "italic",
        wordBreak: "break-word",
      }}>
        {offering.text_content.length > 160
          ? offering.text_content.slice(0, 160) + "…"
          : offering.text_content}
      </div>
    );
  }

  if (offering.media_type === "image" && offering.file_url) {
    return (
      <img
        src={offering.file_url}
        alt={offering.title || "Immagine"}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "2px",
        }}
        crossOrigin="anonymous"
      />
    );
  }

  if (offering.media_type === "video" && offering.file_url) {
    return (
      <video
        src={offering.file_url}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        crossOrigin="anonymous"
      />
    );
  }

  if (offering.media_type === "audio" && offering.file_url) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "16px",
        pointerEvents: "auto",
      }}>
        <div style={{ fontSize: "28px" }}>🎵</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "10px", color: "#5a5a5a", textAlign: "center" }}>
          {offering.title || "Audio"}
        </div>
        <audio
          src={offering.file_url}
          controls
          style={{ width: "140px", height: "28px" }}
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  if (offering.media_type === "link" && offering.link_url) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "16px",
        fontFamily: "Georgia, serif",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "24px" }}>🔗</div>
        <div style={{ fontSize: "10px", color: "#5a5a5a", wordBreak: "break-all" }}>
          {offering.link_url.replace(/^https?:\/\//, "").slice(0, 40)}
        </div>
      </div>
    );
  }

  if (offering.media_type === "pdf") {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "16px",
        fontFamily: "Georgia, serif",
      }}>
        <div style={{ fontSize: "28px" }}>📄</div>
        <div style={{ fontSize: "10px", color: "#5a5a5a", textAlign: "center" }}>
          {offering.title || "PDF"}
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div style={{
      fontFamily: "Georgia, serif",
      fontSize: "11px",
      color: "#8a8a8a",
      textAlign: "center",
      fontStyle: "italic",
      padding: "16px",
    }}>
      {offering.title || "Cavapendolata"}
    </div>
  );
}

// Seeded random for deterministic layout
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Gallery Room ───────────────────────────────────────────────────────────

function GalleryRoom() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.99, 0]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#e8e0d5" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 4, -18]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.95} />
      </mesh>
      <mesh position={[-18, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
      <mesh position={[18, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
    </group>
  );
}

// ─── Lighting ───────────────────────────────────────────────────────────────

function GalleryLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.5} 
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#f5e6d6" />
      <pointLight position={[-10, 3, 3]} intensity={0.25} color="#e6d6c6" />
      <pointLight position={[10, 3, 3]} intensity={0.25} color="#e6d6c6" />
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#d6c6b6" />
    </>
  );
}

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

// ─── Story Creatures (bigger, more detailed, animated) ──────────────────────

const CREATURES = [
  {
    name: "Cavalluccio Marino",
    story: "«Noi cavallucci siamo i primi cavapendoli: oscilliamo nell'acqua come pendoli viventi. Ogni onda ci spinge, ogni corrente ci tira, ma noi non cadiamo mai.»",
    position: [-8, -1.8, -10] as [number, number, number],
    rotation: [0, 0.6, 0] as [number, number, number],
    color: "#7a9b8a",
    emissive: "#4a6b5a",
    geometry: "seahorse" as const,
    scale: 1.4,
  },
  {
    name: "Gufo Saggio",
    story: "«Di notte conto i cavapendoli che dondolano tra le stelle. Non finiscono mai. E ogni volta che ne conto uno, ne nascono tre nuovi.»",
    position: [10, -0.8, -7] as [number, number, number],
    rotation: [0, -0.9, 0] as [number, number, number],
    color: "#8b7355",
    emissive: "#5a4a35",
    geometry: "owl" as const,
    scale: 1.2,
  },
  {
    name: "Lucertola Sognatrice",
    story: "«Mi fermo al sole e sogno cavapendoli fatti di luce, che oscillano senza ombra. Li vedo solo io, perché ho gli occhi fatti di cristallo.»",
    position: [5, -2.5, 6] as [number, number, number],
    rotation: [-0.1, 1.4, 0] as [number, number, number],
    color: "#6b8b5b",
    emissive: "#3a5a2b",
    geometry: "lizard" as const,
    scale: 1.1,
  },
  {
    name: "Lumaca Filosofa",
    story: "«Ogni cavapendolo è una spirale, come la mia casa. Il tempo gira, mai dritto. Chi ha fretta non troverà mai un cavapendolo.»",
    position: [-6, -2.6, 7] as [number, number, number],
    rotation: [0, 2.3, 0] as [number, number, number],
    color: "#b09878",
    emissive: "#806848",
    geometry: "snail" as const,
    scale: 1.0,
  },
  {
    name: "Gatto Lunare",
    story: "«I cavapendoli migliori appaiono a mezzanotte, quando nessuno guarda. Li catturo con le mie zampe di velluto e li nascondo sotto la luna.»",
    position: [12, -1.6, 3] as [number, number, number],
    rotation: [0, -1.6, 0] as [number, number, number],
    color: "#4a4a5a",
    emissive: "#2a2a3a",
    geometry: "cat" as const,
    scale: 1.3,
  },
  {
    name: "Rana Cantante",
    story: "«Canto per i cavapendoli: cra-cra-pendolo, cra-cra-pendolo… è la mia ninna nanna. Quando smetto di cantare, il mondo si ferma un istante.»",
    position: [-11, -2.2, 1] as [number, number, number],
    rotation: [0, 1.2, 0] as [number, number, number],
    color: "#5a8b5a",
    emissive: "#2a5b2a",
    geometry: "frog" as const,
    scale: 1.0,
  },
];

// ─── Detailed Creature Bodies ───────────────────────────────────────────────

function CreatureBody({ type, color, emissive }: { type: string; color: string; emissive: string }) {
  const matProps = { color, emissive, emissiveIntensity: 0.3, roughness: 0.7, metalness: 0.1 };
  const darkMat = { color: "#222", roughness: 0.4, metalness: 0.2 };
  
  if (type === "seahorse") {
    return (
      <group>
        {/* Head */}
        <mesh position={[0, 1.0, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Crown/crest */}
        <mesh position={[0, 1.35, -0.05]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.12, 0.3, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[-0.08, 1.28, -0.02]} rotation={[0.3, 0, 0.4]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.08, 1.28, -0.02]} rotation={[0.3, 0, -0.4]}>
          <coneGeometry args={[0.06, 0.18, 5]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Snout */}
        <mesh position={[0.2, 1.0, 0.2]} rotation={[0, 0, -0.4]} scale={[1.8, 0.5, 0.5]}>
          <cylinderGeometry args={[0.05, 0.08, 0.4, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eye */}
        <mesh position={[0.12, 1.08, 0.25]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#e8e0d0" />
        </mesh>
        <mesh position={[0.14, 1.08, 0.3]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {/* Body segments - S curve */}
        {[0.55, 0.2, -0.15, -0.45].map((y, i) => (
          <mesh key={i} position={[i * 0.04, y, 0.03 * Math.sin(i)]} scale={[0.7 - i * 0.05, 0.8, 0.6 - i * 0.04]}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))}
        {/* Body ridge bumps */}
        {[0.7, 0.4, 0.1, -0.2].map((y, i) => (
          <mesh key={`bump-${i}`} position={[-0.2, y, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.04, 0.12, 4]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))}
        {/* Tail curl */}
        <mesh position={[0.15, -0.7, 0]} rotation={[0.3, 0, -0.8]}>
          <torusGeometry args={[0.25, 0.07, 8, 16, Math.PI * 1.3]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Dorsal fin */}
        <mesh position={[-0.22, 0.3, 0]} rotation={[0, 0, 0.4]} scale={[0.12, 0.8, 0.5]}>
          <coneGeometry args={[0.3, 0.7, 6]} />
          <meshStandardMaterial {...matProps} transparent opacity={0.6} />
        </mesh>
        {/* Pectoral fin */}
        <mesh position={[0.15, 0.45, 0.2]} rotation={[0.5, 0.3, -0.3]} scale={[0.5, 0.3, 0.1]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial {...matProps} transparent opacity={0.5} />
        </mesh>
      </group>
    );
  }
  
  if (type === "owl") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[0.9, 1.2, 0.8]}>
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Chest lighter patch */}
        <mesh position={[0, -0.05, 0.3]} scale={[0.6, 0.8, 0.3]}>
          <sphereGeometry args={[0.35, 12, 12]} />
          <meshStandardMaterial color="#a09070" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.6, 0.05]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Face disk */}
        <mesh position={[0, 0.58, 0.28]} scale={[1, 1.1, 0.3]}>
          <sphereGeometry args={[0.28, 12, 12]} />
          <meshStandardMaterial color="#9a8565" roughness={0.9} />
        </mesh>
        {/* Eyes - large */}
        <mesh position={[-0.12, 0.62, 0.32]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0.12, 0.62, 0.32]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.6} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.12, 0.62, 0.42]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.12, 0.62, 0.42]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {/* Ear tufts */}
        <mesh position={[-0.25, 0.9, 0]} rotation={[0.1, 0, 0.3]}>
          <coneGeometry args={[0.08, 0.28, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.25, 0.9, 0]} rotation={[0.1, 0, -0.3]}>
          <coneGeometry args={[0.08, 0.28, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.5, 0.38]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.05, 0.14, 4]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
        {/* Wings */}
        <mesh position={[-0.4, 0.05, -0.1]} rotation={[0, 0, 0.4]} scale={[0.2, 0.7, 0.5]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.4, 0.05, -0.1]} rotation={[0, 0, -0.4]} scale={[0.2, 0.7, 0.5]}>
          <sphereGeometry args={[0.35, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Feet */}
        <mesh position={[-0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
        <mesh position={[0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#e8a020" />
        </mesh>
        {/* Feather tufts on body */}
        {[-0.25, 0, 0.25].map((x, i) => (
          <mesh key={i} position={[x, -0.3, 0.25]} rotation={[0.3, 0, x * 0.5]}>
            <coneGeometry args={[0.03, 0.1, 3]} />
            <meshStandardMaterial {...matProps} />
          </mesh>
        ))}
      </group>
    );
  }
  
  if (type === "cat") {
    return (
      <group>
        {/* Body - sitting pose */}
        <mesh position={[0, 0, 0]} scale={[0.7, 1, 0.95]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Belly */}
        <mesh position={[0, -0.1, 0.2]} scale={[0.5, 0.6, 0.4]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#5a5a6a" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.6, 0.18]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Muzzle */}
        <mesh position={[0, 0.52, 0.42]} scale={[0.6, 0.4, 0.5]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial color="#5a5a6a" roughness={0.8} />
        </mesh>
        {/* Nose */}
        <mesh position={[0, 0.55, 0.47]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial color="#d4707a" />
        </mesh>
        {/* Ears */}
        <mesh position={[-0.18, 0.88, 0.12]} rotation={[0.1, 0, 0.2]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.18, 0.88, 0.12]} rotation={[0.1, 0, -0.2]}>
          <coneGeometry args={[0.09, 0.2, 4]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Inner ears */}
        <mesh position={[-0.17, 0.86, 0.15]} rotation={[0.1, 0, 0.2]} scale={[0.6, 0.7, 0.5]}>
          <coneGeometry args={[0.07, 0.14, 4]} />
          <meshStandardMaterial color="#d4707a" />
        </mesh>
        <mesh position={[0.17, 0.86, 0.15]} rotation={[0.1, 0, -0.2]} scale={[0.6, 0.7, 0.5]}>
          <coneGeometry args={[0.07, 0.14, 4]} />
          <meshStandardMaterial color="#d4707a" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.64, 0.4]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.1, 0.64, 0.4]}>
          <sphereGeometry args={[0.055, 8, 8]} />
          <meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.5} />
        </mesh>
        {/* Pupils - vertical slits */}
        <mesh position={[-0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}>
          <sphereGeometry args={[0.025, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {/* Whiskers (thin cylinders) */}
        {[-1, 1].map((side) => (
          [0, 1, 2].map((i) => (
            <mesh key={`w-${side}-${i}`} position={[side * 0.15, 0.52 + i * 0.02, 0.42]} rotation={[0.1 * (i - 1), 0, side * (0.15 + i * 0.1)]}>
              <cylinderGeometry args={[0.003, 0.002, 0.25, 4]} />
              <meshStandardMaterial color="#888" />
            </mesh>
          ))
        ))}
        {/* Front paws */}
        <mesh position={[-0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Tail */}
        <mesh position={[-0.15, 0.1, -0.4]} rotation={[0.9, 0.3, 0]} scale={[0.15, 0.15, 1]}>
          <cylinderGeometry args={[0.08, 0.04, 0.8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Tail tip */}
        <mesh position={[-0.3, 0.55, -0.75]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    );
  }
  
  if (type === "frog") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[1.1, 0.7, 1]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Belly */}
        <mesh position={[0, -0.08, 0.15]} scale={[0.8, 0.5, 0.7]}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshStandardMaterial color="#7aab6a" roughness={0.8} />
        </mesh>
        {/* Head bump */}
        <mesh position={[0, 0.12, 0.2]} scale={[0.9, 0.6, 0.8]}>
          <sphereGeometry args={[0.25, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes - bulging */}
        <mesh position={[-0.18, 0.3, 0.18]}>
          <sphereGeometry args={[0.13, 10, 10]} />
          <meshStandardMaterial color="#e8e8e0" />
        </mesh>
        <mesh position={[0.18, 0.3, 0.18]}>
          <sphereGeometry args={[0.13, 10, 10]} />
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
        {/* Mouth line */}
        <mesh position={[0, 0.02, 0.35]} scale={[0.8, 0.08, 0.1]}>
          <boxGeometry args={[0.4, 0.02, 0.02]} />
          <meshStandardMaterial color="#3a6a3a" />
        </mesh>
        {/* Front legs */}
        <mesh position={[-0.28, -0.18, 0.25]} rotation={[0.4, 0, 0.3]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.28, -0.18, 0.25]} rotation={[0.4, 0, -0.3]}>
          <cylinderGeometry args={[0.05, 0.04, 0.25, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Front feet */}
        <mesh position={[-0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Hind legs - folded */}
        <mesh position={[-0.3, -0.1, -0.1]} rotation={[0.6, 0, 0.8]} scale={[1, 1, 1.2]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.3, -0.1, -0.1]} rotation={[0.6, 0, -0.8]} scale={[1, 1, 1.2]}>
          <cylinderGeometry args={[0.06, 0.05, 0.3, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Hind feet */}
        <mesh position={[-0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Warts/bumps */}
        {[[0.15, 0.1, -0.2], [-0.1, 0.15, -0.15], [0.2, 0.05, 0.05]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#4a7a4a" roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }
  
  if (type === "snail") {
    return (
      <group>
        {/* Shell - main */}
        <mesh position={[0, 0.25, -0.1]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Shell spiral details */}
        <mesh position={[0.08, 0.35, -0.15]} scale={[0.8, 0.8, 0.8]}>
          <torusGeometry args={[0.15, 0.06, 8, 16, Math.PI * 1.5]} />
          <meshStandardMaterial color="#c0a878" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.3, -0.12]} scale={[0.5, 0.5, 0.5]}>
          <torusGeometry args={[0.1, 0.04, 8, 12, Math.PI * 1.8]} />
          <meshStandardMaterial color="#d0b888" roughness={0.5} />
        </mesh>
        {/* Shell stripes */}
        {[0, 0.7, 1.4, 2.1].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.25, 0.25 + Math.sin(a) * 0.15, -0.1]} rotation={[0, a, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
            <meshStandardMaterial color="#a08858" />
          </mesh>
        ))}
        {/* Body */}
        <mesh position={[0, -0.08, 0.15]} scale={[0.7, 0.4, 1.5]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial color="#a09080" roughness={0.8} />
        </mesh>
        {/* Body extension (head part) */}
        <mesh position={[0, 0.0, 0.4]} scale={[0.5, 0.35, 0.6]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#a09080" roughness={0.8} />
        </mesh>
        {/* Eye stalks */}
        <mesh position={[-0.07, 0.18, 0.45]} rotation={[0.6, 0, 0.1]}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 6]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        <mesh position={[0.07, 0.18, 0.45]} rotation={[0.6, 0, -0.1]}>
          <cylinderGeometry args={[0.018, 0.018, 0.22, 6]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.08, 0.28, 0.53]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.08, 0.28, 0.53]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {/* Smaller tentacles */}
        <mesh position={[-0.04, 0.08, 0.48]} rotation={[0.8, 0, 0.15]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 4]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        <mesh position={[0.04, 0.08, 0.48]} rotation={[0.8, 0, -0.15]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12, 4]} />
          <meshStandardMaterial color="#a09080" />
        </mesh>
        {/* Slime trail */}
        <mesh position={[0, -0.15, -0.25]} scale={[0.3, 0.02, 0.8]}>
          <boxGeometry args={[0.3, 0.01, 1]} />
          <meshStandardMaterial color="#b8b0a0" transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  if (type === "lizard") {
    return (
      <group>
        {/* Body */}
        <mesh position={[0, 0, 0]} scale={[0.55, 0.35, 1.3]}>
          <sphereGeometry args={[0.3, 14, 14]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Body pattern (darker stripe) */}
        <mesh position={[0, 0.1, 0]} scale={[0.15, 0.08, 1.2]}>
          <boxGeometry args={[0.3, 0.1, 0.6]} />
          <meshStandardMaterial color="#4a6a3a" roughness={0.8} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.06, 0.4]} scale={[0.8, 0.55, 0.9]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Snout */}
        <mesh position={[0, 0.04, 0.55]} scale={[0.5, 0.35, 0.6]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.12, 0.48]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.1, 0.12, 0.48]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.4} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        <mesh position={[0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial {...darkMat} />
        </mesh>
        {/* Legs - 4 */}
        {[
          { pos: [-0.18, -0.1, 0.15], rot: [0, 0, 0.7] },
          { pos: [0.18, -0.1, 0.15], rot: [0, 0, -0.7] },
          { pos: [-0.18, -0.1, -0.15], rot: [0, 0, 0.7] },
          { pos: [0.18, -0.1, -0.15], rot: [0, 0, -0.7] },
        ].map((leg, i) => (
          <group key={i}>
            <mesh position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
              <cylinderGeometry args={[0.03, 0.025, 0.2, 6]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[leg.pos[0] + (leg.pos[0] > 0 ? 0.08 : -0.08), leg.pos[1] - 0.1, leg.pos[2] + 0.03]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        ))}
        {/* Tail - long and tapered */}
        <mesh position={[0, -0.02, -0.45]} rotation={[0.1, 0, 0]} scale={[0.2, 0.15, 1.8]}>
          <cylinderGeometry args={[0.08, 0.01, 0.5, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Tail continuation */}
        <mesh position={[0.05, -0.04, -0.75]} rotation={[0.05, 0.3, 0]} scale={[0.12, 0.1, 1]}>
          <cylinderGeometry args={[0.04, 0.005, 0.3, 6]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Scales on back */}
        {[-0.15, 0, 0.15].map((z, i) => (
          <mesh key={i} position={[0, 0.12, z]} scale={[0.3, 0.1, 0.15]}>
            <coneGeometry args={[0.06, 0.06, 4]} />
            <meshStandardMaterial color="#5a7a4a" roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }
  
  // Fallback sphere
  return (
    <mesh>
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  );
}

// ─── Animated Story Creature ────────────────────────────────────────────────

function StoryCreature({ 
  creature, 
  onSelect 
}: { 
  creature: typeof CREATURES[number];
  onSelect: (creature: typeof CREATURES[number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const offset = creature.position[0] * 0.5;
    
    if (groupRef.current) {
      // Gentle breathing bob
      groupRef.current.position.y = creature.position[1] + Math.sin(t * 0.6 + offset) * 0.12;
      // Subtle body sway
      groupRef.current.rotation.z = Math.sin(t * 0.4 + offset) * 0.03;
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
      <CreatureBody type={creature.geometry} color={creature.color} emissive={creature.emissive} />
      
      {/* Name label floating above */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={8}
        style={{ pointerEvents: "none" }}
        zIndexRange={[0, 0]}
      >
        <div style={{
          background: "rgba(0,0,0,0.55)",
          color: "#fff",
          padding: "3px 10px",
          borderRadius: "10px",
          fontSize: "10px",
          fontFamily: "Georgia, serif",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}>
          {creature.name}
        </div>
      </Html>
      
      {/* Subtle glow underneath */}
      <pointLight position={[0, -0.3, 0]} intensity={0.25} color={creature.color} distance={5} />
    </group>
  );
}

// ─── Main 3D Scene ──────────────────────────────────────────────────────────

function Scene({ offerings, onSelectOffering, onSelectCreature }: GalleryRoomProps & { onSelectCreature: (c: typeof CREATURES[number]) => void }) {
  const positions = useMemo(() => {
    const backSlots = { count: 0 };
    const leftSlots = { count: 0 };
    const rightSlots = { count: 0 };
    
    return offerings.map((o, i) => {
      const wall = i % 3;
      const seed = o.id.charCodeAt(0) * 100 + i;
      const tilt = (seededRandom(seed) - 0.5) * 0.2;
      const yJitter = (seededRandom(seed + 1) - 0.5) * 1.2;
      
      if (wall === 0) {
        const slot = backSlots.count++;
        const x = (slot - 2) * 3.5 + (seededRandom(seed + 2) - 0.5) * 0.8;
        return {
          position: [x, 1 + yJitter, -17.8] as [number, number, number],
          rotation: [0, 0, tilt] as [number, number, number]
        };
      } else if (wall === 1) {
        const slot = leftSlots.count++;
        const z = (slot - 1) * 3.5 + (seededRandom(seed + 3) - 0.5) * 0.8;
        return {
          position: [-17.8, 1 + yJitter, z] as [number, number, number],
          rotation: [0, Math.PI / 2, tilt] as [number, number, number]
        };
      } else {
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
      
      {CREATURES.map((creature) => (
        <StoryCreature
          key={creature.name}
          creature={creature}
          onSelect={onSelectCreature}
        />
      ))}
      
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
        minDistance={1}
        maxDistance={30}
        maxPolarAngle={Math.PI * 0.75}
        target={[0, 1, 0]}
        zoomSpeed={1.5}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial color="#d4c4b0" wireframe />
    </mesh>
  );
}

// ─── Modals ─────────────────────────────────────────────────────────────────

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

          {offering.media_type === "video" && offering.file_url && (
            <div className="mb-4 bg-muted rounded overflow-hidden">
              <video 
                src={offering.file_url}
                controls
                className="max-w-full h-auto"
              />
            </div>
          )}

          {offering.media_type === "audio" && offering.file_url && (
            <div className="mb-4">
              <audio src={offering.file_url} controls className="w-full" />
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

// ─── Demo fallback data ─────────────────────────────────────────────────────

const DEMO_OFFERINGS: Offering[] = [
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
    file_url: "/cavapendoli/models-a.png",
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
    file_url: "/cavapendoli/models-b.png",
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
    file_url: "/cavapendoli/models-bw.png",
    link_url: null,
    author_name: "Luca",
    author_type: "name",
    created_at: "2024-01-20",
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────

function CavapendoGallery({ className = "" }: { className?: string }) {
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedCreature, setSelectedCreature] = useState<typeof CREATURES[number] | null>(null);

  // Fetch approved offerings from database
  const { data: liveOfferings } = useQuery({
    queryKey: ["gallery-offerings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("id, title, note, text_content, media_type, file_url, link_url, author_name, author_type, created_at")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(16);
      if (error) throw error;
      if (!data?.length) return null;
      return withSignedFileUrls(data);
    },
    staleTime: 5 * 60 * 1000,
  });

  const offerings = liveOfferings && liveOfferings.length > 0 ? liveOfferings : DEMO_OFFERINGS;

  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`} style={{ height: "100%", minHeight: "600px", isolation: "isolate" }}>
      <Canvas
        camera={{ position: [0, 1, 12], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        style={{ background: "linear-gradient(180deg, #f5f0e8 0%, #e0d8d0 100%)", width: "100%", height: "100%", position: "relative", zIndex: 0 }}
        shadows
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene 
            offerings={offerings}
            onSelectOffering={setSelectedOffering}
            onSelectCreature={setSelectedCreature}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
        <div className="bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md border border-border/20">
          <p className="font-mono-light text-xs text-muted-foreground">
            🖱️ Trascina per ruotare • Zoom con scroll • Clicca un quadro o una creatura
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
      
      {/* Creature story modal */}
      <AnimatePresence>
        {selectedCreature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedCreature(null)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-sm w-full bg-background p-8 rounded-lg shadow-2xl border border-border/30 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedCreature(null)}
                className="absolute top-3 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
              <div 
                className="w-4 h-4 rounded-full mx-auto mb-3" 
                style={{ backgroundColor: selectedCreature.color, boxShadow: `0 0 12px ${selectedCreature.color}` }}
              />
              <h3 className="text-xl font-serif text-foreground mb-3">
                {selectedCreature.name}
              </h3>
              <p className="text-base italic text-foreground/80 font-serif leading-relaxed">
                {selectedCreature.story}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CavapendoGallery;
