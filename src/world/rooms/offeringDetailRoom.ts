import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildOfferingDetailRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "offering_detail_room",
    center: new THREE.Vector3(22, 0, -24),
    paletteShift: 5,
    muralTexture: texture,
    theme: {
      shellColor: "#293b4a",
      floorColor: "#355063",
      glowA: "#d8b39a",
      glowB: "#a8c7d1",
      muralTint: "#ebf0ea",
    },
    portalTargets: [
      { label: "Archivio", action: { type: "navigate", route: "/entra" }, offset: [-3.1, 0.8, -2.4] },
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [3.1, 0.8, -2.4] },
    ],
    utilityHotspots: [
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [0, 0.8, -2.9] },
      { label: "Scheda", action: { type: "open_overlay", overlay: "offering_card" }, offset: [0, 1.3, -2.8] },
    ],
  });
