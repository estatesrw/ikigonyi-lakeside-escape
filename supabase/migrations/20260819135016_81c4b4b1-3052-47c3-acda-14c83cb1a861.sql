
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_booking() FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.nightly_rate_for(uuid, date) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
REVOKE ALL ON FUNCTION public.is_staff() FROM public, anon;
REVOKE ALL ON FUNCTION public.can_see_financials() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_see_financials() TO authenticated;
