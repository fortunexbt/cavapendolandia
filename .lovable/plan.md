

## Plan: Transform the Gallery into an Immersive Spatial Experience

### Current State
The gallery is a 3D room with walls at ±18 units, frames on walls, 6 creatures on the floor, dust sparkles, and basic orbit controls. No audio, no spatial zones, no atmosphere beyond visuals.

### What Changes

**1. Ambient Sound System with Spatial Zones** (`src/components/CavapendoGallery.tsx`)

Add a `useAmbientAudio` hook that creates multiple `Audio` elements using the Web Audio API's spatial audio (`PannerNode` or Three.js `PositionalAudio`). Define 4-5 zones:

- **Center room**: Soft low-frequency hum, like a museum hall resonance — gentle drone
- **Near creatures**: Each creature gets a subtle ambient loop (water bubbling near seahorse, night crickets near owl, purring near cat, croaking near frog, rustling leaves near lizard, soft wind near snail)
- **Near walls/frames**: Quiet whispers or page-turning sounds when camera is close to frames
- **Background layer**: Continuous very quiet generative ambience (reverberant space tone)

Implementation approach:
- Use static `.mp3` files hosted in `/public/audio/` for ambient loops (we'll generate these via the ElevenLabs SFX edge function and cache them, OR use royalty-free ambient clips bundled as static assets)
- Use Three.js `PositionalAudio` attached to creature groups so sound spatializes as the camera moves
- Add a global mute/unmute toggle in the UI overlay (bottom-left) — audio starts muted by default, user opts in
- On unmute, fade in the base ambience, then activate positional audio sources

**2. Generate Ambient Sound Assets via ElevenLabs Edge Function**

Create `supabase/functions/generate-ambient-sfx/index.ts`:
- Takes a `prompt` and `duration` parameter
- Calls ElevenLabs Sound Effects API
- Returns raw audio bytes
- Used at build/admin time to pre-generate the ~6 creature ambient loops + 2 room ambience tracks

On the client side, fetch and cache these audio blobs the first time audio is enabled (lazy-load, don't block gallery rendering).

**3. Camera "Fly-to-Frame" Feature** (addresses ongoing zoom frustration)

Add a mechanism where clicking a frame smoothly animates the camera to face that frame up close, then a second click or ESC returns to free orbit. This replaces the awkward manual zoom entirely.

- Use `gsap` or manual `useFrame` lerp to animate camera position + target to face the clicked frame
- When "focused", disable OrbitControls temporarily, show a "Back" button overlay
- This makes the gallery feel like walking through a real museum

**4. Atmospheric Visual Enhancements**

- Add volumetric-style light shafts using transparent cone meshes from ceiling spotlights aimed at featured frames
- Add subtle animated shadows under creatures (circular dark planes)
- Add a very faint animated gradient on the ceiling to simulate time passing

**5. UI Polish**

- Replace the plain text instructions with an animated hint that fades after 5 seconds
- Add a small 🔊/🔇 toggle button (bottom-left corner)
- Show a subtle "Click to explore" pulse animation on frames when they're in view

---

### Technical Details

**Audio architecture (no external dependencies needed):**
```text
┌─────────────────────────────────────────┐
│  AudioContext (created on user gesture)  │
├─────────────┬───────────────────────────┤
│ GainNode    │ Master volume + mute      │
│ (global)    │                           │
├─────────────┼───────────────────────────┤
│ Base        │ Static ambient drone      │
│ Ambience    │ (HTML Audio → MediaSource)│
├─────────────┼───────────────────────────┤
│ Positional  │ Three.js PositionalAudio  │
│ Sources x6  │ attached to each creature │
│             │ group, auto-spatialize    │
└─────────────┴───────────────────────────┘
```

**Fly-to-frame camera:**
- Store `cameraTarget` state (position + lookAt)
- In `useFrame`, lerp current camera toward target
- When target is null, OrbitControls resumes

**Files created:**
- `supabase/functions/generate-ambient-sfx/index.ts` — ElevenLabs SFX proxy

**Files modified:**
- `src/components/CavapendoGallery.tsx` — all audio, camera, and atmospheric changes

**Database:** No changes needed.

**Dependencies:** None new — Three.js already has `PositionalAudio` and `AudioListener` built in.

