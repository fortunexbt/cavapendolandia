import * as THREE from "three";
import { applyPainterlyMaterial, createSeededRng, pickPaletteColor } from "@/world/materials/painterly";
import { createArtRelief } from "@/world/rooms/artRelief";
import type { HotspotAction, RoomId, WorldHotspot, WorldRoomRuntime } from "@/world/types";

type RoomTheme = {
  shellColor: string;
  floorColor: string;
  glowA: string;
  glowB: string;
  muralTint: string;
};

type BuildRoomInput = {
  id: RoomId;
  center: THREE.Vector3;
  paletteShift: number;
  muralTexture?: THREE.Texture | null;
  artModelSource?: string | null;
  portalTargets: Array<{ label: string; action: HotspotAction; offset: [number, number, number] }>;
  utilityHotspots?: Array<{ label: string; action: HotspotAction; offset: [number, number, number] }>;
  signatureScale?: number;
  theme?: Partial<RoomTheme>;
};

const makePortalMaterial = (color: string) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.26,
    metalness: 0.32,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0.86,
  });

const makePortalBeamMaterial = (color: string) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

const DEFAULT_THEME: RoomTheme = {
  shellColor: "#101a2b",
  floorColor: "#132333",
  glowA: "#53c0cb",
  glowB: "#f0c170",
  muralTint: "#d8e8f6",
};

const buildSeahorseSculpture = (paletteShift: number, roomTheme: RoomTheme) => {
  const root = new THREE.Group();
  root.userData.seahorseRoot = true;
  root.userData.seed = (paletteShift + 11) * 0.97;

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.34, 1.35, 12, 18),
    new THREE.MeshStandardMaterial({
      color: "#f0d074",
      roughness: 0.33,
      metalness: 0.22,
      emissive: new THREE.Color("#3f4323"),
      emissiveIntensity: 0.14,
    }),
  );
  body.rotation.z = Math.PI * 0.22;
  root.add(body);

  const neck = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.15, 0.76, 10, 14),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 3),
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color("#12384e"),
      emissiveIntensity: 0.12,
    }),
  );
  neck.position.set(0.36, 0.66, 0);
  neck.rotation.z = Math.PI * 0.31;
  root.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 18, 18),
    new THREE.MeshStandardMaterial({
      color: "#f3efdf",
      roughness: 0.26,
      metalness: 0.18,
      emissive: new THREE.Color("#1d3543"),
      emissiveIntensity: 0.12,
    }),
  );
  head.position.set(0.67, 0.9, 0.02);
  root.add(head);

  const snout = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.34, 14),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 4),
      roughness: 0.34,
      metalness: 0.17,
      emissive: new THREE.Color("#4f2c20"),
      emissiveIntensity: 0.12,
    }),
  );
  snout.rotation.z = -Math.PI * 0.5;
  snout.position.set(0.93, 0.9, 0.02);
  root.add(snout);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 14, 14),
    new THREE.MeshStandardMaterial({
      color: "#0f1f2d",
      roughness: 0.24,
      metalness: 0.3,
      emissive: new THREE.Color(roomTheme.glowA),
      emissiveIntensity: 0.22,
    }),
  );
  eye.position.set(0.71, 0.94, 0.18);
  root.add(eye);

  const dorsalFin = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.55, 3),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 2),
      roughness: 0.32,
      metalness: 0.16,
      emissive: new THREE.Color("#16324b"),
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide,
    }),
  );
  dorsalFin.position.set(-0.06, 0.43, 0);
  dorsalFin.rotation.set(0, Math.PI * 0.5, Math.PI * 1.06);
  root.add(dorsalFin);

  const sideFin = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.44, 3),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 6),
      roughness: 0.32,
      metalness: 0.18,
      emissive: new THREE.Color("#11374c"),
      emissiveIntensity: 0.14,
      side: THREE.DoubleSide,
    }),
  );
  sideFin.position.set(0.08, 0.16, 0.2);
  sideFin.rotation.set(Math.PI * 0.5, -Math.PI * 0.1, -Math.PI * 0.08);
  root.add(sideFin);

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.46, -0.56, 0),
    new THREE.Vector3(-0.72, -0.86, 0.05),
    new THREE.Vector3(-0.58, -1.1, 0.08),
    new THREE.Vector3(-0.31, -1.08, 0.05),
    new THREE.Vector3(-0.24, -0.84, 0),
  ]);
  const tail = new THREE.Mesh(
    new THREE.TubeGeometry(tailCurve, 44, 0.06, 10, false),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 8),
      roughness: 0.34,
      metalness: 0.18,
      emissive: new THREE.Color("#1a3148"),
      emissiveIntensity: 0.13,
    }),
  );
  root.add(tail);

  const patchColors = [
    "#57c2cc",
    "#ef8a63",
    "#80a9db",
    "#f0c66f",
    "#66c6d2",
  ];
  const patchPositions: Array<[number, number, number, number]> = [
    [-0.28, 0.2, 0.21, 0.13],
    [0.02, -0.08, 0.2, 0.11],
    [0.24, 0.32, 0.2, 0.1],
    [0.21, -0.21, 0.18, 0.09],
    [-0.08, 0.5, 0.2, 0.09],
  ];
  patchPositions.forEach((patch, idx) => {
    const [x, y, z, radius] = patch;
    const patchMesh = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 18),
      new THREE.MeshStandardMaterial({
        color: patchColors[idx % patchColors.length],
        roughness: 0.22,
        metalness: 0.18,
        emissive: new THREE.Color("#20384e"),
        emissiveIntensity: 0.11,
        side: THREE.DoubleSide,
      }),
    );
    patchMesh.position.set(x, y, z);
    root.add(patchMesh);
  });

  const orbs = new THREE.Group();
  root.add(orbs);
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? roomTheme.glowB : roomTheme.glowA,
        roughness: 0.2,
        metalness: 0.22,
        emissive: new THREE.Color(i % 2 === 0 ? roomTheme.glowB : roomTheme.glowA),
        emissiveIntensity: 0.24,
      }),
    );
    orb.position.set(Math.cos(angle) * 1.1, 0.45 + Math.sin(i * 0.9) * 0.35, Math.sin(angle) * 0.34);
    orb.userData.phase = angle;
    orbs.add(orb);
  }
  root.userData.orbs = orbs;

  return root;
};

