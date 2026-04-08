import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type TouchEvent,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  getNextAutoRenderProfile,
  type DeviceClass,
  type QualityTier,
  type RenderProfile,
  type ViewportMetrics,
  type WorldZone,
} from "@/components/cavapendo-gallery/runtime";
import {
  DEPOSIT_SITES,
  EYE_HEIGHT,
  GALLERY_DOORS,
  GALLERY_SPAWN,
  GALLERY_SPEED,
  GRAVITY,
  JUMP_VELOCITY,
  MAX_PITCH,
  MEADOW_GRAVITY,
  MEADOW_JUMP_VELOCITY,
  MEADOW_SPEED,
  UP_VECTOR,
} from "@/components/cavapendo-gallery/config";
import {
  type DepositSite,
  type DoorTrigger,
  type InteractionTarget,
  type JoystickInput,
  type MeadowDebugPose,
  type MeadowCreatureRuntimeSnapshot,
  type WorldStateSnapshot,
} from "@/components/cavapendo-gallery/types";
import {
  getPlanarFromMeadowNormal,
  getPlanarFromWorldPosition,
  getMeadowTerrainLift,
  MEADOW_CREATURES,
  MEADOW_PLAYER_COLLIDER_RADIUS,
  MEADOW_DOORS,
  MEADOW_LANDMARKS,
  MEADOW_PLANET_CENTER,
  MEADOW_PLANET_RADIUS,
  MEADOW_SPAWN,
  MEADOW_STAND_HEIGHT,
  getMeadowReferenceForward,
  getMeadowSkylineLandmarksForQuality,
  getMeadowSectorForWorldPosition,
  projectPlanarPointToMeadowNormal,
  projectPlanarPointToMeadowRadialNormal,
  projectPlanarPointToMeadowSurface,
  resolvePlanarMeadowCollisions,
  type MeadowSector,
} from "@/lib/meadowWorld";

function shapeJoystickAxis(value: number, deadZone: number, exponent: number) {
  const sign = Math.sign(value);
  const absolute = Math.abs(value);
  if (absolute <= deadZone) return 0;
  const normalized = (absolute - deadZone) / (1 - deadZone);
  return sign * Math.pow(normalized, exponent);
}

export function VirtualJoystick({
  label,
  hint,
  onInput,
  deadZone,
  curveExponent,
  radius,
  className,
  style,
}: {
  label: string;
  hint: string;
  onInput: (x: number, y: number) => void;
  deadZone: number;
  curveExponent: number;
  radius: number;
  className?: string;
  style?: CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const [stickPosition, setStickPosition] = useState({ x: 0, y: 0 });

  const handleStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = event.changedTouches[0];
    touchIdRef.current = touch.identifier;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const handleMove = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      for (let index = 0; index < event.changedTouches.length; index += 1) {
        const touch = event.changedTouches[index];
        if (touch.identifier !== touchIdRef.current) continue;

        const dx = touch.clientX - centerRef.current.x;
        const dy = touch.clientY - centerRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(distance, radius);
        const angle = Math.atan2(dy, dx);
        const x = (Math.cos(angle) * clamped) / radius;
        const y = (Math.sin(angle) * clamped) / radius;

        setStickPosition({ x: x * radius * 0.65, y: y * radius * 0.65 });
        onInput(
          shapeJoystickAxis(x, deadZone, curveExponent),
          shapeJoystickAxis(y, deadZone, curveExponent),
        );
      }
    },
    [curveExponent, deadZone, onInput, radius],
  );

  const handleEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      for (let index = 0; index < event.changedTouches.length; index += 1) {
        const touch = event.changedTouches[index];
        if (touch.identifier !== touchIdRef.current) continue;
        touchIdRef.current = null;
        setStickPosition({ x: 0, y: 0 });
        onInput(0, 0);
      }
    },
    [onInput],
  );

  return (
    <div
      ref={containerRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      className={`absolute pointer-events-auto touch-none ${className || ""}`}
      style={{ width: radius * 2 + 18, height: radius * 2 + 18, ...style }}
    >
      <div className="absolute inset-0 rounded-full border border-white/10 bg-[#17110f]/76 shadow-[0_16px_42px_rgba(0,0,0,0.3)] backdrop-blur-xl" />
      <div className="absolute inset-[10px] rounded-full border border-white/10" />
      <div
        className="absolute rounded-full bg-foreground/35"
        style={{
          width: Math.max(28, radius * 0.72),
          height: Math.max(28, radius * 0.72),
          left: "50%",
          top: "50%",
          transform: `translate(calc(-50% + ${stickPosition.x}px), calc(-50% + ${stickPosition.y}px))`,
          transition:
            touchIdRef.current === null ? "transform 0.15s ease-out" : "none",
        }}
      />
      <div className="absolute -top-7 left-0 right-0 text-center">
        <div className="text-[10px] font-mono-light text-[#f7eee3]">
          {label}
        </div>
        <div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#d8c7b7]">
          {hint}
        </div>
      </div>
    </div>
  );
}

