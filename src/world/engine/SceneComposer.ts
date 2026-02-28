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
import { ART_SOURCES } from "@/world/rooms/artSources";
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
  renderer.toneMappingExposure = 1.34;
  renderer.setClearColor(0x08101a, 1);
  renderer.domElement.className = "h-full w-full";
  container.appendChild(renderer.domElement);
  return renderer;
};

const createRoomTextures = () => {
  const loader = new THREE.TextureLoader();
  const map: Record<string, THREE.Texture | null> = {
    a: null,
    b: null,
    bw: null,
  };
  const loaded: THREE.Texture[] = [];

  const assignTexture = (key: keyof typeof map, url: string) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        map[key] = texture;
        loaded.push(texture);
      },
      undefined,
      () => {
        map[key] = null;
      },
    );
  };

  assignTexture("a", ART_SOURCES.colorA);
  assignTexture("b", ART_SOURCES.colorB);
  assignTexture("bw", ART_SOURCES.bw);

  return {
    map,
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

  const fog = new THREE.FogExp2("#141d28", 0.03);
  scene.fog = fog;

  const worldRoot = new THREE.Group();
  scene.add(worldRoot);

  const ambient = new THREE.AmbientLight("#a7cee8", 0.84);
  worldRoot.add(ambient);

  const hemi = new THREE.HemisphereLight("#a4cce4", "#1f2833", 1.36);
  worldRoot.add(hemi);

  const key = new THREE.DirectionalLight("#f0cb7d", 1.62);
  key.position.set(6, 8, 4);
  worldRoot.add(key);

  const fill = new THREE.PointLight("#4fc2cf", 1.24, 60, 1.5);
  fill.position.set(-8, 4, 6);
  worldRoot.add(fill);

  const rim = new THREE.PointLight("#ee7b5b", 0.92, 55, 1.6);
  rim.position.set(8, 4, -9);
  worldRoot.add(rim);

  const gradientUniforms = {
    uColorA: { value: new THREE.Color("#2c4056") },
    uColorB: { value: new THREE.Color("#e0b064") },
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
    new THREE.PlaneGeometry(64, 30),
    new THREE.MeshStandardMaterial({
      color: "#112435",
      roughness: 0.84,
      metalness: 0.15,
      transparent: true,
      opacity: 0.96,
    }),
  );
  corridor.rotation.x = -Math.PI / 2;
  corridor.position.set(3.5, -1.02, -6.3);
  worldRoot.add(corridor);

  const worldLinks = new THREE.Group();
  worldRoot.add(worldLinks);
  const linkMaterial = new THREE.MeshStandardMaterial({
    color: "#75d8df",
    roughness: 0.22,
    metalness: 0.2,
    emissive: new THREE.Color("#1c7180"),
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.62,
  });
  const made = new Set<string>();
  Object.values(ROOM_GRAPH).forEach((room) => {
    const from = new THREE.Vector3(...room.anchor.roomCenter).setY(-0.82);
    room.portals.forEach((portal) => {
      const keyId = [room.id, portal.to].sort().join("::");
      if (made.has(keyId)) return;
      made.add(keyId);
      const target = ROOM_GRAPH[portal.to];
      const to = new THREE.Vector3(...target.anchor.roomCenter).setY(-0.82);
      const dist = from.distanceTo(to);
      const edge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, dist, 12), linkMaterial);
      edge.position.copy(from.clone().add(to).multiplyScalar(0.5));
      edge.lookAt(to);
      edge.rotateX(Math.PI / 2);
      worldLinks.add(edge);

      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 14),
        new THREE.MeshStandardMaterial({
          color: "#f0cf78",
          roughness: 0.3,
          metalness: 0.23,
          emissive: new THREE.Color("#5d4318"),
          emissiveIntensity: 0.32,
        }),
      );
      node.position.copy(from);
      worldLinks.add(node);
    });
  });

  const starfield = new THREE.Group();
  worldRoot.add(starfield);
  const starMaterial = new THREE.MeshBasicMaterial({
    color: "#a0d7ea",
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  for (let i = 0; i < 120; i += 1) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.02 + (i % 4) * 0.01, 8, 8), starMaterial);
    star.position.set(
      -26 + (i % 20) * 2.6 + ((i * 13) % 5) * 0.2,
      1.6 + ((i * 7) % 10) * 0.45,
      -22 + Math.floor(i / 20) * 4.8 + ((i * 17) % 6) * 0.15,
    );
    starfield.add(star);
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