const addRoomIdentity = (
  id: RoomId,
  group: THREE.Group,
  roomTheme: RoomTheme,
  paletteShift: number,
  muralTexture?: THREE.Texture | null,
) => {
  if (id === "home_atrium") {
    for (let i = 0; i < 5; i += 1) {
      const angle = -0.9 + i * 0.45;
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(1.05 + i * 0.12, 0.04, 12, 60, Math.PI),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? roomTheme.glowA : roomTheme.glowB,
          emissive: new THREE.Color(roomTheme.glowA),
          emissiveIntensity: 0.2,
          roughness: 0.25,
          metalness: 0.3,
        }),
      );
      arch.position.set(Math.sin(angle) * 4.3, 0.8 + i * 0.12, Math.cos(angle) * 1.1 - 0.2);
      arch.rotation.y = angle + Math.PI * 0.5;
      group.add(arch);
    }
    const seahorse = buildSeahorseSculpture(paletteShift, roomTheme);
    seahorse.position.set(4.4, -0.08, 2.4);
    seahorse.rotation.y = -Math.PI * 0.58;
    seahorse.scale.setScalar(1.46);
    seahorse.userData.basePosition = seahorse.position.clone();
    seahorse.userData.baseRotationY = seahorse.rotation.y;
    group.add(seahorse);
    return;
  }

  if (id === "manifesto_room") {
    for (let i = 0; i < 6; i += 1) {
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(1 + (i % 2) * 0.3, 1.8 + (i % 3) * 0.4),
        new THREE.MeshBasicMaterial({
          map: muralTexture ?? null,
          color: roomTheme.muralTint,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      banner.position.set(-2.8 + i * 1.1, 1.3 + (i % 2) * 0.5, -1.8 - (i % 3) * 0.5);
      banner.rotation.y = 0.2 - i * 0.1;
      banner.rotation.z = Math.sin(i * 0.8) * 0.14;
      group.add(banner);
    }
    return;
  }

  if (id === "regole_room") {
    for (let i = 0; i < 4; i += 1) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 2.6 + i * 0.3, 0.7),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? "#8eaedc" : "#f0cb78",
          roughness: 0.38,
          metalness: 0.24,
          emissive: new THREE.Color("#243650"),
          emissiveIntensity: 0.15,
        }),
      );
      pillar.position.set(-2.5 + i * 1.7, 0.3 + i * 0.15, -2.8);
      group.add(pillar);
    }
    return;
  }

  if (id === "rimozione_room") {
    const basin = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 40),
      new THREE.MeshStandardMaterial({
        color: "#2b4259",
        roughness: 0.18,
        metalness: 0.26,
        emissive: new THREE.Color("#174f5e"),
        emissiveIntensity: 0.22,
      }),
    );
    basin.rotation.x = -Math.PI / 2;
    basin.position.set(0, -0.96, -1.8);
    group.add(basin);

    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.05, 12, 60, Math.PI * 1.25),
      new THREE.MeshStandardMaterial({
        color: roomTheme.glowB,
        roughness: 0.28,
        metalness: 0.22,
        emissive: new THREE.Color(roomTheme.glowB),
        emissiveIntensity: 0.2,
      }),
    );
    arc.position.set(0.2, 1.5, -2.2);
    arc.rotation.y = Math.PI * 0.12;
    group.add(arc);
    return;
  }

  if (id === "archivio_room") {
    for (let i = 0; i < 8; i += 1) {
      const angle = (i / 8) * Math.PI * 2;
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.18, 0.9, 12),
        new THREE.MeshStandardMaterial({
          color: "#1f5368",
          roughness: 0.35,
          metalness: 0.26,
          emissive: new THREE.Color("#1d6072"),
          emissiveIntensity: 0.16,
        }),
      );
      stand.position.set(Math.cos(angle) * 2.7, -0.55, -2 + Math.sin(angle) * 1.1);
      group.add(stand);
    }
    return;
  }

  if (id === "offri_room") {
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 1.2, 0.72, 24),
      new THREE.MeshStandardMaterial({
        color: "#4a3e35",
        roughness: 0.45,
        metalness: 0.18,
        emissive: new THREE.Color("#5f4d36"),
        emissiveIntensity: 0.12,
      }),
    );
    altar.position.set(0, -0.62, -2.1);
    group.add(altar);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.0, 16),
      new THREE.MeshStandardMaterial({
        color: roomTheme.glowB,
        roughness: 0.24,
        metalness: 0.12,
        emissive: new THREE.Color(roomTheme.glowB),
        emissiveIntensity: 0.42,
      }),
    );
    flame.position.set(0, 0.35, -2.1);
    group.add(flame);
    return;
  }

  if (id === "offering_detail_room") {
    for (let i = 0; i < 3; i += 1) {
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(1.1 + i * 0.34, 0.03, 10, 80),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? roomTheme.glowA : roomTheme.glowB,
          roughness: 0.26,
          metalness: 0.24,
          emissive: new THREE.Color(i % 2 === 0 ? roomTheme.glowA : roomTheme.glowB),
          emissiveIntensity: 0.2,
        }),
      );
      frame.rotation.x = Math.PI / 2;
      frame.position.set(0, 1.2 + i * 0.22, -1.9);
      group.add(frame);
    }
  }
};

