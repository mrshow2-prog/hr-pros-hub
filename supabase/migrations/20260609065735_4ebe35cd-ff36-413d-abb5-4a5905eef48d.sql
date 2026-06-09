
-- 1) App settings (singleton)
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true,
  paywall_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_settings_singleton CHECK (id = true)
);

GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.app_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.app_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (id, paywall_enabled) VALUES (true, false);

-- 2) Unlock requests
CREATE TABLE public.unlock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.cv_builder_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.unlock_requests TO authenticated;
GRANT ALL ON public.unlock_requests TO service_role;

ALTER TABLE public.unlock_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own requests"
  ON public.unlock_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users view own requests"
  ON public.unlock_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage requests"
  ON public.unlock_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER unlock_requests_updated_at
  BEFORE UPDATE ON public.unlock_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Admin access to all CV sessions
CREATE POLICY "Admins view all sessions"
  ON public.cv_builder_sessions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all sessions"
  ON public.cv_builder_sessions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
