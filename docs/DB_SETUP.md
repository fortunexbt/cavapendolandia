# Cavapendolandia - Database Setup Notes

## What's Done

### Demo Mode
- Added `VITE_DEMO_MODE=true` to bypass database for testing
- Mock data shows 2 demo offerings + 1 demo initiative
- Works without Supabase connection

### Admin Auth
- Changed from magic link to password auth
- Credentials hardcoded: `cavapendoli@gmail.com` / `barbantni`
- Uses Supabase Auth

### Initiatives System
- Admin can create "initiatives" (curatorial prompts/hints)
- Active initiative shows on public homepage as a "hint"
- 3 states: prompt, details (optional), is_active

## What Needs Fixing When DB Returns

1. **Supabase Database** - Currently unavailable, resets tomorrow
2. **Admin Login** - Will work with real credentials once DB is up
3. **Offerings CRUD** - All moderation features need DB
4. **Initiatives table** - Need to create in Supabase:

```sql
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  details TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

4. **RLS policies** - Need to set up for initiatives table

## Demo Mode Usage

For local testing without DB:
```bash
echo "VITE_DEMO_MODE=true" >> .env
npm run dev
```
