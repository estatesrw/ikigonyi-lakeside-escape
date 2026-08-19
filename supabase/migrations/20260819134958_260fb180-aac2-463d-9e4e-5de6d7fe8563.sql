
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('owner','estatesrw_manager','operations_staff');
CREATE TYPE public.booking_status AS ENUM ('inquiry','pending','confirmed','cancelled','completed');
CREATE TYPE public.payment_status AS ENUM ('pending','paid','partially_paid','refunded');
CREATE TYPE public.booking_source AS ENUM ('direct_website','whatsapp','instagram','airbnb','booking_com','expedia','other');
CREATE TYPE public.lead_status AS ENUM ('new','contacted','negotiating','awaiting_payment','confirmed','lost','completed');
CREATE TYPE public.event_type AS ENUM ('bbq','brunch','private_party','birthday','corporate_retreat','celebration','other');
CREATE TYPE public.event_status AS ENUM ('planning','confirmed','completed','cancelled');
CREATE TYPE public.channel_status AS ENUM ('connected','not_connected','pending');
CREATE TYPE public.pricing_rule_type AS ENUM ('base','weekend','high_season','low_season','holiday','special_event');

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid());
$$;

-- can see financial data (owner + estatesrw_manager)
CREATE OR REPLACE FUNCTION public.can_see_financials()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    AND role IN ('owner','estatesrw_manager'));
$$;

CREATE POLICY "profiles readable by staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "roles readable" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PROPERTIES
CREATE TABLE public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  location text,
  country text DEFAULT 'Rwanda',
  latitude numeric,
  longitude numeric,
  bedrooms int NOT NULL DEFAULT 0,
  max_guests int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  hero_image_url text,
  whatsapp_number text,
  contact_email text,
  instagram_url text,
  google_maps_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.properties TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT ALL ON public.properties TO service_role;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published properties public" ON public.properties FOR SELECT TO anon USING (is_published);
CREATE POLICY "staff read properties" ON public.properties FOR SELECT TO authenticated USING (is_published OR public.is_staff());
CREATE POLICY "managers write properties" ON public.properties FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());
CREATE TRIGGER t_properties BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PROPERTY USERS
CREATE TABLE public.property_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, user_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_users TO authenticated;
GRANT ALL ON public.property_users TO service_role;
ALTER TABLE public.property_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read property users" ON public.property_users FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "owners manage property users" ON public.property_users FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'owner')) WITH CHECK (public.has_role(auth.uid(),'owner'));

-- ROOMS
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sleeps int NOT NULL DEFAULT 2,
  bed_configuration text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms public read" ON public.rooms FOR SELECT TO anon USING (true);
CREATE POLICY "rooms auth read" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "rooms staff write" ON public.rooms FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- GUESTS
CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  country text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests staff all" ON public.guests FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
CREATE TRIGGER t_guests BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('IKG-' || upper(substr(md5(random()::text),1,6))),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  guests_count int NOT NULL DEFAULT 1,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nights int GENERATED ALWAYS AS (check_out - check_in) STORED,
  nightly_rate numeric(12,2) NOT NULL DEFAULT 0,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  source public.booking_source NOT NULL DEFAULT 'direct_website',
  status public.booking_status NOT NULL DEFAULT 'inquiry',
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  commission_rate numeric(5,2) NOT NULL DEFAULT 0,
  commission_amount numeric(12,2) NOT NULL DEFAULT 0,
  special_requests text,
  internal_notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bookings_dates_idx ON public.bookings (property_id, check_in, check_out);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings staff read" ON public.bookings FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "bookings managers write" ON public.bookings FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());
CREATE TRIGGER t_bookings BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.validate_booking() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.check_out <= NEW.check_in THEN RAISE EXCEPTION 'Check-out must be after check-in'; END IF;
  IF NEW.status = 'confirmed' THEN
    IF EXISTS (SELECT 1 FROM public.bookings b WHERE b.property_id = NEW.property_id
      AND b.id <> NEW.id AND b.status = 'confirmed'
      AND daterange(b.check_in, b.check_out,'[)') && daterange(NEW.check_in, NEW.check_out,'[)'))
    THEN RAISE EXCEPTION 'These dates overlap an existing confirmed booking'; END IF;
    IF EXISTS (SELECT 1 FROM public.blocked_dates d WHERE d.property_id = NEW.property_id
      AND daterange(d.start_date, d.end_date,'[)') && daterange(NEW.check_in, NEW.check_out,'[)'))
    THEN RAISE EXCEPTION 'These dates overlap blocked dates'; END IF;
  END IF;
  RETURN NEW;
