import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { sessionData } = await req.json();
    console.log('Starting automated workflow for session:', sessionData);

    // Step 1: Keyword Extraction
    console.log('Step 1: Extracting keywords...');
    const keywordResponse = await supabase.functions.invoke('quick-setup-keyword-extraction', {
      body: { 
        website_url: sessionData.website_url,
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        sessionData 
      },
      headers: { Authorization: authHeader }
    });

    if (keywordResponse.error) {
      throw new Error(`Keyword extraction failed: ${keywordResponse.error.message}`);
    }

    const keywords = keywordResponse.data?.keywords || [];
    console.log(`Extracted ${keywords.length} keywords`);

    // Step 2: Longtail Variants
    console.log('Step 2: Generating longtail variants...');
    const longtailResponse = await supabase.functions.invoke('quick-setup-longtail-variants', {
      body: { 
        keywords,
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        sessionData 
      },
      headers: { Authorization: authHeader }
    });

    if (longtailResponse.error) {
      throw new Error(`Longtail generation failed: ${longtailResponse.error.message}`);
    }

    const expandedKeywords = longtailResponse.data?.keywords || keywords;
    console.log(`Generated ${expandedKeywords.length} keyword variants`);

    // Step 3: Source Discovery
    console.log('Step 3: Discovering sources...');
    const sourceDiscoveryResponse = await supabase.functions.invoke('quick-setup-source-discovery', {
      body: { 
        keywords: expandedKeywords.slice(0, 10), // Limit to top 10 keywords
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        sessionData 
      },
      headers: { Authorization: authHeader }
    });

    if (sourceDiscoveryResponse.error) {
      throw new Error(`Source discovery failed: ${sourceDiscoveryResponse.error.message}`);
    }

    const sources = sourceDiscoveryResponse.data?.sources || [];
    console.log(`Discovered ${sources.length} sources`);

    // Step 4: Source Fetching
    console.log('Step 4: Fetching source content...');
    const sourceFetchingResponse = await supabase.functions.invoke('quick-setup-source-fetching', {
      body: { 
        sources: sources.slice(0, 20), // Limit to top 20 sources
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        sessionData 
      },
      headers: { Authorization: authHeader }
    });

    if (sourceFetchingResponse.error) {
      console.warn('Source fetching partial failure:', sourceFetchingResponse.error);
    }

    const fetchedSources = sourceFetchingResponse.data?.sources || sources;
    console.log(`Fetched content for ${fetchedSources.length} sources`);

    // Step 5: Backlink Discovery (if enabled)
    console.log('Step 5: Discovering backlinks...');
    let backlinks = [];
    const backlinkTypes = [];
    if (sessionData.internal_links) backlinkTypes.push('internal');
    if (sessionData.external_links) backlinkTypes.push('external');
    
    if (backlinkTypes.length > 0) {
      const backlinkResponse = await supabase.functions.invoke('quick-setup-backlink-discovery', {
        body: {
          websiteUrl: sessionData.website_url,
          keywords: expandedKeywords.slice(0, 20),
          topics: [],
          types: backlinkTypes,
          brandId: sessionData.brand_id,
          userId: sessionData.user_id,
          sources: fetchedSources,
        },
        headers: { Authorization: authHeader }
      });

      if (backlinkResponse.error) {
        console.warn('Backlink discovery failed:', backlinkResponse.error);
      } else {
        backlinks = backlinkResponse.data?.backlinks || [];
        console.log(`Discovered ${backlinks.length} backlinks (internal: ${backlinks.filter((b: any) => b.type === 'internal').length}, external: ${backlinks.filter((b: any) => b.type === 'external').length})`);
      }
    }

    // Step 6: Topic Generation
    console.log('Step 6: Generating topics...');
    const topicResponse = await supabase.functions.invoke('quick-setup-topic-generation', {
      body: { 
        keywords: expandedKeywords,
        longtailKeywords: expandedKeywords,
        sources: fetchedSources,
        competitors: sessionData.competitors || [],
        websiteUrl: sessionData.website_url,
        language: sessionData.content_language || 'en',
        existingBlogTopics: sessionData.existing_blog_topics || [],
        topicCount: sessionData.topic_count || 12,
        brandMentions: sessionData.brand_mentions ?? true,
        competitorMentions: sessionData.competitor_mentions ?? true,
        internalLinks: sessionData.internal_links ?? true,
        externalLinks: sessionData.external_links ?? true,
        aiFeaturedImage: sessionData.ai_featured_image ?? true,
      },
      headers: { Authorization: authHeader }
    });

    if (topicResponse.error) {
      throw new Error(`Topic generation failed: ${topicResponse.error.message}`);
    }

    let topics = topicResponse.data?.topics || [];
    
    // Match backlinks with topics
    if (backlinks.length > 0) {
      topics = topics.map((topic: any) => {
        const matchedBacklinks = backlinks.filter((backlink: any) => {
          const backlinkKeywordLower = backlink.keyword.toLowerCase();
          const primaryKeywordLower = topic.primary_keyword.toLowerCase();
          const secondaryKeywordsLower = topic.secondary_keywords.map((k: string) => k.toLowerCase());
          
          if (backlinkKeywordLower.includes(primaryKeywordLower) || primaryKeywordLower.includes(backlinkKeywordLower)) {
            return true;
          }
          
          return secondaryKeywordsLower.some((sk: string) => 
            backlinkKeywordLower.includes(sk) || sk.includes(backlinkKeywordLower)
          );
        });
        
        return {
          ...topic,
          matched_backlinks: matchedBacklinks
        };
      });
      console.log(`Matched backlinks to ${topics.length} topics`);
    }
    
    console.log(`Generated ${topics.length} topics`);

    // Step 7: Intent Analysis
    console.log('Step 7: Analyzing intent...');
    const intentResponse = await supabase.functions.invoke('quick-setup-intent-analysis', {
      body: { 
        topics,
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        sessionData 
      },
      headers: { Authorization: authHeader }
    });

    if (intentResponse.error) {
      console.warn('Intent analysis partial failure:', intentResponse.error);
    }

    const analyzedTopics = intentResponse.data?.topics || topics;
    console.log(`Analyzed intent for ${analyzedTopics.length} topics`);

    // Step 8: Bulk Article Generation
    console.log('Step 8: Generating articles...');
    const articleResponse = await supabase.functions.invoke('seo-bulk-article-generator', {
      body: {
        topics: analyzedTopics,
        brand_id: sessionData.brand_id,
        user_id: sessionData.user_id,
        campaign_id: sessionData.campaign_id,
        settings: {
          content_language: sessionData.content_language,
          content_country: sessionData.content_country,
          brand_mentions: sessionData.brand_mentions,
          competitor_mentions: sessionData.competitor_mentions,
          internal_links: sessionData.internal_links,
          external_links: sessionData.external_links,
          ai_featured_image: sessionData.ai_featured_image,
        }
      },
      headers: { Authorization: authHeader }
    });

    if (articleResponse.error) {
      console.warn('Article generation started but may have errors:', articleResponse.error);
    }

    console.log('Automated workflow completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Automated workflow completed successfully',
      data: {
        keywords: expandedKeywords.length,
        sources: fetchedSources.length,
        topics: analyzedTopics.length,
        articles: analyzedTopics.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Automated workflow error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
