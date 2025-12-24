-- Base brands table required by many later migrations

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Foreign keys
ALTER TABLE public.brands
  ADD CONSTRAINT brands_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- RLS and basic policy
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'brands' AND policyname = 'Users manage own brands'
  ) THEN
    DROP POLICY "Users manage own brands" ON public.brands;
  END IF;
END $$;

CREATE POLICY "Users manage own brands"
ON public.brands
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_brands_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_brands_updated_at ON public.brands;
CREATE TRIGGER trg_update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW
EXECUTE FUNCTION public.update_brands_updated_at();

CREATE INDEX IF NOT EXISTS idx_brands_user_id ON public.brands(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_user_name ON public.brands(user_id, name);



