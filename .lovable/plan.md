

## Full Platform Audit & Improvement Plan — Cavapendolandia

### Current State Summary

The platform is a poetic Italian art-submission site with:
- **Homepage** (`/`): 3D CavapendoWorld background, mystical opening text, seahorse logo, nav grid
- **Gallery** (`/galleria`): Full 3D gallery with frames, FPS controls, ambient music, track lights, footsteps
- **Submit flow** (`/offri`): 5-step wizard (media → content → title → author → consent)
- **Content pages**: Che cos'è, Regole, Rimozione, Entra (coming soon placeholder)
- **Admin**: Login, Anticamera (moderation queue), offering detail, initiatives panel
- **Database**: offerings, initiatives, user_roles tables with proper RLS

---

### Issues Found & Improvements

#### A. UX & Navigation (5 items)

1. **"Entra" button on homepage goes to `/che-cose`, not `/entra` or `/galleria`** — The main CTA says "Entra" but links to the explanation page. Meanwhile `/entra` is a dead-end "coming soon" page. Now that the Gallery exists, the "Entra" button should go to `/galleria` and the `/entra` route can redirect there.

2. **No "Offri" link in the header** — The header has Che cos'è, Galleria, Regole, Rimozione but no direct link to submit. This is the primary user action and should be in the nav.

3. **NotFound page is unstyled** — Uses `bg-muted` and bold font, inconsistent with the rest of the platform's delicate aesthetic. Should match the ritual tone.

4. **Step label not displayed in Offri wizard** — The `STEP_LABELS` object is defined but never rendered. Users see dots but not "1 — Scelta" etc. as described in the UX acceptance doc.

5. **Offri navigation: "back" button hidden on step 2** — The condition `step > 1 && step !== 2` means step 2 has no back button. Users who picked the wrong media type can't go back without reloading.

#### B. Content & Polish (4 items)

6. **Prelude says "CAVAPENDOLAND" (missing "IA")** — Line 58 of CavapendoliPrelude shows "CAVAPENDOLAND" instead of "CAVAPENDOLANDIA".

7. **MinimalFooter is empty** — Just an invisible `<footer>` with `aria-hidden`. Could show a subtle "Cavapendolandia · 2026" or link to `/rimozione`.

8. **Homepage "Entra" CTA duplicates nav** — The 4-column grid below already has "Che cos'è", so the main button and the grid link go to the same place. Replace the grid with a cleaner 3-item row (Galleria, Offri, Regole).

9. **Grazie page uses emoji (🏛️) and rounded buttons** — Inconsistent with the rest of the platform. Replace with a subtle SVG icon and match the flat border styling used elsewhere.

#### C. Functional Gaps (3 items)

10. **No offering count badge on admin tabs** — Admin can't see how many items are pending/approved etc. without clicking each tab. Add count badges fetched in a single query.

11. **Gallery doesn't link to individual offering detail pages** — The modal shows content but has no "open full view" link to `/o/:id`. Users in the gallery can't share a specific offering.

12. **No share/copy-link for offerings** — The detail page (`/o/:id`) has no way to copy the URL. A small "copy link" button would help sharing.

#### D. Performance & Technical (3 items)

13. **CavapendoWorld on homepage renders 40 Float particles + Environment preset** — Heavy for mobile. The gallery already has its own 3D scene. Consider reducing particle count on mobile or lazy-loading the Canvas.

14. **Signed URL TTL is 1 hour but no cache** — Every query re-signs URLs. Could cache signed URLs in React Query's stale time (already 5min for initiatives, but offerings refetch on mount).

15. **Duplicate "avanti" button code in Offri** — Steps 2, 3, and 4 each have an identical button block. Extract into a single component.

---

### Implementation Plan

**Phase 1 — Critical UX Fixes** (single batch)
- Fix "Entra" CTA → `/galleria`
- Fix prelude text → "CAVAPENDOLANDIA"
- Add "Offri" link to MinimalHeader
- Show step labels in Offri wizard
- Allow back navigation from step 2
- Redirect `/entra` to `/galleria`
- Restyle NotFound page to match platform

**Phase 2 — Polish**
- Clean up homepage nav grid (3 items: Galleria, Offri, Regole)
- Restyle Grazie page (remove emoji, match flat borders)
- Add subtle footer text
- Extract shared Offri navigation button
- Add "copy link" button on OfferingDetail

**Phase 3 — Admin & Gallery Enhancements**
- Add offering count badges to admin tabs (single RPC or parallel queries)
- Add "open detail" link in gallery modal
- Reduce CavapendoWorld particle count on mobile

### Files to modify
- `src/pages/Index.tsx` — CTA target, nav grid
- `src/pages/Entra.tsx` — redirect to `/galleria`
- `src/pages/Offri.tsx` — step labels, back button, extract nav
- `src/pages/NotFound.tsx` — restyle
- `src/pages/Grazie.tsx` — remove emoji, restyle buttons
- `src/pages/OfferingDetail.tsx` — add copy link
- `src/components/MinimalHeader.tsx` — add Offri link
- `src/components/MinimalFooter.tsx` — add subtle text
- `src/components/CavapendoliPrelude.tsx` — fix "CAVAPENDOLAND" → "CAVAPENDOLANDIA"
- `src/components/CavapendoGallery.tsx` — add detail link in modal
- `src/components/CavapendoWorld.tsx` — reduce mobile particles
- `src/pages/admin/Anticamera.tsx` — count badges on tabs

