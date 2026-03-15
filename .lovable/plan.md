

## Gallery Fixes: Brightness, Lighting Placement & Music

### Issues

1. **Too dark** — ambient at 0.12–0.18, directional at 0.4, only 8 track lights for 16 frames
2. **Track lights misplaced** — offset uses `sin(ry) * 1.5` / `cos(ry) * 1.5` pushing lights 1.5 units into the room away from the wall, at y=9.2 (near ceiling beams). They should be directly above each frame, close to the wall, shining down.
3. **Music not playing** — `useAmbientAudio` is called but likely failing silently. Need to check if the audio context is being created and if track fetching/generation is succeeding. The hook starts on mount but requires user interaction to create AudioContext. Will add a click-to-start trigger tied to the enter prompt click.

### Plan

**File: `src/components/CavapendoGallery.tsx`**

#### 1. Fix brightness
- Raise `ambientLight` intensity from `0.18` → `0.30`
- Raise `directionalLight` intensity from `0.4` → `0.55`
- Raise back wall pointLight from `0.7` → `0.9`
- Raise fill lights from `0.15` → `0.25`

#### 2. Fix track light placement — all frames, correct positions
- Remove the `slice(0, 8)` limit — light all 16 frames
- Fix offset: place each track light directly on the wall above the frame, not offset into the room. The light should be at the frame's X/Z position (on the wall), but at y ≈ frame_y + 2.5 (just above the frame). For wall-mounted frames, the light stays at the same wall coordinate:
  - Back wall: `[frameX, frameY + 2.5, frameZ]` (same Z as frame)
  - Left wall: `[frameX, frameY + 2.5, frameZ]` (same X as frame)
  - Right wall: same logic
- Increase TrackLight intensity from `0.6` → `0.8` and distance from `10` → `8` for tighter, brighter pools

#### 3. Fix music playback
- The `useAmbientAudio` hook calls `playTrack(0)` on mount, but `AudioContext` requires a user gesture. The "enter" prompt click is the natural trigger.
- Pass a `startAudio` callback from `useAmbientAudio` and call it when the user clicks the enter prompt or first interacts, instead of auto-starting on mount.
- Add error logging to `playTrack` to surface failures.

