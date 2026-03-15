

## Enrich Gallery: Real Media Content + In-Frame PDF Rendering

### Current State
- 16 approved offerings: 14 text, 2 images, 2 links pointing to `example.com`
- Video playback already works via `VideoCanvas` (native Three.js texture) — just no video content exists
- PDF frames show only a 📄 icon — no actual rendering
- Links point to placeholder URLs
- The Cavapendoli B&W/color model sheets (`/cavapendoli/models-bw.png`, `/cavapendoli/models-b.png`, `/cavapendoli/models-a.png`) were used in the prelude but aren't gallery offerings

### Plan

**1. Enhance PDF rendering in-frame** (`CavapendoGallery.tsx`)
- Create a `PdfCanvas` component that renders the first page of a PDF as a texture using `<canvas>` + pdf.js (via CDN worker)
- Load the PDF, render page 1 to an offscreen canvas, then create a `THREE.CanvasTexture` from it
- This keeps the content viewable without leaving the gallery
- In the modal (`OfferingModal`), embed the PDF in an `<iframe>` for full viewing

**2. Enhance link rendering in-frame** (`CavapendoGallery.tsx`)
- For links, show an embedded `<iframe>` preview inside the `Html` component (small scale, non-interactive on the wall)
- Fallback to current icon+URL display if iframe fails to load
- In the modal, show a clickable iframe or link

**3. Seed rich content into the database** (SQL insert via insert tool)
- Replace the 2 `example.com` links with real, relevant URLs (e.g., Wikipedia page on pendulums, an art-related page)
- Add 2-3 video offerings using free creative commons video URLs (e.g., Pexels/Pixabay hosted .mp4s) — these will play in real-time on the frames via the existing `VideoCanvas`
- Add 1-2 PDF offerings using publicly hosted PDF URLs
- Add the 3 Cavapendoli model sheets as image offerings (`/cavapendoli/models-bw.png`, `/cavapendoli/models-b.png`, `/cavapendoli/models-a.png`) with curatorial context
- All seeded as `status = 'approved'` with `approved_at` set

**4. Increase gallery capacity** (`CavapendoGallery.tsx`)
- Currently capped at 16 frames (`.slice(0, 16)`) — increase to 24 to accommodate the richer content
- Adjust wall distribution logic to handle more frames gracefully

### Files to modify
- **`src/components/CavapendoGallery.tsx`**: Add `PdfCanvas` component, enhance link frame content, bump frame limit from 16 to 24, add pdf.js dynamic import for PDF rendering
- **Database**: INSERT new offerings (videos, PDFs, images of cavapendoli sheets, better links), UPDATE the 2 example.com links to real URLs

### Technical Notes
- For PDF rendering: use `pdfjs-dist` npm package or load pdf.js from CDN via dynamic `<script>` — prefer the npm package for reliability
- Videos already auto-play muted via `VideoCanvas` — no changes needed there
- All new content is admin-manageable via existing `/admin` moderation flow (approve/reject/hide)

