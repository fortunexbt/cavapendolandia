import * as THREE from "three";
import { ROOM_GRADIENT_FRAGMENT, ROOM_GRADIENT_VERTEX } from "@/world/shaders/gradientSurface";
import { ROOM_GRAPH } from "@/world/graph/roomGraph";
import { buildArchivioRoom } from "@/world/rooms/archivioRoom";
import { buildHomeAtriumRoom } from "@/world/rooms/homeAtriumRoom";
import { buildManifestoRoom } from "@/world/rooms/manifestoRoom";
import { buildOfferingDetailRoom } from "@/world/rooms/offeringDetailRoom";
import { buildOffriRoom } from "@/world/rooms/offriRoom";
import { buildRegoleRoom } from "@/world/rooms/regoleRoom";
import { buildRimozioneRoom } from "@/world/rooms/rimozioneRoom";
import type { RoomId, WorldRoomRuntime } from "@/world/types";

export type SceneComposerOutput = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  rooms: Record<RoomId, WorldRoomRuntime>;
  worldRoot: THREE.Group;
  gradientUniforms: {
    uColorA: { value: THREE.Color };
    uColorB: { value: THREE.Color };
    uTime: { value: number };
  };
  dispose: () => void;
};

const createRenderer = (container: HTMLElement) => {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.42;
  renderer.setClearColor(0x0d1520, 1);
  renderer.domElement.className = "h-full w-full";
  container.appendChild(renderer.domElement);
  return renderer;
};

const createRoomTextures = () => {
  const createProceduralMuralTexture = (mode: "a" | "b" | "bw") => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 384;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const palettes: Record<"a" | "b" | "bw", string[]> = {
      a: ["#66c7d0", "#e79063", "#efc267", "#84aedd", "#f3f0e5"],
      b: ["#65c3cc", "#ef8b61", "#f4d078", "#7ca9dd", "#dff1f3"],
      bw: ["#6f7b85", "#89949d", "#aeb6bc", "#d3d8dc", "#f0f2f4"],
    };

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(240,244,246,0.08)");
    gradient.addColorStop(1, "rgba(8,12,18,0.08)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors = palettes[mode];
    for (let i = 0; i < 14; i += 1) {
      const color = colors[i % colors.length];
      const x = 36 + ((i * 59) % (canvas.width - 72));
      const y = 32 + ((i * 41) % (canvas.height - 64));
      const w = 34 + (i % 4) * 28;
      const h = 18 + (i % 3) * 22;
      ctx.fillStyle = `${color}88`;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, (i % 5) * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `${color}d4`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - w * 0.8, y - h * 0.4);
      ctx.bezierCurveTo(x - w * 0.3, y - h * 1.2, x + w * 0.2, y + h * 1.1, x + w * 0.9, y + h * 0.35);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(240,245,248,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, canvas.width - 28, canvas.height - 28);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  };

  const textureA = createProceduralMuralTexture("a");
  const textureB = createProceduralMuralTexture("b");
  const textureBw = createProceduralMuralTexture("bw");

  const loaded = [textureA, textureB, textureBw].filter((item): item is THREE.Texture => !!item);

  return {
    map: {
      a: textureA,
      b: textureB,
      bw: textureBw,
    },
    loaded,
  };
};

export const composeScene = (container: HTMLElement): SceneComposerOutput => {
  const scene = new THREE.Scene();
  const renderer = createRenderer(container);
  const camera = new THREE.PerspectiveCamera(
    48,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    160,
  );

  const fog = new THREE.FogExp2("#1d2a39", 0.017);
  scene.fog = fog;

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const ambient = new THREE.AmbientLight("#c2d2de", 0.78);
  worldRoot.add(ambient);

  const hemi = new THREE.HemisphereLight("#bed6e4", "#26313c", 1.1);
  worldRoot.add(hemi);

  const key = new THREE.DirectionalLight("#ecd2a4", 1.22);
  key.position.set(6, 8, 4);
  worldRoot.add(key);

  const fill = new THREE.PointLight("#8bc7cf", 0.64, 42, 1.5);
  fill.position.set(-7, 3.2, 6);
  worldRoot.add(fill);

  const gradientUniforms = {
    uColorA: { value: new THREE.Color("#30485f") },
    uColorB: { value: new THREE.Color("#d9b98e") },
    uTime: { value: 0 },
  };

  const gradientDome = new THREE.Mesh(
    new THREE.SphereGeometry(84, 40, 24),
    new THREE.ShaderMaterial({
      uniforms: gradientUniforms,
      vertexShader: ROOM_GRADIENT_VERTEX,
      fragmentShader: ROOM_GRADIENT_FRAGMENT,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  worldRoot.add(gradientDome);

  const corridor = new THREE.Mesh(
    new THREE.PlaneGeometry(62, 24),
    new THREE.MeshStandardMaterial({
      color: "#1a2532",
      roughness: 0.9,
      metalness: 0.06,
      transparent: true,
      opacity: 0.95,
    }),
  );
  corridor.rotation.x = -Math.PI / 2;
  corridor.position.set(3.5, -1.02, -6.3);
  worldRoot.add(corridor);

  const silentMarkers = new THREE.Group();
  worldRoot.add(silentMarkers);
  Object.values(ROOM_GRAPH).forEach((room) => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 10, 10),
      new THREE.MeshStandardMaterial({
        color: "#d1bb91",
        roughness: 0.44,
        metalness: 0.1,
        emissive: new THREE.Color("#3a3224"),
        emissiveIntensity: 0.16,
      }),
    );
    marker.position.set(room.anchor.roomCenter[0], -0.86, room.anchor.roomCenter[2]);
    silentMarkers.add(marker);
  });

  const distantDust = new THREE.Group();
  worldRoot.add(distantDust);
  const dustMaterial = new THREE.MeshBasicMaterial({
    color: "#a8c3ce",
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  for (let i = 0; i < 14; i += 1) {
    const dust = new THREE.Mesh(new THREE.SphereGeometry(0.016 + (i % 3) * 0.006, 8, 8), dustMaterial);
    dust.position.set(
      -24 + (i % 13) * 4,
      2 + (i % 6) * 0.7,
      -28 + Math.floor(i / 13) * 9,
    );
    distantDust.add(dust);
  }

  const { map, loaded } = createRoomTextures();

  const rooms: Record<RoomId, WorldRoomRuntime> = {
    home_atrium: buildHomeAtriumRoom(map.a),
    manifesto_room: buildManifestoRoom(map.b),
    regole_room: buildRegoleRoom(map.b),
    rimozione_room: buildRimozioneRoom(map.bw),
    archivio_room: buildArchivioRoom(map.a),
    offri_room: buildOffriRoom(map.bw),
    offering_detail_room: buildOfferingDetailRoom(map.a),
  };

  (Object.values(rooms) as WorldRoomRuntime[]).forEach((room) => {
    worldRoot.add(room.group);
  });

  return {
    scene,
    camera,
    renderer,
    rooms,
    worldRoot,
    gradientUniforms,
    dispose: () => {
      loaded.forEach((texture) => texture.dispose());
      worldRoot.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
        const material = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else if (material) {
          material.dispose();
        }
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    },
  };
};
