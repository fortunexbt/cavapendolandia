

## Fix: Frame Content Overflowing Bounds

### Root Cause
The `Html` component in drei uses `distanceFactor={4}` with `transform`, but the pixel dimensions (`canvasW * 140`) don't produce a 1:1 mapping to the 3D canvas mesh size. The rendered HTML ends up physically larger than the frame's canvas geometry, causing images and text to overflow.

### Solution
**For images/videos**: Replace the `Html` approach entirely with a native Three.js texture applied directly to the canvas mesh. This guarantees pixel-perfect fit within the frame — no scaling math needed.

**For text/audio/link/pdf**: Keep `Html` but fix the scaling by increasing `distanceFactor` to `1.4` (making HTML smaller in 3D space) and reducing the pixel multiplier from `140` to `50`. This maps the HTML content size to match the canvas geometry dimensions.

### Files to modify
- `src/components/CavapendoGallery.tsx`:
  1. **New `ImageCanvas` component** — uses `useLoader(THREE.TextureLoader, url)` to load the image as a texture and applies it as `map` on the canvas mesh material, replacing the Html+img approach
  2. **New `VideoCanvas` component** — uses `THREE.VideoTexture` similarly
  3. **Update `ArtisticFrame`** — for image/video offerings, render the texture-based canvas mesh instead of `Html`; for text and other types, keep `Html` but with corrected `distanceFactor={1.4}` and pixel multiplier `50`
  4. Remove the image/video branches from `FrameContent` since they'll be handled by native meshes

