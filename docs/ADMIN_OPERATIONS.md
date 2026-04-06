# Cavapendolandia -- Admin Operations Guide

## Bootstrap First Admin

### Prerequisites
- User must have authenticated at least once via `/admin` (magic link)
- You have access to the Supabase SQL Editor

### Steps

1. **Authenticate the user:** Have the user go to `/admin` and enter their email -> request magic link -> click the link in their inbox

2. **Identify the user in Supabase SQL Editor:**

```sql
select id, email, created_at
from auth.users
where email = 'TARGET_EMAIL@example.com';
```

3. **Assign admin role:**

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'TARGET_EMAIL@example.com'
on conflict (user_id, role) do nothing;
```

4. **Verify:** The user should logout and log back in. They should now see the full admin navigation panel at `/admin`.

### Adding Additional Admins

Same process -- any existing admin can bootstrap new admins by running the SQL above with the new user's email.

---

## Managing Offerings

### Offerings Workflow

```
User submits at /offri
       ↓
offering created with status = 'pending'
       ↓
Admin reviews in Anticamera (/admin/offerings/pending)
       ↓
[Approve] → status = 'approved' → visible in gallery
[Reject]  → status = 'rejected' → not shown, can be re-reviewed
[Hide]    → status = 'hidden'   → not shown publicly but can be restored
```

### Anticamera (Pending Offerings)

URL: `/admin/offerings/pending`

- Lists all offerings with `status = 'pending'`
- Each row shows: title, type badge, submission date, preview
- Actions per offering:
  - **Approve** -- sets `status = 'approved'`, moves to gallery
  - **Reject** -- sets `status = 'rejected'`
  - **View detail** -- `/admin/o/:id` for full review

### Approve an Offering

1. Go to `/admin/offerings/pending`
2. Click the offering row or "Approve" button
3. Confirm -- status changes to `approved`
4. Offering immediately visible in public gallery at `/galleria`

### Reject an Offering

1. Go to `/admin/offerings/pending`
2. Click "Reject" on the offering
3. Optionally add a rejection reason (if implemented in UI)
4. Status changes to `rejected`

### Hide an Offering (from gallery)

1. Go to `/admin/offerings/approved` (or detail page)
2. Click "Hide"
3. Status changes to `hidden`
4. Offering removed from public gallery but record preserved

### Restore a Hidden/Rejected Offering

1. Go to `/admin/offerings/hidden` or `/admin/offerings/rejected`
2. Click "Restore" or "Approve"
3. Status changes to `approved` or `pending`

### Delete an Offering

- From detail page (`/admin/o/:id`), click "Delete"
- This permanently removes the record from `offerings` table
- Associated media in `offerings` bucket is **not** auto-deleted (manual cleanup in Storage)

---

## Managing Initiatives

### What are Initiatives?

Initiatives are curatorial prompts displayed on the homepage. They invite visitors to respond to a specific theme or question.

### Create an Initiative

1. Go to `/admin/iniziative`
2. Fill in:
   - **Prompt** (required): The invitation text shown on homepage
   - **Details** (optional): Additional context, displayed on hover or click
3. Save

### Activate an Initiative

Only one initiative can be active at a time.

1. Go to `/admin/iniziative`
2. Find the initiative you want to activate
3. Click "Activate" (sets `is_active = true`)
4. Previous active initiative is automatically deactivated

### Deactivate an Initiative

1. Go to `/admin/iniziative`
2. Click "Deactivate" on the active initiative
3. Homepage will no longer show the initiative hint

### Delete an Initiative

- From the initiatives panel, click "Delete"
- Active initiatives cannot be deleted -- deactivate first

---

## Managing Pages (CMS)

Requires feature flag: `VITE_FEATURE_PAGES_CMS=true`

### Page Content CMS

The CMS manages structured content blocks for pages. Each block has:
- `page_slug`: Which page (e.g., `che-cose`, `regole`)
- `block_key`: Identifier for the block within the page
- `locale`: Language (`it`, `en`)
- `eyebrow`, `title`, `body_text`, `image_path`, `cta_label`, `cta_href`
- `sort_order`: Display order
- `is_enabled`: Whether to show

### Edit a Page Block

1. Go to `/admin/pagine`
2. Select the page from the sidebar (e.g., "Che Cose")
3. Edit the content fields
4. Save -- changes immediately available on the public page

### Add a New Block

1. Go to `/admin/pagine`
2. Click "Add Block"
3. Set page slug, block key, and content
4. Save

### Image Upload for CMS

Images uploaded via the CMS editor go to the **`site-assets`** bucket. They are publicly readable.

---

## Managing Prato (Background Editor)

Requires feature flag: `VITE_FEATURE_PRATO_EDITOR=true`

### Prato Editor

The prato (meadow) editor manages background visual elements displayed on the homepage and gallery.

### Access

1. Go to `/admin/prato`
2. Shows current meadow configuration and elements

### Configure Meadow Elements

The meadow is configured via the `meadow_elements` table. Elements define:
- Element type (shape, image, text)
- Position (x, y)
- Animation parameters
- Visibility conditions

### Background Assets

Background images for the meadow should be uploaded to **`site-assets`** bucket with a clear naming convention (e.g., `meadow/billboard-1.png`).

---

## Managing Visitor Messages

Requires feature flag: `VITE_FEATURE_VISITOR_MESSAGES=true`

### Visitor Messages

When visitors use the contact form (`/contatti`), their messages are stored in `visitor_messages` table.

### View Messages

1. Go to `/admin/messaggi`
2. Shows all messages with:
   - Sender name and email
   - Category (domanda, richiesta, feedback)
   - Status (unread, read, archived)
   - Timestamp

### Mark as Read

1. Click on a message or use the "Mark Read" action
2. Status changes to `read`

### Archive a Message

1. Click "Archive" on a message
2. Status changes to `archived`
3. Archived messages can still be viewed via a filter

### Reply to a Visitor

The system does **not** have a built-in reply mechanism. To reply:
1. Note the sender's email from the message
2. Use your email client to respond directly

---

## Admin Navigation Structure

The admin sidebar (`AdminNav`) organizes sections:

```
Offerings
  /admin/offerings/pending     (Anticamera)
  /admin/offerings/approved     (Archivio)
  /admin/offerings/hidden       (Nascosti)
  /admin/offerings/rejected     (Rifiutati)

Content
  /admin/iniziative            (Iniziative)
  /admin/pagine                (Pagine CMS)
  /admin/prato                 (Prato Editor)

Tools
  /admin/messaggi              (Messaggi)
```

---

## Admin Login Troubleshooting

### Magic link not arriving
1. Check spam folder
2. Verify email in Supabase Auth logs
3. Ensure `VITE_SUPABASE_URL` is correct

### Logged in but no admin panel
1. Confirm your email has `admin` role in `public.user_roles`:
```sql
select * from public.user_roles where user_id = auth.uid();
```
2. If no rows, you are not an admin -- follow Bootstrap steps

### Session expired
- Magic link sessions expire. Log out and log back in via `/admin`.
