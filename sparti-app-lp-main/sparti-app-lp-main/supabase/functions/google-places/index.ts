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
    const { 
      query, 
      location, 
      radius = 5000, 
      type, 
      prioritizeBusinessName, 
      country, 
      city, 
      searchType, 
      services, 
      locationInput,
      place_id
    } = await req.json()
    
    console.log('Search parameters:', { query, location, radius, type, country, city, searchType, services, locationInput, place_id })
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // Handle place details request
    if (searchType === 'place_details' && place_id) {
      console.log('Fetching place details for:', place_id)
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=place_id,name,formatted_address,geometry,rating,user_ratings_total,photos,types,primary_type_display_name,opening_hours,formatted_phone_number,website&key=${apiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      
      if (detailsData.status === 'OK' && detailsData.result) {
        const place = detailsData.result;
        place.isSearchedBusiness = true;
        
        console.log('✅ Successfully fetched place details:', {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          types: place.types,
          country_from_address: place.formatted_address?.split(',').pop()?.trim()
        });
        
        return new Response(JSON.stringify({
          places: [place],
          status: 'success'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        console.error('❌ Place details failed:', {
          status: detailsData.status, 
          error_message: detailsData.error_message,
          place_id,
          raw_response: detailsData
        });
        throw new Error(`Place details not found: ${detailsData.status} - ${detailsData.error_message || 'Unknown error'}`);
      }
    }

    // Get country code for componentRestrictions
    const getCountryCode = (countryName: string): string => {
      const countryMap: { [key: string]: string } = {
        'thailand': 'th',
        'philippines': 'ph',
        'singapore': 'sg',
        'malaysia': 'my',
        'indonesia': 'id',
        'vietnam': 'vn',
        'cambodia': 'kh',
        'laos': 'la',
        'myanmar': 'mm',
        'brunei': 'bn',
        'united states': 'us',
        'usa': 'us',
        'canada': 'ca',
        'united kingdom': 'gb',
        'uk': 'gb',
        'australia': 'au',
        'new zealand': 'nz',
        'japan': 'jp',
        'south korea': 'kr',
        'china': 'cn',
        'taiwan': 'tw',
        'hong kong': 'hk',
        'india': 'in',
        'france': 'fr',
        'germany': 'de',
        'italy': 'it',
        'spain': 'es',
        'netherlands': 'nl',
        'belgium': 'be',
        'switzerland': 'ch',
        'austria': 'at',
        'portugal': 'pt',
        'greece': 'gr',
        'turkey': 'tr',
        'russia': 'ru',
        'brazil': 'br',
        'argentina': 'ar',
        'chile': 'cl',
        'colombia': 'co',
        'peru': 'pe',
        'mexico': 'mx',
        'south africa': 'za',
        'egypt': 'eg',
        'morocco': 'ma',
        'nigeria': 'ng',
        'kenya': 'ke',
        'ethiopia': 'et'
      }
      return countryMap[countryName.toLowerCase()] || ''
    }

    // Build the search URL with proper geographic constraints
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${apiKey}`
    
    // Important: Remove default Google Places API result limits to get more comprehensive results
    // The default is typically 20 results, but we want more for large area searches
    console.log('Note: Using Google Places API without explicit result limits for comprehensive search')
    
    // Apply country restriction - CRITICAL for geographic filtering
    if (country) {
      const countryCode = getCountryCode(country)
      if (countryCode) {
        // Use componentRestrictions to enforce country boundary
        searchUrl += `&components=country:${countryCode}`
        console.log(`Applied country restriction: ${country} (${countryCode})`)
      }
    }
    
    // Enhanced query construction based on search type
    let searchQuery = query
    
    if (searchType === 'business') {
      // For business searches, use the exact query (already quoted in the client)
      // and add location context
      if (city && country) {
        searchQuery = `${query} ${city}, ${country}`
      } else if (country) {
        searchQuery = `${query} ${country}`
      }
    } else {
      // For service searches, include city and country context
      if (city && country) {
        searchQuery = `${query} in ${city}, ${country}`
      } else if (country) {
        searchQuery = `${query} in ${country}`
      }
    }
    
    searchUrl += `&query=${encodeURIComponent(searchQuery)}`
    
    // Apply location bias if coordinates provided (use moderate radius for faster results)
    if (location && location.lat && location.lng) {
      const searchRadius = Math.min(radius * 2, 10000); // Max 10km for faster results
      searchUrl += `&location=${location.lat},${location.lng}&radius=${searchRadius}`
      console.log(`Applied location bias: ${location.lat},${location.lng} with radius ${searchRadius}m`)
    }
    
    // Apply type filter if specified
    if (type) {
      searchUrl += `&type=${type}`
    }

    console.log('Final search URL (without API key):', searchUrl.replace(apiKey, '[API_KEY]'))

    const response = await fetch(searchUrl)
    const data = await response.json()

    console.log(`Google Places API response status: ${data.status}`)
    console.log(`Found ${data.results?.length || 0} initial results from API`)
    
    // Use first page results only for faster response (20 results max)
    let allResults = data.results || [];
    console.log(`Using first page results only: ${allResults.length} places for faster response`)

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    // Geographic validation function
    const isWithinCountryBounds = (place: any, expectedCountry: string): boolean => {
      if (!expectedCountry || !place.formatted_address) return true
      
      const addressLower = place.formatted_address.toLowerCase()
      const countryLower = expectedCountry.toLowerCase()
      
      // Check if the formatted address contains the expected country
      const countryVariations = {
        'thailand': ['thailand', 'thai'],
        'philippines': ['philippines', 'philippine', 'ph'],
        'singapore': ['singapore', 'sg'],
        'malaysia': ['malaysia'],
        'indonesia': ['indonesia'],
        'vietnam': ['vietnam', 'viet nam'],
        'cambodia': ['cambodia'],
        'laos': ['laos'],
        'myanmar': ['myanmar', 'burma'],
        'brunei': ['brunei'],
        'united states': ['united states', 'usa', 'us'],
        'canada': ['canada'],
        'united kingdom': ['united kingdom', 'uk', 'britain'],
        'australia': ['australia'],
        'new zealand': ['new zealand'],
        'japan': ['japan'],
        'south korea': ['south korea', 'korea'],
        'china': ['china', 'prc'],
        'taiwan': ['taiwan'],
        'hong kong': ['hong kong'],
        'india': ['india']
      }
      
      const variations = (countryVariations as Record<string, string[]>)[countryLower] || [countryLower]
      return variations.some((variation: string) => addressLower.includes(variation))
    }

    // Distance calculation function (Haversine formula)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371 // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }

    // Helper function to calculate relevance score
    const calculateRelevanceScore = (place: any, searchedBusinessName?: string): number => {
      let score = 50; // Base score
      
      if (searchedBusinessName) {
        const placeName = place.name.toLowerCase();
        const searchName = searchedBusinessName.toLowerCase();
        
        // Exact match gets highest score
        if (placeName === searchName) {
          score = 100;
        }
        // Contains full search term
        else if (placeName.includes(searchName)) {
          score = 85;
        }
        // Word matches
        else {
          const placeWords = placeName.split(' ');
          const searchWords = searchName.split(' ');
          let wordMatches = 0;
          
          searchWords.forEach(searchWord => {
            if (placeWords.some((placeWord: string) => placeWord.includes(searchWord))) {
              wordMatches++;
            }
          });
          
          if (wordMatches > 0) {
            score = 70 + (wordMatches / searchWords.length) * 15;
          }
        }
      }
      
      // Boost score based on rating and review count
      if (place.rating) {
        score += (place.rating - 3) * 5; // Rating boost
      }
      
      if (place.user_ratings_total && place.user_ratings_total > 50) {
        score += 5; // Popular places get small boost
      }
      
      return Math.min(Math.max(score, 0), 100);
    };

    // Enhanced function to check pet-friendly verification from place details
    const checkPetFriendlyVerification = async (placeId: string): Promise<any> => {
      try {
        // Request ALL available place details fields including GMB attributes
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=editorial_summary,user_ratings_total,rating,types,opening_hours,formatted_phone_number,website,business_status,primary_type_display_name,allows_dogs,good_for_pets,outdoor_seating,serves_outdoor_seating,reviews,wheelchair_accessible_entrance&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.status === 'OK' && detailsData.result) {
          const place = detailsData.result;
          
          // Check official GMB attributes (highest priority evidence)
          const gmb_allows_dogs = place.allows_dogs === true;
          const gmb_good_for_pets = place.good_for_pets === true;
          const has_outdoor_seating = place.outdoor_seating === true || place.serves_outdoor_seating === true;
          
          // EXPANDED pet-friendly keyword detection for broader coverage
          const editorialSummary = place.editorial_summary?.overview?.toLowerCase() || '';
          const petKeywords = [
            'dog friendly', 'pet friendly', 'dogs allowed', 'pets allowed',
            'dog-friendly', 'pet-friendly', 'welcomes dogs', 'welcomes pets',
            'dog welcome', 'pet welcome', 'dogs welcome', 'pets welcome',
            'bring your dog', 'bring your pet', 'outdoor pets', 'patio pets',
            'no pets', 'no dogs', 'pets not allowed', 'dogs not allowed',
            // EXPANDED: More animal and venue keywords
            'bark', 'bird', 'animal', 'creature', 'outdoor', 'patio', 'garden', 'terrace'
          ];
          
          const hasEditorialEvidence = petKeywords.some(keyword => editorialSummary.includes(keyword));
          
          // Check reviews for any pet mentions
          let hasReviewEvidence = false;
          if (place.reviews && place.reviews.length > 0) {
            hasReviewEvidence = place.reviews.some((review: any) => {
              const reviewText = review.text.toLowerCase();
              return petKeywords.some(keyword => reviewText.includes(keyword));
            });
          }
          
          // EXPANDED business types for broader pet-friendly coverage
          const petRelatedTypes = [
            'pet_store', 'veterinary_care', 'dog_park', 'park',
            // ADDED: Casual dining and entertainment venues often allow pets
            'cafe', 'bar', 'restaurant', 'food', 'meal_takeaway', 'bakery'
          ];
          const hasPetRelatedType = place.types?.some((type: string) => petRelatedTypes.includes(type)) || false;
          
          // Return enhanced evidence object
          // ENHANCED: Check business name for animal/pet keywords
          const businessName = place.name?.toLowerCase() || '';
          const nameIndicators = ['bark', 'bird', 'dog', 'pet', 'paw', 'animal', 'creature'];
          const hasNameEvidence = nameIndicators.some(indicator => businessName.includes(indicator));

          return {
            isPetFriendly: gmb_allows_dogs || gmb_good_for_pets || hasEditorialEvidence || hasReviewEvidence || hasPetRelatedType || hasNameEvidence || has_outdoor_seating,
            evidence: {
              gmb_allows_dogs,
              gmb_good_for_pets,
              has_outdoor_seating,
              hasEditorialEvidence,
              hasReviewEvidence,
              hasPetRelatedType,
              hasNameEvidence,
              editorialSummary: hasEditorialEvidence ? editorialSummary : null,
              reviewCount: place.reviews?.length || 0
            },
            detailedPlace: place // Include full place details
          };
        }
        
        return { isPetFriendly: false, evidence: {}, detailedPlace: null };
      } catch (error) {
        console.log(`Failed to fetch details for place ${placeId}:`, error);
        return { isPetFriendly: false, evidence: {}, detailedPlace: null };
      }
    };

    // Transform results with minimal filtering - client will handle radius filtering
    let places = allResults?.map((place: any) => {
      const relevanceScore = calculateRelevanceScore(place, prioritizeBusinessName);
      const isSearchedBusiness = prioritizeBusinessName && 
        place.name.toLowerCase().includes(prioritizeBusinessName.toLowerCase()) &&
        relevanceScore >= 70;

      // SIMPLIFIED: Very inclusive detection - most places could be pet-friendly
      const businessName = place.name?.toLowerCase() || '';
      const businessTypes = place.types || [];
      
      // Almost all venues are potentially pet-friendly unless explicitly restricted
      const isPetFriendlyCandidate = true; // Default to true for maximum inclusivity
      
      // Only exclude very specific non-pet-friendly places
      const restrictedTypes = ['hospital', 'pharmacy', 'bank', 'atm', 'government', 'church', 'school'];
      const isRestrictedVenue = businessTypes.some((type: string) => 
        restrictedTypes.some(restricted => type.includes(restricted))
      );
      
      const finalPetFriendly = isPetFriendlyCandidate && !isRestrictedVenue;

      return {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        },
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        photos: place.photos?.map((photo: any) => ({
          photo_reference: photo.photo_reference,
          height: photo.height,
          width: photo.width,
        })),
        types: place.types,
        primary_type_display_name: place.primary_type_display_name,
        price_level: place.price_level,
        opening_hours: place.opening_hours,
        website: place.website,
        formatted_phone_number: place.formatted_phone_number,
        isSearchedBusiness,
        searchRelevanceScore: relevanceScore,
        pet_friendly_verified: finalPetFriendly,
        pet_friendly_evidence: { finalPetFriendly, isRestrictedVenue },
      };
    }) || []

    console.log(`Returning ${places.length} places (minimal filtering applied to show actual results)`)
    
    // Sort by relevance: searched businesses first, then by score and distance
    places.sort((a: any, b: any) => {
      // Searched businesses always come first
      if (a.isSearchedBusiness && !b.isSearchedBusiness) return -1;
      if (!a.isSearchedBusiness && b.isSearchedBusiness) return 1;
      
      // Then sort by relevance score
      const scoreA = a.searchRelevanceScore || 0
      const scoreB = b.searchRelevanceScore || 0
      if (scoreA !== scoreB) return scoreB - scoreA
      
      // Finally by distance if location provided (but don't exclude results)
      if (location && location.lat && location.lng) {
        const distA = calculateDistance(location.lat, location.lng, a.geometry.location.lat, a.geometry.location.lng)
        const distB = calculateDistance(location.lat, location.lng, b.geometry.location.lat, b.geometry.location.lng)
        return distA - distB
      }
      
      return 0
    });

    return new Response(
      JSON.stringify({ 
        places, 
        status: data.status,
        total_results: places.length,
        api_results: allResults.length,
        filtering_approach: "comprehensive_results_with_client_filtering",
        search_location: location,
        search_country: country,
        search_city: city,
        note: "Backend returns comprehensive results, client handles precise radius filtering",
        has_pagination: data.next_page_token ? true : false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in google-places function:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})