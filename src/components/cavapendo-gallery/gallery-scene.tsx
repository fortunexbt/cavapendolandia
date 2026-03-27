import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useExteriorWindowTexture,
  useGalleryFloorTexture,
  useGalleryWallTexture,
} from "@/components/cavapendo-gallery/assets";
import {
  CREATURES,
  DOOR_WIDTH,
  GALLERY_FLOOR_Y,
  ROOM_HALF,
  ROOM_HEIGHT,
  WALL_TOP_Y,
} from "@/components/cavapendo-gallery/config";
import {
  type QualityTier,
  type ResolvedRenderProfile,
} from "@/components/cavapendo-gallery/runtime";
import {
  ArchPortal,
  CreatureShape,
} from "@/components/cavapendo-gallery/scene-primitives";
import { seededRandom } from "@/components/cavapendo-gallery/scene-utils";
import {
  type Offering,
  type StoryCreatureData,
} from "@/components/cavapendo-gallery/types";

function useImageTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    let active = true;
    let loadedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (nextTexture) => {
        nextTexture.minFilter = THREE.LinearFilter;
        nextTexture.magFilter = THREE.LinearFilter;
        nextTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture = nextTexture;
        if (!active) {
          nextTexture.dispose();
          return;
        }
        setTexture(nextTexture);
      },
      undefined,
      () => {
        if (active) setTexture(null);
      },
    );

    return () => {
      active = false;
      loadedTexture?.dispose();
    };
  }, [url]);

  return texture;
}

