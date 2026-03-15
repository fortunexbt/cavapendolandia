

## Mobile Gallery Optimization

### Issues from screenshot
1. **Hint tooltip too large and obstructive** — the "👆 Joystick sinistro: muoviti..." hint takes up too much space, overlaps joystick area
2. **Bottom UI bar cluttered** — audio button, hint text, and "Lascia una cavapendolata" CTA all compete for space on a 390px-wide screen
3. **Joysticks may be too large / poorly positioned** — RADIUS=50 with bottom-8 positioning leaves little room
4. **"Lascia una cavapendolata" button too wide** on mobile — pushes into joystick zone

### Plan

**File: `src/components/CavapendoGallery.tsx`**

#### 1. Shrink & simplify mobile hint
- Make the mobile hint much shorter: just "Muovi · Guarda · Tocca un quadro"
- Reduce font size on mobile, add `max-w-[200px]` or similar
- Reduce auto-hide timer from 8s → 4s on mobile
- Position it at top-center instead of bottom-left (to avoid joystick overlap)

#### 2. Reorganize mobile bottom UI
- Move the "Lascia una cavapendolata" CTA to top-right (below header) on mobile, as a small floating pill
- Keep audio toggle bottom-left but make it smaller on mobile
- Remove mode toggle on mobile (already hidden, confirmed)
- The hint text should NOT be in the bottom bar on mobile

#### 3. Optimize joystick sizing
- Reduce RADIUS from 50 → 40 on mobile for more screen real estate
- Reduce stick size from 40px → 32px
- Move joysticks slightly lower: `bottom-6` instead of `bottom-8`

#### 4. Mobile-specific layout tweaks
- Pass `isMobile` context to avoid rendering desktop-only elements
- Ensure modals (offering + creature) use `max-h-[80vh] overflow-y-auto` on mobile
- Make the CTA text shorter on mobile: "+ Offri" instead of "+ Lascia una cavapendolata"

### Files to modify
- `src/components/CavapendoGallery.tsx` — all changes in one file

