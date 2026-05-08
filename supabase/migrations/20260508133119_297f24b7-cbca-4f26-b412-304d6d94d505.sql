ALTER TABLE public.profiles_content
  ADD COLUMN IF NOT EXISTS assistant_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assistant_context text NOT NULL DEFAULT '';