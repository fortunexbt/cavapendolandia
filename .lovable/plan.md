

## Final Gallery Refinements: Realism Pass

### What exists now
- Room: stucco walls (procedural texture), terracotta tile floor, wooden beams/roof, stone pillars, baseboards, picture rails
- Lighting: 1 ambient, 1 directional (shadow), 1 spot (back wall), 2 fill point lights
- Atmosphere: fog, dust sparkles, volumetric light cones (back wall only), stars
- Frames: wooden frames with canvas background, hover glow
- Audio: ambient music system (ElevenLabs generated, cached)

### Plan

**1. Overhead track lights per frame** (`GalleryLighting` + `Scene`)
- Add a small spotlight above each painting, angled down at the frame — like real gallery track lighting
- Each spot: narrow cone (`angle: 0.4`), warm color `#fff0d0`, moderate intensity, `penumbra: 0.8`
- Adds visible light pools on each frame and creates natural dark zones between paintings

**2. Dark zones / ambient occlusion feel**
- Lower ambient light intensity from `0.25` → `0.12` so the room is darker by default
- The per-frame spotlights become the primary illumination — dark corners emerge naturally
- Add subtle dark corner point lights with very low intensity or just let the reduced ambient create shadows
- Add darkened edges to the floor with a ring mesh (dark transparent gradient at room perimeter)

**3. Wall & floor texturing improvements**
- Stucco texture: increase noise density, add subtle warm color variation patches, increase bump scale
- Tile texture: add subtle tile color variation per tile, slight rotation/offset for imperfection
- Add a subtle normal-map-like effect to walls by varying the bump scale

**4. Frame improvements**
- Add a thin shadow mesh behind each frame (dark plane slightly offset) for fake contact shadows
- Add subtle frame bevel by using two nested boxes with slightly different colors

**5. Footstep sounds** (lightweight)
- Play a soft footstep sound when the player moves in FPS mode
- Use a simple procedural approach: create short click/tap sounds via Web Audio API oscillator on each step interval
- No external audio files needed — synthesize a soft "tap" with a brief noise burst

**6. Ambient room sounds**
- Add a subtle room tone / reverb tail using the existing audio system
- Layer a quiet low-frequency hum under the music for "gallery silence" feeling

**7. Ceiling light fixtures**
- Add visible light fixture geometry: small cylinders/cones mounted on the ceiling above each spotlight
- Dark metal color, positioned at the spotlight origin

### Files to modify
- **`src/components/CavapendoGallery.tsx`**:
  - `GalleryLighting`: reduce ambient, add per-frame track spotlights
  - New `TrackLight` component: fixture geometry + spotlight combo
  - `GalleryRoom`: darken floor edges, enhance textures (bump scale, noise)
  - `ArtisticFrame`: add shadow plane behind frame
  - `FPSController`: add footstep audio synthesis on movement
  - `Scene`: pass frame positions to lighting system
  - `useStuccoTexture` / `useTileTexture`: richer procedural detail

### Not changing
- Room dimensions, frame layout logic, creature system, modal system, audio music system — all stay as-is
- No new dependencies needed — all changes use existing Three.js/drei features

