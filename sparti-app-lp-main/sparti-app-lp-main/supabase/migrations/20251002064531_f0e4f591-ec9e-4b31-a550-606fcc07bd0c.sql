-- Add featured_image and content_images columns to content_settings table
ALTER TABLE public.content_settings
ADD COLUMN IF NOT EXISTS featured_image BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS content_images TEXT DEFAULT 'few' CHECK (content_images IN ('none', 'few', 'regular'));