END; $$;

-- BLOCKED DATES
CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_dates TO authenticated;
GRANT ALL ON public.blocked_dates TO service_role;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blocked staff read" ON public.blocked_dates FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "blocked managers write" ON public.blocked_dates FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

CREATE TRIGGER t_validate_booking BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  method text,
  reference text,
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments financial roles" ON public.payments FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- PRICING RULES
CREATE TABLE public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  rule_type public.pricing_rule_type NOT NULL,
  nightly_rate numeric(12,2) NOT NULL,
  start_date date,
  end_date date,
  days_of_week int[],
  min_nights int NOT NULL DEFAULT 1,
  priority int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_rules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_rules TO authenticated;
GRANT ALL ON public.pricing_rules TO service_role;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pricing public read" ON public.pricing_rules FOR SELECT TO anon USING (is_active);
CREATE POLICY "pricing auth read" ON public.pricing_rules FOR SELECT TO authenticated USING (public.is_staff() OR is_active);
CREATE POLICY "pricing managers write" ON public.pricing_rules FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

CREATE TABLE public.rate_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  date date NOT NULL,
  nightly_rate numeric(12,2) NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, date)
);
GRANT SELECT ON public.rate_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rate_overrides TO authenticated;
GRANT ALL ON public.rate_overrides TO service_role;
ALTER TABLE public.rate_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "overrides public read" ON public.rate_overrides FOR SELECT TO anon USING (true);
CREATE POLICY "overrides auth read" ON public.rate_overrides FOR SELECT TO authenticated USING (true);
CREATE POLICY "overrides managers write" ON public.rate_overrides FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- INQUIRIES (CRM)
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  source public.booking_source NOT NULL DEFAULT 'direct_website',
  interest text,
  check_in date,
  check_out date,
  guests_count int,
  estimated_value numeric(12,2),
  status public.lead_status NOT NULL DEFAULT 'new',
  notes text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inquiries staff read" ON public.inquiries FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "inquiries managers write" ON public.inquiries FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());
CREATE TRIGGER t_inquiries BEFORE UPDATE ON public.inquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MESSAGES + TEMPLATES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  inquiry_id uuid REFERENCES public.inquiries(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  guest_name text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  direction text NOT NULL DEFAULT 'inbound',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'unread',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages staff all" ON public.messages FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_templates TO authenticated;
GRANT ALL ON public.message_templates TO service_role;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates staff all" ON public.message_templates FOR ALL TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  event_date date NOT NULL,
  event_type public.event_type NOT NULL DEFAULT 'other',
  guests_count int NOT NULL DEFAULT 0,
  expected_revenue numeric(12,2) NOT NULL DEFAULT 0,
  estimated_costs numeric(12,2) NOT NULL DEFAULT 0,
  vendors text,
  status public.event_status NOT NULL DEFAULT 'planning',
  notes text,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events staff read" ON public.events FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "events managers write" ON public.events FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());
CREATE TRIGGER t_events BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CHANNELS
CREATE TABLE public.channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name text NOT NULL,
  code public.booking_source NOT NULL,
  status public.channel_status NOT NULL DEFAULT 'not_connected',
  ical_import_url text,
  ical_export_url text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "channels staff read" ON public.channels FOR SELECT TO authenticated USING (public.is_staff());
CREATE POLICY "channels managers write" ON public.channels FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_location text,
  rating int NOT NULL DEFAULT 5,
  body text NOT NULL,
  stay_date date,
  is_published boolean NOT NULL DEFAULT true,
  is_demo boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon USING (is_published);
CREATE POLICY "reviews auth read" ON public.reviews FOR SELECT TO authenticated USING (is_published OR public.is_staff());
CREATE POLICY "reviews managers write" ON public.reviews FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- GALLERY
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'House',
  image_url text NOT NULL,
  alt_text text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT TO anon USING (is_published);
CREATE POLICY "gallery auth read" ON public.gallery_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "gallery managers write" ON public.gallery_images FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- EXPERIENCES
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences public read" ON public.experiences FOR SELECT TO anon USING (is_published);
CREATE POLICY "experiences auth read" ON public.experiences FOR SELECT TO authenticated USING (true);
CREATE POLICY "experiences managers write" ON public.experiences FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- AMENITIES
CREATE TABLE public.amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  label text NOT NULL,
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.amenities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.amenities TO authenticated;
GRANT ALL ON public.amenities TO service_role;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "amenities public read" ON public.amenities FOR SELECT TO anon USING (true);
CREATE POLICY "amenities auth read" ON public.amenities FOR SELECT TO authenticated USING (true);
CREATE POLICY "amenities managers write" ON public.amenities FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());

