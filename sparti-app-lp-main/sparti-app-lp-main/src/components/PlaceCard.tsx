import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { usePlaceFeedback, usePetFriendlyDetection } from '@/hooks/useStubs';
import { calculateDistance } from '@/utils/distance';
import { checkGoogleVerification } from '@/utils/placeTypes';
import PlaceCardHeader from './PlaceCardHeader';
import PlaceCardContent from './PlaceCardContent';
import PlaceCardActions from './PlaceCardActions';
import BusinessDetailModal from './BusinessDetailModal';
import { PetFriendlyEvidenceModal } from './PetFriendlyEvidenceModal';

interface PlaceCardProps {
  place: {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    types: string[];
    primary_type_display_name?: string;
    price_level?: number;
    opening_hours?: {
      open_now: boolean;
      weekday_text?: string[];
    };
    website?: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_phone_number?: string;
    international_phone_number?: string;
    isSearchedBusiness?: boolean; // Flag to indicate if this is the business being searched for
    searchRelevanceScore?: number; // Score for search relevance (0-100)
    communityVerified?: boolean; // Flag for community verification
    isNewlyAdded?: boolean; // Flag for newly added businesses
    // Additional Google My Business fields for verification
    editorial_summary?: {
      overview?: string;
    };
    reviews?: Array<{
      author_name: string;
      rating: number;
      text: string;
      time: number;
      relative_time_description: string;
    }>;
    accessibility?: {
      wheelchair_accessible_entrance?: boolean;
    };
  };
  userLocation?: { lat: number; lng: number } | null;
  onClick?: () => void;
  className?: string;
}

const PlaceCard: FC<PlaceCardProps> = ({ place, userLocation, onClick, className = '' }) => {
  const { submitFeedback, getFeedbackSummary, isSubmitting } = usePlaceFeedback();
  const { detectPetFriendly } = usePetFriendlyDetection();
  const [isBusinessDetailModalOpen, setIsBusinessDetailModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<{
    pet_friendly_count: number;
    not_pet_friendly_count: number;
    total_votes: number;
    pet_friendly_percentage: number;
  } | null>(null);

  // Memoize pet-friendly detection to prevent infinite re-renders
  const petFriendlyResult = useMemo(() => {
    return detectPetFriendly(place, feedbackSummary);
  }, [place, feedbackSummary, detectPetFriendly]);

  // Calculate distance if user location is available - memoized for performance
  const distance = useMemo(() => {
    if (!userLocation) return null;
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
  }, [userLocation, place.geometry.location]);

  const loadFeedbackSummary = useCallback(async () => {
    const summary = await getFeedbackSummary(place.place_id);
    setFeedbackSummary(summary);
  }, [getFeedbackSummary, place.place_id]);

  const handleFeedback = useCallback(async (isPetFriendly: boolean) => {
    const result = await submitFeedback({
      place_id: place.place_id,
      place_name: place.name,
      is_pet_friendly: isPetFriendly,
    });

    if (result.success) {
      await loadFeedbackSummary();
    }
  }, [submitFeedback, place.place_id, place.name, loadFeedbackSummary]);

  const handleGetDirections = useCallback(() => {
    const { lat, lng } = place.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.place_id}`;
    window.open(url, '_blank');
  }, [place.geometry.location, place.place_id]);

  useEffect(() => {
    loadFeedbackSummary();
  }, [loadFeedbackSummary]);

  // Check if place is verified based on Google My Business data containing pet keywords
  const isGoogleVerified = checkGoogleVerification(place);
  const isCommunityVerified = feedbackSummary && feedbackSummary.total_votes >= 3 && feedbackSummary.pet_friendly_percentage >= 70;

  const handleShowEvidence = useCallback(() => {
    setIsEvidenceModalOpen(true);
  }, []);

  const handleNameClick = useCallback(() => {
    setIsBusinessDetailModalOpen(true);
  }, []);

  const handleViewDetails = useCallback(() => {
    setIsBusinessDetailModalOpen(true);
  }, []);

  return (
    <Card className={`
      group glass hover:border-primary/60 
      transition-all duration-500 ease-out
      hover:scale-[1.02] hover:neon-glow
      rounded-[20px] overflow-hidden
      relative
      ${place.isSearchedBusiness 
        ? 'border-accent/60 bg-gradient-to-br from-accent/5 to-accent/10 shadow-[0_0_25px_rgba(57,255,20,0.15)]' 
        : 'border-primary/30'
      }
      ${className}
    `}>
      {/* Glassmorphism overlay */}
      <div className={`
        absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[20px]
        ${place.isSearchedBusiness 
          ? 'from-accent/10 to-accent/20' 
          : 'from-primary/5 to-accent/5'
        }
      `} />
      
      <PlaceCardHeader place={place} />
      
      <CardContent className="p-0">
        <PlaceCardContent 
          place={place}
          distance={distance}
          petFriendlyResult={petFriendlyResult}
          onShowEvidence={handleShowEvidence}
          onNameClick={handleNameClick}
        />
        
        <div className="px-5 pb-5">
          <PlaceCardActions
            place={place}
            feedbackSummary={feedbackSummary}
            isSubmitting={isSubmitting}
            onFeedback={handleFeedback}
            onGetDirections={handleGetDirections}
            onViewDetails={handleViewDetails}
          />
        </div>
      </CardContent>
      
      {/* Business Detail Modal */}
      <BusinessDetailModal 
        isOpen={isBusinessDetailModalOpen}
        onClose={() => setIsBusinessDetailModalOpen(false)}
        place={place}
        userLocation={userLocation}
      />

      {/* Pet-Friendly Evidence Modal */}
      <PetFriendlyEvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        placeName={place.name}
        evidence={petFriendlyResult.evidence}
        verificationDate={petFriendlyResult.verificationDate}
        primaryReason={petFriendlyResult.primaryReason}
      />
    </Card>
  );
};

export default PlaceCard;