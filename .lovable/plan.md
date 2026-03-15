

## Pre-prod fixes

Two small issues to clean up:

### 1. Fix React ref warning on OfferingModal

The console shows: *"Function components cannot be given refs"* from `OfferingModal`.

**Root cause:** `AnimatePresence` wraps the modal content but the component returns `null` early when `offering` is null, which means AnimatePresence never sees the exit. The fix is to move `AnimatePresence` outside the null check and key the inner `motion.div` on the offering id, so exit animations work properly and the ref warning goes away.

**File:** `src/components/CavapendoGallery.tsx`
- Move `AnimatePresence` to the call site (line ~2200), wrap `OfferingModal` content with a keyed conditional inside AnimatePresence
- Remove the inner `AnimatePresence` from the `OfferingModal` function body

### 2. Add `max-h-[80vh] overflow-y-auto` to OfferingModal

The creature modal already has this, but the offering modal (line 1792) is missing it — on mobile with long content it could overflow the screen.

**File:** `src/components/CavapendoGallery.tsx` (line 1792)
- Add `max-h-[80vh] overflow-y-auto` to the inner modal div className

### Files to modify
- `src/components/CavapendoGallery.tsx` — both fixes in one file

