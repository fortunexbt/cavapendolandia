import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildManifestoRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "manifesto_room",
    center: new THREE.Vector3(-22, 0, 0),
    paletteShift: 2,
    muralTexture: texture,
    artModelSource: ART_SOURCES.colorB,
    signatureScale: 1.08,
    theme: {
      shellColor: "#25364b",
      floorColor: "#2f3f54",
      glowA: "#f0bf6f",
      glowB: "#5fb9cf",
      muralTint: "#f4ebd8",
    },
    portalTargets: [
      { label: "Atrio", action: { type: "navigate", route: "/" }, offset: [-2.9, 0.8, -2.2] },
      { label: "Entra", action: { type: "navigate", route: "/entra" }, offset: [3.1, 0.8, -2.3] },
    ],
  });
