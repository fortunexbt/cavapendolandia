# Cavapendolandia -- DB Operating Model

## Lovable/Supabase Constraint

### The Problem

Cavapendolandia is hosted on **Supabase via the Lovable platform**. This hosting model imposes a critical constraint:

> **Managed Supabase projects on Lovable do not expose a direct `pg_dump` / `psql` pipeline.**
> You cannot run `pg_dump` locally and pipe it to the remote DB, nor can you connect a local `psql` client directly to the managed Postgres instance.

This is a platform-level restriction: Lovable manages the Supabase project infrastructure, and the connection string is not exposed for direct TCP access from your local machine.

### Impact on Development Workflow

| Workflow | Status | Notes |
|----------|--------|-------|
| Local dev with Supabase CLI link | Available | `supabase link --project-ref XXX` + `supabase db push` works |
| Direct `pg_dump` export | Blocked | No direct DB access |
| SQL Editor (browser) | Available | Manual execution works |
| Migration file versioning | Available | Keep SQL files in `supabase/migrations/` |
| Seed data via SQL Editor | Available | Paste and execute manually |
| Reset DB to clean state | Manual | Requires re-running all migrations |

---

## Migration Workflow

Since direct pipe migrations are blocked, the workflow is:

### 1. Write the Migration

Create a new file in `supabase/migrations/` with a date-stamped name:

```bash
supabase/migrations/YYYYMMDD_description.sql
```

Example: `20260601_add_meadow_tags.sql`

### 2. Apply the Migration

**Option A: Supabase CLI (preferred)**
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```
This pushes local migration files to the linked project.

**Option B: Manual SQL Editor**
1. Open Supabase dashboard -> SQL Editor
2. Copy the full contents of the migration file
3. Paste and execute

### 3. Verify

Check `supabase/migrations/` meta table or verify the change in Table Editor.

### Migration Naming Convention

Use `YYYYMMDD_description.sql` format for chronological ordering:
- `20260227191018_...sql` -- earliest
- `20260305015807_...sql`
- `20260406_...sql` -- later

Apply in this order. All files in the folder should be applied.

### Recommended Practice

1. **Never modify existing migration files** -- only append new ones
2. **Test migrations locally** first if using `supabase start` (local Docker)
3. **Keep migrations idempotent** where possible (`ON CONFLICT DO NOTHING`)
4. **Document breaking changes** in the migration file header comment

---

## Feature Flag Strategy

Since Lovable redeploys on every push to the repo, and some features may not be complete, **feature flags gate incomplete or phase-gated functionality**.

### How It Works

Feature flags are **build-time constants** read from `VITE_*` environment variables in `src/lib/featureFlags.ts`:

```typescript
export const pagesCms: boolean = 
  import.meta.env.VITE_FEATURE_PAGES_CMS === 'true';
```

Changing a flag requires:
1. Update `.env.local` (or environment config)
2. **Rebuild** the app (Vite bundle is recompiled)
3. Redeploy via Lovable

### Available Flags

| Flag | Default | Description |
|------|---------|-------------|
| `VITE_FEATURE_PAGES_CMS` | `false` | CMS page content blocks (`page_content` table, `/admin/pagine`) |
| `VITE_FEATURE_PRATO_EDITOR` | `false` | Prato/background editor (`meadow_elements` table, `/admin/prato`) |
| `VITE_FEATURE_VISITOR_MESSAGES` | `false` | Visitor contact messages (`visitor_messages` table, `/admin/messaggi`) |
| `VITE_FEATURE_I18N` | `false` | Full internationalization (IT/EN, compiled but disabled) |

### Enabling a Flag

1. Add to `.env.local`:
```env
VITE_FEATURE_PAGES_CMS=true
```
2. Rebuild: `npm run build`
3. Deploy (via Lovable)

### Flag Usage in Code

```typescript
import { pagesCms } from '@/lib/featureFlags';

// Conditional rendering
{pagesCms && <PagesEditorLink />}

// Conditional route (in App.tsx)
{pagesCms && <Route path="/admin/pagine" element={<PagesEditor />} />}
```

### Strategy Rationale

- **Build-time flags** avoid runtime complexity and bundle dead code elimination
- **Avoids database feature flags** (no `feature_flags` table needed)
- **Simple env management** -- just `.env` changes
- **Clear on/off** -- no partial states

### Future Consideration

If the project scales, consider moving to a runtime flag system (e.g., a `feature_flags` DB table + React context) to allow toggling without rebuild. Currently not needed for MVP scope.

---

## Database Schema Overview

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `offerings` | User submissions | id, title, content, type, file_path, status, consent_rights, consent_archive, submitted_at |
| `offering_media` | Media attachments | id, offering_id, file_path, mime_type |
| `initiatives` | Curatorial prompts | id, prompt, details, is_active, created_by |
| `user_roles` | Admin role assignments | user_id, role |

### Feature Tables (flagged)

| Table | Feature Flag | Purpose |
|-------|-------------|---------|
| `page_content` | `PAGES_CMS` | CMS blocks for page content |
| `meadow_elements` | `PRATO_EDITOR` | Prato background element config |
| `visitor_messages` | `VISITOR_MESSAGES` | Visitor contact messages |

### Key Constraints

- `offerings.status` is an enum: `pending | approved | hidden | rejected`
- `offering_media` linked to `offerings` via FK
- `initiatives.is_active` controls which initiative shows on homepage
- `user_roles` is the only auth/authorization table (no custom roles beyond `admin`)

---

## RLS (Row Level Security) Summary

Every table has RLS enabled with explicit policies:

- **offerings:** Public can INSERT (with consent). Public can SELECT approved. Admin full access.
- **initiatives:** Public can SELECT active. Admin full access.
- **page_content:** Public can SELECT all. Admin full access.
- **visitor_messages:** Public can INSERT. Admin SELECT/UPDATE. No public read.
- **user_roles:** Admin SELECT/INSERT/DELETE only.

---

## Seed Data

For initial curation, use `supabase/seeds/seed_offerings.sql` -- contains 8-15 text/link offerings meant to establish the tone of the archive.

Run via SQL Editor or `supabase db seed` (if local).
