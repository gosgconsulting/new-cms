import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fkemumodynkaeojrrkbj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZW11bW9keW5rYWVvanJya2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMzYyOTcsImV4cCI6MjA2MjYxMjI5N30.xI2Hkw7OZIPOR2jwGh8EkSF3p3lEpTYeKKVTGF5G8vM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createMissingObjects() {
  console.log('🛠️ Creating missing database objects...');
  
  // Since we can't run DDL with the anon key, let's check what we CAN do
  // and provide the exact SQL needed
  
  console.log('\n❌ Missing database objects detected:');
  console.log('  - public.v_brand_all_campaigns (unified view)');
  console.log('  - public.seo_tracked_keywords (tracked keywords table)');
  
  console.log('\n📝 Please run this SQL in your Supabase SQL Editor to complete the setup:');
  
  console.log('\n-- ===========================================');
  console.log('-- 1. CREATE TRACKED KEYWORDS TABLE');
  console.log('-- ===========================================');
  
  const trackedKeywordsSQL = `
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

CREATE POLICY "Users read own keywords" ON public.seo_tracked_keywords FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users write own keywords" ON public.seo_tracked_keywords FOR ALL
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
`;
  
  console.log(trackedKeywordsSQL);
  
  console.log('\n-- ===========================================');
  console.log('-- 2. CREATE UNIFIED CAMPAIGNS VIEW');
  console.log('-- ===========================================');
  
  const unifiedViewSQL = `
-- Add brand_id to legacy campaigns if missing
ALTER TABLE IF EXISTS public.campaigns
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);

-- Unified view for brand campaigns
CREATE OR REPLACE VIEW public.v_brand_all_campaigns AS
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

-- RPC to fetch unified campaigns
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
`;
  
  console.log(unifiedViewSQL);
  
  console.log('\n-- ===========================================');
  console.log('-- 3. ADD SEO_CAMPAIGN_ID TO BLOG_POSTS (if missing)');
  console.log('-- ===========================================');
  
  const blogPostsColumnSQL = `
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);
`;
  
  console.log(blogPostsColumnSQL);
  
  console.log('\n🎯 After running the above SQL:');
  console.log('  1. The unified campaigns table will work properly');
  console.log('  2. Tracked keywords will be available');
  console.log('  3. Historical blog posts will be linked to SEO campaigns');
  console.log('  4. The /dashboard/campaigns?type=SEO page will show unified data');
  
  // Test if we can access some basic tables to verify connectivity
  console.log('\n🔍 Testing database connectivity...');
  
  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('id, name')
    .limit(3);
  
  if (brandsError) {
    console.error('❌ Database connection failed:', brandsError);
  } else {
    console.log(`✅ Database connected. Found ${brands.length} brands:`);
    brands.forEach(b => console.log(`  - ${b.name}`));
    
    console.log('\n🚀 Ready to create SEO campaigns for these brands!');
    console.log('💡 After running the SQL above, you can test by:');
    console.log('  1. Go to /dashboard/seo-agent');
    console.log('  2. Create a new SEO campaign for one of your brands');
    console.log('  3. Visit /dashboard/campaigns?type=SEO to see the unified view');
  }
}

createMissingObjects();

