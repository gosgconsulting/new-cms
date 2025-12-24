import { useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ActivitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const BUSINESS_ACTIVITIES = [
  'All Activities',
  'Restaurants',
  'Hotels',
  'Retail Stores',
  'Services', 
  'Healthcare',
  'Fitness Centers',
  'Beauty Salons',
  'Automotive',
  'Real Estate',
  'Legal Services',
  'Financial Services',
  'Technology',
  'Education',
  'Entertainment',
  'Construction',
  'Manufacturing',
  'Transportation'
];

const ActivitySelector = ({ value, onChange, className }: ActivitySelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const displayText = value || 'Activity';
  
  // Filter activities based on search term
  const filteredActivities = BUSINESS_ACTIVITIES.filter(activity =>
    activity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (activity: string) => {
    onChange(activity === 'All Activities' ? '' : activity);
    setOpen(false);
    setSearchTerm('');
  };

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
            <div className="flex items-center gap-2 min-w-0">
              <Search className="h-4 w-4 text-primary flex-shrink-0" />
              <span className={cn(
                "truncate",
                !value && "text-muted-foreground"
              )}>
                {displayText}
              </span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
          <div className="p-2">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 mb-2"
            />
            <div className="max-h-60 overflow-auto">
              {filteredActivities.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No activities found.
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div
                    key={activity}
                    onClick={() => handleSelect(activity)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors duration-150",
                      "hover:bg-primary/10 hover:text-primary",
                      (value === activity || (!value && activity === 'All Activities')) && "bg-primary/10 text-primary"
                    )}
                  >
                    <Check 
                      className={cn(
                        "h-4 w-4", 
                        (value === activity || (!value && activity === 'All Activities')) ? "opacity-100" : "opacity-0"
                      )} 
                    />
                    <span className="truncate">{activity}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ActivitySelector;