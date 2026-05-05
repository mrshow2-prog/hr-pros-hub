-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles content
CREATE TABLE public.profiles_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  og_image_url text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published profiles" ON public.profiles_content
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins can read all profiles" ON public.profiles_content
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners can read own profile" ON public.profiles_content
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Admins can insert profiles" ON public.profiles_content
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins or owners can update" ON public.profiles_content
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR owner_user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR owner_user_id = auth.uid());
CREATE POLICY "Admins can delete profiles" ON public.profiles_content
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_content_updated_at
  BEFORE UPDATE ON public.profiles_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for profile images
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read profile images" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated upload profile images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');
CREATE POLICY "Authenticated update profile images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Authenticated delete profile images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'profile-images');

-- Seed two profile rows
INSERT INTO public.profiles_content (slug, seo_title, seo_description, og_image_url, content) VALUES
('chef-m-khalil',
 'Chef Mohamed Khalil — Culinary Leader in Luxury Hospitality',
 'Chef Mohamed Khalil — Executive Chef. Culinary leader across luxury hospitality. Profile by people·STUDIO.',
 '/chef-m-khalil/photos/hero.jpg',
 '{
   "name": "Chef Mohamed Khalil",
   "headline": "Culinary Leader in Luxury Hospitality",
   "location": "UAE",
   "photo_url": "/chef-m-khalil/photos/hero.jpg",
   "bio": "Executive chef with deep experience leading culinary teams across luxury hotels and restaurants.",
   "achievements": [],
   "contact_email": "",
   "contact_phone": "",
   "linkedin_url": "",
   "cv_url": "/chef-m-khalil/Chef-Mohamed-Khalil-CV.pdf"
 }'::jsonb),
('bishoy-mesiha',
 'Bishoy Mesiha — 360° HR Leader · Profile by people·STUDIO',
 'Bishoy Mesiha — 360° HR Leader. Dubai, UAE. 16+ years across 11 MENAT markets. Profile by people·STUDIO.',
 '/bishoy-mesiha/images/bishoy.jpg',
 '{
   "name": "Bishoy Mesiha",
   "headline": "360° HR Leader",
   "location": "Dubai, UAE",
   "photo_url": "/bishoy-mesiha/images/bishoy.jpg",
   "bio": "16+ years driving HR transformation across 11 MENAT markets. Strategic HR leader specializing in talent, culture and organizational design.",
   "achievements": [],
   "contact_email": "bmesiha@outlook.com",
   "contact_phone": "+971 58 178 4948",
   "linkedin_url": "https://www.linkedin.com/in/bmesiha/",
   "cv_url": ""
 }'::jsonb);