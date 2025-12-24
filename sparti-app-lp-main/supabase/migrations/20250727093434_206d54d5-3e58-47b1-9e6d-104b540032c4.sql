-- First, check the constraint on place_feedback table
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.place_feedback'::regclass 
AND contype = 'c';

-- Insert sample venues without the problematic place_feedback for now (with conflict handling)
INSERT INTO public.venues (
  place_id, 
  name, 
  formatted_address, 
  latitude, 
  longitude, 
  rating, 
  user_ratings_total, 
  types, 
  primary_type, 
  phone_number, 
  website, 
  is_pet_friendly, 
  pet_friendly_verified_at,
  pet_friendly_evidence,
  google_data
) VALUES 
-- Bark Bangkok (Dog Cafe)
(
  'ChIJ1234bark_bangkok',
  'Bark Bangkok',
  '123 Sukhumvit Road, Watthana, Bangkok 10110, Thailand',
  13.7563,
  100.5018,
  4.5,
  150,
  ARRAY['restaurant', 'cafe', 'pet_store'],
  'cafe',
  '+66 2 123 4567',
  'https://barkbangkok.com',
  true,
  now(),
  '{"pet_menu": true, "dog_area": true, "pet_toys": true, "water_bowls": true}',
  '{"name": "Bark Bangkok", "types": ["restaurant", "cafe"], "business_status": "OPERATIONAL"}'
),
-- The Commons (Pet-friendly mall)
(
  'ChIJ5678commons_bangkok',
  'The Commons',
  '335 Thong Lo Road, Watthana, Bangkok 10110, Thailand',
  13.7307,
  100.5418,
  4.3,
  2500,
  ARRAY['shopping_mall', 'restaurant'],
  'shopping_mall',
  '+66 2 712 5000',
  'https://thecommons.co.th',
  true,
  now(),
  '{"pet_friendly_areas": true, "pet_shops": true, "outdoor_dining": true}',
  '{"name": "The Commons", "types": ["shopping_mall"], "business_status": "OPERATIONAL"}'
),
-- Lumpini Park (Dog-friendly park)
(
  'ChIJ9012lumpini_park',
  'Lumpini Park',
  'Rama IV Road, Pathumwan, Bangkok 10330, Thailand',
  13.7307,
  100.5418,
  4.4,
  8000,
  ARRAY['park', 'tourist_attraction'],
  'park',
  null,
  null,
  true,
  now(),
  '{"dog_walking_areas": true, "morning_exercise": true, "pet_waste_bins": true}',
  '{"name": "Lumpini Park", "types": ["park"], "business_status": "OPERATIONAL"}'
),
-- Wagyu Beef Up (Pet-friendly restaurant)
(
  'ChIJ3456wagyu_beef',
  'Wagyu Beef Up',
  '456 Thong Lo Road, Watthana, Bangkok 10110, Thailand',
  13.7200,
  100.5500,
  4.6,
  300,
  ARRAY['restaurant', 'food'],
  'restaurant',
  '+66 2 345 6789',
  'https://wagyubeefup.com',
  true,
  now(),
  '{"outdoor_seating": true, "pet_menu": true, "water_bowls": true}',
  '{"name": "Wagyu Beef Up", "types": ["restaurant"], "business_status": "OPERATIONAL"}'
),
-- Pet First Veterinary Clinic
(
  'ChIJ7890pet_first_vet',
  'Pet First Veterinary Clinic',
  '789 Sukhumvit 39, Watthana, Bangkok 10110, Thailand',
  13.7400,
  100.5600,
  4.7,
  450,
  ARRAY['veterinary_care', 'pet_store'],
  'veterinary_care',
  '+66 2 789 0123',
  'https://petfirst.co.th',
  true,
  now(),
  '{"24_hour_service": true, "emergency_care": true, "pet_grooming": true}',
  '{"name": "Pet First Veterinary Clinic", "types": ["veterinary_care"], "business_status": "OPERATIONAL"}'
) ON CONFLICT (place_id) DO NOTHING;