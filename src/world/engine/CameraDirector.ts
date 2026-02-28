import * as THREE from "three";
import { ROOM_GRAPH } from "@/world/graph/roomGraph";
import { getTransitionRail } from "@/world/graph/transitionRails";
import type { RoomId, WorldTransition } from "@/world/types";

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export type CameraDirectorState = {
  currentRoom: RoomId;
  transition: WorldTransition | null;
};

export class CameraDirector {
  private camera: THREE.PerspectiveCamera;

  private currentRoom: RoomId;

  private transition: {
    from: RoomId;
    to: RoomId;
    startAt: number;
    durationMs: number;
    bank: number;
    curve: THREE.CatmullRomCurve3;
    lookFrom: THREE.Vector3;
    lookTo: THREE.Vector3;
  } | null = null;

  private lookOffset = new THREE.Vector2(0, 0);

  constructor(camera: THREE.PerspectiveCamera, initialRoom: RoomId) {
    this.camera = camera;
    this.currentRoom = initialRoom;
    const anchor = ROOM_GRAPH[initialRoom].anchor;
    this.camera.position.set(...anchor.camera);
    this.camera.lookAt(...anchor.lookAt);
  }

  setLookOffset(x: number, y: number) {
    this.lookOffset.x = THREE.MathUtils.clamp(x, -0.5, 0.5);
    this.lookOffset.y = THREE.MathUtils.clamp(y, -0.35, 0.35);
  }

  travelTo(nextRoom: RoomId, durationMs?: number) {
    if (nextRoom === this.currentRoom) return null;
    const fromAnchor = ROOM_GRAPH[this.currentRoom].anchor;
    const toAnchor = ROOM_GRAPH[nextRoom].anchor;
    const splineId =
      ROOM_GRAPH[this.currentRoom].portals.find((portal) => portal.to === nextRoom)?.splineId ??
      ROOM_GRAPH[nextRoom].portals.find((portal) => portal.to === this.currentRoom)?.splineId ??
      null;
    const rail = getTransitionRail(splineId);
    const from = new THREE.Vector3(...fromAnchor.camera);
    const to = new THREE.Vector3(...toAnchor.camera);
    const distance = from.distanceTo(to);
    const dir = to.clone().sub(from).normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();

    const controlA = from
      .clone()
      .add(dir.clone().multiplyScalar(distance * rail.fromBias))
      .add(side.clone().multiplyScalar(rail.sideA))
      .add(new THREE.Vector3(0, rail.liftA, 0));

    const controlB = to
      .clone()
      .add(dir.clone().multiplyScalar(-distance * rail.toBias))
      .add(side.clone().multiplyScalar(rail.sideB))
      .add(new THREE.Vector3(0, rail.liftB, 0));

    const resolvedDuration =
      durationMs ??
      THREE.MathUtils.clamp(
        Math.round((620 + distance * 44) * rail.durationScale),
        760,
        1520,
      );

    this.transition = {
      from: this.currentRoom,
      to: nextRoom,
      startAt: performance.now(),
      durationMs: resolvedDuration,
      bank: rail.bank,
      curve: new THREE.CatmullRomCurve3([from, controlA, controlB, to]),
      lookFrom: new THREE.Vector3(...fromAnchor.lookAt),
      lookTo: new THREE.Vector3(...toAnchor.lookAt),
    };

    return {
      from: this.currentRoom,
      to: nextRoom,
      durationMs: resolvedDuration,
      easing: "easeInOutCubic" as const,
    };
  }

  setRoom(roomId: RoomId) {
    this.currentRoom = roomId;
    this.transition = null;
    this.camera.up.lerp(new THREE.Vector3(0, 1, 0), 0.35);
    const anchor = ROOM_GRAPH[roomId].anchor;
    this.camera.position.set(...anchor.camera);
    this.camera.lookAt(
      anchor.lookAt[0] + this.lookOffset.x,
      anchor.lookAt[1] + this.lookOffset.y,
      anchor.lookAt[2],
    );
  }

  update(now: number) {
    if (this.transition) {
      const elapsed = now - this.transition.startAt;
      const progress = THREE.MathUtils.clamp(elapsed / this.transition.durationMs, 0, 1);
      const eased = easeInOutCubic(progress);
      const pos = this.transition.curve.getPoint(eased);
      const look = this.transition.lookFrom.clone().lerp(this.transition.lookTo, eased);
      const bank = Math.sin(progress * Math.PI) * this.transition.bank;
      this.camera.up.set(Math.sin(bank), Math.cos(bank), 0).normalize();
      look.x += this.lookOffset.x * 0.45;
      look.y += this.lookOffset.y * 0.3;
      this.camera.position.copy(pos);
      this.camera.lookAt(look);
      if (progress >= 1) {
        this.currentRoom = this.transition.to;
        this.transition = null;
      }
      return;
    }

    const anchor = ROOM_GRAPH[this.currentRoom].anchor;
    const targetPos = new THREE.Vector3(...anchor.camera);
    this.camera.position.lerp(targetPos, 0.04);
    this.camera.up.lerp(new THREE.Vector3(0, 1, 0), 0.08);
    this.camera.lookAt(
      anchor.lookAt[0] + this.lookOffset.x * 0.55,
      anchor.lookAt[1] + this.lookOffset.y * 0.35,
      anchor.lookAt[2],
    );
  }

  getState(): CameraDirectorState {
    return {
      currentRoom: this.currentRoom,
      transition: this.transition
        ? {
            from: this.transition.from,
            to: this.transition.to,
            durationMs: this.transition.durationMs,
            easing: "easeInOutCubic",
          }
        : null,
    };
  }

  isTransitioning() {
    return !!this.transition;
  }
}
