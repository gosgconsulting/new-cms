-- Add missing source column to selected_topics table
ALTER TABLE public.selected_topics 
ADD COLUMN IF NOT EXISTS source text;