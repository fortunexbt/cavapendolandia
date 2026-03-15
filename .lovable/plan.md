

## Portal Exit: Walk Through the Archway to Leave

### Concept
When the user walks close to the front wall archway (the white entrance visible in the screenshot), detect proximity and navigate them to a "Grazie" (thank you) page — a gentle farewell screen.

### Implementation

**1. Exit detection in FPSController (`useFrame`)**
- After movement + clamp, check if `camera.position.z > 16.5` AND `Math.abs(camera.position.x) < 3` (within the archway opening)
- If true, call `onExit()` callback passed as prop
- Add a cooldown ref to prevent double-firing

**2. Same check in OrbitController**
- When in orbit mode, check camera position the same way each frame

**3. New "Grazie" page (`src/pages/Grazie.tsx`)**
- Minimal, atmospheric thank-you page with the project's serif typography
- Text: "Grazie per aver visitato Cavapendolandia" with a subtle fade-in
- A "Torna all'inizio" link back to `/`
- Use the same `MinimalHeader`/`MinimalFooter` layout

**4. Route + Navigation**
- Add `/grazie` route in `App.tsx`
- In `CavapendoGallery.tsx`, use `useNavigate` from react-router-dom
- Pass `onExit` from `Galleria.tsx` page that calls `navigate('/grazie')`

**5. Visual hint**
- Optional: add a faint glow or text "Uscita" above the archway inside the 3D scene to hint it's an exit

### Files to create/modify
- **Create** `src/pages/Grazie.tsx` — thank you page
- **Modify** `src/App.tsx` — add `/grazie` route
- **Modify** `src/components/CavapendoGallery.tsx` — add exit zone detection in `useFrame`, accept `onExit` prop
- **Modify** `src/pages/Galleria.tsx` — pass `onExit` with navigate callback

