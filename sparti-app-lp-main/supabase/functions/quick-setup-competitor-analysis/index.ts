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

  try {
    const { keywords, websiteUrl, language } = await req.json();

    if (!keywords || keywords.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Keywords are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log('Analyzing competitors for', keywords.length, 'keywords');

    // Create AI prompt for competitor analysis
    const analysisPrompt = `As an SEO expert, analyze potential competitors for the following website and keywords:

Website: ${websiteUrl}
Language: ${language}
Keywords: ${keywords.slice(0, 10).join(', ')}

Identify 5-7 main competitors that:
1. Rank well for similar keywords
2. Target similar audience
3. Offer similar content or services
4. Are realistic competitors (not just major brands)

For each competitor, provide:
- domain: The competitor's domain name (e.g., "example.com")
- name: Display name for the competitor
- reasoning: 1-2 sentences explaining why they're a competitor
- estimated_authority: Rating from 1-10 of their domain authority
- content_strength: Rating from 1-10 of their content quality
- key_topics: Array of 3-5 main topics they cover

Return ONLY valid JSON in this format:
{
  "competitors": [
    {
      "domain": "competitor1.com",
      "name": "Competitor Name",
      "reasoning": "Why they're a competitor",
      "estimated_authority": 7,
      "content_strength": 8,
      "key_topics": ["topic1", "topic2", "topic3"]
    }
  ]
}`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sparti.ai",
        "X-Title": "Sparti AI Assistant",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages: [
          { 
            role: "system", 
            content: "You are an expert SEO competitor analyst. Identify realistic and relevant competitors." 
          },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI analysis failed:', errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    let competitors = [];
    
    try {
      const aiContent = aiData.choices[0].message.content;
      const jsonMatch = aiContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : aiContent;
      const parsed = JSON.parse(jsonContent.trim());
      competitors = parsed.competitors || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse competitor analysis');
    }

    console.log('Identified', competitors.length, 'competitors');

    return new Response(
      JSON.stringify({ competitors }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-setup-competitor-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