const buildCreature = (group: THREE.Group, paletteShift: number) => {
  const rng = createSeededRng((paletteShift + 5) * 9173);
  const body = new THREE.Group();
  body.scale.setScalar(0.58);
  group.add(body);

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: pickPaletteColor(paletteShift + 1),
    roughness: 0.34,
    metalness: 0.23,
    emissive: new THREE.Color("#122f40"),
    emissiveIntensity: 0.18,
  });
  applyPainterlyMaterial(bodyMaterial, rng() * 1000 + 4);

  const bodyMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 2.2, 12, 18), bodyMaterial);
  bodyMesh.rotation.z = Math.PI * 0.5;
  bodyMesh.position.set(0, 0.3, 0);
  body.add(bodyMesh);

  const neck = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.16, 0.9, 8, 14),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 2),
      roughness: 0.4,
      metalness: 0.2,
      emissive: new THREE.Color("#12354a"),
      emissiveIntensity: 0.22,
    }),
  );
  neck.position.set(1.25, 0.92, 0.08);
  neck.rotation.z = Math.PI * 0.35;
  body.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 20, 18),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 3),
      roughness: 0.28,
      metalness: 0.22,
      emissive: new THREE.Color("#133850"),
      emissiveIntensity: 0.2,
    }),
  );
  head.position.set(1.7, 1.16, 0.11);
  body.add(head);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.11, 0.54, 12),
    new THREE.MeshStandardMaterial({
      color: pickPaletteColor(paletteShift + 4),
      roughness: 0.35,
      metalness: 0.18,
      emissive: new THREE.Color("#4f2e18"),
      emissiveIntensity: 0.12,
    }),
  );
  beak.rotation.z = -Math.PI * 0.5;
  beak.position.set(2.02, 1.15, 0.11);
  body.add(beak);

  for (const legX of [-0.65, 0.55]) {
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.08, 0.78, 8, 10),
      new THREE.MeshStandardMaterial({
        color: pickPaletteColor(paletteShift + (legX < 0 ? 5 : 6)),
        roughness: 0.4,
        metalness: 0.18,
      }),
    );
    leg.position.set(legX, -0.28, 0);
    body.add(leg);
  }

  const tail = new THREE.Group();
  tail.position.set(-1.36, 0.58, 0);
  body.add(tail);
  for (let i = 0; i < 5; i += 1) {
    const plume = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.66, 6, 10),
      new THREE.MeshStandardMaterial({
        color: pickPaletteColor(paletteShift + 7 + i),
        roughness: 0.32,
        metalness: 0.16,
        emissive: new THREE.Color("#172a3a"),
        emissiveIntensity: 0.16,
      }),
    );
    plume.rotation.set(-0.2 + i * 0.15, 0.22 + i * 0.12, -0.4 + i * 0.2);
    plume.position.set(-0.12 + i * 0.1, 0.1 + i * 0.08, -0.14 + i * 0.08);
    tail.add(plume);
  }

  const orbs = new THREE.Group();
  body.add(orbs);
  for (let i = 0; i < 10; i += 1) {
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.05 + rng() * 0.05, 12, 12),
      new THREE.MeshStandardMaterial({
        color: pickPaletteColor(paletteShift + i),
        emissive: new THREE.Color("#1a3f56"),
        emissiveIntensity: 0.32,
        roughness: 0.2,
        metalness: 0.24,
      }),
    );
    const angle = (i / 10) * Math.PI * 2;
    orb.position.set(Math.cos(angle) * (1.6 + rng() * 0.4), 0.7 + Math.sin(i * 1.3) * 0.4, Math.sin(angle) * 0.35);
    orbs.add(orb);
  }

  body.userData.orbs = orbs;
  body.userData.seed = rng() * 1000 + 10;
  group.userData.signatureBody = body;
};

