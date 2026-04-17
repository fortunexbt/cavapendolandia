-- Backfill approved_at for approved offerings where it is null
UPDATE public.offerings
SET approved_at = COALESCE(approved_at, created_at, now())
WHERE status = 'approved' AND approved_at IS NULL;

-- Copy legacy CMS slugs to live slugs (only when target row does not already exist)
INSERT INTO public.page_content (page_slug, block_key, locale, eyebrow, title, body_text, image_path, cta_label, cta_href, sort_order, is_enabled)
SELECT
  CASE page_slug
    WHEN 'home' THEN 'index'
    WHEN 'about' THEN 'che-cose'
    WHEN 'rules' THEN 'regole'
    WHEN 'removal' THEN 'rimozione'
  END AS page_slug,
  block_key, locale, eyebrow, title, body_text, image_path, cta_label, cta_href, sort_order, is_enabled
FROM public.page_content
WHERE page_slug IN ('home', 'about', 'rules', 'removal')
ON CONFLICT (page_slug, block_key, locale) DO NOTHING;