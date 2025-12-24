import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

async function validateApiKey(apiKey: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Hash the provided key
  const encoder = new TextEncoder()
  const data = encoder.encode(apiKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Find matching key
  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('*, brands(*)')
    .eq('api_key_hash', apiKeyHash)
    .eq('is_active', true)
    .single()

  if (error || !keyData) {
    return null
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return null
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id)

  return keyData
}

async function logApiUsage(apiKeyId: string, endpoint: string, method: string, statusCode: number, startTime: number, req: Request) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const responseTime = Date.now() - startTime

  await supabase.from('api_usage_logs').insert({
    api_key_id: apiKeyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTime,
    ip_address: req.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req.headers.get('user-agent') || 'unknown'
  })
}

Deno.serve(async (req) => {
  const startTime = Date.now()
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Extract API key from header
    const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate API key
    const keyData = await validateApiKey(apiKey)
    if (!keyData) {
      return new Response(JSON.stringify({ error: 'Invalid or expired API key' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const path = url.pathname.replace('/public-api/', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let response: Response

    // Route handling
    if (path.startsWith('articles')) {
      if (!keyData.permissions.read_articles) {
        response = new Response(JSON.stringify({ error: 'Permission denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const articleId = path.split('/')[1]
        
        if (articleId && articleId !== 'articles') {
          // Get single article
          const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('brand_id', keyData.brand_id)
            .eq('id', articleId)
            .single()

          response = new Response(JSON.stringify({
            success: !error,
            data: data || null,
            error: error?.message
          }), {
            status: error ? 404 : 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // List articles
          const limit = parseInt(url.searchParams.get('limit') || '20')
          const offset = parseInt(url.searchParams.get('offset') || '0')
          const status = url.searchParams.get('status')

          let query = supabase
            .from('blog_posts')
            .select('*', { count: 'exact' })
            .eq('brand_id', keyData.brand_id)
            .range(offset, offset + limit - 1)

          if (status) {
            query = query.eq('status', status)
          }

          const { data, error, count } = await query

          response = new Response(JSON.stringify({
            success: !error,
            data: data || [],
            meta: {
              total: count,
              limit,
              offset
            }
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    } else if (path.startsWith('keywords')) {
      if (!keyData.permissions.read_keywords) {
        response = new Response(JSON.stringify({ error: 'Permission denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const { data, error } = await supabase
          .from('seo_tracked_keywords')
          .select('*')
          .eq('brand_id', keyData.brand_id)

        response = new Response(JSON.stringify({
          success: !error,
          data: data || []
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else if (path.startsWith('topics')) {
      if (!keyData.permissions.read_topics) {
        response = new Response(JSON.stringify({ error: 'Permission denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const { data, error } = await supabase
          .from('selected_topics')
          .select('*')
          .eq('brand_id', keyData.brand_id)

        response = new Response(JSON.stringify({
          success: !error,
          data: data || []
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else if (path.startsWith('links')) {
      if (!keyData.permissions.read_links) {
        response = new Response(JSON.stringify({ error: 'Permission denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const { data, error } = await supabase
          .from('internal_links')
          .select('*')
          .eq('brand_id', keyData.brand_id)

        response = new Response(JSON.stringify({
          success: !error,
          data: data || []
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else if (path.startsWith('competitors')) {
      if (!keyData.permissions.read_competitors) {
        response = new Response(JSON.stringify({ error: 'Permission denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } else {
        const { data, error } = await supabase
          .from('competitor_domains')
          .select('*')
          .eq('brand_id', keyData.brand_id)

        response = new Response(JSON.stringify({
          success: !error,
          data: data || []
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      response = new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log usage
    await logApiUsage(keyData.id, path, req.method, response.status, startTime, req)

    return response

  } catch (error) {
    console.error('Error in public-api:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})