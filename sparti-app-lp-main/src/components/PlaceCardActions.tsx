import { FC, memo } from 'react';
import { CheckCircle, X, Map } from 'lucide-react';
import BaseTouchButton from '@/components/base/BaseTouchButton';

interface PlaceCardActionsProps {
  place: {
    place_id: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  feedbackSummary: {
    pet_friendly_count: number;
    not_pet_friendly_count: number;
    total_votes: number;
    pet_friendly_percentage: number;
  } | null;
  isSubmitting: boolean;
  onFeedback: (isPetFriendly: boolean) => void;
  onGetDirections: () => void;
  onViewDetails: () => void;
}

const PlaceCardActions: FC<PlaceCardActionsProps> = memo(({ 
  place,
  feedbackSummary,
  isSubmitting,
  onFeedback,
  onGetDirections,
  onViewDetails
}) => {
  return (
    <div className="space-y-4 mt-5">
      <div className="text-sm font-medium text-muted-foreground/80 leading-[1.4]">
        Rate this business:
      </div>
      
      {/* Business Rating Buttons */}
      <div className="flex gap-4">
        <BaseTouchButton
          variant="outline"
          size="sm"
          onClick={() => onFeedback(true)}
          isLoading={isSubmitting}
          className="
            flex-1 glass border-accent/30 text-accent
            backdrop-blur-md
          "
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Recommend ({feedbackSummary?.pet_friendly_count || 0})
        </BaseTouchButton>
        
        <BaseTouchButton
          variant="outline"
          size="sm"
          onClick={() => onFeedback(false)}
          isLoading={isSubmitting}
          className="
            flex-1 glass border-destructive/30 text-destructive
            backdrop-blur-md
          "
        >
          <X className="h-4 w-4 mr-2" />
          Not Recommended ({feedbackSummary?.not_pet_friendly_count || 0})
        </BaseTouchButton>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5 mt-5">
        <BaseTouchButton
          variant="neon"
          size="sm"
          onClick={onGetDirections}
          className="flex-1 font-semibold backdrop-blur-md"
        >
          <Map className="h-4 w-4 mr-2" />
          Google Maps
        </BaseTouchButton>
         
        <BaseTouchButton
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="
            flex-1 glass border-primary/30 text-primary font-semibold
            backdrop-blur-md
          "
        >
          <Map className="h-4 w-4 mr-2" />
          View Details
        </BaseTouchButton>
      </div>
    </div>
  );
});

PlaceCardActions.displayName = 'PlaceCardActions';

export default PlaceCardActions;