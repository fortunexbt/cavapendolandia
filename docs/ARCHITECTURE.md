# Cavapendolandia -- Architecture

## App Structure

```
src/
  App.tsx                    # Root: QueryClient, BrowserRouter, Routes, AnimatePresence
  main.tsx                   # I18nextProvider + createRoot
  index.css                  # CSS variables, Tailwind base
  components/
    shared/PageLayout.tsx     # Shared page shell (MinimalHeader + MinimalFooter)
    shared/ModalBackdrop.tsx  # Modal overlay
    shared/SeahorseIcon.tsx   # Branding icon (SVG)
    admin/AdminNav.tsx        # Admin sidebar navigation
    admin/AnticameraOfferingRow.tsx
    admin/IniziativePanel.tsx
    admin/AdminThemeToggle.tsx
    CavapendoliPrelude.tsx   # Opening animation (entry gate)
    CavapendoWorld.tsx        # Prato background (canvas/sprite world)
    InitiativeHint.tsx        # Active initiative callout on homepage
    OfferingCard.tsx          # Gallery card component
  features/
    offerings/               # Offerings feature module
      api/offerings.repo.ts   # Data access: fetch, create, update offering
    initiatives/             # Initiatives feature module
    pages-cms/              # Page content CMS feature module
    meadow/                  # Prato editor feature module
    visitor-messages/        # Visitor messages feature module
  pages/
    Index.tsx                # Homepage
    Galleria.tsx             # Approved offerings archive
    OfferingDetail.tsx       # Public offering detail
    Offri.tsx                # 5-step submission form
    CheCose.tsx / Regole.tsx / Rimozione.tsx / Entra.tsx / Grazie.tsx / Contatti.tsx
    NotFound.tsx
    AdminLogin.tsx           # Magic link auth
    admin/                   # All admin sub-pages (lazy loaded)
  hooks/
    useAdmin.ts              # Admin auth state + role check
    useThemeMode.ts          # dark/light class toggle
    useActiveInitiative.ts   # Fetch active initiative
  lib/
    featureFlags.ts          # VITE_FEATURE_* flag definitions
    offeringSubmission.ts    # Submission flow orchestration
    offeringMedia.ts         # Signed URL helpers for offerings bucket
    offeringValidation.ts    # Client-side validation rules
    meadowWorld.ts           # Prato background configuration
    utils.ts                 # General utilities
  i18n/
    config.ts                # i18next configuration
    locales/it.json
    locales/en.json
integrations/
  supabase/client.ts         # Supabase browser client singleton
```

---

## Feature Boundaries

The codebase is organized into **feature modules** under `src/features/`. Each feature is self-contained with its own data access, types, and UI components where possible.

### Current Features

| Feature | Flag | Tables | Storage |
|---------|------|--------|---------|
| **offerings** | Always on | `offerings`, `offering_media` | `offerings` bucket |
| **initiatives** | Always on | `initiatives` | None |
| **pages-cms** | `VITE_FEATURE_PAGES_CMS` | `page_content` | `site-assets` bucket |
| **meadow** (prato) | `VITE_FEATURE_PRATO_EDITOR` | `meadow_elements` | `site-assets` bucket |
| **visitor-messages** | `VITE_FEATURE_VISITOR_MESSAGES` | `visitor_messages` | None |

### offerings Feature

The core feature. Handles:
- Public submission form (5 steps: type, content, media, consents, review)
- Gallery browsing (approved only)
- Offering detail page
- Admin moderation workflow (pending/approved/hidden/rejected)

Data flow:
1. User submits via `/offri` form
2. `offeringSubmission.ts` validates + inserts into `offerings` with `status = 'pending'`
3. Media uploaded to `offerings` bucket with restricted access
4. Admin reviews in Anticamera, updates status
5. Approved offerings get signed URLs for public display

### initiatives Feature

Curatorial prompts shown on homepage. Admin creates/edits in `/admin/iniziative`. One active at a time, displayed via `InitiativeHint.tsx`.

### pages-cms Feature (Feature Flag: `PAGES_CMS`)

CMS blocks for structured page content. Allows admin to define per-page content blocks (eyebrow, title, body, image, CTA) stored in `page_content` table with locale support.

### meadow Feature (Feature Flag: `PRATO_EDITOR`)

Admin can edit background meadow elements. Stores element definitions in `meadow_elements` table, served as configuration to `CavapendoWorld.tsx`.

### visitor-messages Feature (Feature Flag: `VISITOR_MESSAGES`)

Visitor contact form that creates records in `visitor_messages` table. Admin views/replies in `/admin/messaggi`.

---

## Gallery Architecture

### Gallery Page (`/galleria`)

- Fetches all offerings with `status = 'approved'` via `offerings.repo.ts`
- Uses TanStack Query for caching and background refetch
- Renders `OfferingCard` grid
- Background: `CavapendoWorld` component (Prato)

### Offering Detail (`/o/:id`)

