import { FC, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import BaseTouchButton from '@/components/base/BaseTouchButton';
import PlacesFilterNew from '@/components/PlacesFilterNew';
import LocationControl from '@/components/LocationControl';
import CountryFilter from '@/components/CountryFilter';
import { useResponsive } from '@/hooks/useResponsive';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { SearchData, SearchComponentProps } from '@/types/search';

const SearchWidget: FC<SearchComponentProps> = ({
  searchData,
  onSearch,
  onDataChange,
  showTitle = false,
  className
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const { isMobile } = useResponsive();

  // For homepage mode (when no searchData is provided)
  const [localData, setLocalData] = useState<SearchData>({
    services: [],
    country: '',
    location: '',
    radius: 2,
    verification: 'all',
    selectedPlace: undefined
  });

  const currentData = searchData || localData;
  const isHomepage = !searchData;

  // Ensure services is always an array and provide defaults
  const safeCurrentData: SearchData = {
    services: Array.isArray(currentData.services) ? currentData.services : [],
    country: currentData.country || '',
    location: currentData.location || '',
    radius: currentData.radius || 2,
    verification: currentData.verification || 'all',
    selectedPlace: currentData.selectedPlace
  };

  const updateData = (newData: Partial<SearchData>) => {
    // Ensure proper typing and defaults
    const dataToUpdate: Partial<SearchData> = {
      ...newData,
      services: newData.services !== undefined ? 
        (Array.isArray(newData.services) ? newData.services : []) : 
        safeCurrentData.services
    };
    
    if (isHomepage) {
      setLocalData(prev => ({ ...prev, ...dataToUpdate }));
    } else {
      onDataChange?.(dataToUpdate);
    }
  };

  const handleLocationChange = (location: string, placeData?: any) => {
    const updatedData: Partial<SearchData> = {
      location,
      selectedPlace: placeData
    };
    
    updateData(updatedData);
    
    // Only auto-trigger search on homepage, not on search page
    if (isHomepage && location && placeData) {
      handleSearch({
        ...safeCurrentData,
        ...updatedData
      });
    }
  };

  const handleSearch = (dataOverride?: SearchData) => {
    const searchData = dataOverride || safeCurrentData;
    
    if (isHomepage) {
      // Homepage search - call onSearch with data
      onSearch?.(searchData);
    } else {
      // Search page - trigger search manually
      setIsSearching(true);
      // Trigger the search by calling onSearch if available
      onSearch?.(searchData);
      setTimeout(() => {
        setIsSearching(false);
        toast.success('Search updated');
      }, 500);
    }
  };

  const canSearch = safeCurrentData.location;

  return (
    <div className={cn("space-y-4", className)}>
      {showTitle && (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Find Business Leads</h2>
        </div>
      )}
      
      {/* Simplified Search Interface */}
      <div className={cn(
        "flex items-center gap-3",
        isMobile ? "flex-col space-y-3" : "flex-row"
      )}>
        {/* Categories and Country Filter */}
        <div className={cn(
          "flex gap-3",
          isMobile ? "w-full flex-col space-y-3" : "flex-row flex-shrink-0"
        )}>
          {/* Categories First */}
          <div className={cn(
            isMobile ? "w-full" : "w-[320px]" // Slightly wider for multi-select
          )}>
            <PlacesFilterNew
              value={safeCurrentData.services}
              onChange={(services) => {
                updateData({ services });
                // Auto-trigger search on category change for Apify (better UX)
                if (isHomepage && safeCurrentData.location && services.length > 0) {
                  handleSearch({
                    ...safeCurrentData,
                    services
                  });
                }
              }}
              className="w-full min-h-touch"
            />
          </div>

          {/* Country Filter Second */}
          <div className={cn(
            isMobile ? "w-full" : "w-[160px]"
          )}>
            <CountryFilter
              value={safeCurrentData.country}
              onChange={(country) => {
                updateData({ country });
                // Don't auto-trigger search on country change
              }}
              className="w-full min-h-touch"
            />
          </div>
        </div>

        {/* Address Third */}
        <div className={cn(
          "flex-1",
          isMobile ? "w-full" : ""
        )}>
          <LocationControl
            currentLocation={safeCurrentData.location}
            onLocationChange={handleLocationChange}
            radius={safeCurrentData.radius}
            onRadiusChange={(radius) => updateData({ radius })}
            country={safeCurrentData.country} // Pass country for location filtering
            className="w-full min-h-touch"
          />
        </div>

        {/* Remove the search button from SearchWidget to avoid duplicates */}
      </div>

      {/* Search Status */}
      {!canSearch && (
        <div className="text-center text-sm text-muted-foreground">
          {safeCurrentData.services.length > 0 
            ? "Enter address to find businesses" 
            : "Select service types and enter address to find business leads"
          }
        </div>
      )}
    </div>
  );
};

export default SearchWidget;