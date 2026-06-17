
-- 1) Allow authenticated/anon users to execute has_role (used by RLS policies and admin checks)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- 2) Ensure the auto_grant_admin trigger is actually attached to auth.users
DROP TRIGGER IF EXISTS auto_grant_admin_trigger ON auth.users;
CREATE TRIGGER auto_grant_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_grant_admin();

-- 3) Backfill admin role for the owner account
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE lower(email) = 'bmesiha@outlook.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4) Turn the manual-unlock paywall ON so admin approval is required before export
UPDATE public.app_settings SET paywall_enabled = true WHERE id = true;
INSERT INTO public.app_settings (id, paywall_enabled)
SELECT true, true WHERE NOT EXISTS (SELECT 1 FROM public.app_settings WHERE id = true);
