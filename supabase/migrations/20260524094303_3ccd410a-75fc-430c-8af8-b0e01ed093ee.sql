
DROP POLICY IF EXISTS "CV uploads read own" ON storage.objects;
DROP POLICY IF EXISTS "CV uploads insert" ON storage.objects;
DROP POLICY IF EXISTS "CV uploads delete own" ON storage.objects;

CREATE POLICY "CV uploads read own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'cv-builder-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "CV uploads insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'cv-builder-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "CV uploads update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'cv-builder-uploads' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'cv-builder-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "CV uploads delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'cv-builder-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can delete profile CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update profile CVs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload profile CVs" ON storage.objects;
DROP POLICY IF EXISTS "Public can read profile CVs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated delete profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public read profile images" ON storage.objects;

UPDATE storage.buckets SET public = false WHERE id IN ('profile-images','profile-cvs');

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

CREATE POLICY "Only admins can insert roles"
ON public.user_roles AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can update roles"
ON public.user_roles AS RESTRICTIVE FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles AS RESTRICTIVE FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
