import { useMemo } from "react";
import * as THREE from "three";
import { type QualityTier } from "@/components/cavapendo-gallery/runtime";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const generatedTextureCache = {
  galleryWall: new Map<QualityTier, THREE.Texture | null>(),
  galleryFloor: new Map<QualityTier, THREE.Texture | null>(),
  exteriorWindow: new Map<QualityTier, THREE.Texture | null>(),
  meadowGrass: new Map<QualityTier, THREE.Texture | null>(),
};

const AUDIO_PRELOAD_PATHS = [
  "/audio/cavapendolandia/gallery-hush.wav",
  "/audio/cavapendolandia/meadow-wind.wav",
  "/audio/cavapendolandia/shrine-hum.wav",
  "/audio/cavapendolandia/return-hum.wav",
  "/audio/cavapendolandia/creature-call.wav",
];

const textureSizeByTier = (tier: QualityTier) => {
  if (tier === "low") return 256;
  if (tier === "medium") return 384;
  return 512;
};

const createPatternTexture = (
  tier: QualityTier,
  palette: {
    base: string;
    speckA: string;
    speckB: string;
    line: string;
  },
  repeat: [number, number],
) => {
  const size = textureSizeByTier(tier);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.fillStyle = palette.base;
  ctx.fillRect(0, 0, size, size);

  const glaze = ctx.createLinearGradient(0, 0, size, size);
  glaze.addColorStop(0, "rgba(255,255,255,0.08)");
  glaze.addColorStop(0.45, "rgba(255,255,255,0)");
  glaze.addColorStop(1, "rgba(60,39,26,0.1)");
  ctx.fillStyle = glaze;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 5; i += 1) {
    const stripeX = (size / 5) * i + seededRandom(i + 91) * 18;
    ctx.fillStyle = `rgba(88, 64, 44, ${0.02 + seededRandom(i + 97) * 0.03})`;
    ctx.fillRect(stripeX, 0, size / 8, size);
  }

  const speckCount = tier === "low" ? 220 : tier === "medium" ? 420 : 760;
  for (let i = 0; i < speckCount; i += 1) {
    const x = seededRandom(i + 1) * size;
    const y = seededRandom(i + 2) * size;
    const width = 1 + seededRandom(i + 4) * (tier === "high" ? 4 : 3);
    const alpha = 0.04 + seededRandom(i + 8) * 0.12;
    ctx.fillStyle =
      i % 2 === 0
        ? `${palette.speckA}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`
        : `${palette.speckB}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, "0")}`;
    ctx.fillRect(x, y, width, width);
  }

  const lineCount = tier === "low" ? 10 : tier === "medium" ? 16 : 24;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1;
  for (let i = 0; i < lineCount; i += 1) {
    ctx.beginPath();
    ctx.moveTo(seededRandom(i + 31) * size, seededRandom(i + 32) * size);
    ctx.lineTo(seededRandom(i + 33) * size, seededRandom(i + 34) * size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const getGalleryWallTexture = (tier: QualityTier) => {
  if (!generatedTextureCache.galleryWall.has(tier)) {
    generatedTextureCache.galleryWall.set(
      tier,
      createPatternTexture(
        tier,
        {
          base: "#d9c9b7",
          speckA: "#f0e6da",
          speckB: "#bea792",
          line: "rgba(109, 84, 62, 0.08)",
        },
        [3, 2],
      ),
    );
  }

  return generatedTextureCache.galleryWall.get(tier) || null;
};

const getGalleryFloorTexture = (tier: QualityTier) => {
  if (generatedTextureCache.galleryFloor.has(tier)) {
    return generatedTextureCache.galleryFloor.get(tier) || null;
  }

  const size = textureSizeByTier(tier);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const baseGradient = ctx.createLinearGradient(0, 0, size, size);
  baseGradient.addColorStop(0, "#8b553c");
  baseGradient.addColorStop(0.45, "#643928");
  baseGradient.addColorStop(1, "#472318");
  ctx.fillStyle = baseGradient;
  ctx.fillRect(0, 0, size, size);

  const plankHeight = size / 10;
  for (let row = 0; row < 10; row += 1) {
    const offset = row % 2 === 0 ? 0 : size / 14;
    for (let col = -1; col < 8; col += 1) {
      const plankWidth = size / 4 + seededRandom(row * 17 + col + 1) * (size / 14);
      const x = col * (size / 4) + offset;
      const y = row * plankHeight;
      const hue = 14 + seededRandom(row * 21 + col + 3) * 8;
      const sat = 44 + seededRandom(row * 9 + col + 5) * 12;
      const light = 24 + seededRandom(row * 12 + col + 7) * 16;
      ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
      ctx.fillRect(x, y, plankWidth, plankHeight + 1);

      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(x + 3, y + 2, plankWidth - 6, 3);
      ctx.fillStyle = "rgba(24, 11, 8, 0.18)";
      ctx.fillRect(x, y + plankHeight - 2, plankWidth, 2);
    }
  }

  for (let i = 0; i < 180; i += 1) {
    const x = seededRandom(i + 41) * size;
    const y = seededRandom(i + 63) * size;
    const width = 12 + seededRandom(i + 85) * 28;
    ctx.strokeStyle = `rgba(46, 21, 14, ${0.05 + seededRandom(i + 107) * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + width * 0.18,
      y - 2,
      x + width * 0.72,
      y + 6,
      x + width,
      y + 1,
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  generatedTextureCache.galleryFloor.set(tier, texture);
  return texture;
};

const getExteriorWindowTexture = (tier: QualityTier) => {
  if (generatedTextureCache.exteriorWindow.has(tier)) {
    return generatedTextureCache.exteriorWindow.get(tier) || null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = tier === "high" ? 1600 : tier === "medium" ? 1100 : 800;
  canvas.height = tier === "high" ? 700 : tier === "medium" ? 520 : 420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#557ab8");
  sky.addColorStop(0.26, "#a9c7eb");
  sky.addColorStop(0.52, "#d9e7ef");
  sky.addColorStop(0.74, "#b7d4ba");
  sky.addColorStop(1, "#486841");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 245, 217, 0.78)";
  ctx.beginPath();
  ctx.arc(
    canvas.width * 0.74,
    canvas.height * 0.22,
    canvas.height * 0.13,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  const cloudCount = tier === "low" ? 5 : tier === "medium" ? 8 : 12;
  for (let index = 0; index < cloudCount; index += 1) {
    const x = canvas.width * (0.08 + seededRandom(index + 301) * 0.84);
    const y = canvas.height * (0.12 + seededRandom(index + 331) * 0.26);
    const radius = canvas.height * (0.04 + seededRandom(index + 351) * 0.05);
    ctx.fillStyle = `rgba(255,255,255,${0.12 + seededRandom(index + 371) * 0.12})`;
    [-1, 0, 1].forEach((offset) => {
      ctx.beginPath();
      ctx.ellipse(
        x + offset * radius * 0.75,
        y + seededRandom(index + offset + 401) * radius * 0.2,
        radius * (0.9 + Math.abs(offset) * 0.2),
        radius * 0.58,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
  }

  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, canvas.height * 0.58, canvas.width, canvas.height * 0.012);

  const farHill = ctx.createLinearGradient(
    0,
    canvas.height * 0.44,
    0,
    canvas.height * 0.74,
  );
  farHill.addColorStop(0, "rgba(111, 142, 110, 0.78)");
  farHill.addColorStop(1, "rgba(65, 93, 69, 0.8)");
  ctx.fillStyle = farHill;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.66);
  for (let x = 0; x <= canvas.width; x += canvas.width / 9) {
    const crest = canvas.height * (0.48 + seededRandom(x + 135) * 0.08);
    ctx.quadraticCurveTo(
      x + canvas.width / 18,
      crest,
      x + canvas.width / 9,
      canvas.height * 0.66,
    );
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  const hill = ctx.createLinearGradient(
    0,
    canvas.height * 0.52,
    0,
    canvas.height,
  );
  hill.addColorStop(0, "#6d8e62");
  hill.addColorStop(1, "#20361f");
  ctx.fillStyle = hill;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.72);
  for (let x = 0; x <= canvas.width; x += canvas.width / 8) {
    const crest = canvas.height * (0.58 + seededRandom(x + 390) * 0.08);
    ctx.quadraticCurveTo(
      x + canvas.width / 16,
      crest,
      x + canvas.width / 8,
      canvas.height * 0.72,
    );
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(243, 227, 180, 0.18)";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.14, canvas.height);
  ctx.quadraticCurveTo(
    canvas.width * 0.22,
    canvas.height * 0.8,
    canvas.width * 0.28,
    canvas.height,
  );
  ctx.closePath();
  ctx.fill();

  const meadow = ctx.createLinearGradient(
    0,
    canvas.height * 0.66,
    0,
    canvas.height,
  );
  meadow.addColorStop(0, "rgba(112, 158, 92, 0.92)");
  meadow.addColorStop(1, "#103b19");
  ctx.fillStyle = meadow;
  ctx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);

  ctx.fillStyle = "rgba(188, 153, 102, 0.85)";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.44, canvas.height);
  ctx.quadraticCurveTo(
    canvas.width * 0.5,
    canvas.height * 0.76,
    canvas.width * 0.56,
    canvas.height,
  );
  ctx.closePath();
  ctx.fill();

  const treeCount = tier === "low" ? 12 : tier === "medium" ? 18 : 26;
  for (let index = 0; index < treeCount; index += 1) {
    const x = seededRandom(index + 430) * canvas.width;
    const scale = 0.6 + seededRandom(index + 470) * 1.2;
    const trunkHeight = canvas.height * 0.08 * scale;
    const trunkWidth = canvas.width * 0.008 * scale;
    const baseY = canvas.height * (0.75 + seededRandom(index + 490) * 0.06);

    ctx.fillStyle = "#60412f";
    ctx.fillRect(x, baseY - trunkHeight, trunkWidth, trunkHeight);

    ctx.fillStyle = index % 2 === 0 ? "#577548" : "#76965e";
    ctx.beginPath();
    ctx.moveTo(x - canvas.width * 0.03 * scale, baseY - trunkHeight * 0.4);
    ctx.lineTo(
      x + trunkWidth / 2,
      baseY - trunkHeight - canvas.height * 0.12 * scale,
    );
    ctx.lineTo(x + canvas.width * 0.035 * scale, baseY - trunkHeight * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#6e4e39";
  ctx.fillRect(canvas.width * 0.16, canvas.height * 0.74, canvas.width * 0.008, canvas.height * 0.1);
  ctx.fillStyle = "#86a76a";
  ctx.beginPath();
  ctx.ellipse(
    canvas.width * 0.164,
    canvas.height * 0.71,
    canvas.width * 0.038,
    canvas.height * 0.05,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "rgba(237, 232, 208, 0.88)";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.84, canvas.height * 0.73);
  ctx.lineTo(canvas.width * 0.865, canvas.height * 0.81);
  ctx.lineTo(canvas.width * 0.815, canvas.height * 0.81);
  ctx.closePath();
  ctx.fill();

  [0.22, 0.5, 0.78].forEach((position, index) => {
    const x = canvas.width * position;
    const y = canvas.height * (index === 1 ? 0.69 : 0.72);
    ctx.strokeStyle = "rgba(251, 241, 210, 0.78)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(x, y, canvas.height * 0.07, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = index === 1 ? "#fff2d2" : "#f1d998";
    ctx.beginPath();
    ctx.moveTo(x, y - canvas.height * 0.04);
    ctx.lineTo(x + canvas.height * 0.018, y + canvas.height * 0.04);
    ctx.lineTo(x - canvas.height * 0.018, y + canvas.height * 0.04);
    ctx.closePath();
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(16, 72, 17, 0.38)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 70; index += 1) {
    const x = seededRandom(index + 710) * canvas.width;
    const grassHeight =
      canvas.height * (0.02 + seededRandom(index + 740) * 0.05);
    const baseY = canvas.height * (0.82 + seededRandom(index + 770) * 0.13);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + canvas.width * 0.002, baseY - grassHeight);
    ctx.stroke();
  }

  for (let line = 0; line < 7; line += 1) {
    ctx.strokeStyle = `rgba(255,255,255,${tier === "high" ? 0.08 : 0.05})`;
    ctx.lineWidth = 1 + (line % 2);
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * (0.08 + line * 0.1));
    ctx.lineTo(canvas.width, canvas.height * (0.16 + line * 0.1));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  generatedTextureCache.exteriorWindow.set(tier, texture);
  return texture;
};

const getGrassTexture = (tier: QualityTier) => {
  if (generatedTextureCache.meadowGrass.has(tier)) {
    return generatedTextureCache.meadowGrass.get(tier) || null;
  }

  const size = textureSizeByTier(tier);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const ground = ctx.createLinearGradient(0, 0, size, size);
  ground.addColorStop(0, "#7da75a");
  ground.addColorStop(0.5, "#618843");
  ground.addColorStop(1, "#3f5f2c");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, size, size);

  const strokes = tier === "low" ? 300 : tier === "medium" ? 600 : 900;
  for (let i = 0; i < strokes; i += 1) {
    const x = seededRandom(i + 5) * size;
    const y = seededRandom(i + 11) * size;
    const height = 8 + seededRandom(i + 16) * 14;
    const hue = 92 + seededRandom(i + 21) * 18;
    const sat = 30 + seededRandom(i + 24) * 22;
    const light = 34 + seededRandom(i + 28) * 28;
    ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
    ctx.lineWidth = 1 + seededRandom(i + 30) * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + seededRandom(i + 31) * 8 - 4, y - height);
    ctx.stroke();
  }

  const flowerCount = tier === "low" ? 50 : tier === "medium" ? 86 : 130;
  const petals = ["#dfe8ad", "#d6d6ff", "#f3d6b2", "#fff3dc"];
  for (let i = 0; i < flowerCount; i += 1) {
    const x = seededRandom(i + 201) * size;
    const y = seededRandom(i + 217) * size;
    const radius = 1 + seededRandom(i + 235) * 2.4;
    ctx.fillStyle = petals[i % petals.length];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  generatedTextureCache.meadowGrass.set(tier, texture);
  return texture;
};

const preloadAudioFile = (src: string) =>
  new Promise<void>((resolve) => {
    const audio = new Audio(src);
    const finish = () => {
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("error", finish);
      resolve();
    };

    audio.preload = "auto";
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
    window.setTimeout(finish, 900);
  });

const waitForPreloadBudget = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export function useGalleryWallTexture(tier: QualityTier) {
  return useMemo(() => getGalleryWallTexture(tier), [tier]);
}

export function useGalleryFloorTexture(tier: QualityTier) {
  return useMemo(() => getGalleryFloorTexture(tier), [tier]);
}

export function useExteriorWindowTexture(tier: QualityTier) {
  return useMemo(() => getExteriorWindowTexture(tier), [tier]);
}

export function useGrassTexture(tier: QualityTier) {
  return useMemo(() => getGrassTexture(tier), [tier]);
}

export async function preloadCavapendoGalleryAssets(_deviceClass?: string) {
  ["low", "medium", "high"].forEach((tier) => {
    const qualityTier = tier as QualityTier;
    getGalleryWallTexture(qualityTier);
    getGalleryFloorTexture(qualityTier);
    getExteriorWindowTexture(qualityTier);
    getGrassTexture(qualityTier);
  });

  await Promise.race([
    Promise.allSettled(AUDIO_PRELOAD_PATHS.map((src) => preloadAudioFile(src))).then(
      () => undefined,
    ),
    waitForPreloadBudget(1200),
  ]);
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
