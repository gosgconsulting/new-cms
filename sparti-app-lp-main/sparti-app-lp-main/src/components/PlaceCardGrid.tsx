import { FC } from 'react';
import PlaceCard from '@/components/PlaceCard';
import PlaceCardSkeleton from '@/components/PlaceCardSkeleton';

interface PlaceCardGridProps {
  places: any[];
  isLoading: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const PlaceCardGrid: FC<PlaceCardGridProps> = ({ places, isLoading, userLocation }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <PlaceCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="space-y-4">
          <div className="text-6xl">🏢</div>
          <h3 className="text-xl font-orbitron font-semibold text-muted-foreground">
            No business leads found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search filters or expanding your target area
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, index) => (
          <PlaceCard
            key={place.place_id}
            place={place}
            userLocation={userLocation}
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
};

export default PlaceCardGrid;