-- Add use_brand_logo column to brands table
ALTER TABLE public.brands
ADD COLUMN IF NOT EXISTS use_brand_logo BOOLEAN DEFAULT true;