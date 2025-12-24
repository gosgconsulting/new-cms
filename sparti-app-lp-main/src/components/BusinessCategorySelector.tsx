import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessCategorySelectorProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  disabled?: boolean;
}

const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Hotel', 
  'Gym',
  'Cafe',
  'Retail Store',
  'Medical',
  'Professional Services',
  'Beauty Salon',
  'Auto Services',
  'Real Estate',
  'Education',
  'Financial Services',
  'Entertainment',
  'Home Services',
  'Shopping Mall',
  'Gas Station',
  'Pharmacy',
  'Bank',
  'Insurance',
  'Travel Agency'
];

const BusinessCategorySelector = ({ 
  selectedCategories, 
  onCategoriesChange, 
  disabled 
}: BusinessCategorySelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleRemoveCategory = (category: string) => {
    onCategoriesChange(selectedCategories.filter(c => c !== category));
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="business-categories">
        Business Category* 
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between min-h-[60px] px-3 py-2",
              disabled && "opacity-50 pointer-events-none"
            )}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedCategories.length === 0 ? (
                <span className="text-muted-foreground">
                  Select business types (e.g., restaurants, hotels, gyms)
                </span>
              ) : (
                selectedCategories.slice(0, 3).map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                  >
                    {category}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCategory(category);
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
              {selectedCategories.length > 3 && (
                <span className="text-muted-foreground text-xs">
                  +{selectedCategories.length - 3} more
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearAll();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-y-auto p-2">
            <div className="grid gap-2">
              {BUSINESS_CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="flex items-center space-x-2 hover:bg-muted/50 p-2 rounded-md cursor-pointer"
                  onClick={() => handleCategoryToggle(category)}
                >
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                  />
                  <span className="text-sm">{category}</span>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default BusinessCategorySelector;