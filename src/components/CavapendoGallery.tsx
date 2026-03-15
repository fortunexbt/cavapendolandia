import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Sparkles, Environment } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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

const OFFERING_COLORS = [
  "#8b7355",
  "#a08060", 
  "#9a8468",
  "#7a6350",
  "#b09070",
  "#6a5545",
];

// Simple frame component - no Text, just geometry
function SimpleFrame({ 
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
  const colorIndex = offering.id.charCodeAt(0) % OFFERING_COLORS.length;
  
  return (
    <group position={position} rotation={rotation}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
        <mesh onClick={onClick}>
          {/* Main frame */}
          <boxGeometry args={[1.2, 1.5, 0.1]} />
          <meshStandardMaterial 
            color={OFFERING_COLORS[colorIndex]}
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
        
        {/* Inner canvas */}
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[1, 1.3, 0.02]} />
          <meshStandardMaterial 
            color="#f8f5ef"
            roughness={0.9}
          />
        </mesh>
        
        {/* Content indicator */}
        {offering.media_type === "text" && (
          <mesh position={[0, 0.1, 0.08]}>
            <boxGeometry args={[0.6, 0.8, 0.01]} />
            <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
          </mesh>
        )}
        {offering.media_type === "image" && (
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.8, 0.8, 0.01]} />
            <meshStandardMaterial color="#d4c4b0" roughness={0.85} />
          </mesh>
        )}
        {offering.media_type === "link" && (
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.7, 0.5, 0.01]} />
            <meshStandardMaterial color="#c4b4a0" roughness={0.85} />
          </mesh>
        )}
      </Float>
    </group>
  );
}

// Gallery room with walls and floor
function GalleryRoom() {
  return (
    <group>
      {/* Floor - warm wood color */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.9} />
      </mesh>
      
      {/* Back wall */}
      <mesh position={[0, 4, -15]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.95} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-15, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[15, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.95} />
      </mesh>
    </group>
  );
}

// Ambient particles floating in the room
function AmbientDust() {
  return (
    <Sparkles
      count={150}
      scale={30}
      size={1.2}
      speed={0.2}
      color="#c9b896"
      opacity={0.3}
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
          position: [(posOnWall - 2.5) * 3.5, 0.5 + (i % 2) * 0.3, -12] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number]
        };
      } else if (wall === 1) { // Left wall
        return {
          position: [-12, 0.5 + (posOnWall % 2) * 0.3, (posOnWall - 1.5) * 3] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number]
        };
      } else if (wall === 2) { // Right wall  
        return {
          position: [12, 0.5 + (posOnWall % 2) * 0.3, (posOnWall - 1.5) * 3] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number]
        };
      } else { // Floating in center
        return {
          position: [
            (Math.random() - 0.5) * 8,
            Math.random() * 2 - 0.5,
            (Math.random() - 0.5) * 6
          ] as [number, number, number],
          rotation: [
            Math.random() * 0.3,
            Math.random() * Math.PI,
            Math.random() * 0.3
          ] as [number, number, number]
        };
      }
    });
  }, [offerings]);

  if (reduceMotion) return null;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[8, 12, 8]} 
        intensity={0.7} 
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#e8dcd0" />
      <pointLight position={[-8, 2, 4]} intensity={0.25} color="#d4c4b0" />
      
      {/* Environment for subtle reflections */}
      <Environment preset="apartment" />
      
      {/* Room structure */}
      <GalleryRoom />
      
      {/* Offerings as frames */}
      {offerings.slice(0, 16).map((offering, i) => {
        const pos = positions[i];
        return (
          <SimpleFrame
            key={offering.id}
            offering={offering}
            position={pos.position}
            rotation={pos.rotation}
            onClick={() => onSelectOffering(offering)}
          />
        );
      })}
      
      {/* Ambient particles */}
      <AmbientDust />
      
      {/* Atmospheric fog */}
      <fog attach="fog" args={["#f5f0e8", 10, 40]} />
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI * 0.8}
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
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
  
  // Demo offerings - in production, fetch from Supabase
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

  const handleSelect = (offering: Offering) => {
    setSelectedOffering(offering);
  };

  const handleClose = () => {
    setSelectedOffering(null);
  };

  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`} style={{ height: "100%", minHeight: "600px" }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        style={{ background: "linear-gradient(180deg, #f5f0e8 0%, #e8e0d5 100%)", width: "100%", height: "100%" }}
        shadows
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene 
            offerings={demoOfferings}
            onSelectOffering={handleSelect}
          />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay - instructions */}
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
      
      {/* Detail Modal */}
      <OfferingModal 
        offering={selectedOffering}
        onClose={handleClose}
      />
    </div>
  );
}

export default CavapendoGallery;