-- SITE CONTENT (CMS)
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, key)
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "content public read" ON public.site_content FOR SELECT TO anon USING (true);
CREATE POLICY "content auth read" ON public.site_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "content managers write" ON public.site_content FOR ALL TO authenticated
  USING (public.can_see_financials()) WITH CHECK (public.can_see_financials());
CREATE TRIGGER t_content BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- PRICING ENGINE
CREATE OR REPLACE FUNCTION public.nightly_rate_for(_property_id uuid, _date date)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r numeric;
BEGIN
  SELECT nightly_rate INTO r FROM public.rate_overrides
    WHERE property_id = _property_id AND date = _date;
  IF r IS NOT NULL THEN RETURN r; END IF;

  SELECT nightly_rate INTO r FROM public.pricing_rules
   WHERE property_id = _property_id AND is_active
     AND rule_type <> 'base'
     AND (start_date IS NULL OR _date >= start_date)
     AND (end_date IS NULL OR _date <= end_date)
     AND (days_of_week IS NULL OR EXTRACT(DOW FROM _date)::int = ANY(days_of_week))
   ORDER BY priority DESC, created_at DESC LIMIT 1;
  IF r IS NOT NULL THEN RETURN r; END IF;

  SELECT nightly_rate INTO r FROM public.pricing_rules
   WHERE property_id = _property_id AND is_active AND rule_type = 'base'
   ORDER BY created_at DESC LIMIT 1;
  RETURN COALESCE(r, 0);
END; $$;

CREATE OR REPLACE FUNCTION public.is_available(_property_id uuid, _check_in date, _check_out date)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _check_out > _check_in
    AND NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.property_id = _property_id
      AND b.status = 'confirmed'
      AND daterange(b.check_in, b.check_out,'[)') && daterange(_check_in, _check_out,'[)'))
    AND NOT EXISTS (SELECT 1 FROM public.blocked_dates d WHERE d.property_id = _property_id
      AND daterange(d.start_date, d.end_date,'[)') && daterange(_check_in, _check_out,'[)'));
$$;

