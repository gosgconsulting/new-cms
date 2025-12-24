import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VenueData {
  place_id: string;
  name: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types: string[];
  primary_type?: string;
  is_pet_friendly: boolean;
  pet_friendly_evidence: any;
  google_data: any;
  search_query_hash?: string;
  search_location?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { venues, searchHash, searchLocation } = await req.json()
    
    console.log(`📦 Caching ${venues.length} venues from search`)

    // Prepare venues for database storage
    const venuesToCache: VenueData[] = venues.map((venue: any) => ({
      place_id: venue.place_id,
      name: venue.name,
      formatted_address: venue.formatted_address,
      latitude: venue.geometry.location.lat,
      longitude: venue.geometry.location.lng,
      rating: venue.rating,
      user_ratings_total: venue.user_ratings_total,
      price_level: venue.price_level,
      types: venue.types || [],
      primary_type: venue.primary_type_display_name,
      is_pet_friendly: venue.pet_friendly_verified || false,
      pet_friendly_evidence: venue.pet_friendly_evidence || {},
      google_data: venue,
      search_query_hash: searchHash,
      search_location: searchLocation ? `POINT(${searchLocation.lng} ${searchLocation.lat})` : null,
    }))

    // Batch insert venues with conflict resolution
    const { data, error } = await supabase
      .from('venues')
      .upsert(venuesToCache, { 
        onConflict: 'place_id',
        ignoreDuplicates: false 
      })

    if (error) {
      console.error('Error caching venues:', error)
      throw error
    }

    console.log(`✅ Successfully cached ${venuesToCache.length} venues`)

    // Update search query record
    if (searchHash) {
      await supabase
        .from('search_queries')
        .upsert({
          query_hash: searchHash,
          search_params: { cached: true },
          result_count: venues.length,
          api_calls_made: 1,
          last_searched: new Date().toISOString(),
        }, {
          onConflict: 'query_hash'
        })
    }

    return new Response(JSON.stringify({
      cached_count: venuesToCache.length,
      status: 'success'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Cache venues error:', error)
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})