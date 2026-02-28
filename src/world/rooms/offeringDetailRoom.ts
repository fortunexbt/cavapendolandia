import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildOfferingDetailRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "offering_detail_room",
    center: new THREE.Vector3(22, 0, -24),
    paletteShift: 5,
    muralTexture: texture,
    artModelSource: ART_SOURCES.colorB,
    signatureScale: 1.06,
    theme: {
      shellColor: "#1f2f37",
      floorColor: "#27404b",
      glowA: "#e57f60",
      glowB: "#9ecde0",
      muralTint: "#e8eef3",
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
