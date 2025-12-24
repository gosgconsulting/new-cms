import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SearchActivityInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const BUSINESS_SUGGESTIONS = [
  'restaurants with outdoor seating',
  'hotels with free wifi',
  'retail stores with online presence',
  'auto repair shops',
  'dental clinics',
  'hair salons and spas',
  'gyms and fitness centers',
  'coffee shops',
  'clothing stores',
  'home improvement contractors',
  'real estate agencies',
  'law firms',
  'medical practices',
  'accounting services',
  'marketing agencies',
  'IT services',
  'plumbing services',
  'electrical contractors',
  'roofing companies',
  'landscaping services'
];

const SearchActivityInput = ({ 
  value, 
  onChange, 
  className, 
  placeholder = "Search activity (e.g., restaurants, hotels, services)" 
}: SearchActivityInputProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value) {
      const filtered = BUSINESS_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(BUSINESS_SUGGESTIONS.slice(0, 8));
    }
  }, [value]);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={cn("w-full relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 h-11 glass border border-input bg-background hover:neon-glow transition-all duration-300"
              onFocus={() => setIsOpen(true)}
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2 bg-background/95 backdrop-blur-md border border-primary/20" align="start" side="bottom">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">Popular searches:</p>
            <div className="grid gap-1">
              {filteredSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="justify-start h-auto p-2 text-left"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchActivityInput;