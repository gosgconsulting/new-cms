import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { articleId, brandId } = await req.json()

    if (!articleId || !brandId) {
      return new Response(
        JSON.stringify({ error: 'Missing articleId or brandId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching Shopify article data for article:', articleId, 'brand:', brandId)

    // Get Shopify integration details
    const { data: integration } = await supabase.rpc('get_shopify_integration', {
      p_brand_id: brandId
    })

    if (!integration || integration.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No Shopify integration found for this brand' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const shopifyIntegration = integration[0]
    const { shop_url, access_token } = shopifyIntegration

    // First, get the blog ID from the article
    const articleUrl = `${shop_url}/admin/api/2023-10/articles/${articleId}.json`

    console.log('Fetching from Shopify API:', articleUrl)

    const articleResponse = await fetch(articleUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json',
      },
    })

    if (!articleResponse.ok) {
      const errorText = await articleResponse.text()
      console.error('Shopify API error:', articleResponse.status, errorText)
      return new Response(
        JSON.stringify({
          error: `Shopify API error: ${articleResponse.status}`,
          details: errorText
        }),
        { status: articleResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const articleData = await articleResponse.json()
    const article = articleData.article

    if (!article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Shopify article data fetched successfully')

    // Get blog information for additional context
    let blogHandle = ''
    if (article.blog_id) {
      try {
        const blogResponse = await fetch(`${shop_url}/admin/api/2023-10/blogs/${article.blog_id}.json`, {
          headers: {
            'X-Shopify-Access-Token': access_token,
            'Content-Type': 'application/json',
          },
        })
        if (blogResponse.ok) {
          const blogData = await blogResponse.json()
          blogHandle = blogData.blog?.handle || ''
        }
      } catch (error) {
        console.error('Error fetching blog info:', error)
      }
    }

    const responseData = {
      id: article.id,
      blog_id: article.blog_id,
      blog_handle: blogHandle,
      title: article.title,
      author: article.author,
      created_at: article.created_at,
      updated_at: article.updated_at,
      published_at: article.published_at,
      tags: article.tags,
      summary: article.summary,
      handle: article.handle,
      url: article.published_at ? `${shop_url.replace('/admin', '')}/blogs/${blogHandle}/${article.handle}` : null,
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})