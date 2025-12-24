-- Add missing column used by sample data inserts
ALTER TABLE public.place_feedback
  ADD COLUMN IF NOT EXISTS place_name text;

-- Optional index to support lookups by place and name together
CREATE INDEX IF NOT EXISTS idx_place_feedback_place_id_name
  ON public.place_feedback(place_id, place_name);


