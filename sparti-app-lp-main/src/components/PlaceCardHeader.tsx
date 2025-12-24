import { FC } from 'react';
import { Target, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import PlaceImage from './PlaceImage';

interface PlaceCardHeaderProps {
  place: {
    photos?: Array<{
      photo_reference: string;
      height: number;
      width: number;
    }>;
    name: string;
    types: string[];
    isSearchedBusiness?: boolean;
    communityVerified?: boolean;
    isNewlyAdded?: boolean;
  };
}

const PlaceCardHeader: FC<PlaceCardHeaderProps> = ({ place }) => {
  return (
    <div className="p-0 relative">
      <div className="relative h-56 overflow-hidden rounded-t-[20px] bg-muted/10">
        <PlaceImage 
          photos={place.photos} 
          businessName={place.name} 
          businessTypes={place.types} 
          className="w-full h-full" 
        />
      </div>
      
      {/* Special badges overlay */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
        {/* Searched Business Badge */}
        {place.isSearchedBusiness && (
          <Badge 
            variant="secondary" 
            className="
              bg-gradient-to-r from-accent/15 to-accent/25 
              border-2 border-accent/50 text-accent font-bold text-xs px-3 py-1.5
              shadow-[0_0_20px_rgba(57,255,20,0.3)]
              hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]
              transition-all duration-300
            "
          >
            <Target className="h-3.5 w-3.5 mr-1.5" />
            🌟 SEARCHED BUSINESS
          </Badge>
        )}
        
        {/* Community Verified Badge */}
        {place.communityVerified && (
          <Badge 
            variant="secondary" 
            className="
              bg-gradient-to-r from-teal-500/15 to-teal-500/25 
              border-2 border-teal-500/50 text-teal-600 font-bold text-xs px-3 py-1.5
              shadow-[0_0_15px_rgba(20,184,166,0.3)]
              hover:shadow-[0_0_25px_rgba(20,184,166,0.4)]
              transition-all duration-300
            "
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
            Community Verified
          </Badge>
        )}
        
        {/* Newly Added Badge */}
        {place.isNewlyAdded && (
          <Badge 
            variant="secondary" 
            className="
              bg-gradient-to-r from-orange-500/15 to-orange-500/25 
              border-2 border-orange-500/50 text-orange-600 font-bold text-xs px-3 py-1.5
              shadow-[0_0_15px_rgba(249,115,22,0.3)]
              animate-bounce
              transition-all duration-300
            "
          >
            ✨ Added by you
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PlaceCardHeader;