import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApifySearchParams {
  query?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  leadQuantity?: number;
  categories?: string[];
  priceRange?: string;
  openNow?: boolean;
  language?: string;
  country?: string;
  includeOpeningHours?: boolean;
  includeAdditionalInfo?: boolean;
  includeCompanyContacts?: boolean;
  includeBusinessLeads?: boolean;
  includeReviewCount?: boolean;
  includeContactDetails?: boolean;
}

interface ApifyPlace {
  placeId: string;
  title: string;
  address: string;
  location: { lat: number; lng: number; };
  rating?: number;
  reviewsCount?: number;
  categories: string[];
  phone?: string;
  website?: string;
  email?: string;
  openingHours?: any;
  priceRange?: string;
  socialMedia?: any;
  digitalPresence?: any;
  businessSize?: string;
  websiteTechnology?: string[];
  websiteEmails?: string[];
  bookingLinks?: any;
  orderLinks?: string[];
  menuLink?: string;
  additionalInfo?: any;
  popularTimes?: any[];
  temporarilyClosed?: boolean;
  permanentlyClosed?: boolean;
  images?: string[];
  peopleAlsoSearch?: string[];
}

const MAX_COST_PER_QUERY = 5.00;
const MAX_CRAWLED_PLACES_ABSOLUTE = 100;
const TIMEOUT_MS = 30000;
const MAX_RETRIES = 2;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const {
      query, location, lat, lng, radius = 5, limit = 20, leadQuantity = 20,
      categories = [], priceRange, openNow, language = 'en', country = 'US'
    }: ApifySearchParams = body;

    console.log('🔍 Enhanced Apify search:', { query, location, leadQuantity });

    if (!query && !location && (!lat || !lng)) {
      return new Response(JSON.stringify({ error: 'Search parameters required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apifyApiKey = Deno.env.get('APIFY_API_KEY');
    if (!apifyApiKey) {
      return new Response(JSON.stringify({ error: 'Apify API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const maxCrawledPlaces = Math.max(leadQuantity || 50, 50);
    
    let searchQuery = categories.length > 0 ? categories[0] : (query || 'businesses');
    let locationContext = lat && lng ? `${lat},${lng}` : (location || '');
    if (country && country !== 'US') locationContext += `, ${country}`;
    const finalSearchQuery = locationContext ? `${searchQuery} near ${locationContext}` : searchQuery;

    const searchInput = {
      searchStringsArray: [finalSearchQuery],
      maxCrawledPlacesPerSearch: maxCrawledPlaces,
      language: language || 'en',
      includeOpeningHours: true,
      additionalInfo: true,
      companyContacts: true,
      businessLeads: true,
      reviewsCount: true,
      contactDetails: true,
      maxImages: 5,
      timeout: 20000
    };

    let apifyResponse;
    let attempt = 0;
    const primaryActor = 'https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items';
    
    while (attempt < MAX_RETRIES) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        apifyResponse = await fetch(primaryActor, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apifyApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(searchInput),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (apifyResponse.ok) break;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') break;
      }
      attempt++;
      if (attempt < MAX_RETRIES) await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!apifyResponse || !apifyResponse.ok) {
      return new Response(JSON.stringify({ error: 'Apify search failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const rawResults = await apifyResponse.json();
    
    const transformedResults: ApifyPlace[] = (rawResults || []).map((place: any) => ({
      placeId: place.placeId || `apify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: place.title || place.name || 'Unnamed Business',
      address: place.address || '',
      location: { lat: place.location?.lat || 0, lng: place.location?.lng || 0 },
      rating: place.totalScore || place.rating,
      reviewsCount: place.reviewsCount || place.reviews || 0,
      categories: [place.categoryName, place.category, ...(place.categories || [])].filter(Boolean),
      phone: place.phone || place.phoneNumber,
      website: place.website || place.url,
      email: place.email,
      openingHours: place.openingHours,
      priceRange: place.priceRange || place.priceLevel,
      socialMedia: { facebook: place.facebook, instagram: place.instagram, twitter: place.twitter, linkedin: place.linkedin, youtube: place.youtube },
      digitalPresence: { hasFacebook: !!place.facebook, hasInstagram: !!place.instagram, hasWebsite: !!place.website, hasGoogleListing: true, adPixels: place.adPixels || [] },
      businessSize: place.reviewsCount >= 500 ? 'large' : (place.reviewsCount >= 100 ? 'medium' : 'small'),
      websiteTechnology: place.websiteTechnology || [],
      websiteEmails: place.emails || [],
      bookingLinks: place.reservationLinks,
      orderLinks: place.orderLinks || [],
      menuLink: place.menuUrl,
      additionalInfo: { amenities: place.amenities, features: place.attributes },
      popularTimes: place.popularTimesHistogram,
      temporarilyClosed: place.temporarilyClosed || place.businessStatus === 'CLOSED_TEMPORARILY',
      permanentlyClosed: place.permanentlyClosed || place.businessStatus === 'CLOSED_PERMANENTLY',
      images: place.imageUrls || place.photos || [],
      peopleAlsoSearch: place.peopleAlsoSearch || []
    })).filter((place: any) => place.title && place.address);

    const finalResults = transformedResults.slice(0, maxCrawledPlaces);

    return new Response(JSON.stringify({
      places: finalResults,
      total: finalResults.length,
      source: 'apify',
      costControl: { maxResults: maxCrawledPlaces, actualResults: finalResults.length, durationMs: Date.now() - startTime }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});