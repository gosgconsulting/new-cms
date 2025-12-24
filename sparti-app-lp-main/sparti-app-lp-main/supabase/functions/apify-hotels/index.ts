import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotelSearchParams {
  searchQuery: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  currencyCode?: string;
  maxResults?: number;
}

const MAX_RESULTS_ABSOLUTE = 100;
const TIMEOUT_MS = 90000; // Increased to 90 seconds for hotel searches
const MAX_RETRIES = 1; // Reduced retries since each attempt takes long

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      searchQuery,
      checkInDate,
      checkOutDate,
      numberOfAdults = 2,
      numberOfChildren = 0,
      currencyCode = 'USD',
      maxResults = 20
    }: HotelSearchParams = body;

    console.log('🏨 Hotel search request:', { searchQuery, checkInDate, checkOutDate, maxResults });

    if (!searchQuery) {
      return new Response(JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      console.error('❌ APIFY_API_KEY not configured in Supabase Edge Function Secrets');
      return new Response(JSON.stringify({ 
        error: 'Apify API key not configured',
        details: 'Please add APIFY_API_KEY in Supabase Dashboard > Project Settings > Edge Functions > Secrets'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const safeMaxResults = Math.min(maxResults, MAX_RESULTS_ABSOLUTE);

    // Use dtrungtin/google-hotels-scraper actor (more reliable)
    const searchInput = {
      queries: [searchQuery], // Actor expects array of queries
      checkIn: checkInDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      checkOut: checkOutDate || new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      adults: numberOfAdults,
      children: numberOfChildren,
      currency: currencyCode,
      maxItems: safeMaxResults,
      sortBy: 'lowest_price'
    };

    console.log('📤 Apify hotel search input:', JSON.stringify(searchInput, null, 2));

    const actorUrl = 'https://api.apify.com/v2/acts/dtrungtin~google-hotels-scraper/run-sync-get-dataset-items';
    let apifyResponse;
    let attempt = 0;
    let lastError: string = '';

    console.log('📡 Calling Apify API:', actorUrl);

    while (attempt < MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        console.log(`🔄 Attempt ${attempt + 1}/${MAX_RETRIES}`);
        
        apifyResponse = await fetch(actorUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apifyApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(searchInput),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (apifyResponse.ok) {
          console.log('✅ Apify API call successful');
          break;
        } else {
          const errorText = await apifyResponse.text();
          lastError = `HTTP ${apifyResponse.status}: ${errorText}`;
          console.error(`❌ API error:`, lastError);
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Attempt ${attempt + 1} failed:`, lastError);
        
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = 'Request timeout - hotel search took too long';
          console.log('⏱️ Request timeout, retrying...');
        }
      }
      attempt++;
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Waiting 1s before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!apifyResponse || !apifyResponse.ok) {
      console.error('❌ All retry attempts failed');
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch hotel data from Apify',
        details: lastError || 'All retry attempts exhausted',
        suggestion: 'Try searching for a more specific hotel name or location'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const rawResults = await apifyResponse.json();
    console.log(`📊 Received ${rawResults?.length || 0} raw results from Apify`);

    if (!rawResults || rawResults.length === 0) {
      console.log('⚠️ No hotels found for query:', searchQuery);
      return new Response(JSON.stringify({
        hotels: [],
        total: 0,
        source: 'apify-hotels',
        message: 'No hotels found. Try a different search term or location.'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Transform hotel data - handle different actor response formats
    const transformedResults = (rawResults || []).map((hotel: any) => {
      // Extract price - handles multiple formats
      let pricePerNight = null;
      if (hotel.price) {
        pricePerNight = {
          amount: typeof hotel.price === 'number' ? hotel.price : (hotel.price.amount || hotel.price.value || 0),
          currency: hotel.price.currency || hotel.currency || currencyCode,
          date: new Date().toISOString()
        };
      } else if (hotel.rate) {
        pricePerNight = {
          amount: typeof hotel.rate === 'number' ? hotel.rate : (hotel.rate.amount || 0),
          currency: hotel.rate.currency || currencyCode,
          date: new Date().toISOString()
        };
      }

      return {
        hotelName: hotel.name || hotel.title || hotel.hotelName || 'Unknown Hotel',
        address: hotel.address || hotel.location?.address,
        city: hotel.city,
        country: hotel.country,
        latitude: hotel.location?.lat || hotel.latitude,
        longitude: hotel.location?.lng || hotel.longitude,
        placeId: hotel.placeId || hotel.id || hotel.hotelId,
        phone: hotel.phone,
        email: hotel.email,
        website: hotel.website || hotel.url || hotel.link,
        starRating: hotel.stars || hotel.starRating || hotel.star,
        rating: hotel.rating || hotel.overallRating || hotel.guestRating,
        reviewsCount: hotel.reviewsCount || hotel.numberOfReviews || hotel.reviews,
        hotelClass: hotel.class || hotel.hotelClass,
        propertyType: hotel.propertyType || hotel.type || 'hotel',
        pricePerNight,
        priceRange: hotel.priceLevel,
        amenities: hotel.amenities || hotel.features || hotel.facilities || [],
        roomAmenities: hotel.roomAmenities || [],
        rooms: hotel.rooms || [],
        bookingLinks: {
          direct: hotel.bookingUrl || hotel.website || hotel.url,
          booking: hotel.bookingLinks?.booking,
          agoda: hotel.bookingLinks?.agoda,
          expedia: hotel.bookingLinks?.expedia,
          hotelscom: hotel.bookingLinks?.hotelscom,
          ...(hotel.bookingSites || {})
        },
        availabilityStatus: hotel.availability || 'AVAILABLE',
        checkInTime: hotel.checkIn || hotel.checkInTime,
        checkOutTime: hotel.checkOut || hotel.checkOutTime,
        cancellationPolicy: hotel.cancellationPolicy,
        petPolicy: hotel.petPolicy,
        childPolicy: hotel.childPolicy,
        description: hotel.description || hotel.about || hotel.overview,
        highlights: hotel.highlights || [],
        nearbyAttractions: hotel.nearbyAttractions || [],
        images: hotel.images || hotel.photos || hotel.pictures || [],
        businessStatus: hotel.isClosed ? 'CLOSED' : 'OPERATIONAL',
        temporarilyClosed: hotel.temporarilyClosed || false,
        permanentlyClosed: hotel.permanentlyClosed || false
      };
    });

    const totalElapsed = Date.now() - startTime;

    console.log(`✅ Hotel search completed: ${transformedResults.length} hotels in ${totalElapsed}ms`);

    return new Response(JSON.stringify({
      hotels: transformedResults,
      total: transformedResults.length,
      source: 'apify-hotels',
      query: searchQuery,
      searchParams: { searchQuery, checkInDate, checkOutDate, numberOfAdults },
      costControl: {
        maxResults: safeMaxResults,
        actualResults: transformedResults.length,
        durationMs: totalElapsed
      }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('💥 Fatal error in apify-hotels:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});