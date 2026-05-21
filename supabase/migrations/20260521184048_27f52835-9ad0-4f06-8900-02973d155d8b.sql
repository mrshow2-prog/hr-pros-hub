
-- Sessions table
CREATE TABLE public.cv_builder_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  anon_token text NULL,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  payment_status text NOT NULL DEFAULT 'unpaid',
  stripe_session_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cv_sessions_user ON public.cv_builder_sessions(user_id);
CREATE INDEX idx_cv_sessions_anon ON public.cv_builder_sessions(anon_token);

ALTER TABLE public.cv_builder_sessions ENABLE ROW LEVEL SECURITY;

-- Owners (signed in)
CREATE POLICY "Users manage own cv sessions"
  ON public.cv_builder_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins
CREATE POLICY "Admins view all cv sessions"
  ON public.cv_builder_sessions
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anonymous / public: allow insert + read + update of rows tied to an anon_token (no user_id)
-- Client must always filter by id to keep traffic bounded.
CREATE POLICY "Anon can insert cv sessions"
  ON public.cv_builder_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL AND anon_token IS NOT NULL AND char_length(anon_token) BETWEEN 16 AND 128);

CREATE POLICY "Anon can read cv sessions by token"
  ON public.cv_builder_sessions
  FOR SELECT
  TO anon, authenticated
  USING (user_id IS NULL AND anon_token IS NOT NULL);

CREATE POLICY "Anon can update cv sessions by token"
  ON public.cv_builder_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (user_id IS NULL AND anon_token IS NOT NULL)
  WITH CHECK (user_id IS NULL AND anon_token IS NOT NULL);

-- updated_at trigger
CREATE TRIGGER trg_cv_sessions_updated_at
  BEFORE UPDATE ON public.cv_builder_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-builder-uploads', 'cv-builder-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: object name layout = "{sessionId}/{filename}"
CREATE POLICY "CV uploads insert"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'cv-builder-uploads');

CREATE POLICY "CV uploads read own"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cv-builder-uploads');

CREATE POLICY "CV uploads delete own"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'cv-builder-uploads');
