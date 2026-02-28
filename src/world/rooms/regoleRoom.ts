import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildRegoleRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "regole_room",
    center: new THREE.Vector3(22, 0, 0),
    paletteShift: 4,
    muralTexture: texture,
    artModelSource: ART_SOURCES.bw,
    signatureScale: 1.02,
    theme: {
      shellColor: "#1e2b45",
      floorColor: "#232f4c",
      glowA: "#87a8dc",
      glowB: "#f1bf6f",
      muralTint: "#d6e3f4",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [0, 0.8, -2.6] },
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [-3.2, 0.8, -1.8] },
      { label: "Rimozione", action: { type: "navigate", route: "/rimozione" }, offset: [3.2, 0.8, -1.8] },
    ],
  });
