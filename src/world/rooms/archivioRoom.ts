import * as THREE from "three";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildArchivioRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "archivio_room",
    center: new THREE.Vector3(0, 0, -24),
    paletteShift: 1,
    muralTexture: texture,
    theme: {
      shellColor: "#264052",
      floorColor: "#335066",
      glowA: "#98c8d2",
      glowB: "#e0c298",
      muralTint: "#e7f1eb",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-3.1, 0.8, -2.2] },
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [3.1, 0.8, -2.2] },
    ],
    utilityHotspots: [
      { label: "Dettaglio", action: { type: "open_overlay", overlay: "offering_card" }, offset: [0, 0.9, -2.9] },
    ],
  });
