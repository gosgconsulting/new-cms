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
    const { topics, competitors } = await req.json();

    if (!topics || topics.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Topics are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    console.log('Analyzing intent and backlinks for', topics.length, 'topics');

    // Prepare topic list for analysis
    const topicList = topics.map((t: any, i: number) => 
      `${i + 1}. ${t.title} (${t.primary_keyword})`
    ).join('\n');

    const competitorDomains = competitors?.map((c: any) => c.domain).join(', ') || 'N/A';

    // Create AI prompt for intent analysis
    const analysisPrompt = `Analyze these content topics for backlink opportunities and refine search intent classification:

Topics:
${topicList}

Known Competitors: ${competitorDomains}

For each topic, provide:
- topic_index: Index of the topic (0-based)
- refined_intent: Refined search intent classification
- intent_confidence: Confidence in intent classification (1-10)
- backlink_potential: Potential for earning backlinks (1-10)
- outreach_targets: Array of 3-5 potential backlink targets (websites/publications that might link)
- content_format_suggestions: Array of 2-3 content format ideas (e.g., "Infographic", "Case Study", "Ultimate Guide")
- internal_linking_keywords: Array of 3-5 keywords to use for internal linking

Consider:
1. Content types that naturally attract backlinks (data, research, tools, guides)
2. Publications and websites that cover this topic area
3. Potential guest post or resource page opportunities

Return ONLY valid JSON:
{
  "analyzed_topics": [
    {
      "topic_index": 0,
      "refined_intent": "informational",
      "intent_confidence": 9,
      "backlink_potential": 7,
      "outreach_targets": ["site1.com", "site2.com"],
      "content_format_suggestions": ["Ultimate Guide", "Infographic"],
      "internal_linking_keywords": ["keyword1", "keyword2"]
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
            content: "You are an expert in SEO, content marketing, and link building strategy." 
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
    let analyzedTopics = [];
    
    try {
      const aiContent = aiData.choices[0].message.content;
      const jsonMatch = aiContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : aiContent;
      const parsed = JSON.parse(jsonContent.trim());
      analyzedTopics = parsed.analyzed_topics || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse intent analysis');
    }

    console.log('Analyzed', analyzedTopics.length, 'topics');

    return new Response(
      JSON.stringify({ analyzed_topics: analyzedTopics }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in quick-setup-intent-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
