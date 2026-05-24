
DROP TABLE IF EXISTS public.profiles_content CASCADE;
DROP TABLE IF EXISTS public.tools_leads CASCADE;
DROP TABLE IF EXISTS public.tools_usage CASCADE;

CREATE TABLE public.cv_builder_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cv_builder_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.cv_builder_sessions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own sessions" ON public.cv_builder_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own sessions" ON public.cv_builder_sessions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own sessions" ON public.cv_builder_sessions
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER set_cv_builder_sessions_updated_at
BEFORE UPDATE ON public.cv_builder_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cv_builder_sessions_user ON public.cv_builder_sessions(user_id, updated_at DESC);
