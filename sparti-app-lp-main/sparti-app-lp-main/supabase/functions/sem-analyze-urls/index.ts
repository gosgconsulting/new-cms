import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandId, websiteUrl, landingPageUrls, objectives } = await req.json();
    
    console.log('🔍 Analyzing landing pages for SEM campaign');
    console.log('Brand ID:', brandId);
    console.log('Website:', websiteUrl);
    console.log('Landing pages:', landingPageUrls);
    console.log('Objectives:', objectives);

    // Get API keys
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    // Step 1: Scrape each landing page using Firecrawl
    console.log('📄 Scraping landing pages with Firecrawl...');
    const scrapedPages: Array<{ url: string; content: string }> = [];
    
    for (const url of landingPageUrls) {
      if (!url.trim()) continue;
      
      try {
        console.log(`Scraping: ${url}`);
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 1000,
            timeout: 15000
          }),
        });

        if (!scrapeResponse.ok) {
          console.error(`Scrape failed for ${url}:`, scrapeResponse.status);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        
        if (scrapeData.success && scrapeData.data?.markdown) {
          const content = scrapeData.data.markdown.substring(0, 5000);
          scrapedPages.push({ url, content });
          console.log(`✅ Successfully scraped ${url}`);
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }

    console.log(`📊 Scraped ${scrapedPages.length} landing pages`);

    if (scrapedPages.length === 0) {
      throw new Error('Failed to scrape any landing pages');
    }

    // Step 2: Generate keyword clusters using OpenRouter
    console.log('🤖 Generating keyword clusters with AI...');
    
    const pagesSummary = scrapedPages.map((page, idx) => 
      `Landing Page ${idx + 1}: ${page.url}\nContent Preview:\n${page.content.substring(0, 1000)}`
    ).join('\n\n---\n\n');

    const prompt = `You are an expert Google Ads SEM strategist. Analyze the following landing pages and generate keyword clusters for a paid search campaign.

Website: ${websiteUrl}
Objectives: ${objectives || 'Drive conversions and sales'}

Landing Pages Content:
${pagesSummary}

Generate 3-5 keyword clusters that are:
1. **Highly transactional/commercial** - Focus on keywords that indicate buying intent (e.g., "buy", "pricing", "quote", "order", "service", "hire", "best", "deals")
2. **Relevant to the landing page content** - Keywords should match what's actually on the pages
3. **Google Ads optimized** - Suitable for paid search campaigns
4. **Specific and actionable** - Avoid generic or overly broad keywords

For each cluster:
- Give it a clear, descriptive name (e.g., "Product Pricing", "Service Packages", "Buy Solutions")
- Include 8-12 high-intent commercial keywords
- Focus on exact match and phrase match opportunities
- Include location/urgency modifiers where relevant

Return ONLY a valid JSON array:
[
  {
    "id": "cluster-1",
    "name": "Cluster Name",
    "keywords": ["keyword 1", "keyword 2", ...]
  }
]`;

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': websiteUrl || 'https://smooj.ai',
        'X-Title': 'SMOOJ - SEM Campaign Builder'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Google Ads SEM strategist. Generate keyword clusters for paid search campaigns in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || '';
    
    console.log('✅ AI response received');

    // Parse keyword clusters from AI response
    let clusters: Array<{ id: string; name: string; keywords: string[] }> = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        clusters = JSON.parse(jsonMatch[0]);
      } else {
        clusters = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response:', aiContent);
      throw new Error('Failed to parse keyword clusters from AI');
    }

    console.log(`🎯 Generated ${clusters.length} keyword clusters`);

    return new Response(
      JSON.stringify({ success: true, clusters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in sem-analyze-urls:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
