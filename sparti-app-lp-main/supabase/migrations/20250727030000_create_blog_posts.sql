-- Create base blog_posts table so later migrations can ALTER it safely
-- This migration must run before any other migration that references public.blog_posts

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  title text,
  content text,
  meta_description text,
  keywords text[] DEFAULT '{}',
  author text,
  status text DEFAULT 'draft',
  published_date timestamptz,
  scheduled_date timestamptz,
  cms_published boolean DEFAULT false,
  cms_url text,
  slug text UNIQUE,
  -- Added early so later backfills can use it without errors
  campaign_creation_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Basic FKs (use ON DELETE SET NULL to be lenient locally)
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_brand_id_fkey
  FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE CASCADE;

-- RLS setup
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'blog_posts' AND policyname = 'Users manage own blog posts'
  ) THEN
    DROP POLICY "Users manage own blog posts" ON public.blog_posts;
  END IF;
END $$;

CREATE POLICY "Users manage own blog posts"
ON public.blog_posts
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_blog_posts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_blog_posts_updated_at();

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_brand_id ON public.blog_posts(brand_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON public.blog_posts(published_date);



