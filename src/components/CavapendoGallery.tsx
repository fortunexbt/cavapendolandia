import { Suspense, useMemo, useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sparkles, Environment, Stars, Html, type OrbitControlsChangeEvent } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as THREE from "three";
import { supabase } from "@/integrations/supabase/client";
import { withSignedFileUrls } from "@/lib/offeringMedia";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  approved_at?: string | null;
}

// ─── Audio System ───────────────────────────────────────────────────────────
// Strategy: check Supabase Storage for cached .mp3 first → only call ElevenLabs
// if not cached → upload result to storage → sequential loading with long gaps.

const SFX_PROMPTS: Record<string, string> = {
  seahorse: "gentle underwater bubbling ambient loop, soft water currents, calming aquatic atmosphere",
  owl: "quiet nighttime crickets and distant owl hooting, peaceful nocturnal forest ambience",
  cat: "soft cat purring ambient loop, gentle and soothing, rhythmic breathing",
  frog: "gentle frog croaking near a pond, water dripping, quiet swamp ambience at dusk",
  lizard: "rustling dry leaves and twigs, warm sun on rocks, gentle desert wind",
  snail: "soft wind through grass, very quiet rain drops on leaves, dewy morning atmosphere",
  room: "large empty museum hall reverberant drone, distant footsteps echo, hushed quiet space",
  whisper: "very quiet page turning sounds, paper rustling, hushed library whispers",
};

const AUDIO_BUCKET = "offerings"; // reuse existing public bucket
const AUDIO_PREFIX = "gallery-sfx";

async function fetchCachedAudio(key: string): Promise<string | null> {
  const path = `${AUDIO_PREFIX}/${key}.mp3`;
  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) return null;

  // Check if file actually exists with a HEAD request
  try {
    const resp = await fetch(data.publicUrl, { method: "HEAD" });
    if (resp.ok) return data.publicUrl;
  } catch { /* not cached yet */ }
  return null;
}

