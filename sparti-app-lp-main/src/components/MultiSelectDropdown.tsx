import { FC, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLACE_CLUSTERS, PlaceCluster } from '@/data/constants';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MultiSelectDropdownProps {
  options: string[];
  popularOptions?: string[];
  commonBusinessTypes?: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  className?: string;
  maxDisplayed?: number;
  onManualSearch?: (query: string) => void;
}

const MultiSelectDropdown: FC<MultiSelectDropdownProps> = ({
  options,
  popularOptions = [],
  commonBusinessTypes = [],
  value,
  onChange,
  placeholder,
  className = '',
  maxDisplayed = 3,
  onManualSearch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Smart search: find clusters that match search term or contain matching place types
  const getMatchingClusters = () => {
    if (!searchTerm) return PLACE_CLUSTERS;
    
    return PLACE_CLUSTERS.map(cluster => {
      // Filter subcategories that match the search term
      const matchingPlaceTypes = cluster.placeTypes.filter(placeType => 
        placeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPlaceTypeSynonyms(placeType).some(synonym => 
          synonym.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      
      // Check if cluster name matches
      const clusterNameMatch = cluster.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Return cluster with filtered subcategories if there are matches
      if (matchingPlaceTypes.length > 0 || clusterNameMatch) {
        return {
          ...cluster,
          placeTypes: clusterNameMatch ? cluster.placeTypes : matchingPlaceTypes
        };
      }
      
      return null;
    }).filter(Boolean) as PlaceCluster[];
  };

  // Helper function to get synonyms for better search matching
  const getPlaceTypeSynonyms = (placeType: string): string[] => {
    const synonymMap: { [key: string]: string[] } = {
      'Veterinary clinics': ['vet', 'veterinary', 'animal hospital', 'pet clinic'],
      'Pet grooming': ['groomer', 'grooming', 'pet salon'],
      'Pet boarding & daycare': ['boarding', 'daycare', 'pet sitting', 'kennels'],
      'Pet stores': ['pet shop', 'pet supply', 'petco', 'petsmart'],
      'Restaurants': ['restaurant', 'dining', 'food', 'eatery'],
      'Cafes': ['cafe', 'coffee shop', 'coffee', 'bistro', 'espresso', 'starbucks'],
      'Breweries': ['brewery', 'brew', 'beer', 'taproom'],
      'Hotels': ['hotel', 'accommodation', 'lodging', 'resort'],
      'Condos & Apartments': ['condo', 'apartment', 'rental', 'airbnb', 'flat'],
      'Serviced apartments': ['serviced', 'extended stay', 'apartment hotel'],
      'Coworking spaces': ['coworking', 'workspace', 'office', 'co-working', 'work'],
      'Dog parks': ['dog park', 'off-leash', 'dog run'],
      'Shopping malls': ['mall', 'shopping', 'retail', 'stores'],
      'Beaches & swimming areas': ['beach', 'swimming', 'water', 'lake', 'ocean'],
      'Hiking trails': ['hiking', 'trail', 'walk', 'nature', 'outdoor']
    };
    
    return synonymMap[placeType] || [placeType];
  };

  const filteredClusters = getMatchingClusters();

  // Auto-expand categories with matching subcategories when searching
  useEffect(() => {
    if (searchTerm) {
      const matchingClusters = filteredClusters.filter(cluster => {
        return cluster.placeTypes.some(placeType => 
          placeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getPlaceTypeSynonyms(placeType).some(synonym => 
            synonym.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      });

      setExpandedCategories(prev => {
        const newSet = new Set(prev);
        matchingClusters.forEach(cluster => {
          newSet.add(cluster.name);
        });
        return newSet;
      });
    }
  }, [searchTerm, filteredClusters]);

  // Calculate dropdown position when opening with viewport awareness
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 320;
      
      const spaceBelow = viewportHeight - rect.bottom;
      const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
      
      setDropdownPosition({
        top: showAbove 
          ? rect.top + window.scrollY - dropdownHeight - 4
          : rect.bottom + window.scrollY + 4,
        left: Math.max(8, rect.left + window.scrollX),
        width: Math.min(rect.width, window.innerWidth - 16)
      });
    }
  };

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Helper functions for expanded state
  const toggleCategoryExpansion = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const isCategoryExpanded = (categoryName: string): boolean => {
    return expandedCategories.has(categoryName);
  };

  // Selection logic helpers
  const getSelectedSubcategoriesForCluster = (cluster: PlaceCluster): string[] => {
    return cluster.placeTypes.filter(placeType => value.includes(placeType));
  };

  const areAllSubcategoriesSelected = (cluster: PlaceCluster): boolean => {
    return cluster.placeTypes.every(placeType => value.includes(placeType));
  };

  const areSomeSubcategoriesSelected = (cluster: PlaceCluster): boolean => {
    return cluster.placeTypes.some(placeType => value.includes(placeType));
  };

  // Click handlers with proper logic
  const handleAllPetFriendlyClick = () => {
    if (value.includes('All pet friendly places')) {
      onChange([]);
    } else {
      onChange(['All pet friendly places']);
    }
  };

  const handleCategorySelection = (cluster: PlaceCluster) => {
    const allSelected = areAllSubcategoriesSelected(cluster);
    if (allSelected) {
      // Deselect all subcategories
      onChange(value.filter(v => !cluster.placeTypes.includes(v)));
    } else {
      // Remove "All pet friendly places" and select all subcategories
      const filteredValue = value.filter(v => v !== 'All pet friendly places' && !cluster.placeTypes.includes(v));
      onChange([...filteredValue, ...cluster.placeTypes]);
    }
  };

  const handleSubcategoryToggle = (placeType: string) => {
    let newValue;
    if (value.includes(placeType)) {
      newValue = value.filter(v => v !== placeType);
    } else {
      // Remove "All pet friendly places" when selecting specific filters
      newValue = [...value.filter(v => v !== 'All pet friendly places'), placeType];
    }
    onChange(newValue);
  };

  const handleRemoveItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== item));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleManualSearch = () => {
    if (onManualSearch && searchTerm.trim()) {
      console.log('🔍 Manual search triggered:', searchTerm.trim());
      onManualSearch(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleKeyDownSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Enter' && searchTerm.trim() && onManualSearch) {
      e.preventDefault();
      handleManualSearch();
    }
  };

  const displayedItems = value.slice(0, maxDisplayed);
  const hiddenCount = value.length - maxDisplayed;

  // Count selected categories/subcategories
  const selectedCount = value.length;
  const totalCount = PLACE_CLUSTERS.flatMap(cluster => cluster.placeTypes).length;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={handleToggleDropdown}
        className="min-h-12 w-full flex items-center justify-between rounded-lg glass border border-input bg-background px-4 py-2 cursor-pointer hover:neon-glow transition-all duration-300"
      >
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <>
              {displayedItems.map((item) => (
                <div
                  key={item}
                  className="
                    relative inline-flex items-center gap-2
                    px-4 py-2 rounded-[20px]
                    glass bg-gradient-to-br from-primary/10 to-accent/10
                    border border-primary/30 backdrop-blur-md
                    shadow-[0_0_15px_rgba(0,212,255,0.2)]
                    hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]
                    transition-all duration-300
                    text-xs font-medium text-primary
                    hover:border-primary/50
                    group
                  "
                  style={{
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
                    letterSpacing: '0.5px'
                  }}
                >
                  <span className="relative z-10">{item}</span>
                  <button
                    onClick={(e) => handleRemoveItem(item, e)}
                    className="
                      relative z-10 ml-1 p-0.5 rounded-full
                      hover:bg-accent/20 hover:text-accent
                      transition-all duration-200
                      hover:shadow-[0_0_10px_rgba(57,255,20,0.5)]
                    "
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  <div className="
                    absolute inset-0 rounded-[20px]
                    bg-gradient-to-br from-primary/5 to-accent/5
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                  " />
                </div>
              ))}
              {hiddenCount > 0 && (
                <div
                  className="
                    relative inline-flex items-center
                    px-4 py-2 rounded-[20px]
                    glass bg-gradient-to-br from-muted/20 to-muted/30
                    border border-muted/40 backdrop-blur-md
                    shadow-[0_0_10px_rgba(255,255,255,0.1)]
                    text-xs font-medium text-muted-foreground
                    transition-all duration-300
                  "
                  style={{
                    letterSpacing: '0.5px'
                  }}
                >
                  +{hiddenCount} more
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {value.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <ChevronDown 
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>

      {/* Portal-rendered dropdown */}
      {isOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40 backdrop-blur-sm bg-background/80"
            onClick={() => setIsOpen(false)}
          />
          
          <div 
            className="fixed z-50 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-lg shadow-2xl max-h-80 overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              maxWidth: 'calc(100vw - 16px)'
            }}
          >
            <style>{`
              .category-scroll::-webkit-scrollbar {
                width: 8px;
              }
              .category-scroll::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
              }
              .category-scroll::-webkit-scrollbar-thumb {
                background: rgba(0,212,255,0.3);
                border-radius: 4px;
                border: 1px solid rgba(0,212,255,0.1);
              }
              .category-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(0,212,255,0.5);
              }
            `}</style>
            
            {/* Search Header */}
            <div className="p-3 border-b border-primary/10">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDownSearch}
                  placeholder="Search places..."
                  className="pl-10 border-0 bg-transparent focus:ring-0"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="overflow-y-auto max-h-64 category-scroll">
              <div className="p-3">
                {/* All Pet Friendly Places Option */}
                <div className="mb-3">
                  <div 
                    onClick={handleAllPetFriendlyClick}
                    className={cn(
                      "p-3 rounded-[12px] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border backdrop-blur-md",
                      value.includes('All pet friendly places')
                        ? "bg-gradient-to-br from-primary/20 to-accent/20 border-primary/40 shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                        : "bg-gradient-to-br from-muted/10 to-muted/20 border-muted/30 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-lg">🐾</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">
                          All pet friendly places
                        </div>
                        <div className="text-xs text-muted-foreground">
                          No restrictions - show everything pet-friendly
                        </div>
                      </div>
                      {value.includes('All pet friendly places') && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual Search Option */}
                {searchTerm.trim() && onManualSearch && (
                  <div className="mb-3">
                    <div 
                      onClick={handleManualSearch}
                      className="p-3 rounded-[12px] cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <Search className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-foreground text-sm">
                            🔍 Search "{searchTerm}" on Google
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Find businesses matching your search term
                          </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Clusters - Hide when "All pet friendly places" is selected */}
                {!value.includes('All pet friendly places') && (
                  <>
                    {filteredClusters.length > 0 ? (
                      <div className="space-y-1">
                        {filteredClusters.map((cluster) => {
                          const isExpanded = isCategoryExpanded(cluster.name);
                          const allSelected = areAllSubcategoriesSelected(cluster);
                          const someSelected = areSomeSubcategoriesSelected(cluster);

                          return (
                            <Collapsible key={cluster.name} open={isExpanded} onOpenChange={() => toggleCategoryExpansion(cluster.name)}>
                              <div className="border-b border-muted/20 last:border-b-0">
                                {/* Main Category Row */}
                                <div className={cn(
                                  "flex items-center justify-between p-3 transition-all duration-200 rounded-[8px] group",
                                  isExpanded && "bg-gradient-to-r from-primary/10 to-accent/10"
                                )}>
                                  {/* Expandable area */}
                                  <CollapsibleTrigger asChild>
                                    <div className="flex items-center gap-3 cursor-pointer flex-1 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 p-2 rounded">
                                      <ChevronRight 
                                        className={cn(
                                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                          isExpanded && "rotate-90"
                                        )}
                                      />
                                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                        <span className="text-sm">{cluster.icon}</span>
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-foreground">
                                          {cluster.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {cluster.placeTypes.length} options
                                          {someSelected && (
                                            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                                              {getSelectedSubcategoriesForCluster(cluster).length}/{cluster.placeTypes.length}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </CollapsibleTrigger>
                                  
                                  {/* Selection Checkbox */}
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCategorySelection(cluster);
                                    }}
                                    className="p-2 rounded hover:bg-accent/20 transition-colors cursor-pointer"
                                  >
                                    <div className={cn(
                                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200",
                                      allSelected
                                        ? "bg-primary border-primary text-primary-foreground" 
                                        : someSelected
                                        ? "bg-primary/50 border-primary text-primary-foreground"
                                        : "border-muted-foreground/50 hover:border-primary/50"
                                    )}>
                                      {allSelected && <Check className="h-3 w-3" />}
                                      {someSelected && !allSelected && <div className="w-2 h-2 bg-primary-foreground rounded-sm" />}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Subcategories */}
                                <CollapsibleContent className="overflow-hidden">
                                  <div className="ml-8 space-y-1 pb-2">
                                    {cluster.placeTypes.map((placeType) => (
                                      <div
                                        key={placeType}
                                        onClick={() => handleSubcategoryToggle(placeType)}
                                        className="flex items-center justify-between p-2 rounded cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 group"
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                            {placeType}
                                          </span>
                                        </div>
                                        <div className={cn(
                                          "w-4 h-4 rounded border flex items-center justify-center transition-all duration-200",
                                          value.includes(placeType)
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : "border-muted-foreground/50 group-hover:border-primary/50"
                                        )}>
                                          {value.includes(placeType) && <Check className="h-2.5 w-2.5" />}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No categories found</p>
                        <p className="text-xs">Try searching with different terms</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-primary/10 p-3 bg-gradient-to-r from-background/50 to-muted/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground">
                    {selectedCount} selected
                  </div>
                  {value.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-xs h-7 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default MultiSelectDropdown;