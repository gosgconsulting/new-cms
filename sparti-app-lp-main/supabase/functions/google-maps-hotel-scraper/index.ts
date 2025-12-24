import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScrapeRequest {
  googleMapsUrl: string;
  location: string; // Country code for currency detection
  checkInDate: string; // YYYY-MM-DD format
  checkOutDate: string; // YYYY-MM-DD format
}

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'Thailand': 'THB',
  'United States': 'USD',
  'United Kingdom': 'GBP',
  'Australia': 'AUD',
  'Japan': 'JPY',
  'Singapore': 'SGD',
  'Malaysia': 'MYR',
  'Indonesia': 'IDR',
  'Philippines': 'PHP',
  'Vietnam': 'VND',
  'South Korea': 'KRW',
  'China': 'CNY',
  'India': 'INR',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
};

function addDatesToUrl(url: string, checkIn: string, checkOut: string, location: string): string {
  try {
    const urlObj = new URL(url);
    
    // Add check-in and check-out dates as query parameters
    urlObj.searchParams.set('checkin', checkIn);
    urlObj.searchParams.set('checkout', checkOut);
    
    // Add Google location parameter to try to influence currency
    // This maps country to Google's gl parameter
    const countryToGl: Record<string, string> = {
      'Thailand': 'th',
      'United States': 'us',
      'United Kingdom': 'gb',
      'Australia': 'au',
      'Japan': 'jp',
      'Singapore': 'sg',
      'Malaysia': 'my',
      'Indonesia': 'id',
      'Philippines': 'ph',
      'Vietnam': 'vn',
      'South Korea': 'kr',
      'China': 'cn',
      'India': 'in',
      'Germany': 'de',
      'France': 'fr',
      'Italy': 'it',
      'Spain': 'es',
    };
    
    const glParam = countryToGl[location];
    if (glParam) {
      urlObj.searchParams.set('gl', glParam);
      console.log(`Added Google location parameter: gl=${glParam}`);
    }
    
    const modifiedUrl = urlObj.toString();
    console.log('Modified URL with dates and location:', modifiedUrl);
    
    return modifiedUrl;
  } catch (error) {
    console.error('Error modifying URL:', error);
    return url;
  }
}

