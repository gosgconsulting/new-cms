/**
 * Google API Integration
 * Provides Google Maps, Reviews, and Translator services
 */

export interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
}

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export class GoogleAPIClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_GOOGLE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[testing] Google API key not found. Set VITE_GOOGLE_API_KEY environment variable.');
    }
  }

  /**
   * Google Maps - Search for places
   */
  async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<GooglePlace[]> {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    const params = new URLSearchParams({
      query,
      key: this.apiKey,
      fields: 'place_id,name,formatted_address,rating,user_ratings_total,geometry,photos'
    });

    if (location) {
      params.append('location', `${location.lat},${location.lng}`);
    }
    if (radius) {
      params.append('radius', radius.toString());
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return data.results || [];
  }

  /**
   * Google Maps - Get place details including reviews
   */
  async getPlaceDetails(placeId: string): Promise<{
    place: GooglePlace;
    reviews: GoogleReview[];
  }> {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    const params = new URLSearchParams({
      place_id: placeId,
      key: this.apiKey,
      fields: 'place_id,name,formatted_address,rating,user_ratings_total,geometry,photos,reviews'
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Place Details API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Place Details API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    return {
      place: data.result,
      reviews: data.result.reviews || []
    };
  }

  /**
   * Google Maps - Get photo URL from photo reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    return `https://maps.googleapis.com/maps/api/place/photo?photoreference=${photoReference}&maxwidth=${maxWidth}&key=${this.apiKey}`;
  }

  /**
   * Google Translator - Translate text
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    const params = new URLSearchParams({
      q: text,
      target: targetLanguage,
      key: this.apiKey,
      format: 'text'
    });

    if (sourceLanguage) {
      params.append('source', sourceLanguage);
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?${params}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Google Translate API error: ${data.error.message}`);
    }

    const translation = data.data.translations[0];
    return {
      translatedText: translation.translatedText,
      detectedSourceLanguage: translation.detectedSourceLanguage
    };
  }

  /**
   * Google Translator - Get supported languages
   */
  async getSupportedLanguages(targetLanguage: string = 'en'): Promise<Array<{
    language: string;
    name: string;
  }>> {
    if (!this.apiKey) {
      throw new Error('Google API key is required');
    }

    const params = new URLSearchParams({
      key: this.apiKey,
      target: targetLanguage
    });

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2/languages?${params}`
    );

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Google Translate API error: ${data.error.message}`);
    }

    return data.data.languages || [];
  }

  /**
   * Load Google Maps JavaScript API
   */
  loadMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      
      document.head.appendChild(script);
    });
  }
}

// Export singleton instance
export const googleAPIClient = new GoogleAPIClient();
