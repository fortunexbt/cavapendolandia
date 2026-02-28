import type { RoomId, RoomNode } from "@/world/types";

export const ROOM_GRAPH: Record<RoomId, RoomNode> = {
  home_atrium: {
    id: "home_atrium",
    route: "/",
    title: "Atrio",
    description: "Ingresso principale di Cavapendolandia.",
    portals: [
      { to: "manifesto_room", label: "Che cos'e", splineId: "atrium-manifesto" },
      { to: "archivio_room", label: "Entra", splineId: "atrium-archivio" },
      { to: "offri_room", label: "Offri", splineId: "atrium-offri" },
      { to: "regole_room", label: "Regole", splineId: "atrium-regole" },
      { to: "rimozione_room", label: "Rimozione", splineId: "atrium-rimozione" },
    ],
    ambience: {
      colorA: "#1f3040",
      colorB: "#edb86a",
      fogDensity: 0.028,
      audioStem: "atrium",
    },
    anchor: {
      camera: [0, 2.2, 9.8],
      lookAt: [0, 1.2, 0],
      roomCenter: [0, 0, 0],
    },
  },
  manifesto_room: {
    id: "manifesto_room",
    route: "/che-cose",
    title: "Manifesto",
    description: "Che cosa significa Cavapendoli per te?",
    portals: [
      { to: "home_atrium", label: "Atrio", splineId: "manifesto-atrium" },
      { to: "archivio_room", label: "Entra", splineId: "manifesto-archivio" },
    ],
    ambience: {
      colorA: "#273b4d",
      colorB: "#f3c170",
      fogDensity: 0.024,
      audioStem: "manifesto",
    },
    anchor: {
      camera: [-22, 2.1, 9.4],
      lookAt: [-22, 1.05, 0],
      roomCenter: [-22, 0, 0],
    },
  },
  regole_room: {
    id: "regole_room",
    route: "/regole",
    title: "Regole",
    description: "Patto del luogo.",
    portals: [
      { to: "home_atrium", label: "Atrio", splineId: "regole-atrium" },
      { to: "offri_room", label: "Offri", splineId: "regole-offri" },
    ],
    ambience: {
      colorA: "#283146",
      colorB: "#89a9d8",
      fogDensity: 0.033,
      audioStem: "regole",
    },
    anchor: {
      camera: [22, 2.1, 9.4],
      lookAt: [22, 1.05, 0],
      roomCenter: [22, 0, 0],
    },
  },
  rimozione_room: {
    id: "rimozione_room",
    route: "/rimozione",
    title: "Rimozione",
    description: "Cura del luogo.",
    portals: [
      { to: "home_atrium", label: "Atrio", splineId: "rimozione-atrium" },
      { to: "regole_room", label: "Regole", splineId: "rimozione-regole" },
    ],
    ambience: {
      colorA: "#2a2f3f",
      colorB: "#cf8b5f",
      fogDensity: 0.039,
      audioStem: "rimozione",
    },
    anchor: {
      camera: [38, 2.0, 9.2],
      lookAt: [38, 1.0, 0],
      roomCenter: [38, 0, 0],
    },
  },
  archivio_room: {
    id: "archivio_room",
    route: "/entra",
    title: "Archivio",
    description: "Esplora le offerte approvate.",
    portals: [
      { to: "home_atrium", label: "Atrio", splineId: "archivio-atrium" },
      { to: "offering_detail_room", label: "Dettaglio", splineId: "archivio-detail" },
    ],
    ambience: {
      colorA: "#2a5365",
      colorB: "#82dbe2",
      fogDensity: 0.022,
      audioStem: "archivio",
    },
    anchor: {
      camera: [0, 2.2, -14.2],
      lookAt: [0, 1.05, -24],
      roomCenter: [0, 0, -24],
    },
  },
  offri_room: {
    id: "offri_room",
    route: "/offri",
    title: "Offri",
    description: "Lascia una traccia nel luogo.",
    portals: [
      { to: "home_atrium", label: "Atrio", splineId: "offri-atrium" },
      { to: "archivio_room", label: "Archivio", splineId: "offri-archivio" },
    ],
    ambience: {
      colorA: "#2b2e36",
      colorB: "#f1be6f",
      fogDensity: 0.03,
      audioStem: "offri",
    },
    anchor: {
      camera: [-22, 2.2, -14.2],
      lookAt: [-22, 1.05, -24],
      roomCenter: [-22, 0, -24],
    },
  },
  offering_detail_room: {
    id: "offering_detail_room",
    route: "/o/:id",
    title: "Offerta",
    description: "Una singola offerta, in primo piano.",
    portals: [
      { to: "archivio_room", label: "Archivio", splineId: "detail-archivio" },
      { to: "home_atrium", label: "Atrio", splineId: "detail-atrium" },
    ],
    ambience: {
      colorA: "#1c2d34",
      colorB: "#e27e5f",
      fogDensity: 0.032,
      audioStem: "detail",
    },
    anchor: {
      camera: [22, 2.2, -14.2],
      lookAt: [22, 1.05, -24],
      roomCenter: [22, 0, -24],
    },
  },
};

export const CANON_ROOM_ORDER: RoomId[] = [
  "home_atrium",
  "manifesto_room",
  "regole_room",
  "rimozione_room",
  "archivio_room",
  "offri_room",
  "offering_detail_room",
];

export const getRoomNode = (roomId: RoomId) => ROOM_GRAPH[roomId];