- Fetches single offering by ID (only approved visible publicly)
- Renders full content with signed media URL
- Linked from gallery cards

### OfferingCard

- Shows preview thumbnail (signed URL from `offerings` bucket)
- Title, type badge, truncated content
- Links to `/o/:id`

### Media Handling

All user-submitted media lives in the **`offerings` bucket** (private). Access flow:

1. Public user fetches offering list/detail from Postgres (via RLS: approved only)
2. Media stored as `file_path` in `offerings` table (not a direct URL)
3. Frontend calls `getOfferingMediaUrl()` which generates a **signed URL** (TTL ~1 hour)
4. Signed URL used as `src` for media elements
5. If TTL expires, refresh by re-fetching or re-signing

See `src/lib/offeringMedia.ts` and `src/features/offerings/api/offerings.repo.ts`.

---

## Data Access Layer

### Supabase Client

`src/integrations/supabase/client.ts` exports the browser Supabase client singleton.

### offerings.repo.ts

The primary data access module for offerings:

```typescript
// Public reads
getApprovedOfferings(): Promise<Offering[]>
getOfferingById(id: string): Promise<Offering | null>

// Admin writes
createOffering(data): Promise<Offering>
updateOfferingStatus(id, status): Promise<void>
hideOffering(id): Promise<void>
rejectOffering(id): Promise<void>

// Media
getOfferingMediaUrl(offering): Promise<string | null>  // signed URL
```

All functions use the Supabase client with RLS enforced server-side.

### RLS Policy Summary

| Table | Public Read | Authenticated Read | Admin Write | Insert |
|-------|-------------|-------------------|-------------|--------|
| `offerings` | approved only | approved only | full | consent=true, status=pending |
| `initiatives` | active only | active only | full | admin |
| `page_content` | all | all | admin | admin |
| `visitor_messages` | none | admin | admin | public |
| `user_roles` | none | admin | admin | self or admin |

---

## Storage Contract

### `offerings` Bucket

- **Visibility:** Private
- **Public read:** No (only via signed URLs for approved offerings)
- **Upload:** Authenticated, requires `consent_rights = true`, `consent_archive = true`
- **Path convention:** `{offering_id}/{filename}`
- **Signed URL TTL:** 3600 seconds (1 hour)
- **File size limit:** Defined in RLS / bucket policy (typically 50MB)
- **Allowed types:** Image, audio, video, PDF (as link)

### `site-assets` Bucket

- **Visibility:** Public
- **Public read:** Yes (anyone can read)
- **Upload/Delete:** Admin only (via RLS `user_roles` check)
- **Purpose:** Page CMS images, meadow billboards, static branding assets
- **File size limit:** 10MB
- **Allowed types:** PNG, JPEG, WebP, SVG

---

## Layout Architecture

### Public Pages

All public pages share a similar shell:
- `MinimalHeader`: Logo + navigation links
- `CavapendoliPrelude`: Full-screen opening animation (skipped on repeat visits via sessionStorage)
- `CavapendoWorld`: Animated background (Prato)
- `MinimalFooter`: Footer

### Admin Pages

Admin pages use:
- `AdminNav`: Left sidebar with navigation sections (Offerings, Iniziative, Pagine, Prato, Messaggi)
- No public header/footer (clean admin UI)
- Dark-adapted theme via `useThemeMode`

### Page Layout Component (`shared/PageLayout`)

Provides consistent padding, max-width, and centered content wrapper for public pages that need it.

---

## Routing

Routes are defined in `src/App.tsx` using React Router v6.

### Route Conventions

- **Public routes:** Under `/`, wrap with `RouteBoundary` (Suspense + loading fallback)
- **Admin routes:** Under `/admin/`
- **Legacy redirects:** From old paths (e.g. `/admin/anticamera`) to new (e.g. `/admin/offerings/pending`)
- **Lazy loading:** All page components are lazy-loaded for code splitting
- **Prelude:** Shown on all non-admin routes via `showPrelude = !pathname.startsWith('/admin')`

### Route Groups

| Group | Path Pattern | Shared UI |
|-------|-------------|-----------|
| Public | `/`, `/galleria`, `/o/:id`, `/offri`, `/che-cose`, `/regole`, `/rimozione`, `/entra`, `/grazie`, `/contatti` | Prelude + Header + Prato |
| Admin | `/admin/*` | AdminNav, no Prelude |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Router, providers, all route definitions |
| `src/features/offerings/api/offerings.repo.ts` | Offerings data access |
| `src/lib/offeringMedia.ts` | Signed URL generation for offerings bucket |
| `src/lib/featureFlags.ts` | Feature flag definitions |
| `src/components/CavapendoWorld.tsx` | Prato background |
| `src/components/CavapendoliPrelude.tsx` | Entry animation |
| `src/hooks/useAdmin.ts` | Admin auth + role checking |
| `supabase/migrations/` | All schema migrations |
