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
    const { location, country = 'Thailand' } = await req.json();

    console.log('Geocoding location:', { location, country });

    if (!location) {
      return new Response(
        JSON.stringify({ 
          error: 'Location is required',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced location parsing for specific areas
    let searchQuery = '';
    
    // Handle specific location formats
    if (location.toLowerCase().includes('downtown')) {
      // For downtown areas, be more specific with city context
      if (country.toLowerCase().includes('thailand')) {
        searchQuery = `${location}, Bangkok, Thailand`;
      } else {
        searchQuery = `${location}, ${country}`;
      }
    } else if (location.includes(',')) {
      // Already has comma-separated format
      searchQuery = location;
    } else {
      // Standard location search
      searchQuery = `${location}, ${country}`;
    }

    console.log('Geocoding search query:', searchQuery);

    // Use Nominatim (OpenStreetMap) for free geocoding
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'PawMap-App/1.0 (contact@pawmap.app)', // Required by Nominatim
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nominatim API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        query: searchQuery
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Geocoding API error: ${response.status} - ${response.statusText}`,
          details: errorText,
          success: false
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Nominatim API response:', data);

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Location not found',
          success: false,
          query: searchQuery
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process results and format them
    const results = data.map((place: any) => ({
      place_id: place.place_id,
      formatted_address: place.display_name,
      geometry: {
        location: {
          lat: parseFloat(place.lat),
          lng: parseFloat(place.lon)
        }
      },
      types: place.type ? [place.type] : [],
      address_components: place.address ? {
        country: place.address.country,
        state: place.address.state,
        city: place.address.city || place.address.town || place.address.village,
        postcode: place.address.postcode,
        road: place.address.road,
        neighbourhood: place.address.neighbourhood || place.address.suburb
      } : {},
      confidence: place.importance || 0.5
    }));

    // Sort by confidence/importance
    results.sort((a: any, b: any) => b.confidence - a.confidence);

    return new Response(
      JSON.stringify({
        results: results,
        status: 'OK',
        success: true,
        total_results: results.length,
        geocoder_used: 'nominatim'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in geocode-location function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})