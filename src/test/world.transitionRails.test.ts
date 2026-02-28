import { describe, expect, it } from "vitest";
import { ROOM_GRAPH } from "@/world/graph/roomGraph";
import { getTransitionRail } from "@/world/graph/transitionRails";

describe("world transition rails", () => {
  it("risolve un profilo valido per ogni spline del grafo", () => {
    Object.values(ROOM_GRAPH).forEach((room) => {
      room.portals.forEach((portal) => {
        const rail = getTransitionRail(portal.splineId);
        expect(rail.durationScale).toBeGreaterThan(0);
        expect(Number.isFinite(rail.fromBias)).toBe(true);
        expect(Number.isFinite(rail.toBias)).toBe(true);
        expect(Number.isFinite(rail.bank)).toBe(true);
      });
    });
  });
});

