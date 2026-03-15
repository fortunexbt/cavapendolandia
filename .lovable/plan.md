

## Plan: Transform Gallery into an Architectural 3D Experience

### Problems
1. **No boundaries** — Camera can orbit infinitely, escape the room entirely
2. **Zoom broken** — `minDistance`/`maxDistance` are relative to orbit target `[0,1,0]`, not walls; `zoomToCursor` fights with orbit
3. **Bland walls** — Flat colored planes with no texture or depth
4. **No roof** — Just a faint transparent plane; no architectural character
5. **No lighting zones** — Uniform lighting, no sense of space

### What Changes

**1. Camera Constraints (fix zoom + boundaries)**
- Replace unbounded `OrbitControls` with proper limits:
  - `maxDistance={30}` (can't zoom out past the room)
  - `minDistance={2}` (prevents clipping into walls)
  - Remove `zoomToCursor` (causes erratic behavior with orbit target)
  - Add `minAzimuthAngle`/`maxAzimuthAngle` to keep the camera facing inward (roughly ±120 degrees)
  - Clamp `target` so orbit center stays inside room bounds
- Add an `onEnd` handler to the controls that snaps the camera back inside the room if it escapes (checking x/z against ±16)

**2. Textured Walls**
- Procedurally generate a stucco/plaster wall texture using a `CanvasTexture`:
  - Create an offscreen canvas with subtle noise patterns in warm cream/ochre tones
  - Apply `wrapS/wrapT = RepeatWrapping` with repeat `[4, 2]` for scale
  - Add `bumpMap` using the same texture for subtle 3D relief
- Add a baseboard strip (dark wood-colored thin box) along each wall bottom
- Add a picture rail (thin horizontal box) at ~3m height on each wall
- Add a `front wall` to close the room (with an archway opening for the "entrance" feel — a plane with a central hole, or two side panels + top panel)

**3. Perugia-Style Roof with Wood Beams**
- Create a `WoodenRoof` component:
  - Main ceiling plane at y=10 with a warm terracotta/cream color
  - 5-6 large horizontal beams spanning the room (long boxes, dark wood color `#5a3a1a`, roughness 0.9)
  - 2 central ridge beams crossing perpendicular
  - Small support bracket meshes where beams meet walls (angled wedge shapes)
  - Subtle wood grain via a procedural `CanvasTexture` with horizontal lines
- Add 4 corner pillars (thick cylinders or octagonal prisms, stone-colored) from floor to ceiling

**4. Lighting Zones**
- Remove the uniform `ambientLight` and replace with zoned lighting:
  - **Warm pool** near the back wall: warm `SpotLight` pointing down, golden hue
  - **Cool zone** near entrance: slightly blue-tinted `pointLight`
  - **Frame spotlights**: 3-4 small `SpotLight`s aimed at specific frame positions on the walls (gallery track lighting feel)
  - **Under-beam shadows**: The existing directional light with `castShadow` will interact with the beams naturally
  - Reduce ambient to `0.15` so the zones actually feel distinct
- Add `RectAreaLight` (via drei's `<RectAreaLight>`) for soft warm panels on the ceiling between beams

**5. Floor Enhancement**
- Replace flat floor with a tiled texture:
  - Procedural `CanvasTexture` drawing a grid of warm terracotta/stone tiles
  - Apply as both `map` and subtle `bumpMap`
  - Add a dark border line pattern

### Files Modified
- `src/components/CavapendoGallery.tsx` — all changes in this single file

### No database changes needed.

