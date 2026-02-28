import * as THREE from "three";
import { AudioDirector } from "@/world/engine/AudioDirector";
import { CameraDirector } from "@/world/engine/CameraDirector";
import { InputController } from "@/world/engine/InputController";
import { InteractionRaycaster } from "@/world/engine/InteractionRaycaster";
import { composeScene } from "@/world/engine/SceneComposer";
import { ROOM_GRAPH } from "@/world/graph/roomGraph";
import { createTextSprite } from "@/world/rooms/roomFactory";
import type {
  ArchivioArtifact,
  CompatibilityState,
  RoomId,
  WorldHotspot,
  WorldTransition,
  WorldRoomRuntime,
} from "@/world/types";

export type WorldRuntimeOptions = {
  container: HTMLElement;
  initialRoom: RoomId;
  audioEnabled: boolean;
  onHotspotAction: (hotspot: WorldHotspot) => void;
  onHotspotHover?: (hotspot: WorldHotspot | null) => void;
  onRoomSettled: (roomId: RoomId) => void;
};

const WEBGL2_ERROR_TEXT =
  "WebGL2 richiesto. Usa un browser/driver compatibile per esplorare la Cavapendolandia 3D.";

export class WorldRuntime {
  static checkCompatibility(): CompatibilityState {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return {
      webgl2: !!gl,
    };
  }

  private options: WorldRuntimeOptions;

  private composed: ReturnType<typeof composeScene> | null = null;

  private cameraDirector: CameraDirector | null = null;

  private input: InputController | null = null;

  private raycaster: InteractionRaycaster | null = null;

  private audio = new AudioDirector();

  private clock = new THREE.Clock();

  private frame = 0;

  private roomHotspots: WorldHotspot[] = [];

  private archivioHotspots: WorldHotspot[] = [];

  private detailPreview: THREE.Object3D | null = null;

  private activeRoom: RoomId;

  private settledRoom: RoomId;

  private hoveredHotspotId: string | null = null;

  private signatureRoots: THREE.Group[] = [];

  private artReliefRoots: THREE.Group[] = [];

  private seahorseRoots: THREE.Group[] = [];

  private colorA = new THREE.Color("#2b3f52");

  private colorB = new THREE.Color("#d5ac64");

  private tmpVec = new THREE.Vector3();

  private interactiveRoom: RoomId | null = null;

  private interactionsLocked = false;

  constructor(options: WorldRuntimeOptions) {
    this.options = options;
    this.activeRoom = options.initialRoom;
    this.settledRoom = options.initialRoom;
    const compat = WorldRuntime.checkCompatibility();
    if (!compat.webgl2) {
      throw new Error(WEBGL2_ERROR_TEXT);
    }

    this.composed = composeScene(options.container);
    this.cameraDirector = new CameraDirector(this.composed.camera, options.initialRoom);
    this.raycaster = new InteractionRaycaster(this.composed.camera);

    this.roomHotspots = Object.values(this.composed.rooms).flatMap((room) => room.hotspots);
    this.signatureRoots = Object.values(this.composed.rooms)
      .map((room) => room.group.children.find((child) => !!child.userData.signatureBody) as THREE.Group | undefined)
      .filter((item): item is THREE.Group => !!item);
    this.artReliefRoots = Object.values(this.composed.rooms)
      .map((room) => room.group.userData.artRelief as THREE.Group | undefined)
      .filter((item): item is THREE.Group => !!item);
    this.seahorseRoots = Object.values(this.composed.rooms)
      .map((room) => room.group.children.find((child) => !!child.userData.seahorseRoot) as THREE.Group | undefined)
      .filter((item): item is THREE.Group => !!item);

    this.input = new InputController({
      dom: this.composed.renderer.domElement,
      onLookOffset: (x, y) => {
        this.cameraDirector?.setLookOffset(x, y);
      },
      onPointerMoveNdc: (pointerNdc) => {
        const picked = this.raycaster?.pick(pointerNdc);
        this.setHoveredHotspot(picked?.id ?? null);
      },
      onPointerTap: (pointerNdc) => {
        void this.audio.resume();
        const picked = this.raycaster?.pick(pointerNdc);
        if (!picked) return;
        this.options.onHotspotAction(picked);
      },
      onPointerExit: () => {
        this.setHoveredHotspot(null);
      },
    });

    this.audio.setEnabled(options.audioEnabled);
    this.audio.init();
    this.audio.setRoomFocus(options.initialRoom, 1);
    this.applyRoomAmbience(options.initialRoom, 1);

    this.createArchivioArtifactAnchors();
    this.createDetailPreviewAnchor();
    this.setRoomVisibility(options.initialRoom, null);
    this.setInteractiveHotspotsForRoom(options.initialRoom);

    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  private createDetailPreviewAnchor() {
    if (!this.composed) return;
    const detailRoom = this.composed.rooms.offering_detail_room;
    const holder = new THREE.Group();
    holder.position.set(0.2, 1.4, -1.8);
    detailRoom.group.add(holder);
    this.detailPreview = holder;

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.02, 10, 100),
      new THREE.MeshBasicMaterial({
        color: "#9ed3df",
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    halo.rotation.x = Math.PI / 2;
    holder.add(halo);

    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.1, 0.45, 24),
      new THREE.MeshStandardMaterial({ color: "#1b2935", roughness: 0.58, metalness: 0.18 }),
    );
    plinth.position.y = -1.0;
    holder.add(plinth);
  }

