import { describe, expect, it } from "vitest";
import { CANON_ROOM_ORDER, ROOM_GRAPH } from "@/world/graph/roomGraph";

const bfsReachable = (from: string) => {
  const queue = [from];
  const visited = new Set<string>([from]);
  while (queue.length > 0) {
    const current = queue.shift()!;
    ROOM_GRAPH[current as keyof typeof ROOM_GRAPH].portals.forEach((portal) => {
      if (!visited.has(portal.to)) {
        visited.add(portal.to);
        queue.push(portal.to);
      }
    });
  }
  return visited;
};

describe("room graph", () => {
  it("ha 7 stanze canoniche", () => {
    expect(CANON_ROOM_ORDER).toHaveLength(7);
  });

  it("ogni stanza canonica ha almeno un portale", () => {
    CANON_ROOM_ORDER.forEach((roomId) => {
      expect(ROOM_GRAPH[roomId].portals.length).toBeGreaterThan(0);
    });
  });

  it("il grafo e connesso a partire dall'atrio", () => {
    const reachable = bfsReachable("home_atrium");
    CANON_ROOM_ORDER.forEach((roomId) => {
      expect(reachable.has(roomId)).toBe(true);
    });
  });
});

