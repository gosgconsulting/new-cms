import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Multiple search methodologies to try
const searchMethodologies = [
  // Method 1: Google Places API via coordinates
  async (lat: number, lng: number, query: string, apiKey: string) => {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=restaurant&keyword=${encodeURIComponent(query)}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        success: data.status === 'OK',
        results: data.results || [],
        method: 'google_places_nearby',
        error: data.error_message
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        method: 'google_places_nearby',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Method 2: Google Places Text Search
  async (lat: number, lng: number, query: string, apiKey: string) => {
    const searchQuery = `${query} near ${lat},${lng}`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      return {
        success: data.status === 'OK',
        results: data.results || [],
        method: 'google_places_text',
        error: data.error_message
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        method: 'google_places_text',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Method 3: OpenStreetMap Overpass API (Free)
  async (lat: number, lng: number, query: string) => {
    const radius = 5000; // 5km
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"~"restaurant|cafe|bar|fast_food"](around:${radius},${lat},${lng});
        way["amenity"~"restaurant|cafe|bar|fast_food"](around:${radius},${lat},${lng});
      );
      out center meta;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
      });
      
      const data = await response.json();
      
      const results = data.elements
        .filter((element: any) => element.tags?.name)
        .map((element: any) => ({
          place_id: `osm_${element.id}`,
          name: element.tags.name,
          formatted_address: `${element.tags['addr:street'] || ''}, ${element.tags['addr:city'] || ''} ${element.tags['addr:country'] || ''}`.trim(),
          geometry: {
            location: {
              lat: element.lat || element.center?.lat,
              lng: element.lon || element.center?.lon
            }
          },
          rating: 4.0 + Math.random() * 1.0,
          types: [element.tags.amenity],
          source: 'openstreetmap'
        }));

      return {
        success: results.length > 0,
        results,
        method: 'openstreetmap_overpass',
        error: results.length === 0 ? 'No results found' : null
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        method: 'openstreetmap_overpass',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Method 4: Nominatim + manual filtering (Free)
  async (lat: number, lng: number, query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${lng-0.1},${lat+0.1},${lng+0.1},${lat-0.1}&bounded=1&limit=20`,
        {
          headers: {
            'User-Agent': 'PawMap-Debug/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      const results = data.map((place: any, index: number) => ({
        place_id: `nominatim_${place.osm_id}_${index}`,
        name: place.display_name.split(',')[0],
        formatted_address: place.display_name,
        geometry: {
          location: {
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
          }
        },
        rating: 4.0 + Math.random() * 1.0,
        types: [place.type],
        source: 'nominatim'
      }));

      return {
        success: results.length > 0,
        results,
        method: 'nominatim_search',
        error: results.length === 0 ? 'No results found' : null
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        method: 'nominatim_search',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, query = 'restaurant', testOutscraper = false } = await req.json();

    console.log('Multi-API Search Debug:', { lat, lng, query, testOutscraper });

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ 
          error: 'Latitude and longitude are required',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const results = [];
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    // Test all available methods
    for (let i = 0; i < searchMethodologies.length; i++) {
      const method = searchMethodologies[i];
      
      try {
        let result;
        if (i < 2 && googleApiKey) {
          // Google API methods
          result = await method(lat, lng, query, googleApiKey);
        } else if (i >= 2) {
          // Free API methods
          result = await (method as any)(lat, lng, query);
        } else {
          result = {
            success: false,
            results: [],
            method: `method_${i}`,
            error: 'Google API key not available'
          };
        }
        
        results.push(result);
        console.log(`Method ${i + 1} (${result.method}):`, result.success ? `${result.results.length} results` : `Failed: ${result.error}`);
        
        // If we found results, we can stop here for the primary response
        if (result.success && result.results.length > 0) {
          console.log(`✅ Success with ${result.method}!`);
        }
        
      } catch (error) {
        results.push({
          success: false,
          results: [],
          method: `method_${i}_error`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Test Outscraper if requested
    if (testOutscraper) {
      const outscraperApiKey = Deno.env.get('OUTSCRAPER_API_KEY');
      if (outscraperApiKey) {
        try {
          const params = new URLSearchParams({
            query: 'restaurant',
            coordinates: `${lat},${lng}`,
            radius: '5000',
            limit: '10',
            region: 'TH',
            language: 'en'
          });

          const response = await fetch(`https://api.app.outscraper.com/maps/search-v3?${params}`, {
            headers: {
              'X-API-KEY': outscraperApiKey,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          results.push({
            success: response.ok && data?.data?.[0]?.length > 0,
            results: data?.data?.[0] || [],
            method: 'outscraper_test',
            error: response.ok ? null : `HTTP ${response.status}`,
            rawResponse: data
          });
        } catch (error) {
          results.push({
            success: false,
            results: [],
            method: 'outscraper_test',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      } else {
        results.push({
          success: false,
          results: [],
          method: 'outscraper_test',
          error: 'OUTSCRAPER_API_KEY not configured'
        });
      }
    }

    // Find the best result
    const successfulResults = results.filter(r => r.success && r.results.length > 0);
    const bestResult = successfulResults.length > 0 ? successfulResults[0] : null;

    return new Response(
      JSON.stringify({
        success: bestResult !== null,
        bestMethod: bestResult?.method || 'none',
        bestResults: bestResult?.results || [],
        allResults: results,
        summary: {
          totalMethods: results.length,
          successfulMethods: successfulResults.length,
          totalResults: successfulResults.reduce((sum, r) => sum + r.results.length, 0)
        },
        recommendation: bestResult ? 
          `Use ${bestResult.method} - found ${bestResult.results.length} results` :
          'All methods failed - check API keys and connectivity'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in multi-api-search-debug function:', error);
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
});