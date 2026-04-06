# Cavapendolandia -- Migration Handoff Template

Use this template when setting up a new Supabase environment (new Lovable project, reset, new developer machine).

---

## Pre-Flight Checklist

- [ ] Supabase project created and accessible at `https://PROJECT_REF.supabase.co`
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` obtained from Supabase -> Project Settings -> API
- [ ] Local `.env.local` updated with credentials
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Optional: `supabase link` established

---

## Step 1: Apply All Migrations

Migrations are stored in `supabase/migrations/` and must be applied **in chronological order**. There are 11 migration files.

### Method A: Supabase CLI (Recommended)

```bash
cd /Users/fortune/cavapendolandia
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

This will apply all pending migrations to the linked project.

### Method B: Manual SQL Editor

For each migration file (in date order), copy the SQL content and paste into Supabase SQL Editor -> Execute:

```
supabase/migrations/20260227191018_53da12a6-8744-4cf5-8209-06735bc7b9c2.sql
supabase/migrations/20260227191032_28726f57-08f7-4b8a-8ade-32c3389b3dbe.sql
supabase/migrations/20260227203500_hardening_and_privacy.sql
supabase/migrations/20260305015807_1eba2a67-ead6-4df8-8027-93c0e0ddc2d7.sql
supabase/migrations/20260306134435_74049997-5046-474b-8a72-d2425f9a3e3b.sql
supabase/migrations/20260406_category_offerings.sql
supabase/migrations/20260406_meadow_elements.sql
supabase/migrations/20260406_page_content_cms.sql
supabase/migrations/20260406_site_assets_bucket.sql
supabase/migrations/20260406_visitor_messages.sql
```

> Note: `20260306134435_74049997-5046-474b-8a72-d2425f9a3e3b.sql` depends on `20260305015807_1eba2a67-ead6-4df8-8027-93c0e0ddc2d7.sql` (initiatives table creation).

---

## Step 2: Verify Tables Created

In Supabase Table Editor, confirm these tables exist:

- [ ] `offerings`
- [ ] `initiatives`
- [ ] `user_roles`
- [ ] `offering_media`
- [ ] `page_content` (feature flag: `PAGES_CMS`)
- [ ] `meadow_elements` (feature flag: `PRATO_EDITOR`)
- [ ] `visitor_messages` (feature flag: `VISITOR_MESSAGES`)

---

## Step 3: Verify Storage Buckets

In Supabase Storage, confirm these buckets exist:

- [ ] `offerings` -- private bucket, for user-submitted media
- [ ] `site-assets` -- public bucket, for admin-managed assets

For each bucket, verify RLS policies allow the expected access (offerings: selective; site-assets: public read + admin write).

---

## Step 4: Bootstrap First Admin

1. Go to your running app -> `/admin`
2. Enter your email and request a magic link
3. Open the magic link in your email (opens `/admin`)
4. In Supabase SQL Editor, execute:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'YOUR_EMAIL@example.com'
on conflict (user_id, role) do nothing;
```

5. **Logout and log back in** via the magic link flow
6. Confirm you see the admin navigation panel

---

## Step 5: Seed Initial Data (Optional)

To populate with curated test offerings (8-15 items):

In Supabase SQL Editor, execute:
```sql
\i supabase/seeds/seed_offerings.sql
```

Or copy-paste the contents of `supabase/seeds/seed_offerings.sql` and execute.

---

## Step 6: Configure Feature Flags (If Applicable)

If you need to enable any flagged features, add to `.env.local`:

```env
VITE_FEATURE_PAGES_CMS=true
VITE_FEATURE_PRATO_EDITOR=true
VITE_FEATURE_VISITOR_MESSAGES=true
```

Then rebuild: `npm run build`

---

## Step 7: Verify End-to-End Flow

Test the core user journey:

1. [ ] Homepage loads (`/`)
2. [ ] Gallery shows offerings (`/galleria`)
3. [ ] Submission form works (`/offri`) -- submit an offering
4. [ ] Offering appears in Anticamera (`/admin/offerings/pending`)
5. [ ] Admin can approve/reject
6. [ ] Approved offering appears in gallery
7. [ ] Admin can create an initiative (`/admin/iniziative`)
8. [ ] Active initiative shows on homepage

---

## Troubleshooting

### "Table does not exist" errors

Migrations were not applied. Apply all migrations in order (see Step 1).

### Magic link auth not working

1. Check Supabase Auth settings (enable email magic link)
2. Check email inbox + spam
3. Check `VITE_SUPABASE_URL` is correct in `.env.local`

### Storage "access denied" errors

1. Verify `offerings` and `site-assets` buckets exist
2. Verify RLS policies are correct (migrations must be applied)
3. Check that the signed URL TTL hasn't expired

### DB "offline" or connection refused

Managed Supabase can go idle. Wait 30 seconds and retry. Check Lovable dashboard for project status.

---

## Migration File Reference

| File | Purpose | Dependencies |
|------|---------|-------------|
| `20260227191018_...sql` | Initial schema: offerings, offering_media, user_roles | None |
| `20260227191032_...sql` | Additional base schema | 20260227191018 |
| `20260227203500_...sql` | Hardening + privacy enhancements | 20260227191032 |
| `20260305015807_...sql` | Initiatives table | 20260227203500 |
| `20260306134435_...sql` | Fix RLS policies to PERMISSIVE | 20260305015807 |
| `20260406_category_offerings.sql` | Category field for offerings | 20260306134435 |
| `20260406_meadow_elements.sql` | Meadow/Prato elements table | 20260306134435 |
| `20260406_page_content_cms.sql` | Page content CMS table | 20260306134435 |
| `20260406_site_assets_bucket.sql` | Site-assets storage bucket | 20260306134435 |
| `20260406_visitor_messages.sql` | Visitor messages table | 20260306134435 |
| `seeds/seed_offerings.sql` | Initial curated offerings seed | All above |
