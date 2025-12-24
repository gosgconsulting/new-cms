import { FC, useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { COUNTRIES } from '@/data/constants';
import { detectUserCountry } from '@/services/countryDetection';
import { cn } from '@/lib/utils';

interface CountryFilterProps {
  value: string;
  onChange: (country: string) => void;
  className?: string;
  placeholder?: string;
}

const CountryFilter: FC<CountryFilterProps> = ({ 
  value, 
  onChange, 
  className = '',
  placeholder = 'Select country'
}) => {
  const [open, setOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Auto-detect user's country on component mount
  useEffect(() => {
    const autoDetectCountry = async () => {
      if (!value || value === '') {
        setIsDetecting(true);
        try {
          const detectedCountry = await detectUserCountry();
          if (detectedCountry) {
            const foundCountry = COUNTRIES.find(country => 
              country.name.toLowerCase() === detectedCountry.toLowerCase()
            );
            if (foundCountry) {
              onChange(foundCountry.name);
              console.log('✅ Auto-selected country:', foundCountry.name);
            }
          }
        } catch (error) {
          console.warn('Country auto-detection failed:', error);
        } finally {
          setIsDetecting(false);
        }
      }
    };

    autoDetectCountry();
  }, [onChange, value]);

  const selectedCountry = COUNTRIES.find(country => country.name === value);
  const displayText = isDetecting ? 'Detecting...' : (selectedCountry?.name || placeholder);

  return (
    <div className={cn('relative', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full h-11 px-3 py-2 justify-between",
              "glass border border-input bg-background/50 backdrop-blur-sm",
              "hover:neon-glow transition-all duration-300",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-primary flex-shrink-0" />
              {isDetecting && (
                <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
              )}
              <span className={cn(
                "truncate",
                (!selectedCountry || isDetecting) && "text-muted-foreground"
              )}>
                {displayText}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className={cn(
            "w-[200px] p-0",
            "bg-background/95 backdrop-blur-md border border-primary/20",
            "shadow-lg rounded-lg",
            "glass"
          )}
          align="start"
        >
          <Command className="max-h-[300px]">
            <CommandInput 
              placeholder="Search countries..." 
              className="h-9"
            />
            <CommandEmpty>No countries found.</CommandEmpty>
            <CommandList className="max-h-[240px] overflow-y-auto">
              <CommandGroup>
                {COUNTRIES.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.name}
                    onSelect={() => {
                      onChange(country.name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer",
                      "hover:bg-primary/10 hover:text-primary",
                      "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                    )}
                  >
                    <Check 
                      className={cn(
                        "h-4 w-4", 
                        selectedCountry?.name === country.name ? "opacity-100" : "opacity-0"
                      )} 
                    />
                    <span className="truncate">{country.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CountryFilter;