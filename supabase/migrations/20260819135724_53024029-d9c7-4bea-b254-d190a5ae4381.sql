
CREATE OR REPLACE FUNCTION public.claim_first_owner()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); p_id uuid;
BEGIN
  IF uid IS NULL THEN RETURN jsonb_build_object('error','Not signed in'); END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles) THEN
    RETURN jsonb_build_object('error','An owner already exists for this platform');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'owner');
  FOR p_id IN SELECT id FROM public.properties LOOP
    INSERT INTO public.property_users (property_id, user_id, role)
    VALUES (p_id, uid, 'owner') ON CONFLICT DO NOTHING;
  END LOOP;
  RETURN jsonb_build_object('ok', true);
END; $$;
REVOKE ALL ON FUNCTION public.claim_first_owner() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_owner() TO authenticated;

CREATE OR REPLACE FUNCTION public.platform_has_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner');
$$;
REVOKE ALL ON FUNCTION public.platform_has_owner() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.platform_has_owner() TO authenticated;

CREATE POLICY "owners manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