export function WorldController({
  zone,
  modalOpen,
  isMobile,
  mouseLookSensitivity,
  touchLookSensitivity,
  invertLookFactor,
  reducedCameraMotion,
  qualityTier,
  landmarkDrawDistance,
  viewport,
  fullscreen,
  keysDownRef,
  interactRequestedRef,
  joystickRef,
  jumpRequestedRef,
  onDoorTrigger,
  onInteraction,
  onActivity,
  onTriggerProximityChange,
  onDepositProximityChange,
  onCreatureProximityChange,
  onSectorChange,
  onVisibleLandmarksChange,
  onHorizonLandmarksChange,
  registerStep,
  debugPoseRef,
  creatureRuntimeRef,
  snapshotRef,
}: {
  zone: WorldZone;
  modalOpen: boolean;
  isMobile: boolean;
  mouseLookSensitivity: number;
  touchLookSensitivity: number;
  invertLookFactor: 1 | -1;
  reducedCameraMotion: boolean;
  qualityTier: QualityTier;
  landmarkDrawDistance: number;
  viewport: ViewportMetrics;
  fullscreen: boolean;
  keysDownRef: MutableRefObject<Set<string>>;
  interactRequestedRef: MutableRefObject<boolean>;
  joystickRef: MutableRefObject<JoystickInput>;
  jumpRequestedRef: MutableRefObject<boolean>;
  onDoorTrigger: (id: DoorTrigger["id"]) => void;
  onInteraction: (target: InteractionTarget) => void;
  onActivity: () => void;
  onTriggerProximityChange: (id: DoorTrigger["id"] | null) => void;
  onDepositProximityChange: (id: DepositSite["id"] | null) => void;
  onCreatureProximityChange: (ids: string[]) => void;
  onSectorChange: (sector: MeadowSector | null) => void;
  onVisibleLandmarksChange: (ids: string[]) => void;
  onHorizonLandmarksChange: (ids: string[]) => void;
  registerStep: (step: (deltaSeconds: number) => void) => void;
  debugPoseRef: MutableRefObject<((pose: MeadowDebugPose) => void) | null>;
  creatureRuntimeRef: MutableRefObject<Record<string, MeadowCreatureRuntimeSnapshot>>;
  snapshotRef: MutableRefObject<WorldStateSnapshot>;
}) {
  const { camera, gl, raycaster, scene } = useThree();
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const velocityYRef = useRef(0);
  const groundedRef = useRef(true);
  const isLockedRef = useRef(false);
  const nearbyDoorRef = useRef<DoorTrigger["id"] | null>(null);
  const nearbyDepositRef = useRef<DepositSite["id"] | null>(null);
  const nearbyCreatureKeyRef = useRef("");
  const visibleLandmarkKeyRef = useRef("");
  const horizonLandmarkKeyRef = useRef("");
  const sectorRef = useRef<MeadowSector | null>(null);
  const initializedRef = useRef(false);
  const skylineLandmarks = useMemo(
    () => getMeadowSkylineLandmarksForQuality(qualityTier),
    [qualityTier],
  );
  const autoDoorRef = useRef<{
    zone: WorldZone;
    id: DoorTrigger["id"] | null;
  }>({
    zone,
    id: null,
  });
  const frameForward = useRef(new THREE.Vector3());
  const frameRight = useRef(new THREE.Vector3());
  const surfaceUp = useRef(new THREE.Vector3());
  const surfaceFoot = useRef(new THREE.Vector3());
  const lookDirection = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const tangentReference = useRef(new THREE.Vector3());
  const movementDirection = useRef(new THREE.Vector3());
  const movementGuardUntilRef = useRef(0);
  const transitionRef = useRef<{
    zone: WorldZone;
    fromPosition: THREE.Vector3;
    toPosition: THREE.Vector3;
    fromYaw: number;
    toYaw: number;
    fromPitch: number;
    toPitch: number;
    duration: number;
    elapsed: number;
  } | null>(null);

  const resetTransientInputs = useCallback(() => {
    keysDownRef.current.clear();
    interactRequestedRef.current = false;
    jumpRequestedRef.current = false;
    joystickRef.current = {
      moveX: 0,
      moveZ: 0,
      lookX: 0,
      lookY: 0,
    };
  }, [interactRequestedRef, joystickRef, jumpRequestedRef, keysDownRef]);

  const applyOrientation = useCallback(
    (activeZone: WorldZone) => {
      if (activeZone === "gallery") {
        const rotation = new THREE.Euler(
          pitchRef.current,
          yawRef.current,
          0,
          "YXZ",
        );
        camera.quaternion.setFromEuler(rotation);
        camera.up.copy(UP_VECTOR);
        lookDirection.current
          .set(0, 0, -1)
          .applyQuaternion(camera.quaternion)
          .normalize();
        return;
      }

      surfaceUp.current
        .copy(camera.position)
        .sub(MEADOW_PLANET_CENTER)
        .normalize();
      tangentReference.current.copy(
        getMeadowReferenceForward(surfaceUp.current),
      );
      frameForward.current
        .copy(tangentReference.current)
        .applyAxisAngle(surfaceUp.current, yawRef.current)
        .normalize();
      frameRight.current
        .crossVectors(frameForward.current, surfaceUp.current)
        .normalize();
      lookDirection.current
        .copy(frameForward.current)
        .applyAxisAngle(frameRight.current, pitchRef.current)
        .normalize();
      camera.up.copy(surfaceUp.current);
      lookTarget.current.copy(camera.position).add(lookDirection.current);
      camera.lookAt(lookTarget.current);
    },
    [camera],
  );

  const applyPose = useCallback(
    (nextZone: WorldZone) => {
      const pose = nextZone === "gallery" ? GALLERY_SPAWN : MEADOW_SPAWN;
      velocityYRef.current = 0;
      groundedRef.current = true;
      const targetPosition = pose.position.clone();

      if (!initializedRef.current) {
        camera.position.copy(targetPosition);
        yawRef.current = pose.yaw;
        pitchRef.current = pose.pitch;
        transitionRef.current = null;
        applyOrientation(nextZone);
        return;
      }

      const startPosition = targetPosition.clone();
      if (nextZone === "meadow") {
        const normal = targetPosition
          .clone()
          .sub(MEADOW_PLANET_CENTER)
          .normalize();
        const forward = getMeadowReferenceForward(normal)
          .applyAxisAngle(normal, pose.yaw)
          .normalize();
        startPosition.addScaledVector(normal, 0.74);
        startPosition.addScaledVector(forward, 1.32);
        yawRef.current = pose.yaw + 0.46;
        pitchRef.current = pose.pitch + 0.18;
      } else {
        startPosition.y += 0.24;
        startPosition.z += 0.42;
        yawRef.current = pose.yaw - 0.22;
        pitchRef.current = pose.pitch + 0.08;
      }

      camera.position.copy(startPosition);
      transitionRef.current = {
        zone: nextZone,
        fromPosition: startPosition.clone(),
        toPosition: targetPosition.clone(),
        fromYaw: yawRef.current,
        toYaw: pose.yaw,
        fromPitch: pitchRef.current,
        toPitch: pose.pitch,
        duration: reducedCameraMotion
          ? 0.5
          : nextZone === "meadow"
            ? 1.45
            : 0.85,
        elapsed: 0,
      };
      applyOrientation(nextZone);
    },
    [applyOrientation, camera, reducedCameraMotion],
  );

  useEffect(() => {
    applyPose(zone);
    nearbyDoorRef.current = null;
    nearbyDepositRef.current = null;
    nearbyCreatureKeyRef.current = "";
    visibleLandmarkKeyRef.current = "";
    horizonLandmarkKeyRef.current = "";
    sectorRef.current = zone === "meadow" ? "return_court" : null;
    onTriggerProximityChange(null);
    onDepositProximityChange(null);
    onCreatureProximityChange([]);
    onVisibleLandmarksChange([]);
    onHorizonLandmarksChange([]);
    onSectorChange(zone === "meadow" ? "return_court" : null);
    if (initializedRef.current) {
      resetTransientInputs();
    } else {
      initializedRef.current = true;
    }
  }, [
    applyPose,
    onCreatureProximityChange,
    onDepositProximityChange,
    onHorizonLandmarksChange,
    onSectorChange,
    onTriggerProximityChange,
    onVisibleLandmarksChange,
    resetTransientInputs,
    zone,
  ]);

  const resolveInteractionTarget = useCallback(() => {
    raycaster.setFromCamera({ x: 0, y: 0 } as THREE.Vector2, camera);
    const intersections = raycaster.intersectObjects(scene.children, true);

    for (const intersection of intersections) {
      let object: THREE.Object3D | null = intersection.object;
      while (object) {
        const maybeTarget = object.userData.interaction as
          | InteractionTarget
          | undefined;
        if (maybeTarget) return maybeTarget;
        object = object.parent;
      }
    }

    return null;
  }, [camera, raycaster, scene]);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    const handleLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvas;
      if (!isLockedRef.current) {
        movementGuardUntilRef.current = performance.now() + 180;
      }
    };

    const handlePointerLockError = () => {
      isLockedRef.current = false;
      resetTransientInputs();
    };

    const handleCanvasClick = () => {
      if (modalOpen) return;
      canvas.requestPointerLock();
      onActivity();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isLockedRef.current) return;
      if (performance.now() < movementGuardUntilRef.current) return;
      if (Math.abs(event.movementX) > 0.2 || Math.abs(event.movementY) > 0.2) {
        transitionRef.current = null;
      }
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      const clampedMovementX = THREE.MathUtils.clamp(
        event.movementX,
        -width * 0.22,
        width * 0.22,
      );
      const clampedMovementY = THREE.MathUtils.clamp(
        event.movementY,
        -height * 0.22,
        height * 0.22,
      );
      yawRef.current -=
        (clampedMovementX / width) * Math.PI * mouseLookSensitivity * 3.8;
      pitchRef.current -=
        (clampedMovementY / height) *
        Math.PI *
        mouseLookSensitivity *
        3.1 *
        invertLookFactor;
      pitchRef.current = THREE.MathUtils.clamp(
        pitchRef.current,
        -MAX_PITCH,
        MAX_PITCH,
      );
    };

    document.addEventListener("pointerlockchange", handleLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);
    canvas.addEventListener("click", handleCanvasClick);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.focus();

    return () => {
      document.removeEventListener("pointerlockchange", handleLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      canvas.removeEventListener("click", handleCanvasClick);
      document.removeEventListener("mousemove", handleMouseMove);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  ], [
    gl,
    modalOpen,
    onActivity,
    onInteraction,
    resolveInteractionTarget,
    mouseLookSensitivity,
    invertLookFactor,
    resetTransientInputs,
  ]);

  useEffect(() => {
    if (!modalOpen && fullscreen) return;
    if (modalOpen) {
      resetTransientInputs();
    }
    if (document.pointerLockElement === gl.domElement) {
      document.exitPointerLock();
    }
  }, [fullscreen, gl, modalOpen, resetTransientInputs]);

  useEffect(() => {
    movementGuardUntilRef.current = performance.now() + 180;
  }, [fullscreen, viewport.height, viewport.width, zone]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        resetTransientInputs();
      }
    };

    const handleBlur = () => {
      resetTransientInputs();
    };

    const handleFullscreenChange = () => {
      movementGuardUntilRef.current = performance.now() + 180;
      if (!document.fullscreenElement) {
        resetTransientInputs();
      }
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreenChange as EventListener,
    );

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange as EventListener,
      );
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      }
    };
  }, [gl, resetTransientInputs]);

  const step = useCallback(
    (deltaSeconds: number) => {
      const joy = joystickRef.current;
      const hasMoveIntent =
        keysDownRef.current.size > 0 ||
        Math.abs(joy.moveX) > 0.06 ||
        Math.abs(joy.moveZ) > 0.06 ||
        jumpRequestedRef.current;
      const hasLookIntent =
        Math.abs(joy.lookX) > 0.025 || Math.abs(joy.lookY) > 0.025;
      const currentTransition = transitionRef.current;
      const movementCanBreakTransition =
        !currentTransition ||
        currentTransition.elapsed >=
          (currentTransition.zone === "meadow" ? 0.9 : 0.45);
      const wantsCancelTransition =
        hasLookIntent ||
        interactRequestedRef.current ||
        (movementCanBreakTransition && hasMoveIntent);

      if (wantsCancelTransition) {
        transitionRef.current = null;
      }

      if (!modalOpen) {
        let moveX = 0;
        let moveZ = 0;

        if (
          keysDownRef.current.has("KeyA") ||
          keysDownRef.current.has("ArrowLeft")
        ) {
          moveX -= 1;
        }
        if (
          keysDownRef.current.has("KeyD") ||
          keysDownRef.current.has("ArrowRight")
        ) {
          moveX += 1;
        }
        if (
          keysDownRef.current.has("KeyW") ||
          keysDownRef.current.has("ArrowUp")
        ) {
          moveZ -= 1;
        }
        if (
          keysDownRef.current.has("KeyS") ||
          keysDownRef.current.has("ArrowDown")
        ) {
          moveZ += 1;
        }

        moveX += joy.moveX;
        moveZ += joy.moveZ;

        if (Math.abs(joy.lookX) > 0.01 || Math.abs(joy.lookY) > 0.01) {
          const shapedLookX =
            Math.sign(joy.lookX) * Math.pow(Math.abs(joy.lookX), 1.22);
          const shapedLookY =
            Math.sign(joy.lookY) * Math.pow(Math.abs(joy.lookY), 1.42);
          const edgeBoost = THREE.MathUtils.lerp(
            0.72,
            1.5,
            Math.max(Math.abs(joy.lookX), Math.abs(joy.lookY)),
          );
          yawRef.current -=
            shapedLookX *
            deltaSeconds *
            touchLookSensitivity *
            (2.4 + edgeBoost * 2.4);
          pitchRef.current -=
            shapedLookY *
            deltaSeconds *
            touchLookSensitivity *
            invertLookFactor *
            (2.1 + edgeBoost * 2.05);
          pitchRef.current = THREE.MathUtils.clamp(
            pitchRef.current,
            -MAX_PITCH,
            MAX_PITCH,
          );
        }

        if (transitionRef.current) {
          transitionRef.current.elapsed += deltaSeconds;
          const progress = THREE.MathUtils.clamp(
            transitionRef.current.elapsed / transitionRef.current.duration,
            0,
            1,
          );
          const eased = progress * progress * (3 - progress * 2);
          camera.position.lerpVectors(
            transitionRef.current.fromPosition,
            transitionRef.current.toPosition,
            eased,
          );
          yawRef.current = THREE.MathUtils.lerp(
            transitionRef.current.fromYaw,
            transitionRef.current.toYaw,
            eased,
          );
          pitchRef.current = THREE.MathUtils.lerp(
            transitionRef.current.fromPitch,
            transitionRef.current.toPitch,
            eased,
          );
          if (progress >= 1) {
            transitionRef.current = null;
          }
        } else if (zone === "gallery") {
          frameForward.current
            .set(0, 0, -1)
            .applyAxisAngle(UP_VECTOR, yawRef.current);
          frameForward.current.y = 0;
          frameForward.current.normalize();
          frameRight.current
            .crossVectors(frameForward.current, UP_VECTOR)
            .normalize();

          movementDirection.current.set(0, 0, 0);
          movementDirection.current.addScaledVector(frameRight.current, moveX);
          movementDirection.current.addScaledVector(
            frameForward.current,
            -moveZ,
          );
          if (movementDirection.current.lengthSq() > 1) {
            movementDirection.current.normalize();
          }

          camera.position.addScaledVector(
            movementDirection.current,
            GALLERY_SPEED * deltaSeconds,
          );

          if (jumpRequestedRef.current && groundedRef.current) {
            velocityYRef.current = JUMP_VELOCITY;
            groundedRef.current = false;
          }
          jumpRequestedRef.current = false;

          velocityYRef.current += GRAVITY * deltaSeconds;
          camera.position.y += velocityYRef.current * deltaSeconds;
          if (camera.position.y <= EYE_HEIGHT) {
            camera.position.y = EYE_HEIGHT;
            velocityYRef.current = 0;
            groundedRef.current = true;
          }

          camera.position.x = THREE.MathUtils.clamp(
            camera.position.x,
            -16.5,
            16.5,
          );
          camera.position.z = THREE.MathUtils.clamp(
            camera.position.z,
            -16.5,
            16.5,
          );
        } else {
          const currentPlanarPoint = getPlanarFromWorldPosition(camera.position);
          const currentTerrainLift = getMeadowTerrainLift(
            currentPlanarPoint.x,
            currentPlanarPoint.z,
          );

          surfaceUp.current.copy(
            projectPlanarPointToMeadowNormal(
              currentPlanarPoint.x,
              currentPlanarPoint.z,
            ),
          );
          tangentReference.current.copy(
            getMeadowReferenceForward(surfaceUp.current),
          );
          frameForward.current
            .copy(tangentReference.current)
            .applyAxisAngle(surfaceUp.current, yawRef.current)
            .normalize();
          frameRight.current
            .crossVectors(frameForward.current, surfaceUp.current)
            .normalize();

          movementDirection.current.set(0, 0, 0);
          movementDirection.current.addScaledVector(frameRight.current, moveX);
          movementDirection.current.addScaledVector(
            frameForward.current,
            -moveZ,
          );
          if (movementDirection.current.lengthSq() > 1) {
            movementDirection.current.normalize();
          }

          surfaceFoot.current
            .copy(
              projectPlanarPointToMeadowSurface(
                currentPlanarPoint.x,
                currentPlanarPoint.z,
                0,
              ),
            );
          surfaceFoot.current.addScaledVector(
            movementDirection.current,
            MEADOW_SPEED * deltaSeconds,
          );
          const movedNormal = surfaceFoot.current
            .clone()
            .sub(MEADOW_PLANET_CENTER)
            .normalize();
          const movedPlanar = getPlanarFromMeadowNormal(movedNormal);

          const resolvedPlanar = resolvePlanarMeadowCollisions(
            [movedPlanar.x, movedPlanar.z],
            MEADOW_PLAYER_COLLIDER_RADIUS,
          );

          const radialNormal = projectPlanarPointToMeadowRadialNormal(
            resolvedPlanar[0],
            resolvedPlanar[1],
          );
          const nextTerrainLift = getMeadowTerrainLift(
            resolvedPlanar[0],
            resolvedPlanar[1],
          );
          surfaceUp.current.copy(
            projectPlanarPointToMeadowNormal(
              resolvedPlanar[0],
              resolvedPlanar[1],
            ),
          );

          if (jumpRequestedRef.current && groundedRef.current) {
            velocityYRef.current = MEADOW_JUMP_VELOCITY;
            groundedRef.current = false;
          }
          jumpRequestedRef.current = false;

          velocityYRef.current += MEADOW_GRAVITY * deltaSeconds;
          let jumpHeight =
            camera.position.distanceTo(MEADOW_PLANET_CENTER) -
            (MEADOW_PLANET_RADIUS + currentTerrainLift + MEADOW_STAND_HEIGHT);
          jumpHeight += velocityYRef.current * deltaSeconds;
          if (jumpHeight <= 0) {
            jumpHeight = 0;
            velocityYRef.current = 0;
            groundedRef.current = true;
          }

          camera.position
            .copy(MEADOW_PLANET_CENTER)
            .addScaledVector(
              radialNormal,
              MEADOW_PLANET_RADIUS +
                nextTerrainLift +
                MEADOW_STAND_HEIGHT +
                jumpHeight,
            );
        }
      }

      applyOrientation(zone);

      const triggers = zone === "gallery" ? GALLERY_DOORS : MEADOW_DOORS;
      const nearbyDoor =
        triggers.find((door) => {
          const dx = camera.position.x - door.position[0];
          const dy = camera.position.y - door.position[1];
          const dz = camera.position.z - door.position[2];
          return dx * dx + dy * dy + dz * dz <= door.radius * door.radius;
        }) || null;

      const nearbyDoorId = nearbyDoor?.id || null;
      if (nearbyDoorId !== nearbyDoorRef.current) {
        nearbyDoorRef.current = nearbyDoorId;
        onTriggerProximityChange(nearbyDoorId);
      }
      if (autoDoorRef.current.zone !== zone) {
        autoDoorRef.current = { zone, id: null };
      } else if (!nearbyDoorId) {
        autoDoorRef.current.id = null;
      }

      const nearbyDeposit =
        zone === "meadow"
          ? DEPOSIT_SITES.find((site) => {
              const dx = camera.position.x - site.position[0];
              const dy = camera.position.y - site.position[1];
              const dz = camera.position.z - site.position[2];
              return (
                dx * dx + dy * dy + dz * dz <=
                site.interactionRadius * site.interactionRadius
              );
            }) || null
          : null;
      const nearbyDepositId = nearbyDeposit?.id || null;
      if (nearbyDepositId !== nearbyDepositRef.current) {
        nearbyDepositRef.current = nearbyDepositId;
        onDepositProximityChange(nearbyDepositId);
      }

      const nearbyCreatureIds =
        zone === "meadow"
          ? Object.entries(creatureRuntimeRef.current)
              .filter(([creatureId, creatureSnapshot]) => {
                const definition = MEADOW_CREATURES.find(
                  (item) => item.id === creatureId,
                );
                if (!definition) return false;
                const dx = camera.position.x - creatureSnapshot.position[0];
                const dy = camera.position.y - creatureSnapshot.position[1];
                const dz = camera.position.z - creatureSnapshot.position[2];
                return (
                  dx * dx + dy * dy + dz * dz <=
                  definition.triggerDistance * definition.triggerDistance
                );
              })
              .map(([creatureId]) => creatureId)
          : [];
      const nearbyCreatureKey = nearbyCreatureIds.join("|");
      if (nearbyCreatureKey !== nearbyCreatureKeyRef.current) {
        nearbyCreatureKeyRef.current = nearbyCreatureKey;
        onCreatureProximityChange(nearbyCreatureIds);
      }

      const visibleLandmarkIds =
        zone === "meadow"
          ? MEADOW_LANDMARKS.filter((landmark) => {
              const dx = landmark.position[0] - camera.position.x;
              const dy = landmark.position[1] - camera.position.y;
              const dz = landmark.position[2] - camera.position.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (distance > landmark.visibleDistance * landmarkDrawDistance) {
                return false;
              }
              const inverseDistance = distance > 0.0001 ? 1 / distance : 1;
              const facing =
                dx * inverseDistance * lookDirection.current.x +
                dy * inverseDistance * lookDirection.current.y +
                dz * inverseDistance * lookDirection.current.z;
              return facing > -0.18;
            }).map((landmark) => landmark.id)
          : [];
      const visibleLandmarkKey = visibleLandmarkIds.join("|");
      if (visibleLandmarkKey !== visibleLandmarkKeyRef.current) {
        visibleLandmarkKeyRef.current = visibleLandmarkKey;
        onVisibleLandmarksChange(visibleLandmarkIds);
      }

      const horizonLandmarkIds =
        zone === "meadow"
          ? skylineLandmarks.filter((landmark) => {
              const dx = landmark.position[0] - camera.position.x;
              const dy = landmark.position[1] - camera.position.y;
              const dz = landmark.position[2] - camera.position.z;
              const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (
                distance >
                landmark.visibleDistance * Math.max(0.95, landmarkDrawDistance)
              ) {
                return false;
              }
              const inverseDistance = distance > 0.0001 ? 1 / distance : 1;
              const facing =
                dx * inverseDistance * lookDirection.current.x +
                dy * inverseDistance * lookDirection.current.y +
                dz * inverseDistance * lookDirection.current.z;
              return facing > -0.82;
            }).map((landmark) => landmark.id)
          : [];
      const horizonLandmarkKey = horizonLandmarkIds.join("|");
      if (horizonLandmarkKey !== horizonLandmarkKeyRef.current) {
        horizonLandmarkKeyRef.current = horizonLandmarkKey;
        onHorizonLandmarksChange(horizonLandmarkIds);
      }

      const nextSector =
        zone === "meadow"
          ? getMeadowSectorForWorldPosition(camera.position)
          : null;
      if (nextSector !== sectorRef.current) {
        sectorRef.current = nextSector;
        onSectorChange(nextSector);
      }

      let doorTriggeredThisFrame: DoorTrigger["id"] | null = null;
      if (
        nearbyDoorId &&
        !modalOpen &&
        !transitionRef.current &&
        autoDoorRef.current.id !== nearbyDoorId
      ) {
        autoDoorRef.current.id = nearbyDoorId;
        doorTriggeredThisFrame = nearbyDoorId;
        resetTransientInputs();
        onDoorTrigger(nearbyDoorId);
      }

      if (interactRequestedRef.current && !modalOpen) {
        const interactionTarget =
          resolveInteractionTarget() ||
          (nearbyDepositId
            ? { type: "deposit", id: nearbyDepositId }
            : nearbyCreatureIds[0]
              ? { type: "meadow-creature", id: nearbyCreatureIds[0] }
              : null);
        if (interactionTarget) {
          onInteraction(interactionTarget);
        } else if (nearbyDoorId && doorTriggeredThisFrame !== nearbyDoorId) {
          resetTransientInputs();
          onDoorTrigger(nearbyDoorId);
        }
      }
      interactRequestedRef.current = false;

      snapshotRef.current = {
        ...snapshotRef.current,
        zone,
        sector: nextSector,
        player: {
          x: Number(camera.position.x.toFixed(2)),
          y: Number(camera.position.y.toFixed(2)),
          z: Number(camera.position.z.toFixed(2)),
          yaw: Number(yawRef.current.toFixed(3)),
          pitch: Number(pitchRef.current.toFixed(3)),
          vy: Number(velocityYRef.current.toFixed(3)),
          grounded: groundedRef.current,
        },
        nearbyTriggerId: nearbyDoorId,
        nearbyDepositId,
        nearbyCreatureIds,
        visibleLandmarkIds,
        horizonLandmarkIds,
      };
    },
    [
      applyOrientation,
      camera,
      creatureRuntimeRef,
      interactRequestedRef,
      invertLookFactor,
      joystickRef,
      jumpRequestedRef,
      keysDownRef,
      landmarkDrawDistance,
      modalOpen,
      onCreatureProximityChange,
      onDepositProximityChange,
      onDoorTrigger,
      onHorizonLandmarksChange,
      onInteraction,
      onSectorChange,
      onTriggerProximityChange,
      onVisibleLandmarksChange,
      resetTransientInputs,
      resolveInteractionTarget,
      snapshotRef,
      skylineLandmarks,
      touchLookSensitivity,
      zone,
    ],
  );

  useEffect(() => {
    registerStep(step);
  }, [registerStep, step]);

  useEffect(() => {
    debugPoseRef.current = (pose) => {
      if (zone !== "meadow") return;

      const jumpHeight = Math.max(0, pose.jumpHeight ?? 0);
      const resolvedPlanar = resolvePlanarMeadowCollisions(
        [pose.planarX, pose.planarZ],
        MEADOW_PLAYER_COLLIDER_RADIUS,
      );
      const nextPosition = projectPlanarPointToMeadowSurface(
        resolvedPlanar[0],
        resolvedPlanar[1],
        MEADOW_STAND_HEIGHT + jumpHeight,
      );

      transitionRef.current = null;
      velocityYRef.current = 0;
      groundedRef.current = jumpHeight <= 0.001;
      camera.position.copy(nextPosition);
      yawRef.current = pose.yaw ?? yawRef.current;
      pitchRef.current = THREE.MathUtils.clamp(
        pose.pitch ?? pitchRef.current,
        -MAX_PITCH,
        MAX_PITCH,
      );
      movementGuardUntilRef.current = performance.now() + 180;
      applyOrientation("meadow");
    };

    return () => {
      debugPoseRef.current = null;
    };
  }, [applyOrientation, camera, debugPoseRef, zone]);

  useFrame((_, deltaSeconds) => {
    step(Math.min(deltaSeconds, 1 / 20));
  });

  return null;
}

