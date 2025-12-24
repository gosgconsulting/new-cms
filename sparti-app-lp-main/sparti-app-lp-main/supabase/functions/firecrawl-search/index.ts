import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchRequest {
  query: string;
  num_results?: number;
  country?: string;
  language?: string;
}

interface SearchResult {
  title: string;
  url: string;
  description: string;
  position: number;
  domain: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, num_results = 10, country = 'us', language = 'en' }: SearchRequest = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ 
          error: 'Query is required',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Searching for: "${query}" (${num_results} results)`)

    // Get Firecrawl API key from environment
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API key not configured',
          details: 'FIRECRAWL_API_KEY environment variable is missing. Please configure it in your Supabase project settings.',
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Firecrawl API key is configured:', firecrawlApiKey.substring(0, 8) + '...')

    // Call Firecrawl Search API
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: JSON.stringify({
        query: query,
        numResults: num_results,
        country: country,
        language: language,
        pageOptions: {
          onlyMainContent: false,
          includeHtml: false,
          includeRawHtml: false,
          screenshot: false,
          waitFor: 0
        }
      })
    })

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.text()
      console.error('Firecrawl Search API error:', {
        status: firecrawlResponse.status,
        statusText: firecrawlResponse.statusText,
        headers: Object.fromEntries(firecrawlResponse.headers.entries()),
        body: errorData,
        query: query,
        apiKey: firecrawlApiKey ? '***configured***' : 'NOT_CONFIGURED'
      })
      return new Response(
        JSON.stringify({ 
          error: 'Failed to search',
          details: errorData,
          status: firecrawlResponse.status,
          statusText: firecrawlResponse.statusText,
          query: query,
          apiKeyConfigured: !!firecrawlApiKey,
          success: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await firecrawlResponse.json()
    
    // Log API usage
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Firecrawl search cost estimate: $0.003 per search
          const estimatedCost = 0.003;

          await supabase.rpc('deduct_user_tokens', {
            p_user_id: user.id,
            p_service_name: 'firecrawl',
            p_model_name: 'search-v2',
            p_cost_usd: estimatedCost,
            p_request_data: {
              usage_type: 'web-search',
              query: query,
              num_results: num_results,
              country: country
            }
          });
          
          console.log(`✅ Logged Firecrawl search: $${estimatedCost.toFixed(3)}`);
        }
      }
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
    }
    
    // Extract search results from Firecrawl response
    const searchResults = result.data || []
    console.log(`Found ${searchResults.length} search results`)

    // Transform results to our format
    const formattedResults: SearchResult[] = searchResults.map((item: any, index: number) => ({
      title: item.title || item.metadata?.title || 'Untitled',
      url: item.url || item.link || '',
      description: item.description || item.metadata?.description || item.snippet || '',
      position: index + 1,
      domain: item.url ? new URL(item.url).hostname : ''
    }))

    console.log(`Successfully processed ${formattedResults.length} search results`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        results: formattedResults,
        query: query,
        total_results: formattedResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Firecrawl search error:', error.message)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
