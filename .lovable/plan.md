

## Fixes: Gallery Fullscreen + Global Dark/Light Toggle

### 1. Gallery — Remove border & fill screen

**File: `src/pages/Galleria.tsx`**
- Remove the `container`, `px-4`, `pt-24`, `pb-8` wrapper — gallery should fill the viewport edge-to-edge
- Remove the `border border-border/30 rounded-lg` frame around the canvas
- Change from `70vh` fixed height to full remaining viewport (`calc(100vh - header)` or `flex-1`)
- Remove `MinimalFooter` — not needed on an immersive page
- Keep the title/subtitle overlay but position it absolutely over the canvas (or remove it since the gallery has its own enter prompt)

### 2. Dark/Light toggle in MinimalHeader

**File: `src/components/MinimalHeader.tsx`**
- Import `useThemeMode` (already exists, currently only used by admin)
- Change the storage key in `useThemeMode` from `cavapendolandia-admin-theme` to `cavapendolandia-theme` so it's site-wide
- Add a small Sun/Moon toggle button in the header nav area (right side, after nav links)
- On click: cycle system → light → dark, or simpler: toggle light/dark
- Use a simple icon button (Sun for light, Moon for dark) — minimal, matches the aesthetic

### 3. Apply theme globally on app load

**File: `src/App.tsx`**
- Call `useThemeMode()` at the top level so the dark class is applied on mount for all pages, not just admin

### Files to modify
- `src/pages/Galleria.tsx` — remove border/padding, make fullscreen
- `src/hooks/useThemeMode.ts` — rename storage key to site-wide
- `src/components/MinimalHeader.tsx` — add theme toggle icon
- `src/App.tsx` — call `useThemeMode` at root level

