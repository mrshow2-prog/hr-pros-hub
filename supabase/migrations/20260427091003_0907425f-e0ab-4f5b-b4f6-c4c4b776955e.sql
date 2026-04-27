-- Tools leads: optional email capture from JD Builder / Policy Generator
CREATE TABLE IF NOT EXISTS public.tools_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  output_text TEXT,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tools_leads ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous visitors) may submit a lead from the public tools.
CREATE POLICY "Anyone can submit a tool lead"
ON public.tools_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (
  tool_name IS NOT NULL
  AND char_length(tool_name) <= 80
  AND (user_email IS NULL OR char_length(user_email) <= 320)
  AND (output_text IS NULL OR char_length(output_text) <= 200000)
);

-- No public read/update/delete: leads are private to the business.
-- (Service role bypasses RLS and can read them via the backend.)

-- Tools usage: anonymous per-tool counter, no PII
CREATE TABLE IF NOT EXISTS public.tools_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tools_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record tool usage"
ON public.tools_usage
FOR INSERT
TO anon, authenticated
WITH CHECK (
  tool_name IS NOT NULL
  AND char_length(tool_name) <= 80
);

-- Helpful indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_tools_leads_tool_created ON public.tools_leads (tool_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tools_usage_tool_created ON public.tools_usage (tool_name, created_at DESC);