/**
 * Google Reviews Service for STR Fitness Club
 * Fetches reviews from Google Places API
 */

import { GoogleAPIClient, type GoogleReview, type GooglePlace } from '@/integrations';

// STR Fitness Club Place ID
const STR_PLACE_ID = 'ChIJv7t_CmsZ2jERP-SsgPB3gds';

// STR-specific Google API key
const STR_GOOGLE_API_KEY = 'AIzaSyD2PvAx6DweJf7N5vBIIG465voDwzB4TBo';

// Create STR-specific Google API client instance
const strGoogleClient = new GoogleAPIClient(STR_GOOGLE_API_KEY);

export interface STRTestimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
  time: number;
  relativeTime: string;
  profilePhotoUrl?: string;
  authorUrl?: string;
}

export interface STRPlaceInfo {
  rating: number;
  totalReviews: number;
  name: string;
  address: string;
}

export interface STRReviewsData {
  place: STRPlaceInfo;
  reviews: STRTestimonial[];
}

/**
 * Format date from timestamp
 */
function formatReviewDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Fetch latest reviews from Google Places API for STR Fitness Club
 * @param limit Maximum number of reviews to return (default: 10)
 * @returns Reviews data with place info and reviews
 */
export async function fetchSTRReviews(limit: number = 10): Promise<STRReviewsData> {
  try {
    console.log('[testing] Fetching Google reviews for STR Fitness Club...');
    
    // Fetch place details including reviews
    const placeDetails = await strGoogleClient.getPlaceDetails(STR_PLACE_ID);
    
    const place: STRPlaceInfo = {
      rating: placeDetails.place.rating || 0,
      totalReviews: placeDetails.place.user_ratings_total || 0,
      name: placeDetails.place.name || 'STR Fitness Club',
      address: placeDetails.place.formatted_address || '38 N Canal Rd, #05-01, Singapore 059294',
    };

    if (!placeDetails.reviews || placeDetails.reviews.length === 0) {
      console.warn('[testing] No reviews found for STR Fitness Club');
      return {
        place,
        reviews: [],
      };
    }

    // Sort all reviews by time (newest first) and limit results
    const sortedReviews = placeDetails.reviews
      .sort((a: GoogleReview, b: GoogleReview) => b.time - a.time) // Sort by newest first
      .slice(0, limit); // Limit results

    console.log(`[testing] Found ${sortedReviews.length} reviews`);

    // Transform Google reviews to STR testimonial format
    const testimonials: STRTestimonial[] = sortedReviews.map((review: GoogleReview) => ({
      name: review.author_name,
      role: 'Client', // Default role since Google reviews don't provide this
      quote: review.text,
      rating: review.rating,
      time: review.time,
      relativeTime: review.relative_time_description,
      profilePhotoUrl: review.profile_photo_url,
      authorUrl: review.author_url,
    }));

    return {
      place,
      reviews: testimonials,
    };
  } catch (error) {
    console.error('[testing] Error fetching Google reviews:', error);
    // Return empty data on error to prevent breaking the UI
    return {
      place: {
        rating: 0,
        totalReviews: 0,
        name: 'STR Fitness Club',
        address: '38 N Canal Rd, #05-01, Singapore 059294',
      },
      reviews: [],
    };
  }
}

// Export helper functions
export { formatReviewDate, getInitials };

/**
 * Get cached or fetch fresh reviews
 * In a production environment, you might want to implement caching
 */
let cachedReviewsData: STRReviewsData | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getSTRReviews(useCache: boolean = true): Promise<STRReviewsData> {
  const now = Date.now();
  
  // Return cached reviews if available and not expired
  if (useCache && cachedReviewsData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('[testing] Returning cached reviews');
    return cachedReviewsData;
  }

  // Fetch fresh reviews
  const reviewsData = await fetchSTRReviews(10);
  
  // Update cache
  cachedReviewsData = reviewsData;
  cacheTimestamp = now;
  
  return reviewsData;
}
