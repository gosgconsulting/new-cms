-- =====================================================
-- FINAL SEO CAMPAIGNS UNIFICATION DATABASE SETUP
-- =====================================================
-- Copy and paste this entire SQL block into your Supabase SQL Editor
-- and execute it to complete the SEO campaigns unification.

-- Step 1: Create tracked keywords table
CREATE TABLE IF NOT EXISTS public.seo_tracked_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  keyword TEXT NOT NULL,
  intents TEXT[] NOT NULL DEFAULT '{}',
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, brand_id, keyword)
);

ALTER TABLE public.seo_tracked_keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own keywords" ON public.seo_tracked_keywords;
DROP POLICY IF EXISTS "Users write own keywords" ON public.seo_tracked_keywords;

CREATE POLICY "Users read own keywords" ON public.seo_tracked_keywords FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users write own keywords" ON public.seo_tracked_keywords FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 2: Add brand_id to legacy campaigns (if missing)
ALTER TABLE IF EXISTS public.campaigns
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);

-- Step 3: Add seo_campaign_id to blog_posts (if missing)
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);

-- Step 4: Create unified campaigns view
DROP VIEW IF EXISTS public.v_brand_all_campaigns;

CREATE VIEW public.v_brand_all_campaigns AS
SELECT
  s.id,
  'seo'::text AS source,
  s.user_id,
  s.brand_id,
  ('SEO Campaign - ' || TO_CHAR(s.created_at, 'YYYY-MM-DD')) AS name,
  s.business_description AS description,
  (CASE s.status WHEN 'in_progress' THEN 'in_progress' WHEN 'completed' THEN 'completed' WHEN 'failed' THEN 'failed' ELSE 'to_write' END) AS status,
  s.created_at,
  s.updated_at,
  COALESCE(s.organic_keywords, ARRAY[]::text[]) AS keywords,
  s.number_of_articles,
  s.article_length,
  COALESCE((
    SELECT JSONB_AGG(JSONB_BUILD_OBJECT('id', bp.id, 'title', bp.title, 'status', bp.status, 'cms_url', bp.cms_url, 'created_at', bp.created_at) ORDER BY bp.created_at DESC)
    FROM public.blog_posts bp WHERE bp.seo_campaign_id = s.id
  ), '[]'::jsonb) AS posts,
  JSONB_BUILD_OBJECT('style_analysis', s.style_analysis, 'live_analysis', s.live_analysis) AS meta
FROM public.seo_campaigns s
UNION ALL
SELECT
  c.id,
  'legacy'::text AS source,
  c.user_id,
  c.brand_id,
  c.name,
  c.description,
  (CASE c.status WHEN 'active' THEN 'in_progress' WHEN 'completed' THEN 'completed' ELSE 'to_write' END) AS status,
  c.created_at,
  c.updated_at,
  COALESCE(ARRAY(SELECT JSONB_ARRAY_ELEMENTS_TEXT(c.search_criteria->'keywords')), ARRAY[]::text[]) AS keywords,
  NULL::int AS number_of_articles,
  NULL::text AS article_length,
  '[]'::jsonb AS posts,
  c.search_criteria AS meta
FROM public.campaigns c;

-- Step 5: Create RPC function for fetching unified campaigns
DROP FUNCTION IF EXISTS public.get_brand_campaigns(UUID, UUID, TEXT, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION public.get_brand_campaigns(
  p_user_id UUID,
  p_brand_id UUID,
  p_status TEXT DEFAULT NULL,
  p_since TIMESTAMPTZ DEFAULT NULL
)
RETURNS SETOF public.v_brand_all_campaigns
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.v_brand_all_campaigns v
  WHERE v.user_id = p_user_id
    AND (p_brand_id IS NULL OR v.brand_id = p_brand_id)
    AND (p_status IS NULL OR v.status = p_status)
    AND (p_since IS NULL OR v.created_at >= p_since)
  ORDER BY v.created_at DESC;
$$;

-- Step 6: Verify setup (optional check)
SELECT 
  'Setup verification' AS step,
  COUNT(*) AS table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('seo_campaigns', 'seo_tracked_keywords', 'blog_posts', 'campaigns', 'brands');

-- Show current brands for reference
SELECT 'Current brands' AS info, name, id FROM public.brands ORDER BY name;

-- All done! Your SEO campaigns unification is now complete.

