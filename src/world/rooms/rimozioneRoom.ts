import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildRimozioneRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "rimozione_room",
    center: new THREE.Vector3(38, 0, 0),
    paletteShift: 6,
    muralTexture: texture,
    artModelSource: ART_SOURCES.bw,
    signatureScale: 0.96,
    theme: {
      shellColor: "#2a273f",
      floorColor: "#332f45",
      glowA: "#d68d66",
      glowB: "#8ea7d1",
      muralTint: "#efe4d6",
    },
    portalTargets: [
      { label: "Regole", action: { type: "navigate", route: "/regole" }, offset: [-2.8, 0.8, -2.2] },
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [2.8, 0.8, -2.1] },
    ],
  });
