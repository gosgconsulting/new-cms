import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[Context Aggregation] Function invoked');

  try {
    const body = await req.json();
    console.log('[Context Aggregation] Received body:', JSON.stringify(body).substring(0, 200));
    
    const {
      brandInfo,
      campaignInfo,
      topicBrief,
      sourceCitations,
      backlinks,
      internalLinks
    } = body;

    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error('[Context Aggregation] OPENROUTER_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'OPENROUTER_API_KEY not configured',
          stage: 'context_aggregation'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const prompt = `You are an SEO content strategist analyzing all available information to create a comprehensive content strategy.

BRAND INFORMATION:
${JSON.stringify(brandInfo, null, 2)}

CAMPAIGN DETAILS:
${JSON.stringify(campaignInfo, null, 2)}

TOPIC BRIEF:
${JSON.stringify(topicBrief, null, 2)}

SOURCE CITATIONS:
${JSON.stringify(sourceCitations, null, 2)}

BACKLINKS AVAILABLE:
${JSON.stringify(backlinks, null, 2)}

INTERNAL LINKING OPPORTUNITIES:
${JSON.stringify(internalLinks, null, 2)}

Analyze this information and create a structured content strategy document in JSON format with the following structure:
{
  "key_themes": ["theme1", "theme2", "theme3"],
  "brand_voice_indicators": {
    "tone": "description",
    "language_patterns": ["pattern1", "pattern2"],
    "unique_terminology": ["term1", "term2"]
  },
  "competitive_angles": ["angle1", "angle2"],
  "content_gaps": ["gap1", "gap2"],
  "keyword_opportunities": {
    "primary_placement": "strategy",
    "semantic_variations": ["var1", "var2"],
    "long_tail_targets": ["target1", "target2"]
  },
  "internal_linking_strategy": {
    "recommended_links": [
      {"anchor": "text", "url": "url", "section": "where to place"}
    ],
    "link_density": "optimal distribution strategy"
  },
  "source_integration_plan": ["how to use source1", "how to use source2"]
}

Return ONLY the JSON object, no additional text.`;

    console.log('[Context Aggregation] Calling OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'SEO Content Platform'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Context Aggregation] OpenRouter error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('[Context Aggregation] Raw response:', content);

    // Parse the JSON response
    let strategy;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      strategy = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('[Context Aggregation] JSON parse error:', parseError);
      // Return a basic structure if parsing fails
      strategy = {
        key_themes: [],
        brand_voice_indicators: {},
        competitive_angles: [],
        content_gaps: [],
        keyword_opportunities: {},
        internal_linking_strategy: {},
        source_integration_plan: [],
        raw_response: content
      };
    }

    console.log('[Context Aggregation] Success');

    return new Response(
      JSON.stringify({
        success: true,
        strategy,
        stage: 'context_aggregation',
        model: 'openai/gpt-4o-mini'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Context Aggregation] Error:', error);
    console.error('[Context Aggregation] Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        errorType: error.name || 'Error',
        stage: 'context_aggregation'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
