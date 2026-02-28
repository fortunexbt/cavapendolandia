import * as THREE from "three";

export const PALETTE = [
  "#2fb8cb",
  "#f4bf4f",
  "#ef6a42",
  "#e84f4a",
  "#8acb64",
  "#2f6d95",
  "#5d5dbf",
  "#f4e9ce",
] as const;

export const applyPainterlyMaterial = (material: THREE.MeshStandardMaterial, seed: number) => {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPainterSeed = { value: seed };
    shader.fragmentShader =
      `
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
        float brush = sin((vViewPosition.x + uPainterSeed) * 7.0 + vViewPosition.y * 5.0) * 0.5 + 0.5;
        float blotch = painterHash(vViewPosition.xy * 5.0 + uPainterSeed);
        vec3 painterDiffuse = diffuse * (0.78 + brush * 0.28);
        painterDiffuse = mix(painterDiffuse, painterDiffuse * vec3(1.08, 0.95, 0.9), blotch * 0.18);
        vec4 diffuseColor = vec4( painterDiffuse, opacity );
      `,
    );
  };
  material.needsUpdate = true;
};

export const pickPaletteColor = (index: number) => PALETTE[index % PALETTE.length];

export const createSeededRng = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};
