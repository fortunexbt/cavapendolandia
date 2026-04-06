-- Site assets bucket for page content images, meadow billboards, owner-managed media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  10485760, -- 10MB
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_site_assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "admin_upload_site_assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'site-assets' AND
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
CREATE POLICY "admin_delete_site_assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'site-assets' AND
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
