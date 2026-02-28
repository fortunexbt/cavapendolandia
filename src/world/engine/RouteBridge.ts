import type { RoomId, RouteTarget } from "@/world/types";

export type RouteResolution = {
  roomId: RoomId | null;
  offeringId: string | null;
  known: boolean;
};

export const resolveRoomFromPath = (pathname: string): RouteResolution => {
  if (pathname === "/") return { roomId: "home_atrium", offeringId: null, known: true };
  if (pathname === "/che-cose") return { roomId: "manifesto_room", offeringId: null, known: true };
  if (pathname === "/regole") return { roomId: "regole_room", offeringId: null, known: true };
  if (pathname === "/rimozione") return { roomId: "rimozione_room", offeringId: null, known: true };
  if (pathname === "/entra") return { roomId: "archivio_room", offeringId: null, known: true };
  if (pathname === "/offri") return { roomId: "offri_room", offeringId: null, known: true };
  if (pathname.startsWith("/o/")) {
    const offeringId = pathname.slice(3).trim();
    if (offeringId.length > 0) {
      return { roomId: "offering_detail_room", offeringId, known: true };
    }
  }
  return { roomId: null, offeringId: null, known: false };
};

export const routeForRoom = (roomId: RoomId, offeringId?: string | null): RouteTarget => {
  switch (roomId) {
    case "home_atrium":
      return "/";
    case "manifesto_room":
      return "/che-cose";
    case "regole_room":
      return "/regole";
    case "rimozione_room":
      return "/rimozione";
    case "archivio_room":
      return "/entra";
    case "offri_room":
      return "/offri";
    case "offering_detail_room":
      return offeringId ? `/o/${offeringId}` : "/entra";
    default:
      return "/";
  }
};
