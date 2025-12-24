-- Step 1: Remove duplicate URLs, keeping only the oldest entry per brand/user
DELETE FROM public.seo_internal_links
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY url, brand_id, user_id 
             ORDER BY created_at ASC
           ) AS row_num
    FROM public.seo_internal_links
  ) t
  WHERE t.row_num > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE public.seo_internal_links
ADD CONSTRAINT seo_internal_links_url_brand_user_unique 
UNIQUE (url, brand_id, user_id);

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_brand_user 
ON public.seo_internal_links(brand_id, user_id);