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

    const { postId, brandId } = await req.json()

    if (!postId || !brandId) {
      return new Response(
        JSON.stringify({ error: 'Missing postId or brandId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching WordPress article data for post:', postId, 'brand:', brandId)

    // Get WordPress integration details
    const { data: integration } = await supabase.rpc('get_wordpress_integration', {
      p_brand_id: brandId
    })

    if (!integration || integration.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No WordPress integration found for this brand' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const wpIntegration = integration[0]
    const { site_url, username, app_password } = wpIntegration

    // Fetch post data from WordPress REST API
    const wpApiUrl = `${site_url}/wp-json/wp/v2/posts/${postId}`
    const authHeader = btoa(`${username}:${app_password}`)

    console.log('Fetching from WordPress API:', wpApiUrl)

    const wpResponse = await fetch(wpApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    })

    if (!wpResponse.ok) {
      const errorText = await wpResponse.text()
      console.error('WordPress API error:', wpResponse.status, errorText)
      return new Response(
        JSON.stringify({
          error: `WordPress API error: ${wpResponse.status}`,
          details: errorText
        }),
        { status: wpResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const postData = await wpResponse.json()
    console.log('WordPress post data fetched successfully')

    // Get author information
    let authorName = 'Unknown'
    if (postData.author) {
      try {
        const authorResponse = await fetch(`${site_url}/wp-json/wp/v2/users/${postData.author}`, {
          headers: {
            'Authorization': `Basic ${authHeader}`,
          },
        })
        if (authorResponse.ok) {
          const authorData = await authorResponse.json()
          authorName = authorData.name || authorData.display_name || 'Unknown'
        }
      } catch (error) {
        console.error('Error fetching author:', error)
      }
    }

    // Get categories
    let categories: string[] = []
    if (postData.categories && postData.categories.length > 0) {
      try {
        const categoryPromises = postData.categories.map(async (catId: number) => {
          const catResponse = await fetch(`${site_url}/wp-json/wp/v2/categories/${catId}`, {
            headers: {
              'Authorization': `Basic ${authHeader}`,
            },
          })
          if (catResponse.ok) {
            const catData = await catResponse.json()
            return catData.name
          }
          return null
        })
        
        const categoryResults = await Promise.all(categoryPromises)
        categories = categoryResults.filter(name => name !== null)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    // Get featured image
    let featuredImage = null
    if (postData.featured_media) {
      try {
        const mediaResponse = await fetch(`${site_url}/wp-json/wp/v2/media/${postData.featured_media}`, {
          headers: {
            'Authorization': `Basic ${authHeader}`,
          },
        })
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json()
          featuredImage = mediaData.source_url
        }
      } catch (error) {
        console.error('Error fetching featured media:', error)
      }
    }

    const responseData = {
      id: postData.id,
      status: postData.status,
      author_name: authorName,
      categories: categories,
      date: postData.date,
      modified: postData.modified,
      link: postData.link,
      featured_image: featuredImage,
      title: postData.title?.rendered,
      excerpt: postData.excerpt?.rendered,
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