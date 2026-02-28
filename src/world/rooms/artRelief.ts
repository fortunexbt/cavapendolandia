import * as THREE from "three";

type ArtReliefOptions = {
  url: string;
  width?: number;
  height?: number;
  depth?: number;
  maxInstances?: number;
  sampleStep?: number;
  fallbackColor?: string;
};

const DEFAULTS: Required<Omit<ArtReliefOptions, "url">> = {
  width: 4.8,
  height: 2.6,
  depth: 1.35,
  maxInstances: 2400,
  sampleStep: 2,
  fallbackColor: "#53c0cb",
};

const LUMA = (r: number, g: number, b: number) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const SAT = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
};

const toReliefColor = (r: number, g: number, b: number, fallback: THREE.Color) => {
  const saturation = SAT(r, g, b);
  const luma = LUMA(r, g, b);
  if (saturation < 0.08) {
    const shade = new THREE.Color().copy(fallback).lerp(new THREE.Color("#f3c36f"), luma * 0.65);
    return shade;
  }
  return new THREE.Color(r / 255, g / 255, b / 255);
};

export const createArtRelief = (options: ArtReliefOptions) => {
  const cfg = { ...DEFAULTS, ...options };
  const root = new THREE.Group();
  const fallback = new THREE.Color(cfg.fallbackColor);
  root.userData.kind = "art-relief";
  root.userData.ready = false;
  root.userData.seed = (cfg.url.length * 13) % 71;

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(cfg.width + 0.3, cfg.height + 0.18, 0.06),
    new THREE.MeshStandardMaterial({
      color: "#101823",
      roughness: 0.52,
      metalness: 0.16,
      emissive: new THREE.Color("#0f2331"),
      emissiveIntensity: 0.14,
    }),
  );
  base.position.z = -0.05;
  root.add(base);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(cfg.width + 0.4, cfg.height + 0.28, 0.05),
    new THREE.MeshStandardMaterial({
      color: "#2d3b4b",
      roughness: 0.35,
      metalness: 0.25,
      emissive: new THREE.Color("#20384c"),
      emissiveIntensity: 0.16,
    }),
  );
  frame.position.z = -0.095;
  root.add(frame);

  const loader = new THREE.ImageLoader();
  loader.load(
    cfg.url,
    (image) => {
      const aspect = Math.max(0.2, image.width / Math.max(image.height, 1));
      const targetW = 220;
      const targetH = Math.round(targetW / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, targetW, targetH);
      const data = ctx.getImageData(0, 0, targetW, targetH).data;

      const points: Array<{
        x: number;
        y: number;
        z: number;
        scale: number;
        color: THREE.Color;
      }> = [];

      for (let y = 0; y < targetH; y += cfg.sampleStep) {
        for (let x = 0; x < targetW; x += cfg.sampleStep) {
          const idx = (y * targetW + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];
          if (a < 26) continue;
          const luma = LUMA(r, g, b);
          const sat = SAT(r, g, b);
          const energy = sat * 0.75 + luma * 0.45;
          if (energy < 0.12) continue;

          const nx = (x / Math.max(1, targetW - 1) - 0.5) * cfg.width;
          const ny = (0.5 - y / Math.max(1, targetH - 1)) * cfg.height;
          const nz = (0.12 + energy * 0.88) * cfg.depth;
          const scale = 0.045 + energy * 0.14;
          points.push({
            x: nx,
            y: ny,
            z: nz,
            scale,
            color: toReliefColor(r, g, b, fallback),
          });
        }
      }

      if (points.length === 0) return;

      if (points.length > cfg.maxInstances) {
        const stride = Math.ceil(points.length / cfg.maxInstances);
        for (let i = points.length - 1; i >= 0; i -= 1) {
          if (i % stride !== 0) points.splice(i, 1);
        }
      }

      const voxel = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: fallback,
        roughness: 0.28,
        metalness: 0.24,
        vertexColors: true,
        emissive: new THREE.Color("#143347"),
        emissiveIntensity: 0.13,
      });
      const instanced = new THREE.InstancedMesh(voxel, mat, points.length);

      const dummy = new THREE.Object3D();
      points.forEach((point, i) => {
        dummy.position.set(point.x, point.y, point.z);
        dummy.scale.setScalar(point.scale);
        dummy.rotation.set(
          point.x * 0.02,
          point.y * 0.03,
          (point.x + point.y + point.z) * 0.015,
        );
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
        instanced.setColorAt(i, point.color);
      });
      instanced.instanceMatrix.needsUpdate = true;
      if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
      root.add(instanced);
      root.userData.instanced = instanced;
      root.userData.ready = true;

      const halo = new THREE.Mesh(
        new THREE.PlaneGeometry(cfg.width * 1.08, cfg.height * 1.08),
        new THREE.MeshBasicMaterial({
          color: fallback,
          transparent: true,
          opacity: 0.1,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.position.z = 0.04;
      root.add(halo);
      root.userData.halo = halo;
    },
    undefined,
    () => {
      // Ignore load failures; room still renders with base/frame.
    },
  );

  return root;
};

