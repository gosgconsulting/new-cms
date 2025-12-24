-- Quick migration: Add column and backfill blog posts into SEO campaigns

-- Add column
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);

-- Backfill data (simplified single statement approach)
WITH orphaned_groups AS (
  SELECT 
    user_id,
    brand_id,
    COALESCE(DATE(campaign_creation_date), DATE(created_at)) as group_date,
    COUNT(*) as num_articles,
    CASE WHEN BOOL_AND(status = 'published') THEN 'completed' ELSE 'in_progress' END as status,
    ARRAY_AGG(DISTINCT unnest(COALESCE(keywords, ARRAY[]::text[]))) as keywords
  FROM public.blog_posts 
  WHERE seo_campaign_id IS NULL 
    AND brand_id IS NOT NULL 
    AND user_id IS NOT NULL
  GROUP BY user_id, brand_id, COALESCE(DATE(campaign_creation_date), DATE(created_at))
),
new_campaigns AS (
  INSERT INTO public.seo_campaigns (
    user_id, brand_id, name, business_description, number_of_articles,
    article_length, article_type, language, target_country, status,
    current_step, progress, organic_keywords, created_at, updated_at
  )
  SELECT 
    user_id, brand_id,
    'SEO Campaign - ' || TO_CHAR(group_date, 'YYYY-MM-DD'),
    'Backfilled campaign from historical blog posts',
    num_articles, 'medium', 'blog', 'English', 'United States', status,
    CASE WHEN status = 'completed' THEN 'completed' ELSE 'keyword_research' END,
    CASE WHEN status = 'completed' THEN 100 ELSE 60 END,
    keywords, group_date::timestamptz, NOW()
  FROM orphaned_groups
  RETURNING id, user_id, brand_id, DATE(created_at) as group_date
)
UPDATE public.blog_posts bp
SET seo_campaign_id = nc.id
FROM new_campaigns nc
WHERE bp.seo_campaign_id IS NULL
  AND bp.user_id = nc.user_id
  AND bp.brand_id = nc.brand_id
  AND COALESCE(DATE(bp.campaign_creation_date), DATE(bp.created_at)) = nc.group_date;

