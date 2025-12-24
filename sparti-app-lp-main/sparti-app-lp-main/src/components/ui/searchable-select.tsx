import React, { useState } from 'react';
import { Check, ChevronDown, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustomEntry?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  allowCustomEntry = false
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = React.useMemo(() => {
    if (!options || options.length === 0) return [];
    return options.filter((option) =>
      option?.label && typeof option.label === 'string' && 
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  // Check if the search query is not in the options and we allow custom entry
  const showCustomEntry = allowCustomEntry && 
    searchQuery.trim() && 
    !options.some(option => option?.label && typeof option.label === 'string' && option.label.toLowerCase() === searchQuery.toLowerCase()) &&
    !options.some(option => option?.value && typeof option.value === 'string' && option.value.toLowerCase() === searchQuery.toLowerCase());

  const selectedOption = options.find((option) => option.value === value) || 
    (value && !options.some(option => option.value === value) ? { value, label: value } : null);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
    setSearchQuery("");
  };

  const handleCustomEntry = () => {
    onValueChange(searchQuery.trim());
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-card border-border hover:bg-muted/50 text-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {selectedOption?.icon}
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border shadow-lg z-50" 
        align="start"
      >
        <div className="flex items-center border-b border-border px-4 py-4 bg-card">
          <Search className="h-5 w-5 shrink-0 opacity-50 mr-3 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground text-foreground h-8 text-base"
          />
        </div>
        <div className="max-h-[200px] overflow-auto bg-card custom-scrollbar">
          {/* Custom Entry Option */}
          {showCustomEntry && (
            <div
              className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors text-foreground bg-accent/5 border-b border-border/50"
              onClick={handleCustomEntry}
            >
              <Plus className="h-4 w-4 text-primary" />
              <span>Add '<strong>{searchQuery.trim()}</strong>' as custom entry</span>
            </div>
          )}
          
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-4 py-3 text-sm hover:bg-muted/50 transition-colors text-foreground",
                  value === option.value && "bg-muted/30"
                )}
                onClick={() => handleSelect(option.value)}
              >
                <div className="flex items-center gap-3">
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </div>
                {value === option.value && <Check className="h-4 w-4 text-primary" />}
              </div>
            ))
          ) : null}
          {filteredOptions.length === 0 && !showCustomEntry && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No results found.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}