import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildRimozioneRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "rimozione_room",
    center: new THREE.Vector3(38, 0, 0),
    paletteShift: 6,
    muralTexture: texture,
    theme: {
      shellColor: "#2b3b4b",
      floorColor: "#354a5d",
      glowA: "#d2b098",
      glowB: "#a7c2cc",
      muralTint: "#ecefe9",
    },
    portalTargets: [
      { label: "Regole", action: { type: "navigate", route: "/regole" }, offset: [-2.8, 0.8, -2.2] },
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [2.8, 0.8, -2.1] },
    ],
  });
