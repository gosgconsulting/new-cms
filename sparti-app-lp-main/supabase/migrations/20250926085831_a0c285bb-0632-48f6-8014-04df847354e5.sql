-- Update the update_article_sync_status function to handle URLs
CREATE OR REPLACE FUNCTION update_article_sync_status(
  p_article_id UUID,
  p_platform TEXT,
  p_status TEXT,
  p_external_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL,
  p_url TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_platform = 'wordpress' THEN
    UPDATE blog_posts
    SET wordpress_sync_status = p_status,
        wordpress_post_id = CASE WHEN p_external_id IS NOT NULL THEN p_external_id::INTEGER ELSE wordpress_post_id END,
        wordpress_sync_error = p_error_message,
        cms_url = CASE WHEN p_url IS NOT NULL THEN p_url ELSE cms_url END,
        last_wordpress_sync_at = CASE WHEN p_status = 'synced' THEN NOW() ELSE last_wordpress_sync_at END,
        updated_at = NOW()
    WHERE id = p_article_id;
  ELSIF p_platform = 'shopify' THEN
    UPDATE blog_posts
    SET shopify_sync_status = p_status,
        shopify_article_id = CASE WHEN p_external_id IS NOT NULL THEN p_external_id::BIGINT ELSE shopify_article_id END,
        shopify_sync_error = p_error_message,
        cms_url = CASE WHEN p_url IS NOT NULL THEN p_url ELSE cms_url END,
        last_shopify_sync_at = CASE WHEN p_status = 'synced' THEN NOW() ELSE last_shopify_sync_at END,
        updated_at = NOW()
    WHERE id = p_article_id;
  END IF;
END;
$$;