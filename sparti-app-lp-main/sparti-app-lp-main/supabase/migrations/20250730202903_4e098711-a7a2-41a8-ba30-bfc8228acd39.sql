-- Create SEO campaigns from existing published blog posts
-- Group posts by brand and create campaigns with creation dates

-- First, insert campaigns for each unique brand and date combination
INSERT INTO campaigns (
  id,
  name,
  description,
  status,
  user_id,
  search_criteria,
  keywords,
  created_at,
  updated_at,
  lead_count
)
SELECT 
  gen_random_uuid() as id,
  CONCAT(b.name, ' SEO Campaign - ', DATE(bp.published_date)) as name,
  'SEO content marketing campaign' as description,
  'completed' as status,
  bp.user_id,
  '{"type": "seo", "content_type": "blog_posts"}' as search_criteria,
  jsonb_build_array() as keywords,
  DATE(bp.published_date) as created_at,
  now() as updated_at,
  COUNT(bp.id) as lead_count
FROM blog_posts bp
JOIN brands b ON bp.brand_id = b.id
WHERE (bp.status = 'published' OR bp.cms_published = true)
  AND bp.brand_id IS NOT NULL
  AND bp.published_date IS NOT NULL
GROUP BY bp.brand_id, b.name, bp.user_id, DATE(bp.published_date)
ORDER BY DATE(bp.published_date) DESC;

-- Update blog_posts to link them to their respective campaigns
UPDATE blog_posts 
SET campaign_id = campaigns.id
FROM campaigns, brands
WHERE campaigns.name = CONCAT(brands.name, ' SEO Campaign - ', DATE(blog_posts.published_date))
  AND blog_posts.brand_id = brands.id
  AND (blog_posts.status = 'published' OR blog_posts.cms_published = true)
  AND blog_posts.published_date IS NOT NULL;