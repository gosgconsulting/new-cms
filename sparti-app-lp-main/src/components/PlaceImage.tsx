import { FC, useState, useEffect } from 'react';
import { getServiceIcon } from '@/utils/distance';
import { supabase } from '@/integrations/supabase/client';

interface PlaceImageProps {
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  businessName: string;
  businessTypes: string[];
  className?: string;
}

const PlaceImage: FC<PlaceImageProps> = ({ photos, businessName, businessTypes, className = '' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true); // Start as loading
  const serviceIcon = getServiceIcon(businessTypes);

  // Fetch Google Place photo on mount
  useEffect(() => {
    const fetchGooglePhoto = async () => {
      if (photos && photos.length > 0) {
        setPhotoLoading(true);
        try {
          // Use the Supabase edge function to get Google Places photo
          const photoReference = photos[0].photo_reference;
          const supabaseUrl = 'https://scflovuyudfcosdlhsbv.supabase.co';
          const photoUrl = `${supabaseUrl}/functions/v1/google-place-photo?photo_reference=${photoReference}&maxwidth=800`;
          
          console.log('Fetching Google photo from:', photoUrl);
          
          const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZmxvdnV5dWRmY29zZGxoc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTYxNDIsImV4cCI6MjA2ODk5MjE0Mn0.nCv5kdSQyQUnQV2_qMKriNO3zHEmVuokm98rEtu1yfY';
          
          const response = await fetch(photoUrl, {
            headers: {
              'Authorization': `Bearer ${anonKey}`,
              'apikey': anonKey
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setGooglePhotoUrl(imageUrl);
            console.log('Google photo loaded successfully');
          } else {
            console.error('Failed to fetch Google photo:', response.status, response.statusText);
            setImageError(true);
          }
        } catch (err) {
          console.error('Failed to fetch Google photo:', err);
          setImageError(true);
        } finally {
          setPhotoLoading(false);
        }
      } else {
        // No photos available, stop loading immediately
        setPhotoLoading(false);
      }
    };

    fetchGooglePhoto();
  }, [photos]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (googlePhotoUrl) {
        URL.revokeObjectURL(googlePhotoUrl);
      }
    };
  }, [googlePhotoUrl]);

  const getFallbackImageUrl = () => {
    // Get category-appropriate fallback images based on place type
    const placeTypes = businessTypes || [];
    
    if (placeTypes.includes('restaurant') || placeTypes.includes('meal_takeaway') || placeTypes.includes('food')) {
      return 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=225&fit=crop&auto=format'; // Food on plate
    } else if (placeTypes.includes('cafe') || placeTypes.includes('bakery')) {
      return 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=225&fit=crop&auto=format'; // Cozy interior
    } else if (placeTypes.includes('park') || placeTypes.includes('playground')) {
      return 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=225&fit=crop&auto=format'; // Outdoor lighting
    } else if (placeTypes.includes('store') || placeTypes.includes('shopping_mall')) {
      return 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=400&h=225&fit=crop&auto=format'; // Modern building
    } else if (placeTypes.includes('lodging') || placeTypes.includes('hotel')) {
      return 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=400&h=225&fit=crop&auto=format'; // Interior space
    } else if (placeTypes.includes('tourist_attraction') || placeTypes.includes('museum')) {
      return 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400&h=225&fit=crop&auto=format'; // Building architecture
    } else {
      return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=225&fit=crop&auto=format'; // Generic scenic view
    }
  };

  const getPlaceholderGradient = () => {
    const gradients = [
      'from-primary/20 via-accent/20 to-neon-purple/20',
      'from-accent/20 via-primary/20 to-electric-glow/20',
      'from-neon-purple/20 via-accent/20 to-primary/20',
      'from-electric-glow/20 via-neon-purple/20 to-accent/20',
    ];
    
    // Use business name to consistently select gradient
    const hash = businessName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const fallbackUrl = getFallbackImageUrl();

  // Don't show any image until we determine what to display
  if (photoLoading) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    );
  }

  // Try Google Photos first, then category-appropriate fallback
  const imageUrl = googlePhotoUrl && !imageError ? googlePhotoUrl : (!fallbackError ? fallbackUrl : null);

  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden group/image ${className}`}>
        {/* Loading shimmer - only show if image hasn't loaded yet */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        )}
        
        {/* Actual image */}
        <img
          src={imageUrl}
          alt={`${businessName} - Business photo`}
          className={`
            w-full h-full object-cover transition-all duration-700 ease-out
            group-hover/image:scale-110
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            if (imageUrl === googlePhotoUrl) {
              setImageError(true);
            } else {
              setFallbackError(true);
            }
          }}
        />
        
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
      </div>
    );
  }

  // Modern placeholder
  return (
    <div className={`relative overflow-hidden group/image ${className}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderGradient()}`}>
        {/* Animated overlay patterns */}
        <div className="absolute inset-0 opacity-30">
          {/* Circuit-like patterns */}
          <div className="absolute top-4 left-4 w-8 h-1 bg-primary/40 rounded-full" />
          <div className="absolute top-6 left-6 w-1 h-6 bg-primary/40 rounded-full" />
          <div className="absolute bottom-4 right-4 w-6 h-1 bg-accent/40 rounded-full" />
          <div className="absolute bottom-8 right-8 w-1 h-4 bg-accent/40 rounded-full" />
          
          {/* Floating dots */}
          <div className="absolute top-8 right-12 w-2 h-2 bg-primary/50 rounded-full animate-pulse" />
          <div className="absolute bottom-12 left-8 w-1.5 h-1.5 bg-accent/50 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-neon-purple/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Scanning line effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-full h-full w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent skew-x-12 animate-pulse group-hover/image:animate-none group-hover/image:translate-x-[200%] transition-transform duration-2000" />
        </div>
      </div>
      
      {/* Central icon with glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20 blur-lg text-primary scale-150 group-hover/image:scale-200 transition-transform duration-500">
              {serviceIcon}
            </div>
          </div>
          
          {/* Main icon */}
          <div className="relative text-5xl opacity-80 group-hover/image:opacity-100 transition-all duration-300 group-hover/image:scale-110 filter drop-shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            {serviceIcon}
          </div>
        </div>
      </div>
      
      {/* Text overlay for modern feel */}
      <div className="absolute bottom-3 left-3 text-xs font-mono text-primary/60 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
        SCAN_COMPLETE
      </div>
      
      {/* Geometric corner accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent/40" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent/40" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
      
      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwJSIgeT0iMCUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgcmVzdWx0PSJub2lzZSIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0ibm9pc2UiIHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz4KICAgIDwvZmlsdGVyPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAyIi8+Cjwvc3ZnPgo=')] bg-repeat" />
    </div>
  );
};

export default PlaceImage;