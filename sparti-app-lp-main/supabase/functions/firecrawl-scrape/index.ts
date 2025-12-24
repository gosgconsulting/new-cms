import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  url: string;
  formats?: any[];
  onlyMainContent?: boolean;
  waitFor?: number;
  timeout?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { url, formats = ['markdown'], onlyMainContent = true, waitFor = 0, timeout = 30000 }: ScrapeRequest = await req.json()

  if (!url) {
    return new Response(
      JSON.stringify({ error: 'URL is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get Firecrawl API key from environment
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY') || 'fc-200bce4322aa42ffa3eabae53b6d80bd'
  if (!firecrawlApiKey) {
    console.error('FIRECRAWL_API_KEY environment variable is not set')
    return new Response(
      JSON.stringify({ 
        error: 'Firecrawl API key not configured',
        details: 'FIRECRAWL_API_KEY environment variable is missing. Please configure it in your Supabase project settings.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('Firecrawl API key is configured:', firecrawlApiKey.substring(0, 8) + '...')
  console.log(`Scraping URL: ${url}`)

  // Call Firecrawl API v2
  const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firecrawlApiKey}`,
    },
      body: JSON.stringify({
        url,
        formats,
        onlyMainContent,
        waitFor,
        timeout
      })
  })

  if (!firecrawlResponse.ok) {
    const errorData = await firecrawlResponse.text()
    console.error('Firecrawl API error:', {
      status: firecrawlResponse.status,
      statusText: firecrawlResponse.statusText,
      headers: Object.fromEntries(firecrawlResponse.headers.entries()),
      body: errorData,
      url: url,
      apiKey: firecrawlApiKey ? '***configured***' : 'NOT_CONFIGURED'
    })
    return new Response(
      JSON.stringify({ 
        error: 'Failed to scrape URL',
        details: errorData,
        status: firecrawlResponse.status,
        statusText: firecrawlResponse.statusText,
        url: url,
        apiKeyConfigured: !!firecrawlApiKey,
        success: false
      }),
      { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        // Firecrawl cost estimate: $0.002 per scrape
        const estimatedCost = 0.002;

        await supabase.rpc('deduct_user_tokens', {
          p_user_id: user.id,
          p_service_name: 'firecrawl',
          p_model_name: 'scrape-v2',
          p_cost_usd: estimatedCost,
          p_request_data: {
            usage_type: 'website-scrape',
            url: url,
            formats: formats,
            onlyMainContent: onlyMainContent
          }
        });
        
        console.log(`✅ Logged Firecrawl scrape: $${estimatedCost.toFixed(3)}`);
      }
    }
  } catch (logError) {
    console.error('Failed to log API usage:', logError);
  }
  
  console.log(`Successfully scraped ${url}`)
  console.log('Firecrawl response structure:', Object.keys(result))

  // Handle different response formats based on what was requested
  const responseData: any = {
    success: true,
    url: result.url || url,
    data: result.data || result
  }

  // If JSON extraction was requested, return the extracted data
  if (formats && formats.length > 0 && formats[0].type === 'json') {
    responseData.data = result.data
    console.log('JSON extraction completed')
  } else {
    // For markdown/html extraction
    responseData.markdown = result.data?.markdown
    responseData.html = result.data?.html
    responseData.metadata = result.metadata
    responseData.links = result.links
    responseData.screenshot = result.screenshot
    responseData.pdf = result.pdf
  }

  return new Response(
    JSON.stringify(responseData),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})
