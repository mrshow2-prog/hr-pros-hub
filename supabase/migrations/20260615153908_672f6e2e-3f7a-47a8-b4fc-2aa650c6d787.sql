DROP POLICY IF EXISTS "Users can create their own unlock requests" ON public.unlock_requests;
DROP POLICY IF EXISTS "Users insert own unlock requests" ON public.unlock_requests;
DROP POLICY IF EXISTS "Users can insert their own unlock requests" ON public.unlock_requests;

CREATE POLICY "Users insert own unlock requests"
ON public.unlock_requests
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (user_email IS NULL OR lower(user_email) = lower(auth.jwt()->>'email'))
);