import { useState } from 'react';
import { Check, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { INDUSTRY_TYPES } from '@/types/leadGeneration';

interface IndustryTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const IndustryTypeSelector = ({ value, onChange, className }: IndustryTypeSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (industryType: string) => {
    if (value.includes(industryType)) {
      onChange(value.filter(item => item !== industryType));
    } else {
      onChange([...value, industryType]);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-wrap gap-1 flex-1">
                {value.length === 0 ? (
                  <span className="text-muted-foreground">Industry Type (or search all businesses)</span>
                ) : (
                  <>
                    {value.slice(0, 3).map((industryType) => (
                      <Badge 
                        key={industryType} 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {industryType}
                      </Badge>
                    ))}
                    {value.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{value.length - 3} more
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search industry types..." />
            <CommandEmpty>No industry type found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              <CommandItem onSelect={handleClear} className="text-muted-foreground">
                <span>Search all businesses</span>
              </CommandItem>
              {INDUSTRY_TYPES.map((industryType) => (
                <CommandItem
                  key={industryType}
                  value={industryType}
                  onSelect={() => handleSelect(industryType)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(industryType) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {industryType}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IndustryTypeSelector;