  private createArchivioArtifactAnchors() {
    if (!this.composed) return;
    const archivioRoom = this.composed.rooms.archivio_room;
    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(0, 0.3, -0.8);
    archivioRoom.group.add(anchorGroup);

    const slots = 12;
    for (let i = 0; i < slots; i += 1) {
      const angle = (i / slots) * Math.PI * 2;
      const radius = 2.4 + (i % 3) * 0.38;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius * 0.55;

      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.28, 0),
        new THREE.MeshStandardMaterial({
          color: "#4bbfcb",
          roughness: 0.35,
          metalness: 0.26,
          emissive: new THREE.Color("#123141"),
          emissiveIntensity: 0.18,
          transparent: true,
          opacity: 0.74,
        }),
      );
      shell.position.set(x, 0.9 + Math.sin(i * 1.1) * 0.2, z);
      anchorGroup.add(shell);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.44, 12, 12),
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      );
      hit.position.copy(shell.position);
      anchorGroup.add(hit);

      const label = createTextSprite("vuoto", "#6ec7d2", "#f0d290");
      label.scale.set(1.22, 0.34, 1);
      label.position.set(x, shell.position.y + 0.7, z);
      anchorGroup.add(label);

      this.archivioHotspots.push({
        id: `archivio-artifact-${i}`,
        roomId: "archivio_room",
        label: "Vuoto",
        mesh: hit,
        action: { type: "open_overlay", overlay: "offering_card" },
        kind: "artifact",
      });

      (shell as THREE.Mesh).userData.labelSprite = label;
      (shell as THREE.Mesh).userData.slotIndex = i;
      (hit as THREE.Mesh).userData.shell = shell;
    }

    this.syncHotspots();
  }

  private syncHotspots() {
    if (this.interactionsLocked) return;
    const roomId = this.interactiveRoom ?? this.settledRoom;
    this.setInteractiveHotspotsForRoom(roomId);
  }

  private setInteractiveHotspotsForRoom(roomId: RoomId) {
    if (!this.raycaster) return;
    const roomScoped = this.roomHotspots.filter((hotspot) => hotspot.roomId === roomId);
    const archiveScoped =
      roomId === "archivio_room" ? this.archivioHotspots.filter((hotspot) => hotspot.mesh.visible) : [];
    this.raycaster.setHotspots([...roomScoped, ...archiveScoped]);
    this.interactiveRoom = roomId;
    this.interactionsLocked = false;
  }

  private lockInteractiveHotspots() {
    if (!this.raycaster) return;
    if (this.interactionsLocked) return;
    this.raycaster.setHotspots([]);
    this.interactiveRoom = null;
    this.interactionsLocked = true;
    this.setHoveredHotspot(null);
  }

  private setRoomVisibility(primaryRoom: RoomId, secondaryRoom: RoomId | null) {
    if (!this.composed) return;
    const rooms = this.composed.rooms;
    const visible = new Set<RoomId>([primaryRoom]);
    if (secondaryRoom) visible.add(secondaryRoom);
    (Object.keys(rooms) as RoomId[]).forEach((roomId) => {
      rooms[roomId].group.visible = visible.has(roomId);
    });
  }

  private setHoveredHotspot(hotspotId: string | null) {
    if (this.hoveredHotspotId === hotspotId) return;
    this.hoveredHotspotId = hotspotId;
    const hovered = hotspotId
      ? [...this.roomHotspots, ...this.archivioHotspots].find((item) => item.id === hotspotId) ?? null
      : null;
    this.options.onHotspotHover?.(hovered);
    const canvas = this.composed?.renderer.domElement;
    if (!canvas) return;
    canvas.style.cursor = hotspotId ? "pointer" : "default";
  }

  private applyRoomAmbience(roomId: RoomId, blend = 0.08) {
    if (!this.composed) return;
    const ambience = ROOM_GRAPH[roomId].ambience;
    const targetA = new THREE.Color(ambience.colorA);
    const targetB = new THREE.Color(ambience.colorB);
    this.colorA.lerp(targetA, blend);
    this.colorB.lerp(targetB, blend);
    this.composed.gradientUniforms.uColorA.value.copy(this.colorA);
    this.composed.gradientUniforms.uColorB.value.copy(this.colorB);
    const fog = this.composed.scene.fog as THREE.FogExp2 | null;
    if (fog) {
      fog.color.lerp(targetA, blend);
      fog.density = THREE.MathUtils.lerp(fog.density, ambience.fogDensity, blend);
    }
  }

  setArchivioArtifacts(items: ArchivioArtifact[]) {
    if (!this.archivioHotspots.length) return;
    this.archivioHotspots.forEach((hotspot, index) => {
      const artifact = items[index];
      const shell = (hotspot.mesh as THREE.Mesh).userData.shell as THREE.Mesh | undefined;
      const labelSprite = shell?.userData.labelSprite as THREE.Sprite | undefined;

      if (!artifact) {
        hotspot.action = { type: "open_overlay", overlay: "offering_card" };
        hotspot.label = "Vuoto";
        hotspot.mesh.visible = false;
        if (shell) shell.visible = false;
        if (labelSprite) labelSprite.visible = false;
        return;
      }

      hotspot.mesh.visible = true;
      hotspot.label = artifact.title;
      hotspot.action = { type: "focus_offering", offeringId: artifact.id };
      if (shell) {
        shell.visible = true;
        shell.userData.artifactId = artifact.id;
      }
      if (labelSprite) {
        labelSprite.visible = true;
        const refreshed = createTextSprite(
          artifact.title.slice(0, 24),
          "#53c0ca",
          "#f1bf6e",
        );
        refreshed.scale.copy(labelSprite.scale);
        refreshed.position.copy(labelSprite.position);
        labelSprite.parent?.add(refreshed);
        labelSprite.parent?.remove(labelSprite);
        const material = labelSprite.material as THREE.SpriteMaterial;
        material.map?.dispose();
        material.dispose();
        if (shell) {
          shell.userData.labelSprite = refreshed;
        }
      }
    });
  }

  setOfferingDetailPreview(title: string | null, mediaType: string | null) {
    if (!this.detailPreview) return;
    const previousText = this.detailPreview.getObjectByName("detail-label");
    if (previousText) {
      this.detailPreview.remove(previousText);
      const sprite = previousText as THREE.Sprite;
      const material = sprite.material as THREE.SpriteMaterial;
      material.map?.dispose();
      material.dispose();
    }

    const label = title && title.trim().length > 0 ? title : "Offerta";
    const suffix = mediaType ? ` (${mediaType})` : "";
    const sprite = createTextSprite(`${label.slice(0, 26)}${suffix}`, "#e4bf73", "#84bfd8");
    sprite.name = "detail-label";
    sprite.position.set(0, 0.05, 0);
    sprite.scale.set(1.7, 0.48, 1);
    this.detailPreview.add(sprite);
  }

  setAudioEnabled(enabled: boolean) {
    this.audio.setEnabled(enabled);
  }

  travelToRoom(roomId: RoomId, durationMs?: number): WorldTransition | null {
    if (!this.cameraDirector) return null;
    const transition = this.cameraDirector.travelTo(roomId, durationMs);
    if (transition) {
      this.activeRoom = roomId;
      this.setRoomVisibility(transition.from, transition.to);
      this.lockInteractiveHotspots();
      this.audio.setRoomFocus(roomId, 1);
    }
    return transition;
  }

  setRoomImmediately(roomId: RoomId) {
    if (!this.cameraDirector) return;
    this.activeRoom = roomId;
    this.settledRoom = roomId;
    this.cameraDirector.setRoom(roomId);
    this.setRoomVisibility(roomId, null);
    this.setInteractiveHotspotsForRoom(roomId);
    this.audio.setRoomFocus(roomId, 1);
    this.applyRoomAmbience(roomId, 1);
  }

  private animate() {
    this.frame = window.requestAnimationFrame(this.animate);
    if (!this.composed || !this.cameraDirector) return;

    const elapsed = this.clock.getElapsedTime();
    this.composed.gradientUniforms.uTime.value = elapsed;

    this.cameraDirector.update(performance.now());
    const cameraState = this.cameraDirector.getState();
    if (cameraState.transition) {
      this.setRoomVisibility(cameraState.transition.from, cameraState.transition.to);
      this.lockInteractiveHotspots();
    } else {
      this.setRoomVisibility(cameraState.currentRoom, null);
      if (this.interactiveRoom !== cameraState.currentRoom || this.interactionsLocked) {
        this.setInteractiveHotspotsForRoom(cameraState.currentRoom);
      }
    }

    const ambienceRoom = cameraState.transition?.to ?? this.activeRoom;
    this.applyRoomAmbience(ambienceRoom, this.cameraDirector.isTransitioning() ? 0.05 : 0.09);
    if (!this.cameraDirector.isTransitioning() && cameraState.currentRoom !== this.settledRoom) {
      this.settledRoom = cameraState.currentRoom;
      this.options.onRoomSettled(this.settledRoom);
      this.audio.setRoomFocus(this.settledRoom, 1);
    }

    const hotspotMeshes = [...this.roomHotspots, ...this.archivioHotspots];
    hotspotMeshes.forEach((hotspot, index) => {
      const shell = (hotspot.mesh as THREE.Mesh).userData.shell as THREE.Mesh | undefined;
      const portalMesh = (hotspot.mesh as THREE.Mesh).userData.portalMesh as THREE.Mesh | undefined;
      const portalCore = (hotspot.mesh as THREE.Mesh).userData.portalCore as THREE.Mesh | undefined;
      const portalLabel = (hotspot.mesh as THREE.Mesh).userData.portalLabel as THREE.Sprite | undefined;
      const portalBeam = (hotspot.mesh as THREE.Mesh).userData.portalBeam as THREE.Mesh | undefined;
      const portalGlyph = (hotspot.mesh as THREE.Mesh).userData.portalGlyph as THREE.Group | undefined;
      const hovered = hotspot.id === this.hoveredHotspotId;
      if (shell) {
        shell.rotation.x += 0.0045 + (index % 3) * 0.0011;
        shell.rotation.y += 0.006 + (index % 4) * 0.001;
        shell.scale.setScalar(hovered ? 1.14 : 1);
      }
      if (portalMesh) {
        portalMesh.rotation.z += 0.009 + (index % 5) * 0.001;
        portalMesh.scale.setScalar(hovered ? 1.18 : 1);
        const material = portalMesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = hovered ? 0.64 : 0.22;
      }
      if (portalCore) {
        const pulse = 1 + Math.sin(elapsed * 2.6 + index * 0.8) * 0.08;
        portalCore.scale.setScalar(hovered ? pulse * 1.36 : pulse);
        const material = portalCore.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = hovered ? 1.0 : 0.45;
      }
      if (portalBeam) {
        const beamPulse = 0.6 + Math.sin(elapsed * 1.7 + index * 0.7) * 0.22;
        portalBeam.scale.set(hovered ? 1.2 : 1, hovered ? 1.18 : 1, hovered ? 1.2 : 1);
        portalBeam.position.y = (hotspot.mesh.position.y ?? 0) + 0.74 + beamPulse * 0.1;
        const material = portalBeam.material as THREE.MeshBasicMaterial;
        material.opacity = hovered ? 0.3 : 0.14 + beamPulse * 0.04;
      }
      if (portalGlyph) {
        portalGlyph.rotation.y += hovered ? 0.04 : 0.016;
        portalGlyph.rotation.x = Math.sin(elapsed * 0.45 + index) * 0.08;
        portalGlyph.children.forEach((child, glyphIndex) => {
          const phase = Number(child.userData.phase || 0);
          const offsetY = Number(child.userData.offsetY || 0.05);
          child.position.y = offsetY + Math.sin(elapsed * 2.5 + phase + glyphIndex * 0.3) * 0.04;
        });
      }
      if (portalLabel && this.composed) {
        portalLabel.getWorldPosition(this.tmpVec);
        const distance = this.composed.camera.position.distanceTo(this.tmpVec);
        const material = portalLabel.material as THREE.SpriteMaterial;
        material.opacity = THREE.MathUtils.clamp((distance - 1.4) / 2.4, 0, 0.92);
      }
    });

    this.signatureRoots.forEach((root, index) => {
      const body = root.userData.signatureBody as THREE.Group | undefined;
      const seed = Number(root.userData.seed || 1);
      const floorRing = root.userData.floorRing as THREE.Mesh | undefined;
      const overheadHalo = root.userData.overheadHalo as THREE.Mesh | undefined;
      root.rotation.y += 0.0026 + (index % 4) * 0.0005;
      root.position.y = -0.2 + Math.sin(elapsed * (0.9 + index * 0.04) + seed) * 0.08;
      if (floorRing) {
        floorRing.rotation.z += 0.0028 + (index % 3) * 0.0005;
        const mat = floorRing.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.22 + Math.sin(elapsed * 1.4 + seed) * 0.08;
      }
      if (overheadHalo) {
        overheadHalo.rotation.z -= 0.0017 + (index % 2) * 0.0004;
        const mat = overheadHalo.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.24 + Math.sin(elapsed * 1.15 + seed * 0.6) * 0.06;
      }
      if (!body) return;
      const orbs = body.userData.orbs as THREE.Group | undefined;
      body.rotation.z = Math.sin(elapsed * 0.6 + seed) * 0.06;
      body.rotation.x = Math.sin(elapsed * 0.5 + seed * 0.4) * 0.04;
      if (orbs) {
        orbs.rotation.y += 0.01 + (index % 4) * 0.0008;
        orbs.children.forEach((child, orbIndex) => {
          child.position.y += Math.sin(elapsed * 1.6 + orbIndex * 0.5) * 0.0014;
        });
      }
    });

    this.artReliefRoots.forEach((relief, index) => {
      if (!relief.visible) return;
      const seed = Number(relief.userData.seed ?? index + 1);
      const basePosition = relief.userData.basePosition as THREE.Vector3 | undefined;
      const baseRotation = relief.userData.baseRotation as THREE.Euler | undefined;
      const baseScale = Number(relief.userData.baseScale ?? 1);
      const y = basePosition?.y ?? relief.position.y;
      const rotX = baseRotation?.x ?? relief.rotation.x;
      const rotY = baseRotation?.y ?? relief.rotation.y;
      relief.position.y = y + Math.sin(elapsed * 0.62 + seed) * 0.06;
      relief.rotation.x = rotX + Math.sin(elapsed * 0.37 + seed * 0.6) * 0.035;
      relief.rotation.y = rotY + Math.sin(elapsed * 0.28 + seed * 0.4) * 0.08;
      const scalar = baseScale + Math.sin(elapsed * 0.95 + seed) * 0.015;
      relief.scale.setScalar(scalar);

      const halo = relief.userData.halo as THREE.Mesh | undefined;
      if (halo) {
        const material = halo.material as THREE.MeshBasicMaterial;
        material.opacity = 0.08 + Math.sin(elapsed * 1.2 + seed * 0.7) * 0.035;
      }

      const instanced = relief.userData.instanced as THREE.InstancedMesh | undefined;
      if (instanced) {
        const material = instanced.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.12 + Math.sin(elapsed * 1.05 + seed * 0.55) * 0.05;
      }
    });

    this.seahorseRoots.forEach((seahorse, index) => {
      if (!seahorse.visible) return;
      const basePosition = seahorse.userData.basePosition as THREE.Vector3 | undefined;
      const baseY = basePosition?.y ?? seahorse.position.y;
      const baseRotationY = Number(seahorse.userData.baseRotationY ?? seahorse.rotation.y);
      const seed = Number(seahorse.userData.seed ?? index + 1);
      seahorse.position.y = baseY + Math.sin(elapsed * 0.9 + seed) * 0.12;
      seahorse.rotation.y = baseRotationY + Math.sin(elapsed * 0.45 + seed) * 0.16;
      seahorse.rotation.z = Math.sin(elapsed * 0.7 + seed * 0.6) * 0.05;

      const orbs = seahorse.userData.orbs as THREE.Group | undefined;
      if (!orbs) return;
      orbs.rotation.y += 0.012;
      orbs.children.forEach((orb, orbIndex) => {
        const phase = Number(orb.userData.phase || 0);
        orb.position.y = 0.42 + Math.sin(elapsed * 1.9 + phase + orbIndex * 0.3) * 0.34;
      });
    });

    if (this.composed) {
      (Object.values(this.composed.rooms) as WorldRoomRuntime[]).forEach((room, roomIndex) => {
        if (!room.group.visible) return;
        const particles = room.group.userData.ambienceParticles as THREE.Group | undefined;
        if (!particles) return;
        particles.rotation.y += 0.0008 + (roomIndex % 3) * 0.00025;
        particles.children.forEach((particle, particleIndex) => {
          const amp = Number(particle.userData.amp || 0.05);
          const phase = Number(particle.userData.phase || 0);
          const speed = Number(particle.userData.speed || 1);
          const bx = Number(particle.userData.baseX || 0);
          const by = Number(particle.userData.baseY || 0);
          const bz = Number(particle.userData.baseZ || 0);
          particle.position.x = bx + Math.sin(elapsed * speed + phase) * amp;
          particle.position.y = by + Math.cos(elapsed * (speed * 0.7) + phase) * amp * 0.9;
          particle.position.z = bz + Math.sin(elapsed * (speed * 0.55) + phase + particleIndex * 0.2) * amp * 0.8;
        });
      });
    }

    this.composed.renderer.render(this.composed.scene, this.composed.camera);
  }

  private onResize() {
    if (!this.composed) return;
    const { container } = this.options;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    this.composed.camera.aspect = width / height;
    this.composed.camera.updateProjectionMatrix();
    this.composed.renderer.setSize(width, height);
  }

  dispose() {
    window.cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.onResize);
    this.input?.dispose();
    this.audio.dispose();
    this.setHoveredHotspot(null);
    this.composed?.dispose();
  }
}
