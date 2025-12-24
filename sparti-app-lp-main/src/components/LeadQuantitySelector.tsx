import { useState } from 'react';
import { Check, ChevronDown, Target, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LEAD_QUANTITIES } from '@/types/leadGeneration';
import { LobstrService } from '@/services/lobstrService';

interface LeadQuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const LeadQuantitySelector = ({ value, onChange, className }: LeadQuantitySelectorProps) => {
  const [open, setOpen] = useState(false);

  const selectedOption = LEAD_QUANTITIES.find(option => option.value === value);
  // REMOVED: Mathematical run calculation - now using abort limits

  return (
    <div className={cn("w-full", className)}>
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
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{selectedOption?.label || '50 leads'}</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-background/95 backdrop-blur-md border border-primary/20" align="start">
          <div className="p-1">
            {LEAD_QUANTITIES.map((option) => {
              // REMOVED: Mathematical run calculation
              return (
                <div
                  key={option.value}
                  className={cn(
                    "flex flex-col px-3 py-2 cursor-pointer rounded-md transition-colors duration-150 hover:bg-primary/10 hover:text-primary",
                    value === option.value && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <div className="ml-6 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>Abort limit (stops at {option.value} leads)</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Abort limit summary */}
            <div className="px-3 py-2 border-t border-border/50 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Abort limit: {value} leads</span>
                </div>
                <div className="text-primary">
                  <span>Natural task creation based on geographic locations</span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LeadQuantitySelector;