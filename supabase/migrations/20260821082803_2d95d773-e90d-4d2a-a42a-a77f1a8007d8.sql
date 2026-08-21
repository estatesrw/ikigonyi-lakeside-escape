
DO $$
DECLARE p uuid; k text; v text;
BEGIN
  SELECT id INTO p FROM public.properties WHERE slug = 'ikigonyi-round-house';

  UPDATE public.properties SET
    tagline = 'African-style villa with lake views, sleeps 12.',
    description = 'Ikigonyi Round House is a lakefront villa on the shores of Lake Muhazi, built in traditional African style with a spectacular handcrafted thatched roof. The main round house and its annexe together sleep up to 12 guests across 6 bedrooms, with a panoramic terrace, bright open living rooms and a fully equipped kitchen. A private chef is available on request.',
    location = 'Rwamagana, Eastern Province, Rwanda',
    bedrooms = 6,
    max_guests = 12,
    hero_image_url = '/__l5e/assets-v1/4dc040a3-d2ea-45a7-943e-02e3a7b2f9fd/round-house-exterior.jpg'
  WHERE id = p;

  DELETE FROM public.rooms WHERE property_id = p;
  INSERT INTO public.rooms (property_id, name, description, sleeps, bed_configuration, image_url, sort_order) VALUES
    (p, 'Lake View Master', 'Upstairs in the round house, with carved hardwood bed and windows onto the lake.', 2, '1 king', '/__l5e/assets-v1/1a09a6a9-3393-41ad-88d1-a376c642c73f/bedroom-king.jpg', 1),
    (p, 'Thatch Room', 'Raw-wood four poster bed under the thatched roof, with mosquito net.', 2, '1 double', '/__l5e/assets-v1/7b503fe6-5200-4eb9-8f76-30004d41b748/bedroom-canopy.jpg', 2),
    (p, 'Twin Room', 'Two beds dressed in Imigongo-patterned textiles, ideal for friends or children.', 2, '2 singles', '/__l5e/assets-v1/9fb49206-b5a5-4466-ac18-f23d93fd25a4/bedroom-twin.jpg', 3),
    (p, 'Garden Room', 'Warm lamplight, hardwood floors and a quiet outlook over the garden.', 2, '1 double', '/__l5e/assets-v1/98b1e29d-63ea-4aeb-9f3a-d833d9ba2d98/bedroom-lamplight.jpg', 4),
    (p, 'Stone Room', 'Dark hardwood bed frame, private bathroom and morning light.', 2, '1 double', '/__l5e/assets-v1/e7360340-2aab-478b-bbd0-8ffedb1cefa7/bedroom-dark-wood.jpg', 5),
    (p, 'Annexe Room', 'In the second lakefront house, with carved doors and its own bathroom.', 2, '1 double', '/__l5e/assets-v1/419d953b-c24f-4652-b6c4-33d456ec985f/bedroom-annexe.jpg', 6);

  DELETE FROM public.amenities WHERE property_id = p;
  INSERT INTO public.amenities (property_id, label, sort_order) VALUES
    (p, 'Waterfront', 1),
    (p, '6 bedrooms · 10 beds', 2),
    (p, '6 bathrooms', 3),
    (p, 'Up to 12 guests', 4),
    (p, 'Fully equipped kitchen', 5),
    (p, 'Panoramic covered terrace', 6),
    (p, 'Private chef on request', 7),
    (p, 'Wifi', 8),
    (p, 'Dedicated workspace', 9),
    (p, 'Free parking on premises', 10),
    (p, 'Pets allowed', 11),
    (p, 'Free washer and dryer', 12),
    (p, 'Refrigerator and microwave', 13),
    (p, 'French press coffee', 14),
    (p, 'Smoke and carbon monoxide alarms', 15),
    (p, 'Boat rides on Lake Muhazi', 16);

  UPDATE public.experiences SET image_url = '/__l5e/assets-v1/1c8eb72f-ddb7-419d-99de-c5132f65745e/terrace-lake.jpg' WHERE property_id = p AND sort_order = 1;
  UPDATE public.experiences SET image_url = '/__l5e/assets-v1/c8fb7cc4-9c14-4061-8995-d6b7dba59788/dining-kitchen.jpg', title = 'Private Chef Dining', description = 'A private chef can join your stay and cook for the group, indoors or on the terrace.' WHERE property_id = p AND sort_order = 2;
  UPDATE public.experiences SET image_url = '/__l5e/assets-v1/ed9d9f44-35f9-41f0-b610-eedcef694c59/living-room.jpg' WHERE property_id = p AND sort_order = 3;
  UPDATE public.experiences SET image_url = '/__l5e/assets-v1/ca19ee70-580e-434e-8ca9-a2add17a03b8/living-stairs.jpg' WHERE property_id = p AND sort_order = 4;
  UPDATE public.experiences SET image_url = '/__l5e/assets-v1/e793343b-3b7a-495a-acbf-f20f7acf81f8/lake-view.jpg', title = 'Boat Rides & Lake Walks', description = 'The lake is a short walk away — boat rides, shoreline walks and nearby local restaurants.' WHERE property_id = p AND sort_order = 5;

  DELETE FROM public.reviews WHERE property_id = p AND is_demo = true;
  INSERT INTO public.reviews (property_id, author_name, author_location, rating, body, stay_date, is_published, is_demo, sort_order) VALUES
    (p, 'Audrey', NULL, 5, 'I had a great weekend in Rwamagana. The house is exactly as described: a real little haven by Lake Muhazi. It was the perfect place to relax and enjoy the setting, both inside and outside. A big plus for the service provided by the cook, who made our experience even more magical. I would recommend it in a second!', DATE '2026-04-01', true, false, 1),
    (p, 'Betty', 'Kigali, Rwanda', 4, 'My friends and I spent 3 nights and 4 days at this place. The local contact, Sandra, was extremely proactive and responsive throughout the entire stay. Frank the chef was attentive and his food made us feel right at home. Theophile went out of his way to make sure our stay was comfortable.', DATE '2026-03-01', true, false, 2);

  DELETE FROM public.gallery_images WHERE property_id = p;
  INSERT INTO public.gallery_images (property_id, category, image_url, alt_text, sort_order, is_published) VALUES
    (p, 'House', '/__l5e/assets-v1/4dc040a3-d2ea-45a7-943e-02e3a7b2f9fd/round-house-exterior.jpg', 'The stone round house with its thatched roof above Lake Muhazi', 1, true),
    (p, 'Outdoor', '/__l5e/assets-v1/1c8eb72f-ddb7-419d-99de-c5132f65745e/terrace-lake.jpg', 'Panoramic covered terrace looking over the lake', 2, true),
    (p, 'Living Spaces', '/__l5e/assets-v1/ed9d9f44-35f9-41f0-b610-eedcef694c59/living-room.jpg', 'Bright curved living room with lake-facing windows', 3, true),
    (p, 'Living Spaces', '/__l5e/assets-v1/c8a06bd9-7fbf-4125-ada1-c4126ef3ed24/living-room-lounge.jpg', 'Lounge with woven pendant lights and handcrafted table', 4, true),
    (p, 'Living Spaces', '/__l5e/assets-v1/c8fb7cc4-9c14-4061-8995-d6b7dba59788/dining-kitchen.jpg', 'Open kitchen and dining table with root-wood base', 5, true),
    (p, 'Living Spaces', '/__l5e/assets-v1/ca19ee70-580e-434e-8ca9-a2add17a03b8/living-stairs.jpg', 'Living area with spiral staircase to the upper floor', 6, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/1a09a6a9-3393-41ad-88d1-a376c642c73f/bedroom-king.jpg', 'King bedroom with carved wooden headboard', 7, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/7b503fe6-5200-4eb9-8f76-30004d41b748/bedroom-canopy.jpg', 'Bedroom with raw-wood four poster bed and mosquito net', 8, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/9fb49206-b5a5-4466-ac18-f23d93fd25a4/bedroom-twin.jpg', 'Twin bedroom with Imigongo-patterned textiles', 9, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/98b1e29d-63ea-4aeb-9f3a-d833d9ba2d98/bedroom-lamplight.jpg', 'Double bedroom with warm lamplight', 10, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/e7360340-2aab-478b-bbd0-8ffedb1cefa7/bedroom-dark-wood.jpg', 'Bedroom with dark hardwood bed frame', 11, true),
    (p, 'Bedrooms', '/__l5e/assets-v1/419d953b-c24f-4652-b6c4-33d456ec985f/bedroom-annexe.jpg', 'Bedroom in the annexe house with carved door', 12, true),
    (p, 'House', '/__l5e/assets-v1/6fc9f53f-fb94-43fd-b71c-9a61a7161549/bathroom-stone.jpg', 'Bathroom with stone walls and carved wooden basin', 13, true),
    (p, 'House', '/__l5e/assets-v1/465822ba-8af2-4e53-b6e2-33c7a83c7cf6/bathroom-shower.jpg', 'Walk-in rain shower with stone tiling', 14, true),
    (p, 'House', '/__l5e/assets-v1/4d1e3103-a2b5-4dd0-be3e-a22f5c25fd20/thatched-roof.jpg', 'Detail of the handcrafted thatched roof structure', 15, true),
    (p, 'House', '/__l5e/assets-v1/f7e50a4f-d013-448f-a20b-bc716752f67a/round-house-night.jpg', 'The round house lit up at night', 16, true),
    (p, 'House', '/__l5e/assets-v1/e9a30a5d-9217-4020-b685-ad78de146c57/annexe-night.jpg', 'The annexe house in the evening', 17, true),
    (p, 'Lake', '/__l5e/assets-v1/e793343b-3b7a-495a-acbf-f20f7acf81f8/lake-view.jpg', 'View across Lake Muhazi from the property', 18, true),
    (p, 'Lake', '/__l5e/assets-v1/5f2c3847-fca2-4293-ad6b-5aaaf69d67f8/property-landscape.jpg', 'The two houses set in the green hills of Rwamagana', 19, true);

  FOR k, v IN SELECT * FROM (VALUES
    ('hero_headline', 'African-style villa on Lake Muhazi.'),
    ('hero_subheadline', 'A thatched-roof lakefront retreat in Rwamagana — 6 bedrooms, up to 12 guests, private chef on request.'),
    ('intro_headline', 'Two lakefront houses, one private retreat.'),
    ('destination_headline', 'Breathtaking views, a peaceful setting.'),
    ('destination_body', 'Lake Muhazi is an easy drive from Kigali — boat rides, shoreline walks and local restaurants nearby, with the lake a short walk from the villa.'),
    ('final_cta_headline', 'Your weekend at the lake starts here.')
  ) AS t(a, b)
  LOOP
    UPDATE public.site_content SET value = v WHERE key = k;
    IF NOT FOUND THEN
      INSERT INTO public.site_content (key, value) VALUES (k, v);
    END IF;
  END LOOP;
END $$;
