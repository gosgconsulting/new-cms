import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageGenerationRequest {
  model?: string;
  prompt: string;
  size?: string;
  quality?: string;
  n?: number;
  style?: string;
  user?: string;
  title?: string;
  keywords?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      model = 'google/gemini-2.5-flash-image-preview', 
      prompt, 
      size = '1024x1024', 
      quality = 'standard', 
      n = 1, 
      style,
      user,
      title,
      keywords
    }: ImageGenerationRequest = await req.json()

    if (!prompt) {
      return new Response(
        JSON.stringify({ 
          error: 'Prompt is required',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get OpenRouter API key from environment
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
    if (!openrouterApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenRouter API key not configured',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Generating image with model: ${model}, prompt: ${prompt.substring(0, 100)}...`)

    // Build enhanced prompt similar to generate-featured-image
    let imagePrompt = prompt
    
    if (title && keywords) {
      const keywordText = Array.isArray(keywords) ? keywords.join(', ') : keywords
      imagePrompt = `Create a professional, high-quality feature image for a blog article titled "${title}". The article focuses on: ${keywordText}. ${prompt}. Style: ${style || 'modern, clean, professional'}, suitable for web publication. The image should be visually appealing and relevant to the topic. Avoid any text overlays or logos.`
    }

    // Use chat completions endpoint for Gemini image generation (like generate-featured-image)
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterApiKey}`,
        'HTTP-Referer': 'https://your-app.com',
        'X-Title': 'Your App Name'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: imagePrompt,
          },
        ],
        modalities: ['image', 'text'],
      })
    })

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text()
      console.error('OpenRouter API error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to generate image',
          details: errorData,
          status: openrouterResponse.status,
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await openrouterResponse.json()
    
    console.log(`Successfully generated image with model: ${model}`)

    // Extract image URL from Gemini response (similar to generate-featured-image)
    if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.images) {
      const imageUrl = result.choices[0].message.images[0].image_url.url
      console.log(`Generated image URL: ${imageUrl.substring(0, 50)}...`)
      
      return new Response(
        JSON.stringify({
          success: true,
          model,
          data: [{
            url: imageUrl,
            alt: title ? `Professional feature image for article about ${title}` : 'Generated image'
          }],
          created: result.created,
          usage: result.usage
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'No image generated in response',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Image generation error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
