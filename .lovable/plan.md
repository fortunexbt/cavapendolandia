<final-text>I checked the repo against the live backend snapshot. This is no longer just an env-var issue. The app is now suffering from repo/backend drift plus a couple of concrete runtime bugs.

What I found
- Live data is reaching the app again: offerings + signed media requests succeed, and the latest session replay shows `/galleria` mounting its shell/HUD. So the remaining failures are not “no backend connection”.
- The CMS is wired to the wrong pages: public pages read slugs like `index`, `che-cose`, and `regole`, but `PagesEditor` writes `home`, `about`, `rules`, `removal`, `gallery`. Even when saves succeed, they won’t change the live site.
- `page_content` is also handled incorrectly for multilingual data: reads/writes ignore `locale`, and upsert uses `onConflict: "page_slug,block_key"` while the table is unique on `(page_slug, block_key, locale)`.
- Admin auth/query gating is broken: `useAdmin()` currently treats a null user as admin, which can fire protected admin queries in a logged-out state and make admin pages behave unpredictably.
- The gallery still has a real runtime bug: `CavapendoGallery` renders modal components in a way that triggers Framer/React ref warnings (`DepositModal` / `AnimatePresence`). That matches the console errors you’re seeing.
- The backend likely does need repair work: the live schema snapshot reports no triggers even though the repo expects triggers for offering category and initiative timestamps. That is classic migration drift.
- There is existing data drift too: at least one approved offering has `approved_at = null`, which means older data was not normalized.

Plan
1. Repair backend drift first
- Create one additive migration to restore the missing triggers/functions the repo expects:
  - offering category trigger
  - initiatives `updated_at` trigger
  - `updated_at` triggers for `page_content` and `meadow_elements`
- Run a data fix (not schema migration) to:
  - backfill `approved_at` on approved offerings where it is null
  - copy/normalize legacy CMS slugs (`home/about/rules/removal`) to the live slugs the site actually reads (`index/che-cose/regole/rimozione`)
  - preserve locale/block keys while doing so

2. Make admin stable before anything else
- Fix `src/hooks/useAdmin.ts` so logged-out users are never treated as admins
- Gate all admin-only queries/mutations behind `user && isAdmin`
- Update admin hooks to expose `enabled` + proper `onError` behavior so failures are visible, not silent

3. Make the CMS actually control the site
- Replace the current freeform PagesEditor mapping with the real public-page schema
- Align its page/block options to the actual frontend:
  - `index`: `subtitle`, `description`
  - `che-cose`: `title`, `p1..p4`
  - `regole`: `title`, `rule-0..rule-6`
  - add other real pages only if the frontend reads them
- Fix `pageContentRepo` to read/write by `locale`, use `maybeSingle`, and upsert on `(page_slug, block_key, locale)`
- Invalidate both single-block and page-block queries after save

4. Fix the gallery runtime properly
- Remove the modal/ref misuse causing the current React warnings in `CavapendoGallery` / `modals.tsx`
- Replace optional `.single()` calls with `.maybeSingle()` for empty-state initiative reads so the app stops producing 406 noise
- Re-test the actual gallery flow end-to-end: enter, open modal, submit, exit

5. Finish the editors so they match the database
- Align `PratoEditor` / `meadowElementsRepo` with the full live table shape instead of the current partial model
- Fix approved archive filtering to use the real DB categories (`grafica`, `musicale`, `letteraria`) instead of the current keyword hack

6. Validate the whole website end-to-end
- Re-run full public/admin/gallery E2E
- Fix any stale tests/routes that still reflect the older structure
- Only stop when these flows all work together:
  - homepage + public pages
  - gallery enter/interact/exit
  - submission
  - moderation
  - initiatives
  - Pages CMS persistence
  - Prato editor CRUD
  - messages inbox

Files I already know need changes
- `src/hooks/useAdmin.ts`
- `src/features/content/api/pageContent.repo.ts`
- `src/features/content/hooks/usePageContent.ts`
- `src/features/content/hooks/usePageBlocks.ts`
- `src/pages/admin/PagesEditor.tsx`
- `src/hooks/useActiveInitiative.ts`
- `src/features/initiatives/api/initiatives.repo.ts`
- `src/components/CavapendoGallery.tsx`
- `src/components/cavapendo-gallery/modals.tsx`
- `src/features/meadow/api/meadowElements.repo.ts`
- `src/pages/admin/PratoEditor.tsx`
- `supabase/migrations/*` for the trigger-restoration migration

Bottom line
Yes — something is up on both sides. It is not just the frontend, and yes, backend/migration drift is part of it. The next pass should be a combined code + database + data-normalization fix, then a full E2E verification pass.</final-text>