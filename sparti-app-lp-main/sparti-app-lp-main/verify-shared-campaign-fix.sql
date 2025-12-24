-- Check if the get_shared_campaign_posts function has the correct signature
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_shared_campaign_posts' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if the update_shared_campaign_post function has the correct signature
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'update_shared_campaign_post' 
  AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Check if there are any campaign shares
SELECT COUNT(*) AS share_count FROM public.campaign_shares;

-- Check if there are any campaign share articles
SELECT COUNT(*) AS share_article_count FROM public.campaign_share_articles;

-- Check a specific shared campaign (replace 'seo-20250716-7' with your actual slug)
SELECT cs.*, COUNT(csa.post_id) AS post_count
FROM public.campaign_shares cs
LEFT JOIN public.campaign_share_articles csa ON cs.id = csa.share_id
WHERE cs.slug = 'seo-20250716-7'
GROUP BY cs.id;
