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
    const { topics, keywords, sitemapUrls, websiteUrl, analyzeExisting } = await req.json();

    // If analyzing existing content mode
    if (analyzeExisting) {
      if (!keywords || keywords.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Keywords are required for analysis' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
      if (!OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured');
      }

      // Prepare sitemap URLs list
      const urlsList = sitemapUrls && sitemapUrls.length > 0 
        ? sitemapUrls.slice(0, 100).join('\n')
        : 'No sitemap URLs available';

      const systemPrompt = `You are an SEO expert analyzing a website's existing content.
Your task is to:
1. Extract existing article topics/titles from the sitemap URLs
2. Identify which URLs would be good internal backlinks for future articles on these keywords

Return ONLY a JSON object with this structure:
{
  "existingTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "backlinksMap": {
    "keyword1": [
      {
        "url": "full URL from sitemap",
        "anchor_text": "suggested anchor text",
        "relevance_score": 0.8
      }
    ]
  }
}

Guidelines:
- Extract clear topic titles from URLs (e.g., "/blog/how-to-bake-bread" → "How to Bake Bread")
- Match URLs to keywords based on semantic relevance
- Suggest 2-5 internal links per keyword
- Use descriptive, keyword-rich anchor text
- Only use URLs that actually exist in the sitemap
- Relevance score should be 0-1 (higher = more relevant)`;

      const userPrompt = `Website: ${websiteUrl}

Available Sitemap URLs:
${urlsList}

Keywords for analysis:
${keywords.join('\n')}

1. Extract existing article topics from the URLs
2. Suggest relevant internal backlinks for each keyword using the sitemap URLs`;

      console.log('Calling OpenRouter API (model: openai/gpt-4o-mini) for analyzing existing content');
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': websiteUrl || 'https://sparti.ai',
          'X-Title': 'Sparti AI - Internal Backlinks Analysis'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few minutes.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: 'OpenRouter payment required. Please add credits to your OpenRouter account.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 401) {
          return new Response(
            JSON.stringify({ error: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY configuration.' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Parse JSON from response
      let analysisData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        analysisData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        console.error('Failed to parse AI response:', content);
        throw new Error('Failed to parse content analysis');
      }

      return new Response(
        JSON.stringify(analysisData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Original mode: suggest backlinks for existing topics
    if (!topics || topics.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Topics are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Prepare sitemap URLs list for AI analysis
    const urlsList = sitemapUrls && sitemapUrls.length > 0 
      ? sitemapUrls.slice(0, 50).join('\n') // Limit to 50 URLs for performance
      : 'No sitemap URLs available';

    const systemPrompt = `You are an SEO expert specializing in internal linking strategy.
Your task is to suggest relevant internal backlinks from the website's sitemap for each topic.

Return ONLY a JSON array with this structure:
[
  {
    "topic_title": "exact topic title",
    "internal_links": [
      {
        "url": "full URL from sitemap",
        "anchor_text": "suggested anchor text",
        "relevance_score": 0.8
      }
    ]
  }
]

Guidelines:
- Match sitemap URLs to topics based on semantic relevance
- Suggest 2-5 internal links per topic
- Use descriptive, keyword-rich anchor text
- Only use URLs that actually exist in the sitemap
- Relevance score should be 0-1 (higher = more relevant)
- Return valid JSON only, no markdown formatting`;

    const userPrompt = `Website: ${websiteUrl}

Available Sitemap URLs:
${urlsList}

Topics to analyze:
${topics.map((t: any, i: number) => `${i + 1}. ${t.title || t.primary_keyword}`).join('\n')}

Suggest relevant internal backlinks for each topic using only the URLs provided in the sitemap.`;

    console.log('Calling OpenRouter API (model: openai/gpt-4o-mini) for suggesting internal backlinks');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': websiteUrl || 'https://sparti.ai',
        'X-Title': 'Sparti AI - Internal Backlinks Discovery'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a few minutes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'OpenRouter payment required. Please add credits to your OpenRouter account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY configuration.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let backlinksData;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      backlinksData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse internal backlinks suggestions');
    }

    return new Response(
      JSON.stringify({ backlinks: backlinksData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Internal backlinks suggestion error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
