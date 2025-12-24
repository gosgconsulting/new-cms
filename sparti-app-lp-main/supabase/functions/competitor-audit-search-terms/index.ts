import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, search_terms_count = 3 } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const count = Math.max(2, Math.min(5, search_terms_count));

    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const prompt = `Given these keywords: ${keywords.join(', ')}

Generate exactly ${count} relevant search terms that would be used to find information about these topics. The search terms should be:
1. Natural search queries that people would actually type into Google
2. Relevant to the keywords provided
3. Diverse enough to cover different aspects or angles
4. Between 2-5 words each
5. Focused on finding competitor information or market research

Return ONLY a JSON array of strings, no other text. Example format: ["search term 1", "search term 2", "search term 3"]`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    // Try to parse the JSON array from the response
    let searchTerms: string[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      searchTerms = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: generate simple search terms from keywords
      searchTerms = keywords.slice(0, count);
    }

    // Ensure we have exactly the requested count
    if (searchTerms.length < count) {
      // Pad with keywords if needed
      while (searchTerms.length < count && keywords.length > 0) {
        searchTerms.push(keywords[searchTerms.length % keywords.length]);
      }
    } else if (searchTerms.length > count) {
      searchTerms = searchTerms.slice(0, count);
    }

    return new Response(
      JSON.stringify({ search_terms: searchTerms }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating search terms:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
