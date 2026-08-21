CREATE OR REPLACE FUNCTION public.convert_inquiry_to_booking(
  _inquiry_id uuid,
  _check_in date,
  _check_out date,
  _guests integer DEFAULT NULL,
  _status booking_status DEFAULT 'confirmed',
  _notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE inq public.inquiries%ROWTYPE; q jsonb; b_id uuid; b_ref text; g int;
BEGIN
  IF NOT public.is_staff() THEN
    RETURN jsonb_build_object('error','Not authorised');
  END IF;

  SELECT * INTO inq FROM public.inquiries WHERE id = _inquiry_id;
  IF inq.id IS NULL THEN RETURN jsonb_build_object('error','Inquiry not found'); END IF;

  g := GREATEST(COALESCE(_guests, inq.guests_count, 1), 1);
  q := public.quote_stay(inq.property_id, _check_in, _check_out, g);
  IF q ? 'error' THEN RETURN q; END IF;
  IF _status = 'confirmed' AND NOT (q->>'available')::boolean THEN
    RETURN jsonb_build_object('error','Those dates overlap a confirmed booking or blocked dates');
  END IF;
  IF NOT (q->>'guests_ok')::boolean THEN
    RETURN jsonb_build_object('error','Too many guests for this property');
  END IF;

  INSERT INTO public.bookings (property_id, guest_name, guest_email, guest_phone, guests_count,
    check_in, check_out, nightly_rate, total_amount, currency, source, status, special_requests, internal_notes)
  VALUES (inq.property_id, inq.name, inq.email, inq.phone, g,
    _check_in, _check_out, (q->>'avg_nightly')::numeric, (q->>'total')::numeric,
    q->>'currency', inq.source, _status, inq.notes,
    COALESCE(_notes, 'Converted from inquiry ' || inq.id::text))
  RETURNING id, reference INTO b_id, b_ref;

  UPDATE public.inquiries
     SET status = CASE WHEN _status = 'cancelled' THEN 'lost'::lead_status ELSE 'confirmed'::lead_status END,
         estimated_value = (q->>'total')::numeric,
         check_in = _check_in,
         check_out = _check_out,
         guests_count = g,
         notes = COALESCE(notes || E'\n', '') || 'Converted to booking ' || b_ref
   WHERE id = _inquiry_id;

  RETURN jsonb_build_object('id', b_id, 'reference', b_ref, 'total', q->>'total',
    'nights', q->>'nights', 'currency', q->>'currency');
END; $$;

REVOKE ALL ON FUNCTION public.convert_inquiry_to_booking(uuid, date, date, integer, booking_status, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.convert_inquiry_to_booking(uuid, date, date, integer, booking_status, text) TO authenticated, service_role;