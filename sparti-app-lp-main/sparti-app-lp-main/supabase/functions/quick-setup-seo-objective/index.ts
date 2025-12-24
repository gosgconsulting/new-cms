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
    const { websiteUrl, brandName, description, targetAudience, customInstructions } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const instructionContext = customInstructions 
      ? `\n\nUser's Campaign Instructions:\n${customInstructions}\n\nIMPORTANT: The SEO objective MUST align with these instructions.`
      : '\n\nNo specific instructions provided. Generate appropriate SEO objectives based on the business analysis.';

    const systemPrompt = `You are an SEO strategist. Based on the business information, determine the primary SEO objective for this campaign.

Website: ${websiteUrl}
Brand: ${brandName}
Description: ${description}
Target Audience: ${targetAudience}${instructionContext}

Analyze the business and determine the main SEO objective. This should be a clear, actionable goal.

Examples of objectives:
- "Generate more franchise enquiries in Singapore"
- "Increase online product sales"
- "Build brand awareness for new product line"
- "Drive local store visits"
- "Capture B2B leads"

Return ONLY a JSON object with this structure:
{
  "objective": "Primary SEO objective statement (1-2 sentences max)",
  "focus_areas": ["Area 1", "Area 2", "Area 3"]
}

The objective should be specific, measurable, and aligned with the business goals${customInstructions ? ' and user instructions' : ''}.`;

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
          { role: "user", content: "Analyze and generate the SEO objective now." },
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
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Extract JSON from response
    let result: any = {};
    try {
      result = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse objective from:", content);
        result = {
          objective: "Improve online visibility and drive qualified traffic",
          focus_areas: ["Brand awareness", "Lead generation", "Customer engagement"]
        };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("quick-setup-seo-objective error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
