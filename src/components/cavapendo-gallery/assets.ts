import { useMemo } from "react";
import * as THREE from "three";
import { MEADOW_AMBIENCE_AUDIO_PATHS } from "@/components/cavapendo-gallery/audio";
import { type QualityTier } from "@/components/cavapendo-gallery/runtime";

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
};

const generatedTextureCache = {
  galleryWall: new Map<QualityTier, THREE.Texture | null>(),
  galleryFloor: new Map<QualityTier, THREE.Texture | null>(),
  exteriorWindow: new Map<QualityTier, THREE.Texture | null>(),
  glassPane: new Map<QualityTier, THREE.Texture | null>(),
  sunbeam: new Map<QualityTier, THREE.Texture | null>(),
  meadowGrass: new Map<QualityTier, THREE.Texture | null>(),
  meadowShadow: new Map<QualityTier, THREE.Texture | null>(),
};

const AUDIO_PRELOAD_PATHS = MEADOW_AMBIENCE_AUDIO_PATHS;

const textureSizeByTier = (tier: QualityTier) => {
  if (tier === "low") return 512;
  if (tier === "medium") return 896;
  return 1408;
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
  glaze.addColorStop(0.38, "rgba(255,255,255,0.03)");
  glaze.addColorStop(0.76, "rgba(188,162,138,0.02)");
  glaze.addColorStop(1, "rgba(72,48,33,0.04)");
  ctx.fillStyle = glaze;
  ctx.fillRect(0, 0, size, size);

  const washCount = tier === "low" ? 9 : tier === "medium" ? 14 : 20;
  ctx.save();
  ctx.filter = `blur(${Math.round(size * 0.03)}px)`;
  for (let i = 0; i < washCount; i += 1) {
    const x = seededRandom(i + 1) * size;
    const y = seededRandom(i + 2) * size;
    const radius = size * (0.14 + seededRandom(i + 3) * 0.2);
    const wash = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    const color = i % 2 === 0 ? palette.speckA : palette.speckB;
    wash.addColorStop(0, `${color}16`);
    wash.addColorStop(0.58, `${color}0a`);
    wash.addColorStop(1, `${color}00`);
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const sweepCount = tier === "low" ? 2 : tier === "medium" ? 3 : 4;
  for (let i = 0; i < sweepCount; i += 1) {
    const stripeX = seededRandom(i + 91) * size;
    const stripeWidth = size * (0.18 + seededRandom(i + 97) * 0.12);
    const sweep = ctx.createLinearGradient(stripeX, 0, stripeX + stripeWidth, 0);
    sweep.addColorStop(0, "rgba(255,255,255,0)");
    sweep.addColorStop(0.5, `rgba(255,255,255,${0.015 + seededRandom(i + 103) * 0.016})`);
    sweep.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sweep;
    ctx.fillRect(stripeX, 0, stripeWidth, size);
  }

  const speckCount = tier === "low" ? 84 : tier === "medium" ? 138 : 220;
  for (let i = 0; i < speckCount; i += 1) {
    const x = seededRandom(i + 121) * size;
    const y = seededRandom(i + 151) * size;
    const radius = 0.6 + seededRandom(i + 181) * (tier === "high" ? 2.1 : 1.5);
    ctx.globalAlpha = 0.012 + seededRandom(i + 211) * 0.02;
    ctx.fillStyle = i % 2 === 0 ? palette.speckA : palette.speckB;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const lineCount = tier === "low" ? 2 : tier === "medium" ? 3 : 4;
  ctx.strokeStyle = palette.line;
  ctx.lineWidth = 1;
  for (let i = 0; i < lineCount; i += 1) {
    const startX = seededRandom(i + 31) * size;
    const startY = seededRandom(i + 32) * size;
    const endX = startX + size * (seededRandom(i + 33) * 0.5 - 0.25);
    const endY = startY + size * (seededRandom(i + 34) * 0.4 - 0.2);
    const controlX = (startX + endX) / 2 + size * (seededRandom(i + 35) * 0.14 - 0.07);
    const controlY = (startY + endY) / 2 + size * (seededRandom(i + 36) * 0.14 - 0.07);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
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
          base: "#ebe1d5",
          speckA: "#fbf4ea",
          speckB: "#dccab7",
          line: "rgba(112, 88, 66, 0.02)",
        },
        [2.45, 1.85],
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
  sky.addColorStop(0, "#6485ba");
  sky.addColorStop(0.22, "#bfd3ef");
  sky.addColorStop(0.46, "#f0ece2");
  sky.addColorStop(0.7, "#d4dfc4");
  sky.addColorStop(1, "#53734e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const atmosphere = ctx.createLinearGradient(0, canvas.height * 0.18, 0, canvas.height);
  atmosphere.addColorStop(0, "rgba(255,255,255,0.02)");
  atmosphere.addColorStop(0.42, "rgba(247,236,214,0.08)");
  atmosphere.addColorStop(0.78, "rgba(215,228,200,0.12)");
  atmosphere.addColorStop(1, "rgba(132,157,108,0.08)");
  ctx.fillStyle = atmosphere;
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

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  ctx.fillRect(0, canvas.height * 0.58, canvas.width, canvas.height * 0.01);

  const farRidge = ctx.createLinearGradient(
    0,
    canvas.height * 0.4,
    0,
    canvas.height * 0.68,
  );
  farRidge.addColorStop(0, "rgba(183, 196, 210, 0.8)");
  farRidge.addColorStop(1, "rgba(126, 145, 156, 0.7)");
  ctx.fillStyle = farRidge;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height * 0.61);
  for (let x = 0; x <= canvas.width; x += canvas.width / 10) {
    const crest = canvas.height * (0.46 + seededRandom(x + 82) * 0.06);
    ctx.quadraticCurveTo(
      x + canvas.width / 20,
      crest,
      x + canvas.width / 10,
      canvas.height * 0.61,
    );
  }
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  ctx.fill();

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
  hill.addColorStop(0, "#7a9a68");
  hill.addColorStop(1, "#243d22");
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

  const hazeCount = tier === "low" ? 2 : tier === "medium" ? 3 : 4;
  for (let index = 0; index < hazeCount; index += 1) {
    const startX = canvas.width * (-0.06 + index * 0.24);
    const haze = ctx.createLinearGradient(
      startX,
      canvas.height * 0.5,
      startX + canvas.width * 0.42,
      canvas.height * 0.72,
    );
    haze.addColorStop(0, "rgba(255,247,234,0)");
    haze.addColorStop(0.48, "rgba(255,246,229,0.11)");
    haze.addColorStop(0.72, "rgba(232,239,224,0.14)");
    haze.addColorStop(1, "rgba(255,247,234,0)");
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.moveTo(startX, canvas.height * 0.57);
    ctx.bezierCurveTo(
      startX + canvas.width * 0.08,
      canvas.height * 0.53,
      startX + canvas.width * 0.22,
      canvas.height * 0.64,
      startX + canvas.width * 0.42,
      canvas.height * 0.61,
    );
    ctx.lineTo(startX + canvas.width * 0.42, canvas.height * 0.7);
    ctx.bezierCurveTo(
      startX + canvas.width * 0.24,
      canvas.height * 0.71,
      startX + canvas.width * 0.1,
      canvas.height * 0.66,
      startX,
      canvas.height * 0.68,
    );
    ctx.closePath();
    ctx.fill();
  }

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
  meadow.addColorStop(0, "rgba(156, 188, 117, 0.92)");
  meadow.addColorStop(0.52, "#729457");
  meadow.addColorStop(1, "#163f1d");
  ctx.fillStyle = meadow;
  ctx.fillRect(0, canvas.height * 0.72, canvas.width, canvas.height * 0.28);

  ctx.fillStyle = "rgba(188, 153, 102, 0.85)";
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.38, canvas.height);
  ctx.quadraticCurveTo(
    canvas.width * 0.46,
    canvas.height * 0.77,
    canvas.width * 0.5,
    canvas.height * 0.75,
  );
  ctx.quadraticCurveTo(
    canvas.width * 0.56,
    canvas.height * 0.73,
    canvas.width * 0.62,
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

  const groveCount = tier === "low" ? 8 : tier === "medium" ? 12 : 18;
  for (let index = 0; index < groveCount; index += 1) {
    const x = seededRandom(index + 980) * canvas.width;
    const y = canvas.height * (0.8 + seededRandom(index + 1010) * 0.08);
    const radiusX = canvas.width * (0.018 + seededRandom(index + 1040) * 0.032);
    const radiusY = canvas.height * (0.018 + seededRandom(index + 1070) * 0.03);
    ctx.fillStyle =
      index % 2 === 0 ? "rgba(61, 95, 54, 0.2)" : "rgba(128, 157, 104, 0.14)";
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
  }

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

const getGlassPaneTexture = (tier: QualityTier) => {
  if (generatedTextureCache.glassPane.has(tier)) {
    return generatedTextureCache.glassPane.get(tier) || null;
  }

  const size = tier === "high" ? 1400 : tier === "medium" ? 1024 : 768;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  const hazePasses = tier === "low" ? 4 : tier === "medium" ? 6 : 8;
  ctx.save();
  ctx.filter = `blur(${Math.round(size * 0.018)}px)`;
  for (let index = 0; index < hazePasses; index += 1) {
    const x = seededRandom(index + 1601) * size;
    const y = seededRandom(index + 1631) * size;
    const radius = size * (0.1 + seededRandom(index + 1661) * 0.18);
    const haze = ctx.createRadialGradient(x, y, radius * 0.12, x, y, radius);
    haze.addColorStop(0, "rgba(255,255,255,0.13)");
    haze.addColorStop(0.54, "rgba(233,242,255,0.045)");
    haze.addColorStop(1, "rgba(233,242,255,0)");
    ctx.fillStyle = haze;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const streakCount = tier === "low" ? 10 : tier === "medium" ? 16 : 24;
  for (let index = 0; index < streakCount; index += 1) {
    const x = seededRandom(index + 1701) * size;
    const width = size * (0.004 + seededRandom(index + 1731) * 0.008);
    const streak = ctx.createLinearGradient(x, 0, x + width, 0);
    streak.addColorStop(0, "rgba(255,255,255,0)");
    streak.addColorStop(0.5, `rgba(255,255,255,${0.018 + seededRandom(index + 1761) * 0.016})`);
    streak.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(x, 0, width, size);
  }

  for (let index = 0; index < (tier === "high" ? 7 : tier === "medium" ? 5 : 3); index += 1) {
    const startX = size * (0.08 + seededRandom(index + 1901) * 0.84);
    const startY = size * (0.04 + seededRandom(index + 1931) * 0.18);
    const endX = startX + size * (0.02 + seededRandom(index + 1961) * 0.08);
    const endY = size * (0.78 + seededRandom(index + 1991) * 0.16);
    ctx.strokeStyle = `rgba(235,245,255,${0.022 + seededRandom(index + 2021) * 0.018})`;
    ctx.lineWidth = size * (0.0014 + seededRandom(index + 2051) * 0.0012);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + size * 0.01,
      startY + size * 0.18,
      endX - size * 0.016,
      endY - size * 0.14,
      endX,
      endY,
    );
    ctx.stroke();
  }

  const gloss = ctx.createLinearGradient(size * 0.02, 0, size * 0.98, size);
  gloss.addColorStop(0, "rgba(255,255,255,0)");
  gloss.addColorStop(0.34, "rgba(255,255,255,0.012)");
  gloss.addColorStop(0.5, "rgba(255,255,255,0.075)");
  gloss.addColorStop(0.62, "rgba(255,255,255,0.02)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, size, size);

  const edgeGloss = ctx.createLinearGradient(0, 0, size, 0);
  edgeGloss.addColorStop(0, "rgba(255,255,255,0.045)");
  edgeGloss.addColorStop(0.08, "rgba(255,255,255,0.01)");
  edgeGloss.addColorStop(0.92, "rgba(255,255,255,0.012)");
  edgeGloss.addColorStop(1, "rgba(255,255,255,0.05)");
  ctx.fillStyle = edgeGloss;
  ctx.fillRect(0, 0, size, size);

  const sparkCount = tier === "low" ? 4 : tier === "medium" ? 8 : 12;
  for (let index = 0; index < sparkCount; index += 1) {
    const x = seededRandom(index + 1801) * size;
    const y = seededRandom(index + 1831) * size;
    const radius = 1.4 + seededRandom(index + 1861) * 3.2;
    const sparkle = ctx.createRadialGradient(x, y, 0, x, y, radius);
    sparkle.addColorStop(0, "rgba(255,255,255,0.42)");
    sparkle.addColorStop(0.45, "rgba(255,255,255,0.09)");
    sparkle.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sparkle;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  generatedTextureCache.glassPane.set(tier, texture);
  return texture;
};

const getSunbeamTexture = (tier: QualityTier) => {
  if (generatedTextureCache.sunbeam.has(tier)) {
    return generatedTextureCache.sunbeam.get(tier) || null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = tier === "high" ? 2048 : 1536;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const beam = ctx.createLinearGradient(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height);
  beam.addColorStop(0, "rgba(255,250,228,0.9)");
  beam.addColorStop(0.18, "rgba(255,247,217,0.5)");
  beam.addColorStop(0.54, "rgba(255,245,214,0.18)");
  beam.addColorStop(1, "rgba(255,245,214,0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(canvas.width * 0.36, 0);
  ctx.lineTo(canvas.width * 0.64, 0);
  ctx.lineTo(canvas.width * 0.9, canvas.height);
  ctx.lineTo(canvas.width * 0.1, canvas.height);
  ctx.closePath();
  ctx.fill();

  const edgeGlow = ctx.createLinearGradient(0, 0, canvas.width, 0);
  edgeGlow.addColorStop(0, "rgba(255,255,255,0)");
  edgeGlow.addColorStop(0.5, "rgba(255,255,255,0.32)");
  edgeGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = edgeGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  generatedTextureCache.sunbeam.set(tier, texture);
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

  const ground = ctx.createLinearGradient(0, 0, 0, size);
  ground.addColorStop(0, "#aec487");
  ground.addColorStop(0.44, "#9ab276");
  ground.addColorStop(1, "#879f66");
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, size, size);

  const sunlight = ctx.createRadialGradient(
    size * 0.34,
    size * 0.18,
    size * 0.06,
    size * 0.34,
    size * 0.18,
    size * 0.88,
  );
  sunlight.addColorStop(0, "rgba(255,248,228,0.18)");
  sunlight.addColorStop(0.42, "rgba(255,248,228,0.08)");
  sunlight.addColorStop(1, "rgba(255,246,222,0)");
  ctx.fillStyle = sunlight;
  ctx.fillRect(0, 0, size, size);

  const shade = ctx.createLinearGradient(0, 0, size, size);
  shade.addColorStop(0, "rgba(76,94,56,0)");
  shade.addColorStop(0.58, "rgba(76,94,56,0.015)");
  shade.addColorStop(1, "rgba(51,64,39,0.035)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, size, size);

  const colorFieldCount = tier === "low" ? 5 : tier === "medium" ? 8 : 11;
  ctx.save();
  ctx.filter = `blur(${Math.round(size * 0.055)}px)`;
  for (let i = 0; i < colorFieldCount; i += 1) {
    const startX = seededRandom(i + 401) * size;
    const startY = seededRandom(i + 431) * size;
    const radius = size * (0.22 + seededRandom(i + 461) * 0.2);
    const wash = ctx.createRadialGradient(startX, startY, radius * 0.18, startX, startY, radius);
    wash.addColorStop(
      0,
      i % 2 === 0 ? "rgba(222, 231, 186, 0.085)" : "rgba(114, 138, 84, 0.065)",
    );
    wash.addColorStop(0.65, "rgba(170, 189, 128, 0.026)");
    wash.addColorStop(1, "rgba(166, 187, 123, 0)");
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const sweepCount = tier === "low" ? 4 : tier === "medium" ? 6 : 8;
  for (let i = 0; i < sweepCount; i += 1) {
    const startX = seededRandom(i + 5) * size;
    const startY = seededRandom(i + 11) * size;
    const width = size * (0.34 + seededRandom(i + 15) * 0.22);
    const bend = size * (0.012 + seededRandom(i + 21) * 0.026);
    ctx.strokeStyle =
      i % 2 === 0
        ? "rgba(230, 236, 194, 0.018)"
        : "rgba(118, 142, 86, 0.018)";
    ctx.lineWidth = size * (0.012 + seededRandom(i + 31) * 0.006);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(
      startX + width * 0.46,
      startY + bend,
      startX + width,
      startY - bend * 0.35,
    );
    ctx.stroke();
  }

  const bladeCount = tier === "low" ? 120 : tier === "medium" ? 200 : 300;
  for (let i = 0; i < bladeCount; i += 1) {
    const x = seededRandom(i + 101) * size;
    const y = seededRandom(i + 131) * size;
    const height = 4 + seededRandom(i + 151) * 6;
    const sway = seededRandom(i + 171) * 6 - 3;
    const hue = 86 + seededRandom(i + 191) * 5;
    const sat = 14 + seededRandom(i + 207) * 8;
    const light = 38 + seededRandom(i + 223) * 8;
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.035 + seededRandom(i + 241) * 0.04})`;
    ctx.lineWidth = 0.4 + seededRandom(i + 261) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + height * 0.25);
    ctx.quadraticCurveTo(x + sway * 0.4, y - height * 0.28, x + sway, y - height);
    ctx.stroke();
  }

  const fleckCount = tier === "low" ? 60 : tier === "medium" ? 90 : 130;
  for (let i = 0; i < fleckCount; i += 1) {
    const x = seededRandom(i + 301) * size;
    const y = seededRandom(i + 331) * size;
    const radius = 0.5 + seededRandom(i + 361) * 0.9;
    ctx.fillStyle =
      i % 4 === 0
        ? "rgba(236, 229, 194, 0.022)"
        : i % 2 === 0
          ? "rgba(118, 143, 84, 0.02)"
          : "rgba(96, 118, 69, 0.018)";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8, 2.8);
  texture.colorSpace = THREE.SRGBColorSpace;
  generatedTextureCache.meadowGrass.set(tier, texture);
  return texture;
};

const getMeadowShadowTexture = (tier: QualityTier) => {
  if (generatedTextureCache.meadowShadow.has(tier)) {
    return generatedTextureCache.meadowShadow.get(tier) || null;
  }

  const size = tier === "low" ? 768 : tier === "medium" ? 1024 : 1408;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  ctx.save();
  ctx.filter = `blur(${Math.round(size * 0.09)}px)`;
  const washCount = tier === "low" ? 6 : tier === "medium" ? 9 : 13;
  for (let i = 0; i < washCount; i += 1) {
    const centerX = seededRandom(i + 701) * size;
    const centerY = seededRandom(i + 733) * size;
    const radiusX = size * (0.12 + seededRandom(i + 761) * 0.16);
    const radiusY = size * (0.08 + seededRandom(i + 787) * 0.12);
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      radiusX * 0.08,
      centerX,
      centerY,
      Math.max(radiusX, radiusY),
    );
    gradient.addColorStop(0, "rgba(38, 48, 31, 0.035)");
    gradient.addColorStop(0.56, "rgba(38, 48, 31, 0.015)");
    gradient.addColorStop(1, "rgba(34, 44, 28, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      radiusX,
      radiusY,
      (seededRandom(i + 811) - 0.5) * 1.1,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const veilCount = tier === "low" ? 2 : tier === "medium" ? 3 : 4;
  for (let i = 0; i < veilCount; i += 1) {
    const startX = size * (0.08 + seededRandom(i + 861) * 0.84);
    const startY = size * (0.08 + seededRandom(i + 887) * 0.84);
    const width = size * (0.22 + seededRandom(i + 913) * 0.18);
    const height = size * (0.08 + seededRandom(i + 937) * 0.08);
    const gradient = ctx.createLinearGradient(
      startX,
      startY,
      startX + width,
      startY + height,
    );
    gradient.addColorStop(0, "rgba(36, 47, 30, 0)");
    gradient.addColorStop(0.5, "rgba(36, 47, 30, 0.014)");
    gradient.addColorStop(1, "rgba(36, 47, 30, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      startX,
      startY,
      width,
      height,
      (seededRandom(i + 961) - 0.5) * 0.85,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  const ambientBands = tier === "low" ? 2 : tier === "medium" ? 3 : 4;
  ctx.save();
  ctx.filter = `blur(${Math.round(size * 0.055)}px)`;
  for (let index = 0; index < ambientBands; index += 1) {
    const startX = size * (-0.08 + index * 0.28);
    const startY = size * (0.08 + seededRandom(index + 991) * 0.6);
    const width = size * (0.34 + seededRandom(index + 1021) * 0.18);
    const height = size * (0.1 + seededRandom(index + 1051) * 0.08);
    const veil = ctx.createLinearGradient(
      startX,
      startY,
      startX + width,
      startY + height,
    );
    veil.addColorStop(0, "rgba(28, 36, 24, 0)");
    veil.addColorStop(0.5, "rgba(28, 36, 24, 0.01)");
    veil.addColorStop(1, "rgba(28, 36, 24, 0)");
    ctx.fillStyle = veil;
    ctx.beginPath();
    ctx.ellipse(
      startX + width * 0.5,
      startY + height * 0.5,
      width,
      height,
      (seededRandom(index + 1081) - 0.5) * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.15, 1.15);
  texture.colorSpace = THREE.NoColorSpace;
  generatedTextureCache.meadowShadow.set(tier, texture);
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

export function useGlassPaneTexture(tier: QualityTier) {
  return useMemo(() => getGlassPaneTexture(tier), [tier]);
}

export function useSunbeamTexture(tier: QualityTier) {
  return useMemo(() => getSunbeamTexture(tier), [tier]);
}

export function useGrassTexture(tier: QualityTier) {
  return useMemo(() => getGrassTexture(tier), [tier]);
}

export function useMeadowShadowTexture(tier: QualityTier) {
  return useMemo(() => getMeadowShadowTexture(tier), [tier]);
}

export async function preloadCavapendoGalleryAssets(_deviceClass?: string) {
  ["low", "medium", "high"].forEach((tier) => {
    const qualityTier = tier as QualityTier;
    getGalleryWallTexture(qualityTier);
    getGalleryFloorTexture(qualityTier);
    getExteriorWindowTexture(qualityTier);
    getGlassPaneTexture(qualityTier);
    getSunbeamTexture(qualityTier);
    getGrassTexture(qualityTier);
    getMeadowShadowTexture(qualityTier);
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
