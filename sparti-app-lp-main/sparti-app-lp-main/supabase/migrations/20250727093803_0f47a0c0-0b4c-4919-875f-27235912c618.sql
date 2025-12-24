-- Insert community feedback for these places with correct verification_status values
INSERT INTO public.place_feedback (
  place_id,
  place_name,
  is_pet_friendly,
  rating,
  experience_text,
  verification_status,
  user_ip
) VALUES 
-- Bark Bangkok feedback (verification_status should be 'verified' not 'approved')
('ChIJ1234bark_bangkok', 'Bark Bangkok', true, 5, 'Amazing dog cafe! My pup loved the special dog menu and the play area.', 'verified', '127.0.0.1'),
('ChIJ1234bark_bangkok', 'Bark Bangkok', true, 5, 'Very pet-friendly staff and great atmosphere for dogs and owners.', 'verified', '127.0.0.2'),
('ChIJ1234bark_bangkok', 'Bark Bangkok', true, 4, 'Good place for dogs, though can get busy on weekends.', 'verified', '127.0.0.3'),

-- The Commons feedback
('ChIJ5678commons_bangkok', 'The Commons', true, 4, 'Great mall with outdoor areas where pets are welcome.', 'verified', '127.0.0.4'),
('ChIJ5678commons_bangkok', 'The Commons', true, 5, 'Love the pet-friendly restaurants and the outdoor setup.', 'verified', '127.0.0.5'),

-- Lumpini Park feedback
('ChIJ9012lumpini_park', 'Lumpini Park', true, 5, 'Perfect for morning walks with dogs. Very spacious and clean.', 'verified', '127.0.0.6'),
('ChIJ9012lumpini_park', 'Lumpini Park', true, 4, 'Great park for dogs, early morning is the best time.', 'verified', '127.0.0.7'),
('ChIJ9012lumpini_park', 'Lumpini Park', true, 5, 'My dog loves running here! Pet waste bins available.', 'verified', '127.0.0.8'),

-- Wagyu Beef Up feedback
('ChIJ3456wagyu_beef', 'Wagyu Beef Up', true, 5, 'Excellent restaurant with outdoor pet seating and dog treats!', 'verified', '127.0.0.9'),
('ChIJ3456wagyu_beef', 'Wagyu Beef Up', true, 4, 'Good food and pet-friendly, water bowls provided.', 'verified', '127.0.0.10'),

-- Pet First Veterinary feedback
('ChIJ7890pet_first_vet', 'Pet First Veterinary Clinic', true, 5, 'Best vet in Bangkok! 24/7 service and very caring staff.', 'verified', '127.0.0.11'),
('ChIJ7890pet_first_vet', 'Pet First Veterinary Clinic', true, 5, 'Professional service and emergency care available.', 'verified', '127.0.0.12');