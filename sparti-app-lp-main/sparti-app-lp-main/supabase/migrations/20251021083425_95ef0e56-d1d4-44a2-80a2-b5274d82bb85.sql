-- Link campaigns with quick setup and topic research

-- Add campaign_id to quick_setup_sessions
ALTER TABLE public.quick_setup_sessions
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

-- Add campaign_id to topic_research_history
ALTER TABLE public.topic_research_history
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.seo_campaigns(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_quick_setup_sessions_campaign_id ON public.quick_setup_sessions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_topic_research_history_campaign_id ON public.topic_research_history(campaign_id);

-- Function to auto-create campaign from quick setup when topics are selected
CREATE OR REPLACE FUNCTION public.create_campaign_from_quick_setup()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_id UUID;
  v_campaign_name TEXT;
  v_keywords_array TEXT[];
BEGIN
  -- Only create campaign if selected_topics is not null and campaign_id is null
  IF NEW.selected_topics IS NOT NULL 
     AND jsonb_array_length(NEW.selected_topics) > 0 
     AND NEW.campaign_id IS NULL THEN
    
    -- Generate campaign name from website URL and timestamp
    v_campaign_name := 'Campaign - ' || COALESCE(NEW.website_url, 'Quick Setup') || ' - ' || to_char(NEW.created_at, 'YYYY-MM-DD');
    
    -- Extract keywords array from NEW.keywords
    v_keywords_array := NEW.keywords;
    
    -- Create the campaign
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
      NEW.user_id,
      NEW.brand_id,
      v_campaign_name,
      NEW.website_url,
      NEW.business_description,
      COALESCE((SELECT jsonb_array_length(NEW.selected_topics)), 0),
      NEW.article_length,
      NEW.article_type,
      NEW.language,
      NEW.target_country,
      'active',
      jsonb_build_array(
        jsonb_build_object('keyword', v_keywords_array[1], 'volume', 0)
      ),
      NEW.created_at,
      NOW()
    )
    RETURNING id INTO v_campaign_id;
    
    -- Update the quick_setup_session with campaign_id
    NEW.campaign_id := v_campaign_id;
    
    -- Insert topics into seo_topic_ideas
    INSERT INTO public.seo_topic_ideas (
      user_id,
      brand_id,
      campaign_id,
      title,
      keywords,
      search_intents,
      estimated_word_count,
      created_at,
      updated_at
    )
    SELECT 
      NEW.user_id,
      NEW.brand_id,
      v_campaign_id,
      topic->>'title',
      ARRAY(SELECT jsonb_array_elements_text(topic->'keywords')),
      ARRAY(SELECT jsonb_array_elements_text(topic->'search_intents')),
      COALESCE((topic->>'estimated_word_count')::integer, 1500),
      NOW(),
      NOW()
    FROM jsonb_array_elements(NEW.selected_topics) AS topic;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for quick_setup_sessions
DROP TRIGGER IF EXISTS trigger_create_campaign_from_quick_setup ON public.quick_setup_sessions;
CREATE TRIGGER trigger_create_campaign_from_quick_setup
  BEFORE UPDATE ON public.quick_setup_sessions
  FOR EACH ROW
  WHEN (OLD.selected_topics IS DISTINCT FROM NEW.selected_topics)
  EXECUTE FUNCTION public.create_campaign_from_quick_setup();

-- Function to auto-create campaign from topic research
CREATE OR REPLACE FUNCTION public.create_campaign_from_topic_research()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_id UUID;
  v_campaign_name TEXT;
BEGIN
  -- Only create campaign when status changes to 'completed' and campaign_id is null
  IF NEW.status = 'completed' 
     AND OLD.status != 'completed'
     AND NEW.campaign_id IS NULL THEN
    
    -- Generate campaign name
    v_campaign_name := 'Topic Research - ' || array_to_string(NEW.keywords, ', ') || ' - ' || to_char(NEW.created_at, 'YYYY-MM-DD');
    
    -- Create the campaign
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
      NEW.user_id,
      NEW.brand_id,
      v_campaign_name,
      'https://example.com', -- Default as topic research doesn't have URL
      'Generated from topic research',
      NEW.topics_number,
      'medium',
      'article',
      NEW.language,
      NEW.location,
      'active',
      (SELECT jsonb_agg(jsonb_build_object('keyword', keyword, 'volume', 0))
       FROM unnest(NEW.keywords) AS keyword),
      NEW.created_at,
      NOW()
    )
    RETURNING id INTO v_campaign_id;
    
    -- Update the topic_research_history with campaign_id
    NEW.campaign_id := v_campaign_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for topic_research_history
DROP TRIGGER IF EXISTS trigger_create_campaign_from_topic_research ON public.topic_research_history;
CREATE TRIGGER trigger_create_campaign_from_topic_research
  BEFORE UPDATE ON public.topic_research_history
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.create_campaign_from_topic_research();