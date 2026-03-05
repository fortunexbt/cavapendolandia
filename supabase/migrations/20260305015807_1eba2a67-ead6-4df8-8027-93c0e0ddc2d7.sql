-- First-admin bootstrap helper
create or replace function public.has_any_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where role = 'admin'::public.app_role
  );
$$;

-- Allow first authenticated user to self-assign admin only when no admin exists yet
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() = user_id
    AND role = 'admin'::app_role
    AND NOT public.has_any_admin()
  )
);

-- Admin-managed public initiative prompts
CREATE TABLE IF NOT EXISTS public.initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt TEXT NOT NULL,
  details TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_initiatives_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_initiatives_updated_at ON public.initiatives;
CREATE TRIGGER set_initiatives_updated_at
BEFORE UPDATE ON public.initiatives
FOR EACH ROW
EXECUTE FUNCTION public.set_initiatives_updated_at();

DROP POLICY IF EXISTS "Public can view active initiatives" ON public.initiatives;
CREATE POLICY "Public can view active initiatives"
ON public.initiatives
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all initiatives" ON public.initiatives;
CREATE POLICY "Admins can view all initiatives"
ON public.initiatives
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert initiatives" ON public.initiatives;
CREATE POLICY "Admins can insert initiatives"
ON public.initiatives
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update initiatives" ON public.initiatives;
CREATE POLICY "Admins can update initiatives"
ON public.initiatives
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete initiatives" ON public.initiatives;
CREATE POLICY "Admins can delete initiatives"
ON public.initiatives
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_initiatives_active_created
ON public.initiatives (is_active, created_at DESC);