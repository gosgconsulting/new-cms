import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_BASE = "https://api.lobstr.io/v1";
const lobstrApiKey = Deno.env.get('LOBSTR_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeolocationRequest {
  country_code: string;
  region?: string;
  district?: string;
  city?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!lobstrApiKey) {
      throw new Error('Lobstr API key not configured');
    }

    const request: GeolocationRequest = await req.json();
    console.log('=== LOBSTR GEOLOCATION REQUEST ===');
    console.log('Request data:', JSON.stringify(request, null, 2));

    const lobstrHeaders = {
      'Authorization': `Token ${lobstrApiKey}`,
      'Content-Type': 'application/json',
    };

    // Build query parameters
    const params = new URLSearchParams();
    params.append('country_code', request.country_code);
    
    if (request.region) {
      params.append('region', request.region);
    }
    
    if (request.district) {
      params.append('district', request.district);
    }
    
    if (request.city) {
      params.append('city', request.city);
    }

    console.log('Fetching geolocation data with params:', params.toString());

    const response = await fetch(`${API_BASE}/googlemaps_rocket?${params.toString()}`, {
      method: 'GET',
      headers: lobstrHeaders,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lobstr geolocation API error:', response.status, errorText);
      throw new Error(`Lobstr geolocation API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Geolocation data received:', Array.isArray(data) ? `${data.length} locations` : data);

    return new Response(JSON.stringify({
      success: true,
      data,
      debugData: {
        request,
        responseSize: Array.isArray(data) ? data.length : 'non-array'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Geolocation request failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugData: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});