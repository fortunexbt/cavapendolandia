import * as THREE from "three";
import type { WorldHotspot } from "@/world/types";

export class InteractionRaycaster {
  private camera: THREE.PerspectiveCamera;

  private raycaster = new THREE.Raycaster();

  private hotspots: WorldHotspot[] = [];

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  setHotspots(hotspots: WorldHotspot[]) {
    this.hotspots = hotspots;
  }

  pick(pointerNdc: THREE.Vector2) {
    if (!this.hotspots.length) return null;
    this.raycaster.setFromCamera(pointerNdc, this.camera);
    const hit = this.raycaster.intersectObjects(
      this.hotspots.map((spot) => spot.mesh),
      false,
    )[0];
    if (!hit) return null;
    return this.hotspots.find((spot) => spot.mesh === hit.object) ?? null;
  }
}
