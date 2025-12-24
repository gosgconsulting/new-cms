import { FC, useState, useRef, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PlacesSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, placeData?: any) => void;
  onPlaceSelect?: (place: any) => void;
  placeholder?: string;
  className?: string;
  country?: string;
  city?: string;
  showBusinessNameOnly?: boolean; // Controls display format: business name vs full address
}

const LocationAutocomplete: FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter location...",
  className = '',
  country,
  city,
  showBusinessNameOnly = true, // Default to showing business name only
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Clear suggestions when country or city changes
  useEffect(() => {
    if (value) {
      // Reset suggestions and clear the input when location context changes
      setSuggestions([]);
      onChange(''); // Clear the location input when country/city changes
    }
  }, [country, city]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPlaces = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Build location bias based on country and city
      let locationBias = '';
      if (country && city) {
        locationBias = `${city}, ${country}`;
      } else if (country) {
        locationBias = country;
      }

      // Call our edge function for Google Places Autocomplete
      const { data, error } = await supabase.functions.invoke('google-places-autocomplete', {
        body: { 
          input: query,
          locationBias,
          country,
          city
        }
      });

      if (error) {
        console.error('Places autocomplete error:', error);
        setSuggestions([]);
      } else {
        // Use real Google Places API data
        setSuggestions(data.predictions || []);
        console.log('Got real Google Places suggestions:', data.predictions?.length || 0);
      }
    } catch (err) {
      console.error('Places autocomplete error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    setIsOpen(true);

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchPlaces(inputValue);
    }, 200);
  };

  const handleSuggestionSelect = (suggestion: PlacesSuggestion) => {
    // Choose what to display based on showBusinessNameOnly prop
    const displayValue = showBusinessNameOnly 
      ? suggestion.structured_formatting.main_text 
      : suggestion.description;
    
    onChange(displayValue, suggestion);
    onPlaceSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (value.length >= 1) {
      searchPlaces(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 h-11 glass border border-input bg-background/50 backdrop-blur-sm hover:neon-glow transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto glass backdrop-blur-md">
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Searching locations...
              </div>
            </div>
          ) : (
            <div className="p-1">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="px-3 py-2 cursor-pointer rounded-md transition-colors duration-150 hover:bg-primary/10 hover:text-primary"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
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

export default LocationAutocomplete;