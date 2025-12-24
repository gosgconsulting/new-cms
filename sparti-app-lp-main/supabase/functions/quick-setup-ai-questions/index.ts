import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, websiteUrl, industry, targetAudience } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Build system prompt
    const systemPrompt = `You are an SEO content strategist helping users set up their content strategy. 
Your goal is to ask 5-10 clarifying questions to understand their business, target audience, and content goals.

Context:
- Website: ${websiteUrl || "Not provided"}
- Industry: ${industry || "Not specified"}
- Target Audience: ${targetAudience || "Not specified"}

Guidelines:
- Ask ONE question at a time
- Be conversational, friendly, and concise
- Personalize questions based on the website and context provided
- After 5-10 questions (depending on depth of answers), summarize what you learned and say: "Great! I have everything I need. Let's move forward."

Focus areas to explore:
1. Main product/service
2. Target audience details (age, profession, interests)
3. Primary content goals (lead generation, brand awareness, sales)
4. Specific topics or themes of interest
5. Existing content or competitors to analyze
6. Preferred tone and style (professional, casual, technical)
7. Known keywords they want to target
8. Unique brand differentiators
9. Industry or niche specifics
10. Preferred content formats (how-to, listicles, case studies)

Track the conversation and don't ask about things already discussed.`;

    // Call OpenRouter API
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required, please add funds to your Lovable AI workspace.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("quick-setup-ai-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
