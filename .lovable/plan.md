

## Plan: Bigger creatures, real data pipeline, auto-rendered media on walls

### Problem 1: Gallery shows only demo data
The gallery currently uses hardcoded `demoOfferings` (line 766-854) and never queries the database. The submission→admin→gallery pipeline is broken at the last mile.

### Problem 2: Creatures are tiny and simplistic
All creatures use scale 0.4-0.6 with basic primitive shapes. They need to be 2-3x larger with more geometric detail and idle animations (breathing, tail swishing, head turning).

### Problem 3: Frames show colored boxes, not actual content
Frames render placeholder `boxGeometry` meshes instead of the actual media. Text, images, audio, and video should be visible/playable directly on the wall without clicking.

---

### Changes

**1. Wire gallery to real approved offerings** (`CavapendoGallery.tsx`)
- Add a Supabase query for `offerings` where `status = 'approved'`, ordered by `approved_at desc`, limit 16
- Use `withSignedFileUrls` to resolve file URLs
- Fall back to demo data only when no approved offerings exist
- Import `useQuery` from tanstack and `supabase` client

**2. Render media directly on frames** (`ArtisticFrame` component)
- **Text offerings**: Use `<Html>` from drei to render `text_content` directly on the canvas/frame surface, styled with CSS, auto-visible
- **Image offerings**: Use drei `<Html>` with an `<img>` tag rendered on the frame face, or use `useTexture`/`TextureLoader` to map the image onto the canvas mesh
- **Audio offerings**: Use `<Html>` to embed a small `<audio>` element with controls, auto-playing muted with a play button
- **Video offerings**: Use `<Html>` to embed a `<video>` element on the frame, autoplaying muted and looping
- **Link offerings**: Use `<Html>` to show the URL text and a clickable link icon
- **PDF offerings**: Show title + "PDF" label on the frame face
- Remove the click-to-view requirement; content is immediately visible

**3. Make creatures bigger and more alive** (`CreatureBody` + `StoryCreature`)
- Increase all creature scales from 0.4-0.6 → 1.0-1.5
- Add animated parts using `useFrame`:
  - Seahorse: tail curling animation, gentle sway
  - Owl: head rotation side-to-side, blinking eyes (scale pulse on eye meshes)
  - Cat: tail swishing, ear twitching
  - Frog: throat pulsing (scale-y on body), occasional jump
  - Snail: eye stalks waving, slow forward creep
  - Lizard: body undulation, tongue flick
- Add more geometric detail: extra body segments, texture-like patterns via layered meshes, whiskers/feathers/scales as thin cylinders
- Add a small `<Html>` speech bubble near each creature showing its name, so users know they're interactive without clicking

**4. Keep the offering detail modal** but make it secondary — the primary experience is seeing content directly on walls. Modal opens on click for full-screen view of images or full text.

### Files modified
- `src/components/CavapendoGallery.tsx` — all changes above