async function generateAndCache(key: string): Promise<string | null> {
  const prompt = SFX_PROMPTS[key];
  if (!prompt) return null;

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ambient-sfx`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ prompt, duration: 10 }),
  });

  if (!response.ok) {
    console.warn(`[SFX] Generation failed for "${key}": ${response.status}`);
    return null;
  }

  const blob = await response.blob();

  // Upload to storage for future cache hits
  const path = `${AUDIO_PREFIX}/${key}.mp3`;
  await supabase.storage.from(AUDIO_BUCKET).upload(path, blob, {
    contentType: "audio/mpeg",
    upsert: true,
  });

  return URL.createObjectURL(blob);
}

function useAmbientAudio(audioEnabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<Map<string, { audio: HTMLAudioElement; gain: GainNode }>>(new Map());
  const abortRef = useRef(false);

  const getAudio = useCallback(async (key: string): Promise<string | null> => {
    // 1. Try storage cache
    const cached = await fetchCachedAudio(key);
    if (cached) return cached;

    // 2. Generate (only if not cached) — single attempt, fail gracefully
    return generateAndCache(key);
  }, []);

  const playSource = useCallback(async (key: string, volume: number) => {
    if (!audioContextRef.current || !masterGainRef.current) return;
    if (sourcesRef.current.has(key)) return;

    const blobUrl = await getAudio(key);
    if (!blobUrl || abortRef.current) return;

    const audio = new Audio(blobUrl);
    audio.loop = true;
    audio.crossOrigin = "anonymous";

    const ctx = audioContextRef.current;
    const source = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(gain).connect(masterGainRef.current);

    sourcesRef.current.set(key, { audio, gain });

    try {
      await audio.play();
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
    } catch {
      sourcesRef.current.delete(key);
    }
  }, [getAudio]);

  useEffect(() => {
    if (audioEnabled) {
      abortRef.current = false;

      if (!audioContextRef.current) {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;
        const master = ctx.createGain();
        master.gain.value = 0.6;
        master.connect(ctx.destination);
        masterGainRef.current = master;
      }

      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }

      // Load sequentially with long gaps to avoid rate limits.
      // Cached sounds load instantly; only uncached ones hit the API.
      const allSounds: { key: string; vol: number }[] = [
        { key: "room", vol: 0.15 },
        { key: "seahorse", vol: 0.08 },
        { key: "owl", vol: 0.08 },
        { key: "cat", vol: 0.08 },
        { key: "frog", vol: 0.08 },
        { key: "lizard", vol: 0.08 },
        { key: "snail", vol: 0.08 },
        { key: "whisper", vol: 0.05 },
      ];

      // Sequential loader — one at a time, 12s gap between API calls
      (async () => {
        for (const { key, vol } of allSounds) {
          if (abortRef.current) break;
          const wasCached = !!(await fetchCachedAudio(key));
          await playSource(key, vol);
          // Only wait between sounds if the previous one wasn't cached
          // (meaning we likely hit the API)
          if (!wasCached && !abortRef.current) {
            await new Promise((r) => setTimeout(r, 12000));
          }
        }
      })();
    } else {
      abortRef.current = true;
      sourcesRef.current.forEach(({ audio, gain }) => {
        if (audioContextRef.current) {
          gain.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
        }
        setTimeout(() => audio.pause(), 1200);
      });
    }
  }, [audioEnabled, playSource]);

  useEffect(() => {
    return () => {
      abortRef.current = true;
      sourcesRef.current.forEach(({ audio }) => {
        audio.pause();
        audio.src = "";
      });
      sourcesRef.current.clear();
      audioContextRef.current?.close();
    };
  }, []);
}

// ─── Room Boundary Constants ────────────────────────────────────────────────

const ROOM_HALF = 18;
const CAM_BOUND = 16;       // camera.position clamped here
const TARGET_BOUND = 14;    // orbit target clamped here
const CAM_Y_MIN = -2;
const CAM_Y_MAX = 8;
const TARGET_Y_MIN = -2;
const TARGET_Y_MAX = 7;

function clampVec3(v: THREE.Vector3, xBound: number, yMin: number, yMax: number, zBound: number) {
  v.x = THREE.MathUtils.clamp(v.x, -xBound, xBound);
  v.y = THREE.MathUtils.clamp(v.y, yMin, yMax);
  v.z = THREE.MathUtils.clamp(v.z, -xBound, zBound);
}

function clampInsideRoom(camera: THREE.Camera, controls: any) {
  if (controls?.target) {
    clampVec3(controls.target, TARGET_BOUND, TARGET_Y_MIN, TARGET_Y_MAX, TARGET_BOUND);
  }
  clampVec3(camera.position, CAM_BOUND, CAM_Y_MIN, CAM_Y_MAX, CAM_BOUND);
}

// useFrame guard that runs every frame to enforce boundaries
function BoundsGuard({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  const { camera } = useThree();
  useFrame(() => {
    clampInsideRoom(camera, controlsRef.current);
  });
  return null;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const FRAME_COLORS = [
  "#6b5b4b", "#8b7355", "#7a6250", "#5b4b3b", "#9b8365", "#4b3b2b",
];

// ─── Fly-to-frame camera controller ────────────────────────────────────────

interface CameraTarget {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

function CameraController({
  target,
  onArrived,
}: {
  target: CameraTarget | null;
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const arrivedRef = useRef(false);
  const startPosRef = useRef(new THREE.Vector3());
  const startLookRef = useRef(new THREE.Vector3());
  const progressRef = useRef(0);
  const currentLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    if (target) {
      startPosRef.current.copy(camera.position);
      startLookRef.current.copy(currentLookAt.current);
      progressRef.current = 0;
      arrivedRef.current = false;
    }
  }, [target, camera]);

  useFrame((_, delta) => {
    if (!target) return;
    if (arrivedRef.current) return;

    progressRef.current = Math.min(1, progressRef.current + delta * 1.2);
    const t = easeInOutCubic(progressRef.current);

    camera.position.lerpVectors(startPosRef.current, target.position, t);
    currentLookAt.current.lerpVectors(startLookRef.current, target.lookAt, t);
    camera.lookAt(currentLookAt.current);

    if (progressRef.current >= 1 && !arrivedRef.current) {
      arrivedRef.current = true;
      onArrived();
    }
  });

  return null;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Frame sizing ───────────────────────────────────────────────────────────

function getFrameSize(offering: Offering): { w: number; h: number } {
  const type = offering.media_type;
  const textLen = offering.text_content?.length || 0;
  if (type === "text") {
    if (textLen > 200) return { w: 2.0, h: 2.4 };
    if (textLen > 100) return { w: 1.6, h: 2.0 };
    return { w: 1.4, h: 1.6 };
  }
  if (type === "image") return { w: 1.8, h: 2.2 };
  if (type === "video") return { w: 2.2, h: 1.6 };
  if (type === "audio") return { w: 1.6, h: 1.2 };
  if (type === "link") return { w: 1.2, h: 1.0 };
  if (type === "pdf") return { w: 1.4, h: 1.8 };
  return { w: 1.4, h: 1.7 };
}

// ─── Artistic Frame ─────────────────────────────────────────────────────────

function ArtisticFrame({
  offering,
  position,
  rotation = [0, 0, 0],
  onClick,
}: {
  offering: Offering;
  position: [number, number, number];
  rotation?: [number, number, number];
  onClick: () => void;
}) {
  const colorIndex = offering.id.charCodeAt(0) % FRAME_COLORS.length;
  const { w, h } = getFrameSize(offering);
  const border = 0.12;
  const innerW = w - border * 2;
  const innerH = h - border * 2;
  const canvasW = innerW - 0.1;
  const canvasH = innerH - 0.1;
  const pxW = Math.round(canvasW * 140);
  const pxH = Math.round(canvasH * 140);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position} rotation={rotation}>
      {/* Hit area — must be OUTSIDE the Html group to sit on top in the raycaster */}
      <mesh
        position={[0, 0, 0.25]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[w + 0.4, h + 0.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <group>

        {/* Outer frame */}
        <mesh>
          <boxGeometry args={[w, h, 0.12]} />
          <meshStandardMaterial
            color={FRAME_COLORS[colorIndex]}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>

        {/* Inner frame */}
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[innerW, innerH, 0.02]} />
          <meshStandardMaterial color="#4a3a2a" roughness={0.8} />
        </mesh>

        {/* Canvas */}
        <mesh position={[0, 0, 0.09]}>
          <boxGeometry args={[canvasW, canvasH, 0.01]} />
          <meshStandardMaterial color="#f5f0e8" roughness={0.95} />
        </mesh>

        {/* Inline media */}
        <Html
          position={[0, 0, 0.11]}
          transform
          distanceFactor={4}
          pointerEvents="none"
          style={{
            width: `${pxW}px`,
            height: `${pxH}px`,
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
          <FrameContent offering={offering} pxW={pxW} pxH={pxH} />
        </Html>

        {/* Pin */}
        <mesh position={[0, h / 2, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Hover glow */}
        {hovered && (
          <pointLight position={[0, 0, 1.5]} intensity={0.4} color="#fff5e0" distance={4} />
        )}
      </group>
    </group>
  );
}

// ─── Frame Content ──────────────────────────────────────────────────────────

function FrameContent({ offering, pxW, pxH }: { offering: Offering; pxW: number; pxH: number }) {
  if (offering.media_type === "text" && offering.text_content) {
    const fontSize = Math.max(9, Math.min(13, pxH / 18));
    return (
      <div style={{
        padding: "10px", fontFamily: "Georgia, serif", fontSize: `${fontSize}px`,
        lineHeight: "1.5", color: "#2a2a2a", textAlign: "center", fontStyle: "italic",
        wordBreak: "break-word", width: `${pxW}px`, height: `${pxH}px`, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {offering.text_content.length > Math.floor(pxW * pxH / 80)
          ? offering.text_content.slice(0, Math.floor(pxW * pxH / 80)) + "…"
          : offering.text_content}
      </div>
    );
  }
  if (offering.media_type === "image" && offering.file_url) {
    return (
      <img src={offering.file_url} alt={offering.title || "Immagine"}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "2px" }}
        crossOrigin="anonymous" />
    );
  }
  if (offering.media_type === "video" && offering.file_url) {
    return (
      <video src={offering.file_url} autoPlay muted loop playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        crossOrigin="anonymous" />
    );
  }
  if (offering.media_type === "audio" && offering.file_url) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "8px", padding: "16px", pointerEvents: "auto" }}>
        <div style={{ fontSize: "28px" }}>🎵</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "10px", color: "#5a5a5a", textAlign: "center" }}>
          {offering.title || "Audio"}
        </div>
        <audio src={offering.file_url} controls style={{ width: "140px", height: "28px" }} crossOrigin="anonymous" />
      </div>
    );
  }
  if (offering.media_type === "link" && offering.link_url) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "6px", padding: "16px", fontFamily: "Georgia, serif", textAlign: "center" }}>
        <div style={{ fontSize: "24px" }}>🔗</div>
        <div style={{ fontSize: "10px", color: "#5a5a5a", wordBreak: "break-all" }}>
          {offering.link_url.replace(/^https?:\/\//, "").slice(0, 40)}
        </div>
      </div>
    );
  }
  if (offering.media_type === "pdf") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "6px", padding: "16px", fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: "28px" }}>📄</div>
        <div style={{ fontSize: "10px", color: "#5a5a5a", textAlign: "center" }}>{offering.title || "PDF"}</div>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", color: "#8a8a8a",
      textAlign: "center", fontStyle: "italic", padding: "16px" }}>
      {offering.title || "Cavapendolata"}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ─── Procedural Textures ────────────────────────────────────────────────────

function useStuccoTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Base warm plaster
    ctx.fillStyle = "#e8ddd0";
    ctx.fillRect(0, 0, size, size);
    // Noise grain
    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const brightness = 180 + Math.random() * 60;
      const alpha = 0.15 + Math.random() * 0.15;
      ctx.fillStyle = `rgba(${brightness}, ${brightness - 10}, ${brightness - 25}, ${alpha})`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    // Subtle cracks / veins
    ctx.strokeStyle = "rgba(160, 140, 120, 0.08)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * size, Math.random() * size);
      ctx.lineTo(Math.random() * size, Math.random() * size);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 2);
    return tex;
  }, []);
}

function useTileTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const tileSize = 64;
    const cols = size / tileSize;
    const rows = size / tileSize;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hue = 18 + Math.random() * 8;
        const sat = 30 + Math.random() * 15;
        const light = 55 + Math.random() * 12;
        ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        ctx.fillRect(c * tileSize + 1, r * tileSize + 1, tileSize - 2, tileSize - 2);
      }
    }
    // Grout lines
    ctx.fillStyle = "#b0a89a";
    for (let r = 0; r <= rows; r++) {
      ctx.fillRect(0, r * tileSize - 1, size, 2);
    }
    for (let c = 0; c <= cols; c++) {
      ctx.fillRect(c * tileSize - 1, 0, 2, size);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 6);
    return tex;
  }, []);
}

function useWoodTexture() {
  return useMemo(() => {
    const w = 256, h = 64;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#5a3a1a";
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) {
      const alpha = 0.05 + Math.random() * 0.1;
      const bright = Math.random() > 0.5 ? 255 : 0;
      ctx.fillStyle = `rgba(${bright}, ${bright}, ${bright}, ${alpha})`;
      ctx.fillRect(0, y, w, 1);
    }
    // Knots
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(40, 20, 5, 0.3)";
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
  }, []);
}

// ─── Architectural Components ───────────────────────────────────────────────

function WoodenRoof({ woodTex }: { woodTex: THREE.Texture }) {
  const ROOM_W = 36;
  const ROOM_D = 36;
  const beamCount = 6;
  const beamSpacing = ROOM_D / (beamCount + 1);

  return (
    <group>
      {/* Ceiling plane — warm terracotta */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial color="#d4b896" roughness={0.95} />
      </mesh>

      {/* Main beams spanning left-right */}
      {Array.from({ length: beamCount }).map((_, i) => {
        const z = -ROOM_D / 2 + beamSpacing * (i + 1);
        return (
          <mesh key={`beam-${i}`} position={[0, 9.6, z]}>
            <boxGeometry args={[ROOM_W, 0.5, 0.4]} />
            <meshStandardMaterial map={woodTex} color="#5a3a1a" roughness={0.9} metalness={0.05} />
          </mesh>
        );
      })}

      {/* Two ridge beams (front-back) */}
      {[-ROOM_W / 4, ROOM_W / 4].map((x, i) => (
        <mesh key={`ridge-${i}`} position={[x, 9.3, 0]}>
          <boxGeometry args={[0.35, 0.4, ROOM_D]} />
          <meshStandardMaterial map={woodTex} color="#4a2a10" roughness={0.9} metalness={0.05} />
        </mesh>
      ))}

      {/* Bracket wedges where beams meet walls */}
      {Array.from({ length: beamCount }).map((_, i) => {
        const z = -ROOM_D / 2 + beamSpacing * (i + 1);
        return [-1, 1].map((side) => (
          <mesh
            key={`bracket-${i}-${side}`}
            position={[side * (ROOM_W / 2 - 0.6), 9.1, z]}
            rotation={[0, 0, side * 0.3]}
          >
            <boxGeometry args={[0.6, 0.3, 0.35]} />
            <meshStandardMaterial map={woodTex} color="#4a2a10" roughness={0.85} />
          </mesh>
        ));
      })}
    </group>
  );
}

function StonePillars() {
  const ROOM_W = 36;
  const ROOM_D = 36;
  const hw = ROOM_W / 2 - 0.5;
  const hd = ROOM_D / 2 - 0.5;
  const pillarPositions: [number, number, number][] = [
    [-hw, 3.5, -hd],
    [hw, 3.5, -hd],
    [-hw, 3.5, hd],
    [hw, 3.5, hd],
  ];

  return (
    <group>
      {pillarPositions.map((pos, i) => (
        <group key={`pillar-${i}`}>
          {/* Main column */}
          <mesh position={pos}>
            <cylinderGeometry args={[0.5, 0.6, 13, 8]} />
            <meshStandardMaterial color="#c4b8a8" roughness={0.85} metalness={0.05} />
          </mesh>
          {/* Base */}
          <mesh position={[pos[0], -2.8, pos[2]]}>
            <boxGeometry args={[1.4, 0.5, 1.4]} />
            <meshStandardMaterial color="#b0a490" roughness={0.9} />
          </mesh>
          {/* Capital */}
          <mesh position={[pos[0], 9.5, pos[2]]}>
            <boxGeometry args={[1.2, 0.6, 1.2]} />
            <meshStandardMaterial color="#b8ac9c" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WallDetails() {
  const ROOM_W = 36;
  const ROOM_D = 36;
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;
  const woodColor = "#4a3020";
  const railY = 4;

  return (
    <group>
      {/* Baseboards */}
      {/* Back */}
      <mesh position={[0, -2.7, -hd + 0.06]}>
        <boxGeometry args={[ROOM_W, 0.3, 0.12]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>
      {/* Left */}
      <mesh position={[-hw + 0.06, -2.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_D, 0.3, 0.12]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>
      {/* Right */}
      <mesh position={[hw - 0.06, -2.7, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_D, 0.3, 0.12]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>
      {/* Front */}
      <mesh position={[0, -2.7, hd - 0.06]}>
        <boxGeometry args={[ROOM_W, 0.3, 0.12]} />
        <meshStandardMaterial color={woodColor} roughness={0.8} />
      </mesh>

      {/* Picture rails */}
      {/* Back */}
      <mesh position={[0, railY, -hd + 0.06]}>
        <boxGeometry args={[ROOM_W, 0.08, 0.06]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>
      {/* Left */}
      <mesh position={[-hw + 0.06, railY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_D, 0.08, 0.06]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>
      {/* Right */}
      <mesh position={[hw - 0.06, railY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_D, 0.08, 0.06]} />
        <meshStandardMaterial color={woodColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ─── Gallery Room ───────────────────────────────────────────────────────────

function GalleryRoom() {
  const stuccoTex = useStuccoTexture();
  const tileTex = useTileTexture();
  const woodTex = useWoodTexture();
  const ROOM_W = 36;
  const ROOM_D = 36;
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;

  return (
    <group>
      {/* Floor — terracotta tiles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[ROOM_W, ROOM_D]} />
        <meshStandardMaterial map={tileTex} bumpMap={tileTex} bumpScale={0.3} roughness={0.85} />
      </mesh>
      {/* Center medallion */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.99, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#c8b090" transparent opacity={0.35} roughness={0.9} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -hd]} receiveShadow>
        <planeGeometry args={[ROOM_W, 14]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-hw, 4, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, 14]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>
      {/* Right wall */}
      <mesh position={[hw, 4, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[ROOM_D, 14]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>

      {/* Front wall — archway: two side panels + lintel */}
      <mesh position={[-hw / 2 - 1.5, 4, hd]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[hw - 3, 14]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>
      <mesh position={[hw / 2 + 1.5, 4, hd]} rotation={[0, Math.PI, 0]} receiveShadow>
        <planeGeometry args={[hw - 3, 14]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>
      {/* Archway lintel */}
      <mesh position={[0, 8, hd]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[6, 6]} />
        <meshStandardMaterial map={stuccoTex} bumpMap={stuccoTex} bumpScale={0.15} roughness={0.95} />
      </mesh>

      <WoodenRoof woodTex={woodTex} />
      <StonePillars />
      <WallDetails />
    </group>
  );
}

// ─── Volumetric Light Shafts ────────────────────────────────────────────────

function LightShaft({ position, targetY = -3, color = "#fff8e8" }: {
  position: [number, number, number];
  targetY?: number;
  color?: string;
}) {
  const height = position[1] - targetY;
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime;
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 0.3 + position[0]) * 0.015;
    }
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] - height / 2, position[2]]}>
      <coneGeometry args={[2.5, height, 16, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function VolumetricLights() {
  return (
    <group>
      <LightShaft position={[-6, 10, -16]} />
      <LightShaft position={[4, 10, -16]} />
      <LightShaft position={[0, 10, -16]} color="#f8f0e0" />
    </group>
  );
}

// ─── Creature Shadow ────────────────────────────────────────────────────────

function CreatureShadow({ position }: { position: [number, number, number] }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], -2.98, position[2]]}>
      <circleGeometry args={[0.6, 16]} />
      <meshBasicMaterial color="#000" transparent opacity={0.12} depthWrite={false} />
    </mesh>
  );
}

// ─── Lighting ───────────────────────────────────────────────────────────────

function GalleryLighting() {
  return (
    <>
      {/* Low ambient — let zones shine */}
      <ambientLight intensity={0.15} color="#f0e8d8" />

      {/* Main directional for shadows */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={0.4}
        color="#fff5e6"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Warm pool — back wall */}
      <spotLight
        position={[0, 9, -14]}
        angle={0.5}
        penumbra={0.9}
        intensity={1.2}
        color="#ffe8c0"
        castShadow
        target-position={[0, 0, -17]}
      />

      {/* Cool zone — entrance */}
      <pointLight position={[0, 6, 14]} intensity={0.4} color="#c8d8f0" distance={20} />

      {/* Frame spotlights — track lighting */}
      <spotLight position={[-8, 8, -16]} angle={0.3} penumbra={0.7} intensity={0.8} color="#fff0d8" castShadow target-position={[-8, 1, -17.8]} />
      <spotLight position={[8, 8, -16]} angle={0.3} penumbra={0.7} intensity={0.8} color="#fff0d8" castShadow target-position={[8, 1, -17.8]} />
      <spotLight position={[-16, 8, -5]} angle={0.3} penumbra={0.7} intensity={0.7} color="#f8e8d0" castShadow target-position={[-17.8, 1, -5]} />
      <spotLight position={[16, 8, -5]} angle={0.3} penumbra={0.7} intensity={0.7} color="#f8e8d0" castShadow target-position={[17.8, 1, -5]} />

      {/* Fill lights */}
      <pointLight position={[-10, 3, 3]} intensity={0.2} color="#e6d6c6" distance={15} />
      <pointLight position={[10, 3, 3]} intensity={0.2} color="#e6d6c6" distance={15} />
      <pointLight position={[0, 0, 0]} intensity={0.15} color="#d6c6b6" distance={12} />
    </>
  );
}

function GalleryDust() {
  return (
    <Sparkles count={200} scale={40} size={1} speed={0.15} color="#c9b896" opacity={0.25} />
  );
}

// ─── Story Creatures ────────────────────────────────────────────────────────

const CREATURES = [
  {
    name: "Cavalluccio Marino",
    story: "«Noi cavallucci siamo i primi cavapendoli: oscilliamo nell'acqua come pendoli viventi. Ogni onda ci spinge, ogni corrente ci tira, ma noi non cadiamo mai.»",
    position: [-8, -1.8, -10] as [number, number, number],
    rotation: [0, 0.6, 0] as [number, number, number],
    color: "#7a9b8a", emissive: "#4a6b5a", geometry: "seahorse" as const, scale: 1.4,
  },
  {
    name: "Gufo Saggio",
    story: "«Di notte conto i cavapendoli che dondolano tra le stelle. Non finiscono mai. E ogni volta che ne conto uno, ne nascono tre nuovi.»",
    position: [10, -0.8, -7] as [number, number, number],
    rotation: [0, -0.9, 0] as [number, number, number],
    color: "#8b7355", emissive: "#5a4a35", geometry: "owl" as const, scale: 1.2,
  },
  {
    name: "Lucertola Sognatrice",
    story: "«Mi fermo al sole e sogno cavapendoli fatti di luce, che oscillano senza ombra. Li vedo solo io, perché ho gli occhi fatti di cristallo.»",
    position: [5, -2.5, 6] as [number, number, number],
    rotation: [-0.1, 1.4, 0] as [number, number, number],
    color: "#6b8b5b", emissive: "#3a5a2b", geometry: "lizard" as const, scale: 1.1,
  },
  {
    name: "Lumaca Filosofa",
    story: "«Ogni cavapendolo è una spirale, come la mia casa. Il tempo gira, mai dritto. Chi ha fretta non troverà mai un cavapendolo.»",
    position: [-6, -2.6, 7] as [number, number, number],
    rotation: [0, 2.3, 0] as [number, number, number],
    color: "#b09878", emissive: "#806848", geometry: "snail" as const, scale: 1.0,
  },
  {
    name: "Gatto Lunare",
    story: "«I cavapendoli migliori appaiono a mezzanotte, quando nessuno guarda. Li catturo con le mie zampe di velluto e li nascondo sotto la luna.»",
    position: [12, -1.6, 3] as [number, number, number],
    rotation: [0, -1.6, 0] as [number, number, number],
    color: "#4a4a5a", emissive: "#2a2a3a", geometry: "cat" as const, scale: 1.3,
  },
  {
    name: "Rana Cantante",
    story: "«Canto per i cavapendoli: cra-cra-pendolo, cra-cra-pendolo… è la mia ninna nanna. Quando smetto di cantare, il mondo si ferma un istante.»",
    position: [-11, -2.2, 1] as [number, number, number],
    rotation: [0, 1.2, 0] as [number, number, number],
    color: "#5a8b5a", emissive: "#2a5b2a", geometry: "frog" as const, scale: 1.0,
  },
];

// ─── Creature Bodies (unchanged from original) ─────────────────────────────

function CreatureBody({ type, color, emissive }: { type: string; color: string; emissive: string }) {
  const matProps = { color, emissive, emissiveIntensity: 0.3, roughness: 0.7, metalness: 0.1 };
  const darkMat = { color: "#222", roughness: 0.4, metalness: 0.2 };

  if (type === "seahorse") {
    return (
      <group>
        <mesh position={[0, 1.0, 0]}><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 1.35, -0.05]} rotation={[0.2, 0, 0]}><coneGeometry args={[0.12, 0.3, 6]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.08, 1.28, -0.02]} rotation={[0.3, 0, 0.4]}><coneGeometry args={[0.06, 0.18, 5]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.08, 1.28, -0.02]} rotation={[0.3, 0, -0.4]}><coneGeometry args={[0.06, 0.18, 5]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.2, 1.0, 0.2]} rotation={[0, 0, -0.4]} scale={[1.8, 0.5, 0.5]}><cylinderGeometry args={[0.05, 0.08, 0.4, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.12, 1.08, 0.25]}><sphereGeometry args={[0.07, 8, 8]} /><meshStandardMaterial color="#e8e0d0" /></mesh>
        <mesh position={[0.14, 1.08, 0.3]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        {[0.55, 0.2, -0.15, -0.45].map((y, i) => (
          <mesh key={i} position={[i * 0.04, y, 0.03 * Math.sin(i)]} scale={[0.7 - i * 0.05, 0.8, 0.6 - i * 0.04]}><sphereGeometry args={[0.3, 12, 12]} /><meshStandardMaterial {...matProps} /></mesh>
        ))}
        {[0.7, 0.4, 0.1, -0.2].map((y, i) => (
          <mesh key={`bump-${i}`} position={[-0.2, y, 0]} rotation={[0, 0, 0.3]}><coneGeometry args={[0.04, 0.12, 4]} /><meshStandardMaterial {...matProps} /></mesh>
        ))}
        <mesh position={[0.15, -0.7, 0]} rotation={[0.3, 0, -0.8]}><torusGeometry args={[0.25, 0.07, 8, 16, Math.PI * 1.3]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.22, 0.3, 0]} rotation={[0, 0, 0.4]} scale={[0.12, 0.8, 0.5]}><coneGeometry args={[0.3, 0.7, 6]} /><meshStandardMaterial {...matProps} transparent opacity={0.6} /></mesh>
        <mesh position={[0.15, 0.45, 0.2]} rotation={[0.5, 0.3, -0.3]} scale={[0.5, 0.3, 0.1]}><sphereGeometry args={[0.2, 8, 8]} /><meshStandardMaterial {...matProps} transparent opacity={0.5} /></mesh>
      </group>
    );
  }

  if (type === "owl") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.9, 1.2, 0.8]}><sphereGeometry args={[0.45, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, -0.05, 0.3]} scale={[0.6, 0.8, 0.3]}><sphereGeometry args={[0.35, 12, 12]} /><meshStandardMaterial color="#a09070" roughness={0.8} /></mesh>
        <mesh position={[0, 0.6, 0.05]}><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 0.58, 0.28]} scale={[1, 1.1, 0.3]}><sphereGeometry args={[0.28, 12, 12]} /><meshStandardMaterial color="#9a8565" roughness={0.9} /></mesh>
        <mesh position={[-0.12, 0.62, 0.32]}><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.6} /></mesh>
        <mesh position={[0.12, 0.62, 0.32]}><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color="#f0e68c" emissive="#f0e68c" emissiveIntensity={0.6} /></mesh>
        <mesh position={[-0.12, 0.62, 0.42]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0.12, 0.62, 0.42]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[-0.25, 0.9, 0]} rotation={[0.1, 0, 0.3]}><coneGeometry args={[0.08, 0.28, 4]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.25, 0.9, 0]} rotation={[0.1, 0, -0.3]}><coneGeometry args={[0.08, 0.28, 4]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 0.5, 0.38]} rotation={[0.4, 0, 0]}><coneGeometry args={[0.05, 0.14, 4]} /><meshStandardMaterial color="#e8a020" /></mesh>
        <mesh position={[-0.4, 0.05, -0.1]} rotation={[0, 0, 0.4]} scale={[0.2, 0.7, 0.5]}><sphereGeometry args={[0.35, 10, 10]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.4, 0.05, -0.1]} rotation={[0, 0, -0.4]} scale={[0.2, 0.7, 0.5]}><sphereGeometry args={[0.35, 10, 10]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#e8a020" /></mesh>
        <mesh position={[0.12, -0.55, 0.15]} scale={[0.5, 0.15, 0.7]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial color="#e8a020" /></mesh>
        {[-0.25, 0, 0.25].map((x, i) => (
          <mesh key={i} position={[x, -0.3, 0.25]} rotation={[0.3, 0, x * 0.5]}><coneGeometry args={[0.03, 0.1, 3]} /><meshStandardMaterial {...matProps} /></mesh>
        ))}
      </group>
    );
  }

  if (type === "cat") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.7, 1, 0.95]}><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, -0.1, 0.2]} scale={[0.5, 0.6, 0.4]}><sphereGeometry args={[0.3, 12, 12]} /><meshStandardMaterial color="#5a5a6a" roughness={0.8} /></mesh>
        <mesh position={[0, 0.6, 0.18]}><sphereGeometry args={[0.3, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 0.52, 0.42]} scale={[0.6, 0.4, 0.5]}><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color="#5a5a6a" roughness={0.8} /></mesh>
        <mesh position={[0, 0.55, 0.47]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial color="#d4707a" /></mesh>
        <mesh position={[-0.18, 0.88, 0.12]} rotation={[0.1, 0, 0.2]}><coneGeometry args={[0.09, 0.2, 4]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.18, 0.88, 0.12]} rotation={[0.1, 0, -0.2]}><coneGeometry args={[0.09, 0.2, 4]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.17, 0.86, 0.15]} rotation={[0.1, 0, 0.2]} scale={[0.6, 0.7, 0.5]}><coneGeometry args={[0.07, 0.14, 4]} /><meshStandardMaterial color="#d4707a" /></mesh>
        <mesh position={[0.17, 0.86, 0.15]} rotation={[0.1, 0, -0.2]} scale={[0.6, 0.7, 0.5]}><coneGeometry args={[0.07, 0.14, 4]} /><meshStandardMaterial color="#d4707a" /></mesh>
        <mesh position={[-0.1, 0.64, 0.4]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.5} /></mesh>
        <mesh position={[0.1, 0.64, 0.4]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial color="#c4e060" emissive="#c4e060" emissiveIntensity={0.5} /></mesh>
        <mesh position={[-0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0.1, 0.64, 0.45]} scale={[0.3, 1, 1]}><sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial {...darkMat} /></mesh>
        {[-1, 1].map((side) =>
          [0, 1, 2].map((i) => (
            <mesh key={`w-${side}-${i}`} position={[side * 0.15, 0.52 + i * 0.02, 0.42]} rotation={[0.1 * (i - 1), 0, side * (0.15 + i * 0.1)]}>
              <cylinderGeometry args={[0.003, 0.002, 0.25, 4]} /><meshStandardMaterial color="#888" />
            </mesh>
          ))
        )}
        <mesh position={[-0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.15, -0.42, 0.3]} scale={[0.35, 0.2, 0.5]}><sphereGeometry args={[0.12, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.15, 0.1, -0.4]} rotation={[0.9, 0.3, 0]} scale={[0.15, 0.15, 1]}><cylinderGeometry args={[0.08, 0.04, 0.8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.3, 0.55, -0.75]}><sphereGeometry args={[0.06, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
      </group>
    );
  }

  if (type === "frog") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[1.1, 0.7, 1]}><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, -0.08, 0.15]} scale={[0.8, 0.5, 0.7]}><sphereGeometry args={[0.3, 12, 12]} /><meshStandardMaterial color="#7aab6a" roughness={0.8} /></mesh>
        <mesh position={[0, 0.12, 0.2]} scale={[0.9, 0.6, 0.8]}><sphereGeometry args={[0.25, 12, 12]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.18, 0.3, 0.18]}><sphereGeometry args={[0.13, 10, 10]} /><meshStandardMaterial color="#e8e8e0" /></mesh>
        <mesh position={[0.18, 0.3, 0.18]}><sphereGeometry args={[0.13, 10, 10]} /><meshStandardMaterial color="#e8e8e0" /></mesh>
        <mesh position={[-0.18, 0.33, 0.28]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0.18, 0.33, 0.28]}><sphereGeometry args={[0.055, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0, 0.02, 0.35]} scale={[0.8, 0.08, 0.1]}><boxGeometry args={[0.4, 0.02, 0.02]} /><meshStandardMaterial color="#3a6a3a" /></mesh>
        <mesh position={[-0.28, -0.18, 0.25]} rotation={[0.4, 0, 0.3]}><cylinderGeometry args={[0.05, 0.04, 0.25, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.28, -0.18, 0.25]} rotation={[0.4, 0, -0.3]}><cylinderGeometry args={[0.05, 0.04, 0.25, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.35, -0.28, 0.32]} scale={[0.6, 0.15, 0.8]}><sphereGeometry args={[0.08, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.3, -0.1, -0.1]} rotation={[0.6, 0, 0.8]} scale={[1, 1, 1.2]}><cylinderGeometry args={[0.06, 0.05, 0.3, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.3, -0.1, -0.1]} rotation={[0.6, 0, -0.8]} scale={[1, 1, 1.2]}><cylinderGeometry args={[0.06, 0.05, 0.3, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.42, -0.22, -0.15]} scale={[0.7, 0.12, 1.2]}><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        {[[0.15, 0.1, -0.2], [-0.1, 0.15, -0.15], [0.2, 0.05, 0.05]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}><sphereGeometry args={[0.035, 6, 6]} /><meshStandardMaterial color="#4a7a4a" roughness={0.9} /></mesh>
        ))}
      </group>
    );
  }

  if (type === "snail") {
    return (
      <group>
        <mesh position={[0, 0.25, -0.1]}><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.08, 0.35, -0.15]} scale={[0.8, 0.8, 0.8]}><torusGeometry args={[0.15, 0.06, 8, 16, Math.PI * 1.5]} /><meshStandardMaterial color="#c0a878" roughness={0.6} /></mesh>
        <mesh position={[0.05, 0.3, -0.12]} scale={[0.5, 0.5, 0.5]}><torusGeometry args={[0.1, 0.04, 8, 12, Math.PI * 1.8]} /><meshStandardMaterial color="#d0b888" roughness={0.5} /></mesh>
        {[0, 0.7, 1.4, 2.1].map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 0.25, 0.25 + Math.sin(a) * 0.15, -0.1]} rotation={[0, a, 0]}><cylinderGeometry args={[0.005, 0.005, 0.3, 4]} /><meshStandardMaterial color="#a08858" /></mesh>
        ))}
        <mesh position={[0, -0.08, 0.15]} scale={[0.7, 0.4, 1.5]}><sphereGeometry args={[0.22, 12, 12]} /><meshStandardMaterial color="#a09080" roughness={0.8} /></mesh>
        <mesh position={[0, 0.0, 0.4]} scale={[0.5, 0.35, 0.6]}><sphereGeometry args={[0.18, 10, 10]} /><meshStandardMaterial color="#a09080" roughness={0.8} /></mesh>
        <mesh position={[-0.07, 0.18, 0.45]} rotation={[0.6, 0, 0.1]}><cylinderGeometry args={[0.018, 0.018, 0.22, 6]} /><meshStandardMaterial color="#a09080" /></mesh>
        <mesh position={[0.07, 0.18, 0.45]} rotation={[0.6, 0, -0.1]}><cylinderGeometry args={[0.018, 0.018, 0.22, 6]} /><meshStandardMaterial color="#a09080" /></mesh>
        <mesh position={[-0.08, 0.28, 0.53]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0.08, 0.28, 0.53]}><sphereGeometry args={[0.035, 8, 8]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[-0.04, 0.08, 0.48]} rotation={[0.8, 0, 0.15]}><cylinderGeometry args={[0.01, 0.01, 0.12, 4]} /><meshStandardMaterial color="#a09080" /></mesh>
        <mesh position={[0.04, 0.08, 0.48]} rotation={[0.8, 0, -0.15]}><cylinderGeometry args={[0.01, 0.01, 0.12, 4]} /><meshStandardMaterial color="#a09080" /></mesh>
        <mesh position={[0, -0.15, -0.25]} scale={[0.3, 0.02, 0.8]}><boxGeometry args={[0.3, 0.01, 1]} /><meshStandardMaterial color="#b8b0a0" transparent opacity={0.3} /></mesh>
      </group>
    );
  }

  if (type === "lizard") {
    return (
      <group>
        <mesh position={[0, 0, 0]} scale={[0.55, 0.35, 1.3]}><sphereGeometry args={[0.3, 14, 14]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 0.1, 0]} scale={[0.15, 0.08, 1.2]}><boxGeometry args={[0.3, 0.1, 0.6]} /><meshStandardMaterial color="#4a6a3a" roughness={0.8} /></mesh>
        <mesh position={[0, 0.06, 0.4]} scale={[0.8, 0.55, 0.9]}><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0, 0.04, 0.55]} scale={[0.5, 0.35, 0.6]}><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[-0.1, 0.12, 0.48]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.4} /></mesh>
        <mesh position={[0.1, 0.12, 0.48]}><sphereGeometry args={[0.04, 8, 8]} /><meshStandardMaterial color="#e8c020" emissive="#e8c020" emissiveIntensity={0.4} /></mesh>
        <mesh position={[-0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial {...darkMat} /></mesh>
        <mesh position={[0.1, 0.12, 0.52]} scale={[0.5, 1, 1]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial {...darkMat} /></mesh>
        {[
          { pos: [-0.18, -0.1, 0.15], rot: [0, 0, 0.7] },
          { pos: [0.18, -0.1, 0.15], rot: [0, 0, -0.7] },
          { pos: [-0.18, -0.1, -0.15], rot: [0, 0, 0.7] },
          { pos: [0.18, -0.1, -0.15], rot: [0, 0, -0.7] },
        ].map((leg, i) => (
          <group key={i}>
            <mesh position={leg.pos as [number, number, number]} rotation={leg.rot as [number, number, number]}>
              <cylinderGeometry args={[0.03, 0.025, 0.2, 6]} /><meshStandardMaterial {...matProps} />
            </mesh>
            <mesh position={[leg.pos[0] + (leg.pos[0] > 0 ? 0.08 : -0.08), leg.pos[1] - 0.1, leg.pos[2] + 0.03]}>
              <sphereGeometry args={[0.025, 6, 6]} /><meshStandardMaterial {...matProps} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.02, -0.45]} rotation={[0.1, 0, 0]} scale={[0.2, 0.15, 1.8]}><cylinderGeometry args={[0.08, 0.01, 0.5, 8]} /><meshStandardMaterial {...matProps} /></mesh>
        <mesh position={[0.05, -0.04, -0.75]} rotation={[0.05, 0.3, 0]} scale={[0.12, 0.1, 1]}><cylinderGeometry args={[0.04, 0.005, 0.3, 6]} /><meshStandardMaterial {...matProps} /></mesh>
        {[-0.15, 0, 0.15].map((z, i) => (
          <mesh key={i} position={[0, 0.12, z]} scale={[0.3, 0.1, 0.15]}><coneGeometry args={[0.06, 0.06, 4]} /><meshStandardMaterial color="#5a7a4a" roughness={0.7} /></mesh>
        ))}
      </group>
    );
  }

  return (
    <mesh><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial {...matProps} /></mesh>
  );
}

// ─── Animated Story Creature ────────────────────────────────────────────────

function StoryCreature({
  creature,
  onSelect,
}: {
  creature: typeof CREATURES[number];
  onSelect: (creature: typeof CREATURES[number]) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const offset = creature.position[0] * 0.5;
    if (groupRef.current) {
      groupRef.current.position.y = creature.position[1] + Math.sin(t * 0.6 + offset) * 0.12;
      groupRef.current.rotation.z = Math.sin(t * 0.4 + offset) * 0.03;
    }
  });

  return (
    <group
      ref={groupRef}
      position={creature.position}
      rotation={creature.rotation}
      scale={creature.scale}
    >
      <CreatureBody type={creature.geometry} color={creature.color} emissive={creature.emissive} />

      {/* Invisible collider sphere — much larger than visual mesh for reliable clicks */}
      <mesh
        onPointerDown={(e) => { e.stopPropagation(); onSelect(creature); }}
      >
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html position={[0, 1.4, 0]} center distanceFactor={8} style={{ pointerEvents: "none" }} zIndexRange={[0, 0]}>
        <div style={{
          background: "rgba(0,0,0,0.55)", color: "#fff", padding: "3px 10px",
          borderRadius: "10px", fontSize: "10px", fontFamily: "Georgia, serif",
          whiteSpace: "nowrap", textAlign: "center",
        }}>
          {creature.name}
        </div>
      </Html>
      <pointLight position={[0, -0.3, 0]} intensity={0.25} color={creature.color} distance={5} />
    </group>
  );
}

// ─── Scene ──────────────────────────────────────────────────────────────────

function Scene({
  offerings,
  onSelectOffering,
  onSelectCreature,
  cameraTarget,
  onCameraArrived,
}: {
  offerings: Offering[];
  onSelectOffering: (o: Offering) => void;
  onSelectCreature: (c: typeof CREATURES[number]) => void;
  cameraTarget: CameraTarget | null;
  onCameraArrived: () => void;
}) {
  const controlsRef = useRef<any>(null);

  // Disable orbit controls when flying to a frame
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = !cameraTarget;
    }
  }, [cameraTarget]);

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
          rotation: [0, 0, tilt] as [number, number, number],
        };
      } else if (wall === 1) {
        const slot = leftSlots.count++;
        const z = (slot - 1) * 3.5 + (seededRandom(seed + 3) - 0.5) * 0.8;
        return {
          position: [-17.8, 1 + yJitter, z] as [number, number, number],
          rotation: [0, Math.PI / 2, tilt] as [number, number, number],
        };
      } else {
        const slot = rightSlots.count++;
        const z = (slot - 1) * 3.5 + (seededRandom(seed + 4) - 0.5) * 0.8;
        return {
          position: [17.8, 1 + yJitter, z] as [number, number, number],
          rotation: [0, -Math.PI / 2, tilt] as [number, number, number],
        };
      }
    });
  }, [offerings]);

  // Compute fly-to position for a frame
  const handleFrameClick = useCallback(
    (offering: Offering, index: number) => {
      const pos = positions[index];
      if (!pos) {
        onSelectOffering(offering);
        return;
      }
      onSelectOffering(offering);
    },
    [positions, onSelectOffering],
  );

  return (
    <>
      <fog attach="fog" args={["#f5f0e8", 15, 50]} />
      <GalleryLighting />
      <VolumetricLights />
      <GalleryRoom />

      <CameraController target={cameraTarget} onArrived={onCameraArrived} />

      {offerings.slice(0, 16).map((offering, i) => {
        const pos = positions[i];
        return (
          <ArtisticFrame
            key={offering.id}
            offering={offering}
            position={pos.position}
            rotation={pos.rotation}
            onClick={() => handleFrameClick(offering, i)}
          />
        );
      })}

      {CREATURES.map((creature) => (
        <StoryCreature key={creature.name} creature={creature} onSelect={onSelectCreature} />
      ))}

      {/* Creature shadows */}
      {CREATURES.map((creature) => (
        <CreatureShadow key={`shadow-${creature.name}`} position={creature.position} />
      ))}

      <GalleryDust />

      <Stars radius={80} depth={60} count={500} factor={1.5} saturation={0} fade speed={0.1} />

      <Environment preset="apartment" />

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={28}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.15}
        minAzimuthAngle={-Math.PI * 0.65}
        maxAzimuthAngle={Math.PI * 0.65}
        target={[0, 1, 0]}
        zoomSpeed={1.2}
        panSpeed={0.8}
        rotateSpeed={0.7}
        onChange={() => {
          if (controlsRef.current) {
            const t = controlsRef.current.target;
            t.x = THREE.MathUtils.clamp(t.x, -14, 14);
            t.y = THREE.MathUtils.clamp(t.y, -2, 8);
            t.z = THREE.MathUtils.clamp(t.z, -14, 14);
          }
        }}
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

function OfferingModal({ offering, onClose }: { offering: Offering | null; onClose: () => void }) {
  if (!offering) return null;
  const authorDisplay = offering.author_type === "anonymous" ? "Anonimo" : offering.author_name || "Artista";

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
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
          <h2 className="text-2xl font-serif text-foreground mb-4">{offering.title || "Senza titolo"}</h2>
          {offering.text_content && (
            <p className="text-lg italic text-foreground/80 mb-4 font-serif leading-relaxed">{offering.text_content}</p>
          )}
          {offering.note && (
            <p className="text-base text-foreground/60 mb-4 italic">"{offering.note}"</p>
          )}
          {offering.media_type === "image" && offering.file_url && (
            <div className="mb-4 bg-muted rounded overflow-hidden">
              <img src={offering.file_url} alt={offering.title || "Immagine"} className="max-w-full h-auto" />
            </div>
          )}
          {offering.media_type === "video" && offering.file_url && (
            <div className="mb-4 bg-muted rounded overflow-hidden">
              <video src={offering.file_url} controls className="max-w-full h-auto" />
            </div>
          )}
          {offering.media_type === "audio" && offering.file_url && (
            <div className="mb-4"><audio src={offering.file_url} controls className="w-full" /></div>
          )}
          {offering.media_type === "link" && offering.link_url && (
            <a href={offering.link_url} target="_blank" rel="noopener noreferrer"
              className="block mb-4 text-accent-foreground hover:underline">🔗 Apri link →</a>
          )}
          <div className="mt-6 pt-4 border-t border-border/30 text-sm text-muted-foreground">
            <p>Di <span className="font-medium text-foreground">{authorDisplay}</span></p>
            <p className="mt-1 text-xs">Inviata: {new Date(offering.created_at).toLocaleDateString("it-IT")}</p>
            {offering.approved_at && (
              <p className="mt-1 text-xs">In galleria dal: {new Date(offering.approved_at).toLocaleDateString("it-IT")}</p>
            )}
            <p className="mt-1 text-xs uppercase tracking-wide">Tipo: {offering.media_type}</p>
            <p className="mt-1 text-[10px] opacity-80">ID: {offering.id}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Demo fallback data ─────────────────────────────────────────────────────

const DEMO_OFFERINGS: Offering[] = [
  { id: "demo-1", title: "Il Primo Cavapendolo", note: "Ho immaginato un piccolo essere che oscilla nel vento", text_content: "I cavapendoli sono creature di luce, sospese tra il cielo e la terra.", media_type: "text", file_url: null, link_url: null, author_name: "Maria", author_type: "name", created_at: "2024-01-15" },
  { id: "demo-2", title: "Spirale d'Argento", note: "Un disegno che rappresenta il movimento", media_type: "image", file_url: "/cavapendoli/models-a.png", link_url: null, author_name: "Roberto", author_type: "name", created_at: "2024-01-16" },
  { id: "demo-3", title: "Pensiero Sospeso", text_content: "Come un pendolo che non trova mai il fondo, così va la vita.", media_type: "text", file_url: null, link_url: null, author_type: "anonymous", author_name: null, created_at: "2024-01-17" },
  { id: "demo-4", title: "Movimento", note: "Il cavapendolo che si muove nell'aria", media_type: "image", file_url: "/cavapendoli/models-b.png", link_url: null, author_name: "@artista", author_type: "instagram", created_at: "2024-01-18" },
  { id: "demo-5", title: "Nel Vento", text_content: "Sospesi, fluttuando nel tempo che non passa mai.", media_type: "text", file_url: null, link_url: null, author_name: "Giulia", author_type: "name", created_at: "2024-01-19" },
  { id: "demo-6", title: "Colore B", media_type: "image", file_url: "/cavapendoli/models-bw.png", link_url: null, author_name: "Luca", author_type: "name", created_at: "2024-01-20" },
];

// ─── Main Component ─────────────────────────────────────────────────────────

function CavapendoGallery({ className = "" }: { className?: string }) {
  const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);
  const [selectedCreature, setSelectedCreature] = useState<typeof CREATURES[number] | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<CameraTarget | null>(null);
  const [hintVisible, setHintVisible] = useState(true);

  // Auto-hide hint
  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Ambient audio system
  useAmbientAudio(audioEnabled);

  // Fetch approved offerings
  const { data: liveOfferings } = useQuery({
    queryKey: ["gallery-offerings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offerings")
        .select("id, title, note, text_content, media_type, file_url, link_url, author_name, author_type, created_at, approved_at")
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

  // ESC to exit focus mode
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCameraTarget(null);
        setSelectedOffering(null);
        setSelectedCreature(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-[600px] ${className}`} style={{ height: "100%", minHeight: "600px", isolation: "isolate" }}>
      <Canvas
        camera={{ position: [0, 1, 12], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "linear-gradient(180deg, #f5f0e8 0%, #e0d8d0 100%)", width: "100%", height: "100%", position: "relative", zIndex: 0 }}
        shadows
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            offerings={offerings}
            onSelectOffering={setSelectedOffering}
            onSelectCreature={setSelectedCreature}
            cameraTarget={cameraTarget}
            onCameraArrived={() => {}}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none" style={{ zIndex: 10 }}>
        <div className="flex items-end gap-3">
          {/* Audio toggle */}
          <button
            onClick={() => setAudioEnabled((v) => !v)}
            className="pointer-events-auto bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md border border-border/30 text-lg hover:bg-background/95 transition-colors"
            title={audioEnabled ? "Disattiva audio" : "Attiva audio ambientale"}
          >
            {audioEnabled ? "🔊" : "🔇"}
          </button>

          {/* Hint text */}
          <AnimatePresence>
            {hintVisible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.5 }}
                className="bg-background/70 backdrop-blur-sm px-4 py-2 rounded-md border border-border/20"
              >
                <p className="font-mono-light text-xs text-muted-foreground">
                  🖱️ Trascina per ruotare • Zoom con scroll • Clicca un quadro o una creatura
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link
          to="/offri"
          className="pointer-events-auto bg-primary text-primary-foreground px-6 py-2.5 rounded-md hover:bg-primary/90 transition-colors font-mono-light text-sm shadow-lg"
        >
          + Lascia una cavapendolata
        </Link>
      </div>

      <OfferingModal offering={selectedOffering} onClose={() => setSelectedOffering(null)} />

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
              <button onClick={() => setSelectedCreature(null)} className="absolute top-3 right-4 text-muted-foreground hover:text-foreground text-2xl leading-none">×</button>
              <div className="w-4 h-4 rounded-full mx-auto mb-3" style={{ backgroundColor: selectedCreature.color, boxShadow: `0 0 12px ${selectedCreature.color}` }} />
              <h3 className="text-xl font-serif text-foreground mb-3">{selectedCreature.name}</h3>
              <p className="text-base italic text-foreground/80 font-serif leading-relaxed">{selectedCreature.story}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CavapendoGallery;
