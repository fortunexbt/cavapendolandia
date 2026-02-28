import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { CameraDirector } from "@/world/engine/CameraDirector";

describe("camera director", () => {
  it("non genera transizione se la room e la stessa", () => {
    const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 120);
    const director = new CameraDirector(camera, "home_atrium");
    const transition = director.travelTo("home_atrium");
    expect(transition).toBeNull();
  });

  it("genera transizione valida verso altra room", () => {
    const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 120);
    const director = new CameraDirector(camera, "home_atrium");
    const transition = director.travelTo("manifesto_room", 900);
    expect(transition).not.toBeNull();
    expect(transition?.from).toBe("home_atrium");
    expect(transition?.to).toBe("manifesto_room");
    expect(transition?.durationMs).toBe(900);
  });
});

