// Image generation functions

export async function generateFeaturedImage(inputData: any, articleContent: string, supabase: any, authHeader: string) {
  const topic = inputData.topics[0]
  const imageStyle = inputData.contentSettings?.image_style || 'professional photograph'
  
  // Extract keywords context
  const keywordsContext = Array.isArray(topic.keywords) && topic.keywords.length > 0
    ? topic.keywords.join(', ')
    : topic.primary_keyword || ''
  
  // Extract content context (first 200 characters, cleaned)
  const contentContext = articleContent 
    ? articleContent.replace(/<[^>]*>/g, '').substring(0, 200)
    : ''
  
  const imagePrompt = `Create a professional, high-quality feature image for a blog article titled "${topic.title}".

${keywordsContext ? `The article focuses on: ${keywordsContext}.` : ''}

${contentContext ? `Content context: ${contentContext}...` : ''}

Style: ${imageStyle}, suitable for web publication. The image should be visually appealing and relevant to the topic. Avoid any text overlays or logos.`
  
  console.log('Generating image with Lovable AI Gateway (Google Gemini 2.5 flash):', imagePrompt)
  
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image-preview',
      messages: [
        {
          role: 'user',
          content: imagePrompt
        }
      ],
      modalities: ['image', 'text']
    })
  })

  console.log('Image generation API response status:', response.status)
  
  const data = await response.json()
  
  if (!response.ok) {
    console.error('Image generation API error:', {
      status: response.status,
      statusText: response.statusText,
      error: data.error,
      message: data.message
    })
    
    // Handle specific error cases
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.')
    } else if (response.status === 402) {
      throw new Error('Payment required. Please check your Lovable AI Gateway credits.')
    } else if (response.status === 504 || response.status === 408) {
      throw new Error('Image generation timed out. Please try again.')
    }
    
    throw new Error(`Image generation failed: ${data.error || data.message || 'Unknown error'}`)
  }

  // Log API usage
  try {
    const usage = data.usage || {}
    const promptTokens = usage.prompt_tokens || 0
    const completionTokens = usage.completion_tokens || 0
    const totalTokens = usage.total_tokens || (promptTokens + completionTokens)
    
    // Estimated cost for image generation (adjust based on actual pricing)
    const costUsd = 0.05 // Approximate cost per image
    
    await supabase.rpc('log_api_token_usage', {
      p_service_name: 'lovable_ai_gateway',
      p_model_name: 'google/gemini-2.5-flash-image-preview',
      p_prompt_tokens: promptTokens,
      p_completion_tokens: completionTokens,
      p_total_tokens: totalTokens,
      p_cost_usd: costUsd,
      p_request_data: {
        task: 'featured_image_generation',
        processed_by: 'content-writing-unified'
      }
    })
  } catch (logError) {
    console.error('Failed to log API usage:', logError)
  }

  // Extract the generated image (base64)
  const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url
  
  if (!imageUrl) {
    throw new Error('No image URL returned from generation')
  }
  
  // Generate alt text
  const altText = `Professional feature image for article about ${keywordsContext || topic.title}`
  
  // Upload to Supabase storage
  try {
    const base64Data = imageUrl.split(',')[1]
    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    const fileName = `featured-${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const filePath = `${inputData.brandId}/${fileName}`
    
    console.log('Uploading image to storage bucket: images, path:', filePath)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('Storage upload error:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError
      })
      throw new Error(`Failed to upload image to storage: ${uploadError.message}`)
    }
    
    console.log('Image uploaded successfully to storage:', uploadData)
    
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    const publicUrl = publicUrlData.publicUrl
    console.log('Image uploaded successfully:', publicUrl)
    
    return { imageUrl: publicUrl, altText }
  } catch (uploadError) {
    console.error('Error uploading to storage:', uploadError)
    throw new Error(`Failed to upload image to storage: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
  }
}
