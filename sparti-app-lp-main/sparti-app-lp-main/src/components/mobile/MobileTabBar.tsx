import { FC } from 'react';
import { cn } from '@/lib/utils';
import { Map, List, Plus } from 'lucide-react';
import { useVibration } from '@/hooks/useVibration';

interface MobileTabBarProps {
  activeTab: 'list' | 'map';
  onTabChange: (tab: 'list' | 'map') => void;
  onAddListing?: () => void;
  className?: string;
}

const MobileTabBar: FC<MobileTabBarProps> = ({
  activeTab,
  onTabChange,
  onAddListing,
  className
}) => {
  const { vibrate } = useVibration();

  const handleTabClick = (tab: 'list' | 'map') => {
    vibrate('tap');
    onTabChange(tab);
  };

  const handleAddClick = () => {
    vibrate('tap');
    onAddListing?.();
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "safe-area-bottom",
      "bg-card/90 backdrop-blur-lg border-t border-border",
      "flex items-center justify-around",
      "h-16 px-2",
      className
    )}>
      {/* List Tab */}
      <button
        onClick={() => handleTabClick('list')}
        className={cn(
          "flex flex-col items-center justify-center",
          "touch-friendly rounded-lg transition-all duration-200",
          "min-w-16 h-12",
          activeTab === 'list' 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="List view"
      >
        <List size={20} />
        <span className="text-xs mt-1">List</span>
      </button>

      {/* Add Button */}
      {onAddListing && (
        <button
          onClick={handleAddClick}
          className={cn(
            "flex items-center justify-center",
            "w-12 h-12 rounded-full",
            "bg-primary text-primary-foreground",
            "transition-all duration-200",
            "hover:scale-105 active:scale-95",
            "shadow-lg"
          )}
          aria-label="Add listing"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Map Tab */}
      <button
        onClick={() => handleTabClick('map')}
        className={cn(
          "flex flex-col items-center justify-center",
          "touch-friendly rounded-lg transition-all duration-200",
          "min-w-16 h-12",
          activeTab === 'map' 
            ? "text-primary bg-primary/10" 
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Map view"
      >
        <Map size={20} />
        <span className="text-xs mt-1">Map</span>
      </button>
    </div>
  );
};

export default MobileTabBar;