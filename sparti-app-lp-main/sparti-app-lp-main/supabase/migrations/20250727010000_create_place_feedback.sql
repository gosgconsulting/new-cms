-- Base table used by public functions and later ALTER statements
-- Creates public.place_feedback with the columns referenced by downstream code

CREATE TABLE IF NOT EXISTS public.place_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id text NOT NULL,
  is_pet_friendly boolean,
  rating integer,
  experience_text text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_ip text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS and permissive base policies (later migrations overwrite/drop as needed)
ALTER TABLE public.place_feedback ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'place_feedback' AND policyname = 'Anyone can submit place feedback'
  ) THEN
    DROP POLICY "Anyone can submit place feedback" ON public.place_feedback;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'place_feedback' AND policyname = 'Anyone can view place feedback'
  ) THEN
    DROP POLICY "Anyone can view place feedback" ON public.place_feedback;
  END IF;
END $$;

CREATE POLICY "Anyone can submit place feedback"
ON public.place_feedback
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view place feedback"
ON public.place_feedback
FOR SELECT
USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_place_feedback_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_place_feedback_updated_at ON public.place_feedback;
CREATE TRIGGER trg_update_place_feedback_updated_at
BEFORE UPDATE ON public.place_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_place_feedback_updated_at();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_place_feedback_place_id ON public.place_feedback(place_id);
CREATE INDEX IF NOT EXISTS idx_place_feedback_user_id ON public.place_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_place_feedback_rating ON public.place_feedback(rating);



