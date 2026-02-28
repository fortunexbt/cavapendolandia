import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildRegoleRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "regole_room",
    center: new THREE.Vector3(22, 0, 0),
    paletteShift: 4,
    muralTexture: texture,
    theme: {
      shellColor: "#283a4b",
      floorColor: "#33495c",
      glowA: "#a9c2cf",
      glowB: "#e0bf95",
      muralTint: "#e9efe8",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [0, 0.8, -2.6] },
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [-3.2, 0.8, -1.8] },
      { label: "Rimozione", action: { type: "navigate", route: "/rimozione" }, offset: [3.2, 0.8, -1.8] },
    ],
  });
