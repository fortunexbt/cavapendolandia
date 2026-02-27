-- Gate B hardening: content integrity, anti-abuse, and media privacy.

-- New fields used by upload validation + storage privacy mapping.
ALTER TABLE public.offerings
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS submission_fingerprint TEXT;

-- Backfill file_path from old public URL format when available.
UPDATE public.offerings
SET file_path = regexp_replace(
  file_url,
  '^.*/storage/v1/object/public/offerings/',
  ''
)
WHERE file_path IS NULL
  AND file_url IS NOT NULL
  AND file_url LIKE '%/storage/v1/object/public/offerings/%';

-- Constraints are marked NOT VALID to avoid breaking historical rows.
ALTER TABLE public.offerings
ADD CONSTRAINT offerings_title_length
CHECK (title IS NULL OR char_length(title) <= 60) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_note_length
CHECK (note IS NULL OR char_length(note) <= 500) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_text_length
CHECK (text_content IS NULL OR char_length(text_content) <= 2000) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_author_name_length
CHECK (author_name IS NULL OR char_length(author_name) <= 30) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_submission_fingerprint_length
CHECK (
  submission_fingerprint IS NULL
  OR char_length(submission_fingerprint) BETWEEN 8 AND 128
) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_author_shape
CHECK (
  (author_type = 'anonymous' AND author_name IS NULL)
  OR (
    author_type = 'name'
    AND author_name IS NOT NULL
    AND btrim(author_name) <> ''
    AND char_length(author_name) <= 30
  )
  OR (
    author_type = 'instagram'
    AND author_name IS NOT NULL
    AND author_name ~ '^[A-Za-z0-9._]{1,30}$'
  )
) NOT VALID;

ALTER TABLE public.offerings
ADD CONSTRAINT offerings_content_shape
CHECK (
  (
    media_type IN ('image', 'video', 'audio', 'pdf')
    AND (file_path IS NOT NULL OR file_url IS NOT NULL)
    AND (file_size IS NULL OR (file_size > 0 AND file_size <= 104857600))
    AND text_content IS NULL
    AND link_url IS NULL
  )
  OR (
    media_type = 'text'
    AND text_content IS NOT NULL
    AND btrim(text_content) <> ''
    AND char_length(text_content) <= 2000
    AND file_path IS NULL
    AND file_url IS NULL
    AND link_url IS NULL
    AND file_size IS NULL
  )
  OR (
    media_type = 'link'
    AND link_url IS NOT NULL
    AND link_url ~ '^https?://.+'
    AND file_path IS NULL
    AND file_url IS NULL
    AND text_content IS NULL
    AND file_size IS NULL
  )
) NOT VALID;

CREATE INDEX IF NOT EXISTS offerings_status_created_idx
  ON public.offerings (status, created_at DESC);
CREATE INDEX IF NOT EXISTS offerings_submission_fp_created_idx
  ON public.offerings (submission_fingerprint, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS offerings_file_path_unique_idx
  ON public.offerings (file_path)
  WHERE file_path IS NOT NULL;

-- Keep moderation timestamps consistent regardless of client updates.
CREATE OR REPLACE FUNCTION public.set_offering_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'approved' THEN
      NEW.approved_at := COALESCE(NEW.approved_at, now());
    ELSIF NEW.status = 'rejected' THEN
      NEW.rejected_at := COALESCE(NEW.rejected_at, now());
    ELSIF NEW.status = 'hidden' THEN
      NEW.hidden_at := COALESCE(NEW.hidden_at, now());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_offering_status_timestamps ON public.offerings;
CREATE TRIGGER trg_offering_status_timestamps
BEFORE UPDATE OF status ON public.offerings
FOR EACH ROW
EXECUTE FUNCTION public.set_offering_status_timestamps();

-- Anti-abuse MVP: per-fingerprint + global burst control.
CREATE OR REPLACE FUNCTION public.can_submit_offering(_fingerprint TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_global INT;
  recent_fingerprint INT;
BEGIN
  IF _fingerprint IS NULL OR char_length(_fingerprint) < 8 THEN
    RETURN FALSE;
  END IF;

  SELECT count(*) INTO recent_global
  FROM public.offerings
  WHERE created_at > now() - interval '10 minutes';

  IF recent_global >= 80 THEN
    RETURN FALSE;
  END IF;

  SELECT count(*) INTO recent_fingerprint
  FROM public.offerings
  WHERE created_at > now() - interval '10 minutes'
    AND submission_fingerprint = _fingerprint;

  RETURN recent_fingerprint < 5;
END;
$$;

REVOKE ALL ON FUNCTION public.can_submit_offering(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_submit_offering(TEXT) TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can submit offerings" ON public.offerings;
DROP POLICY IF EXISTS "Anyone can submit offerings with consent" ON public.offerings;

CREATE POLICY "Anyone can submit offerings with consent"
  ON public.offerings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent_rights = true
    AND consent_archive = true
    AND status = 'pending'
    AND public.can_submit_offering(submission_fingerprint)
  );

-- Storage bucket must be private. Media visibility is bound to offering status.
UPDATE storage.buckets
SET public = false
WHERE id = 'offerings';

DROP POLICY IF EXISTS "Anyone can upload to offerings bucket" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload offerings files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read offerings files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read approved offering files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all offerings files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete offerings files" ON storage.objects;

CREATE POLICY "Anyone can upload offerings files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'offerings'
    AND coalesce((metadata->>'size')::BIGINT, 0) <= 104857600
  );

CREATE POLICY "Public can read approved offering files"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'offerings'
    AND EXISTS (
      SELECT 1
      FROM public.offerings o
      WHERE o.file_path = name
        AND o.status = 'approved'
    )
  );

CREATE POLICY "Admins can read all offerings files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'offerings'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete offerings files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'offerings'
    AND public.has_role(auth.uid(), 'admin')
  );