function parseHotelData(markdown: string, html: string, location: string): any {
  console.log('Parsing hotel data from scraped content...');
  
  // Extract hotel name
  const nameMatch = markdown.match(/^#\s+(.+?)$/m) || 
                    markdown.match(/^##\s+(.+?)$/m) ||
                    html.match(/<title>(.+?)\s*[-|]/);
  const hotelName = nameMatch ? nameMatch[1].trim() : 'Hotel';
  
  // Detect currency from scraped content first
  let detectedCurrency = 'USD';
  let currencySymbol = '$';
  
  // Currency detection patterns with their corresponding codes
  const currencyDetection = [
    { pattern: /฿\s*[0-9,]+/i, currency: 'THB', symbol: '฿' },
    { pattern: /\$\s*[0-9,]+/i, currency: 'USD', symbol: '$' },
    { pattern: /£\s*[0-9,]+/i, currency: 'GBP', symbol: '£' },
    { pattern: /€\s*[0-9,]+/i, currency: 'EUR', symbol: '€' },
    { pattern: /A\$\s*[0-9,]+/i, currency: 'AUD', symbol: 'A$' },
    { pattern: /¥\s*[0-9,]+/i, currency: 'JPY', symbol: '¥' },
    { pattern: /S\$\s*[0-9,]+/i, currency: 'SGD', symbol: 'S$' },
    { pattern: /RM\s*[0-9,]+/i, currency: 'MYR', symbol: 'RM' },
    { pattern: /Rp\s*[0-9,]+/i, currency: 'IDR', symbol: 'Rp' },
    { pattern: /₱\s*[0-9,]+/i, currency: 'PHP', symbol: '₱' },
    { pattern: /₫\s*[0-9,]+/i, currency: 'VND', symbol: '₫' },
    { pattern: /₩\s*[0-9,]+/i, currency: 'KRW', symbol: '₩' },
    { pattern: /¥\s*[0-9,]+/i, currency: 'CNY', symbol: '¥' },
    { pattern: /₹\s*[0-9,]+/i, currency: 'INR', symbol: '₹' },
  ];
  
  // Try to detect currency from content
  for (const { pattern, currency, symbol } of currencyDetection) {
    if (pattern.test(markdown) || pattern.test(html)) {
      detectedCurrency = currency;
      currencySymbol = symbol;
      console.log(`Detected currency from content: ${currency} (${symbol})`);
      break;
    }
  }
  
  // Try to find prices with the detected currency symbol
  const pricePatterns = [
    new RegExp(`${currencySymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*([0-9,]+(?:\\.[0-9]{2})?)`, 'i'),
    new RegExp(`([0-9,]+(?:\\.[0-9]{2})?)\\s*${currencySymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
    /\$\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /([0-9,]+(?:\.[0-9]{2})?)\s*(?:per night|\/night)/i,
  ];
  
  let price = null;
  let priceString = '';
  
  for (const pattern of pricePatterns) {
    const match = markdown.match(pattern) || html.match(pattern);
    if (match) {
      priceString = match[1].replace(/,/g, '');
      price = parseFloat(priceString);
      if (price && price > 0) {
        console.log(`Found price: ${price} ${detectedCurrency}`);
        break;
      }
    }
  }
  
  // Extract rating
  const ratingMatch = markdown.match(/(\d+\.?\d*)\s*(?:stars?|★|out of 5)/i) ||
                      markdown.match(/rating[:\s]*(\d+\.?\d*)/i);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
  
  // Extract address - more robust pattern
  const addressMatch = markdown.match(/\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln)[^,]*,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+/i) ||
                      html.match(/"streetAddress":"([^"]+)"/i) ||
                      html.match(/itemprop="address"[^>]*>([^<]+)</i);
  const address = addressMatch ? (addressMatch[1] || addressMatch[0]).trim() : '';
  
  // Extract amenities
  const amenities: string[] = [];
  const amenityKeywords = ['wifi', 'pool', 'parking', 'gym', 'spa', 'restaurant', 'bar', 'breakfast', 'air conditioning', 'pet friendly'];
  for (const keyword of amenityKeywords) {
    if (markdown.toLowerCase().includes(keyword) || html.toLowerCase().includes(keyword)) {
      amenities.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  return {
    name: hotelName,
    price: price || 0,
    currency: detectedCurrency,
    rating: rating || 0,
    address,
    amenities: amenities.slice(0, 6), // Limit to 6 amenities
    location,
    url: '', // Will be set later
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { googleMapsUrl, location, checkInDate, checkOutDate }: ScrapeRequest = await req.json();

    if (!googleMapsUrl || !checkInDate || !checkOutDate) {
      return new Response(
        JSON.stringify({ error: 'Google Maps URL, check-in date, and check-out date are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Scraping Google Maps URL:', googleMapsUrl);
    console.log('Location:', location);
    console.log('Check-in:', checkInDate);
    console.log('Check-out:', checkOutDate);

    // Add dates and location to URL before scraping
    const urlWithDates = addDatesToUrl(googleMapsUrl, checkInDate, checkOutDate, location);

    // Get Firecrawl API key from environment
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'Firecrawl API key not configured',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling Firecrawl API with modified URL...');
    
    // Call Firecrawl API v2 to scrape the Google Maps page with dates
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url: urlWithDates,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        timeout: 60000,
      })
    });

    if (!firecrawlResponse.ok) {
      const errorData = await firecrawlResponse.text();
      console.error('Firecrawl API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to scrape Google Maps URL',
          details: errorData,
        }),
        { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const result = await firecrawlResponse.json();
    console.log('Firecrawl scrape successful');

    // Parse the scraped data
    const markdown = result.data?.markdown || '';
    const html = result.data?.html || '';
    
    const hotelData = parseHotelData(markdown, html, location);
    hotelData.url = urlWithDates;
    hotelData.checkIn = checkInDate;
    hotelData.checkOut = checkOutDate;

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
          const estimatedCost = 0.002;
          await supabase.rpc('deduct_user_tokens', {
            p_user_id: user.id,
            p_service_name: 'firecrawl',
            p_model_name: 'google-maps-scraper',
            p_cost_usd: estimatedCost,
            p_request_data: {
              usage_type: 'hotel-price-scrape',
              url: googleMapsUrl,
              location: location,
            }
          });
          console.log(`✅ Logged Firecrawl scrape: $${estimatedCost.toFixed(3)}`);
        }
      }
    } catch (logError) {
      console.error('Failed to log API usage:', logError);
    }

    console.log('Returning hotel data:', hotelData);

    return new Response(
      JSON.stringify({
        success: true,
        hotel: hotelData,
        rawData: {
          markdown: markdown.substring(0, 500), // Return first 500 chars for debugging
          urlWithDates,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
