import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildManifestoRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "manifesto_room",
    center: new THREE.Vector3(-22, 0, 0),
    paletteShift: 2,
    muralTexture: texture,
    theme: {
      shellColor: "#2a3b4d",
      floorColor: "#33495d",
      glowA: "#e0bf95",
      glowB: "#97c4cf",
      muralTint: "#edf0e8",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-2.9, 0.8, -2.2] },
      { label: "Entra", action: { type: "navigate", route: "/entra" }, offset: [3.1, 0.8, -2.3] },
    ],
  });
