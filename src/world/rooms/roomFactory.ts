import * as THREE from "three";
import { createSeededRng, pickPaletteColor } from "@/world/materials/painterly";
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
  portalTargets: Array<{ label: string; action: HotspotAction; offset: [number, number, number] }>;
  utilityHotspots?: Array<{ label: string; action: HotspotAction; offset: [number, number, number] }>;
  theme?: Partial<RoomTheme>;
};

const makePortalMaterial = (color: string) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.09,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.08,
    transparent: true,
    opacity: 0.86,
  });

const DEFAULT_THEME: RoomTheme = {
  shellColor: "#25384c",
  floorColor: "#2e4358",
  glowA: "#8fc4d0",
  glowB: "#deba8a",
  muralTint: "#d9dfd8",
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
  for (let i = 0; i < 3; i += 1) {
    const angle = (i / 3) * Math.PI * 2;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 10, 10),
      new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? roomTheme.glowB : roomTheme.glowA,
        roughness: 0.3,
        metalness: 0.12,
        emissive: new THREE.Color(i % 2 === 0 ? roomTheme.glowB : roomTheme.glowA),
        emissiveIntensity: 0.16,
      }),
    );
    orb.position.set(Math.cos(angle) * 0.78, 0.42 + Math.sin(i * 0.9) * 0.22, Math.sin(angle) * 0.25);
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
  const monolith = (width: number, height: number, depth: number, color: string, emissive = "#25384a") =>
    new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.56,
        metalness: 0.1,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.1,
      }),
    );

  if (id === "home_atrium") {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.045, 12, 70, Math.PI),
      new THREE.MeshStandardMaterial({
        color: roomTheme.glowA,
        emissive: new THREE.Color(roomTheme.glowA),
        emissiveIntensity: 0.14,
        roughness: 0.32,
        metalness: 0.18,
      }),
    );
    arch.position.set(0, 1.12, -1.7);
    arch.rotation.y = Math.PI;
    group.add(arch);

    const seahorse = buildSeahorseSculpture(paletteShift, roomTheme);
    seahorse.position.set(2.9, -0.28, -2.1);
    seahorse.rotation.y = -Math.PI * 0.5;
    seahorse.scale.setScalar(1.34);
    seahorse.userData.basePosition = seahorse.position.clone();
    seahorse.userData.baseRotationY = seahorse.rotation.y;
    group.add(seahorse);
    return;
  }

  if (id === "manifesto_room") {
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.4),
      new THREE.MeshBasicMaterial({
        map: muralTexture ?? null,
        color: "#f2e8d4",
        transparent: true,
        opacity: 0.82,
        blending: THREE.NormalBlending,
        depthWrite: false,
      }),
    );
    banner.position.set(0, 1.3, -2.2);
    group.add(banner);

    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(3.35, 2.55),
      new THREE.MeshBasicMaterial({
        color: roomTheme.glowA,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    );
    frame.position.set(0, 1.3, -2.23);
    group.add(frame);

    const backPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.6),
      new THREE.MeshBasicMaterial({
        color: roomTheme.glowB,
        transparent: true,
        opacity: 0.14,
        depthWrite: false,
      }),
    );
    backPanel.position.set(0, 1.3, -2.26);
    group.add(backPanel);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.9, 10),
      new THREE.MeshStandardMaterial({
        color: "#f2e8d4",
        roughness: 0.35,
        metalness: 0.08,
        emissive: new THREE.Color(roomTheme.glowB),
        emissiveIntensity: 0.1,
      }),
    );
    mast.position.set(0, 1.8, -1.55);
    group.add(mast);

    return;
  }

  if (id === "regole_room") {
    const pillar = monolith(0.9, 3.2, 0.9, "#90a9be");
    pillar.position.set(0, 0.6, -2.25);
    group.add(pillar);
    return;
  }

  if (id === "rimozione_room") {
    const basin = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 40),
      new THREE.MeshStandardMaterial({
        color: "#2b3a4b",
        roughness: 0.24,
        metalness: 0.12,
        emissive: new THREE.Color("#243649"),
        emissiveIntensity: 0.1,
      }),
    );
    basin.rotation.x = -Math.PI / 2;
    basin.position.set(0, -0.96, -2.1);
    group.add(basin);
    return;
  }

  if (id === "archivio_room") {
    const stand = monolith(0.8, 1.4, 0.8, "#47667b");
    stand.position.set(0, -0.35, -2.2);
    group.add(stand);
    return;
  }

  if (id === "offri_room") {
    const altar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.88, 1.08, 0.72, 18),
      new THREE.MeshStandardMaterial({
        color: "#4a463f",
        roughness: 0.52,
        metalness: 0.1,
        emissive: new THREE.Color("#3d3327"),
        emissiveIntensity: 0.08,
      }),
    );
    altar.position.set(0, -0.62, -2.1);
    group.add(altar);
    return;
  }

  if (id === "offering_detail_room") {
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(1.34, 0.035, 10, 84),
      new THREE.MeshStandardMaterial({
        color: roomTheme.glowA,
        roughness: 0.28,
        metalness: 0.15,
        emissive: new THREE.Color(roomTheme.glowA),
        emissiveIntensity: 0.12,
      }),
    );
    frame.rotation.x = Math.PI / 2;
    frame.position.set(0, 1.2, -1.9);
    group.add(frame);
  }
};