export function RenderProfileGuardian({
  profileId,
  deviceClass,
  allowAutoDowngrade,
  locked,
  onDowngrade,
}: {
  profileId: RenderProfile;
  deviceClass: DeviceClass;
  allowAutoDowngrade: boolean;
  locked: boolean;
  onDowngrade: (nextProfile: RenderProfile) => void;
}) {
  const sampleRef = useRef({
    elapsed: 0,
    frames: 0,
    slowWindows: 0,
  });

  useFrame((_, deltaSeconds) => {
    const sample = sampleRef.current;
    sample.elapsed += Math.min(deltaSeconds, 0.25);
    sample.frames += 1;

    if (sample.elapsed < 1.5) return;

    const averageFrameMs = (sample.elapsed / Math.max(sample.frames, 1)) * 1000;
    const budgetMs =
      profileId === "desktop_showcase"
        ? 24.5
        : profileId === "desktop_balanced"
          ? 27
          : profileId === "mobile_balanced"
            ? 30
            : 33;

    const slowWindow = averageFrameMs > budgetMs;
    sample.elapsed = 0;
    sample.frames = 0;

    if (!allowAutoDowngrade || locked || !slowWindow) {
      sample.slowWindows = 0;
      return;
    }

    sample.slowWindows += 1;
    if (sample.slowWindows < 2) return;

    sample.slowWindows = 0;
    const nextProfile = getNextAutoRenderProfile({
      currentProfile: profileId,
      deviceClass,
    });
    if (nextProfile) {
      onDowngrade(nextProfile);
    }
  });

  return null;
}
