import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, country, sessiontoken } = await req.json()
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    if (!input || input.length < 2) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Build the autocomplete URL specifically for cities
    let autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${apiKey}&input=${encodeURIComponent(input)}`
    
    // Add session token for billing optimization
    if (sessiontoken) {
      autocompleteUrl += `&sessiontoken=${sessiontoken}`
    }
    
    // Restrict to cities and localities
    autocompleteUrl += '&types=(cities)'
    
    // Add country restriction if provided
    if (country) {
      // Convert country name to ISO country code for better results
      const countryCode = getCountryCode(country)
      if (countryCode) {
        autocompleteUrl += `&components=country:${countryCode}`
      }
    }
    
    console.log(`Fetching city autocomplete for "${input}" in country: ${country}`)
    
    const response = await fetch(autocompleteUrl)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places Autocomplete API error:', data.status, data.error_message)
      throw new Error(`Google Places Autocomplete API error: ${data.status}`)
    }

    // Transform predictions to focus on city names
    const predictions = data.predictions?.map((prediction: any) => {
      const mainText = prediction.structured_formatting?.main_text || prediction.description
      return {
        place_id: prediction.place_id,
        description: prediction.description,
        city_name: mainText,
        country_info: prediction.structured_formatting?.secondary_text || '',
        types: prediction.types || [],
      }
    }) || []

    console.log(`Found ${predictions.length} city suggestions`)

    return new Response(
      JSON.stringify({ 
        predictions, 
        status: data.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in google-cities-autocomplete function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        predictions: []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Helper function to convert country names to ISO codes
function getCountryCode(countryName: string): string {
  const countryMap: { [key: string]: string } = {
    'Afghanistan': 'af', 'Albania': 'al', 'Algeria': 'dz', 'Andorra': 'ad', 'Angola': 'ao',
    'Argentina': 'ar', 'Armenia': 'am', 'Australia': 'au', 'Austria': 'at', 'Azerbaijan': 'az',
    'Bahamas': 'bs', 'Bahrain': 'bh', 'Bangladesh': 'bd', 'Barbados': 'bb', 'Belarus': 'by',
    'Belgium': 'be', 'Belize': 'bz', 'Benin': 'bj', 'Bhutan': 'bt', 'Bolivia': 'bo',
    'Bosnia and Herzegovina': 'ba', 'Botswana': 'bw', 'Brazil': 'br', 'Brunei': 'bn',
    'Bulgaria': 'bg', 'Burkina Faso': 'bf', 'Burundi': 'bi', 'Cambodia': 'kh', 'Cameroon': 'cm',
    'Canada': 'ca', 'Chad': 'td', 'Chile': 'cl', 'China': 'cn', 'Colombia': 'co',
    'Costa Rica': 'cr', 'Croatia': 'hr', 'Cuba': 'cu', 'Cyprus': 'cy', 'Czech Republic': 'cz',
    'Denmark': 'dk', 'Dominican Republic': 'do', 'Ecuador': 'ec', 'Egypt': 'eg',
    'Estonia': 'ee', 'Ethiopia': 'et', 'Finland': 'fi', 'France': 'fr', 'Gabon': 'ga',
    'Georgia': 'ge', 'Germany': 'de', 'Ghana': 'gh', 'Greece': 'gr', 'Guatemala': 'gt',
    'Hungary': 'hu', 'Iceland': 'is', 'India': 'in', 'Indonesia': 'id', 'Iran': 'ir',
    'Iraq': 'iq', 'Ireland': 'ie', 'Israel': 'il', 'Italy': 'it', 'Jamaica': 'jm',
    'Japan': 'jp', 'Jordan': 'jo', 'Kazakhstan': 'kz', 'Kenya': 'ke', 'Kuwait': 'kw',
    'Latvia': 'lv', 'Lebanon': 'lb', 'Libya': 'ly', 'Lithuania': 'lt', 'Luxembourg': 'lu',
    'Malaysia': 'my', 'Malta': 'mt', 'Mexico': 'mx', 'Moldova': 'md', 'Monaco': 'mc',
    'Mongolia': 'mn', 'Montenegro': 'me', 'Morocco': 'ma', 'Myanmar': 'mm', 'Nepal': 'np',
    'Netherlands': 'nl', 'New Zealand': 'nz', 'Nicaragua': 'ni', 'Nigeria': 'ng',
    'North Korea': 'kp', 'North Macedonia': 'mk', 'Norway': 'no', 'Oman': 'om',
    'Pakistan': 'pk', 'Panama': 'pa', 'Paraguay': 'py', 'Peru': 'pe', 'Philippines': 'ph',
    'Poland': 'pl', 'Portugal': 'pt', 'Qatar': 'qa', 'Romania': 'ro', 'Russia': 'ru',
    'Saudi Arabia': 'sa', 'Serbia': 'rs', 'Singapore': 'sg', 'Slovakia': 'sk',
    'Slovenia': 'si', 'South Africa': 'za', 'South Korea': 'kr', 'Spain': 'es',
    'Sri Lanka': 'lk', 'Sudan': 'sd', 'Sweden': 'se', 'Switzerland': 'ch', 'Syria': 'sy',
    'Taiwan': 'tw', 'Thailand': 'th', 'Tunisia': 'tn', 'Turkey': 'tr', 'Ukraine': 'ua',
    'United Arab Emirates': 'ae', 'United Kingdom': 'gb', 'United States': 'us',
    'Uruguay': 'uy', 'Venezuela': 've', 'Vietnam': 'vn', 'Yemen': 'ye', 'Zimbabwe': 'zw'
  }
  
  return countryMap[countryName] || ''
}