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
    const { 
      websiteUrl, 
      country = "Global", 
      language = "English", 
      aiQuestionsAnswers = [], 
      customInstructions,
      brandName,
      businessDescription 
    } = await req.json();
    
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    // Build context from Q&A or simple brand info
    let qaContext = "";
    
    // Ensure aiQuestionsAnswers is an array (handle null/undefined)
    const questionsArray = Array.isArray(aiQuestionsAnswers) ? aiQuestionsAnswers : [];
    
    if (questionsArray.length > 0) {
      qaContext = questionsArray
        .map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`)
        .join("\n\n");
    } else if (brandName || businessDescription) {
      // Fallback to simple brand info if no Q&A provided
      qaContext = `Brand: ${brandName || "Not specified"}\nDescription: ${businessDescription || "Not specified"}`;
    } else {
      qaContext = "No additional business information provided.";
    }

    // Prioritize custom instructions
    const instructionsSection = customInstructions 
      ? `\n\n⚠️ TOP PRIORITY - USER INSTRUCTIONS (Follow these instructions above all else):\n${customInstructions}\n\nYou MUST prioritize keywords that align with these instructions. These instructions override general assumptions.`
      : '';

    const systemPrompt = `You are an SEO keyword strategist. Based on the business information provided, suggest as many relevant seed keywords as possible for a comprehensive SEO content strategy.

Context:
- Website: ${websiteUrl}
- Target Country: ${country}
- Language: ${language}

Business Information from User:
${qaContext}${instructionsSection}

Instructions:
- Suggest ALL relevant seed keywords (short phrases, 1-3 words each)
- Aim for 20-50 seed keywords if there are that many relevant opportunities
- Minimum of 10 keywords, but don't limit yourself if more are relevant
- Focus on commercial intent and relevance
- Consider the target audience and business goals
- Cover all aspects of the business and related topics
${customInstructions ? '- CRITICALLY IMPORTANT: Prioritize keywords that directly align with the user instructions above' : ''}
- Return ONLY a JSON array of keywords, nothing else
- Format: ["keyword 1", "keyword 2", "keyword 3", ...]
- Do not include explanations or additional text`;

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
          { role: "user", content: "Generate the seed keywords now." },
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
    
    // Extract JSON array from response
    let keywords: string[] = [];
    try {
      // Try to parse directly
      keywords = JSON.parse(content);
    } catch {
      // Try to extract JSON array from markdown code blocks
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        keywords = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse keywords from:", content);
        keywords = [];
      }
    }

    return new Response(JSON.stringify({ keywords }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("quick-setup-keyword-extraction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
