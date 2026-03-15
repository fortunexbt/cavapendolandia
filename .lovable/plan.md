

## Refactor: First-Person Navigation System for the Gallery

### Problem
OrbitControls orbits around a target point, making it structurally impossible to "walk up to a wall" — zooming moves toward the orbit center, not toward what you're looking at. No amount of bound-tuning fixes this fundamental mismatch.

### Solution
Replace OrbitControls with a custom first-person camera system that supports two modes on desktop and virtual joysticks on mobile.

### Architecture

```text
Scene
├── FPSController (default)        ← WASD + mouse-look
│   ├── useFrame: apply velocity + clamp position
│   ├── onPointerMove: yaw/pitch
│   └── onKeyDown/Up: movement vector
├── OrbitMode (toggle)             ← legacy orbit for casual users
│   └── OrbitControls (existing, kept as fallback)
├── MobileControls (touch devices) ← two virtual joysticks
│   ├── Left stick: XZ movement
│   └── Right stick: yaw/pitch look
└── BoundaryClamp                  ← shared, runs every frame
```

### Implementation Plan (single file: `CavapendoGallery.tsx`)

**1. First-Person Camera Controller**
- Track `keysDown` set via `keydown`/`keyup` listeners (WASD + arrows + QE for up/down)
- Mouse look: pointer lock on canvas click; `movementX`/`movementY` control yaw/pitch
- `useFrame`: compute forward/right vectors from camera quaternion, apply movement at constant speed (~6 units/sec), clamp position to room bounds
- Camera height defaults to eye level (~1.2 units above floor at y=-3, so y≈-1.8)
- Wall proximity limit: camera stops at 0.3 units from any wall surface (walls at ±18, so clamp to ±17.7). This puts you ~10cm from frames at ±17.8

**2. Orbit Mode (Toggle)**
- Keep existing OrbitControls as-is, wrapped in a conditional render
- Toggle button in overlay switches `controlMode` state between `"fps"` and `"orbit"`
- When in orbit mode, disable pointer lock and WASD listeners
- Clamp still applies in orbit mode via useFrame

**3. Mobile Two-Stick Controls**
- Detect touch device via `useIsMobile()` or `'ontouchstart' in window`
- Render two translucent circular joystick zones as HTML overlay divs (bottom-left, bottom-right)
- Left joystick: track touch delta → XZ movement vector (forward/strafe)
- Right joystick: track touch delta → yaw/pitch rotation
- Same `useFrame` movement logic as WASD, just different input source
- No pointer lock needed on mobile

**4. Boundary Enforcement**
- Single `clampPosition()` in `useFrame`: 
  - X: clamp to [-17.7, 17.7]
  - Y: clamp to [-2.5, 8] (floor to near-ceiling)
  - Z: clamp to [-17.7, 17.7]
- No target clamping needed (no orbit target in FPS mode)
- In orbit mode, clamp both camera.position and controls.target as before

**5. UI Changes**
- Replace hint text: "WASD per muoverti • Mouse per guardare • Clicca un quadro" (desktop) / joystick icons (mobile)
- Add small toggle button: 🎮/🖱️ to switch FPS ↔ Orbit (desktop only)
- "Clicca per entrare" overlay on first load (to trigger pointer lock)
- ESC exits pointer lock (browser default), show re-entry prompt

**6. Interaction**
- Clicking frames/creatures: works the same — raycaster + onPointerDown opens modals
- In FPS mode, pointer lock means cursor is hidden; use a small crosshair div in center
- On modal open, release pointer lock; on modal close, re-acquire

### Files to modify
- `src/components/CavapendoGallery.tsx` — all changes in this single file

### What stays unchanged
- Audio system, room geometry, creatures, frames, lighting, modals, data fetching

