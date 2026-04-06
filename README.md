# Cavapendolandia

Piattaforma artistica minimale dove chiunque puo lasciare un'offerta su cosa significa "Cavapendoli", con moderazione manuale in Anticamera.

---

## Project Description

Cavapendolandia e un luogo delicato dove le persone lasciano una "cavapendolata" -- un contributo creativo (immagini, suoni, testi, video, link) in risposta alla domanda: "Che cosa significa Cavapendoli per te?"

Il progetto ha un'anima curatoriale: i contributi passano per l'Anticamera (moderazione) prima di essere pubblicati in Galleria.

**Principi:**
- Lingua unica: italiano
- Moderazione sempre manuale
- Nessuna dinamica social (like, commenti, profili pubblici)
- Nessuna opera originale o derivazione riconoscibile nel visual design

---

## Tech Stack

- **Build:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **Data fetching:** TanStack React Query
- **Backend:** Supabase (Postgres, Auth, Storage, RLS, Edge Functions)
- **i18n:** react-i18next (modulo compilato ma disabilitato via feature flag)

---

## Route Map

### Public Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Index | Homepage con animation iniziale e link a Galleria |
| `/galleria` | Galleria | Archivio offerings approvate |
| `/o/:id` | OfferingDetail | Singola offering pubblica |
| `/offri` | Offri | Form 5-step per inviare una cavapendolata |
| `/che-cose` | CheCose | Spiegazione del progetto |
| `/regole` | Regole | Regole di moderazione |
| `/rimozione` | Rimozione | Richiesta rimozione contenuto |
| `/entra` | Entra | Ingresso riservato (attualmente redirect a /admin) |
| `/grazie` | Grazie | Post-invio offering |
| `/contatti` | Contatti | Contatti |

### Admin Routes

| Path | Page | Description |
|------|------|-------------|
| `/admin` | AdminLogin | Login admin con magic link |
| `/admin/offerings/pending` | OfferingsPending | Anticamera -- moderazione pending |
| `/admin/offerings/approved` | OfferingsApproved | Archivio -- offerings approvate |
| `/admin/offerings/hidden` | OfferingsHidden | Offerings nascoste |
| `/admin/offerings/rejected` | OfferingsRejected | Offerings rifiutate |
| `/admin/o/:id` | AdminOfferingDetail | Dettaglio offering admin |
| `/admin/iniziative` | Iniziative | Gestione iniziative curatoriali |
| `/admin/pagine` | PagesEditor | CMS per contenuti page blocks |
| `/admin/prato` | PratoEditor | Editor elementi prato (meadow) |
| `/admin/messaggi` | Messages | Messaggi visitor |

Legacy redirects (maintained for bookmarks):
- `/admin/anticamera` -> `/admin/offerings/pending`
- `/admin/archivio` -> `/admin/offerings/approved`
- `/admin/nascosti` -> `/admin/offerings/hidden`
- `/admin/rifiutati` -> `/admin/offerings/rejected`

---

## Project Structure

```
src/
  App.tsx                    # Router, QueryClient, theme
  main.tsx                   # Entry point
  index.css                  # Global styles, CSS vars
  components/
    shared/                  # PageLayout, ModalBackdrop, SeahorseIcon
    admin/                   # AdminNav, AnticameraOfferingRow, IniziativePanel
    CavapendoWorld.tsx       # Background world (Prato)
    CavapendoliPrelude.tsx   # Opening animation
    InitiativeHint.tsx       # Active initiative display
    OfferingCard.tsx         # Card per galleria
  features/
    offerings/               # Offerings feature
      api/offerings.repo.ts  # Data access layer
    initiatives/             # Initiatives feature
    pages-cms/               # Page content CMS feature
    meadow/                  # Prato editor feature
    visitor-messages/        # Messages feature
  hooks/
    useAdmin.ts              # Admin auth state
    useThemeMode.ts          # Dark/light mode
    useActiveInitiative.ts   # Active initiative hook
  i18n/
    config.ts
    locales/it.json
    locales/en.json
  lib/
    offeringSubmission.ts   # Submission logic
    offeringMedia.ts         # Signed URL helpers
    offeringValidation.ts    # Validation rules
    featureFlags.ts         # Feature flag definitions
    meadowWorld.ts          # Prato background config
    utils.ts                # General utilities
  pages/
    Index.tsx
    Galleria.tsx
    OfferingDetail.tsx
    Offri.tsx
    CheCose.tsx
    Regole.tsx
    Rimozione.tsx
    Entra.tsx
    Grazie.tsx
    Contatti.tsx
    NotFound.tsx
    AdminLogin.tsx
    admin/                   # All admin pages
supabase/
  migrations/               # All schema migrations (apply in order)
  seeds/seed_offerings.sql   # Initial seed data
public/
  cavapendoli/               # Background assets (models-a.png, models-b.png)
  README.txt                 # Background image instructions
```

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create env file