export const createTextSprite = (text: string, colorA: string, colorB: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 110;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.Sprite(new THREE.SpriteMaterial({ color: colorA }));
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  ctx.fillStyle = "rgba(7, 10, 14, 0.14)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  ctx.fillStyle = gradient;
  ctx.font = "600 28px 'IBM Plex Mono', monospace";
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
      opacity: 0.86,
    }),
  );
  sprite.scale.set(1.24, 0.32, 1);
  return sprite;
};

export const buildRoom = ({
  id,
  center,
  paletteShift,
  muralTexture,
  portalTargets,
  utilityHotspots = [],
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
      roughness: 0.84,
      metalness: 0.04,
      emissive: new THREE.Color(roomTheme.glowA),
      emissiveIntensity: 0.07,
      transparent: true,
      opacity: 0.96,
      side: THREE.BackSide,
    }),
  );
  roomShell.position.y = 1.8;
  group.add(roomShell);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7.25, 52),
    new THREE.MeshStandardMaterial({
      color: roomTheme.floorColor,
      roughness: 0.8,
      metalness: 0.06,
      emissive: new THREE.Color("#1f3242"),
      emissiveIntensity: 0.04,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1;
  group.add(floor);

  const localKey = new THREE.PointLight(roomTheme.glowA, 1.04, 17, 1.7);
  localKey.position.set(-1.8, 2.8, 1.2);
  group.add(localKey);

  const localFill = new THREE.PointLight(roomTheme.glowB, 0.78, 14, 1.9);
  localFill.position.set(2.4, 1.6, -1.4);
  group.add(localFill);

  const floorRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.25, 0.08, 20, 80),
    new THREE.MeshStandardMaterial({
      color: roomTheme.glowA,
      roughness: 0.42,
      metalness: 0.14,
      emissive: new THREE.Color(roomTheme.glowA),
      emissiveIntensity: 0.12,
    }),
  );
  floorRing.rotation.x = Math.PI / 2;
  floorRing.position.y = -0.98;
  group.add(floorRing);

  const muralMaterial = new THREE.MeshBasicMaterial({
    color: roomTheme.muralTint,
    transparent: true,
    opacity: 0.52,
    blending: THREE.NormalBlending,
    depthWrite: false,
    map: muralTexture ?? null,
  });
  const mural = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 3.3), muralMaterial);
  mural.position.set(0, 1.2, -3.35);
  group.add(mural);

  const overheadHalo = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.05, 18, 90),
    new THREE.MeshStandardMaterial({
      color: roomTheme.glowB,
      roughness: 0.42,
      metalness: 0.14,
      emissive: new THREE.Color(roomTheme.glowB),
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.52,
    }),
  );
  overheadHalo.position.set(0, 3.35, 0);
  overheadHalo.rotation.x = Math.PI / 2;
  group.add(overheadHalo);
  addRoomIdentity(id, group, roomTheme, paletteShift, muralTexture);

  const ambienceParticles = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.015 + rng() * 0.028, 8, 8),
      new THREE.MeshStandardMaterial({
        color: pickPaletteColor(paletteShift + i),
        roughness: 0.32,
        metalness: 0.08,
        emissive: new THREE.Color(roomTheme.glowA),
        emissiveIntensity: 0.08,
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
    particle.userData.amp = 0.01 + rng() * 0.05;
    particle.userData.speed = 0.16 + rng() * 0.42;
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
      new THREE.TorusGeometry(0.42, 0.045, 10, 58),
      makePortalMaterial(color),
    );
    portalMesh.position.set(offset[0], offset[1], offset[2]);
    portalMesh.rotation.x = Math.PI / 2;
    group.add(portalMesh);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 10, 10),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.18,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.1,
      }),
    );
    core.position.copy(portalMesh.position);
    core.position.y += 0.02;
    group.add(core);

    const labelSprite = createTextSprite(label, color, "#f4e9ce");
    labelSprite.position.set(offset[0], offset[1] + 0.72, offset[2]);
    group.add(labelSprite);

    const target = new THREE.Mesh(
      new THREE.SphereGeometry(0.46, 12, 12),
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
