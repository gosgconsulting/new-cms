-- Add WordPress and Shopify sync status columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS wordpress_post_id INTEGER,
ADD COLUMN IF NOT EXISTS wordpress_sync_status TEXT DEFAULT 'not_synced' CHECK (wordpress_sync_status IN ('not_synced', 'syncing', 'synced', 'sync_error')),
ADD COLUMN IF NOT EXISTS wordpress_sync_error TEXT,
ADD COLUMN IF NOT EXISTS last_wordpress_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shopify_article_id BIGINT,
ADD COLUMN IF NOT EXISTS shopify_sync_status TEXT DEFAULT 'not_synced' CHECK (shopify_sync_status IN ('not_synced', 'syncing', 'synced', 'sync_error')),
ADD COLUMN IF NOT EXISTS shopify_sync_error TEXT,
ADD COLUMN IF NOT EXISTS last_shopify_sync_at TIMESTAMP WITH TIME ZONE;

-- Create function to sync article to WordPress
CREATE OR REPLACE FUNCTION sync_article_to_wordpress(
  p_article_id UUID,
  p_brand_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  article_record RECORD;
  wp_integration RECORD;
  result JSONB;
BEGIN
  -- Check if user has access to the article
  SELECT * INTO article_record
  FROM blog_posts
  WHERE id = p_article_id 
    AND brand_id = p_brand_id 
    AND user_id = p_user_id;
    
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Article not found or access denied');
  END IF;
  
  -- Get WordPress integration for brand
  SELECT * INTO wp_integration
  FROM wordpress_integrations
  WHERE brand_id = p_brand_id AND is_connected = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'WordPress integration not found or not connected');
  END IF;
  
  -- Update sync status to syncing
  UPDATE blog_posts
  SET wordpress_sync_status = 'syncing',
      updated_at = NOW()
  WHERE id = p_article_id;
  
  -- Return the data needed for the sync
  RETURN jsonb_build_object(
    'success', true,
    'article', row_to_json(article_record),
    'integration', jsonb_build_object(
      'site_url', wp_integration.site_url,
      'username', wp_integration.username,
      'application_password', wp_integration.application_password
    )
  );
END;
$$;

-- Create function to sync article to Shopify
CREATE OR REPLACE FUNCTION sync_article_to_shopify(
  p_article_id UUID,
  p_brand_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  article_record RECORD;
  shopify_integration RECORD;
  result JSONB;
BEGIN
  -- Check if user has access to the article
  SELECT * INTO article_record
  FROM blog_posts
  WHERE id = p_article_id 
    AND brand_id = p_brand_id 
    AND user_id = p_user_id;
    
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Article not found or access denied');
  END IF;
  
  -- Get Shopify integration for brand
  SELECT * INTO shopify_integration
  FROM shopify_integrations
  WHERE brand_id = p_brand_id AND is_connected = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Shopify integration not found or not connected');
  END IF;
  
  -- Update sync status to syncing
  UPDATE blog_posts
  SET shopify_sync_status = 'syncing',
      updated_at = NOW()
  WHERE id = p_article_id;
  
  -- Return the data needed for the sync
  RETURN jsonb_build_object(
    'success', true,
    'article', row_to_json(article_record),
    'integration', jsonb_build_object(
      'store_url', shopify_integration.store_url,
      'api_secret_key', shopify_integration.api_secret_key
    )
  );
END;
$$;

-- Create function to update sync status
CREATE OR REPLACE FUNCTION update_article_sync_status(
  p_article_id UUID,
  p_platform TEXT,
  p_status TEXT,
  p_external_id TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
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
        last_wordpress_sync_at = CASE WHEN p_status = 'synced' THEN NOW() ELSE last_wordpress_sync_at END,
        updated_at = NOW()
    WHERE id = p_article_id;
  ELSIF p_platform = 'shopify' THEN
    UPDATE blog_posts
    SET shopify_sync_status = p_status,
        shopify_article_id = CASE WHEN p_external_id IS NOT NULL THEN p_external_id::BIGINT ELSE shopify_article_id END,
        shopify_sync_error = p_error_message,
        last_shopify_sync_at = CASE WHEN p_status = 'synced' THEN NOW() ELSE last_shopify_sync_at END,
        updated_at = NOW()
    WHERE id = p_article_id;
  END IF;
END;
$$;