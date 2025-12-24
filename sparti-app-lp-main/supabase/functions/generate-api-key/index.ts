import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { brandId, keyName, permissions, expiresAt } = await req.json()

    // Validate brand ownership
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single()

    if (brandError || !brand) {
      return new Response(JSON.stringify({ error: 'Brand not found or access denied' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate secure API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32))
    const apiKey = `sk_live_${Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('')}`
    const keyPrefix = apiKey.substring(0, 15) + '...'

    // Hash the key for storage
    const encoder = new TextEncoder()
    const data = encoder.encode(apiKey)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const apiKeyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Store hashed key in database
    const { data: apiKeyRecord, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        brand_id: brandId,
        key_name: keyName,
        api_key_hash: apiKeyHash,
        key_prefix: keyPrefix,
        permissions: permissions || {
          read_articles: true,
          read_keywords: true,
          read_topics: true,
          read_links: true,
          read_competitors: true
        },
        expires_at: expiresAt || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating API key:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create API key' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Return the plain API key (only time it will be shown)
    return new Response(JSON.stringify({
      apiKey,
      keyRecord: {
        ...apiKeyRecord,
        api_key_hash: undefined // Don't send hash back
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in generate-api-key:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})