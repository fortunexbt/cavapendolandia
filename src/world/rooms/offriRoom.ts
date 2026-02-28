import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildOffriRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "offri_room",
    center: new THREE.Vector3(-22, 0, -24),
    paletteShift: 3,
    muralTexture: texture,
    artModelSource: ART_SOURCES.colorA,
    signatureScale: 1.12,
    theme: {
      shellColor: "#2d2c38",
      floorColor: "#3a3242",
      glowA: "#f0c26f",
      glowB: "#55bfca",
      muralTint: "#efe0c8",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-3, 0.8, -2.2] },
      { label: "Archivio", action: { type: "navigate", route: "/entra" }, offset: [2.9, 0.8, -2.4] },
    ],
    utilityHotspots: [
      { label: "Apri modulo", action: { type: "open_overlay", overlay: "offri_form" }, offset: [0, 1.1, -3] },
    ],
  });
