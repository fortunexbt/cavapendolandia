
Goal: fix navigation so users cannot leave the room, can get close enough to inspect art, and can reliably click creatures/frames.

What I found in current implementation
- Bounds leak: `OrbitControls` clamps only `target` (`onChange`), but camera position itself is never clamped. With `enablePan={true}` and `maxDistance={28}` in a room half-size of 18, camera can still end up outside.
- Zoom feels wrong: zoom is relative to current target, not the object the user is trying to inspect. If target stays central, walls/creatures remain hard to approach.
- Creature interaction is fragile: creatures use `onClick` on detailed geometry only; misses are common when camera is far or moving.
- Front archway is open, so any boundary bug immediately exposes “outside world”.

Implementation plan
1) Replace soft bounds with hard camera confinement
- Add room constants (`ROOM_HALF = 18`, `SAFE_HALF = 16.2`, `Y_MIN`, `Y_MAX`).
- Add a `clampInsideRoom(camera, controls)` utility that clamps both:
  - `controls.target` inside safe bounds
  - `camera.position` inside safe bounds
- Run this clamp in two places:
  - `OrbitControls.onChange`
  - a `useFrame` guard (final safety net each frame)
- Reduce `maxDistance` to a value compatible with room size (e.g. 14–16), keep `minDistance` low (e.g. ~0.8–1.0).

2) Make zoom/navigation object-centric (not center-centric)
- Re-enable predictable close inspection by adding focus behavior:
  - On frame click: compute a close camera target in front of that frame normal.
  - On creature click: compute a close camera target slightly above creature center.
- Wire this to existing `CameraController` and `cameraTarget` state (already present but underused).
- Add “Back to free roam” action to reset focus.
- Keep orbit enabled in free roam; disable only while fly-to animation runs.

3) Improve interaction hit reliability
- Frames: keep current enlarged invisible hit plane, but tie selection to focus first then open modal (or open immediately after arrival).
- Creatures: add explicit invisible collider per creature (sphere/capsule) with `onPointerDown`, larger than visual mesh, and keep label non-interactive.
- Prefer `onPointerDown` over `onClick` for consistency during small pointer movement.

4) Close the practical escape path at the front
- Keep the arch visually, but add an invisible non-rendered collision plane/box at the doorway depth so camera confinement and user perception stay consistent.
- This avoids seeing “outside” even if users push controls aggressively.

5) Tuning pass for usability
- Slightly lower camera `fov` only if needed for close-read comfort.
- Adjust damping/zoomSpeed to avoid overshooting when approaching walls and creatures.

Files to modify
- `src/components/CavapendoGallery.tsx` only.

Validation checklist (end-to-end)
- From `/galleria`, try aggressive pan/rotate/zoom for 30+ seconds: camera never exits room.
- Scroll zoom while aiming at frames and creatures: can get close enough to inspect and click.
- Click each creature from multiple angles/distances: modal opens reliably.
- Click multiple frames near corners and side walls: interaction remains accurate.
- Confirm no regressions for overlay buttons and modal close behavior.
