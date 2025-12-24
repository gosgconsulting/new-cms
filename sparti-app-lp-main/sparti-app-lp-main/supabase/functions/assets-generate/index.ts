import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      campaignId, 
      selectedHooks, 
      selectedFormats, 
      brandAnalysis, 
      assetObjective, 
      language,
      numAssets 
    } = await req.json();
    
    console.log('Generating assets for campaign:', campaignId);

    if (!campaignId || !selectedHooks?.length || !selectedFormats?.length) {
      throw new Error('Campaign ID, hooks, and formats are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Generate assets using Gemini image generation
    const generatedAssets = [];
    
    for (const hook of selectedHooks.slice(0, numAssets)) {
      for (const format of selectedFormats) {
        console.log(`Generating asset for hook: ${hook.text}, format: ${format.format_name}`);

        // Create image generation prompt
        const imagePrompt = `Create a ${format.width}x${format.height} social media ad image for ${brandAnalysis.brand_name}.

Brand Style:
- Aesthetic: ${brandAnalysis.brand_style?.overall_aesthetic}
- Tone: ${brandAnalysis.brand_style?.visual_tone}
- Primary Color: ${brandAnalysis.colors?.primary}
- Secondary Color: ${brandAnalysis.colors?.secondary}

Marketing Hook: "${hook.text}"
CTA: "${assetObjective.call_to_action}"

Design Requirements:
- Modern, eye-catching composition
- Clear hierarchy with the hook as main headline
- Include subtle CTA button or text
- Professional ${format.platform} ad aesthetic
- Aspect ratio: ${format.aspect_ratio}
- Use brand colors harmoniously
- High-quality, photorealistic or clean vector style`;

        // Call Gemini image generation via openrouter-chat
        const response = await fetch(`${supabaseUrl}/functions/v1/openrouter-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [
              { role: "user", content: imagePrompt }
            ],
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.choices?.[0]?.message?.content;
          
          // Save asset to database
          const { data: assetData, error: assetError } = await supabase
            .from('asset_campaign_assets')
            .insert({
              campaign_id: campaignId,
              hook_id: hook.id,
              format_id: format.id,
              asset_url: imageUrl || null,
              headline: hook.text,
              body_text: brandAnalysis.brand_description,
              cta_text: assetObjective.call_to_action,
              generation_prompt: imagePrompt,
              status: imageUrl ? 'completed' : 'failed',
              error_message: imageUrl ? null : 'Failed to generate image'
            })
            .select()
            .single();

          if (!assetError && assetData) {
            generatedAssets.push(assetData);
          }
        } else {
          console.error('Failed to generate image for hook:', hook.text);
        }
      }
    }

    // Update campaign status
    await supabase
      .from('asset_campaigns')
      .update({
        status: 'completed',
        total_assets: generatedAssets.length
      })
      .eq('id', campaignId);

    console.log(`Generated ${generatedAssets.length} assets successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        assets: generatedAssets
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in assets-generate:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate assets'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});