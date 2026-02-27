import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";

export type WorldMode = "soglia" | "vaga" | "silenzio";

type WorldPreset = {
  cameraY: number;
  cameraZ: number;
  fogDensity: number;
  fogColor: string;
  skyA: string;
  skyB: string;
  skyC: string;
  lightStrength: number;
  driftStrength: number;
  particleStrength: number;
  ringOpacity: number;
  planeOpacity: number;
  bloomStrength: number;
  bloomRadius: number;
  chromatic: number;
  orbitAmplitude: number;
  orbitSpeed: number;
  lensNoise: number;
  lensVignette: number;
  lensWarp: number;
  lensSaturation: number;
};

const PRESETS: Record<WorldMode, WorldPreset> = {
  soglia: {
    cameraY: 2.15,
    cameraZ: 13.3,
    fogDensity: 0.034,
    fogColor: "#181f26",
    skyA: "#1e2a33",
    skyB: "#172433",
    skyC: "#5f3a2b",
    lightStrength: 1.04,
    driftStrength: 0.72,
    particleStrength: 0.62,
    ringOpacity: 0.38,
    planeOpacity: 0.2,
    bloomStrength: 0.8,
    bloomRadius: 0.5,
    chromatic: 0.00062,
    orbitAmplitude: 0.45,
    orbitSpeed: 0.11,
    lensNoise: 0.03,
    lensVignette: 0.32,
    lensWarp: 0.024,
    lensSaturation: 1.05,
  },
  vaga: {
    cameraY: 2.5,
    cameraZ: 11.8,
    fogDensity: 0.023,
    fogColor: "#1d2630",
    skyA: "#21404a",
    skyB: "#11273a",
    skyC: "#624433",
    lightStrength: 1.26,
    driftStrength: 1,
    particleStrength: 1,
    ringOpacity: 0.56,
    planeOpacity: 0.3,
    bloomStrength: 1.12,
    bloomRadius: 0.72,
    chromatic: 0.00108,
    orbitAmplitude: 0.7,
    orbitSpeed: 0.17,
    lensNoise: 0.043,
    lensVignette: 0.36,
    lensWarp: 0.036,
    lensSaturation: 1.14,
  },
  silenzio: {
    cameraY: 1.65,
    cameraZ: 14.6,
    fogDensity: 0.056,
    fogColor: "#10161d",
    skyA: "#171f2a",
    skyB: "#111b29",
    skyC: "#41343d",
    lightStrength: 0.72,
    driftStrength: 0.3,
    particleStrength: 0.24,
    ringOpacity: 0.18,
    planeOpacity: 0.1,
    bloomStrength: 0.46,
    bloomRadius: 0.28,
    chromatic: 0.00012,
    orbitAmplitude: 0.25,
    orbitSpeed: 0.06,
    lensNoise: 0.018,
    lensVignette: 0.42,
    lensWarp: 0.008,
    lensSaturation: 0.92,
  },
};

const PALETTE = [
  "#2fb8cb",
  "#f4bf4f",
  "#ef6a42",
  "#e84f4a",
  "#8acb64",
  "#2f6d95",
  "#5d5dbf",
  "#f4e9ce",
];

const MEMORY_TEXTURES = [
  "/cavapendoli/models-a.png",
  "/cavapendoli/models-b.png",
  "/cavapendoli/models-bw.png",
];

type CreatureRuntime = {
  group: THREE.Group;
  base: THREE.Vector3;
  bobSpeed: number;
  bobAmount: number;
  swayAmount: number;
  phase: number;
  zone: number;
  materials: THREE.MeshStandardMaterial[];
};

type GlyphRuntime = {
  base: THREE.Vector3;
  phase: number;
  speed: number;
  scale: number;
};

type PulseRuntime = {
  mesh: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
  life: number;
  speed: number;
};

type CurrentStreamRuntime = {
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  base: Float32Array;
  seeds: Float32Array;
  zone: number;
  speed: number;
  sway: number;
};

type BeaconRuntime = {
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  base: THREE.Vector3;
  zone: number;
  phase: number;
  drift: number;
};

type PortalRuntime = {
  info: WorldPortal;
  group: THREE.Group;
  ring: THREE.Mesh<THREE.TorusGeometry, THREE.MeshStandardMaterial>;
  halo: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  core: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
  hitTarget: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  baseY: number;
  zone: number;
};

type PortalSigilRuntime = {
  sprite: THREE.Sprite;
  zone: number;
  portalIndex: number;
  baseAngle: number;
  speed: number;
  lift: number;
  scaleX: number;
  scaleY: number;
};

type PortalTravelRuntime = {
  portalIndex: number;
  progress: number;
  durationMs: number;
  dispatched: boolean;
};

type FragmentTravelRuntime = {
  fragmentIndex: number;
  progress: number;
  durationMs: number;
  dispatched: boolean;
};

type TravelStreakRuntime = {
  line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>;
  base: Float32Array;
  phase: number;
  speed: number;
  depth: number;
};

type PortalTravelProgress = {
  portal: WorldPortal | null;
  progress: number;
  active: boolean;
};

export type MemoryFragmentTravelProgress = {
  fragment: WorldMemoryFragment | null;
  progress: number;
  active: boolean;
};

type MemoryFragmentRuntime = {
  info: WorldMemoryFragment;
  group: THREE.Group;
  core: THREE.Mesh<THREE.DodecahedronGeometry, THREE.MeshStandardMaterial>;
  halo: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>;
  hitTarget: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  zone: number;
  orbit: number;
  phase: number;
  radius: number;
  baseY: number;
};

type RoomLightRuntime = {
  center: number;
  point: THREE.PointLight;
  spot: THREE.SpotLight;
  marker: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
};

export type WorldSignal = {
  journey: number;
  activeRoom: WorldMode;
  roomFocus: number;
  oracleFocus: number;
  hoveredPortal: WorldPortal | null;
  hoveredFragment: WorldMemoryFragment | null;
  portalTravelActive: boolean;
  fragmentTravelActive: boolean;
};

const SKY_VERTEX_SHADER = `
  varying vec3 vWorld;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorld = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const SKY_FRAGMENT_SHADER = `
  varying vec3 vWorld;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 normal = normalize(vWorld);
    float vertical = clamp(normal.y * 0.5 + 0.5, 0.0, 1.0);
    float sweep = sin((normal.x * 5.0) + uTime * 0.18) * 0.5 + 0.5;
    float grain = noise(normal.xz * 6.5 + uTime * 0.035);

    vec3 color = mix(uColorA, uColorB, vertical);
    color = mix(color, uColorC, sweep * 0.34 + grain * 0.24);

    gl_FragColor = vec4(color, 0.96);
  }