function VideoPreview({
  url,
  width,
  height,
}: {
  url: string | null;
  width: number;
  height: number;
}) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }

    const video = document.createElement("video");
    video.src = url;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.play().catch(() => undefined);

    const nextTexture = new THREE.VideoTexture(video);
    nextTexture.minFilter = THREE.LinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    setTexture(nextTexture);

    return () => {
      video.pause();
      video.src = "";
      nextTexture.dispose();
    };
  }, [url]);

  if (!texture) {
    return (
      <mesh position={[0, 0.02, 0.08]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#d7cab7" />
      </mesh>
    );
  }

  return (
    <mesh position={[0, 0.02, 0.08]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PreviewLabel({
  lines,
  width,
  color = "#36291e",
}: {
  lines: string[];
  width: number;
  color?: string;
}) {
  return (
    <group position={[0, 0.05, 0.09]}>
      {lines.map((line, index) => (
        <Text
          key={`${line}-${index}`}
          position={[0, 0.36 - index * 0.22, 0]}
          fontSize={0.12}
          maxWidth={width}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {line}
        </Text>
      ))}
    </group>
  );
}

function getFrameSize(offering: Offering) {
  const textLength = offering.text_content?.length || 0;
  if (offering.media_type === "text") {
    if (textLength > 180) return { width: 2, height: 2.5 };
    if (textLength > 90) return { width: 1.8, height: 2.15 };
    return { width: 1.6, height: 1.85 };
  }
  if (offering.media_type === "video") return { width: 2.2, height: 1.5 };
  if (offering.media_type === "audio") return { width: 1.5, height: 1.4 };
  if (offering.media_type === "link") return { width: 1.45, height: 1.25 };
  if (offering.media_type === "pdf") return { width: 1.6, height: 2 };
  return { width: 1.85, height: 2.15 };
}

function FramePreview({ offering }: { offering: Offering }) {
  const { width, height } = getFrameSize(offering);
  const previewTexture = useImageTexture(
    offering.media_type === "image" ? offering.file_url : null,
  );

  if (offering.media_type === "image" && previewTexture) {
    return (
      <mesh position={[0, 0.02, 0.08]}>
        <planeGeometry args={[width - 0.28, height - 0.28]} />
        <meshBasicMaterial map={previewTexture} toneMapped={false} />
      </mesh>
    );
  }

  if (offering.media_type === "video") {
    return (
      <VideoPreview
        url={offering.file_url}
        width={width - 0.28}
        height={height - 0.28}
      />
    );
  }

  if (offering.media_type === "text") {
    const content = offering.text_content || offering.title || "Cavapendolata";
    const clipped =
      content.length > 110 ? `${content.slice(0, 108).trim()}…` : content;

    return (
      <PreviewLabel
        width={width - 0.4}
        lines={clipped.split("\n").slice(0, 5)}
      />
    );
  }

  if (offering.media_type === "audio") {
    return (
      <PreviewLabel
        width={width - 0.35}
        lines={["♪", offering.title || "Audio", "Da ascoltare vicino"]}
      />
    );
  }

  if (offering.media_type === "link") {
    const domain = (offering.link_url || "")
      .replace(/^https?:\/\//, "")
      .split("/")[0];
    return (
      <PreviewLabel
        width={width - 0.35}
        lines={["↗", offering.title || "Link", domain || "apri fuori stanza"]}
      />
    );
  }

  if (offering.media_type === "pdf") {
    return (
      <PreviewLabel
        width={width - 0.35}
        lines={["PDF", offering.title || "Documento", "prima pagina sospesa"]}
      />
    );
  }

  return (
    <PreviewLabel
      width={width - 0.35}
      lines={[offering.title || "Cavapendolata"]}
    />
  );
}

function FrameCard({
  offering,
  position,
  rotation,
  quality,
  onSelect,
}: {
  offering: Offering;
  position: [number, number, number];
  rotation: [number, number, number];
  quality: QualityTier;
  onSelect: (offering: Offering) => void;
}) {
  const { width, height } = getFrameSize(offering);
  const [hovered, setHovered] = useState(false);
  const trimColor = hovered ? "#dbc5a0" : "#b9a07d";

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.04, -0.12]}>
        <planeGeometry args={[width + 0.34, height + 0.34]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
      <mesh>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.16]} />
        <meshStandardMaterial
          color={hovered ? "#5e4332" : "#4f382b"}
          roughness={0.68}
        />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[width - 0.06, height - 0.06, 0.035]} />
        <meshStandardMaterial color="#efe3d1" roughness={0.96} />
      </mesh>

      {[
        [0, height / 2 - 0.09, 0.072, width - 0.1, 0.05, 0.03],
        [0, -height / 2 + 0.09, 0.072, width - 0.1, 0.05, 0.03],
        [-width / 2 + 0.09, 0, 0.072, 0.05, height - 0.1, 0.03],
        [width / 2 - 0.09, 0, 0.072, 0.05, height - 0.1, 0.03],
      ].map((args, index) => (
        <mesh key={`trim-${index}`} position={args.slice(0, 3) as [number, number, number]}>
          <boxGeometry args={args.slice(3) as [number, number, number]} />
          <meshStandardMaterial color={trimColor} roughness={0.54} metalness={0.08} />
        </mesh>
      ))}

      <FramePreview offering={offering} />
      <mesh position={[0, 0, 0.116]}>
        <planeGeometry args={[width - 0.18, height - 0.18]} />
        {quality === "high" ? (
          <meshPhysicalMaterial
            color="#f7f4ef"
            transparent
            opacity={hovered ? 0.16 : 0.1}
            roughness={0.04}
            transmission={0.82}
            thickness={0.08}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            color="#f4efe7"
            transparent
            opacity={quality === "medium" ? 0.18 : 0.14}
            roughness={0.22}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>
      <Text
        position={[0, -height / 2 + 0.16, 0.12]}
        fontSize={0.085}
        maxWidth={width - 0.35}
        color="#4f392b"
        anchorX="center"
        anchorY="middle"
      >
        {offering.title || "Senza titolo"}
      </Text>

      <mesh
        position={[0, 0, 0.24]}
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(offering);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        userData={{ interaction: { type: "offering", id: offering.id } }}
      >
        <planeGeometry args={[width + 0.36, height + 0.36]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function StoryCreature({
  creature,
  onSelect,
}: {
  creature: StoryCreatureData;
  onSelect: (creature: StoryCreatureData) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const bob = Math.sin(state.clock.elapsedTime * 0.8 + creature.position[0]) * 0.12;
    groupRef.current.position.y = creature.position[1] + bob;
  });

  return (
    <group ref={groupRef} position={creature.position} scale={creature.scale}>
      <mesh position={[0, -0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.68, 30]} />
        <meshBasicMaterial color="#ead9b4" transparent opacity={0.2} />
      </mesh>
      <CreatureShape color={creature.color} kind={creature.kind} />
      <mesh
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(creature);
        }}
        userData={{ interaction: { type: "creature", id: creature.id } }}
      >
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GallerySconce({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, -0.08]}>
        <boxGeometry args={[0.22, 0.68, 0.12]} />
        <meshStandardMaterial color="#8e7862" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.28, 0.08]}>
        <sphereGeometry args={[0.13, 14, 14]} />
        <meshStandardMaterial
          color="#fff4d8"
          emissive={accent}
          emissiveIntensity={0.6}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0, 0.28, 0.08]}>
        <sphereGeometry args={[0.26, 18, 18]} />
        <meshBasicMaterial color={accent} transparent opacity={0.16} />
      </mesh>
    </group>
  );
}

