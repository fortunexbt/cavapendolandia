import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildOffriRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "offri_room",
    center: new THREE.Vector3(-22, 0, -24),
    paletteShift: 3,
    muralTexture: texture,
    theme: {
      shellColor: "#2c3a4a",
      floorColor: "#3a4b5f",
      glowA: "#dfba91",
      glowB: "#9fc8d1",
      muralTint: "#efece4",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-3, 0.8, -2.2] },
      { label: "Archivio", action: { type: "navigate", route: "/entra" }, offset: [2.9, 0.8, -2.4] },
    ],
    utilityHotspots: [
      { label: "Apri modulo", action: { type: "open_overlay", overlay: "offri_form" }, offset: [0, 1.1, -3] },
    ],
  });