```bash
cp .env.example .env.local
```

### 3. Fill in variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. Apply Supabase migrations

Migrations are in `supabase/migrations/` and must be applied in date-order. Apply via:
- Supabase CLI: `supabase db push`
- Or manually in Supabase SQL Editor

### 5. Bootstrap first admin

1. Go to `/admin` and authenticate with magic link (enter your email)
2. In Supabase SQL Editor, execute:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'YOUR_EMAIL@example.com'
on conflict (user_id, role) do nothing;
```

3. Logout and login again at `/admin`

### 6. (Optional) Seed initial offerings

Run `supabase/seeds/seed_offerings.sql` in the SQL Editor for 8-15 curated test offerings.

### 7. Run

```bash
npm run dev     # Dev server on :8080
npm run build   # Production build
npm run lint    # Lint check
npm run test    # Tests
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key |
| `VITE_DEMO_MODE` | No | `true` = use mock data, bypass DB |
| `VITE_FEATURE_PAGES_CMS` | No | `true` = enable CMS pages feature |
| `VITE_FEATURE_PRATO_EDITOR` | No | `true` = enable prato editor feature |
| `VITE_FEATURE_VISITOR_MESSAGES` | No | `true` = enable visitor messages |
| `VITE_FEATURE_I18N` | No | `true` = enable internationalization |

---

## Demo Mode

Set `VITE_DEMO_MODE=true` in `.env.local` to bypass the database entirely. The app will use mock data:
- 2 demo offerings
- 1 demo initiative

Useful for:
- Theme/UI development without Supabase
- Testing without a live database connection

---

## DB Operating Model (Lovable/Supabase Constraint)

This project is built on **Supabase on the Lovable platform**. This imposes specific constraints:

### Constraint: No Direct DB Access from Migrations

- Lovable/Supabase managed projects **do not allow direct `pg_dump` / `psql` pipelines** for migrations
- Migrations must be applied **manually via the Supabase SQL Editor** or via the Supabase CLI (`supabase db push`)
- All migration files are in `supabase/migrations/` and are numbered by date for ordering

### Implication: Migration Workflow

1. Write migration SQL in `supabase/migrations/YYYYMMDD_description.sql`
2. Apply manually: copy SQL into Supabase SQL Editor and execute
3. Or use `supabase db push` from local (requires linked project)

### Feature Flags for Phase Gating

Since Lovable redeploys on every push, feature flags gate incomplete features:

| Flag | Purpose |
|------|---------|
| `VITE_FEATURE_PAGES_CMS` | Page content CMS blocks |
| `VITE_FEATURE_PRATO_EDITOR` | Prato/background editor |
| `VITE_FEATURE_VISITOR_MESSAGES` | Visitor contact form |
| `VITE_FEATURE_I18N` | Full i18n (currently compiled but disabled) |

### See Also

- `docs/DB_OPERATING_MODEL.md` -- Full explanation of the constraint and workflow
- `docs/MIGRATION_HANDOFF.md` -- Migration handoff template

---

## Storage Buckets

