import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotelDetailsRequest {
  hotelUrl: string;
  hotelName?: string;
}

interface HotelDetails {
  success: boolean;
  hotelName?: string;
  url?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
  reviews?: Array<{
    rating?: number;
    text?: string;
    author?: string;
  }>;
  fullMarkdown?: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { hotelUrl, hotelName }: HotelDetailsRequest = body;

    console.log('🏨 Hotel details scrape request:', { hotelUrl, hotelName });

    if (!hotelUrl) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Hotel URL is required' 
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('❌ FIRECRAWL_API_KEY not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Firecrawl API key not configured',
        details: 'Please add FIRECRAWL_API_KEY in Supabase Dashboard > Edge Functions > Secrets'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log('📡 Calling Firecrawl API to scrape:', hotelUrl);

    // Scrape the hotel page using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: hotelUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 30000
      })
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('❌ Firecrawl API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to scrape hotel page',
        details: `HTTP ${scrapeResponse.status}: ${errorText}`
      }), { status: scrapeResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const scrapeData = await scrapeResponse.json();
    console.log('✅ Successfully scraped hotel page');

    // Extract structured data from the scraped content
    const markdown = scrapeData.data?.markdown || '';
    const html = scrapeData.data?.html || '';
    
    // Simple extraction logic (can be enhanced with AI parsing)
    const amenitiesRegex = /(?:amenities|features|facilities)[:\s]*(.*?)(?:\n\n|\n#|$)/is;
    const amenitiesMatch = markdown.match(amenitiesRegex);
    const amenities = amenitiesMatch 
      ? amenitiesMatch[1].split(/[,\n•\-]/).map(a => a.trim()).filter(a => a.length > 0)
      : [];

    // Extract images (look for image URLs in markdown)
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/g;
    const images: string[] = [];
    let imgMatch;
    while ((imgMatch = imageRegex.exec(markdown)) !== null) {
      images.push(imgMatch[1]);
    }

    // Extract description (first paragraph after title)
    const descriptionRegex = /^#.*?\n\n(.*?)(?:\n\n|$)/s;
    const descriptionMatch = markdown.match(descriptionRegex);
    const description = descriptionMatch?.[1]?.substring(0, 500) || '';

    const hotelDetails: HotelDetails = {
      success: true,
      hotelName: hotelName || scrapeData.data?.title || '',
      url: hotelUrl,
      description,
      amenities: amenities.slice(0, 20),
      images: images.slice(0, 10),
      reviews: [], // Reviews require more complex parsing
      fullMarkdown: markdown.substring(0, 5000) // Limit size
    };

    console.log(`✅ Extracted hotel details (took ${Date.now() - startTime}ms)`);

    return new Response(JSON.stringify(hotelDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Fatal error in hotel-details-firecrawl:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
