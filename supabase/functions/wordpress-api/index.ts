import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { method, endpoint, params, baseUrl, requireAuth = false } = await req.json();
    
    // Get WordPress credentials if authentication is required
    let authHeaders = {};
    if (requireAuth) {
      const username = Deno.env.get('WORDPRESS_USERNAME');
      const password = Deno.env.get('WORDPRESS_PASSWORD');
      
      if (!username || !password) {
        throw new Error('WordPress credentials not configured');
      }
      
      const credentials = btoa(`${username}:${password}`);
      authHeaders = {
        'Authorization': `Basic ${credentials}`
      };
    }

    // Build the URL
    const wpApiUrl = `${baseUrl || 'https://gosgconsulting.com'}/wp-json/wp/v2${endpoint}`;
    const url = new URL(wpApiUrl);
    
    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    console.log(`Making WordPress API request to: ${url.toString()}`);
    console.log(`Method: ${method || 'GET'}`);
    console.log(`Auth required: ${requireAuth}`);

    // Make the request to WordPress
    const response = await fetch(url.toString(), {
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      }
    });

    console.log(`WordPress API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WordPress API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`WordPress API returned ${Array.isArray(data) ? data.length : 1} items`);

    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        headers: {
          'x-wp-total': response.headers.get('x-wp-total'),
          'x-wp-totalpages': response.headers.get('x-wp-totalpages')
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('WordPress API function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})