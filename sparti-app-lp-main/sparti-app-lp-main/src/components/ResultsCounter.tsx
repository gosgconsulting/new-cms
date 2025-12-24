import { FC } from 'react';
import { MapPin } from 'lucide-react';

interface ResultsCounterProps {
  totalPlaces: number;
  isLoading?: boolean;
  compact?: boolean;
}

const ResultsCounter: FC<ResultsCounterProps> = ({ 
  totalPlaces, 
  isLoading = false, 
  compact = false
}) => {
  return (
    <div className={compact ? 
      "flex items-center gap-2 text-xs" : 
      "flex items-center p-4 mb-4 glass rounded-lg border border-primary/20 bg-background/95 backdrop-blur-md"
    }>
      <div className={compact ? "flex items-center gap-1" : "flex items-center gap-3"}>
        <div className="flex items-center gap-2">
          {!compact && <MapPin className="h-5 w-5 text-primary" />}
          <span className={compact ? "text-xs font-medium text-foreground" : "text-lg font-semibold text-foreground"}>
            {isLoading ? 'Searching...' : compact ? `${totalPlaces}` : `${totalPlaces} business results found`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultsCounter;