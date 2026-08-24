REVOKE EXECUTE ON FUNCTION public.set_user_role(text, app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.remove_user_role(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.set_user_role(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_user_role(uuid) TO authenticated;