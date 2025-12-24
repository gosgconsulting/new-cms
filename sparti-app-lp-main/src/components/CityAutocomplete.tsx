import { FC, useState, useEffect, useRef } from 'react';
import { ChevronDown, Loader2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCityAutocomplete } from '@/hooks/useCityAutocomplete';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  country?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CityAutocomplete: FC<CityAutocompleteProps> = ({
  value,
  onChange,
  country,
  placeholder = "City",
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { predictions, isLoading, searchCities, clearPredictions } = useCityAutocomplete();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      searchCities(newValue, country);
      setIsOpen(true);
    } else {
      clearPredictions();
      setIsOpen(false);
    }
  };

  const handleSelectCity = (cityName: string) => {
    setInputValue(cityName);
    onChange(cityName);
    setIsOpen(false);
    clearPredictions();
  };

  const handleInputFocus = () => {
    if (inputValue.length >= 2) {
      searchCities(inputValue, country);
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    if (inputValue.length >= 2) {
      searchCities(inputValue, country);
      setIsOpen(true);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          placeholder={disabled ? "Select country first" : placeholder}
          disabled={disabled}
          className="pr-10 bg-background/50 border-primary/20 text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:ring-primary/20"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )} />
          )}
        </div>
      </div>

      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction) => (
            <Button
              key={prediction.place_id}
              variant="ghost"
              className="w-full justify-start px-4 py-3 h-auto rounded-none hover:bg-primary/10 text-left"
              onClick={() => handleSelectCity(prediction.city_name)}
            >
              <div className="flex items-start gap-3 w-full">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {prediction.city_name}
                  </div>
                  {prediction.country_info && (
                    <div className="text-sm text-muted-foreground truncate">
                      {prediction.country_info}
                    </div>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && predictions.length === 0 && inputValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-background border border-primary/20 rounded-lg shadow-lg p-4"
        >
          <div className="text-center text-muted-foreground">
            No cities found matching "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;