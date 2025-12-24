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
    const { brandAnalysis, assetObjective, numHooks = 12 } = await req.json();
    console.log('Generating marketing hooks...');

    if (!brandAnalysis || !assetObjective) {
      throw new Error('Brand analysis and asset objective are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Generate marketing hooks using AI
    const hooksPrompt = `You are a creative marketing copywriter. Generate ${numHooks} compelling marketing hooks for social media ads.

Brand Information:
- Name: ${brandAnalysis.brand_name}
- Description: ${brandAnalysis.brand_description}
- Target Audience: ${brandAnalysis.target_audience}
- Key Selling Points: ${brandAnalysis.key_selling_points?.join(', ')}

Campaign Objective:
- Goal: ${assetObjective.campaign_goal}
- Platforms: ${assetObjective.target_platforms?.join(', ')}
- Focus: ${assetObjective.content_focus}
- CTA: ${assetObjective.call_to_action}

Generate ${numHooks} unique, attention-grabbing hooks. Each hook should:
- Be 5-15 words
- Be platform-appropriate for social ads
- Highlight a benefit or create curiosity
- Match the brand's tone
- Be action-oriented

Respond with ONLY valid JSON:
{
  "hooks": [
    {
      "text": "Hook text here",
      "description": "Brief explanation of the hook's appeal"
    }
  ]
}`;

    const response = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          { role: "user", content: hooksPrompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error('Failed to generate marketing hooks');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    let hooks;
    try {
      const jsonMatch = content?.match(/\{[\s\S]*\}/);
      hooks = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse hooks:', parseError);
      throw new Error('Invalid AI response format');
    }

    console.log('Marketing hooks generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        hooks: hooks.hooks || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assets-marketing-hooks:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate hooks'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});