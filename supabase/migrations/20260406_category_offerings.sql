-- Offering categories: grafica | musicale | letteraria
-- Derived from media_type, not user-entered
CREATE TYPE public.offering_category AS ENUM ('grafica', 'musicale', 'letteraria');

ALTER TABLE public.offerings 
ADD COLUMN IF NOT EXISTS category public.offering_category;

-- Backfill: image/pdf -> grafica, audio/video -> musicale, text/link -> letteraria
UPDATE public.offerings 
SET category = 
  CASE 
    WHEN media_type IN ('image', 'pdf') THEN 'grafica'
    WHEN media_type IN ('audio', 'video') THEN 'musicale'
    WHEN media_type IN ('text', 'link') THEN 'letteraria'
  END
WHERE category IS NULL AND media_type IS NOT NULL;

-- Trigger to auto-set category on insert/update
CREATE OR REPLACE FUNCTION public.set_offering_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.category IS NULL AND NEW.media_type IS NOT NULL THEN
    NEW.category := 
      CASE 
        WHEN NEW.media_type IN ('image', 'pdf') THEN 'grafica'
        WHEN NEW.media_type IN ('audio', 'video') THEN 'musicale'
        WHEN NEW.media_type IN ('text', 'link') THEN 'letteraria'
      END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS offering_category_trigger ON public.offerings;
CREATE TRIGGER offering_category_trigger
  BEFORE INSERT OR UPDATE ON public.offerings
  FOR EACH ROW EXECUTE FUNCTION public.set_offering_category();

-- RLS: category is readable by everyone (public), no new policies needed
