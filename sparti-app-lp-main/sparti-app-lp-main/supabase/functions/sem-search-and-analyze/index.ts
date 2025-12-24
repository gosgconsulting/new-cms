import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clusters, location, language, landingPageUrls, brandId } = await req.json();
    
    console.log('🔎 Starting web search and ad analysis');
    console.log('Clusters:', clusters?.length);
    console.log('Location:', location, 'Language:', language);
    console.log('Landing pages:', landingPageUrls);

    // Get API keys
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Get sitemap for sitelinks
    console.log('🗺️ Fetching sitemap for sitelinks...');
    let sitemapPages: Array<{ url: string; title?: string }> = [];
    
    if (brandId) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('website')
        .eq('id', brandId)
        .single();
      
      if (brandData?.website) {
        try {
          const sitemapResponse = await supabase.functions.invoke('sitemap-scanner', {
            body: { url: brandData.website }
          });
          
          if (sitemapResponse.data?.pages) {
            sitemapPages = sitemapResponse.data.pages.slice(0, 20);
            console.log(`✅ Found ${sitemapPages.length} sitemap pages`);
          }
        } catch (error) {
          console.error('Error fetching sitemap:', error);
        }
      }
    }

    // Step 2: Search competitor ads for each cluster
    console.log('🌐 Searching for competitor ads with Firecrawl...');
    const searchResults: Array<{ cluster: any; results: any[] }> = [];
    
    for (const cluster of clusters) {
      try {
        // Take top 3 keywords from cluster for search
        const searchKeywords = cluster.keywords.slice(0, 3);
        console.log(`Searching for: ${searchKeywords.join(', ')}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v2/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchKeywords[0], // Use primary keyword
            limit: 5,
            lang: language.toLowerCase(),
            country: location.toLowerCase().replace(/\s+/g, ''),
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          let results = [];
          if (searchData.success) {
            if (Array.isArray(searchData.data)) {
              results = searchData.data;
            } else if (searchData.data && Array.isArray(searchData.data.results)) {
              results = searchData.data.results;
            } else if (searchData.data && searchData.data.organic) {
              results = searchData.data.organic;
            }
          }
          
          searchResults.push({ cluster, results });
          console.log(`✅ Found ${results.length} results for ${cluster.name}`);
        }
      } catch (error) {
        console.error(`Error searching for ${cluster.name}:`, error);
        searchResults.push({ cluster, results: [] });
      }
    }

    // Step 3: Generate ads for each cluster using OpenRouter
    console.log('🤖 Generating Google Search ads with AI...');
    const adGroups = [];

    for (const { cluster, results } of searchResults) {
      const competitorContext = results.length > 0
        ? `Competitor ads found:\n${results.slice(0, 5).map((r: any, idx: number) => 
            `${idx + 1}. ${r.title}\n   ${r.description || r.snippet || ''}`
          ).join('\n\n')}`
        : 'No competitor ads found - create compelling original ads.';

      // Generate relevant sitelink URLs from sitemap
      const relevantSitelinks = sitemapPages.length > 0
        ? sitemapPages.slice(0, 8).map((p: any) => `${p.title || 'Page'}: ${p.url}`).join('\n')
        : landingPageUrls.join('\n');

      const prompt = `You are an expert Google Ads copywriter. Generate compelling Google Search ad copy for this keyword cluster.

Ad Group Name: ${cluster.name}
Keywords: ${cluster.keywords.join(', ')}
Landing Page: ${landingPageUrls[0] || 'https://example.com'}

${competitorContext}

Generate Google Search ad components:

1. **10 Headlines** (max 30 characters each):
   - Compelling and action-oriented
   - Include main keywords naturally
   - Emphasize unique value propositions
   - Use urgency, benefits, or social proof
   - Examples: "Best [Service] | Save 30%", "Top-Rated [Product] Online", "[Product] - Fast Delivery"

2. **4 Descriptions** (max 90 characters each):
   - Expand on benefits and features
   - Include call-to-action
   - Mention guarantees, offers, or unique selling points
   - Examples: "Shop premium [product] with free shipping. 30-day money-back guarantee. Order now!", "Get expert [service] at competitive rates. 24/7 support. Book your free consultation today."

3. **4 Sitelinks** (from available pages):
Available pages for sitelinks:
${relevantSitelinks}

Each sitelink needs:
- Title (max 25 characters) - CTR-optimized and clear
- URL (pick from available pages above, or use landing page)
- 2 Descriptions (max 35 characters each) - Brief benefit/feature

Return ONLY valid JSON:
{
  "headlines": ["headline 1", "headline 2", ...], // exactly 10
  "descriptions": ["desc 1", "desc 2", ...], // exactly 4
  "sitelinks": [
    {
      "title": "Sitelink Title",
      "url": "https://...",
      "descriptions": ["desc 1", "desc 2"]
    }
  ] // exactly 4
}`;

      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': landingPageUrls[0] || 'https://smooj.ai',
          'X-Title': 'SMOOJ - SEM Ad Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert Google Ads copywriter. Generate ad copy in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
        }),
      });

      if (!aiResponse.ok) {
        console.error(`AI generation failed for ${cluster.name}`);
        continue;
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0]?.message?.content || '{}';
      
      // Parse ad components
      let adComponents: any = {};
      try {
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          adComponents = JSON.parse(jsonMatch[0]);
        } else {
          adComponents = JSON.parse(aiContent);
        }
      } catch (parseError) {
        console.error(`Failed to parse ad components for ${cluster.name}`);
        continue;
      }

      adGroups.push({
        id: cluster.id,
        name: cluster.name,
        keywords: cluster.keywords,
        headlines: (adComponents.headlines || []).slice(0, 10),
        descriptions: (adComponents.descriptions || []).slice(0, 4),
        sitelinks: (adComponents.sitelinks || []).slice(0, 4)
      });

      console.log(`✅ Generated ads for ${cluster.name}`);
    }

    console.log(`🎯 Generated ${adGroups.length} ad groups`);

    return new Response(
      JSON.stringify({ success: true, adGroups }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in sem-search-and-analyze:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
