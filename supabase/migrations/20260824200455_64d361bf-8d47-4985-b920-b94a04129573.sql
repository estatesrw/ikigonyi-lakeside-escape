ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS caption text;

ALTER TABLE public.gallery_images
  ADD CONSTRAINT gallery_images_media_type_chk CHECK (media_type IN ('image','video'));

CREATE OR REPLACE FUNCTION public.set_user_role(_email text, _role app_role)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RETURN jsonb_build_object('error','Only the owner can assign roles');
  END IF;
  SELECT id INTO uid FROM public.profiles WHERE lower(email) = lower(trim(_email));
  IF uid IS NULL THEN
    RETURN jsonb_build_object('error','No account found with that email. Ask them to sign up first.');
  END IF;
  DELETE FROM public.user_roles WHERE user_id = uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'user_id', uid);
END; $$;

CREATE OR REPLACE FUNCTION public.remove_user_role(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'owner') THEN
    RETURN jsonb_build_object('error','Only the owner can change roles');
  END IF;
  IF _user_id = auth.uid() THEN
    RETURN jsonb_build_object('error','You cannot remove your own access');
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  RETURN jsonb_build_object('ok', true);
END; $$;