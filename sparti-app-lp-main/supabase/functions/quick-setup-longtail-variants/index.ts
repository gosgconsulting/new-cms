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
    const { keywords, websiteUrl, language, aiAnswers } = await req.json();

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

    const systemPrompt = `You are an expert SEO strategist specializing in long-tail keyword research. 
Your task is to generate long-tail keyword variants that:
- Have lower competition but high intent
- Are specific and actionable
- Include question-based keywords
- Consider user search behavior and intent
- Are relevant to the business context

Return a JSON array where each object has:
- main_keyword: the original keyword
- variants: array of 8-12 long-tail variants`;

    const context = aiAnswers && aiAnswers.length > 0
      ? aiAnswers.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')
      : '';

    const userPrompt = `Generate long-tail keyword variants for this website:

Website: ${websiteUrl}
Language: ${language}
Keywords: ${keywords.join(', ')}

${context ? `Business Context:\n${context}\n` : ''}

For each keyword, generate 8-12 specific long-tail variants that include:
- Question-based queries (how, what, why, when, where)
- Location-specific variants (if relevant)
- Comparison queries (vs, versus, compared to)
- Problem-solution variants
- Specific use cases
- Industry-specific terms

Return ONLY a valid JSON array with this structure:
[
  {
    "main_keyword": "keyword",
    "variants": ["variant 1", "variant 2", ...]
  }
]`;

    console.log('Generating long-tail variants for keywords:', keywords);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway request failed");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }
    
    const longtailKeywords = JSON.parse(jsonContent.trim());

    console.log('Generated long-tail variants:', longtailKeywords.length, 'keyword groups');

    return new Response(
      JSON.stringify({ longtailKeywords }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-setup-longtail-variants:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