function GalleryArchitecture({
  wallTexture,
  floorTexture,
  quality,
}: {
  wallTexture: THREE.Texture | null;
  floorTexture: THREE.Texture | null;
  quality: QualityTier;
}) {
  const panelWidth = ROOM_HALF - DOOR_WIDTH / 2;
  const exteriorWindowTexture = useExteriorWindowTexture(quality);
  const panoramaWidth = ROOM_HALF * 2 - 5.4;
  const panoramaHeight = ROOM_HEIGHT - 4.2;
  const panoramaCenterY = 4.55;
  const panoramaFrameDepth = 0.44;
  const showDeepDetails = quality !== "low";

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial
          map={floorTexture || undefined}
          color="#784a31"
          roughness={0.94}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.02, -2]}>
        <planeGeometry args={[ROOM_HALF * 1.1, ROOM_HALF * 1.62]} />
        <meshStandardMaterial
          color="#5d3124"
          transparent
          opacity={0.24}
          roughness={0.98}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.03, -1.6]}>
        <planeGeometry args={[ROOM_HALF * 0.88, ROOM_HALF * 1.28]} />
        <meshStandardMaterial
          color="#b97054"
          transparent
          opacity={0.16}
          roughness={0.98}
        />
      </mesh>

      <mesh position={[0, WALL_TOP_Y, ROOM_HALF]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#ddcebe"
          roughness={0.98}
        />
      </mesh>
      <mesh position={[0, 1.2, ROOM_HALF - 0.16]}>
        <boxGeometry args={[ROOM_HALF * 2, 2.28, 0.26]} />
        <meshStandardMaterial color="#c4b29e" roughness={0.94} />
      </mesh>

      <mesh
        position={[-panelWidth / 2 - DOOR_WIDTH / 4, WALL_TOP_Y, -ROOM_HALF]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[panelWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#ddd1c1"
          roughness={0.98}
        />
      </mesh>
      <mesh
        position={[panelWidth / 2 + DOOR_WIDTH / 4, WALL_TOP_Y, -ROOM_HALF]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[panelWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#ddd1c1"
          roughness={0.98}
        />
      </mesh>
      <mesh position={[0, 8, -ROOM_HALF]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DOOR_WIDTH, ROOM_HEIGHT - 8]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#ddd1c1"
          roughness={0.98}
        />
      </mesh>

      <mesh position={[0, panoramaCenterY, -ROOM_HALF + 0.02]}>
        <boxGeometry args={[panoramaWidth + 2.2, panoramaHeight + 1.2, 0.38]} />
        <meshStandardMaterial color="#7a6553" roughness={0.86} />
      </mesh>
      <mesh position={[0, panoramaCenterY, -ROOM_HALF + 0.16]}>
        <boxGeometry args={[panoramaWidth + 1.28, panoramaHeight + 0.56, 0.3]} />
        <meshStandardMaterial color="#b7a38d" roughness={0.92} />
      </mesh>
      <mesh position={[0, panoramaCenterY, -ROOM_HALF + 0.01]}>
        <planeGeometry args={[panoramaWidth - 0.22, panoramaHeight - 0.18]} />
        <meshBasicMaterial
          map={exteriorWindowTexture || undefined}
          color="#ffffff"
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, panoramaCenterY + 0.08, -ROOM_HALF + 0.12]}>
        <planeGeometry args={[panoramaWidth - 0.42, panoramaHeight - 0.38]} />
        <meshBasicMaterial
          color="#eef8ff"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      {showDeepDetails && (
        <>
          <mesh
            position={[0, panoramaCenterY + 0.24, -ROOM_HALF + 0.2]}
            rotation={[0, 0, 0.02]}
          >
            <planeGeometry args={[panoramaWidth * 0.64, panoramaHeight * 0.86]} />
            <meshBasicMaterial
              color="#f7ecda"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, GALLERY_FLOOR_Y + 0.05, -ROOM_HALF * 0.14]}
          >
            <circleGeometry args={[ROOM_HALF * 0.88, 42]} />
            <meshBasicMaterial
              color="#f1cfa4"
              transparent
              opacity={quality === "high" ? 0.08 : 0.05}
            />
          </mesh>
        </>
      )}
      <mesh position={[0, panoramaCenterY, -ROOM_HALF + 0.26]}>
        <planeGeometry args={[panoramaWidth + 0.06, panoramaHeight + 0.08]} />
        {quality === "high" ? (
          <meshPhysicalMaterial
            color="#dff2ff"
            transparent
            opacity={0.24}
            roughness={0.04}
            metalness={0.04}
            transmission={0.9}
            thickness={0.22}
            side={THREE.DoubleSide}
          />
        ) : (
          <meshStandardMaterial
            color="#deedf7"
            transparent
            opacity={quality === "medium" ? 0.18 : 0.12}
            roughness={0.18}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={`window-reveal-${side}`}
          position={[
            side * (panoramaWidth / 2 + 0.02),
            panoramaCenterY,
            -ROOM_HALF + 0.28,
          ]}
          rotation={[0, side * 0.12, 0]}
        >
          <boxGeometry args={[0.56, panoramaHeight + 0.24, panoramaFrameDepth]} />
          <meshStandardMaterial color="#6f5e4e" roughness={0.84} />
        </mesh>
      ))}
      <mesh
        position={[
          0,
          panoramaCenterY + panoramaHeight / 2 + 0.28,
          -ROOM_HALF + 0.28,
        ]}
      >
        <boxGeometry args={[panoramaWidth + 0.8, 0.46, panoramaFrameDepth]} />
        <meshStandardMaterial color="#6f5e4e" roughness={0.84} />
      </mesh>
      <mesh
        position={[
          0,
          panoramaCenterY - panoramaHeight / 2 - 0.28,
          -ROOM_HALF + 0.28,
        ]}
      >
        <boxGeometry args={[panoramaWidth + 0.8, 0.46, panoramaFrameDepth]} />
        <meshStandardMaterial color="#6f5e4e" roughness={0.84} />
      </mesh>
      <mesh
        position={[
          0,
          panoramaCenterY - panoramaHeight / 2 - 0.52,
          -ROOM_HALF + 0.36,
        ]}
      >
        <boxGeometry args={[panoramaWidth + 1.18, 0.22, 0.58]} />
        <meshStandardMaterial color="#9b866f" roughness={0.88} />
      </mesh>

      {showDeepDetails && (
        <>
          <mesh position={[0, panoramaCenterY + 1.1, -ROOM_HALF + 0.3]}>
            <planeGeometry args={[panoramaWidth - 2, 1.8]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[panoramaWidth * 0.19, panoramaCenterY - 0.18, -ROOM_HALF + 0.31]}
            rotation={[0, 0, 0.11]}
          >
            <planeGeometry args={[panoramaWidth * 0.26, panoramaHeight * 0.58]} />
            <meshBasicMaterial
              color="#fff1dc"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[-panoramaWidth * 0.16, panoramaCenterY - 0.3, -ROOM_HALF + 0.31]}
            rotation={[0, 0, -0.14]}
          >
            <planeGeometry args={[panoramaWidth * 0.22, panoramaHeight * 0.64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      <mesh
        position={[-panelWidth / 2 - DOOR_WIDTH / 4, WALL_TOP_Y, ROOM_HALF]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[panelWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#dfd2c3"
          roughness={0.98}
        />
      </mesh>
      <mesh
        position={[panelWidth / 2 + DOOR_WIDTH / 4, WALL_TOP_Y, ROOM_HALF]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[panelWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#dfd2c3"
          roughness={0.98}
        />
      </mesh>
      <mesh position={[0, 8, ROOM_HALF]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DOOR_WIDTH, ROOM_HEIGHT - 8]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#dfd2c3"
          roughness={0.98}
        />
      </mesh>

      <mesh position={[-ROOM_HALF, WALL_TOP_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#d7cab9"
          roughness={0.98}
        />
      </mesh>
      <mesh position={[ROOM_HALF, WALL_TOP_Y, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial
          map={wallTexture || undefined}
          color="#d7cab9"
          roughness={0.98}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#cdb59a" roughness={0.96} />
      </mesh>

      {Array.from({ length: 5 }).map((_, index) => {
        const z = -13 + index * 6.5;
        return (
          <group key={`ceiling-rail-${z}`} position={[0, 9.56, z]}>
            <mesh>
              <boxGeometry args={[ROOM_HALF * 2, 0.34, 0.3]} />
              <meshStandardMaterial color="#5a3a29" roughness={0.88} />
            </mesh>
            {showDeepDetails && (
              <mesh position={[0, -0.18, 0]}>
                <boxGeometry args={[ROOM_HALF * 1.3, 0.06, 0.08]} />
                <meshStandardMaterial
                  color="#f3dcc0"
                  emissive="#f3dcc0"
                  emissiveIntensity={0.14}
                  roughness={0.3}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {[-1, 1].flatMap((side) =>
        [-13, -6, 0, 6, 13].map((z) => (
          <mesh
            key={`${side}-${z}`}
            position={[side * (ROOM_HALF - 0.7), 3.55, z]}
          >
            <cylinderGeometry args={[0.56, 0.66, 13.2, 10]} />
            <meshStandardMaterial color="#c7b4a0" roughness={0.88} />
          </mesh>
        )),
      )}

      {[
        [-ROOM_HALF + 0.66, 3.55, -ROOM_HALF + 0.66],
        [ROOM_HALF - 0.66, 3.55, -ROOM_HALF + 0.66],
        [-ROOM_HALF + 0.66, 3.55, ROOM_HALF - 0.66],
        [ROOM_HALF - 0.66, 3.55, ROOM_HALF - 0.66],
      ].map((position, index) => (
        <mesh
          key={`corner-cove-${index}`}
          position={position as [number, number, number]}
        >
          <cylinderGeometry args={[0.96, 1.14, 13.4, 18]} />
          <meshStandardMaterial color="#c8b7a5" roughness={0.9} />
        </mesh>
      ))}

      {[-12, -6, 0, 6, 12].map((x) => (
        <GallerySconce
          key={`lamp-front-${x}`}
          position={[x, 3.62, ROOM_HALF - 0.28]}
          accent="#f0c997"
        />
      ))}
      {[-12, -6, 0, 6, 12].map((x) => (
        <GallerySconce
          key={`lamp-back-${x}`}
          position={[x, 3.62, -ROOM_HALF + 0.28]}
          accent="#cde2bb"
        />
      ))}

      <mesh position={[0, 0.1, ROOM_HALF - 0.26]}>
        <boxGeometry args={[6.8, 0.24, 1.12]} />
        <meshStandardMaterial color="#85705c" roughness={0.88} />
      </mesh>
      <mesh position={[0, 0.1, -ROOM_HALF + 0.26]}>
        <boxGeometry args={[6.8, 0.24, 1.12]} />
        <meshStandardMaterial color="#7c6c5c" roughness={0.88} />
      </mesh>

      <ArchPortal
        position={[0, GALLERY_FLOOR_Y, ROOM_HALF - 0.12]}
        rotationY={Math.PI}
        label="USCITA"
        glowColor="#f7d8a8"
        stoneColor="#78614e"
        labelColor="#6e5335"
        outlineColor="#fff7db"
        veilColor="#f5ead8"
        quality={quality}
      />
      <ArchPortal
        position={[0, GALLERY_FLOOR_Y, -ROOM_HALF + 0.12]}
        label="ESTERNO"
        glowColor="#d3f0bd"
        stoneColor="#6a7657"
        labelColor="#54664a"
        outlineColor="#eef4df"
        veilColor="#e8f2d9"
        plaqueColor="#dbe6cb"
        quality={quality}
      />
    </group>
  );
}

function useGallerySlots(offerings: Offering[]) {
  return useMemo(() => {
    const frontSlots = [-14, -10, -6, 6, 10, 14].map((x) => ({
      position: [x, -0.3 + seededRandom(x + 10) * 1.1, ROOM_HALF - 0.18] as [
        number,
        number,
        number,
      ],
      rotation: [0, Math.PI, seededRandom(x + 20) * 0.05 - 0.025] as [
        number,
        number,
        number,
      ],
    }));

    const leftSlots = [-13, -9, -5, -1, 3, 7, 11, 15].map((z) => ({
      position: [
        -ROOM_HALF + 0.18,
        -0.4 + seededRandom(z + 35) * 1.2,
        z - 2,
      ] as [number, number, number],
      rotation: [0, Math.PI / 2, seededRandom(z + 55) * 0.06 - 0.03] as [
        number,
        number,
        number,
      ],
    }));

    const rightSlots = [-13, -9, -5, -1, 3, 7, 11, 15].map((z) => ({
      position: [
        ROOM_HALF - 0.18,
        -0.4 + seededRandom(z + 75) * 1.2,
        z - 2,
      ] as [number, number, number],
      rotation: [0, -Math.PI / 2, seededRandom(z + 95) * 0.06 - 0.03] as [
        number,
        number,
        number,
      ],
    }));

    const slots = [...frontSlots, ...leftSlots, ...rightSlots];
    return offerings.slice(0, slots.length).map((offering, index) => ({
      offering,
      position: slots[index].position,
      rotation: slots[index].rotation,
    }));
  }, [offerings]);
}

export function GalleryScene({
  offerings,
  renderProfile,
  onSelectOffering,
  onSelectCreature,
}: {
  offerings: Offering[];
  renderProfile: ResolvedRenderProfile;
  onSelectOffering: (offering: Offering) => void;
  onSelectCreature: (creature: StoryCreatureData) => void;
}) {
  const quality = renderProfile.tier;
  const wallTexture = useGalleryWallTexture(quality);
  const floorTexture = useGalleryFloorTexture(quality);
  const slots = useGallerySlots(offerings);

  return (
    <>
      <color attach="background" args={["#cfb8a6"]} />
      <fog attach="fog" args={["#ccb19f", 16, 36]} />
      <ambientLight
        intensity={quality === "low" ? 0.84 : 0.72}
        color="#f5ede3"
      />
      <hemisphereLight intensity={0.46} color="#fff3e3" groundColor="#4a3328" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={0.88}
        color="#ffe7c4"
      />
      <pointLight
        position={[0, 6.2, 10]}
        intensity={0.54}
        color="#efcb94"
        distance={22}
      />
      <pointLight
        position={[0, 5.6, -11]}
        intensity={quality === "low" ? 0.24 : 0.4}
        color="#cfe2bd"
        distance={20}
      />

      <GalleryArchitecture
        wallTexture={wallTexture}
        floorTexture={floorTexture}
        quality={quality}
      />

      {slots.map((slot) => (
        <FrameCard
          key={slot.offering.id}
          offering={slot.offering}
          position={slot.position}
          rotation={slot.rotation}
          quality={quality}
          onSelect={onSelectOffering}
        />
      ))}

      {CREATURES.map((creature) => (
        <StoryCreature
          key={creature.id}
          creature={creature}
          onSelect={onSelectCreature}
        />
      ))}

      {quality !== "low" && (
        <Sparkles
          count={Math.round(
            (quality === "medium" ? 26 : 62) * renderProfile.sparkleDensity,
          )}
          scale={30}
          size={quality === "high" ? 1.15 : 0.95}
          speed={quality === "high" ? 0.14 : 0.11}
          color={quality === "high" ? "#f5dec0" : "#e3cfaa"}
          opacity={quality === "high" ? 0.18 : 0.14}
        />
      )}
    </>
  );
}
