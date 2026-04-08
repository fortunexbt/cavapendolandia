
-- 1. offering_category enum + column + trigger
CREATE TYPE public.offering_category AS ENUM ('grafica', 'musicale', 'letteraria');

ALTER TABLE public.offerings 
ADD COLUMN IF NOT EXISTS category public.offering_category;

UPDATE public.offerings 
SET category = 
  CASE 
    WHEN media_type IN ('image', 'pdf') THEN 'grafica'::public.offering_category
    WHEN media_type IN ('audio', 'video') THEN 'musicale'::public.offering_category
    WHEN media_type IN ('text', 'link') THEN 'letteraria'::public.offering_category
  END
WHERE category IS NULL AND media_type IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_offering_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category IS NULL AND NEW.media_type IS NOT NULL THEN
    NEW.category := 
      CASE 
        WHEN NEW.media_type IN ('image', 'pdf') THEN 'grafica'::public.offering_category
        WHEN NEW.media_type IN ('audio', 'video') THEN 'musicale'::public.offering_category
        WHEN NEW.media_type IN ('text', 'link') THEN 'letteraria'::public.offering_category
      END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS offering_category_trigger ON public.offerings;
CREATE TRIGGER offering_category_trigger
  BEFORE INSERT OR UPDATE ON public.offerings
  FOR EACH ROW EXECUTE FUNCTION public.set_offering_category();

-- 2. meadow_elements table
CREATE TYPE public.meadow_element_type AS ENUM ('tree', 'monolith', 'lantern', 'billboard');

CREATE TABLE public.meadow_elements (
  id uuid primary key default gen_random_uuid(),
  element_type public.meadow_element_type not null default 'tree',
  label text,
  position_x double precision not null default 0,
  position_z double precision not null default 0,
  scale double precision not null default 1.5,
  rotation double precision not null default 0,
  tone text not null default '#5c7d43',
  secondary_tone text,
  height double precision not null default 8,
  canopy double precision,
  image_path text,
  config_json jsonb not null default '{}'::jsonb,
  is_hidden boolean not null default false,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

ALTER TABLE public.meadow_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_meadow_elements" ON public.meadow_elements
  FOR SELECT USING (true);
CREATE POLICY "admin_write_meadow_elements" ON public.meadow_elements
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 3. page_content table
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
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 4. visitor_messages table (columns aligned with existing code: visitor_name, visitor_email, is_read)
CREATE TYPE public.visitor_message_category AS ENUM ('domanda', 'richiesta', 'feedback');

CREATE TABLE public.visitor_messages (
  id uuid primary key default gen_random_uuid(),
  visitor_name text,
  visitor_email text,
  message text not null,
  category public.visitor_message_category not null,
  is_read boolean not null default false,
  locale text not null default 'it',
  created_at timestamptz not null default now()
);

ALTER TABLE public.visitor_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_visitor_messages" ON public.visitor_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_visitor_messages" ON public.visitor_messages
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
CREATE POLICY "admin_update_visitor_messages" ON public.visitor_messages
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
CREATE POLICY "admin_delete_visitor_messages" ON public.visitor_messages
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- 5. site-assets storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  10485760,
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_site_assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "admin_upload_site_assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-assets' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
CREATE POLICY "admin_delete_site_assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site-assets' AND
    public.has_role(auth.uid(), 'admin'::public.app_role)
  );
