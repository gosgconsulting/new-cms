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
    const { keywords, websiteUrl, language } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const systemPrompt = `You are an SEO research assistant. Given a list of seed keywords, suggest 10-15 authoritative source URLs that would be valuable for content research.

Website: ${websiteUrl}
Language: ${language}
Keywords: ${keywords.join(", ")}

Instructions:
- Suggest authoritative, high-quality sources (Wikipedia, industry blogs, news sites, research papers, etc.)
- Focus on sources that cover these topics comprehensively
- Include a mix of general and specific sources
- Return ONLY a JSON array of objects with this structure:
[
  {
    "url": "https://example.com",
    "title": "Source Title",
    "description": "Brief description of why this source is valuable"
  }
]
- Do not include explanations outside the JSON array`;

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
          { role: "user", content: "Suggest the source URLs now." },
        ],
        temperature: 0.7,
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    let sources: Array<{ url: string; title: string; description: string }> = [];
    try {
      sources = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        sources = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse sources from:", content);
        sources = [];
      }
    }

    return new Response(JSON.stringify({ sources }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("quick-setup-source-discovery error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