`;

const CAVAPENDOLI_LENS_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uNoise: { value: 0.03 },
    uVignette: { value: 0.34 },
    uWarp: { value: 0.02 },
    uSaturation: { value: 1.03 },
  },
  vertexShader: `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uNoise;
    uniform float uVignette;
    uniform float uWarp;
    uniform float uSaturation;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }

    vec3 applySaturation(vec3 color, float saturation) {
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(luma), color, saturation);
    }

    void main() {
      vec2 uv = vUv;
      vec2 centered = uv - 0.5;
      float r = length(centered);

      vec2 warpedUv = uv + centered * (r * r) * uWarp;
      vec3 color = texture2D(tDiffuse, warpedUv).rgb;

      float grain = hash(uv * 550.0 + vec2(uTime * 0.7, uTime * 1.17)) - 0.5;
      color += grain * uNoise;

      float vignette = smoothstep(0.92, 0.18, r);
      color *= mix(1.0 - uVignette, 1.0, vignette);

      color = applySaturation(color, uSaturation);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

const FALLBACK_GLOWS: Record<WorldMode, string> = {
  soglia:
    "radial-gradient(circle_at_25%_20%,rgba(249,197,104,0.3),transparent_44%),radial-gradient(circle_at_78%_26%,rgba(54,154,171,0.22),transparent_48%),radial-gradient(circle_at_52%_78%,rgba(230,99,64,0.2),transparent_40%)",
  vaga:
    "radial-gradient(circle_at_18%_28%,rgba(75,192,206,0.36),transparent_42%),radial-gradient(circle_at_83%_24%,rgba(244,179,75,0.34),transparent_46%),radial-gradient(circle_at_48%_85%,rgba(232,92,66,0.28),transparent_42%)",
  silenzio:
    "radial-gradient(circle_at_24%_22%,rgba(102,135,177,0.27),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(70,112,141,0.23),transparent_48%),radial-gradient(circle_at_50%_78%,rgba(168,102,84,0.18),transparent_42%)",
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const supportsWebGL = () => {
  if (
    typeof window === "undefined" ||
    (typeof window.WebGLRenderingContext === "undefined" &&
      typeof window.WebGL2RenderingContext === "undefined")
  ) {
    return false;
  }
  const canvas = document.createElement("canvas");
  try {
    return !!(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
    );
  } catch {
    return false;
  }
};

const createSeededRng = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const pickColor = (rng: () => number) =>
  PALETTE[Math.floor(rng() * PALETTE.length)];

const createPortalSigilTexture = (text: string, colorA: string, colorB: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "destination-in";
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.font = "700 62px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
};

const applyPainterlyPass = (material: THREE.MeshStandardMaterial, seed: number) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPainterSeed = { value: seed };
    shader.fragmentShader = `
      uniform float uPainterSeed;
      float painterHash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 42.123);
        return fract(p.x * p.y);
      }
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec4 diffuseColor = vec4( diffuse, opacity );",
      `
        float brush = sin((vViewPosition.x + uPainterSeed) * 7.2 + vViewPosition.y * 5.4) * 0.5 + 0.5;
        float blotch = painterHash(vViewPosition.xy * 4.0 + uPainterSeed);
        vec3 painterDiffuse = diffuse * (0.78 + brush * 0.27);
        painterDiffuse = mix(painterDiffuse, painterDiffuse * vec3(1.09, 0.95, 0.9), blotch * 0.16);
        vec4 diffuseColor = vec4( painterDiffuse, opacity );
      `,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;",
      `
        vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        float contour = clamp(1.0 - abs(dot(normalize(normal), vec3(0.0, 0.0, 1.0))), 0.0, 1.0);
        outgoingLight *= mix(1.03, 0.86, contour * 0.52);
      `,
    );
  };
  material.needsUpdate = true;
};

const addCreature = (seed: number) => {
  const rng = createSeededRng(seed * 1337);
  const group = new THREE.Group();
  const materials: THREE.MeshStandardMaterial[] = [];
  const addSketchEdges = (mesh: THREE.Mesh, opacity = 0.38) => {
    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({
        color: "#07090d",
        transparent: true,
        opacity,
      }),
    );
    edge.position.copy(mesh.position);
    edge.rotation.copy(mesh.rotation);
    edge.scale.copy(mesh.scale).multiplyScalar(1.02);
    group.add(edge);
  };

  const bodyRadius = 0.28 + rng() * 0.12;
  const bodyLength = 1.2 + rng() * 1.15;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.42,
    metalness: 0.08,
    emissive: new THREE.Color("#0f131a"),
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.95,
  });
  applyPainterlyPass(bodyMat, rng() * 1000 + 1.1);
  materials.push(bodyMat);
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(bodyRadius, bodyLength, 8, 18),
    bodyMat,
  );
  body.rotation.z = Math.PI / 2;
  group.add(body);
  addSketchEdges(body, 0.4);

  const patchCount = 6 + Math.floor(rng() * 4);
  for (let i = 0; i < patchCount; i += 1) {
    const patchMat = new THREE.MeshStandardMaterial({
      color: pickColor(rng),
      roughness: 0.35,
      metalness: 0.12,
      emissive: new THREE.Color("#0f131a"),
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.9,
    });
    applyPainterlyPass(patchMat, rng() * 1000 + 2.3);
    materials.push(patchMat);
    const patch = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + rng() * 0.1, 10, 10),
      patchMat,
    );
    const angle = rng() * Math.PI * 2;
    patch.position.set(
      Math.cos(angle) * (bodyLength * 0.42),
      (rng() - 0.5) * (bodyRadius * 1.4),
      Math.sin(angle) * (bodyRadius * 1.25),
    );
    group.add(patch);
  }

  const neckMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.35,
    metalness: 0.05,
    emissive: new THREE.Color("#0f131a"),
    emissiveIntensity: 0.1,
  });
  applyPainterlyPass(neckMat, rng() * 1000 + 3.5);
  materials.push(neckMat);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 0.46, 9),
    neckMat,
  );
  neck.position.set(bodyLength * 0.46, 0.2, 0);
  neck.rotation.z = -0.68;
  group.add(neck);

  const headMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.28,
    metalness: 0.08,
    emissive: new THREE.Color("#10151e"),
    emissiveIntensity: 0.16,
  });
  applyPainterlyPass(headMat, rng() * 1000 + 4.7);
  materials.push(headMat);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.26 + rng() * 0.07, 14, 14),
    headMat,
  );
  head.position.set(bodyLength * 0.62, 0.42, 0);
  group.add(head);
  addSketchEdges(head, 0.32);

  const beakMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.32,
    metalness: 0.03,
    emissive: new THREE.Color("#0f131a"),
    emissiveIntensity: 0.08,
  });
  applyPainterlyPass(beakMat, rng() * 1000 + 5.9);
  materials.push(beakMat);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.36, 6), beakMat);
  beak.position.set(bodyLength * 0.82, 0.42, 0);
  beak.rotation.z = -Math.PI / 2;
  group.add(beak);

  const tailMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.37,
    metalness: 0.08,
    emissive: new THREE.Color("#0f131a"),
    emissiveIntensity: 0.08,
  });
  applyPainterlyPass(tailMat, rng() * 1000 + 6.1);
  materials.push(tailMat);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 7), tailMat);
  tail.position.set(-(bodyLength * 0.67), 0.05, 0);
  tail.rotation.z = Math.PI / 2;
  group.add(tail);
  addSketchEdges(tail, 0.3);

  const legMat = new THREE.MeshStandardMaterial({
    color: "#4e5f67",
    roughness: 0.45,
    metalness: 0.22,
  });
  materials.push(legMat);
  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.52, 8),
    legMat,
  );
  leftLeg.position.set(bodyLength * 0.24, -0.5, -0.08);
  group.add(leftLeg);
  const rightLeg = leftLeg.clone();
  rightLeg.position.z = 0.08;
  group.add(rightLeg);

  const footMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.34,
    metalness: 0.12,
    emissive: new THREE.Color("#0f131a"),
    emissiveIntensity: 0.08,
  });
  applyPainterlyPass(footMat, rng() * 1000 + 7.3);
  materials.push(footMat);
  const leftFoot = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 10),
    footMat,
  );
  leftFoot.position.set(leftLeg.position.x, -0.78, -0.09);
  group.add(leftFoot);
  const rightFoot = leftFoot.clone();
  rightFoot.position.z = 0.09;
  group.add(rightFoot);

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(bodyLength * 0.38, 0.38, 0),
    new THREE.Vector3(bodyLength * 0.55, 0.88, 0.04),
    new THREE.Vector3(bodyLength * 0.71, 1.14, -0.08),
  ]);
  const antennaMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.3,
    metalness: 0.08,
    emissive: new THREE.Color("#101923"),
    emissiveIntensity: 0.2,
  });
  applyPainterlyPass(antennaMat, rng() * 1000 + 8.5);
  materials.push(antennaMat);
  const antenna = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 22, 0.02, 7, false),
    antennaMat,
  );
  group.add(antenna);

  const tipMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.2,
    metalness: 0.2,
    emissive: new THREE.Color("#131f2a"),
    emissiveIntensity: 0.28,
  });
  applyPainterlyPass(tipMat, rng() * 1000 + 9.7);
  materials.push(tipMat);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), tipMat);
  tip.position.copy(curve.getPoint(1));
  group.add(tip);

  const hangerMat = new THREE.MeshStandardMaterial({
    color: "#c5d4df",
    roughness: 0.48,
    metalness: 0.15,
  });
  materials.push(hangerMat);
  const hanger = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.28, 6),
    hangerMat,
  );
  hanger.position.set(-bodyLength * 0.15, -0.26, 0);
  group.add(hanger);

  const dropMat = new THREE.MeshStandardMaterial({
    color: pickColor(rng),
    roughness: 0.25,
    metalness: 0.22,
    emissive: new THREE.Color("#111a22"),
    emissiveIntensity: 0.24,
  });
  applyPainterlyPass(dropMat, rng() * 1000 + 10.9);
  materials.push(dropMat);
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), dropMat);
  drop.position.set(hanger.position.x, -0.41, 0);
  group.add(drop);

  group.rotation.y = rng() * Math.PI * 2;
  group.scale.setScalar(0.86 + rng() * 0.54);

  return {
    group,
    base: new THREE.Vector3(0, 0, 0),
    bobSpeed: 0.25 + rng() * 0.5,
    bobAmount: 0.2 + rng() * 0.48,
    swayAmount: 0.18 + rng() * 0.26,
    phase: rng() * Math.PI * 2,
    zone: 0.5,
    materials,
  };
};

type CavapendoliWorldCanvasProps = {
  mode: WorldMode;
  className?: string;
  journey?: number;
  accessibilityMode?: boolean;
  interactivePortals?: boolean;
  onPortalSelect?: (portal: WorldPortal) => void;
  portalTravelDurationMs?: number;
  onPortalTravelProgress?: (update: PortalTravelProgress) => void;
  fragmentTravelDurationMs?: number;
  onMemoryFragmentTravelProgress?: (update: MemoryFragmentTravelProgress) => void;
  onWorldSignal?: (signal: WorldSignal) => void;
  soundscapeEnabled?: boolean;
  memoryFragments?: WorldMemoryFragment[];
  interactiveFragments?: boolean;
  onMemoryFragmentSelect?: (fragment: WorldMemoryFragment) => void;
};

export type WorldPortal = {
  id: "soglia" | "vaga" | "offri";
  label: string;
  journey: number;
  mode: WorldMode;
  path: string;
};

export type WorldMemoryFragment = {
  id: string;
  label: string;
  path: string;
  zone?: number;
};

const MODE_JOURNEY_ANCHOR: Record<WorldMode, number> = {
  soglia: 0.15,
  vaga: 0.52,
  silenzio: 0.9,
};

const ROOM_PATH = [
  {
    camera: new THREE.Vector3(-6.1, 2.42, 14.7),
    look: new THREE.Vector3(-3.7, 0.74, -1.25),
  },
  {
    camera: new THREE.Vector3(0.2, 2.15, 12.6),
    look: new THREE.Vector3(0.0, 0.72, -0.42),
  },
  {
    camera: new THREE.Vector3(6.25, 1.88, 15.25),
    look: new THREE.Vector3(3.7, 0.58, -1.58),
  },
] as const;

const ROOM_ANCHORS = [
  { x: -6.8, center: 0.08, texture: MEMORY_TEXTURES[0], color: "#e4b45f" },
  { x: 0.0, center: 0.5, texture: MEMORY_TEXTURES[1], color: "#53c0ca" },
  { x: 6.8, center: 0.92, texture: MEMORY_TEXTURES[2], color: "#90a6d5" },
] as const;
const ROOM_MODES: WorldMode[] = ["soglia", "vaga", "silenzio"];

const WORLD_PORTALS: Array<
  WorldPortal & { x: number; color: string; glow: string }
> = [
  {
    id: "soglia",
    label: "Soglia",
    journey: 0.12,
    mode: "soglia",
    path: "/che-cose",
    x: ROOM_ANCHORS[0].x,
    color: "#e4b45f",
    glow: "#f3cf8f",
  },
  {
    id: "vaga",
    label: "Vaga",
    journey: 0.56,
    mode: "vaga",
    path: "/entra",
    x: ROOM_ANCHORS[1].x,
    color: "#53c0ca",
    glow: "#9ee0e6",
  },
  {
    id: "offri",
    label: "Deposito",
    journey: 0.9,
    mode: "silenzio",
    path: "/offri",
    x: ROOM_ANCHORS[2].x,
    color: "#90a6d5",
    glow: "#c1cdeb",
  },
];

const sampleRoomPath = (progress: number) => {
  const clamped = THREE.MathUtils.clamp(progress, 0, 1);
  const maxIndex = ROOM_PATH.length - 1;
  const scaled = clamped * maxIndex;
  const index = Math.floor(scaled);
  const t = scaled - index;
  const from = ROOM_PATH[index];
  const to = ROOM_PATH[Math.min(index + 1, maxIndex)];
  return {
    camera: from.camera.clone().lerp(to.camera, t),
    look: from.look.clone().lerp(to.look, t),
  };
};

const FallbackWorldLayer = ({ mode }: { mode: WorldMode }) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `${FALLBACK_GLOWS[mode]}, linear-gradient(180deg,#0f141b_0%,#111a23_100%)`,
      }}
    />
    <img
      src="/cavapendoli/models-a.png"
      alt=""
      className="world-float-slow absolute left-[6%] top-[14%] h-[43%] w-[38%] rounded-[2rem] object-cover opacity-[0.46] blur-[1px] mix-blend-screen"
    />
    <img
      src="/cavapendoli/models-b.png"
      alt=""
      className="world-float-medium absolute right-[8%] top-[18%] h-[40%] w-[36%] rounded-[2rem] object-cover opacity-[0.42] blur-[1px] mix-blend-screen"
    />
    <img
      src="/cavapendoli/models-bw.png"
      alt=""
      className="world-float-slow absolute left-1/2 top-[46%] h-[40%] w-[48%] -translate-x-1/2 rounded-[2rem] object-cover opacity-[0.35] blur-[2px] mix-blend-screen"
    />
    <div className="world-float-medium absolute left-[14%] top-[63%] h-20 w-20 rounded-full bg-[#55bfd0]/20 blur-2xl" />
    <div className="world-float-slow absolute right-[16%] top-[65%] h-24 w-24 rounded-full bg-[#f5be54]/18 blur-2xl" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,17,0.26),rgba(8,10,15,0.78))]" />
  </div>
);