export const createTextSprite = (text: string, colorA: string, colorB: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.Sprite(new THREE.SpriteMaterial({ color: colorA }));
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  ctx.fillStyle = "rgba(8, 11, 16, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = gradient;
  ctx.font = "700 36px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    }),
  );
  sprite.scale.set(1.34, 0.34, 1);
  return sprite;
};

export const buildRoom = ({
  id,
  center,
  paletteShift,
  muralTexture,
  artModelSource,
  portalTargets,
  utilityHotspots = [],
  signatureScale = 1,
  theme,
}: BuildRoomInput): WorldRoomRuntime => {
  const roomTheme: RoomTheme = { ...DEFAULT_THEME, ...(theme || {}) };
  const group = new THREE.Group();
  group.position.copy(center);
  const rng = createSeededRng((paletteShift + 17) * 7151);

  const roomShell = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 7.8, 5.6, 42, 1, true),
    new THREE.MeshStandardMaterial({
      color: roomTheme.shellColor,
      roughness: 0.83,
      metalness: 0.08,
      transparent: true,
      opacity: 0.97,
      side: THREE.BackSide,
    }),
  );
  roomShell.position.y = 1.8;
  group.add(roomShell);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7.25, 52),
    new THREE.MeshStandardMaterial({
      color: roomTheme.floorColor,
      roughness: 0.76,
      metalness: 0.2,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  group.add(floor);

  const localKey = new THREE.PointLight(roomTheme.glowA, 1.2, 18, 1.7);
  localKey.position.set(-1.8, 2.8, 1.2);
  group.add(localKey);

  const localFill = new THREE.PointLight(roomTheme.glowB, 0.95, 14, 1.9);
  localFill.position.set(2.4, 1.6, -1.4);
  group.add(localFill);

  const floorRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.25, 0.08, 20, 80),
    new THREE.MeshStandardMaterial({
      color: roomTheme.glowA,
      roughness: 0.24,
      metalness: 0.42,
      emissive: new THREE.Color(roomTheme.glowA),
      emissiveIntensity: 0.3,
    }),
  );
  floorRing.rotation.x = Math.PI / 2;
  floorRing.position.y = -0.98;
  group.add(floorRing);

  const muralMaterial = new THREE.MeshBasicMaterial({
    color: roomTheme.muralTint,
    transparent: true,
    opacity: 0.74,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: muralTexture ?? null,
  });
  const mural = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 3.8), muralMaterial);
  mural.position.set(0, 1.2, -3.7);
  group.add(mural);

  const sideMuralGeometry = new THREE.PlaneGeometry(3.2, 2.0);
  for (const side of [-1, 1]) {
    const panel = new THREE.Mesh(
      sideMuralGeometry,
      new THREE.MeshBasicMaterial({
        color: roomTheme.muralTint,
        transparent: true,
        opacity: 0.28,
        map: muralTexture ?? null,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    panel.position.set(side * 5.9, 1.2, -0.4);
    panel.rotation.y = -side * Math.PI * 0.45;
    group.add(panel);
  }

  const overheadHalo = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.05, 18, 90),
    new THREE.MeshStandardMaterial({
      color: roomTheme.glowB,
      roughness: 0.3,
      metalness: 0.28,
      emissive: new THREE.Color(roomTheme.glowB),
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.85,
    }),
  );
  overheadHalo.position.set(0, 3.35, 0);
  overheadHalo.rotation.x = Math.PI / 2;
  group.add(overheadHalo);

  const signature = new THREE.Group();
  signature.position.set(0, -0.34, -2.9);
  signature.scale.setScalar(signatureScale * 0.68);
  group.add(signature);

  buildCreature(signature, paletteShift);
  signature.userData.floorRing = floorRing;
  signature.userData.overheadHalo = overheadHalo;
  signature.userData.seed = (paletteShift + 1) * 0.731;
  addRoomIdentity(id, group, roomTheme, paletteShift, muralTexture);

  if (artModelSource) {
    const relief = createArtRelief({
      url: artModelSource,
      width: 4.6,
      height: 2.4,
      depth: 1.2,
      maxInstances: 2200,
      sampleStep: 2,
      fallbackColor: roomTheme.glowA,
    });
    relief.position.set(0, 1.2, -2.4);
    relief.rotation.y = Math.PI;
    relief.userData.basePosition = relief.position.clone();
    relief.userData.baseRotation = relief.rotation.clone();
    relief.userData.baseScale = 1;
    group.add(relief);
    group.userData.artRelief = relief;
  }

  const ambienceParticles = new THREE.Group();
  for (let i = 0; i < 28; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 + rng() * 0.05, 10, 10),
      new THREE.MeshStandardMaterial({
        color: pickPaletteColor(paletteShift + i),
        roughness: 0.2,
        metalness: 0.22,
        emissive: new THREE.Color(roomTheme.glowA),
        emissiveIntensity: 0.18,
      }),
    );
    const angle = rng() * Math.PI * 2;
    const radius = 1.4 + rng() * 4.6;
    const x = Math.cos(angle) * radius;
    const y = 0.3 + rng() * 2.9;
    const z = -0.6 + (rng() - 0.5) * 4.8;
    particle.position.set(x, y, z);
    particle.userData.baseX = x;
    particle.userData.baseY = y;
    particle.userData.baseZ = z;
    particle.userData.phase = rng() * Math.PI * 2;
    particle.userData.amp = 0.02 + rng() * 0.11;
    particle.userData.speed = 0.35 + rng() * 1.1;
    ambienceParticles.add(particle);
  }
  group.add(ambienceParticles);
  group.userData.ambienceParticles = ambienceParticles;

  const hotspots: WorldHotspot[] = [];
  const registerHotspot = (
    label: string,
    action: HotspotAction,
    offset: [number, number, number],
    kind: WorldHotspot["kind"],
    index: number,
  ) => {
    const color = pickPaletteColor(paletteShift + index + 2);
    const portalMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.055, 12, 68),
      makePortalMaterial(color),
    );
    portalMesh.position.set(offset[0], offset[1], offset[2]);
    portalMesh.rotation.x = Math.PI / 2;
    group.add(portalMesh);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.38,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.26,
      }),
    );
    core.position.copy(portalMesh.position);
    core.position.y += 0.02;
    group.add(core);

    const labelSprite = createTextSprite(label, color, "#f4e9ce");
    labelSprite.position.set(offset[0], offset[1] + 0.9, offset[2]);
    group.add(labelSprite);

    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 1.55, 14, 1, true),
      makePortalBeamMaterial(color),
    );
    beam.position.set(offset[0], offset[1] + 0.75, offset[2]);
    group.add(beam);

    const glyph = new THREE.Group();
    glyph.position.set(offset[0], offset[1], offset[2]);
    for (let g = 0; g < 6; g += 1) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.24,
          metalness: 0.28,
          emissive: new THREE.Color(color),
          emissiveIntensity: 0.28,
        }),
      );
      const ga = (g / 6) * Math.PI * 2;
      dot.position.set(Math.cos(ga) * 0.25, 0.05 + (g % 2) * 0.02, Math.sin(ga) * 0.25);
      dot.userData.phase = rng() * Math.PI * 2;
      dot.userData.offsetY = dot.position.y;
      glyph.add(dot);
    }
    group.add(glyph);

    const target = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 14, 14),
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    target.position.copy(portalMesh.position);
    group.add(target);

    target.userData.portalMesh = portalMesh;
    target.userData.portalCore = core;
    target.userData.portalLabel = labelSprite;
    target.userData.portalBeam = beam;
    target.userData.portalGlyph = glyph;
    target.userData.hoverScale = 1;

    hotspots.push({
      id: `${id}-${kind}-${index}`,
      roomId: id,
      label,
      mesh: target,
      action,
      kind,
    });
  };

  portalTargets.forEach((portal, index) =>
    registerHotspot(portal.label, portal.action, portal.offset, "portal", index),
  );
  utilityHotspots.forEach((portal, index) =>
    registerHotspot(portal.label, portal.action, portal.offset, "utility", index + portalTargets.length),
  );

  return {
    id,
    group,
    hotspots,
  };
};