CREATE OR REPLACE FUNCTION public.quote_stay(_property_id uuid, _check_in date, _check_out date, _guests int DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE d date; total numeric := 0; n int := 0; maxg int; cur text;
BEGIN
  IF _check_out <= _check_in THEN
    RETURN jsonb_build_object('error','Check-out must be after check-in');
  END IF;
  SELECT max_guests, currency INTO maxg, cur FROM public.properties WHERE id = _property_id;
  d := _check_in;
  WHILE d < _check_out LOOP
    total := total + public.nightly_rate_for(_property_id, d);
    n := n + 1;
    d := d + 1;
  END LOOP;
  RETURN jsonb_build_object(
    'available', public.is_available(_property_id, _check_in, _check_out),
    'nights', n,
    'total', total,
    'avg_nightly', CASE WHEN n > 0 THEN round(total / n, 2) ELSE 0 END,
    'currency', COALESCE(cur,'USD'),
    'guests_ok', COALESCE(_guests,1) <= COALESCE(maxg, 99),
    'max_guests', maxg
  );
END; $$;

CREATE OR REPLACE FUNCTION public.create_booking_request(
  _property_id uuid, _check_in date, _check_out date, _guests int,
  _name text, _email text, _phone text, _requests text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE q jsonb; b_id uuid; b_ref text;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RETURN jsonb_build_object('error','Name is required'); END IF;
  IF _email IS NULL AND _phone IS NULL THEN RETURN jsonb_build_object('error','Email or phone is required'); END IF;
  q := public.quote_stay(_property_id, _check_in, _check_out, _guests);
  IF q ? 'error' THEN RETURN q; END IF;
  IF NOT (q->>'available')::boolean THEN RETURN jsonb_build_object('error','Those dates are no longer available'); END IF;
  IF NOT (q->>'guests_ok')::boolean THEN RETURN jsonb_build_object('error','Too many guests for this property'); END IF;

  INSERT INTO public.bookings (property_id, guest_name, guest_email, guest_phone, guests_count,
    check_in, check_out, nightly_rate, total_amount, currency, source, status, special_requests)
  VALUES (_property_id, trim(_name), _email, _phone, GREATEST(COALESCE(_guests,1),1),
    _check_in, _check_out, (q->>'avg_nightly')::numeric, (q->>'total')::numeric,
    q->>'currency', 'direct_website', 'pending', _requests)
  RETURNING id, reference INTO b_id, b_ref;

  INSERT INTO public.inquiries (property_id, name, email, phone, source, interest,
    check_in, check_out, guests_count, estimated_value, status, notes)
  VALUES (_property_id, trim(_name), _email, _phone, 'direct_website', 'Website booking request',
    _check_in, _check_out, _guests, (q->>'total')::numeric, 'new',
    'Auto-created from website booking ' || b_ref);

  RETURN jsonb_build_object('id', b_id, 'reference', b_ref, 'total', q->>'total',
    'nights', q->>'nights', 'currency', q->>'currency');
END; $$;

CREATE OR REPLACE FUNCTION public.create_inquiry(
  _property_id uuid, _name text, _email text, _phone text,
  _interest text DEFAULT NULL, _message text DEFAULT NULL,
  _check_in date DEFAULT NULL, _check_out date DEFAULT NULL, _guests int DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE i_id uuid;
BEGIN
  IF _name IS NULL OR length(trim(_name)) < 2 THEN RETURN jsonb_build_object('error','Name is required'); END IF;
  IF (_email IS NULL OR length(trim(_email)) = 0) AND (_phone IS NULL OR length(trim(_phone)) = 0) THEN
    RETURN jsonb_build_object('error','Email or phone is required'); END IF;
  INSERT INTO public.inquiries (property_id, name, email, phone, source, interest, notes,
    check_in, check_out, guests_count)
  VALUES (_property_id, trim(_name), _email, _phone, 'direct_website', _interest, _message,
    _check_in, _check_out, _guests)
  RETURNING id INTO i_id;
  RETURN jsonb_build_object('id', i_id);
END; $$;

REVOKE ALL ON FUNCTION public.quote_stay(uuid,date,date,int) FROM public;
GRANT EXECUTE ON FUNCTION public.quote_stay(uuid,date,date,int) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.is_available(uuid,date,date) FROM public;
GRANT EXECUTE ON FUNCTION public.is_available(uuid,date,date) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.create_booking_request(uuid,date,date,int,text,text,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_booking_request(uuid,date,date,int,text,text,text,text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.create_inquiry(uuid,text,text,text,text,text,date,date,int) FROM public;
GRANT EXECUTE ON FUNCTION public.create_inquiry(uuid,text,text,text,text,text,date,date,int) TO anon, authenticated;

-- SEED: first property
INSERT INTO public.properties (slug, name, tagline, description, location, bedrooms, max_guests,
  currency, whatsapp_number, contact_email, instagram_url, latitude, longitude)
VALUES ('ikigonyi-round-house','Ikigonyi Round House','Escape to Lake Muhazi.',
  'Ikigonyi Round House is a unique lakeside retreat on the shores of Lake Muhazi, offering a peaceful escape surrounded by nature. Designed for families, friends, couples and small groups, Ikigonyi combines the privacy of a home with the experience of a destination getaway.',
  'Lake Muhazi, Rwanda', 4, 12, 'USD', '250700000000', 'hello@estatesrw.com', 'https://instagram.com', -1.8833, 30.2500);

INSERT INTO public.pricing_rules (property_id, name, rule_type, nightly_rate, days_of_week, priority)
SELECT id, 'Base rate (placeholder)', 'base', 350, NULL, 0 FROM public.properties WHERE slug='ikigonyi-round-house';
INSERT INTO public.pricing_rules (property_id, name, rule_type, nightly_rate, days_of_week, priority)
SELECT id, 'Weekend rate (placeholder)', 'weekend', 420, ARRAY[5,6], 10 FROM public.properties WHERE slug='ikigonyi-round-house';

INSERT INTO public.rooms (property_id, name, description, sleeps, bed_configuration, sort_order)
SELECT id, v.name, v.descr, v.sleeps, v.beds, v.so FROM public.properties p,
(VALUES ('Lake Room','Wide lake views and morning light.',3,'1 king + 1 single',1),
        ('Garden Room','Quiet room opening to the garden.',2,'1 queen',2),
        ('Round Room','The signature curved room of the house.',3,'1 queen + 1 single',3),
        ('Family Room','Space for the whole family.',4,'2 doubles',4)) AS v(name,descr,sleeps,beds,so)
WHERE p.slug='ikigonyi-round-house';

INSERT INTO public.amenities (property_id, label, sort_order)
SELECT p.id, v.label, v.so FROM public.properties p,
(VALUES ('4 Bedrooms',1),('Up to 12 Guests',2),('Private Lakeside Setting',3),('Fully Equipped Kitchen',4),
        ('Living & Social Spaces',5),('Wi-Fi',6),('Outdoor Spaces',7),('Lake Experiences',8)) AS v(label,so)
WHERE p.slug='ikigonyi-round-house';

INSERT INTO public.experiences (property_id, title, description, sort_order)
SELECT p.id, v.t, v.d, v.so FROM public.properties p,
(VALUES ('Weekend Getaways','Escape Kigali for a peaceful weekend beside the lake.',1),
        ('Lakeside BBQs','Good food, music, friends and the lake.',2),
        ('Private Gatherings','Birthdays, celebrations and intimate occasions.',3),
        ('Corporate Retreats','A different environment for teams and small groups.',4),
        ('Lake Experiences','Discover the natural beauty and activities around Lake Muhazi.',5)) AS v(t,d,so)
WHERE p.slug='ikigonyi-round-house';

INSERT INTO public.reviews (property_id, author_name, author_location, rating, body, is_demo, sort_order)
SELECT p.id, v.a, v.l, 5, v.b, true, v.so FROM public.properties p,
(VALUES ('Amina K.','Kigali','We arrived on a Friday evening and immediately slowed down. The lake, the quiet, the space — exactly what we needed.',1),
        ('Jean-Paul M.','Kigali','We hosted a small birthday gathering here. The setting did most of the work for us.',2),
        ('Sarah & Tom','Nairobi','Waking up to the water was the highlight. Beautifully private.',3)) AS v(a,l,b,so)
WHERE p.slug='ikigonyi-round-house';

INSERT INTO public.channels (property_id, name, code, status)
SELECT p.id, v.n, v.c::public.booking_source, 'not_connected' FROM public.properties p,
(VALUES ('Direct Website','direct_website'),('Airbnb','airbnb'),('Booking.com','booking_com'),
        ('Expedia','expedia'),('WhatsApp','whatsapp'),('Instagram','instagram')) AS v(n,c)
WHERE p.slug='ikigonyi-round-house';
UPDATE public.channels SET status='connected', last_synced_at=now() WHERE code='direct_website';

INSERT INTO public.message_templates (property_id, name, body)
SELECT p.id, v.n, v.b FROM public.properties p,
(VALUES ('Availability inquiry','Hello {{name}}, thank you for reaching out about Ikigonyi Round House. Those dates are currently available. Would you like me to hold them for you?'),
        ('Price inquiry','Hello {{name}}, our nightly rate for your dates is {{rate}}, giving a total of {{total}} for {{nights}} nights.'),
        ('Booking follow-up','Hello {{name}}, just following up on your enquiry for Lake Muhazi. Are the dates still working for you?'),
        ('Payment instructions','Hello {{name}}, to confirm your stay please complete payment using the details provided. Your booking is held until then.'),
        ('Booking confirmation','Hello {{name}}, your stay at Ikigonyi Round House is confirmed for {{check_in}} to {{check_out}}. We look forward to hosting you.'),
        ('Check-in information','Hello {{name}}, check-in is from 14:00. Here are the directions and arrival details for Ikigonyi Round House.'),
        ('Thank-you message','Thank you for staying with us at Ikigonyi Round House. We would love to welcome you back to the lake.')) AS v(n,b)
WHERE p.slug='ikigonyi-round-house';

INSERT INTO public.site_content (property_id, key, value)
SELECT p.id, v.k, v.val FROM public.properties p,
(VALUES ('hero_headline','Escape to Lake Muhazi.'),
        ('hero_subheadline','A private lakeside retreat designed for slow mornings, shared moments and unforgettable weekends.'),
        ('intro_headline','A private retreat by the lake.'),
        ('destination_headline','Your escape from the city.'),
        ('destination_body','Lake Muhazi offers a calm, natural alternative to the city — a place for weekend escapes, gatherings and slower, nature-focused stays.'),
        ('final_cta_headline','Your weekend at the lake starts here.')) AS v(k,val)
WHERE p.slug='ikigonyi-round-house';
