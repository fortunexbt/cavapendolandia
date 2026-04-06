import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  useGlassPaneTexture,
  useExteriorWindowTexture,
  useGalleryFloorTexture,
  useGalleryWallTexture,
  useSunbeamTexture,
} from "@/components/cavapendo-gallery/assets";
import {
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
} from "@/components/cavapendo-gallery/scene-primitives";
import { seededRandom } from "@/components/cavapendo-gallery/scene-utils";
import {
  type Offering,
} from "@/components/cavapendo-gallery/types";

const FRAME_COLORS = [
  "#b3926f",
  "#c2a07c",
  "#a88666",
  "#ceb08b",
  "#9f7d60",
  "#d0b392",
] as const;

type ExteriorCloud = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  opacity: number;
};

type ExteriorCypress = {
  x: number;
  scale: number;
  sway: number;
  tone: string;
};

type ExteriorBeacon = {
  x: number;
  y: number;
  height: number;
  phase: number;
  glow: string;
};

type ExteriorBird = {
  x: number;
  y: number;
  span: number;
  speed: number;
  phase: number;
};

function useAnimatedExteriorTexture(quality: QualityTier) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastDrawRef = useRef(-1);

  const cloudDefs = useMemo<ExteriorCloud[]>(
    () =>
      Array.from({ length: quality === "high" ? 12 : quality === "medium" ? 9 : 6 }, (_, index) => ({
        x: 0.06 + seededRandom(index + 10) * 0.9,
        y: 0.1 + seededRandom(index + 40) * 0.26,
        width: 0.07 + seededRandom(index + 70) * 0.09,
        height: 0.024 + seededRandom(index + 72) * 0.045,
        speed: 0.004 + seededRandom(index + 90) * 0.008,
        opacity: 0.14 + seededRandom(index + 120) * 0.16,
      })),
    [quality],
  );
  const cypressDefs = useMemo<ExteriorCypress[]>(
    () =>
      Array.from({ length: quality === "high" ? 18 : quality === "medium" ? 14 : 10 }, (_, index) => ({
        x: 0.04 + seededRandom(index + 210) * 0.92,
        scale: 0.75 + seededRandom(index + 230) * 1.5,
        sway: seededRandom(index + 250) * Math.PI * 2,
        tone:
          index % 3 === 0 ? "#2f5d3a" : index % 2 === 0 ? "#4d7248" : "#3a6741",
      })),
    [quality],
  );
  const beaconDefs = useMemo<ExteriorBeacon[]>(
    () =>
      [0.24, 0.5, 0.77].map((x, index) => ({
        x,
        y: index === 1 ? 0.705 : 0.73,
        height: index === 1 ? 0.12 : 0.1,
        phase: index * 0.9 + 0.3,
        glow: index === 1 ? "#fff0c7" : "#f3de98",
      })),
    [],
  );
  const birdDefs = useMemo<ExteriorBird[]>(
    () =>
      quality === "low"
        ? []
        : Array.from({ length: quality === "high" ? 5 : 3 }, (_, index) => ({
            x: 0.12 + seededRandom(index + 610) * 0.76,
            y: 0.16 + seededRandom(index + 640) * 0.14,
            span: 0.016 + seededRandom(index + 670) * 0.018,
            speed: 0.02 + seededRandom(index + 700) * 0.02,
            phase: seededRandom(index + 730) * Math.PI * 2,
          })),
    [quality],
  );

  const drawScene = useMemo(
    () => (timeSeconds: number) => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#6f89b5");
      sky.addColorStop(0.2, "#c9d8ee");
      sky.addColorStop(0.42, "#f2eee4");
      sky.addColorStop(0.62, "#d8e1c6");
      sky.addColorStop(1, "#5d7755");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const atmosphere = ctx.createLinearGradient(0, height * 0.18, 0, height);
      atmosphere.addColorStop(0, "rgba(255,255,255,0.02)");
      atmosphere.addColorStop(0.4, "rgba(247,236,214,0.08)");
      atmosphere.addColorStop(0.78, "rgba(223,232,203,0.14)");
      atmosphere.addColorStop(1, "rgba(134,160,108,0.1)");
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      const skyStrokeCount = quality === "high" ? 7 : quality === "medium" ? 5 : 3;
      for (let index = 0; index < skyStrokeCount; index += 1) {
        const y = height * (0.08 + index * 0.085);
        ctx.strokeStyle = `rgba(255,255,255,${quality === "low" ? 0.03 : 0.05})`;
        ctx.lineWidth = height * (0.018 + index * 0.0014);
        ctx.beginPath();
        ctx.moveTo(-width * 0.08, y);
        ctx.bezierCurveTo(
          width * 0.18,
          y - height * 0.03,
          width * 0.58,
          y + height * 0.02,
          width * 1.08,
          y - height * 0.014,
        );
        ctx.stroke();
      }

      const sunX = width * 0.73;
      const sunY = height * 0.22;
      const sunRadius = height * 0.096;
      const pulse = 0.94 + Math.sin(timeSeconds * 0.36) * 0.04;
      const halo = ctx.createRadialGradient(
        sunX,
        sunY,
        sunRadius * 0.2,
        sunX,
        sunY,
        sunRadius * 2.55,
      );
      halo.addColorStop(0, "rgba(255,244,214,0.84)");
      halo.addColorStop(0.5, "rgba(255,236,192,0.32)");
      halo.addColorStop(1, "rgba(255,236,192,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#fff0c4";
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * pulse, 0, Math.PI * 2);
      ctx.fill();

      const horizonGlow = ctx.createLinearGradient(0, height * 0.34, 0, height * 0.68);
      horizonGlow.addColorStop(0, "rgba(255,255,255,0)");
      horizonGlow.addColorStop(0.56, "rgba(255,242,212,0.26)");
      horizonGlow.addColorStop(1, "rgba(255,245,220,0)");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, height * 0.3, width, height * 0.42);

      cloudDefs.forEach((cloud, index) => {
        const drift = ((cloud.x + timeSeconds * cloud.speed) % 1.22) - 0.1;
        const x = drift * width;
        const y = cloud.y * height + Math.sin(timeSeconds * 0.18 + index) * height * 0.004;
        const cloudWidth = cloud.width * width;
        const cloudHeight = cloud.height * height;

        ctx.fillStyle = `rgba(255,255,255,${cloud.opacity})`;
        [-1, 0, 1].forEach((offset) => {
          ctx.beginPath();
          ctx.ellipse(
            x + offset * cloudWidth * 0.34,
            y + Math.sin(index + offset + timeSeconds * 0.4) * cloudHeight * 0.12,
            cloudWidth * (0.44 + Math.abs(offset) * 0.1),
            cloudHeight * (1 + Math.abs(offset) * 0.06),
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
      });

      const drawRidge = (
        baseY: number,
        amplitude: number,
        seedOffset: number,
        gradientStops: Array<[number, string]>,
        segments: number,
        phase: number,
      ) => {
        const ridge = ctx.createLinearGradient(0, height * (baseY - 0.12), 0, height);
        gradientStops.forEach(([stop, color]) => {
          ridge.addColorStop(stop, color);
        });
        ctx.fillStyle = ridge;
        ctx.beginPath();
        ctx.moveTo(0, height * baseY);
        for (let segment = 0; segment <= segments; segment += 1) {
          const segmentWidth = width / segments;
          const x = segment * segmentWidth;
          const crest =
            height *
            (baseY -
              amplitude * (0.35 + seededRandom(seedOffset + segment) * 0.9) +
              Math.sin(phase + segment * 0.42) * amplitude * 0.16);
          const nextX = x + segmentWidth;
          ctx.quadraticCurveTo(
            x + segmentWidth * 0.5,
            crest,
            nextX,
            height * baseY,
          );
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      };

      drawRidge(
        0.61,
        0.06,
        280,
        [
          [0, "rgba(183, 196, 210, 0.82)"],
          [1, "rgba(126, 145, 156, 0.72)"],
        ],
        10,
        timeSeconds * 0.05,
      );
      drawRidge(
        0.67,
        0.095,
        340,
        [
          [0, "rgba(151, 171, 160, 0.9)"],
          [1, "rgba(98, 119, 105, 0.92)"],
        ],
        8,
        timeSeconds * 0.08,
      );
      drawRidge(
        0.74,
        0.115,
        470,
        [
          [0, "#95af73"],
          [0.52, "#638553"],
          [1, "#2b4729"],
        ],
        7,
        timeSeconds * 0.12 + 1.1,
      );

      const mistBandCount = quality === "high" ? 4 : quality === "medium" ? 3 : 2;
      for (let index = 0; index < mistBandCount; index += 1) {
        const drift = ((timeSeconds * (0.008 + index * 0.002) + index * 0.26) % 1.4) - 0.2;
        const x = drift * width;
        const mist = ctx.createLinearGradient(x, height * 0.48, x + width * 0.5, height * 0.72);
        mist.addColorStop(0, "rgba(255,248,236,0)");
        mist.addColorStop(0.42, "rgba(255,246,229,0.12)");
        mist.addColorStop(0.68, "rgba(236,242,230,0.16)");
        mist.addColorStop(1, "rgba(255,248,236,0)");
        ctx.fillStyle = mist;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.57);
        ctx.bezierCurveTo(
          x + width * 0.14,
          height * 0.53,
          x + width * 0.26,
          height * 0.64,
          x + width * 0.5,
          height * 0.62,
        );
        ctx.lineTo(x + width * 0.5, height * 0.7);
        ctx.bezierCurveTo(
          x + width * 0.3,
          height * 0.72,
          x + width * 0.12,
          height * 0.66,
          x,
          height * 0.69,
        );
        ctx.closePath();
        ctx.fill();
      }

      const pathGradient = ctx.createLinearGradient(width * 0.5, height, width * 0.5, height * 0.72);
      pathGradient.addColorStop(0, "rgba(187, 149, 104, 0.9)");
      pathGradient.addColorStop(0.45, "rgba(226, 200, 156, 0.66)");
      pathGradient.addColorStop(1, "rgba(244, 225, 179, 0.08)");
      ctx.fillStyle = pathGradient;
      ctx.beginPath();
      ctx.moveTo(width * 0.38, height);
      ctx.bezierCurveTo(
        width * 0.43,
        height * 0.93,
        width * 0.44,
        height * 0.84,
        width * 0.48,
        height * 0.76,
      );
      ctx.bezierCurveTo(
        width * 0.52,
        height * 0.71,
        width * 0.58,
        height * 0.72,
        width * 0.62,
        height,
      );
      ctx.closePath();
      ctx.fill();

      const meadowGradient = ctx.createLinearGradient(0, height * 0.72, 0, height);
      meadowGradient.addColorStop(0, "rgba(162, 191, 120, 0.94)");
      meadowGradient.addColorStop(0.42, "#729457");
      meadowGradient.addColorStop(1, "#2c4727");
      ctx.fillStyle = meadowGradient;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      const sunWash = ctx.createRadialGradient(
        width * 0.72,
        height * 0.3,
        width * 0.05,
        width * 0.72,
        height * 0.3,
        width * 0.42,
      );
      sunWash.addColorStop(0, "rgba(255,244,209,0.18)");
      sunWash.addColorStop(0.58, "rgba(255,244,209,0.08)");
      sunWash.addColorStop(1, "rgba(255,244,209,0)");
      ctx.fillStyle = sunWash;
      ctx.fillRect(0, height * 0.44, width, height * 0.56);

      const shadowBandCount = quality === "high" ? 3 : quality === "medium" ? 2 : 1;
      for (let index = 0; index < shadowBandCount; index += 1) {
        const bandX = ((timeSeconds * (0.012 + index * 0.003) + index * 0.22) % 1.3) - 0.15;
        const x = bandX * width;
        const band = ctx.createLinearGradient(x, height * 0.64, x + width * 0.34, height);
        band.addColorStop(0, "rgba(45, 58, 37, 0)");
        band.addColorStop(0.44, "rgba(45, 58, 37, 0.12)");
        band.addColorStop(1, "rgba(45, 58, 37, 0)");
        ctx.fillStyle = band;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.72);
        ctx.bezierCurveTo(
          x + width * 0.08,
          height * 0.74,
          x + width * 0.2,
          height * 0.94,
          x + width * 0.34,
          height,
        );
        ctx.lineTo(x + width * 0.46, height);
        ctx.bezierCurveTo(
          x + width * 0.32,
          height * 0.9,
          x + width * 0.2,
          height * 0.7,
          x + width * 0.04,
          height * 0.7,
        );
        ctx.closePath();
        ctx.fill();
      }

      cypressDefs.forEach((tree, index) => {
        const x = tree.x * width;
        const baseY = height * (0.73 + seededRandom(index + 510) * 0.09);
        const trunkHeight = height * 0.068 * tree.scale;
        const trunkWidth = width * 0.0045 * tree.scale;
        const canopyHeight = height * 0.18 * tree.scale;
        const canopyWidth = width * 0.022 * tree.scale;
        const sway = Math.sin(timeSeconds * 0.7 + tree.sway) * width * 0.003 * tree.scale;

        ctx.fillStyle = "#553726";
        ctx.fillRect(x - trunkWidth / 2, baseY - trunkHeight, trunkWidth, trunkHeight);

        ctx.fillStyle = tree.tone;
        ctx.beginPath();
        ctx.moveTo(x + sway, baseY - canopyHeight);
        ctx.bezierCurveTo(
          x + canopyWidth + sway,
          baseY - canopyHeight * 0.75,
          x + canopyWidth * 0.94 + sway,
          baseY - canopyHeight * 0.2,
          x + canopyWidth * 0.54 + sway,
          baseY,
        );
        ctx.bezierCurveTo(
          x + canopyWidth * 0.1 + sway,
          baseY + height * 0.02,
          x - canopyWidth * 0.1 + sway,
          baseY + height * 0.02,
          x - canopyWidth * 0.54 + sway,
          baseY,
        );
        ctx.bezierCurveTo(
          x - canopyWidth * 0.94 + sway,
          baseY - canopyHeight * 0.2,
          x - canopyWidth + sway,
          baseY - canopyHeight * 0.75,
          x + sway,
          baseY - canopyHeight,
        );
        ctx.fill();
      });

      const shrubCount = quality === "high" ? 22 : quality === "medium" ? 15 : 10;
      for (let index = 0; index < shrubCount; index += 1) {
        const x = seededRandom(index + 1180) * width;
        const y = height * (0.79 + seededRandom(index + 1210) * 0.09);
        const radiusX = width * (0.02 + seededRandom(index + 1240) * 0.04);
        const radiusY = height * (0.018 + seededRandom(index + 1270) * 0.04);
        const drift = Math.sin(timeSeconds * (0.3 + seededRandom(index + 1300) * 0.26) + index) * width * 0.002;
        ctx.fillStyle =
          index % 2 === 0 ? "rgba(64, 101, 56, 0.26)" : "rgba(126, 155, 102, 0.18)";
        ctx.beginPath();
        ctx.ellipse(x + drift, y, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const shrineX = width * 0.62;
      const shrineY = height * 0.704;
      ctx.fillStyle = "#d4d9cf";
      ctx.beginPath();
      ctx.moveTo(shrineX - width * 0.012, shrineY);
      ctx.lineTo(shrineX + width * 0.012, shrineY);
      ctx.lineTo(shrineX + width * 0.008, shrineY - height * 0.07);
      ctx.lineTo(shrineX - width * 0.008, shrineY - height * 0.07);
      ctx.closePath();
      ctx.fill();

      beaconDefs.forEach((lantern) => {
        const x = lantern.x * width;
        const y =
          lantern.y * height + Math.sin(timeSeconds * 1.2 + lantern.phase) * height * 0.006;
        const glowRadius =
          height * 0.048 * (1.04 + Math.sin(timeSeconds * 1.7 + lantern.phase) * 0.08);

        ctx.fillStyle = "#6e5940";
        ctx.fillRect(
          x - width * 0.004,
          y - height * lantern.height * 0.55,
          width * 0.008,
          height * lantern.height * 0.55,
        );

        ctx.strokeStyle = "rgba(247, 240, 214, 0.84)";
        ctx.lineWidth = Math.max(3, height * 0.008);
        ctx.beginPath();
        ctx.arc(x, y, glowRadius * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = lantern.glow;
        ctx.beginPath();
        ctx.moveTo(x, y - glowRadius * 0.6);
        ctx.lineTo(x + glowRadius * 0.28, y + glowRadius * 0.52);
        ctx.lineTo(x - glowRadius * 0.28, y + glowRadius * 0.52);
        ctx.closePath();
        ctx.fill();

        const lanternGlow = ctx.createRadialGradient(
          x,
          y,
          glowRadius * 0.15,
          x,
          y,
          glowRadius * 1.95,
        );
        lanternGlow.addColorStop(0, "rgba(255,244,215,0.26)");
        lanternGlow.addColorStop(1, "rgba(255,244,215,0)");
        ctx.fillStyle = lanternGlow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius * 1.95, 0, Math.PI * 2);
        ctx.fill();
      });

      birdDefs.forEach((bird) => {
        const x = (((bird.x + timeSeconds * bird.speed) % 1.18) - 0.08) * width;
        const y = bird.y * height + Math.sin(timeSeconds * 0.8 + bird.phase) * height * 0.01;
        const span = bird.span * width;
        ctx.strokeStyle = "rgba(67, 66, 78, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - span, y);
        ctx.quadraticCurveTo(x - span * 0.5, y - span * 0.42, x, y);
        ctx.quadraticCurveTo(x + span * 0.5, y - span * 0.42, x + span, y);
        ctx.stroke();
      });

      const grassCount = quality === "high" ? 110 : quality === "medium" ? 80 : 48;
      for (let index = 0; index < grassCount; index += 1) {
        const x = seededRandom(index + 860) * width;
        const baseY = height * (0.8 + seededRandom(index + 890) * 0.18);
        const bladeHeight = height * (0.016 + seededRandom(index + 920) * 0.05);
        const sway = Math.sin(timeSeconds * 1.05 + index * 0.7) * width * 0.0034;
        ctx.strokeStyle =
          index % 4 === 0 ? "rgba(242, 235, 182, 0.16)" : "rgba(49, 92, 47, 0.24)";
        ctx.lineWidth = 1 + (index % 3 === 0 ? 0.35 : 0);
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.quadraticCurveTo(x + sway, baseY - bladeHeight * 0.42, x + sway * 1.3, baseY - bladeHeight);
        ctx.stroke();
      }

      const shimmerLines = quality === "high" ? 4 : quality === "medium" ? 3 : 1;
      for (let index = 0; index < shimmerLines; index += 1) {
        const y = height * (0.72 + index * 0.07);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * -0.05, y + Math.sin(timeSeconds * 0.6 + index) * 3);
        ctx.bezierCurveTo(
          width * 0.22,
          y - 6,
          width * 0.72,
          y + 10,
          width * 1.05,
          y - 4,
        );
        ctx.stroke();
      }

      const moteCount = quality === "high" ? 24 : quality === "medium" ? 16 : 8;
      for (let index = 0; index < moteCount; index += 1) {
        const drift = ((timeSeconds * (0.02 + seededRandom(index + 1400) * 0.03) + seededRandom(index + 1430)) % 1.12) - 0.06;
        const x = drift * width;
        const y =
          height * (0.46 + seededRandom(index + 1460) * 0.36) +
          Math.sin(timeSeconds * 0.6 + index) * height * 0.008;
        ctx.fillStyle = "rgba(255,247,227,0.18)";
        ctx.beginPath();
        ctx.arc(x, y, 1.1 + (index % 3 === 0 ? 0.8 : 0), 0, Math.PI * 2);
        ctx.fill();
      }

      const texture = textureRef.current;
      if (texture) {
        texture.needsUpdate = true;
      }
    },
    [beaconDefs, birdDefs, cloudDefs, cypressDefs, quality],
  );

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = quality === "high" ? 2560 : quality === "medium" ? 1920 : 1280;
    canvas.height = quality === "high" ? 1440 : quality === "medium" ? 1080 : 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = false;

    canvasRef.current = canvas;
    ctxRef.current = ctx;
    textureRef.current = texture;
    setTexture(texture);
    lastDrawRef.current = -1;
    drawScene(0);

    return () => {
      texture.dispose();
      textureRef.current = null;
      ctxRef.current = null;
      canvasRef.current = null;
      setTexture(null);
    };
  }, [drawScene, quality]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (elapsed - lastDrawRef.current < 1 / 10) return;
    lastDrawRef.current = elapsed;
    drawScene(elapsed);
  });

  return texture;
}

