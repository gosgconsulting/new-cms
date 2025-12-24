import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Loader2, Crosshair, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useLocationDetection } from '@/hooks/useLocationDetection';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PlacesSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationControlProps {
  currentLocation: string;
  onLocationChange: (location: string, placeData?: any) => void;
  country?: string;
  className?: string;
  autoFocus?: boolean;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
}

const LocationControl: FC<LocationControlProps> = ({
  currentLocation,
  onLocationChange,
  country,
  className = "",
  autoFocus = false,
  radius = 2,
  onRadiusChange
}) => {
  const [inputValue, setInputValue] = useState(currentLocation);
  const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const { detectLocation } = useLocationDetection();
  const radiusOptions = [1, 2, 5, 10, 25];
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(currentLocation);
  }, [currentLocation]);

  // Auto-focus when the component mounts and autoFocus is true
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150); // Small delay to ensure modal animation completes
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    console.log(`🔍 Searching "${query}" in country: ${country}`);
    
    try {
      // Use Google Places API directly (removed caching and Nominatim complexity)
      const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
        body: { 
          input: query.trim(),
          country: country,
          sessiontoken: Math.random().toString(36).substr(2, 9)
        }
      });

      if (error) {
        console.error('Google Places autocomplete error:', error);
        setSuggestions([]);
      } else {
        setSuggestions(data.predictions || []);
        console.log(`✅ Found ${data.predictions?.length || 0} suggestions`);
      }
    } catch (err) {
      console.error('Autocomplete search failed:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 200);
  };

  const handleSuggestionSelect = (suggestion: PlacesSuggestion) => {
    console.log('🏢 Business selected from dropdown:', suggestion);
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    
    // Format the place data to match expected structure
    const formattedPlaceData = {
      place_id: suggestion.place_id,
      description: suggestion.description,
      structured_formatting: suggestion.structured_formatting,
      // Add geometry if available from places details
      geometry: {
        location: {
          // We'll get the actual coordinates through geocoding in SearchResults
          lat: null,
          lng: null
        }
      }
    };
    
    console.log('🔄 Calling onLocationChange with:', suggestion.description, formattedPlaceData);
    onLocationChange(suggestion.description, formattedPlaceData);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 2) {
      setShowSuggestions(true);
      searchPlaces(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleLocateMe = async () => {
    setIsDetecting(true);
    try {
      console.log('🎯 Starting FREE location detection...');
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return;
      }

      // Get coordinates using free browser API
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      console.log('📍 Free coordinates detected:', { latitude, longitude });

      // Use simple coordinate display instead of expensive reverse geocoding
      const coordinateLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setInputValue(coordinateLocation);
      setShowSuggestions(false);
      
      const formattedPlaceData = {
        place_id: `current_location_${Date.now()}`,
        description: coordinateLocation,
        structured_formatting: {
          main_text: 'Current Location',
          secondary_text: `Coordinates: ${coordinateLocation}`
        },
        geometry: {
          location: {
            lat: latitude,
            lng: longitude
          }
        }
      };
      
      console.log('📍 Using free coordinate-based location:', coordinateLocation, formattedPlaceData);
      onLocationChange(coordinateLocation, formattedPlaceData);
      toast.success('Current location detected (coordinates)');
      
    } catch (error) {
      console.error('❌ Free location detection failed:', error);
      let errorMessage = 'Failed to detect location';
      
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location permissions.';
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please try again.';
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className={cn('relative flex items-center gap-2', className)}>
      {/* Address Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Enter address"
          className={cn(
            "pl-10 pr-12 h-12 text-sm",
            "bg-background/60 backdrop-blur-sm border border-primary/20",
            "hover:border-primary/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]",
            "focus:border-primary/60 focus:shadow-[0_0_20px_rgba(139,92,246,0.4)]",
            "transition-all duration-300"
          )}
        />
        
        {/* Locate Me Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLocateMe}
          disabled={isDetecting}
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10",
            "hover:bg-primary/20 hover:text-primary transition-all duration-200",
            "border border-primary/20 bg-background/50"
          )}
          title="Use my current location"
        >
          {isDetecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Radius Dropdown */}
      {onRadiusChange && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-3 bg-background/60 backdrop-blur-sm border border-primary/20 hover:border-primary/40 flex items-center gap-2"
            >
              <span className="text-sm font-medium">{radius}km</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-24 p-2 bg-background/95 backdrop-blur-md border border-primary/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)] shadow-primary/10 z-[100]">
            <div className="space-y-1">
              {radiusOptions.map((option) => (
                <Button
                  key={option}
                  variant={radius === option ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-center text-sm"
                  onClick={() => onRadiusChange(option)}
                >
                  {option}km
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* High Priority Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-primary/20 rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.3)] shadow-primary/10 max-h-60 overflow-y-auto z-[100]"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Searching locations...
              </div>
            </div>
          ) : (
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="px-3 py-3 cursor-pointer rounded-md transition-all duration-200 hover:bg-primary/10 hover:text-primary border-b border-primary/5 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationControl;