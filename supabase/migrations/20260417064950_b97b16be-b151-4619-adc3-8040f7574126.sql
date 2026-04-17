-- Generic updated_at function (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Offering category trigger (uses existing set_offering_category function)
DROP TRIGGER IF EXISTS trg_set_offering_category ON public.offerings;
CREATE TRIGGER trg_set_offering_category
BEFORE INSERT OR UPDATE ON public.offerings
FOR EACH ROW
EXECUTE FUNCTION public.set_offering_category();

-- Initiatives updated_at trigger (uses existing set_initiatives_updated_at function)
DROP TRIGGER IF EXISTS trg_set_initiatives_updated_at ON public.initiatives;
CREATE TRIGGER trg_set_initiatives_updated_at
BEFORE UPDATE ON public.initiatives
FOR EACH ROW
EXECUTE FUNCTION public.set_initiatives_updated_at();

-- page_content updated_at trigger
DROP TRIGGER IF EXISTS trg_set_page_content_updated_at ON public.page_content;
CREATE TRIGGER trg_set_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- meadow_elements updated_at trigger
DROP TRIGGER IF EXISTS trg_set_meadow_elements_updated_at ON public.meadow_elements;
CREATE TRIGGER trg_set_meadow_elements_updated_at
BEFORE UPDATE ON public.meadow_elements
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Ensure unique constraint on page_content for (page_slug, block_key, locale) to support upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'page_content_slug_block_locale_unique'
  ) THEN
    ALTER TABLE public.page_content
    ADD CONSTRAINT page_content_slug_block_locale_unique
    UNIQUE (page_slug, block_key, locale);
  END IF;
END $$;