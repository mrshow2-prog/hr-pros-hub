INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-cvs', 'profile-cvs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can read profile CVs"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-cvs');

CREATE POLICY "Admins can upload profile CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-cvs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update profile CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-cvs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profile CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-cvs' AND public.has_role(auth.uid(), 'admin'));