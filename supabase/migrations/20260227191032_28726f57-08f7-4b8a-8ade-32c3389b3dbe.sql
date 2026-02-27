
-- Tighten the INSERT policy to require consent fields
DROP POLICY "Anyone can submit offerings" ON public.offerings;

CREATE POLICY "Anyone can submit offerings with consent"
  ON public.offerings FOR INSERT
  WITH CHECK (
    consent_rights = true 
    AND consent_archive = true 
    AND status = 'pending'
  );
