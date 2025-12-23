/**
 * Google Maps Component
 * Provides interactive Google Maps with search functionality, place details, and reviews
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, MapPin, Star, Phone, Globe, Clock } from 'lucide-react';
import { googleAPIClient, type GooglePlace, type GoogleReview } from '@/integrations';

interface GoogleMapsProps {
  /** Default search query */
  defaultQuery?: string;
  /** Default center location */
  defaultCenter?: { lat: number; lng: number };
  /** Map height in pixels */
  height?: number;
  /** Enable place details and reviews */
  enableDetails?: boolean;
  /** Custom CSS classes */
  className?: string;
}

export const GoogleMaps: React.FC<GoogleMapsProps> = ({
  defaultQuery = '',
  defaultCenter = { lat: 37.7749, lng: -122.4194 }, // San Francisco
  height = 400,
  enableDetails = true,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlace | null>(null);
  const [placeDetails, setPlaceDetails] = useState<{
    place: GooglePlace;
    reviews: GoogleReview[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps script on component mount
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        await googleAPIClient.loadMapsScript();
        setMapLoaded(true);
        console.log('[testing] Google Maps script loaded successfully');
      } catch (error) {
        console.error('[testing] Failed to load Google Maps script:', error);
        setError('Failed to load Google Maps. Please check your API key.');
      }
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });
        console.log('[testing] Google Map initialized');
      } catch (error) {
        console.error('[testing] Failed to initialize map:', error);
        setError('Failed to initialize map');
      }
    }
  }, [mapLoaded, defaultCenter]);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  };

  // Add markers to map
  const addMarkersToMap = (places: GooglePlace[]) => {
    if (!mapInstanceRef.current) return;

    clearMarkers();
    
    const bounds = new window.google.maps.LatLngBounds();

    places.forEach((place, index) => {
      const marker = new window.google.maps.Marker({
        position: place.geometry.location,
        map: mapInstanceRef.current,
        title: place.name,
        animation: window.google.maps.Animation.DROP,
      });

      // Add click listener to marker
      marker.addListener('click', () => {
        setSelectedPlace(place);
        if (enableDetails) {
          loadPlaceDetails(place.place_id);
        }
      });

      markersRef.current.push(marker);
      bounds.extend(place.geometry.location);
    });

    // Fit map to show all markers
    if (places.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  // Search for places
  const searchPlaces = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedPlace(null);
    setPlaceDetails(null);

    try {
      console.log('[testing] Searching for places:', searchQuery);
      const results = await googleAPIClient.searchPlaces(
        searchQuery,
        defaultCenter,
        5000 // 5km radius
      );
      
      setPlaces(results);
      addMarkersToMap(results);
      console.log('[testing] Found places:', results.length);
    } catch (error) {
      console.error('[testing] Place search failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to search places');
    } finally {
      setLoading(false);
    }
  };

  // Load place details and reviews
  const loadPlaceDetails = async (placeId: string) => {
    if (!enableDetails) return;

    setDetailsLoading(true);
    try {
      console.log('[testing] Loading place details:', placeId);
      const details = await googleAPIClient.getPlaceDetails(placeId);
      setPlaceDetails(details);
      console.log('[testing] Place details loaded:', details);
    } catch (error) {
      console.error('[testing] Failed to load place details:', error);
      setError('Failed to load place details');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchPlaces();
    }
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Google Maps Search
          </CardTitle>
          <CardDescription>
            Search for places, restaurants, businesses, and more
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for places, restaurants, businesses..."
                className="pl-10"
                disabled={loading || !mapLoaded}
              />
            </div>
            <Button 
              onClick={searchPlaces}
              disabled={loading || !mapLoaded || !searchQuery.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Map Section */}
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={mapRef}
              style={{ height: `${height}px` }}
              className="w-full rounded-md border bg-muted flex items-center justify-center"
            >
              {!mapLoaded && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading Google Maps...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            {places.length > 0 && (
              <CardDescription>
                Found {places.length} places
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {places.length === 0 && !loading && (
                <p className="text-muted-foreground text-center py-8">
                  No places found. Try searching for something!
                </p>
              )}
              
              {places.map((place, index) => (
                <div
                  key={place.place_id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedPlace?.place_id === place.place_id ? 'bg-muted border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedPlace(place);
                    if (enableDetails) {
                      loadPlaceDetails(place.place_id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{place.name}</h4>
                      <p className="text-sm text-muted-foreground">{place.formatted_address}</p>
                      {place.rating && (
                        <div className="flex items-center gap-2 mt-1">
                          {renderStarRating(place.rating)}
                          <span className="text-sm text-muted-foreground">
                            {place.rating} ({place.user_ratings_total} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Place Details Section */}
      {enableDetails && selectedPlace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Place Details
              {detailsLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Detailed information about {selectedPlace.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {placeDetails ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-lg">{placeDetails.place.name}</h3>
                  <p className="text-muted-foreground">{placeDetails.place.formatted_address}</p>
                  {placeDetails.place.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      {renderStarRating(placeDetails.place.rating)}
                      <span className="font-medium">{placeDetails.place.rating}</span>
                      <span className="text-muted-foreground">
                        ({placeDetails.place.user_ratings_total} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {/* Photos */}
                {placeDetails.place.photos && placeDetails.place.photos.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {placeDetails.place.photos.slice(0, 6).map((photo, index) => (
                        <img
                          key={index}
                          src={googleAPIClient.getPhotoUrl(photo.photo_reference, 200)}
                          alt={`${placeDetails.place.name} photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {placeDetails.reviews && placeDetails.reviews.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Reviews</h4>
                    <div className="space-y-3">
                      {placeDetails.reviews.slice(0, 3).map((review, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={review.profile_photo_url}
                              alt={review.author_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm">{review.author_name}</p>
                              <div className="flex items-center gap-1">
                                {renderStarRating(review.rating)}
                                <span className="text-xs text-muted-foreground ml-1">
                                  {review.relative_time_description}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : detailsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading place details...
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Click on a place to view details
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};