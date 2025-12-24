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
    const { cluster, topicsNumber, objective, language } = await req.json();

    if (!cluster || !topicsNumber) {
      return new Response(
        JSON.stringify({ error: 'Selected cluster and topicsNumber are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    // Calculate number of search terms: 1 per 4 topics
    const searchTermsCount = Math.ceil(topicsNumber / 4);

    const systemPrompt = `You are an SEO expert specializing in search term generation and content strategy.
Your task is to generate long-tail search terms that will be used for web scraping to find relevant sources.

IMPORTANT: Generate EXACTLY ${searchTermsCount} search terms based on topics number divided by 4. Each search term will be used to create 4 different topics covering all 4 user intents (informational, commercial, transactional, navigational).

Return ONLY a JSON array with this structure:
[
  {
    "search_term": "specific long-tail search query",
    "cluster": "cluster name",
    "keywords": ["primary keyword", "secondary keyword"]
  }
]

Guidelines:
- Generate EXACTLY ${searchTermsCount} search terms (topics number ${topicsNumber} ÷ 4 = ${searchTermsCount} search terms)
- Each search term should be broad enough to support 4 different content angles
- Each search term should be specific and actionable for finding quality sources
- All search terms must be for the selected keyword cluster
- Use natural language that people actually search for
- Return valid JSON only, no markdown formatting`;

    const userPrompt = `Generate ${searchTermsCount} long-tail search terms${objective ? ` based on this SEO objective: "${objective}"` : ''}.

Total topics to create: ${topicsNumber}
Search terms needed: ${searchTermsCount} (${topicsNumber} topics ÷ 4 = ${searchTermsCount} search terms)

Generate search terms for this keyword cluster:
Cluster: ${cluster.cluster_name} (${cluster.intent})
Keywords: ${cluster.keywords.join(', ')}

${language ? `Generate search terms in ${language} language.` : ''}

Each search term should be broad enough to create 4 different topics:
- 1 informational topic (educational, how-to, guides)
- 1 commercial topic (comparisons, reviews, best options)
- 1 transactional topic (buying guides, product features)
- 1 navigational topic (brand-specific, location-specific)

Create diverse, specific search terms that will help find authoritative sources for content creation.`;

    console.log(`Calling OpenRouter API (model: openai/gpt-4o-mini) - generating ${searchTermsCount} search terms`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI - Search Terms Generation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'OpenRouter payment required. Please add credits to your OpenRouter account.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY configuration.' }),
          { 
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      return new Response(
        JSON.stringify({ error: `OpenRouter API error: ${response.status} - ${errorText}` }),
        { 
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let searchTerms;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      searchTerms = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse search terms');
    }

    return new Response(
      JSON.stringify({ searchTerms }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Search terms generation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
