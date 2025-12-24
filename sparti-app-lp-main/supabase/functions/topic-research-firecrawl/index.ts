import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  url: string;
  title: string;
  description?: string;
}

interface SitemapPage {
  url: string;
  title?: string;
}

interface TopicSuggestion {
  title: string;
  keywords: string[];
  keyword_focus: string[];
  intent: string;
  outline: string[];
  word_count: number;
  internal_links?: Array<{url: string, title: string}>;
  sources?: Array<{url: string, title: string}>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brandId, keywords, location, language, topicsNumber, userId } = await req.json();

    console.log('Starting topic research with Firecrawl', {
      brandId,
      keywords,
      location,
      language,
      topicsNumber,
      userId
    });

    // Validate inputs
    if (!brandId || !keywords || keywords.length === 0 || !location || !language || !topicsNumber || !userId) {
      throw new Error('Missing required parameters');
    }

    // Get API keys
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create research entry
    const { data: research, error: researchError } = await supabase
      .from('topic_research_history')
      .insert({
        brand_id: brandId,
        user_id: userId,
        keywords: keywords,
        location: location,
        language: language,
        topics_number: topicsNumber,
        status: 'processing'
      })
      .select()
      .single();

    if (researchError || !research) {
      throw new Error(`Failed to create research entry: ${researchError?.message}`);
    }

    console.log('Created research entry:', research.id);

    // Search for each keyword using Firecrawl
    const allSearchResults: SearchResult[] = [];
    const searchesPerKeyword = Math.max(3, Math.ceil(topicsNumber / keywords.length));

    for (const keyword of keywords) {
      try {
        console.log(`Searching for keyword: ${keyword}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v2/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: keyword,
            limit: searchesPerKeyword,
            lang: language.toLowerCase(),
            country: location.toLowerCase().replace('us ', ''),
          }),
        });

        if (!searchResponse.ok) {
          console.error(`Search failed for ${keyword}:`, searchResponse.status);
          continue;
        }

        const searchData = await searchResponse.json();
        
        // Handle both array and object responses from Firecrawl
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
        
        console.log(`Found ${results.length} results for ${keyword}`);

        if (results.length > 0) {
          allSearchResults.push(...results.map((result: any) => ({
            url: result.url || result.link,
            title: result.title || result.snippet || '',
            description: result.description || result.snippet || ''
          })));
        }
      } catch (error) {
        console.error(`Error searching for ${keyword}:`, error);
      }
    }

    console.log(`Total search results collected: ${allSearchResults.length}`);

    // Remove duplicates by URL
    const uniqueResults = Array.from(
      new Map(allSearchResults.map(item => [item.url, item])).values()
    );

    // Get sitemap for internal linking
    console.log('Fetching sitemap for internal backlinks...');
    let sitemapPages: SitemapPage[] = [];
    
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
          sitemapPages = sitemapResponse.data.pages.slice(0, 50);
          console.log(`Found ${sitemapPages.length} sitemap pages`);
        }
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    }

    // Scrape top results
    const scrapedContent: Array<{ url: string; title: string; content: string }> = [];
    const urlsToScrape = uniqueResults.slice(0, Math.min(15, uniqueResults.length));

    for (const result of urlsToScrape) {
      try {
        console.log(`Scraping: ${result.url}`);
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: result.url,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 1000,
            timeout: 15000
          }),
        });

        if (!scrapeResponse.ok) {
          console.error(`Scrape failed for ${result.url}:`, scrapeResponse.status);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        
        if (scrapeData.success && scrapeData.data?.markdown) {
          const content = scrapeData.data.markdown.substring(0, 3000);
          scrapedContent.push({
            url: result.url,
            title: result.title,
            content: content
          });
        }
      } catch (error) {
        console.error(`Error scraping ${result.url}:`, error);
      }
    }

    console.log(`Successfully scraped ${scrapedContent.length} URLs`);

    // Generate topics using Lovable AI
    const contentSummary = scrapedContent.map((item, idx) => 
      `[${idx + 1}] ${item.title}\nURL: ${item.url}\nContent: ${item.content.substring(0, 500)}...`
    ).join('\n\n');

    const prompt = `Analyze the following search results for keywords: ${keywords.join(', ')}

Location: ${location}
Language: ${language}
Target: ${topicsNumber} topic suggestions

Search Results:
${contentSummary}

Based on these search results, generate ${topicsNumber} unique, engaging blog topics that:
1. Are relevant to the keywords and search intent
2. Target ${location} audience in ${language}
3. Cover different aspects and angles
4. Are SEO-friendly and compelling
5. Match the search intent (Informational, Commercial, Transactional, or Navigational)

For each topic, provide:
- title: Clear, engaging blog post title (max 60 characters)
- keywords: Array of exactly 3 keywords (1 primary keyword + 2 long-tail variations)
- keyword_focus: Array with 1-3 main keywords to target
- intent: Search intent type (Informational/Commercial/Transactional/Navigational)
- outline: Array of 5-7 H2 section titles for the article structure
- word_count: Recommended word count (between 1500-3000)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Example Blog Title",
    "keywords": ["primary keyword", "long-tail keyword 1", "long-tail keyword 2"],
    "keyword_focus": ["primary keyword"],
    "intent": "Informational",
    "outline": ["Introduction", "Section 1", "Section 2", "Section 3", "Section 4", "Conclusion"],
    "word_count": 2000
  }
]`;

    console.log('Generating topics with AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO content strategist. Generate topic suggestions in valid JSON array format.'
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
      throw new Error(`AI generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0]?.message?.content || '';
    
    console.log('AI response received');

    // Parse topics from AI response
    let topics: TopicSuggestion[] = [];
    try {
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        topics = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse topic suggestions from AI');
    }

    console.log(`Generated ${topics.length} topics`);

    // Match internal backlinks for each topic
    console.log('Matching internal backlinks for topics...');
    const topicsWithBacklinks: TopicSuggestion[] = [];
    
    for (const topic of topics) {
      let internal_links: Array<{url: string, title: string}> = [];
      
      if (sitemapPages.length > 0) {
        try {
          const backlinkPrompt = `Given this blog topic: "${topic.title}"
Keywords: ${topic.keywords.join(', ')}

Available internal pages:
${sitemapPages.slice(0, 30).map((p, i) => `${i + 1}. ${p.title || p.url}`).join('\n')}

Select the 3 most relevant internal pages (by number) that should be linked from this article for SEO value.
Consider topical relevance and keyword alignment.

Return ONLY a JSON object: { "indices": [1, 5, 12] }`;

          const backlinkResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: 'You are an SEO expert. Return only valid JSON.' },
                { role: 'user', content: backlinkPrompt }
              ],
              temperature: 0.3,
            }),
          });

          if (backlinkResponse.ok) {
            const backlinkData = await backlinkResponse.json();
            const backlinkContent = backlinkData.choices[0]?.message?.content || '{}';
            const jsonMatch = backlinkContent.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
              const result = JSON.parse(jsonMatch[0]);
              internal_links = (result.indices || [])
                .slice(0, 3)
                .map((idx: number) => sitemapPages[idx - 1])
                .filter((p: any) => p)
                .map((p: SitemapPage) => ({ url: p.url, title: p.title || p.url }));
            }
          }
        } catch (error) {
          console.error('Error matching backlinks:', error);
        }
      }
      
      // Fallback to first 2 sitemap pages if AI matching failed
      if (internal_links.length === 0 && sitemapPages.length > 0) {
        internal_links = sitemapPages.slice(0, 2).map(p => ({ url: p.url, title: p.title || p.url }));
      }

      topicsWithBacklinks.push({
        ...topic,
        internal_links,
        sources: scrapedContent.slice(0, 3).map(s => ({ url: s.url, title: s.title }))
      });
    }

    // Store topics in database
    const topicsToInsert = topicsWithBacklinks.map(topic => ({
      research_id: research.id,
      title: topic.title,
      keywords: topic.keywords,
      keyword_focus: Array.isArray(topic.keyword_focus) ? topic.keyword_focus : [topic.keyword_focus],
      intent: topic.intent,
      outline: topic.outline || [],
      word_count: topic.word_count || 2000,
      internal_links: topic.internal_links || [],
      sources: topic.sources || [],
      is_selected: false
    }));

    const { error: topicsError } = await supabase
      .from('suggested_topics')
      .insert(topicsToInsert);

    if (topicsError) {
      console.error('Error inserting topics:', topicsError);
      throw new Error(`Failed to store topics: ${topicsError.message}`);
    }

    // Update research status to completed
    const { error: updateError } = await supabase
      .from('topic_research_history')
      .update({ status: 'completed' })
      .eq('id', research.id);

    if (updateError) {
      console.error('Error updating research status:', updateError);
    }

    console.log('Topic research completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        researchId: research.id,
        topicsCount: topics.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in topic research:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});