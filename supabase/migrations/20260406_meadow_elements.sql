-- Owner-managed meadow/world decorative elements
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
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
