-- ================================================
-- MANUAL DATABASE MIGRATION FOR SEO CAMPAIGNS UNIFICATION
-- ================================================
-- Please copy and paste these SQL statements into your Supabase SQL Editor
-- and execute them one by one to complete the SEO campaigns data unification.

-- ================================================
-- STEP 1: Add seo_campaign_id column to blog_posts
-- ================================================
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS seo_campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_seo_campaign_id ON public.blog_posts(seo_campaign_id);

-- ================================================
-- STEP 2: Backfill historical blog posts into SEO campaigns
-- ================================================
-- This will group existing blog posts by user, brand, and date,
-- then create corresponding SEO campaigns and link the posts

DO $$
DECLARE
  r record;
  v_campaign_id uuid;
  v_group_date date;
  v_status text;
  v_keywords text[];
  v_num_articles int;
BEGIN
  -- Iterate over distinct groups of orphaned posts
  FOR r IN
    SELECT
      bp.user_id,
      bp.brand_id,
      COALESCE(DATE(bp.campaign_creation_date), DATE(bp.created_at)) as group_date
    FROM public.blog_posts bp
    WHERE bp.seo_campaign_id IS NULL
      AND bp.brand_id IS NOT NULL
      AND bp.user_id IS NOT NULL
    GROUP BY bp.user_id, bp.brand_id, COALESCE(DATE(bp.campaign_creation_date), DATE(bp.created_at))
  LOOP
    v_group_date := r.group_date;

    -- Aggregate group stats
    SELECT
      COUNT(*)::int,
      (CASE WHEN BOOL_AND(status = 'published') THEN 'completed' ELSE 'in_progress' END),
      COALESCE(ARRAY_AGG(DISTINCT unnest(COALESCE(bp.keywords, ARRAY[]::text[]))), ARRAY[]::text[])
    INTO v_num_articles, v_status, v_keywords
    FROM public.blog_posts bp
    WHERE bp.seo_campaign_id IS NULL
      AND bp.user_id = r.user_id
      AND bp.brand_id = r.brand_id
      AND COALESCE(DATE(bp.campaign_creation_date), DATE(bp.created_at)) = r.group_date;

    -- Insert a new seo_campaigns row representing this group
    INSERT INTO public.seo_campaigns (
      user_id,
      brand_id,
      name,
      website_url,
      business_description,
      number_of_articles,
      article_length,
      article_type,
      language,
      target_country,
      status,
      current_step,
      progress,
      organic_keywords,
      created_at,
      updated_at
    ) VALUES (
      r.user_id,
      r.brand_id,
      'SEO Campaign - ' || TO_CHAR(v_group_date, 'YYYY-MM-DD'),
      NULL,
      'Backfilled campaign from historical blog posts',
      v_num_articles,
      'medium',
      'blog',
      'English',
      'United States',
      v_status,
      CASE WHEN v_status = 'completed' THEN 'completed' ELSE 'keyword_research' END,
      CASE WHEN v_status = 'completed' THEN 100 ELSE 60 END,
      v_keywords,
      (v_group_date)::timestamptz,
      NOW()
    )
    RETURNING id INTO v_campaign_id;

    -- Link posts to the newly created campaign
    UPDATE public.blog_posts bp
    SET seo_campaign_id = v_campaign_id
    WHERE bp.seo_campaign_id IS NULL
      AND bp.user_id = r.user_id
      AND bp.brand_id = r.brand_id
      AND COALESCE(DATE(bp.campaign_creation_date), DATE(bp.created_at)) = r.group_date;

    RAISE NOTICE 'Created campaign % with % articles for user % brand %', 
      v_campaign_id, v_num_articles, r.user_id, r.brand_id;
  END LOOP;
END $$;

-- ================================================
-- STEP 3: Verify the migration worked
-- ================================================
-- Check how many SEO campaigns were created
SELECT 
  'SEO Campaigns' as table_name,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE business_description = 'Backfilled campaign from historical blog posts') as backfilled_count
FROM public.seo_campaigns
UNION ALL
SELECT 
  'Blog Posts with SEO Campaign',
  COUNT(*),
  COUNT(*) FILTER (WHERE seo_campaign_id IS NOT NULL)
FROM public.blog_posts;

-- ================================================
-- STEP 4: Test the unified view
-- ================================================
-- This should now show both new SEO campaigns and legacy campaigns
SELECT 
  source,
  COUNT(*) as campaign_count,
  COUNT(*) FILTER (WHERE JSONB_ARRAY_LENGTH(posts) > 0) as campaigns_with_posts
FROM public.v_brand_all_campaigns
GROUP BY source;

-- ================================================
-- COMPLETION
-- ================================================
-- After running these queries successfully, your SEO campaigns table
-- will contain all historical blog posts organized by date groups,
-- and the unified campaigns view will show both new SEO campaigns
-- from the Copilot and legacy blog content in a single table.

