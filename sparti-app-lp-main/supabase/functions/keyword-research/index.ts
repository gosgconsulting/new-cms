import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KeywordResearchRequest {
  keywords: string[];
  country?: string;
  language?: string;
  brand_id?: string;
}

// DataForSEO location codes mapping (most popular countries)
const LOCATION_CODES: Record<string, number> = {
  'United States': 2840,
  'United Kingdom': 2826,
  'Canada': 2124,
  'Australia': 2036,
  'Germany': 2276,
  'France': 2250,
  'Spain': 2724,
  'Italy': 2380,
  'Japan': 2392,
  'Brazil': 2076,
  'India': 2356,
  'China': 2156,
  'Singapore': 2702,
  'Thailand': 2764,
  'Malaysia': 2458,
  'Philippines': 2608,
  'Vietnam': 2704,
  'Indonesia': 2360,
  'Netherlands': 2528,
  'Mexico': 2484,
  'South Korea': 2410,
  'Russia': 2643,
  'Poland': 2616,
  'Turkey': 2792,
  'Sweden': 2752,
  'Norway': 2578,
  'Denmark': 2208,
  'Finland': 2246,
  'Belgium': 2056,
  'Switzerland': 2756,
  'Austria': 2040,
  'Ireland': 2372,
  'New Zealand': 2554,
  'South Africa': 2710,
  'Argentina': 2032,
  'Chile': 2152,
  'Colombia': 2170,
  'Peru': 2604,
  'Venezuela': 2862,
  'Egypt': 2818,
  'Israel': 2376,
  'Saudi Arabia': 2682,
  'UAE': 2784,
  'Pakistan': 2586,
  'Bangladesh': 2050,
  'Sri Lanka': 2144,
  'Nepal': 2524,
  'Portugal': 2620,
  'Czech Republic': 2203,
  'Hungary': 2348,
  'Romania': 2642,
  'Bulgaria': 2100,
  'Greece': 2300,
  'Ukraine': 2804,
  'Belarus': 2112,
  'Lithuania': 2440,
  'Latvia': 2428,
  'Estonia': 2233,
  'Croatia': 2191,
  'Slovenia': 2705,
  'Slovakia': 2703,
  'Serbia': 2688,
  'Bosnia and Herzegovina': 2070,
  'Montenegro': 2499,
  'Albania': 2008,
  'North Macedonia': 2807,
  'Moldova': 2498,
  'Georgia': 2268,
  'Armenia': 2051,
  'Azerbaijan': 2031
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { keywords, country = 'United States', language = 'en', brand_id }: KeywordResearchRequest = await req.json();
    
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new Error('Keywords array is required');
    }

    // Get the DataForSEO API credentials from secrets
    const apiKey = Deno.env.get('DATAFORSEO_API_KEY');
    if (!apiKey) {
      throw new Error('DataForSEO API key not configured');
    }

    // DataForSEO uses email:password format for authentication
    // Check if the API key is already Base64 encoded or needs encoding
    const auth = apiKey.includes(':') ? btoa(apiKey) : apiKey;
    const locationCode = LOCATION_CODES[country] || 2840; // Default to US if country not found
    
    console.log('Starting keyword research for:', keywords, 'in', country);
    console.log('Using location code:', locationCode);
    
    // Get search volume data for the original keywords only (no extra suggestions)
    const volumeResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        keywords: keywords,
        location_code: locationCode,
        language_code: language
      }])
    });

    // Check response status codes
    if (!volumeResponse.ok) {
      console.error('Volume API Error:', volumeResponse.status, volumeResponse.statusText);
      const errorText = await volumeResponse.text();
      console.error('Volume API Error Response:', errorText);
      throw new Error(`DataForSEO Volume API failed: ${volumeResponse.status} ${volumeResponse.statusText}`);
    }

    const volumeData = await volumeResponse.json();

    console.log('DataForSEO API response received, processing data...');
    console.log('Volume data status:', volumeData?.status_code, volumeData?.status_message);
    console.log('Volume data tasks length:', volumeData?.tasks?.length);

    // Process the keyword data (only volume data, no suggestions)
    const processedKeywords = processKeywordData(null, volumeData);
    
    console.log('Processed keywords count:', processedKeywords.length);

    // Record token usage
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Get user ID from the request headers
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user } } = await supabase.auth.getUser(token);
          
          if (user) {
            // Calculate cost based on number of keywords (DataForSEO pricing)
            await supabase.rpc('deduct_user_tokens', {
              p_user_id: user.id,
              p_service_name: 'keyword-research',
              p_model_name: 'dataforseo-api',
              p_cost_usd: 0.1,
              p_brand_id: brand_id,
              p_request_data: {
                keywords: keywords,
                country: country,
                language: language,
                total_keywords: processedKeywords.length,
                processed_by: 'keyword-research-function'
              }
            });
            
            console.log(`Token usage recorded for user ${user.id}: $0.1 for ${keywords.length} keywords`);
          }
        }
      }
    } catch (tokenError) {
      console.error('Error recording token usage:', tokenError);
      // Don't fail the request if token tracking fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          keywords: processedKeywords,
          country: country,
          location_code: locationCode,
          total_keywords: processedKeywords.length
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    );
  } catch (error) {
    console.error('Error in keyword research:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Failed to research keywords',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      },
    );
  }
});

