-- CMS for structured page content blocks
CREATE TABLE public.page_content (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null,
  block_key text not null,
  locale text not null default 'it',
  eyebrow text,
  title text,
  body_text text,
  image_path text,
  cta_label text,
  cta_href text,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  updated_by uuid,
  updated_at timestamptz not null default now(),
  unique (page_slug, block_key, locale)
);

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_page_content" ON public.page_content
  FOR SELECT USING (true);
CREATE POLICY "admin_write_page_content" ON public.page_content
  FOR ALL USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
