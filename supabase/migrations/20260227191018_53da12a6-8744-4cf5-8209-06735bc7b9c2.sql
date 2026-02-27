
-- Enum for offering status
CREATE TYPE public.offering_status AS ENUM ('pending', 'approved', 'rejected', 'hidden');

-- Enum for author type
CREATE TYPE public.author_type AS ENUM ('anonymous', 'name', 'instagram');

-- Enum for media type
CREATE TYPE public.media_type AS ENUM ('image', 'video', 'audio', 'text', 'pdf', 'link');

-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Offerings table
CREATE TABLE public.offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type public.media_type NOT NULL,
  file_url TEXT,
  text_content TEXT,
  link_url TEXT,
  title TEXT,
  note TEXT,
  author_type public.author_type NOT NULL DEFAULT 'anonymous',
  author_name TEXT,
  consent_rights BOOLEAN NOT NULL DEFAULT false,
  consent_archive BOOLEAN NOT NULL DEFAULT false,
  consent_reshare BOOLEAN NOT NULL DEFAULT false,
  status public.offering_status NOT NULL DEFAULT 'pending',
  curatorial_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  hidden_at TIMESTAMPTZ
);
ALTER TABLE public.offerings ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user has admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: only admins can see/manage roles
CREATE POLICY "Admins can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS for offerings
-- Anyone can read approved offerings
CREATE POLICY "Public can view approved offerings"
  ON public.offerings FOR SELECT
  USING (status = 'approved');

-- Admins can view all offerings
CREATE POLICY "Admins can view all offerings"
  ON public.offerings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone (including anonymous) can insert new offerings
CREATE POLICY "Anyone can submit offerings"
  ON public.offerings FOR INSERT
  WITH CHECK (true);

-- Only admins can update offerings (moderate)
CREATE POLICY "Admins can update offerings"
  ON public.offerings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete offerings
CREATE POLICY "Admins can delete offerings"
  ON public.offerings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for offerings media (public read for approved content)
INSERT INTO storage.buckets (id, name, public) VALUES ('offerings', 'offerings', true);

-- Storage policies
CREATE POLICY "Anyone can upload to offerings bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'offerings');

CREATE POLICY "Anyone can read offerings files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'offerings');

CREATE POLICY "Admins can delete offerings files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'offerings' AND public.has_role(auth.uid(), 'admin'));
