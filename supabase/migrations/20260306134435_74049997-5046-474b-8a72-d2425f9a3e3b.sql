-- Fix RLS policies: change from RESTRICTIVE to PERMISSIVE

-- Drop all existing policies on initiatives
DROP POLICY IF EXISTS "Admins can delete initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can insert initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can update initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Admins can view all initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Public can view active initiatives" ON public.initiatives;

-- Recreate as PERMISSIVE
CREATE POLICY "Admins can delete initiatives" ON public.initiatives FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert initiatives" ON public.initiatives FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update initiatives" ON public.initiatives FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all initiatives" ON public.initiatives FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public can view active initiatives" ON public.initiatives FOR SELECT TO anon, authenticated USING (is_active = true);

-- Fix offerings policies too
DROP POLICY IF EXISTS "Admins can delete offerings" ON public.offerings;
DROP POLICY IF EXISTS "Admins can update offerings" ON public.offerings;
DROP POLICY IF EXISTS "Admins can view all offerings" ON public.offerings;
DROP POLICY IF EXISTS "Anyone can submit offerings with consent" ON public.offerings;
DROP POLICY IF EXISTS "Public can view approved offerings" ON public.offerings;

CREATE POLICY "Admins can delete offerings" ON public.offerings FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update offerings" ON public.offerings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can view all offerings" ON public.offerings FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can submit offerings with consent" ON public.offerings FOR INSERT TO anon, authenticated WITH CHECK (consent_rights = true AND consent_archive = true AND status = 'pending'::offering_status);
CREATE POLICY "Public can view approved offerings" ON public.offerings FOR SELECT TO anon, authenticated USING (status = 'approved'::offering_status);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR (auth.uid() = user_id AND role = 'admin'::app_role AND NOT has_any_admin()));
CREATE POLICY "Admins can view roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));