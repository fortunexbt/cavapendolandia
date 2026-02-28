import { describe, expect, it } from "vitest";
import { resolveRoomFromPath, routeForRoom } from "@/world/engine/RouteBridge";
import { CANON_ROOM_ORDER } from "@/world/graph/roomGraph";

describe("world route bridge", () => {
  it("mappa tutte le route canoniche verso una stanza valida", () => {
    const cases = [
      ["/", "home_atrium"],
      ["/che-cose", "manifesto_room"],
      ["/regole", "regole_room"],
      ["/rimozione", "rimozione_room"],
      ["/entra", "archivio_room"],
      ["/offri", "offri_room"],
    ] as const;

    for (const [path, expectedRoom] of cases) {
      const resolved = resolveRoomFromPath(path);
      expect(resolved.known).toBe(true);
      expect(resolved.roomId).toBe(expectedRoom);
      expect(resolved.offeringId).toBeNull();
    }
  });

  it("gestisce il dettaglio offerta /o/:id", () => {
    const resolved = resolveRoomFromPath("/o/abc-123");
    expect(resolved.known).toBe(true);
    expect(resolved.roomId).toBe("offering_detail_room");
    expect(resolved.offeringId).toBe("abc-123");
  });

  it("ritorna unknown su percorsi non validi", () => {
    const resolved = resolveRoomFromPath("/qualcosa-di-non-previsto");
    expect(resolved.known).toBe(false);
    expect(resolved.roomId).toBeNull();
  });

  it("genera route valide da ogni room id", () => {
    CANON_ROOM_ORDER.forEach((roomId) => {
      const route = routeForRoom(roomId, "test-id");
      expect(typeof route).toBe("string");
      expect(route.length).toBeGreaterThan(0);
    });
  });
});