const CavapendoliWorldCanvas = ({
  mode,
  className,
  journey,
  accessibilityMode = false,
  interactivePortals = false,
  onPortalSelect,
  portalTravelDurationMs = 760,
  onPortalTravelProgress,
  fragmentTravelDurationMs = 560,
  onMemoryFragmentTravelProgress,
  onWorldSignal,
  soundscapeEnabled = false,
  memoryFragments = [],
  interactiveFragments = false,
  onMemoryFragmentSelect,
}: CavapendoliWorldCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const accessibilityModeRef = useRef(accessibilityMode);
  const modeRef = useRef<WorldMode>(mode);
  const journeyRef = useRef<number>(journey ?? MODE_JOURNEY_ANCHOR[mode]);
  const hasExternalJourneyRef = useRef(journey !== undefined);
  const onPortalSelectRef = useRef(onPortalSelect);
  const interactivePortalsRef = useRef(interactivePortals);
  const portalTravelDurationRef = useRef(portalTravelDurationMs);
  const onPortalTravelProgressRef = useRef(onPortalTravelProgress);
  const fragmentTravelDurationRef = useRef(fragmentTravelDurationMs);
  const onMemoryFragmentTravelProgressRef = useRef(onMemoryFragmentTravelProgress);
  const onWorldSignalRef = useRef(onWorldSignal);
  const soundscapeEnabledRef = useRef(soundscapeEnabled);
  const memoryFragmentsRef = useRef(memoryFragments);
  const interactiveFragmentsRef = useRef(interactiveFragments);
  const onMemoryFragmentSelectRef = useRef(onMemoryFragmentSelect);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    accessibilityModeRef.current = accessibilityMode;
  }, [accessibilityMode]);

  useEffect(() => {
    modeRef.current = mode;
    hasExternalJourneyRef.current = journey !== undefined;
    if (journey === undefined) {
      journeyRef.current = MODE_JOURNEY_ANCHOR[mode];
    }
  }, [mode, journey]);

  useEffect(() => {
    hasExternalJourneyRef.current = journey !== undefined;
    if (journey === undefined) return;
    journeyRef.current = THREE.MathUtils.clamp(journey, 0, 1);
  }, [journey]);

  useEffect(() => {
    onPortalSelectRef.current = onPortalSelect;
    interactivePortalsRef.current = interactivePortals;
  }, [onPortalSelect, interactivePortals]);

  useEffect(() => {
    portalTravelDurationRef.current = portalTravelDurationMs;
  }, [portalTravelDurationMs]);

  useEffect(() => {
    onPortalTravelProgressRef.current = onPortalTravelProgress;
  }, [onPortalTravelProgress]);

  useEffect(() => {
    fragmentTravelDurationRef.current = fragmentTravelDurationMs;
  }, [fragmentTravelDurationMs]);

  useEffect(() => {
    onMemoryFragmentTravelProgressRef.current = onMemoryFragmentTravelProgress;
  }, [onMemoryFragmentTravelProgress]);

  useEffect(() => {
    onWorldSignalRef.current = onWorldSignal;
  }, [onWorldSignal]);

  useEffect(() => {
    soundscapeEnabledRef.current = soundscapeEnabled;
  }, [soundscapeEnabled]);

  useEffect(() => {
    memoryFragmentsRef.current = memoryFragments;
    interactiveFragmentsRef.current = interactiveFragments;
    onMemoryFragmentSelectRef.current = onMemoryFragmentSelect;
  }, [memoryFragments, interactiveFragments, onMemoryFragmentSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!supportsWebGL()) {
      setWebglSupported(false);
      return;
    }
    setWebglSupported(true);

    const reduceMotion = prefersReducedMotion();
    const isCompact = window.matchMedia("(max-width: 900px)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const mobileLike = isCompact || coarsePointer;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowMemory = typeof deviceMemory === "number" && deviceMemory <= 4;
    const safePerformance = reduceMotion || lowMemory || mobileLike;
    const assistMode = accessibilityModeRef.current;
    const maxPixelRatio = safePerformance ? 1.1 : mobileLike ? 1.24 : 1.8;
    const effectsScale = safePerformance ? 0.76 : 1;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: !safePerformance,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.className = "h-full w-full";
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      44,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      120,
    );
    const initialPath = sampleRoomPath(journeyRef.current);
    camera.position.copy(initialPath.camera);
    camera.lookAt(initialPath.look);

    const fogColor = new THREE.Color(PRESETS[modeRef.current].fogColor);
    scene.fog = new THREE.FogExp2(fogColor, PRESETS[modeRef.current].fogDensity);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      PRESETS[modeRef.current].bloomStrength * (safePerformance ? 0.76 : 1),
      PRESETS[modeRef.current].bloomRadius * (safePerformance ? 0.8 : 1),
      0.72,
    );
    composer.addPass(bloomPass);

    const rgbShiftPass = new ShaderPass(RGBShiftShader);
    rgbShiftPass.enabled = !reduceMotion && !safePerformance;
    (rgbShiftPass.uniforms.amount as { value: number }).value =
      PRESETS[modeRef.current].chromatic * (safePerformance ? 0.62 : 1);
    composer.addPass(rgbShiftPass);

    const lensPass = new ShaderPass(CAVAPENDOLI_LENS_SHADER);
    (lensPass.uniforms.uNoise as { value: number }).value =
      PRESETS[modeRef.current].lensNoise * (safePerformance ? 0.74 : 1);
    (lensPass.uniforms.uVignette as { value: number }).value = PRESETS[modeRef.current].lensVignette;
    (lensPass.uniforms.uWarp as { value: number }).value =
      PRESETS[modeRef.current].lensWarp * (safePerformance ? 0.72 : 1);
    (lensPass.uniforms.uSaturation as { value: number }).value = PRESETS[modeRef.current].lensSaturation;
    composer.addPass(lensPass);

    const world = new THREE.Group();
    scene.add(world);

    const hemi = new THREE.HemisphereLight("#9ec6da", "#1f2534", 1.3);
    world.add(hemi);

    const key = new THREE.DirectionalLight("#f4d08a", 1.15);
    key.position.set(4.6, 7.2, 4.2);
    world.add(key);

    const fill = new THREE.PointLight("#5fc3cb", 1.15, 24, 2.3);
    fill.position.set(-5.2, 2.8, 4.8);
    world.add(fill);

    const rim = new THREE.PointLight("#ed6c4f", 0.8, 20, 1.9);
    rim.position.set(4.7, 1.4, -5.6);
    world.add(rim);

    const skyUniforms = {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(PRESETS[modeRef.current].skyA) },
      uColorB: { value: new THREE.Color(PRESETS[modeRef.current].skyB) },
      uColorC: { value: new THREE.Color(PRESETS[modeRef.current].skyC) },
    };
    const domeMaterial = new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      vertexShader: SKY_VERTEX_SHADER,
      fragmentShader: SKY_FRAGMENT_SHADER,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(42, 48, 24), domeMaterial);
    world.add(dome);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 72),
      new THREE.MeshStandardMaterial({
        color: "#18222d",
        roughness: 0.92,
        metalness: 0.05,
        transparent: true,
        opacity: 0.8,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.02;
    world.add(floor);

    const ringMat = new THREE.MeshStandardMaterial({
      color: "#c8ecf6",
      roughness: 0.35,
      metalness: 0.45,
      transparent: true,
      opacity: PRESETS[modeRef.current].ringOpacity,
      emissive: new THREE.Color("#3d7087"),
      emissiveIntensity: 0.22,
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.05, 12, 160), ringMat);
    ringA.position.set(0, 1.3, -0.5);
    ringA.rotation.x = Math.PI / 2.1;
    world.add(ringA);

    const ringB = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.06, 12, 180), ringMat.clone());
    ringB.position.set(0, 1.35, -0.7);
    ringB.rotation.x = Math.PI / 2.8;
    world.add(ringB);

    const oracleGroup = new THREE.Group();
    oracleGroup.position.set(0, 1.0, -0.6);
    world.add(oracleGroup);

    const oracleUniforms = {
      uTime: { value: 0 },
      uJourney: { value: journeyRef.current },
      uBurst: { value: 0 },
    };
    const oracleMaterial = new THREE.MeshStandardMaterial({
      color: "#8ed8db",
      roughness: 0.28,
      metalness: 0.3,
      emissive: new THREE.Color("#163447"),
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    oracleMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = oracleUniforms.uTime;
      shader.uniforms.uJourney = oracleUniforms.uJourney;
      shader.uniforms.uBurst = oracleUniforms.uBurst;
      shader.vertexShader =
        `
          uniform float uTime;
          uniform float uJourney;
          uniform float uBurst;
        ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `
          vec3 transformed = vec3(position);
          float wave = sin((position.y * 5.8) + uTime * 1.6 + position.x * 2.4) * 0.09;
          float flutter = cos((position.x * 7.3) - uTime * 1.15 + position.z * 3.2) * 0.05;
          transformed += normal * (wave + flutter) * (0.55 + uJourney * 0.75 + uBurst * 1.2);
        `,
      );
      shader.fragmentShader =
        `
          uniform float uTime;
          uniform float uJourney;
          uniform float uBurst;
        ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        `
          float stripe = sin((vViewPosition.y + uTime * 0.7) * 9.0 + vViewPosition.x * 3.1) * 0.5 + 0.5;
          vec3 shifted = mix(diffuse * vec3(0.92, 0.98, 1.08), diffuse * vec3(1.13, 0.96, 0.84), stripe);
          shifted *= 0.84 + uJourney * 0.18 + uBurst * 0.28;
          vec4 diffuseColor = vec4(shifted, opacity);
        `,
      );
    };
    oracleMaterial.needsUpdate = true;

    const oracleCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.86, 3), oracleMaterial);
    oracleGroup.add(oracleCore);

    const oracleShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.17, 1),
      new THREE.MeshBasicMaterial({
        color: "#d6f1f8",
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    oracleGroup.add(oracleShell);

    const oracleHaloA = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.018, 10, 120),
      new THREE.MeshBasicMaterial({
        color: "#8ecfd8",
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    oracleHaloA.rotation.x = Math.PI / 2;
    oracleGroup.add(oracleHaloA);

    const oracleHaloB = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, 0.014, 10, 120),
      new THREE.MeshBasicMaterial({
        color: "#f0c981",
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    oracleHaloB.rotation.x = Math.PI / 2.6;
    oracleGroup.add(oracleHaloB);

    const oracleSatellites: Array<{
      mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>;
      phase: number;
      speed: number;
      radius: number;
    }> = [];
    for (let i = 0; i < 7; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.065 + (i % 3) * 0.015, 10, 10),
        new THREE.MeshStandardMaterial({
          color: PALETTE[(i + 2) % PALETTE.length],
          roughness: 0.25,
          metalness: 0.28,
          emissive: new THREE.Color("#102838"),
          emissiveIntensity: 0.24,
          transparent: true,
          opacity: 0.75,
        }),
      );
      oracleGroup.add(mesh);
      oracleSatellites.push({
        mesh,
        phase: Math.random() * Math.PI * 2,
        speed: 0.55 + Math.random() * 0.5,
        radius: 1.2 + Math.random() * 0.48,
      });
    }

    const pedestals = new THREE.Group();
    world.add(pedestals);
    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 0.2 + Math.sin(i * 1.8) * 0.06, 8),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? "#4aa9b9" : "#e0a65d",
          roughness: 0.4,
          metalness: 0.2,
          emissive: new THREE.Color("#15222c"),
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.75,
        }),
      );
      pillar.position.set(Math.cos(angle) * 3.4, -0.88, Math.sin(angle) * 2.5);
      pedestals.add(pillar);
    }

    const creatureCount = safePerformance ? (mobileLike ? 5 : 8) : isCompact ? 8 : 13;
    const creatures: CreatureRuntime[] = [];
    for (let i = 0; i < creatureCount; i += 1) {
      const creature = addCreature(i + 1);
      const angle = (i / creatureCount) * Math.PI * 2;
      const ring = i % 2 === 0 ? 5.7 : 4.2;
      creature.base.set(
        Math.cos(angle) * ring + (i % 3 === 0 ? -0.8 : 0),
        -0.06 + Math.sin(i * 0.72) * 0.18,
        Math.sin(angle) * ring + (i % 2 === 0 ? 0.35 : -0.15),
      );
      if (creature.base.x < -2) {
        creature.zone = ROOM_ANCHORS[0].center;
      } else if (creature.base.x > 2) {
        creature.zone = ROOM_ANCHORS[2].center;
      } else {
        creature.zone = ROOM_ANCHORS[1].center;
      }
      creature.group.position.copy(creature.base);
      creature.group.rotation.y = angle + Math.PI * (0.32 + (i % 2) * 0.35);
      world.add(creature.group);
      creatures.push(creature);
    }

    const loader = new THREE.TextureLoader();
    const memoryGroup = new THREE.Group();
    memoryGroup.position.set(0, 1.15, -2.2);
    world.add(memoryGroup);
    const textures: THREE.Texture[] = [];
    const memoryPlanes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

    MEMORY_TEXTURES.forEach((url, index) => {
      const mat = new THREE.MeshBasicMaterial({
        color: "#d2e4ef",
        transparent: true,
        opacity: PRESETS[modeRef.current].planeOpacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.35), mat);
      plane.position.set((index - 1) * 3.25, 0.2 + index * 0.08, -1.2 + index * 0.4);
      plane.rotation.y = (index - 1) * 0.45;
      plane.rotation.x = -0.05 + index * 0.03;
      memoryGroup.add(plane);
      memoryPlanes.push(plane);

      loader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = 2;
          mat.map = texture;
          mat.needsUpdate = true;
          textures.push(texture);
        },
        undefined,
        () => {
          // Texture loading is optional for this atmosphere layer.
        },
      );
    });

    const roomAssemblages: Array<{
      group: THREE.Group;
      materials: THREE.Material[];
      center: number;
      spin: number;
    }> = [];

    ROOM_ANCHORS.forEach((room, roomIndex) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(room.x, -0.08, -0.9);
      world.add(roomGroup);

      const roomMaterials: THREE.Material[] = [];
      const registerMaterial = <T extends THREE.Material>(material: T) => {
        const withMeta = material as T & {
          userData: { baseOpacity?: number; baseEmissive?: number };
          opacity?: number;
          emissiveIntensity?: number;
        };
        withMeta.userData.baseOpacity = typeof withMeta.opacity === "number" ? withMeta.opacity : 1;
        withMeta.userData.baseEmissive =
          typeof withMeta.emissiveIntensity === "number" ? withMeta.emissiveIntensity : 0;
        roomMaterials.push(material);
        return material;
      };

      const archMaterial = registerMaterial(
        new THREE.MeshStandardMaterial({
          color: room.color,
          roughness: 0.33,
          metalness: 0.38,
          emissive: new THREE.Color("#203347"),
          emissiveIntensity: 0.3,
          transparent: true,
          opacity: 0.36,
        }),
      );
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.06, 12, 110, Math.PI), archMaterial);
      arch.position.set(0, 1.1, -0.2);
      arch.rotation.z = Math.PI;
      roomGroup.add(arch);

      const lowerRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.65, 0.04, 10, 90),
        registerMaterial(
          new THREE.MeshStandardMaterial({
            color: room.color,
            roughness: 0.45,
            metalness: 0.24,
            emissive: new THREE.Color("#1d2b39"),
            emissiveIntensity: 0.22,
            transparent: true,
            opacity: 0.3,
          }),
        ),
      );
      lowerRing.position.set(0, 0.1, -0.26);
      lowerRing.rotation.x = Math.PI / 2;
      roomGroup.add(lowerRing);

      const panelMaterial = registerMaterial(
        new THREE.MeshBasicMaterial({
          color: "#d4e6ef",
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.45), panelMaterial);
      panel.position.set(0, 0.86, -0.66);
      roomGroup.add(panel);

      loader.load(
        room.texture,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.anisotropy = 2;
          panelMaterial.map = texture;
          panelMaterial.needsUpdate = true;
          textures.push(texture);
        },
        undefined,
        () => {
          // Optional decorative texture layer.
        },
      );

      const markerMaterial = registerMaterial(
        new THREE.MeshStandardMaterial({
          color: room.color,
          roughness: 0.36,
          metalness: 0.22,
          emissive: new THREE.Color("#1a2733"),
          emissiveIntensity: 0.16,
          transparent: true,
          opacity: 0.38,
        }),
      );
      for (let i = 0; i < 3; i += 1) {
        const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.9 + i * 0.15, 10), markerMaterial);
        marker.position.set((i - 1) * 0.78, -0.48 + i * 0.07, -0.24 - i * 0.08);
        roomGroup.add(marker);
      }

      const beadGroup = new THREE.Group();
      roomGroup.add(beadGroup);
      for (let i = 0; i < 10; i += 1) {
        const beadMaterial = registerMaterial(
          new THREE.MeshStandardMaterial({
            color: PALETTE[(roomIndex * 2 + i) % PALETTE.length],
            roughness: 0.2,
            metalness: 0.32,
            emissive: new THREE.Color("#1c2f43"),
            emissiveIntensity: 0.26,
            transparent: true,
            opacity: 0.52,
          }),
        );
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045 + (i % 3) * 0.01, 10, 10), beadMaterial);
        const angle = (i / 10) * Math.PI * 2;
        bead.position.set(
          Math.cos(angle) * (1.25 + (i % 2) * 0.28),
          0.28 + Math.sin(i * 0.42) * 0.35,
          Math.sin(angle) * 0.62 - 0.1,
        );
        beadGroup.add(bead);
      }

      roomAssemblages.push({
        group: roomGroup,
        materials: roomMaterials,
        center: room.center,
        spin: roomIndex === 1 ? 1 : roomIndex === 0 ? -1 : 1,
      });
    });

    const roomLights: RoomLightRuntime[] = ROOM_ANCHORS.map((room, roomIndex) => {
      const point = new THREE.PointLight(room.color, 0.35, 9.5, 1.65);
      point.position.set(room.x, 2.25, 1.1);
      world.add(point);

      const spot = new THREE.SpotLight(room.color, 0.22, 13, Math.PI / 6, 0.55, 1.3);
      spot.position.set(room.x + (roomIndex === 1 ? 0 : roomIndex === 0 ? -0.5 : 0.5), 3.3, 2.5);
      const target = new THREE.Object3D();
      target.position.set(room.x, 0.64, -1.35);
      world.add(target);
      spot.target = target;
      world.add(spot);

      const markerMaterial = new THREE.MeshStandardMaterial({
        color: room.color,
        roughness: 0.25,
        metalness: 0.35,
        emissive: new THREE.Color("#102030"),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.65,
      });
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), markerMaterial);
      marker.position.set(room.x, 2.25, 1.12);
      world.add(marker);

      return { center: room.center, point, spot, marker };
    });

    const interactionTargetScale = assistMode || coarsePointer ? 1.42 : mobileLike ? 1.2 : 1;

    const portals: PortalRuntime[] = WORLD_PORTALS.map((portal, portalIndex) => {
      const group = new THREE.Group();
      const baseY = 0.72 + (portalIndex - 1) * 0.06;
      group.position.set(portal.x, baseY, 0.18);
      group.rotation.x = -Math.PI * 0.03;
      world.add(group);

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.022, 12, 120),
        new THREE.MeshStandardMaterial({
          color: portal.color,
          roughness: 0.28,
          metalness: 0.4,
          emissive: new THREE.Color(portal.glow),
          emissiveIntensity: 0.22,
          transparent: true,
          opacity: 0.38,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.01, 8, 90),
        new THREE.MeshBasicMaterial({
          color: portal.glow,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.rotation.x = Math.PI / 2;
      group.add(halo);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 12, 12),
        new THREE.MeshStandardMaterial({
          color: portal.color,
          roughness: 0.2,
          metalness: 0.42,
          emissive: new THREE.Color(portal.glow),
          emissiveIntensity: 0.24,
          transparent: true,
          opacity: 0.7,
        }),
      );
      core.position.y = 0.03;
      group.add(core);

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(0.56 * interactionTargetScale, 12, 12),
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hitTarget.userData.portalIndex = portalIndex;
      group.add(hitTarget);

      return {
        info: portal,
        group,
        ring,
        halo,
        core,
        hitTarget,
        baseY,
        zone: portal.journey,
      };
    });

    const fragmentNodes: MemoryFragmentRuntime[] = [];
    const fragmentSource = memoryFragmentsRef.current.slice(0, mobileLike ? 9 : isCompact ? 10 : 18);
    fragmentSource.forEach((fragment, index) => {
      const seed = Array.from(fragment.id).reduce(
        (sum, char, offset) => sum + char.charCodeAt(0) * (offset + 1),
        0,
      );
      const rng = createSeededRng(seed + index * 97 + 11);
      const zone =
        typeof fragment.zone === "number"
          ? THREE.MathUtils.clamp(fragment.zone, 0.02, 0.98)
          : ROOM_ANCHORS[index % ROOM_ANCHORS.length].center;
      const orbit = (index / Math.max(1, fragmentSource.length)) * Math.PI * 2 + rng() * 0.6;
      const radius = 2.2 + rng() * 4.2 + (index % 3) * 0.7;
      const baseY = -0.2 + rng() * 2.4;
      const paletteColor = PALETTE[Math.floor(rng() * PALETTE.length)];

      const group = new THREE.Group();
      group.position.set(Math.cos(orbit) * radius, baseY, Math.sin(orbit) * radius * 0.7 - 0.6);
      world.add(group);

      const core = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.14 + rng() * 0.08, 0),
        new THREE.MeshStandardMaterial({
          color: paletteColor,
          roughness: 0.24,
          metalness: 0.32,
          emissive: new THREE.Color("#102635"),
          emissiveIntensity: 0.24,
          transparent: true,
          opacity: 0.74,
        }),
      );
      group.add(core);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.26 + rng() * 0.1, 0.01, 8, 60),
        new THREE.MeshBasicMaterial({
          color: paletteColor,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      halo.rotation.x = Math.PI / 2;
      group.add(halo);

      const hitTarget = new THREE.Mesh(
        new THREE.SphereGeometry(0.26 * interactionTargetScale, 10, 10),
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hitTarget.userData.fragmentIndex = index;
      group.add(hitTarget);

      fragmentNodes.push({
        info: fragment,
        group,
        core,
        halo,
        hitTarget,
        zone,
        orbit,
        phase: rng() * Math.PI * 2,
        radius,
        baseY,
      });
    });

    const portalSigils: PortalSigilRuntime[] = [];
    portals.forEach((portal, portalIndex) => {
      const portalVisual = WORLD_PORTALS[portalIndex];
      const sigilTexts = [
        portal.info.label.toUpperCase(),
        `CAVA-${portal.info.id.toUpperCase()}`,
        `${Math.round(portal.info.journey * 100)}% TRACE`,
      ];

      sigilTexts.forEach((sigilText, sigilIndex) => {
        const texture = createPortalSigilTexture(sigilText, portalVisual.color, portalVisual.glow);
        textures.push(texture);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        const scaleX = 0.9 + sigilIndex * 0.08;
        const scaleY = 0.32 + sigilIndex * 0.03;
        sprite.scale.set(scaleX, scaleY, 1);
        portal.group.add(sprite);
        portalSigils.push({
          sprite,
          zone: portal.zone,
          portalIndex,
          baseAngle: (sigilIndex / sigilTexts.length) * Math.PI * 2,
          speed: 0.42 + sigilIndex * 0.13 + portalIndex * 0.07,
          lift: 0.22 + sigilIndex * 0.19,
          scaleX,
          scaleY,
        });
      });
    });

    scene.add(camera);
    const travelStreakGroup = new THREE.Group();
    travelStreakGroup.position.set(0, 0, -0.55);
    camera.add(travelStreakGroup);
    const travelStreaks: TravelStreakRuntime[] = [];
    const streakCount = safePerformance ? (mobileLike ? 10 : 16) : isCompact ? 16 : 28;
    for (let i = 0; i < streakCount; i += 1) {
      const angle = (i / streakCount) * Math.PI * 2;
      const radius = 0.26 + Math.random() * 0.74;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius * 0.55;
      const depth = 6.4 + Math.random() * 5.2;
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, -0.2),
        new THREE.Vector3(x * 1.8, y * 1.7, -depth),
      ]);
      const base = new Float32Array(
        (geometry.getAttribute("position") as THREE.BufferAttribute).array as Float32Array,
      );
      const material = new THREE.LineBasicMaterial({
        color: PALETTE[(i + 1) % PALETTE.length],
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geometry, material);
      travelStreakGroup.add(line);
      travelStreaks.push({
        line,
        base,
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 1.2,
        depth,
      });
    }
    travelStreakGroup.visible = false;

    const moteCount = safePerformance ? (mobileLike ? 90 : 140) : isCompact ? 150 : 290;
    const moteGeometry = new THREE.BufferGeometry();
    const motePositions = new Float32Array(moteCount * 3);
    const moteColors = new Float32Array(moteCount * 3);
    const moteSeeds = new Float32Array(moteCount);
    const moteBase = new Float32Array(moteCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < moteCount; i += 1) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.6 + Math.random() * 9.4;
      const y = -0.7 + Math.random() * 4.6;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      motePositions[i3] = x;
      motePositions[i3 + 1] = y;
      motePositions[i3 + 2] = z;
      moteBase[i3] = x;
      moteBase[i3 + 1] = y;
      moteBase[i3 + 2] = z;

      color.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      moteColors[i3] = color.r;
      moteColors[i3 + 1] = color.g;
      moteColors[i3 + 2] = color.b;
      moteSeeds[i] = Math.random() * Math.PI * 2;
    }

    moteGeometry.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
    moteGeometry.setAttribute("color", new THREE.BufferAttribute(moteColors, 3));

    const motes = new THREE.Points(
      moteGeometry,
      new THREE.PointsMaterial({
        size: isCompact ? 0.055 : 0.07,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    world.add(motes);

    const ribbons: THREE.Line[] = [];
    for (let i = 0; i < 3; i += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5.6 + i * 1.5, 0.35 + i * 0.5, -2.5 + i),
        new THREE.Vector3(-1.9 + i * 0.6, 1.1 + i * 0.4, -4.4 + i * 0.7),
        new THREE.Vector3(2.1 + i * 0.5, 1.55 + i * 0.25, -3.1 + i * 0.6),
        new THREE.Vector3(5.4 + i * 0.8, 0.62 + i * 0.3, -2 + i * 0.5),
      ]);
      const points = curve.getPoints(160);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: i === 1 ? "#80d2dc" : i === 2 ? "#f5bf53" : "#ef7150",
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(geometry, material);
      line.position.set(0, -0.2 + i * 0.15, 0.6 - i * 0.15);
      ribbons.push(line);
      world.add(line);
    }

    const currentStreams: CurrentStreamRuntime[] = [];
    ROOM_ANCHORS.forEach((room, roomIndex) => {
      const streamCount = safePerformance ? (mobileLike ? 1 : 2) : isCompact ? 2 : 4;
      for (let i = 0; i < streamCount; i += 1) {
        const color = PALETTE[(roomIndex * 3 + i) % PALETTE.length];
        const startX = room.x - 2.3 + i * 1.2 + (Math.random() - 0.5) * 0.35;
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(startX, -0.2 + Math.random() * 0.35, -2 + Math.random() * 0.4),
          new THREE.Vector3(room.x - 1.5 + Math.random() * 0.8, 0.8 + Math.random() * 0.8, -2.8),
          new THREE.Vector3(room.x + Math.random() * 0.9 - 0.45, 1.4 + Math.random() * 1.3, -2.6),
          new THREE.Vector3(room.x + 1.5 + Math.random() * 0.8, 0.7 + Math.random() * 0.9, -1.8),
          new THREE.Vector3(room.x + 2.4 + Math.random() * 0.65, -0.1 + Math.random() * 0.42, -1.1),
        ]);
        const points = curve.getPoints(96);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const position = geometry.getAttribute("position") as THREE.BufferAttribute;
        const base = new Float32Array((position.array as Float32Array).length);
        base.set(position.array as Float32Array);
        const seeds = new Float32Array(position.count);
        for (let j = 0; j < seeds.length; j += 1) {
          seeds[j] = Math.random() * Math.PI * 2;
        }
        const material = new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.18,
        });
        const line = new THREE.Line(geometry, material);
        line.position.z -= 0.4 + roomIndex * 0.06;
        world.add(line);

        currentStreams.push({
          line,
          base,
          seeds,
          zone: room.center,
          speed: 0.34 + Math.random() * 0.28,
          sway: 0.06 + Math.random() * 0.06,
        });
      }
    });

    const memoryBeacons: BeaconRuntime[] = [];
    ROOM_ANCHORS.forEach((room, roomIndex) => {
      const beaconCount = safePerformance ? (mobileLike ? 3 : 5) : isCompact ? 5 : 9;
      for (let i = 0; i < beaconCount; i += 1) {
        const material = new THREE.MeshStandardMaterial({
          color: PALETTE[(roomIndex * 4 + i) % PALETTE.length],
          roughness: 0.22,
          metalness: 0.3,
          emissive: new THREE.Color("#102030"),
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.45,
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 10, 10), material);
        const base = new THREE.Vector3(
          room.x + (Math.random() - 0.5) * 2.7,
          0.2 + Math.random() * 2.6,
          -1.8 + Math.random() * 2.3,
        );
        mesh.position.copy(base);
        world.add(mesh);
        memoryBeacons.push({
          mesh,
          base,
          zone: room.center,
          phase: Math.random() * Math.PI * 2,
          drift: 0.1 + Math.random() * 0.2,
        });
      }
    });

    const glyphCount = safePerformance ? (mobileLike ? 76 : 120) : isCompact ? 120 : 220;
    const glyphData: GlyphRuntime[] = [];
    const glyphMaterial = new THREE.MeshStandardMaterial({
      color: "#dbeaf2",
      roughness: 0.28,
      metalness: 0.32,
      emissive: new THREE.Color("#1f3448"),
      emissiveIntensity: 0.24,
      transparent: true,
      opacity: 0.74,
    });
    const glyphMesh = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(0.08, 0),
      glyphMaterial,
      glyphCount,
    );
    const matrix = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < glyphCount; i += 1) {
      const angle = (i / glyphCount) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 7.5;
      const base = new THREE.Vector3(
        Math.cos(angle) * radius,
        -0.5 + Math.random() * 3,
        Math.sin(angle) * (radius * 0.75),
      );
      const scale = 0.35 + Math.random() * 1.5;
      const phase = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.45;
      glyphData.push({ base, phase, speed, scale });

      p.copy(base);
      q.setFromAxisAngle(up, phase);
      s.setScalar(scale);
      matrix.compose(p, q, s);
      glyphMesh.setMatrixAt(i, matrix);
    }
    world.add(glyphMesh);

    const pointer = new THREE.Vector2(0, 0);
    const pointerTarget = new THREE.Vector2(0, 0);

    const pulseRings: PulseRuntime[] = [];
    const addPulse = () => {
      if (reduceMotion) return;
      const pulseMat = new THREE.MeshStandardMaterial({
        color: "#e9cc84",
        roughness: 0.25,
        metalness: 0.42,
        transparent: true,
        opacity: 0.8,
        emissive: new THREE.Color("#83644e"),
        emissiveIntensity: 0.42,
      });
      const pulse = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.015, 8, 90), pulseMat);
      pulse.position.set(pointer.x * 2.2, 0.35 + pointer.y * 1.1, -0.4 + Math.random() * 0.6);
      pulse.rotation.x = Math.PI / 2;
      world.add(pulse);
      pulseRings.push({
        mesh: pulse,
        life: 1,
        speed: 1 + Math.random() * 0.7,
      });
      while (pulseRings.length > 9) {
        const removed = pulseRings.shift();
        if (!removed) break;
        world.remove(removed.mesh);
        removed.mesh.geometry.dispose();
        removed.mesh.material.dispose();
      }
    };

    const raycaster = new THREE.Raycaster();
    const rayPointer = new THREE.Vector2(0, 0);
    let hoveredPortalIndex = -1;
    let hoveredFragmentIndex = -1;
    const portalHitTargets = portals.map((portal) => portal.hitTarget);
    const fragmentHitTargets = fragmentNodes.map((fragment) => fragment.hitTarget);
    let portalTravel: PortalTravelRuntime | null = null;
    let fragmentTravel: FragmentTravelRuntime | null = null;
    let travelWasActive = false;
    let lastTravelProgress = -1;
    let lastTravelPortalId = "";
    let fragmentTravelWasActive = false;
    let lastFragmentTravelProgress = -1;
    let lastFragmentTravelId = "";
    let lastSignalAt = 0;
    let lastSignalKey = "";

    type SoundRoomRuntime = {
      primary: OscillatorNode;
      shimmer: OscillatorNode;
      wobble: OscillatorNode;
      wobbleGain: GainNode;
      gain: GainNode;
      filter: BiquadFilterNode;
      base: number;
      shimmerBase: number;
    };

    type SoundRuntime = {
      context: AudioContext;
      master: GainNode;
      rooms: SoundRoomRuntime[];
    };

    let soundRuntime: SoundRuntime | null = null;
    const AUDIO_BASES = [92, 118, 74];
    const AUDIO_SHIMMER = [183, 236, 161];

    const createSoundRuntime = (): SoundRuntime | null => {
      if (!soundscapeEnabledRef.current) return null;
      const AudioContextClass = (
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      );
      if (!AudioContextClass) return null;

      const context = new AudioContextClass();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      const rooms = AUDIO_BASES.map((base, index) => {
        const gain = context.createGain();
        gain.gain.value = 0;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 760 + index * 170;
        filter.Q.value = 0.8;
        gain.connect(filter);
        filter.connect(master);

        const primary = context.createOscillator();
        primary.type = index === 1 ? "triangle" : "sine";
        primary.frequency.value = base;

        const shimmer = context.createOscillator();
        shimmer.type = "sine";
        shimmer.frequency.value = AUDIO_SHIMMER[index];

        const wobble = context.createOscillator();
        wobble.type = "sine";
        wobble.frequency.value = 0.11 + index * 0.045;
        const wobbleGain = context.createGain();
        wobbleGain.gain.value = 2.4 + index * 0.8;
        wobble.connect(wobbleGain);
        wobbleGain.connect(primary.frequency);

        primary.connect(gain);
        shimmer.connect(gain);

        primary.start();
        shimmer.start();
        wobble.start();

        return {
          primary,
          shimmer,
          wobble,
          wobbleGain,
          gain,
          filter,
          base,
          shimmerBase: AUDIO_SHIMMER[index],
        };
      });

      return {
        context,
        master,
        rooms,
      };
    };

    const ensureSoundRuntime = () => {
      if (!soundscapeEnabledRef.current) return;
      if (!soundRuntime) {
        soundRuntime = createSoundRuntime();
      }
      if (!soundRuntime) return;
      if (soundRuntime.context.state === "suspended") {
        void soundRuntime.context.resume();
      }
    };

    const emitPortalTravel = (update: PortalTravelProgress) => {
      const callback = onPortalTravelProgressRef.current;
      if (!callback) return;
      if (!update.active) {
        if (!travelWasActive) return;
        travelWasActive = false;
        lastTravelProgress = -1;
        lastTravelPortalId = "";
        callback(update);
        return;
      }

      const portalId = update.portal?.id ?? "";
      const progressDelta = Math.abs(update.progress - lastTravelProgress);
      if (portalId !== lastTravelPortalId || progressDelta >= 0.016 || !travelWasActive) {
        callback(update);
        travelWasActive = true;
        lastTravelProgress = update.progress;
        lastTravelPortalId = portalId;
      }
    };

    const emitMemoryFragmentTravel = (update: MemoryFragmentTravelProgress) => {
      const callback = onMemoryFragmentTravelProgressRef.current;
      if (!callback) return;
      if (!update.active) {
        if (!fragmentTravelWasActive) return;
        fragmentTravelWasActive = false;
        lastFragmentTravelProgress = -1;
        lastFragmentTravelId = "";
        callback(update);
        return;
      }

      const fragmentId = update.fragment?.id ?? "";
      const progressDelta = Math.abs(update.progress - lastFragmentTravelProgress);
      if (
        fragmentId !== lastFragmentTravelId ||
        progressDelta >= 0.016 ||
        !fragmentTravelWasActive
      ) {
        callback(update);
        fragmentTravelWasActive = true;
        lastFragmentTravelProgress = update.progress;
        lastFragmentTravelId = fragmentId;
      }
    };

    const emitWorldSignal = (signal: WorldSignal) => {
      const callback = onWorldSignalRef.current;
      if (!callback) return;
      const now = performance.now();
      const key = [
        signal.activeRoom,
        signal.hoveredPortal?.id ?? "-",
        signal.hoveredFragment?.id ?? "-",
        signal.portalTravelActive ? "1" : "0",
        signal.fragmentTravelActive ? "1" : "0",
      ].join(":");
      if (now - lastSignalAt < 85 && key === lastSignalKey) {
        return;
      }
      lastSignalAt = now;
      lastSignalKey = key;
      callback(signal);
    };

    const getLocalPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return null;
      return {
        x: x * 2 - 1,
        y: -(y * 2 - 1),
      };
    };

    const getPortalHitIndex = (event: PointerEvent) => {
      if (!interactivePortalsRef.current || portalHitTargets.length === 0) return -1;
      const local = getLocalPointer(event);
      if (!local) return -1;
      rayPointer.set(local.x, local.y);
      raycaster.setFromCamera(rayPointer, camera);
      const hit = raycaster.intersectObjects(portalHitTargets, false)[0];
      if (!hit) return -1;
      return Number(hit.object.userData.portalIndex ?? -1);
    };

    const getFragmentHitIndex = (event: PointerEvent) => {
      if (!interactiveFragmentsRef.current || fragmentHitTargets.length === 0) return -1;
      const local = getLocalPointer(event);
      if (!local) return -1;
      rayPointer.set(local.x, local.y);
      raycaster.setFromCamera(rayPointer, camera);
      const hit = raycaster.intersectObjects(fragmentHitTargets, false)[0];
      if (!hit) return -1;
      return Number(hit.object.userData.fragmentIndex ?? -1);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (portalTravel || fragmentTravel) return;
      const local = getLocalPointer(event);
      if (local && !reduceMotion && !coarsePointer) {
        pointerTarget.x = local.x;
        pointerTarget.y = local.y;
      }

      if (!interactivePortalsRef.current && !interactiveFragmentsRef.current) {
        hoveredPortalIndex = -1;
        hoveredFragmentIndex = -1;
        renderer.domElement.style.cursor = "default";
        return;
      }
      const nextHovered = getPortalHitIndex(event);
      if (nextHovered >= 0) {
        hoveredPortalIndex = nextHovered;
        hoveredFragmentIndex = -1;
        renderer.domElement.style.cursor = "pointer";
        return;
      }
      hoveredPortalIndex = -1;
      const nextFragmentHovered = getFragmentHitIndex(event);
      hoveredFragmentIndex = nextFragmentHovered;
      renderer.domElement.style.cursor = hoveredFragmentIndex >= 0 ? "pointer" : "default";
    };
    const onPointerDown = (event: PointerEvent) => {
      if (portalTravel || fragmentTravel) return;
      const local = getLocalPointer(event);
      if (!local) return;

      addPulse();
      ensureSoundRuntime();

      const portalIndex = getPortalHitIndex(event);
      if (portalIndex >= 0) {
        const selectedPortal = portals[portalIndex];
        if (!selectedPortal) return;

        journeyRef.current = selectedPortal.info.journey;
        modeRef.current = selectedPortal.info.mode;
        hasExternalJourneyRef.current = true;
        modeBurst = Math.max(modeBurst, 0.78);
        addPulse();
        hoveredPortalIndex = portalIndex;
        hoveredFragmentIndex = -1;
        renderer.domElement.style.cursor = "pointer";
        portalTravel = {
          portalIndex,
          progress: 0,
          durationMs: Math.max(260, portalTravelDurationRef.current),
          dispatched: false,
        };
        return;
      }

      const fragmentIndex = getFragmentHitIndex(event);
      if (fragmentIndex < 0) return;
      const fragment = fragmentNodes[fragmentIndex];
      if (!fragment) return;
      hoveredFragmentIndex = fragmentIndex;
      journeyRef.current = fragment.zone;
      hasExternalJourneyRef.current = true;
      modeBurst = Math.max(modeBurst, 0.62);
      addPulse();
      addPulse();
      fragmentTravel = {
        fragmentIndex,
        progress: 0,
        durationMs: Math.max(220, fragmentTravelDurationRef.current),
        dispatched: false,
      };
      renderer.domElement.style.cursor = "pointer";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    const onResize = () => {
      if (!container) return;
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const ratio = Math.min(window.devicePixelRatio, maxPixelRatio);
      renderer.setPixelRatio(ratio);
      renderer.setSize(width, height);
      composer.setPixelRatio(ratio);
      composer.setSize(width, height);
      bloomPass.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    const currentPreset = {
      cameraY: PRESETS[modeRef.current].cameraY,
      cameraZ: PRESETS[modeRef.current].cameraZ,
      fogDensity: PRESETS[modeRef.current].fogDensity,
      lightStrength: PRESETS[modeRef.current].lightStrength,
      driftStrength: PRESETS[modeRef.current].driftStrength,
      particleStrength: PRESETS[modeRef.current].particleStrength,
      ringOpacity: PRESETS[modeRef.current].ringOpacity,
      planeOpacity: PRESETS[modeRef.current].planeOpacity,
      bloomStrength: PRESETS[modeRef.current].bloomStrength,
      bloomRadius: PRESETS[modeRef.current].bloomRadius,
      chromatic: PRESETS[modeRef.current].chromatic,
      orbitAmplitude: PRESETS[modeRef.current].orbitAmplitude,
      orbitSpeed: PRESETS[modeRef.current].orbitSpeed,
      lensNoise: PRESETS[modeRef.current].lensNoise,
      lensVignette: PRESETS[modeRef.current].lensVignette,
      lensWarp: PRESETS[modeRef.current].lensWarp,
      lensSaturation: PRESETS[modeRef.current].lensSaturation,
    };

    const targetSkyA = new THREE.Color(PRESETS[modeRef.current].skyA);
    const targetSkyB = new THREE.Color(PRESETS[modeRef.current].skyB);
    const targetSkyC = new THREE.Color(PRESETS[modeRef.current].skyC);
    const tempColor = new THREE.Color();
    const clock = new THREE.Clock();
    const cameraTarget = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const portalCameraTarget = new THREE.Vector3();
    const portalLookTarget = new THREE.Vector3();
    const fragmentCameraTarget = new THREE.Vector3();
    const fragmentLookTarget = new THREE.Vector3();
    let activeMode: WorldMode = modeRef.current;
    let currentJourney = THREE.MathUtils.clamp(journeyRef.current, 0, 1);
    let modeBurst = 0;
    let frame = 0;

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      const preset = PRESETS[modeRef.current];

      if (activeMode !== modeRef.current) {
        activeMode = modeRef.current;
        modeBurst = 1;
        addPulse();
        addPulse();
      }
      modeBurst = Math.max(0, modeBurst - (reduceMotion ? 0.03 : 0.02));

      currentPreset.cameraY = THREE.MathUtils.lerp(currentPreset.cameraY, preset.cameraY, 0.03);
      currentPreset.cameraZ = THREE.MathUtils.lerp(currentPreset.cameraZ, preset.cameraZ, 0.03);
      currentPreset.fogDensity = THREE.MathUtils.lerp(currentPreset.fogDensity, preset.fogDensity, 0.03);
      currentPreset.lightStrength = THREE.MathUtils.lerp(currentPreset.lightStrength, preset.lightStrength, 0.03);
      currentPreset.driftStrength = THREE.MathUtils.lerp(currentPreset.driftStrength, preset.driftStrength, 0.03);
      currentPreset.particleStrength = THREE.MathUtils.lerp(
        currentPreset.particleStrength,
        preset.particleStrength,
        0.03,
      );
      currentPreset.ringOpacity = THREE.MathUtils.lerp(currentPreset.ringOpacity, preset.ringOpacity, 0.03);
      currentPreset.planeOpacity = THREE.MathUtils.lerp(currentPreset.planeOpacity, preset.planeOpacity, 0.03);
      currentPreset.bloomStrength = THREE.MathUtils.lerp(currentPreset.bloomStrength, preset.bloomStrength, 0.03);
      currentPreset.bloomRadius = THREE.MathUtils.lerp(currentPreset.bloomRadius, preset.bloomRadius, 0.03);
      currentPreset.chromatic = THREE.MathUtils.lerp(currentPreset.chromatic, preset.chromatic, 0.03);
      currentPreset.orbitAmplitude = THREE.MathUtils.lerp(currentPreset.orbitAmplitude, preset.orbitAmplitude, 0.03);
      currentPreset.orbitSpeed = THREE.MathUtils.lerp(currentPreset.orbitSpeed, preset.orbitSpeed, 0.03);
      currentPreset.lensNoise = THREE.MathUtils.lerp(currentPreset.lensNoise, preset.lensNoise, 0.03);
      currentPreset.lensVignette = THREE.MathUtils.lerp(currentPreset.lensVignette, preset.lensVignette, 0.03);
      currentPreset.lensWarp = THREE.MathUtils.lerp(currentPreset.lensWarp, preset.lensWarp, 0.03);
      currentPreset.lensSaturation = THREE.MathUtils.lerp(
        currentPreset.lensSaturation,
        preset.lensSaturation,
        0.03,
      );

      pointer.lerp(pointerTarget, reduceMotion ? 0.02 : 0.075);
      const orbitX = Math.sin(t * currentPreset.orbitSpeed) * currentPreset.orbitAmplitude;
      const orbitY = Math.cos(t * (currentPreset.orbitSpeed * 0.82)) * currentPreset.orbitAmplitude * 0.35;
      const targetJourney =
        hasExternalJourneyRef.current
          ? THREE.MathUtils.clamp(journeyRef.current, 0, 1)
          : MODE_JOURNEY_ANCHOR[modeRef.current];
      currentJourney = THREE.MathUtils.lerp(currentJourney, targetJourney, 0.028);
      const path = sampleRoomPath(currentJourney);
      const depthBias = (currentPreset.cameraZ - PRESETS.soglia.cameraZ) * 0.44;
      const heightBias = (currentPreset.cameraY - PRESETS.soglia.cameraY) * 0.24;
      let portalTravelMix = 0;
      let fragmentTravelMix = 0;
      let activeTravelPortal: WorldPortal | null = null;
      let activeTravelFragment: WorldMemoryFragment | null = null;

      cameraTarget.set(
        path.camera.x + pointer.x * 1.15 * currentPreset.driftStrength + orbitX,
        path.camera.y + pointer.y * 0.45 * currentPreset.driftStrength + orbitY + heightBias,
        path.camera.z + depthBias,
      );
      lookTarget.copy(path.look);

      if (portalTravel) {
        const portal = portals[portalTravel.portalIndex];
        if (portal) {
          activeTravelPortal = portal.info;
          portalTravel.progress = Math.min(
            1,
            portalTravel.progress + (delta * 1000) / Math.max(260, portalTravel.durationMs),
          );
          portalTravelMix = THREE.MathUtils.smootherstep(portalTravel.progress, 0, 1);

          const sideOffset =
            portalTravel.portalIndex === 0 ? -0.48 : portalTravel.portalIndex === portals.length - 1 ? 0.48 : 0;
          portalCameraTarget.set(
            portal.group.position.x + sideOffset,
            portal.group.position.y + 0.3,
            7.2 - portalTravelMix * 1.65,
          );
          portalLookTarget.set(
            portal.group.position.x,
            portal.group.position.y + 0.08,
            -0.25 + (1 - portalTravelMix) * 0.38,
          );
          cameraTarget.lerp(portalCameraTarget, portalTravelMix);
          lookTarget.lerp(portalLookTarget, portalTravelMix);

          if (!portalTravel.dispatched && portalTravel.progress >= (reduceMotion ? 0.72 : 0.95)) {
            portalTravel.dispatched = true;
            onPortalSelectRef.current?.(portal.info);
          }

          if (portalTravel.progress >= 1) {
            portalTravel = null;
            hoveredPortalIndex = -1;
            hoveredFragmentIndex = -1;
            renderer.domElement.style.cursor = "default";
          }
        } else {
          portalTravel = null;
          hoveredPortalIndex = -1;
          hoveredFragmentIndex = -1;
          renderer.domElement.style.cursor = "default";
        }
      }

      if (!portalTravel && fragmentTravel) {
        const fragment = fragmentNodes[fragmentTravel.fragmentIndex];
        if (fragment) {
          activeTravelFragment = fragment.info;
          fragmentTravel.progress = Math.min(
            1,
            fragmentTravel.progress + (delta * 1000) / Math.max(220, fragmentTravel.durationMs),
          );
          fragmentTravelMix = THREE.MathUtils.smootherstep(fragmentTravel.progress, 0, 1);

          const sideOffset = (fragment.zone - 0.5) * 0.42;
          fragmentCameraTarget.set(
            fragment.group.position.x + sideOffset,
            fragment.group.position.y + 0.24 + Math.sin(t * 1.4 + fragment.phase) * 0.04,
            6.6 - fragmentTravelMix * 1.45,
          );
          fragmentLookTarget.set(
            fragment.group.position.x,
            fragment.group.position.y + 0.04,
            fragment.group.position.z - 0.18,
          );
          cameraTarget.lerp(fragmentCameraTarget, fragmentTravelMix * 0.9);
          lookTarget.lerp(fragmentLookTarget, fragmentTravelMix * 0.92);

          if (
            !fragmentTravel.dispatched &&
            fragmentTravel.progress >= (reduceMotion ? 0.68 : 0.86)
          ) {
            fragmentTravel.dispatched = true;
            onMemoryFragmentSelectRef.current?.(fragment.info);
          }

          if (fragmentTravel.progress >= 1) {
            fragmentTravel = null;
            hoveredPortalIndex = -1;
            hoveredFragmentIndex = -1;
            renderer.domElement.style.cursor = "default";
          }
        } else {
          fragmentTravel = null;
          hoveredPortalIndex = -1;
          hoveredFragmentIndex = -1;
          renderer.domElement.style.cursor = "default";
        }
      }

      emitPortalTravel({
        portal: activeTravelPortal,
        progress: portalTravel ? portalTravel.progress : 0,
        active: !!portalTravel,
      });
      emitMemoryFragmentTravel({
        fragment: activeTravelFragment,
        progress: fragmentTravel ? fragmentTravel.progress : 0,
        active: !!fragmentTravel,
      });

      const cameraLerp = 0.028 + portalTravelMix * 0.046 + fragmentTravelMix * 0.04;
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, cameraTarget.x, cameraLerp);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, cameraTarget.y, cameraLerp);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraTarget.z, cameraLerp);
      camera.lookAt(lookTarget);

      tempColor.set(preset.fogColor);
      fogColor.lerp(tempColor, 0.025);
      (scene.fog as THREE.FogExp2).color.copy(fogColor);
      (scene.fog as THREE.FogExp2).density = currentPreset.fogDensity;

      targetSkyA.set(preset.skyA);
      targetSkyB.set(preset.skyB);
      targetSkyC.set(preset.skyC);
      (skyUniforms.uColorA.value as THREE.Color).lerp(targetSkyA, 0.02);
      (skyUniforms.uColorB.value as THREE.Color).lerp(targetSkyB, 0.02);
      (skyUniforms.uColorC.value as THREE.Color).lerp(targetSkyC, 0.02);
      skyUniforms.uTime.value = t;

      hemi.intensity = THREE.MathUtils.lerp(hemi.intensity, 1.2 * currentPreset.lightStrength, 0.04);
      key.intensity = THREE.MathUtils.lerp(key.intensity, 1.05 * currentPreset.lightStrength, 0.04);
      fill.intensity = THREE.MathUtils.lerp(fill.intensity, 1.1 * currentPreset.lightStrength, 0.04);
      rim.intensity = THREE.MathUtils.lerp(rim.intensity, 0.85 * currentPreset.lightStrength, 0.04);

      bloomPass.strength = currentPreset.bloomStrength * effectsScale;
      bloomPass.radius = currentPreset.bloomRadius * (safePerformance ? 0.82 : 1);
      (rgbShiftPass.uniforms.amount as { value: number }).value =
        currentPreset.chromatic * (safePerformance ? 0.62 : 1);
      (lensPass.uniforms.uTime as { value: number }).value = t;
      (lensPass.uniforms.uNoise as { value: number }).value =
        (currentPreset.lensNoise + modeBurst * 0.03 + portalTravelMix * 0.07 + fragmentTravelMix * 0.05) *
        (safePerformance ? 0.72 : 1);
      (lensPass.uniforms.uVignette as { value: number }).value =
        currentPreset.lensVignette + modeBurst * 0.04 + portalTravelMix * 0.08 + fragmentTravelMix * 0.06;
      (lensPass.uniforms.uWarp as { value: number }).value =
        (currentPreset.lensWarp + modeBurst * 0.02 + portalTravelMix * 0.034 + fragmentTravelMix * 0.028) *
        (safePerformance ? 0.72 : 1);
      (lensPass.uniforms.uSaturation as { value: number }).value =
        currentPreset.lensSaturation + modeBurst * 0.08 + portalTravelMix * 0.14 + fragmentTravelMix * 0.1;
      const transitMix = Math.max(portalTravelMix, fragmentTravelMix * 0.9);

      ringMat.opacity = currentPreset.ringOpacity + modeBurst * 0.2;
      (ringB.material as THREE.MeshStandardMaterial).opacity = currentPreset.ringOpacity * 0.86;

      ringA.rotation.y = t * 0.2 * currentPreset.driftStrength;
      ringA.rotation.z = Math.sin(t * 0.12) * 0.18;
      ringB.rotation.y = -t * 0.16 * currentPreset.driftStrength;
      ringB.rotation.z = Math.cos(t * 0.11) * 0.14;
      ringA.scale.setScalar(1 + modeBurst * 0.22 + transitMix * 0.12);
      ringB.scale.setScalar(1 + modeBurst * 0.1 + transitMix * 0.08);

      const oracleFocus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - 0.52) * 1.45, 0, 1);
      const oracleTravelPulse = portalTravelMix * 1.25 + fragmentTravelMix * 0.8;
      oracleUniforms.uTime.value = t;
      oracleUniforms.uJourney.value = currentJourney;
      oracleUniforms.uBurst.value = modeBurst + oracleTravelPulse;

      oracleGroup.position.y = THREE.MathUtils.lerp(
        oracleGroup.position.y,
        1 + Math.sin(t * 0.63) * 0.12 * (0.4 + oracleFocus),
        0.08,
      );
      oracleGroup.rotation.y +=
        (0.003 + oracleFocus * 0.006 + portalTravelMix * 0.02 + fragmentTravelMix * 0.012) *
        currentPreset.driftStrength;
      oracleGroup.rotation.z = Math.sin(t * 0.35) * 0.06 * (0.4 + oracleFocus);
      oracleCore.rotation.x += 0.004 + oracleFocus * 0.0035 + portalTravelMix * 0.012 + fragmentTravelMix * 0.009;
      oracleCore.rotation.y -= 0.003 + oracleFocus * 0.002 + portalTravelMix * 0.008 + fragmentTravelMix * 0.007;
      oracleCore.scale.setScalar(0.88 + oracleFocus * 0.26 + portalTravelMix * 0.36 + fragmentTravelMix * 0.18);
      oracleMaterial.emissiveIntensity = THREE.MathUtils.lerp(
        oracleMaterial.emissiveIntensity,
        0.24 + oracleFocus * 1.2 + portalTravelMix * 1.1 + fragmentTravelMix * 0.7,
        0.08,
      );
      oracleMaterial.opacity = THREE.MathUtils.lerp(
        oracleMaterial.opacity,
        0.56 + oracleFocus * 0.34 + portalTravelMix * 0.22 + fragmentTravelMix * 0.14,
        0.08,
      );
      oracleShell.rotation.x = Math.sin(t * 0.4) * 0.32;
      oracleShell.rotation.y +=
        0.0045 + oracleFocus * 0.004 + portalTravelMix * 0.01 + fragmentTravelMix * 0.007;
      oracleShell.material.opacity = THREE.MathUtils.lerp(
        oracleShell.material.opacity,
        0.08 + oracleFocus * 0.34 + portalTravelMix * 0.24 + fragmentTravelMix * 0.14,
        0.08,
      );
      oracleHaloA.rotation.y +=
        0.005 + oracleFocus * 0.006 + portalTravelMix * 0.012 + fragmentTravelMix * 0.009;
      oracleHaloB.rotation.y -=
        0.004 + oracleFocus * 0.005 + portalTravelMix * 0.01 + fragmentTravelMix * 0.008;
      oracleHaloA.material.opacity = THREE.MathUtils.lerp(
        oracleHaloA.material.opacity,
        0.08 + oracleFocus * 0.24 + portalTravelMix * 0.28 + fragmentTravelMix * 0.14,
        0.08,
      );
      oracleHaloB.material.opacity = THREE.MathUtils.lerp(
        oracleHaloB.material.opacity,
        0.06 + oracleFocus * 0.2 + portalTravelMix * 0.24 + fragmentTravelMix * 0.13,
        0.08,
      );
      oracleSatellites.forEach((satellite, index) => {
        const phase = t * satellite.speed + satellite.phase;
        const orbitRadius = satellite.radius + Math.sin(t * 0.7 + index) * 0.08 * (0.4 + oracleFocus);
        satellite.mesh.position.set(
          Math.cos(phase) * orbitRadius,
          Math.sin(phase * 1.2) * 0.54 + Math.sin(t * 0.5 + index) * 0.24,
          Math.sin(phase * 0.85) * orbitRadius * 0.72,
        );
        satellite.mesh.material.emissiveIntensity =
          0.1 + oracleFocus * 0.65 + portalTravelMix * 0.7 + fragmentTravelMix * 0.35;
        satellite.mesh.material.opacity =
          0.2 + oracleFocus * 0.65 + portalTravelMix * 0.22 + fragmentTravelMix * 0.18;
      });

      world.position.x = THREE.MathUtils.lerp(world.position.x, -(currentJourney - 0.5) * 1.2, 0.02);
      world.rotation.y = THREE.MathUtils.lerp(
        world.rotation.y,
        Math.sin(currentJourney * Math.PI * 2) * 0.035,
        0.02,
      );
      roomAssemblages.forEach((room, index) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - room.center) * 3.4, 0, 1);
        room.group.position.y = THREE.MathUtils.lerp(
          room.group.position.y,
          -0.08 + (1 - focus) * 0.26,
          0.06,
        );
        room.group.rotation.y += (0.001 + focus * 0.0022) * currentPreset.driftStrength * room.spin;
        room.group.rotation.z = THREE.MathUtils.lerp(
          room.group.rotation.z,
          Math.sin(t * 0.6 + index) * 0.03 * focus,
          0.05,
        );
        room.materials.forEach((material) => {
          const visualMaterial = material as THREE.Material & {
            opacity?: number;
            emissiveIntensity?: number;
            userData: { baseOpacity?: number; baseEmissive?: number };
          };
          if (typeof visualMaterial.opacity === "number") {
            const baseOpacity = visualMaterial.userData.baseOpacity ?? visualMaterial.opacity;
            visualMaterial.opacity = THREE.MathUtils.lerp(
              visualMaterial.opacity,
              baseOpacity * (0.18 + focus * 0.95),
              0.08,
            );
          }
          if (typeof visualMaterial.emissiveIntensity === "number") {
            const baseEmissive =
              visualMaterial.userData.baseEmissive ?? visualMaterial.emissiveIntensity;
            visualMaterial.emissiveIntensity = THREE.MathUtils.lerp(
              visualMaterial.emissiveIntensity,
              baseEmissive * (0.4 + focus * 1.2),
              0.08,
            );
          }
        });
      });
      const roomFocuses = ROOM_ANCHORS.map((room) =>
        THREE.MathUtils.clamp(1 - Math.abs(currentJourney - room.center) * 3.2, 0, 1),
      );
      let strongestRoomIndex = 0;
      let strongestRoomFocus = roomFocuses[0] ?? 0;
      for (let i = 1; i < roomFocuses.length; i += 1) {
        const candidate = roomFocuses[i] ?? 0;
        if (candidate > strongestRoomFocus) {
          strongestRoomFocus = candidate;
          strongestRoomIndex = i;
        }
      }
      const hoveredPortal = hoveredPortalIndex >= 0 ? portals[hoveredPortalIndex]?.info ?? null : null;
      const hoveredFragment =
        hoveredFragmentIndex >= 0 ? fragmentNodes[hoveredFragmentIndex]?.info ?? null : null;
      emitWorldSignal({
        journey: currentJourney,
        activeRoom: ROOM_MODES[strongestRoomIndex] ?? "vaga",
        roomFocus: strongestRoomFocus,
        oracleFocus,
        hoveredPortal,
        hoveredFragment,
        portalTravelActive: !!portalTravel,
        fragmentTravelActive: !!fragmentTravel,
      });
      roomLights.forEach((room, index) => {
        const focus = roomFocuses[index] ?? 0;
        const pulse = 0.74 + Math.sin(t * (0.88 + index * 0.16)) * 0.26;
        room.point.intensity = THREE.MathUtils.lerp(
          room.point.intensity,
          0.2 + focus * 1.35 * pulse,
          0.08,
        );
        room.spot.intensity = THREE.MathUtils.lerp(
          room.spot.intensity,
          0.12 + focus * 0.85 * pulse,
          0.08,
        );
        room.marker.material.opacity = THREE.MathUtils.lerp(
          room.marker.material.opacity,
          0.16 + focus * 0.92,
          0.08,
        );
        room.marker.material.emissiveIntensity = THREE.MathUtils.lerp(
          room.marker.material.emissiveIntensity,
          0.08 + focus * 0.95,
          0.08,
        );
        room.marker.position.y = 2.18 + Math.sin(t * 0.9 + index) * 0.15 * focus;
        room.marker.scale.setScalar(0.8 + focus * 0.45);
      });

      if (soundRuntime) {
        const now = soundRuntime.context.currentTime;
        const enabled = soundscapeEnabledRef.current ? 1 : 0;
        soundRuntime.master.gain.setTargetAtTime(
          enabled * (0.035 + portalTravelMix * 0.055 + fragmentTravelMix * 0.028),
          now,
          0.18,
        );
        const modeShift = modeRef.current === "vaga" ? 8 : modeRef.current === "silenzio" ? -10 : 0;
        soundRuntime.rooms.forEach((room, index) => {
          const focus = roomFocuses[index] ?? 0;
          const wave = 1 + Math.sin(t * (0.48 + index * 0.08)) * 0.08;
          const targetGain =
            enabled * (0.002 + focus * 0.034 + portalTravelMix * 0.017 + fragmentTravelMix * 0.009) * wave;
          room.gain.gain.setTargetAtTime(targetGain, now, 0.14);
          room.primary.frequency.setTargetAtTime(room.base + modeShift + focus * 18, now, 0.2);
          room.shimmer.frequency.setTargetAtTime(room.shimmerBase + modeShift * 0.55 + focus * 42, now, 0.2);
          room.filter.frequency.setTargetAtTime(
            620 + focus * 1280 + portalTravelMix * 420 + fragmentTravelMix * 280,
            now,
            0.18,
          );
          room.wobbleGain.gain.setTargetAtTime(
            1.8 + focus * 2.3 + portalTravelMix * 2.8 + fragmentTravelMix * 1.7,
            now,
            0.2,
          );
        });
      }
      portals.forEach((portal, index) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - portal.zone) * 3.35, 0, 1);
        const hover = hoveredPortalIndex === index ? 1 : 0;
        const travel = portalTravel?.portalIndex === index ? 1 : 0;
        const emphasis = focus * 0.84 + hover * 1.2 + modeBurst * 0.25 + travel * 1.4;

        portal.group.position.y = THREE.MathUtils.lerp(
          portal.group.position.y,
          portal.baseY +
            Math.sin(t * (0.7 + index * 0.12)) * 0.08 * (0.4 + focus + hover * 0.8 + travel * 0.6),
          0.08,
        );
        portal.group.rotation.y += (0.0032 + focus * 0.005 + hover * 0.004) * currentPreset.driftStrength;
        portal.ring.rotation.z = Math.sin(t * 0.9 + index) * 0.2;
        portal.halo.rotation.z = -Math.sin(t * 0.7 + index * 0.8) * 0.22;

        portal.ring.material.opacity = THREE.MathUtils.lerp(
          portal.ring.material.opacity,
          0.18 + emphasis * 0.6,
          0.12,
        );
        portal.ring.material.emissiveIntensity = THREE.MathUtils.lerp(
          portal.ring.material.emissiveIntensity,
          0.2 + emphasis * 0.78,
          0.12,
        );
        portal.halo.material.opacity = THREE.MathUtils.lerp(
          portal.halo.material.opacity,
          0.07 + emphasis * 0.42,
          0.12,
        );
        portal.core.material.opacity = THREE.MathUtils.lerp(
          portal.core.material.opacity,
          0.34 + emphasis * 0.62,
          0.12,
        );
        portal.core.material.emissiveIntensity = THREE.MathUtils.lerp(
          portal.core.material.emissiveIntensity,
          0.2 + emphasis * 1.1,
          0.12,
        );
        portal.core.scale.setScalar(0.88 + emphasis * 0.24);
      });
      fragmentNodes.forEach((fragment, index) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - fragment.zone) * 3.1, 0, 1);
        const hover = hoveredFragmentIndex === index ? 1 : 0;
        const travel = fragmentTravel?.fragmentIndex === index ? 1 : 0;
        const portalEnergy = portalTravelMix * 0.35 + fragmentTravelMix * 0.28;
        const orbit = t * (0.18 + index * 0.007) + fragment.orbit;
        const drift = 0.42 + focus * 0.62 + hover * 0.75 + travel * 0.7;
        const zoneBias = (fragment.zone - 0.5) * 1.4;

        fragment.group.position.x = THREE.MathUtils.lerp(
          fragment.group.position.x,
          Math.cos(orbit) * fragment.radius * 0.55 + zoneBias,
          0.06,
        );
        fragment.group.position.y = THREE.MathUtils.lerp(
          fragment.group.position.y,
          fragment.baseY + Math.sin(orbit * 1.7 + fragment.phase) * 0.22 * drift,
          0.06,
        );
        fragment.group.position.z = THREE.MathUtils.lerp(
          fragment.group.position.z,
          Math.sin(orbit * 1.2) * fragment.radius * 0.36 - 0.8 + Math.cos(orbit) * 0.28,
          0.06,
        );

        fragment.group.rotation.y += 0.006 + focus * 0.01 + hover * 0.012 + travel * 0.013;
        fragment.core.rotation.x += 0.01 + focus * 0.006 + travel * 0.01;
        fragment.core.rotation.z += 0.008 + hover * 0.01 + travel * 0.012;
        fragment.halo.rotation.y += 0.01 + focus * 0.006 + hover * 0.006 + travel * 0.01;
        fragment.halo.rotation.z = Math.sin(t * 0.9 + index) * 0.3;

        fragment.core.material.opacity = THREE.MathUtils.lerp(
          fragment.core.material.opacity,
          0.15 + focus * 0.7 + hover * 0.2 + travel * 0.22 + portalEnergy,
          0.1,
        );
        fragment.core.material.emissiveIntensity = THREE.MathUtils.lerp(
          fragment.core.material.emissiveIntensity,
          0.08 + focus * 0.85 + hover * 0.38 + travel * 0.5 + portalEnergy * 1.2,
          0.1,
        );
        fragment.halo.material.opacity = THREE.MathUtils.lerp(
          fragment.halo.material.opacity,
          0.02 + focus * 0.24 + hover * 0.16 + travel * 0.2,
          0.1,
        );
        const scale = 0.86 + focus * 0.24 + hover * 0.36 + travel * 0.34;
        fragment.core.scale.setScalar(scale);
      });
      portalSigils.forEach((sigil) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - sigil.zone) * 3.2, 0, 1);
        const hover = hoveredPortalIndex === sigil.portalIndex ? 1 : 0;
        const travel = portalTravel?.portalIndex === sigil.portalIndex ? 1 : 0;
        const energy = focus * 0.7 + hover * 1.05 + travel * 1.4 + modeBurst * 0.2;
        const angle = t * sigil.speed + sigil.baseAngle;
        sigil.sprite.position.set(
          Math.cos(angle) * (0.94 + focus * 0.34 + travel * 0.38),
          sigil.lift + Math.sin(angle * 1.35) * 0.09 + travel * 0.06,
          -0.18 + Math.sin(angle * 0.78) * 0.23,
        );
        const spriteMaterial = sigil.sprite.material as THREE.SpriteMaterial;
        spriteMaterial.opacity = THREE.MathUtils.lerp(
          spriteMaterial.opacity,
          0.02 + energy * 0.43,
          0.12,
        );
        const scale = 1 + focus * 0.18 + hover * 0.2 + travel * 0.44;
        sigil.sprite.scale.set(sigil.scaleX * scale, sigil.scaleY * scale, 1);
      });

      const streakMix = Math.max(portalTravelMix, fragmentTravelMix * 0.8);
      travelStreakGroup.visible = streakMix > 0.01;
      if (travelStreakGroup.visible) {
        travelStreakGroup.position.z = -0.55 - streakMix * 0.28;
        travelStreakGroup.rotation.z = Math.sin(t * 2.2) * 0.045 * streakMix;
      }
      travelStreaks.forEach((streak, index) => {
        const positions = streak.line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const array = positions.array as Float32Array;
        const pulse = 0.78 + Math.sin(t * 5.4 + streak.phase + index * 0.1) * 0.22;
        const wobble = Math.sin(t * streak.speed + streak.phase) * 0.06;
        array[0] = streak.base[0] + wobble;
        array[1] = streak.base[1] + Math.cos(t * streak.speed + streak.phase) * 0.05;
        array[2] = streak.base[2];
        array[3] = (streak.base[3] + wobble * 0.9) * (1 + streakMix * 0.32);
        array[4] = (streak.base[4] - wobble * 0.7) * (1 + streakMix * 0.32);
        array[5] = -streak.depth - streakMix * (6 + index * 0.22);
        positions.needsUpdate = true;
        streak.line.material.opacity = (0.02 + streakMix * 0.42) * pulse;
      });
      pedestals.rotation.y += 0.0013 * currentPreset.driftStrength;
      memoryGroup.rotation.y = Math.sin(t * 0.12) * 0.14 * currentPreset.driftStrength;
      memoryPlanes.forEach((plane, index) => {
        plane.material.opacity =
          currentPreset.planeOpacity + Math.sin(t * 0.8 + index * 1.3) * 0.025 * currentPreset.driftStrength;
      });

      creatures.forEach((creature, index) => {
        const drift = currentPreset.driftStrength;
        const zoneFocus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - creature.zone) * 3.1, 0, 1);
        creature.group.position.x =
          creature.base.x +
          Math.cos(t * creature.bobSpeed + creature.phase) * creature.swayAmount * drift * (0.7 + zoneFocus * 0.8);
        creature.group.position.y =
          creature.base.y +
          Math.sin(t * creature.bobSpeed * 1.35 + creature.phase) * creature.bobAmount * drift * (0.72 + zoneFocus);
        creature.group.position.z =
          creature.base.z + Math.sin(t * creature.bobSpeed + creature.phase + index * 0.4) * 0.24 * drift;
        creature.group.rotation.z =
          Math.sin(t * creature.bobSpeed + creature.phase) * 0.12 * (0.25 + drift);
        creature.group.rotation.y += 0.0012 + 0.002 * (0.28 + drift * 0.55 + zoneFocus * 0.9);
        creature.group.scale.setScalar((creature.group.scale.x * 0.96) + (0.9 + zoneFocus * 0.18) * 0.04);
        const pulse =
          0.06 +
          (Math.sin(t * 1.25 + creature.phase) * 0.06 + 0.06) * currentPreset.lightStrength * (0.7 + zoneFocus);
        creature.materials.forEach((material) => {
          material.emissiveIntensity = pulse;
          material.opacity = 0.58 + zoneFocus * 0.4;
        });
      });

      for (let i = 0; i < glyphCount; i += 1) {
        const glyph = glyphData[i];
        p.set(
          glyph.base.x + Math.cos(t * glyph.speed + glyph.phase) * 0.32 * currentPreset.driftStrength,
          glyph.base.y + Math.sin(t * glyph.speed * 1.4 + glyph.phase) * 0.25 * currentPreset.driftStrength,
          glyph.base.z + Math.sin(t * glyph.speed + glyph.phase) * 0.22 * currentPreset.driftStrength,
        );
        q.setFromAxisAngle(up, glyph.phase + t * 0.48 * glyph.speed);
        s.setScalar(glyph.scale * (0.86 + Math.sin(t * 1.3 + glyph.phase) * 0.16));
        matrix.compose(p, q, s);
        glyphMesh.setMatrixAt(i, matrix);
      }
      glyphMesh.instanceMatrix.needsUpdate = true;

      const positions = moteGeometry.getAttribute("position") as THREE.BufferAttribute;
      const motion = reduceMotion ? 0.2 : currentPreset.particleStrength;
      for (let i = 0; i < moteCount; i += 1) {
        const i3 = i * 3;
        const seed = moteSeeds[i];
        positions.array[i3] =
          moteBase[i3] +
          Math.cos(t * (0.33 + (i % 13) * 0.005) + seed) * 0.32 * motion +
          pointer.x * 0.16;
        positions.array[i3 + 1] =
          moteBase[i3 + 1] +
          Math.sin(t * (0.52 + (i % 11) * 0.006) + seed * 0.8) * 0.42 * motion +
          pointer.y * 0.12;
        positions.array[i3 + 2] =
          moteBase[i3 + 2] +
          Math.sin(t * (0.31 + (i % 17) * 0.005) + seed * 1.2) * 0.3 * motion;
      }
      positions.needsUpdate = true;

      ribbons.forEach((line, index) => {
        line.rotation.y = Math.sin(t * 0.17 + index) * 0.25 * currentPreset.driftStrength;
        line.position.y = -0.18 + Math.sin(t * (0.41 + index * 0.08)) * 0.1 * currentPreset.driftStrength;
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = 0.2 + Math.sin(t * 0.7 + index * 1.7) * 0.08 * currentPreset.driftStrength;
      });

      currentStreams.forEach((stream, streamIndex) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - stream.zone) * 3.35, 0, 1);
        const positions = stream.line.geometry.getAttribute("position") as THREE.BufferAttribute;
        const array = positions.array as Float32Array;

        for (let i = 0; i < positions.count; i += 1) {
          const i3 = i * 3;
          const seed = stream.seeds[i];
          const wave = t * stream.speed + seed + i * 0.09;
          const travel = 0.28 + focus * 1.15;
          array[i3] =
            stream.base[i3] +
            Math.cos(wave * 0.82) * stream.sway * travel +
            pointer.x * 0.12 * focus;
          array[i3 + 1] =
            stream.base[i3 + 1] +
            Math.sin(wave) * stream.sway * (0.78 + focus * 1.2) +
            modeBurst * 0.08;
          array[i3 + 2] =
            stream.base[i3 + 2] +
            Math.sin(wave * 0.62 + stream.zone * 6) * stream.sway * (0.32 + focus);
        }
        positions.needsUpdate = true;

        stream.line.rotation.y = Math.sin(t * 0.12 + streamIndex) * 0.07 * (0.2 + focus);
        stream.line.material.opacity =
          0.06 + focus * 0.34 + Math.sin(t * 0.72 + streamIndex * 1.6) * 0.06;
      });

      memoryBeacons.forEach((beacon, beaconIndex) => {
        const focus = THREE.MathUtils.clamp(1 - Math.abs(currentJourney - beacon.zone) * 3.2, 0, 1);
        beacon.mesh.position.x =
          beacon.base.x +
          Math.sin(t * 0.5 + beacon.phase + beaconIndex * 0.16) * beacon.drift * (0.45 + focus);
        beacon.mesh.position.y =
          beacon.base.y + Math.sin(t * 0.92 + beacon.phase) * beacon.drift * (0.84 + focus * 0.85);
        beacon.mesh.position.z =
          beacon.base.z + Math.cos(t * 0.62 + beacon.phase) * beacon.drift * (0.55 + focus * 0.7);
        beacon.mesh.material.opacity = 0.15 + focus * 0.72;
        beacon.mesh.material.emissiveIntensity = 0.08 + focus * 0.96;
        beacon.mesh.scale.setScalar(
          0.68 + focus * 0.62 + Math.sin(t * 1.1 + beacon.phase) * 0.08 * currentPreset.driftStrength,
        );
      });

      for (let i = pulseRings.length - 1; i >= 0; i -= 1) {
        const pulse = pulseRings[i];
        pulse.life -= 0.012 * pulse.speed;
        pulse.mesh.scale.multiplyScalar(1.026 + pulse.speed * 0.004);
        pulse.mesh.material.opacity = pulse.life * 0.72;
        pulse.mesh.material.emissiveIntensity = pulse.life * 0.75;
        if (pulse.life <= 0) {
          world.remove(pulse.mesh);
          pulse.mesh.geometry.dispose();
          pulse.mesh.material.dispose();
          pulseRings.splice(i, 1);
        }
      }

      composer.render();
    };

    animate();

    return () => {
      emitPortalTravel({ portal: null, progress: 0, active: false });
      emitMemoryFragmentTravel({ fragment: null, progress: 0, active: false });
      emitWorldSignal({
        journey: currentJourney,
        activeRoom: modeRef.current,
        roomFocus: 0,
        oracleFocus: 0,
        hoveredPortal: null,
        hoveredFragment: null,
        portalTravelActive: false,
        fragmentTravelActive: false,
      });
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      renderer.domElement.style.cursor = "default";
      if (soundRuntime) {
        soundRuntime.rooms.forEach((room) => {
          try {
            room.primary.stop();
            room.shimmer.stop();
            room.wobble.stop();
          } catch {
            // Oscillators might already be stopped.
          }
          room.primary.disconnect();
          room.shimmer.disconnect();
          room.wobble.disconnect();
          room.wobbleGain.disconnect();
          room.gain.disconnect();
          room.filter.disconnect();
        });
        soundRuntime.master.disconnect();
        void soundRuntime.context.close();
        soundRuntime = null;
      }
      camera.remove(travelStreakGroup);
      scene.remove(camera);
      travelStreaks.forEach((streak) => {
        streak.line.geometry.dispose();
        streak.line.material.dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      world.traverse((object) => {
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
      textures.forEach((texture) => texture.dispose());
      pulseRings.forEach((pulse) => {
        pulse.mesh.geometry.dispose();
        pulse.mesh.material.dispose();
      });
      (composer as unknown as { dispose?: () => void }).dispose?.();
      renderer.dispose();
    };
  }, [accessibilityMode]);

  return (
    <div className={cn("absolute inset-0", className)} aria-hidden>
      <div ref={containerRef} className="absolute inset-0" />
      {!webglSupported && <FallbackWorldLayer mode={mode} />}
    </div>
  );
};

export default CavapendoliWorldCanvas;
