import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface EnhancedActivitySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const GOOGLE_PLACES_CATEGORIES = [
  'Accounting',
  'Airport',
  'Amusement park',
  'Aquarium',
  'Art gallery',
  'ATM',
  'Auto repair',
  'Bakery',
  'Bank',
  'Bar',
  'Beauty salon',
  'Bicycle store',
  'Book store',
  'Bowling alley',
  'Bus station',
  'Cafe',
  'Campground',
  'Car dealer',
  'Car rental',
  'Car wash',
  'Casino',
  'Cemetery',
  'Church',
  'City hall',
  'Clothing store',
  'Convenience store',
  'Courthouse',
  'Dentist',
  'Department store',
  'Doctor',
  'Drugstore',
  'Electrician',
  'Electronics store',
  'Embassy',
  'Fire station',
  'Florist',
  'Funeral home',
  'Furniture store',
  'Gas station',
  'Gym',
  'Hair care',
  'Hardware store',
  'Hindu temple',
  'Home goods store',
  'Hospital',
  'Insurance agency',
  'Jewelry store',
  'Laundry',
  'Lawyer',
  'Library',
  'Light rail station',
  'Liquor store',
  'Local government office',
  'Locksmith',
  'Lodging',
  'Meal delivery',
  'Meal takeaway',
  'Mosque',
  'Movie rental',
  'Movie theater',
  'Moving company',
  'Museum',
  'Night club',
  'Painter',
  'Park',
  'Parking',
  'Pet store',
  'Pharmacy',
  'Physiotherapist',
  'Plumber',
  'Police',
  'Post office',
  'Primary school',
  'Real estate agency',
  'Restaurant',
  'Roofing contractor',
  'RV park',
  'School',
  'Secondary school',
  'Shoe store',
  'Shopping mall',
  'Spa',
  'Stadium',
  'Storage',
  'Store',
  'Subway station',
  'Supermarket',
  'Synagogue',
  'Taxi stand',
  'Tourist attraction',
  'Train station',
  'Transit station',
  'Travel agency',
  'Truck stop',
  'University',
  'Veterinary care',
  'Zoo'
];

const EnhancedActivitySelector = ({ value, onChange, className }: EnhancedActivitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customInput, setCustomInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter categories based on search term
  const filteredCategories = GOOGLE_PLACES_CATEGORIES.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current search term could be added as custom
  const canAddCustom = searchTerm.trim() && 
    !GOOGLE_PLACES_CATEGORIES.some(cat => cat.toLowerCase() === searchTerm.toLowerCase()) &&
    !value.some(val => val.toLowerCase() === searchTerm.toLowerCase());

  const handleToggleCategory = (category: string) => {
    const newValue = value.includes(category)
      ? value.filter(v => v !== category)
      : [...value, category];
    onChange(newValue);
  };

  const handleAddCustom = () => {
    if (canAddCustom) {
      const newValue = [...value, searchTerm.trim()];
      onChange(newValue);
      setSearchTerm('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(v => v !== tagToRemove));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayText = value.length === 0 ? 'Activity' : 
    value.length === 1 ? value[0] : 
    `${value.length} activities selected`;

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="w-full">
            
            {/* Main Dropdown Button */}
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
                <Search className="h-4 w-4 text-primary flex-shrink-0" />
                <span className={cn(
                  "truncate",
                  value.length === 0 && "text-muted-foreground"
                )}>
                  {displayText}
                </span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className={cn(
            "w-80 p-0",
            "bg-background/95 backdrop-blur-md border border-primary/20",
            "shadow-lg rounded-lg",
            "glass"
          )}
          align="start"
        >
          <div className="p-3">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search categories or add custom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8"
              />
            </div>

            {/* Add Custom Option */}
            {canAddCustom && (
              <div 
                onClick={handleAddCustom}
                className="flex items-center gap-2 px-2 py-2 mb-2 cursor-pointer rounded-md bg-primary/5 hover:bg-primary/10 border border-primary/20"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">
                  Add "{searchTerm}" as custom activity
                </span>
              </div>
            )}

            {/* Categories List */}
            <div className="max-h-60 overflow-auto">
              {filteredCategories.length === 0 && !canAddCustom ? (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  No categories found. Try typing to add a custom activity.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCategories.map((category) => (
                    <div
                      key={category}
                      onClick={() => handleToggleCategory(category)}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 cursor-pointer rounded-md transition-colors duration-150",
                        "hover:bg-primary/10 hover:text-primary",
                        value.includes(category) && "bg-primary/10 text-primary"
                      )}
                    >
                      <Checkbox 
                        checked={value.includes(category)}
                        onChange={() => {}} // Controlled by parent click
                        className="pointer-events-none"
                      />
                      <span className="text-sm flex-1">{category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {value.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {value.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-6 px-2 text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EnhancedActivitySelector;