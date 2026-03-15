import { Suspense, useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Stars } from "@react-three/drei";
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

// Main 3D Scene
function Scene({ offerings, onSelectOffering }: GalleryRoomProps) {
  const reduceMotion = useReducedMotion();
  
  // Calculate positions for offerings
  const positions = useMemo(() => {
    return offerings.map((_, i) => {
      const wall = i % 4;
      const posOnWall = Math.floor(i / 4);
      
      if (wall === 0) { // Back wall
        return {
          position: [(posOnWall - 2.5) * 4, 0.8 + (i % 2) * 0.4, -15] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        };
      } else if (wall === 1) { // Left wall
        return {
          position: [-15, 0.8 + (posOnWall % 2) * 0.4, (posOnWall - 1.5) * 3.5] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number]
        };
      } else if (wall === 2) { // Right wall  
        return {
          position: [15, 0.8 + (posOnWall % 2) * 0.4, (posOnWall - 1.5) * 3.5] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number]
        };
      } else { // Floating in center
        return {
          position: [
            (Math.random() - 0.5) * 10,
            Math.random() * 2.5 - 0.5,
            (Math.random() - 0.5) * 8 - 3
          ] as [number, number, number],
          rotation: [
            Math.random() * 0.2,
            Math.random() * Math.PI,
            Math.random() * 0.2
          ] as [number, number, number]
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