function ExteriorThresholdLight({
  quality,
  sunbeamTexture,
  position,
}: {
  quality: QualityTier;
  sunbeamTexture: THREE.Texture | null;
  position: [number, number, number];
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const rayRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const pulse = 1 + Math.sin(elapsed * 1.18) * 0.05;
    const driftX = 0.58 + Math.sin(elapsed * 0.26) * 0.08;
    const driftY = 1.12 + Math.cos(elapsed * 0.18) * 0.05;

    if (sunRef.current) {
      sunRef.current.position.x = driftX;
      sunRef.current.position.y = driftY;
      sunRef.current.scale.setScalar(pulse);
    }

    if (haloRef.current) {
      haloRef.current.rotation.z = -0.2 + Math.sin(elapsed * 0.22) * 0.02;
      haloRef.current.scale.x = 1.02 + Math.sin(elapsed * 0.74) * 0.04;
      haloRef.current.scale.y = 1.02 + Math.cos(elapsed * 0.66) * 0.03;
    }

    if (rayRef.current) {
      rayRef.current.rotation.z = -0.24 + Math.sin(elapsed * 0.16) * 0.018;
      rayRef.current.position.x = 0.34 + Math.sin(elapsed * 0.2) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[3.42, 5.48]} />
        <meshBasicMaterial
          color="#fffdf6"
          transparent
          opacity={0.99}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.18, 0.14, -0.02]}>
        <planeGeometry args={[3.82, 5.92]} />
        <meshBasicMaterial
          color="#fff3cf"
          transparent
          opacity={quality === "low" ? 0.18 : 0.26}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {sunbeamTexture && (
        <>
          <mesh ref={haloRef} position={[0.34, 0.34, 0.018]}>
            <planeGeometry args={[2.72, 5.36]} />
            <meshBasicMaterial
              map={sunbeamTexture}
              color="#fff6dd"
              transparent
              opacity={quality === "low" ? 0.28 : quality === "medium" ? 0.34 : 0.4}
              toneMapped={false}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            ref={rayRef}
            position={[0.36, -0.04, 0.024]}
            rotation={[0, 0, -0.24]}
          >
            <planeGeometry args={[1.88, 5.12]} />
            <meshBasicMaterial
              map={sunbeamTexture}
              color="#fff2cb"
              transparent
              opacity={quality === "low" ? 0.16 : quality === "medium" ? 0.2 : 0.24}
              toneMapped={false}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      <mesh ref={sunRef} position={[0.58, 1.12, 0.036]}>
        <circleGeometry args={[0.46, 40]} />
        <meshBasicMaterial
          color="#fff1bf"
          transparent
          opacity={0.88}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.58, 1.12, 0.03]}>
        <ringGeometry args={[0.52, 0.86, 52]} />
        <meshBasicMaterial
          color="#fff4cf"
          transparent
          opacity={0.3}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.26, -1.54, 0.022]} rotation={[0, 0, 0.12]}>
        <planeGeometry args={[3.18, 1.54]} />
        <meshBasicMaterial
          color="#fff0cb"
          transparent
          opacity={0.2}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

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
  const frameColor =
    FRAME_COLORS[
      Math.abs(offering.id.charCodeAt(0) + offering.id.charCodeAt(offering.id.length - 1)) %
        FRAME_COLORS.length
    ];
  const glassOpacity =
    quality === "high" ? (hovered ? 0.08 : 0.05) : quality === "medium" ? 0.05 : 0.035;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.05, -0.1]}>
        <planeGeometry args={[width + 0.32, height + 0.32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={hovered ? 0.12 : 0.07}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.08]} />
        <meshStandardMaterial
          color="#4a382b"
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.12} />
      </mesh>

      <mesh position={[0, 0, 0.055]}>
        <boxGeometry args={[width - 0.18, height - 0.18, 0.022]} />
        <meshStandardMaterial color="#6b513b" roughness={0.76} />
      </mesh>

      <mesh position={[0, 0, 0.068]}>
        <boxGeometry args={[width - 0.21, height - 0.21, 0.012]} />
        <meshStandardMaterial
          color="#b89a74"
          roughness={0.42}
          metalness={0.18}
        />
      </mesh>

      <mesh position={[0, 0, 0.082]}>
        <boxGeometry args={[width - 0.28, height - 0.28, 0.014]} />
        <meshStandardMaterial color="#f3ede4" roughness={0.96} />
      </mesh>

      <FramePreview offering={offering} />

      {quality !== "low" && (
        <mesh position={[0, 0, 0.115]}>
          <planeGeometry args={[width - 0.24, height - 0.24]} />
          <meshStandardMaterial
            color="#faf7f1"
            transparent
            opacity={glassOpacity}
            roughness={0.18}
            metalness={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      <Text
        position={[0, -height / 2 + 0.17, 0.122]}
        fontSize={0.08}
        maxWidth={width - 0.42}
        color="#5b4838"
        anchorX="center"
        anchorY="middle"
      >
        {offering.title || "Senza titolo"}
      </Text>

      <mesh position={[0, height / 2 + 0.02, 0.09]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#2c241d" metalness={0.7} roughness={0.2} />
      </mesh>

      {hovered && quality !== "low" && (
        <pointLight
          position={[0, 0, 1.5]}
          intensity={0.34}
          color="#fff5e0"
          distance={4}
        />
      )}

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
        <boxGeometry args={[0.2, 0.82, 0.1]} />
        <meshStandardMaterial color="#6a5441" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.42, -0.01]} rotation={[0.48, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.045, 0.28, 10]} />
        <meshStandardMaterial color="#a68d73" roughness={0.38} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.28, 0.08]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial
          color="#fff5de"
          emissive={accent}
          emissiveIntensity={0.82}
          roughness={0.14}
        />
      </mesh>
      <mesh position={[0, 0.3, 0.08]}>
        <sphereGeometry args={[0.34, 20, 20]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} />
      </mesh>
      <mesh position={[0, -0.18, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 20]} />
        <meshBasicMaterial color={accent} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function TrackLight({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#fff6e8" />
      </mesh>
      <pointLight intensity={0.8} color={color} distance={8} decay={2} />
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.2, 8]} />
        <meshStandardMaterial color="#6d5845" roughness={0.76} />
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
  const showDeepDetails = quality !== "low";
  const exteriorWindowBaseTexture = useExteriorWindowTexture(quality);
  const exteriorWindowTexture = useAnimatedExteriorTexture(quality);
  const glassPaneTexture = useGlassPaneTexture(quality);
  const sunbeamTexture = useSunbeamTexture(quality);
  const wallInset = 0.1;
  const wainscotHeight = 2.32;
  const wainscotY = GALLERY_FLOOR_Y + wainscotHeight / 2;
  const baseboardY = GALLERY_FLOOR_Y + 0.14;
  const capRailY = GALLERY_FLOOR_Y + wainscotHeight + 0.06;
  const pictureRailY = 1.02;
  const ceilingY = GALLERY_FLOOR_Y + ROOM_HEIGHT - 0.04;
  const exteriorPaneWidth = ROOM_HALF * 2 - 0.88;
  const exteriorPaneHeight = ROOM_HEIGHT - 0.64;
  const exteriorPaneY = WALL_TOP_Y;
  const exteriorPaneZ = -ROOM_HALF + 0.06;
  const exteriorWorldZ = exteriorPaneZ - 1.28;
  const portalLightwellY = GALLERY_FLOOR_Y + 3.34;
  const portalLightwellZ = exteriorPaneZ + 0.1;
  const portalVoidWidth = 4.26;
  const portalVoidHeight = 5.54;
  const portalVoidTop = portalLightwellY + portalVoidHeight / 2;
  const glassSidePanelWidth = (exteriorPaneWidth - portalVoidWidth) / 2;
  const glassTopPanelHeight =
    exteriorPaneHeight / 2 + exteriorPaneY - portalVoidTop;
  const glassPanelSpecs = [
    {
      id: "left",
      width: glassSidePanelWidth - 0.08,
      height: exteriorPaneHeight - 0.08,
      x: -(portalVoidWidth / 2 + glassSidePanelWidth / 2),
      y: exteriorPaneY,
    },
    {
      id: "right",
      width: glassSidePanelWidth - 0.08,
      height: exteriorPaneHeight - 0.08,
      x: portalVoidWidth / 2 + glassSidePanelWidth / 2,
      y: exteriorPaneY,
    },
    {
      id: "top",
      width: portalVoidWidth - 0.08,
      height: Math.max(1.6, glassTopPanelHeight - 0.08),
      x: 0,
      y: portalVoidTop + glassTopPanelHeight / 2,
    },
  ] as const;
  const frontWallOffsets = [
    -panelWidth / 2 - DOOR_WIDTH / 4,
    panelWidth / 2 + DOOR_WIDTH / 4,
  ] as const;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial
          map={floorTexture || undefined}
          color="#7f4c34"
          roughness={0.9}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.012, 0]}>
        <ringGeometry args={[2.9, 4.2, 44]} />
        <meshStandardMaterial
          color="#af8e73"
          transparent
          opacity={0.48}
          roughness={0.92}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.013, 0]}>
        <circleGeometry args={[2.72, 40]} />
        <meshStandardMaterial
          color="#8f5f45"
          transparent
          opacity={0.28}
          roughness={0.96}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.016, 0]}>
        <ringGeometry args={[2.06, 2.18, 44]} />
        <meshBasicMaterial color="#f1d4af" transparent opacity={0.2} depthWrite={false} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={`edge-ao-z-${side}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, GALLERY_FLOOR_Y + 0.015, side * (ROOM_HALF - 1.8)]}
        >
          <planeGeometry args={[ROOM_HALF * 2, 3.6]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.07} depthWrite={false} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={`edge-ao-x-${side}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[side * (ROOM_HALF - 1.8), GALLERY_FLOOR_Y + 0.015, 0]}
        >
          <planeGeometry args={[3.6, ROOM_HALF * 2]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.07} depthWrite={false} />
        </mesh>
      ))}

      <mesh position={[0, exteriorPaneY, exteriorWorldZ - 0.24]}>
        <planeGeometry args={[exteriorPaneWidth + 2.2, exteriorPaneHeight + 1.9]} />
        <meshBasicMaterial color="#1f1712" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh position={[0, exteriorPaneY + 0.04, exteriorWorldZ]}>
        <planeGeometry args={[exteriorPaneWidth + 1.2, exteriorPaneHeight + 0.92]} />
        <meshBasicMaterial
          map={exteriorWindowBaseTexture || undefined}
          color="#f5efe4"
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {exteriorWindowTexture && (
        <mesh position={[0, exteriorPaneY + 0.04, exteriorWorldZ + 0.1]}>
          <planeGeometry args={[exteriorPaneWidth + 1.18, exteriorPaneHeight + 0.9]} />
          <meshBasicMaterial
            map={exteriorWindowTexture}
            color="#ffffff"
            transparent
            opacity={0.97}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      <mesh position={[0, exteriorPaneY - exteriorPaneHeight * 0.14, exteriorPaneZ - 0.34]}>
        <planeGeometry args={[exteriorPaneWidth + 0.8, exteriorPaneHeight * 0.5]} />
        <meshBasicMaterial
          color="#dbe8c7"
          transparent
          opacity={0.07}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <ExteriorThresholdLight
        quality={quality}
        sunbeamTexture={sunbeamTexture}
        position={[0, portalLightwellY, portalLightwellZ]}
      />
      {glassPanelSpecs.map((panel, index) => (
        <group key={`glass-panel-${panel.id}`}>
          <mesh position={[panel.x, panel.y, exteriorPaneZ + 0.04]}>
            <planeGeometry args={[panel.width, panel.height]} />
            <meshBasicMaterial
              color="#eef5fb"
              transparent
              opacity={quality === "low" ? 0.042 : quality === "medium" ? 0.055 : 0.07}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[panel.x, panel.y, exteriorPaneZ + 0.055]}>
            <planeGeometry args={[panel.width, panel.height]} />
            <meshBasicMaterial
              map={glassPaneTexture || undefined}
              color="#f7fbff"
              transparent
              opacity={quality === "low" ? 0.04 : quality === "medium" ? 0.06 : 0.085}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[panel.x, panel.y, exteriorPaneZ + 0.068]}>
            <planeGeometry args={[panel.width - 0.08, panel.height - 0.08]} />
            <meshPhysicalMaterial
              color="#eef6ff"
              transparent
              opacity={quality === "low" ? 0.024 : quality === "medium" ? 0.034 : 0.048}
              transmission={quality === "low" ? 0.08 : quality === "medium" ? 0.14 : 0.22}
              roughness={quality === "low" ? 0.9 : quality === "medium" ? 0.84 : 0.72}
              clearcoat={1}
              clearcoatRoughness={0.18}
              reflectivity={0.18}
              ior={1.2}
              thickness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          {showDeepDetails && (
            <mesh
              position={[
                panel.x + (index === 0 ? panel.width * 0.16 : index === 1 ? -panel.width * 0.14 : 0.18),
                panel.y + panel.height * 0.18,
                exteriorPaneZ + 0.072,
              ]}
              rotation={[0, 0, index === 1 ? -0.16 : 0.14]}
            >
              <planeGeometry
                args={[
                  panel.width * (index === 2 ? 0.42 : 0.36),
                  panel.height * 0.12,
                ]}
              />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.03}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      ))}
      {showDeepDetails && (
        <>
          <mesh
            position={[exteriorPaneWidth * 0.16, exteriorPaneY + exteriorPaneHeight * 0.24, exteriorPaneZ + 0.053]}
            rotation={[0, 0, -0.12]}
          >
            <planeGeometry args={[exteriorPaneWidth * 0.44, exteriorPaneHeight * 0.12]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.04}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[-exteriorPaneWidth * 0.2, exteriorPaneY - exteriorPaneHeight * 0.16, exteriorPaneZ + 0.05]}
            rotation={[0, 0, 0.16]}
          >
            <planeGeometry args={[exteriorPaneWidth * 0.36, exteriorPaneHeight * 0.09]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.026}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}
      {showDeepDetails && sunbeamTexture && (
        <>
          <mesh
            position={[0.32, portalLightwellY + 0.04, portalLightwellZ + 0.026]}
            rotation={[0, 0, -0.18]}
          >
            <planeGeometry args={[2.44, 4.92]} />
            <meshBasicMaterial
              map={sunbeamTexture}
              color="#fff7df"
              transparent
              opacity={0.26}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh
            position={[0.58, GALLERY_FLOOR_Y + 4.72, exteriorPaneZ + 0.028]}
            rotation={[0, 0, -0.22]}
          >
            <planeGeometry args={[1.74, 4.62]} />
            <meshBasicMaterial
              color="#fff5d1"
              transparent
              opacity={0.12}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          <pointLight
            position={[0.9, GALLERY_FLOOR_Y + 3.24, -ROOM_HALF + 0.9]}
            intensity={quality === "low" ? 0.34 : quality === "medium" ? 0.52 : 0.72}
            color="#fff1c8"
            distance={7}
            decay={2}
          />
          {[
            [1.12, GALLERY_FLOOR_Y + 4.14, exteriorPaneZ + 0.05, 1.08, 4.36, -0.24, 0.11],
          ].map(([x, y, z, width, height, rotationZ, opacity], index) => (
            <mesh
              key={`door-air-beam-${index}`}
              position={[x, y, z]}
              rotation={[0, 0, rotationZ]}
            >
              <planeGeometry args={[width, height]} />
              <meshBasicMaterial
                map={sunbeamTexture}
                color="#fff4cf"
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
          {[
            [1.18, GALLERY_FLOOR_Y + 0.032, -ROOM_HALF + 1.74, 1.24, 3.34, 0.18, 0.15],
          ].map(([x, y, z, width, height, rotationZ, opacity], index) => (
            <mesh
              key={`door-floor-beam-${index}`}
              position={[x, y, z]}
              rotation={[-Math.PI / 2, 0, rotationZ]}
            >
              <planeGeometry args={[width, height]} />
              <meshBasicMaterial
                map={sunbeamTexture}
                color="#fff1c1"
                transparent
                opacity={opacity}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}
      {[
        [0, exteriorPaneHeight / 2 + 0.2, exteriorPaneWidth + 0.46, 0.34],
        [0, -exteriorPaneHeight / 2 - 0.2, exteriorPaneWidth + 0.46, 0.34],
      ].map(([x, y, width, height], index) => (
        <mesh
          key={`exterior-frame-horizontal-${index}`}
          position={[x, exteriorPaneY + y, exteriorPaneZ + 0.06]}
        >
          <boxGeometry args={[width, height, 0.16]} />
          <meshStandardMaterial color="#5f4b3e" roughness={0.78} />
        </mesh>
      ))}
      {[
        [-exteriorPaneWidth / 2 - 0.18, 0, 0.32, exteriorPaneHeight + 0.42],
        [exteriorPaneWidth / 2 + 0.18, 0, 0.32, exteriorPaneHeight + 0.42],
      ].map(([x, y, width, height], index) => (
        <mesh
          key={`exterior-frame-vertical-${index}`}
          position={[x, exteriorPaneY + y, exteriorPaneZ + 0.06]}
        >
          <boxGeometry args={[width, height, 0.15]} />
          <meshStandardMaterial
            color="#5f4c3f"
            roughness={0.8}
          />
        </mesh>
      ))}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GALLERY_FLOOR_Y + 0.04, -ROOM_HALF + 3.2]}
        scale={[1.55, 0.8, 1]}
      >
        <circleGeometry args={[2.8, 32]} />
        <meshBasicMaterial color="#d9e8c0" transparent opacity={0.08} />
      </mesh>
      <mesh position={[0, WALL_TOP_Y, ROOM_HALF]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture || undefined} color="#e2d6c8" roughness={0.96} />
      </mesh>
      <mesh position={[-ROOM_HALF, WALL_TOP_Y, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture || undefined} color="#dccfbe" roughness={0.96} />
      </mesh>
      <mesh position={[ROOM_HALF, WALL_TOP_Y, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTexture || undefined} color="#dccfbe" roughness={0.96} />
      </mesh>

      {frontWallOffsets.map((x, index) => (
        <group key={`front-wainscot-${index}`}>
          <mesh position={[x, baseboardY, ROOM_HALF - wallInset]}>
            <boxGeometry args={[panelWidth + 0.12, 0.28, 0.12]} />
            <meshStandardMaterial color="#51382a" roughness={0.8} />
          </mesh>
          <mesh position={[x, GALLERY_FLOOR_Y + 0.82, ROOM_HALF - wallInset]}>
            <boxGeometry args={[panelWidth, 1.16, 0.18]} />
            <meshStandardMaterial color="#d9ccbe" roughness={0.96} />
          </mesh>
        </group>
      ))}

      <mesh position={[-ROOM_HALF + wallInset, wainscotY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2, wainscotHeight, 0.22]} />
        <meshStandardMaterial color="#d2c2b0" roughness={0.94} />
      </mesh>
      <mesh position={[ROOM_HALF - wallInset, wainscotY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2, wainscotHeight, 0.22]} />
        <meshStandardMaterial color="#d2c2b0" roughness={0.94} />
      </mesh>
      <mesh position={[-ROOM_HALF + wallInset, capRailY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.2, 0.12, 0.1]} />
        <meshStandardMaterial color="#604536" roughness={0.76} />
      </mesh>
      <mesh position={[ROOM_HALF - wallInset, capRailY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.2, 0.12, 0.1]} />
        <meshStandardMaterial color="#604536" roughness={0.76} />
      </mesh>
      <mesh position={[-ROOM_HALF + wallInset, baseboardY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#51382a" roughness={0.8} />
      </mesh>
      <mesh position={[ROOM_HALF - wallInset, baseboardY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.12, 0.28, 0.12]} />
        <meshStandardMaterial color="#51382a" roughness={0.8} />
      </mesh>
      <mesh position={[-ROOM_HALF + 0.04, pictureRailY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.2, 0.08, 0.06]} />
        <meshStandardMaterial color="#5a4031" roughness={0.76} />
      </mesh>
      <mesh position={[ROOM_HALF - 0.04, pictureRailY, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM_HALF * 2 + 0.2, 0.08, 0.06]} />
        <meshStandardMaterial color="#5a4031" roughness={0.76} />
      </mesh>

      <mesh position={[0, 8, ROOM_HALF]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[DOOR_WIDTH, ROOM_HEIGHT - 8]} />
        <meshStandardMaterial map={wallTexture || undefined} color="#dfd2c3" roughness={0.96} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ceilingY, 0]}>
        <planeGeometry args={[ROOM_HALF * 2, ROOM_HALF * 2]} />
        <meshStandardMaterial color="#d1b795" roughness={0.95} />
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
          <cylinderGeometry args={[0.84, 1.02, 13.4, 16]} />
          <meshStandardMaterial color="#c9b8a6" roughness={0.88} />
        </mesh>
      ))}

      {[-11.5, -5.5, 5.5, 11.5].map((x) => (
        <GallerySconce
          key={`lamp-front-${x}`}
          position={[x, 3.7, ROOM_HALF - 0.3]}
          accent="#f0c997"
        />
      ))}
      {[-12, -6, 6, 12].map((z) => (
        <GallerySconce
          key={`lamp-left-${z}`}
          position={[-ROOM_HALF + 0.3, 3.7, z]}
          accent="#efe0bb"
        />
      ))}
      {[-12, -6, 6, 12].map((z) => (
        <GallerySconce
          key={`lamp-right-${z}`}
          position={[ROOM_HALF - 0.3, 3.7, z]}
          accent="#efe0bb"
        />
      ))}

      {showDeepDetails && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.04, 10.4]}>
            <circleGeometry args={[4.2, 28]} />
            <meshBasicMaterial color="#f0c792" transparent opacity={0.05} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GALLERY_FLOOR_Y + 0.04, -10.4]}>
            <circleGeometry args={[4.2, 28]} />
            <meshBasicMaterial color="#d7ebc3" transparent opacity={0.05} />
          </mesh>
        </>
      )}

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
        glowColor="#fff4c7"
        stoneColor="#49543d"
        labelColor="#dfe8d2"
        outlineColor="#44523a"
        veilColor="#fff8ea"
        plaqueColor="#95ab79"
        veilOpacity={quality === "low" ? 0.018 : quality === "medium" ? 0.014 : 0.01}
        thresholdColor="#fffdf5"
        thresholdOpacity={quality === "low" ? 0.68 : quality === "medium" ? 0.76 : 0.84}
        innerFrameColor="#ece5d8"
        innerFrameGlowColor="#fff6e2"
        innerFrameGlowIntensity={quality === "high" ? 0.56 : 0.44}
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
}: {
  offerings: Offering[];
  renderProfile: ResolvedRenderProfile;
  onSelectOffering: (offering: Offering) => void;
}) {
  const quality = renderProfile.tier;
  const wallTexture = useGalleryWallTexture(quality);
  const floorTexture = useGalleryFloorTexture(quality);
  const slots = useGallerySlots(offerings);

  return (
    <>
      <color attach="background" args={["#d8c2ae"]} />
      <fog attach="fog" args={["#d6bfab", 16, 38]} />
      <ambientLight
        intensity={quality === "low" ? 0.7 : 0.58}
        color="#f6ede2"
      />
      <hemisphereLight intensity={0.44} color="#fff4e6" groundColor="#594132" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={0.84}
        color="#ffe7c4"
      />
      <pointLight
        position={[0, 6.4, 11]}
        intensity={0.5}
        color="#efcb94"
        distance={22}
      />
      <pointLight
        position={[0, 5.8, -11]}
        intensity={quality === "low" ? 0.2 : 0.34}
        color="#cfe2bd"
        distance={20}
      />
      {quality !== "low" &&
        [-12, -6, 0, 6, 12].map((z) => (
          <TrackLight
            key={`track-left-${z}`}
            position={[-8.5, 8.8, z]}
            color="#fff0d0"
          />
        ))}
      {quality !== "low" &&
        [-12, -6, 0, 6, 12].map((z) => (
          <TrackLight
            key={`track-right-${z}`}
            position={[8.5, 8.8, z]}
            color="#fff0d0"
          />
        ))}

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