### `offerings` (private bucket, selective public read)

- **Purpose:** User-submitted media (images, audio, video) attached to offerings
- **Access:** Private -- requires signed URLs generated server-side
- **Public read:** Only for offerings with `status = 'approved'`
- **Upload:** Authenticated users via RLS (`consent_rights = true`)
- **Admin:** Full access via RLS admin policies

### `site-assets` (public bucket)

- **Purpose:** Admin-managed static assets -- page content images, meadow billboards, site graphics
- **Access:** Public read, admin-only write/delete
- **File size limit:** 10MB
- **Allowed types:** PNG, JPEG, WebP, SVG

---

## Admin Auth

- **Method:** Supabase Magic Link (email OTP)
- **Required role:** `admin` in `public.user_roles` table
- **Bootstrap:** See "Bootstrap first admin" in Local Setup above
- **Session:** Managed by Supabase Auth, persists across browser sessions

---

## Testing Commands

```bash
npm run lint        # ESLint + TypeScript check
npm run test        # Run tests
npm run build       # Production build
npm run preview     # Preview production build
```

---

## Feature Flags

Feature flags are read at **build time** from `VITE_*` environment variables. Change requires a rebuild.

| Flag | Default | Description |
|------|---------|-------------|
| `VITE_FEATURE_PAGES_CMS` | `false` | Enable CMS-managed page content blocks |
| `VITE_FEATURE_PRATO_EDITOR` | `false` | Enable prato/background editor panel |
| `VITE_FEATURE_VISITOR_MESSAGES` | `false` | Enable visitor contact messages |
| `VITE_FEATURE_I18N` | `false` | Enable internationalization (IT/EN) |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| `docs/ARCHITECTURE.md` | App structure, feature boundaries, gallery architecture, data access, storage contract, layout, routing |
| `docs/DB_OPERATING_MODEL.md` | Lovable/Supabase constraint explanation, migration workflow, feature flag strategy |
| `docs/MIGRATION_HANDOFF.md` | Migration handoff template for new environments |
| `docs/ADMIN_OPERATIONS.md` | Bootstrap admin, manage offerings/initiatives/pages/prato/messages |
| `docs/AGENT_PROMPT.md` | AI agent prompt reflecting new architecture |
| `docs/MODERATION_PLAYBOOK_IT.md` | Moderation playbook (Italian) |
| `docs/GO_NO_GO_CHECKLIST_IT.md` | Go/no-go checklist (Italian) |
| `docs/REVIEW_KIT_ANTONIO_IT.md` | Antonio's review kit (Italian) |
| `docs/UX_ACCEPTANCE_IT.md` | UX acceptance criteria |
| `docs/UX_AUDIT_IT.md` | UX audit notes |

---

## Troubleshooting

### "Database offline" or auth errors

Lovable Supabase instances can go idle. Wait and retry, or check the Supabase dashboard for project status.

### Magic link not arriving

1. Check spam folder
2. Verify the email is correct in Supabase Auth logs
3. For local dev: ensure `VITE_SUPABASE_URL` is correct

### Offerings not appearing in gallery

Check that the offering status is `approved` in the database. Pending, hidden, and rejected offerings are not shown publicly.

### Storage signed URLs expiring

Signed URLs for offerings have a TTL (see `offeringMedia.ts`). If images are not loading, the URL may have expired -- refresh the page.

### Background "faint mode" not working

Copy `public/cavapendoli/models-a.png` and `models-b.png` into place. See `public/cavapendoli/README.txt`.

---

## Security Notes

- **RLS is enabled** on all tables. Every table has explicit policies.
- **Offerings media** is in a private bucket; public read requires a signed URL and only for `status = 'approved'`.
- **Site-assets** bucket is public-read but admin-only write.
- **No admin role assignment** via self-service -- requires direct SQL by an existing admin.
- **Consent fields** (`consent_rights`, `consent_archive`) are required for offering submission.
- **No original artwork** in the visual design -- all assets are generic/fictional.
