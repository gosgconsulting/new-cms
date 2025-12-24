-- Fix the campaign creation date mismatch for Selenightco blog posts
-- Update blog posts to match the existing campaign date (2025-07-17)
UPDATE blog_posts 
SET campaign_creation_date = '2025-07-17T12:42:40.35844+00:00'
WHERE brand_id = '7e6fc74a-8d0a-442e-9a8f-5f6bda3036d9' 
  AND campaign_creation_date = '2025-07-30T00:00:00+00:00';