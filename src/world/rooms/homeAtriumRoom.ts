import * as THREE from "three";
import { ART_SOURCES } from "@/world/rooms/artSources";
import { buildRoom } from "@/world/rooms/roomFactory";

export const buildHomeAtriumRoom = (texture?: THREE.Texture | null) =>
  buildRoom({
    id: "home_atrium",
    center: new THREE.Vector3(0, 0, 0),
    paletteShift: 0,
    muralTexture: texture,
    artModelSource: ART_SOURCES.colorA,
    signatureScale: 1.18,
    theme: {
      shellColor: "#142035",
      floorColor: "#19354a",
      glowA: "#5cc7d1",
      glowB: "#f0be6f",
      muralTint: "#dce9f5",
    },
    portalTargets: [
      { label: "Che cos'e", action: { type: "navigate", route: "/che-cose" }, offset: [-3.2, 0.8, -2.1] },
      { label: "Entra", action: { type: "navigate", route: "/entra" }, offset: [0, 0.8, -2.8] },
      { label: "Offri", action: { type: "navigate", route: "/offri" }, offset: [3.2, 0.8, -2.1] },
      { label: "Regole", action: { type: "navigate", route: "/regole" }, offset: [4.2, 0.8, 1.2] },
      { label: "Rimozione", action: { type: "navigate", route: "/rimozione" }, offset: [-4.2, 0.8, 1.2] },
    ],
    utilityHotspots: [
      { label: "Guida", action: { type: "open_overlay", overlay: "intro_help" }, offset: [0, 1.2, 2.8] },
    ],
  });
