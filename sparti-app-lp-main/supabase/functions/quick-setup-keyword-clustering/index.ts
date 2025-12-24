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
    const { keywords, objective } = await req.json();

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    const systemPrompt = `You are an SEO expert specializing in keyword clustering and organization.
Your task is to analyze a list of keywords and group them into logical clusters based on semantic similarity, search intent, and topic relevance.

Return ONLY a JSON array with this structure:
[
  {
    "cluster_name": "Main Topic Name",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "intent": "informational|commercial|transactional|navigational"
  }
]

Guidelines:
- Create 3-10 meaningful clusters (max 10)
- Each cluster should have a clear, descriptive name
- Keywords should be grouped by semantic similarity and search intent
- Cluster names should reflect the main topic or theme
- Return valid JSON only, no markdown formatting`;

    const userPrompt = `Analyze and cluster these keywords${objective ? ` based on the SEO objective: "${objective}"` : ''}:

${keywords.map((k: string, i: number) => `${i + 1}. ${k}`).join('\n')}

Group them into logical clusters that will help create targeted content strategies.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://sparti.ai',
        'X-Title': 'Sparti AI Assistant',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response (handle markdown code blocks)
    let clusters;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      clusters = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse keyword clusters');
    }

    return new Response(
      JSON.stringify({ clusters }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Keyword clustering error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
