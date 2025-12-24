import { FC, memo } from 'react';
import { Star, MapPin, Clock, Phone, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import BaseTouchButton from '@/components/base/BaseTouchButton';
import { formatDistance, getServiceIcon, formatOperatingStatus } from '@/utils/distance';
import { getPlaceType } from '@/utils/placeTypes';

interface PlaceCardContentProps {
  place: {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
    types: string[];
    primary_type_display_name?: string;
    opening_hours?: {
      open_now: boolean;
      weekday_text?: string[];
    };
    formatted_phone_number?: string;
    international_phone_number?: string;
    isSearchedBusiness?: boolean;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  distance: number | null;
  petFriendlyResult: any;
  onShowEvidence: () => void;
  onNameClick: () => void;
}

const PlaceCardContent: FC<PlaceCardContentProps> = memo(({ 
  place, 
  distance, 
  petFriendlyResult,
  onShowEvidence, 
  onNameClick 
}) => {
  const serviceIcon = getServiceIcon(place.types);
  const operatingStatus = formatOperatingStatus(place.opening_hours);
  const placeType = getPlaceType(place.types, place.primary_type_display_name);
  const phoneNumber = place.formatted_phone_number || place.international_phone_number;

  return (
    <div className="p-5 relative z-10 space-y-3">
      {/* Place Type and Evidence Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="place-type" className="gap-1.5 standardized-badge">
            <span>{placeType.icon}</span>
            {placeType.label}
          </Badge>
          
          {/* Pet-Friendly Evidence Button */}
          {petFriendlyResult.isPetFriendly && (
            <BaseTouchButton
              variant="ghost"
              size="sm"
              onClick={onShowEvidence}
              className="gap-1.5 h-7 px-3 py-1.5 text-sm bg-gradient-to-r from-accent/20 to-primary/20 text-accent border border-accent/40 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] backdrop-blur-md font-medium rounded-lg hover:bg-accent/30 transition-all duration-200"
            >
              <Info className="h-3 w-3" />
              Why it's pet friendly
            </BaseTouchButton>
          )}
        </div>
        
        {/* Distance Display - Positioned near pet friendly label */}
        {distance && (
          <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            <span className="text-primary text-xs">📍</span>
            <span className="text-xs font-semibold text-primary">{formatDistance(distance)}</span>
          </div>
        )}
      </div>

      {/* Business Name */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{serviceIcon}</span>
          <h3 
            className={`
              font-orbitron font-semibold text-xl leading-[1.4] transition-colors duration-300 cursor-pointer
              ${place.isSearchedBusiness 
                ? 'text-accent hover:text-accent/80 group-hover:drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]' 
                : 'text-foreground hover:text-primary group-hover:drop-shadow-[0_0_10px_rgba(0,212,255,0.3)]'
              }
            `}
            onClick={onNameClick}
            style={{ fontFamily: 'var(--font-orbitron)' }}
          >
            {place.name}
          </h3>
        </div>
      </div>
      
      {/* Address Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 leading-[1.4]">
          <MapPin className="h-4 w-4 text-primary/70 flex-shrink-0" />
          <span className="line-clamp-1 font-medium">{place.formatted_address}</span>
        </div>

        {/* Operating Hours */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary/70 flex-shrink-0" />
          <Badge 
            variant={
              operatingStatus.color === 'success' 
                ? 'status-open' 
                : operatingStatus.color === 'destructive'
                ? 'status-closed'
                : 'status-unknown'
            }
            className="standardized-badge"
          >
            {operatingStatus.text}
          </Badge>
        </div>

        {/* Phone Number */}
        {phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary/70 flex-shrink-0" />
            <a 
              href={`tel:${phoneNumber}`}
              className="text-muted-foreground/80 hover:text-primary transition-colors font-medium leading-[1.4]"
            >
              {phoneNumber}
            </a>
          </div>
        )}
      </div>

      {/* Rating Section */}
      {place.rating && (
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold text-primary">{place.rating.toFixed(1)}</span>
          </div>
          {place.user_ratings_total && (
            <span className="text-sm text-muted-foreground/70">
              ({place.user_ratings_total} reviews)
            </span>
          )}
        </div>
      )}
    </div>
  );
});

PlaceCardContent.displayName = 'PlaceCardContent';

export default PlaceCardContent;