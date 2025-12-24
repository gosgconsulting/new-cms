import { FC, useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PlacesFilterNewProps {
  value: string[];
  onChange: (services: string[]) => void;
  className?: string;
}

import { ACTIVITY_CATEGORIES, ENHANCED_PLACE_TYPES } from '@/data/constants';

const POPULAR_CATEGORIES = [
  'Restaurant',
  'Cafe', 
  'Hotel',
  'Pet Store',
  'Dog Park',
  'Veterinary',
  'Shopping Mall',
  'Beach',
  'Trail',
  'Grooming'
];

// Activity-based category sections for better UX
const ACTIVITY_SECTIONS = Object.entries(ACTIVITY_CATEGORIES).map(([key, value]) => ({
  id: key,
  name: value.name,
  icon: value.icon,
  categories: value.categories
}));

const PlacesFilterNew: FC<PlacesFilterNewProps> = ({
  value,
  onChange,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleCategoryToggle = (category: string) => {
    if (value.includes(category)) {
      // Remove if already selected
      onChange(value.filter(v => v !== category));
    } else {
      // Add to selection (multi-select for Apify)
      onChange([...value, category]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Multi-select - add to existing selection
      if (!value.includes(searchQuery.trim())) {
        onChange([...value, searchQuery.trim()]);
      }
      setSearchQuery('');
      setIsDropdownOpen(false);
    }
  };

  const getPlaceholder = () => {
    if (value.length === 0) return "Select service types (or search all businesses)";
    if (value.length === 1) return value[0];
    return `${value[0]} +${value.length - 1} more`;
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent event bubbling
    e?.preventDefault();
    onChange([]);
    setIsDropdownOpen(false);
  };

  const handleRemoveService = (serviceToRemove: string) => {
    onChange(value.filter(v => v !== serviceToRemove));
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Main Dropdown Button */}
      <div className="relative">
        <div
          className={cn(
            "flex items-center gap-2 h-12 px-4 border border-primary/20 rounded-lg", // Consistent h-12 height
            "bg-background/60 backdrop-blur-sm cursor-pointer transition-all duration-300",
            "hover:border-primary/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)]",
            "w-full", // Full width instead of fixed
            isDropdownOpen && "border-primary/60 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          )}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className={cn(
            "flex-1 text-left text-sm",
            "overflow-hidden whitespace-nowrap text-ellipsis",
            value.length === 0 ? "text-muted-foreground" : "text-foreground"
          )}>
            {getPlaceholder()}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0",
            isDropdownOpen && "rotate-180"
          )} />
        </div>

        {/* Dropdown Content */}
        {isDropdownOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-2 p-4 z-[100]",
            "bg-background/95 backdrop-blur-md border border-primary/20 rounded-lg",
            "shadow-[0_10px_30px_rgba(0,0,0,0.3)] shadow-primary/10",
            "w-[400px]" // Wider dropdown content
          )}>
            {/* Custom Search - No placeholder, auto-focused */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <Input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pr-16 border-primary/30 focus:border-primary/60",
                  "bg-background/80 backdrop-blur-sm h-10"
                )}
                autoFocus
              />
              {searchQuery.trim() && (
                <Button
                  type="submit"
                  size="sm"
                  variant="neon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 px-3 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </form>

            {/* Clear Button - Only show when there are selections */}
            {value.length > 0 && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className={cn(
                    "w-full h-9 text-sm justify-start",
                    "border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                  )}
                  type="button"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Activity-based Category Sections */}
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {ACTIVITY_SECTIONS.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    <span>{section.icon}</span>
                    <span>{section.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {section.categories.slice(0, 6).map((category) => {
                      const displayName = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
                      return (
                        <Button
                          key={category}
                          variant={value.includes(displayName) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryToggle(displayName)}
                          className={cn(
                            "h-8 text-xs justify-start",
                            value.includes(displayName) && "bg-primary/90 text-primary-foreground"
                          )}
                        >
                          {displayName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {/* Popular Categories Section */}
              <div className="space-y-2 border-t border-primary/10 pt-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span>⭐</span>
                  <span>Most Popular</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      variant={value.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryToggle(category)}
                      className={cn(
                        "h-8 text-xs justify-start",
                        value.includes(category) && "bg-primary/90 text-primary-foreground"
                      )}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesFilterNew;