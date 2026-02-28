import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildArchivioRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "archivio_room",
    center: new THREE.Vector3(0, 0, -24),
    paletteShift: 1,
    muralTexture: texture,
    artModelSource: ART_SOURCES.colorB,
    signatureScale: 1.24,
    theme: {
      shellColor: "#244b5f",
      floorColor: "#2e6077",
      glowA: "#53c2cc",
      glowB: "#f3ce75",
      muralTint: "#d2ebf2",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-3.1, 0.8, -2.2] },
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [3.1, 0.8, -2.2] },
    ],
    utilityHotspots: [
      { label: "Dettaglio", action: { type: "open_overlay", overlay: "offering_card" }, offset: [0, 0.9, -2.9] },
    ],
  });
