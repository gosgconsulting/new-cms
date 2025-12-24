import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl, keywords, topics, types, brandId, userId, sources } = await req.json();

    console.log('Backlink discovery request:', { 
      websiteUrl, 
      keywordsCount: keywords?.length, 
      topicsCount: topics?.length,
      types,
      hasBrandId: !!brandId,
      hasUserId: !!userId,
      sourcesCount: sources?.length 
    });

    if (!types || types.length === 0) {
      return new Response(
        JSON.stringify({ backlinks: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const backlinks: Array<{ 
      url: string; 
      title: string; 
      keyword: string; 
      type: 'internal' | 'external';
      link_type?: string;
      relevance_score?: number;
    }> = [];

    // Discover internal backlinks from database
    if (types.includes('internal') && brandId && userId) {
      console.log('Discovering internal backlinks from database...');
      
      const { data: internalLinks, error: dbError } = await supabase
        .from('seo_internal_links')
        .select('url, title, link_type, language')
        .eq('brand_id', brandId)
        .eq('user_id', userId)
        .eq('type', 'Internal')
        .order('created_at', { ascending: false })
        .limit(50);

      if (dbError) {
        console.error('Error fetching internal links:', dbError);
      } else if (internalLinks && internalLinks.length > 0) {
        console.log(`Found ${internalLinks.length} internal links in database`);
        
        // Analyze internal links with AI to match with keywords
        const topKeywords = keywords.slice(0, 20);
        const linksToAnalyze = internalLinks.slice(0, 30); // Analyze top 30 links
        
        const analysisPrompt = `Analyze these internal website pages/posts/products and match them with relevant keywords for internal linking opportunities.

Internal Links:
${linksToAnalyze.map((link, i) => `${i + 1}. ${link.url} - ${link.title} (${link.link_type || 'page'})`).join('\n')}

Keywords:
${topKeywords.join(', ')}

For each internal link, determine:
1. The most relevant keyword from the list
2. A relevance score (1-10)
3. Whether it's suitable for internal linking

Return ONLY a JSON array:
[
  {
    "url": "page url",
    "title": "page title",
    "keyword": "matched keyword",
    "link_type": "page/post/product/shop",
    "relevance_score": 8
  }
]

Focus on:
- Blog posts (great for internal linking)
- Product pages (for transactional keywords)
- Resource pages (for informational content)
- Category/shop pages (for commercial keywords)

Only include links with relevance_score >= 6.`;

        const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://sparti.ai',
            'X-Title': 'Sparti AI Assistant',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3.5-sonnet',
            messages: [
              {
                role: 'system',
                content: 'You are an internal linking expert for SEO. Analyze and match pages with relevant keywords.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.5,
            max_tokens: 2000
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0]?.message?.content || '[]';
          
          try {
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const analyzedLinks = JSON.parse(jsonMatch[0]);
              
              for (const link of analyzedLinks) {
                if (link.relevance_score >= 6) {
                  backlinks.push({
                    url: link.url,
                    title: link.title,
                    keyword: link.keyword,
                    type: 'internal',
                    link_type: link.link_type,
                    relevance_score: link.relevance_score
                  });
                }
              }
              
              console.log(`Added ${analyzedLinks.filter((l: any) => l.relevance_score >= 6).length} relevant internal backlinks`);
            }
          } catch (parseError) {
            console.error('Failed to parse internal links analysis:', parseError);
            
            // Fallback: simple keyword matching
            for (const link of internalLinks.slice(0, 15)) {
              const matchingKeyword = topKeywords.find(kw => 
                link.title?.toLowerCase().includes(kw.toLowerCase()) ||
                link.url?.toLowerCase().includes(kw.toLowerCase().replace(/\s+/g, '-'))
              );
              
              if (matchingKeyword) {
                backlinks.push({
                  url: link.url,
                  title: link.title || link.url,
                  keyword: matchingKeyword,
                  type: 'internal',
                  link_type: link.link_type || 'page'
                });
              }
            }
          }
        }
      }
    }

    // Discover external backlinks from fetched sources
    if (types.includes('external')) {
      console.log('Discovering external backlinks from sources...');
      
      // Extract external links from fetched source content and insights
      let sourceUrls: string[] = [];
      let sourceContext = '';
      
      if (sources && sources.length > 0) {
        sourceUrls = sources
          .filter((s: any) => s.status === 'success' && s.url)
          .map((s: any) => s.url)
          .slice(0, 15);
        
        // Build context from source insights
        const insights = sources
          .filter((s: any) => s.insights)
          .map((s: any) => `${s.url}: ${s.insights.summary || ''}`)
          .join('\n');
        
        sourceContext = insights ? `\n\nAnalyzed Sources:\n${insights}` : '';
      }
      
      const prompt = `Analyze and suggest high-quality external backlink opportunities based on:

Website: ${websiteUrl}
Keywords: ${keywords.slice(0, 20).join(', ')}
${sourceContext}

${sourceUrls.length > 0 ? `\nRelevant Sources Found:\n${sourceUrls.join('\n')}` : ''}

Provide 15-20 external backlink opportunities including:
1. The sources we found (if relevant and authoritative)
2. Similar authoritative websites in the same niche
3. Industry publications and blogs
4. Educational resources (.edu)
5. Government resources (.gov)
6. Resource pages and directories

Return ONLY a JSON array:
[
  {
    "url": "https://example.com/article",
    "title": "Page/Article Title",
    "keyword": "target keyword",
    "relevance_score": 8
  }
]

Focus on:
- High domain authority (DA 40+)
- Topically relevant to the keywords
- Active and well-maintained websites
- Pages that accept guest posts or have external links

Only include opportunities with relevance_score >= 7.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://sparti.ai',
          'X-Title': 'Sparti AI Assistant',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'system',
              content: 'You are a backlink research expert specializing in finding high-quality external link opportunities.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', errorText);
      } else {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '[]';
        
        console.log('AI response for external backlinks (preview):', content.substring(0, 200));

        // Extract JSON from response
        let externalBacklinks = [];
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            externalBacklinks = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.error('Failed to parse external backlinks:', parseError);
          externalBacklinks = [];
        }

        // Add external backlinks with high relevance
        for (const link of externalBacklinks) {
          if (link.url && link.title && link.keyword && (link.relevance_score || 0) >= 7) {
            backlinks.push({
              url: link.url,
              title: link.title,
              keyword: link.keyword,
              type: 'external',
              relevance_score: link.relevance_score
            });
          }
        }
        
        console.log(`Added ${externalBacklinks.filter((l: any) => (l.relevance_score || 0) >= 7).length} high-quality external backlinks`);
      }
    }

    console.log(`Discovered ${backlinks.length} backlinks (internal: ${backlinks.filter(b => b.type === 'internal').length}, external: ${backlinks.filter(b => b.type === 'external').length})`);

    return new Response(
      JSON.stringify({ backlinks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in backlink discovery:', error);
    return new Response(
      JSON.stringify({ error: error.message, backlinks: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});