

## Diagnosis

After thorough investigation with browser tools and code review, here is what's happening:

**Root cause: WebGL context exhaustion and missing fallback handling**

1. **Homepage uses WebGL** (`CavapendoWorld.tsx` renders a Three.js Canvas on `/`). When the user navigates to `/galleria`, the gallery creates a **second** Three.js Canvas. The browser has limited WebGL contexts (typically 8-16) and the Lovable preview iframe has even fewer. The old context isn't always cleaned up before the new one is created, causing `THREE.WebGLRenderer: Context Lost`.

2. **No recovery from context loss**: The `WebGLCrashBoundary` in `GalleryCanvas.tsx` only catches React JS errors (via `getDerivedStateFromError`), NOT the WebGL `webglcontextlost` DOM event. When the GPU context is lost, the canvas goes permanently black with no user feedback.

3. **Prelude overlay on every route change**: `CavapendoliPrelude` renders on every non-admin route, causing brief visual flickers during navigation even after it was "completed."

**Other pages work fine**: Homepage, Che cos'è, Contatti, Regole all render correctly. The gallery is the sole broken experience.

---

## Plan

### Step 1: Add WebGL context loss detection and recovery to GalleryCanvas

In `src/features/gallery/components/GalleryCanvas.tsx`:
- Add a `webglcontextlost` event listener on the canvas DOM element
- When detected, show a visible fallback UI with a "Reload" button instead of a black screen
- Also listen for `webglcontextrestored` to attempt automatic recovery

### Step 2: Prevent WebGL context competition from homepage

In `src/pages/Index.tsx`:
- Make the `CavapendoWorld` 3D background **conditional** — only render it when the page is actually visible
- Add cleanup: when the user navigates away from `/`, ensure the homepage Canvas is fully unmounted before the gallery Canvas initializes
- Alternative simpler approach: replace the homepage 3D background with a CSS-only gradient (the 3D orbs/sparkles are decorative and non-essential) to free up WebGL context for the gallery

### Step 3: Reduce WebGL resource usage in gallery initialization

In `src/features/gallery/components/GalleryCanvas.tsx`:
- Change `powerPreference` from the render profile value to `"default"` (avoid `"high-performance"` which aggressively claims GPU resources)
- Set `failIfMajorPerformanceCaveat: true` initially, and on failure retry with `false` plus reduced settings

### Step 4: Fix prelude re-rendering on navigation

In `src/App.tsx` / `src/components/CavapendoliPrelude.tsx`:
- Check `sessionStorage` for prelude completion state — if already shown this session, skip entirely (don't render the component at all)
- This prevents the flash/flicker between page transitions

### Step 5: Add visible fallback for gallery load failure

In `src/components/CavapendoGalleryShell.tsx`:
- Add a timeout (e.g., 15 seconds) — if the gallery canvas never produces a rendered frame, show a static fallback with offering thumbnails and a message explaining WebGL is unavailable
- This ensures the gallery page is never permanently stuck on a black screen

---

## Technical Details

**WebGL context loss listener** (Step 1):
```tsx
// Inside GalleryCanvas, wrap Canvas in a div with ref
const canvasWrapperRef = useRef<HTMLDivElement>(null);
const [contextLost, setContextLost] = useState(false);

useEffect(() => {
  const canvas = canvasWrapperRef.current?.querySelector('canvas');
  if (!canvas) return;
  const handleLost = (e: Event) => { e.preventDefault(); setContextLost(true); };
  const handleRestored = () => setContextLost(false);
  canvas.addEventListener('webglcontextlost', handleLost);
  canvas.addEventListener('webglcontextrestored', handleRestored);
  return () => {
    canvas.removeEventListener('webglcontextlost', handleLost);
    canvas.removeEventListener('webglcontextrestored', handleRestored);
  };
}, []);
```

**Homepage 3D removal** (Step 2): Replace `<CavapendoWorld />` with a pure CSS background. The existing gradient divs in `CavapendoWorld` already provide a beautiful fallback — just remove the Canvas part.

**Prelude session guard** (Step 4): Add `sessionStorage.setItem('prelude_shown', '1')` on completion, and check it in `AnimatedRoutes` before rendering `<CavapendoliPrelude />`.

