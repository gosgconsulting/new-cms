import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetaDescriptionInput {
  articleId: string;
  content: string;
  title: string;
  keywords?: string[];
  brandName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not configured')
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const requestData: MetaDescriptionInput = await req.json()
    const { articleId, content, title, keywords = [], brandName = '' } = requestData

    console.log('Generating meta description for article:', articleId)

    // Extract first 500 characters of content for context (without HTML)
    const plainTextContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500)

    const primaryKeyword = keywords.length > 0 ? keywords[0] : title

    const systemPrompt = `You are an expert SEO copywriter specializing in meta descriptions.
Generate a compelling, click-worthy meta description that:
- Is 150-160 characters long (strict requirement)
- Includes the primary keyword naturally: "${primaryKeyword}"
- Uses action-oriented, engaging language
- Provides clear value proposition
- Encourages clicks from search results
- Avoids keyword stuffing or generic phrases

Structure: [Core benefit/value] + [What readers learn] + [Subtle CTA]

IMPORTANT: Return ONLY the meta description text, no quotes, no explanation.`

    const userPrompt = `Article Title: ${title}
${brandName ? `Brand: ${brandName}` : ''}
Primary Keyword: ${primaryKeyword}
${keywords.length > 1 ? `Additional Keywords: ${keywords.slice(1).join(', ')}` : ''}

Article Content Preview:
${plainTextContent}

Generate an optimized meta description (150-160 characters) that will maximize click-through rate from search results.`

    console.log('Calling OpenRouter API for meta description generation...')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouter API error:', response.status, errorText)
      throw new Error(`OpenRouter API failed: ${response.status}`)
    }

    const data = await response.json()
    let metaDescription = data.choices[0].message.content.trim()

    // Clean up the meta description
    metaDescription = metaDescription
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/\n/g, ' ') // Remove line breaks
      .trim()

    // Validate length
    if (metaDescription.length > 160) {
      console.warn(`Meta description too long (${metaDescription.length} chars), truncating...`)
      metaDescription = metaDescription.substring(0, 157) + '...'
    }

    console.log(`Generated meta description (${metaDescription.length} chars):`, metaDescription)

    // Update the article with the meta description
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update({ meta_description: metaDescription })
      .eq('id', articleId)

    if (updateError) {
      console.error('Failed to update article with meta description:', updateError)
      throw updateError
    }

    console.log('Meta description saved to article successfully')

    return new Response(
      JSON.stringify({
        success: true,
        metaDescription,
        length: metaDescription.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Meta description generation error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
