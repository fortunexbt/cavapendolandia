

## Root Cause (Confirmed)

The entire site is broken because **every Supabase request hits `placeholder.supabase.co`**. Console proves it:
```
[Cavapendolandia] Missing Supabase env vars
GET https://placeholder.supabase.co/rest/v1/initiatives → Failed to fetch
GET https://placeholder.supabase.co/rest/v1/page_content → Failed to fetch
GET https://placeholder.supabase.co/rest/v1/offerings → Failed to fetch
```

This kills: homepage offerings, initiatives, page content (CheCose/Regole), gallery (no offerings to render → black/empty scene), admin, everything.

### Why

`vite.config.ts` uses `loadEnv()` + `define:` to hardcode env vars at build time:
```ts
const env = loadEnv(mode, process.cwd(), "");
define: {
  "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL || ""),
  ...
}
```

Two bugs here:
1. **No `.env` file exists** in the Lovable build environment. The platform exposes env vars via `process.env`, not `.env` files. `loadEnv()` returns `{}`, so the bundle gets `""`, which falls back to `placeholder.supabase.co`.
2. **Wrong key name**: platform provides `VITE_SUPABASE_ANON_KEY`, but the code reads `VITE_SUPABASE_PUBLISHABLE_KEY`.

The previous "feature flags" edit to `vite.config.ts` introduced/perpetuated this `define:` block, which clobbers Lovable's automatic env injection.

## Fix

### Step 1: Remove the `define:` block from `vite.config.ts`

Delete the Supabase entries from `define:` entirely. Lovable's build pipeline injects `VITE_*` vars into `import.meta.env` automatically — `define:` is overriding that injection with empty strings. Keep only the three feature flags (`VITE_FEATURE_*`) since those are the legitimate use of `define:`.

Also remove the unused `loadEnv` import.

### Step 2: Update `src/integrations/supabase/client.ts` to read both possible key names

The platform provides `VITE_SUPABASE_ANON_KEY`; existing code expects `VITE_SUPABASE_PUBLISHABLE_KEY`. Read both as fallback so it works regardless of which one is set:

```ts
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "placeholder-anon-key";
```

(Note: per project rules `client.ts` is auto-generated, but it currently contains a custom warning block already — same line will be regenerated. If regeneration overwrites this, the env injection alone in Step 1 will suffice because the platform writes the canonical `VITE_SUPABASE_PUBLISHABLE_KEY` into the generated file.)

### Step 3: Verify

After the edit, the rebuild will pick up the platform-injected `VITE_SUPABASE_URL` = `https://sasjrpdecjwmdxoyepas.supabase.co` and the real anon key. Then:
- Homepage offerings load
- Gallery shows real frames (no longer black/empty)
- CheCose/Regole content renders
- Admin works
- Initiatives load

No other code changes are needed — the codebase itself is fine; it's the build config that's poisoning the bundle.

## Files Changed

- `vite.config.ts` — remove Supabase entries + `loadEnv` from `define:` block
- `src/integrations/supabase/client.ts` — accept both `VITE_SUPABASE_ANON_KEY` and `VITE_SUPABASE_PUBLISHABLE_KEY` as fallback

