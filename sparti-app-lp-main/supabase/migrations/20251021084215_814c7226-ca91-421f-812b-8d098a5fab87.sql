-- Consolidate existing campaigns into one per brand (simplified version)

DO $$
DECLARE
  brand_record RECORD;
  consolidated_campaign_id UUID;
  campaign_name TEXT;
  total_articles INT;
  first_campaign RECORD;
BEGIN
  -- Loop through each brand that has campaigns
  FOR brand_record IN 
    SELECT DISTINCT 
      sc.brand_id,
      sc.user_id,
      b.name as brand_name
    FROM public.seo_campaigns sc
    LEFT JOIN public.brands b ON b.id = sc.brand_id
    WHERE sc.brand_id IS NOT NULL
  LOOP
    -- Count total articles for this brand
    SELECT COUNT(*) INTO total_articles
    FROM public.blog_posts
    WHERE brand_id = brand_record.brand_id;
    
    -- Generate consolidated campaign name
    campaign_name := COALESCE(brand_record.brand_name, 'Brand') || ' - Content Campaign';
    
    -- Check if a consolidated campaign already exists
    SELECT id INTO consolidated_campaign_id
    FROM public.seo_campaigns
    WHERE brand_id = brand_record.brand_id
      AND user_id = brand_record.user_id
      AND name = campaign_name
    LIMIT 1;
    
    -- If no consolidated campaign exists, create one
    IF consolidated_campaign_id IS NULL THEN
      -- Get the first campaign data for this brand
      SELECT 
        website_url,
        business_description,
        article_length,
        article_type,
        language,
        target_country,
        extracted_keywords,
        created_at
      INTO first_campaign
      FROM public.seo_campaigns
      WHERE brand_id = brand_record.brand_id
        AND user_id = brand_record.user_id
      ORDER BY created_at ASC
      LIMIT 1;
      
      -- Create consolidated campaign
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
        extracted_keywords,
        created_at,
        updated_at
      ) VALUES (
        brand_record.user_id,
        brand_record.brand_id,
        campaign_name,
        COALESCE(first_campaign.website_url, 'https://example.com'),
        COALESCE(first_campaign.business_description, 'Consolidated campaign'),
        total_articles,
        COALESCE(first_campaign.article_length, 'medium'),
        COALESCE(first_campaign.article_type, 'article'),
        COALESCE(first_campaign.language, 'en'),
        COALESCE(first_campaign.target_country, 'us'),
        'active',
        COALESCE(first_campaign.extracted_keywords, '[]'::jsonb),
        COALESCE(first_campaign.created_at, NOW()),
        NOW()
      )
      RETURNING id INTO consolidated_campaign_id;
    END IF;
    
    -- Update all blog posts to point to consolidated campaign
    UPDATE public.blog_posts
    SET seo_campaign_id = consolidated_campaign_id
    WHERE brand_id = brand_record.brand_id
      AND (seo_campaign_id IS NULL OR seo_campaign_id != consolidated_campaign_id);
    
    -- Update quick setup sessions if campaign_id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quick_setup_sessions' AND column_name = 'campaign_id'
    ) THEN
      UPDATE public.quick_setup_sessions
      SET campaign_id = consolidated_campaign_id
      WHERE brand_id = brand_record.brand_id
        AND (campaign_id IS NULL OR campaign_id != consolidated_campaign_id);
    END IF;
    
    -- Update topic research history if campaign_id column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'topic_research_history' AND column_name = 'campaign_id'
    ) THEN
      UPDATE public.topic_research_history
      SET campaign_id = consolidated_campaign_id
      WHERE brand_id = brand_record.brand_id
        AND (campaign_id IS NULL OR campaign_id != consolidated_campaign_id);
    END IF;
    
    -- Delete old campaigns for this brand (keep only the consolidated one)
    DELETE FROM public.seo_campaigns
    WHERE brand_id = brand_record.brand_id
      AND user_id = brand_record.user_id
      AND id != consolidated_campaign_id;
      
  END LOOP;
END $$;