function processKeywordData(keywordData: any, volumeData: any): any[] {
  const results: any[] = [];
  
  console.log('Processing keyword data...');
  console.log('Volume data structure:', JSON.stringify(volumeData, null, 2));
  
  // Process original keywords with volume data only (no suggestions)
  if (volumeData?.tasks?.[0]?.result) {
    console.log('Found volume data:', volumeData.tasks[0].result.length);
    volumeData.tasks[0].result.forEach((item: any, index: number) => {
      console.log(`Processing volume ${index}:`, item);
      if (item.keyword) {
        // Add entry for original keyword
        results.push({
          keyword: item.keyword,
          search_volume: item.search_volume || 0,
          cpc: item.cpc || 0,
          competition: item.competition || 0,
          competition_level: getCompetitionLevel(item.competition || 0),
          keyword_difficulty: calculateKeywordDifficulty(item.competition || 0, item.search_volume || 0),
          intent: determineIntent(item.keyword),
          monthly_searches: item.monthly_searches || [],
          source: 'original'
        });
      }
    });
  } else {
    console.log('No volume data found in response');
    console.log('Volume data task result:', volumeData?.tasks?.[0]?.result);
  }

  console.log('Final processed results:', results.length);

  // Sort by search volume descending
  return results.sort((a, b) => (b.search_volume || 0) - (a.search_volume || 0));
}

function getCompetitionLevel(competition: number): string {
  if (competition >= 0.7) return 'High';
  if (competition >= 0.4) return 'Medium';
  return 'Low';
}

function calculateKeywordDifficulty(competition: number, searchVolume: number): number {
  // Simple algorithm to estimate keyword difficulty (1-100)
  const competitionScore = competition * 60;
  const volumeScore = Math.min(searchVolume / 10000 * 40, 40);
  return Math.min(Math.round(competitionScore + volumeScore), 100);
}

function determineIntent(keyword: string): string {
  const lowerKeyword = keyword.toLowerCase();
  
  // Transactional intent
  if (/\b(buy|purchase|order|shop|store|price|cost|cheap|deal|discount|sale)\b/.test(lowerKeyword)) {
    return 'Transactional';
  }
  
  // Commercial intent
  if (/\b(best|top|review|compare|vs|alternative|option)\b/.test(lowerKeyword)) {
    return 'Commercial';
  }
  
  // Navigational intent  
  if (/\b(login|sign in|website|official|contact|about)\b/.test(lowerKeyword)) {
    return 'Navigational';
  }
  
  // Default to informational
  return 'Informational';
}