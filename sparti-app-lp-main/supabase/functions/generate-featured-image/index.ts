import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeaturedImageRequest {
  title: string;
  keywords?: string[];
  content?: string;
  user_id: string;
  brand_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const { title, keywords, content, user_id, brand_id }: FeaturedImageRequest = await req.json();

    if (!title) {
      throw new Error('Article title is required');
    }

    // Get user's image style preference from content_settings
    let imageStyle = 'modern, clean, professional'; // default style
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey && user_id) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: contentSettings, error } = await supabase
          .from('content_settings')
          .select('image_style')
          .eq('user_id', user_id)
          .single();
        
        if (!error && contentSettings?.image_style) {
          imageStyle = contentSettings.image_style;
          console.log(`Using custom image style: ${imageStyle}`);
        } else {
          console.log('Using default image style');
        }
      }
    } catch (styleError) {
      console.error('Error fetching image style:', styleError);
      // Continue with default style
    }

    // Create a comprehensive prompt for image generation
    const keywordText = Array.isArray(keywords) && keywords.length > 0 
      ? keywords.join(', ') 
      : '';
    
    // Extract key themes from content (first 200 characters)
    const contentPreview = content ? content.replace(/<[^>]*>/g, '').substring(0, 200) : '';
    
    // Build the image generation prompt
    let imagePrompt = `Create a professional, high-quality feature image for a blog article titled "${title}".`;
    
    if (keywordText) {
      imagePrompt += ` The article focuses on: ${keywordText}.`;
    }
    
    if (contentPreview) {
      imagePrompt += ` Content context: ${contentPreview}...`;
    }
    
    imagePrompt += ` Style: ${imageStyle}, suitable for web publication. The image should be visually appealing and relevant to the topic. Avoid any text overlays or logos.`;

    console.log('Generating image with prompt:', imagePrompt);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt,
          },
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // The generated image will be in the assistant message
    if (data.choices) {
      const message = data.choices[0].message;
      if (message.images) {
        message.images.forEach((image: any, index: number) => {
          const imageUrl = image.image_url.url; // Base64 data URL
          console.log(`Generated image ${index + 1}: ${imageUrl.substring(0, 50)}...`);
        });
      }
    }
    
    const imageUrl = data.choices[0].message.images[0].image_url.url;

    // Generate alt text based on the prompt
    const altText = `Professional feature image for article about ${keywordText || title}`;

    // Record token usage
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Get user ID from the request headers
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user) {
            await supabase.rpc('deduct_user_tokens', {
              p_user_id: user.id,
              p_service_name: 'generate-featured-image',
              p_model_name: 'google/gemini-2.5-flash-image-preview',
              p_cost_usd: 0.05,
              p_brand_id: brand_id,
              p_request_data: {
                title,
                keywords: keywordText,
                content_preview: contentPreview,
                image_style: imageStyle,
                processed_by: 'generate-featured-image-function'
              }
            });
            
            console.log(`Token usage recorded for user ${user.id}: $0.05`);
          }
        }
      }
    } catch (tokenError) {
      console.error('Error recording token usage:', tokenError);
      // Don't fail the request if token tracking fails
    }

    return new Response(JSON.stringify({ 
      imageUrl,
      altText,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-featured-image function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});