import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MapPin, Plus, Trash2, Globe, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface GeographicLocation {
  id: string;
  name: string;
  country: string;
  region?: string;
  type: 'city' | 'region' | 'country';
}

interface GeographicTaskSelectorProps {
  selectedLocations: GeographicLocation[];
  onLocationsChange: (locations: GeographicLocation[]) => void;
  abortLimit: number;
  className?: string;
}

// Sample data - in real app this would come from API
const SAMPLE_LOCATIONS: { [key: string]: GeographicLocation[] } = {
  Thailand: [
    { id: 'th-bangkok', name: 'Bangkok', country: 'Thailand', region: 'Central', type: 'city' },
    { id: 'th-chiang-mai', name: 'Chiang Mai', country: 'Thailand', region: 'Northern', type: 'city' },
    { id: 'th-phuket', name: 'Phuket', country: 'Thailand', region: 'Southern', type: 'city' },
    { id: 'th-pattaya', name: 'Pattaya', country: 'Thailand', region: 'Eastern', type: 'city' },
    { id: 'th-krabi', name: 'Krabi', country: 'Thailand', region: 'Southern', type: 'city' },
    { id: 'th-hua-hin', name: 'Hua Hin', country: 'Thailand', region: 'Central', type: 'city' },
    { id: 'th-koh-samui', name: 'Koh Samui', country: 'Thailand', region: 'Southern', type: 'city' },
    { id: 'th-ayutthaya', name: 'Ayutthaya', country: 'Thailand', region: 'Central', type: 'city' },
    { id: 'th-chiang-rai', name: 'Chiang Rai', country: 'Thailand', region: 'Northern', type: 'city' },
    { id: 'th-kanchanaburi', name: 'Kanchanaburi', country: 'Thailand', region: 'Western', type: 'city' },
  ],
  Singapore: [
    { id: 'sg-singapore', name: 'Singapore', country: 'Singapore', type: 'city' },
    { id: 'sg-sentosa', name: 'Sentosa', country: 'Singapore', type: 'city' },
    { id: 'sg-marina-bay', name: 'Marina Bay', country: 'Singapore', type: 'city' },
    { id: 'sg-orchard', name: 'Orchard', country: 'Singapore', type: 'city' },
    { id: 'sg-chinatown', name: 'Chinatown', country: 'Singapore', type: 'city' },
  ],
  Malaysia: [
    { id: 'my-kuala-lumpur', name: 'Kuala Lumpur', country: 'Malaysia', type: 'city' },
    { id: 'my-george-town', name: 'George Town', country: 'Malaysia', type: 'city' },
    { id: 'my-johor-bahru', name: 'Johor Bahru', country: 'Malaysia', type: 'city' },
    { id: 'my-malacca', name: 'Malacca', country: 'Malaysia', type: 'city' },
    { id: 'my-ipoh', name: 'Ipoh', country: 'Malaysia', type: 'city' },
  ]
};

const COUNTRY_OPTIONS = [
  { value: 'Thailand', label: '🇹🇭 Thailand' },
  { value: 'Singapore', label: '🇸🇬 Singapore' },
  { value: 'Malaysia', label: '🇲🇾 Malaysia' },
  { value: 'Vietnam', label: '🇻🇳 Vietnam' },
  { value: 'Philippines', label: '🇵🇭 Philippines' },
  { value: 'Indonesia', label: '🇮🇩 Indonesia' }
];

const GeographicTaskSelector = ({ 
  selectedLocations, 
  onLocationsChange, 
  abortLimit,
  className 
}: GeographicTaskSelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState('Thailand');
  const [searchTerm, setSearchTerm] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const availableLocations = SAMPLE_LOCATIONS[selectedCountry] || [];
  const filteredLocations = availableLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddLocation = (location: GeographicLocation) => {
    if (!selectedLocations.find(l => l.id === location.id)) {
      onLocationsChange([...selectedLocations, location]);
    }
  };

  const handleRemoveLocation = (locationId: string) => {
    onLocationsChange(selectedLocations.filter(l => l.id !== locationId));
  };

  const handleAddAllCountryLocations = () => {
    const newLocations = availableLocations.filter(
      location => !selectedLocations.find(l => l.id === location.id)
    );
    onLocationsChange([...selectedLocations, ...newLocations]);
  };

  const handleAddCustomLocation = () => {
    if (customLocation.trim()) {
      const customLoc: GeographicLocation = {
        id: `custom-${Date.now()}`,
        name: customLocation.trim(),
        country: selectedCountry,
        type: 'city'
      };
      handleAddLocation(customLoc);
      setCustomLocation('');
    }
  };

  const totalTasks = selectedLocations.length;
  const estimatedLeadsPerTask = Math.min(200, abortLimit); // Each task can get up to 200, limited by abort
  
  return (
    <Card className={cn("glass border-primary/20", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Geographic Task Selection
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            <span>{totalTasks} tasks will be created</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            <span>Abort limit: {abortLimit} leads total</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Country Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Country</label>
          <SearchableSelect
            options={COUNTRY_OPTIONS}
            value={selectedCountry}
            onValueChange={setSelectedCountry}
            placeholder="Choose country"
            className="w-full"
          />
        </div>

        {/* Add All Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddAllCountryLocations}
            className="flex-1"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add All {selectedCountry} Cities ({availableLocations.length})
          </Button>
        </div>

        {/* Search and Custom Location */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cities..."
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Input
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Add custom city..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomLocation()}
            />
            <Button onClick={handleAddCustomLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Available Locations */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Available Cities</label>
          <ScrollArea className="h-32 w-full border rounded-md p-2">
            <div className="space-y-1">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                  onClick={() => handleAddLocation(location)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{location.name}</span>
                    {location.region && (
                      <Badge variant="secondary" className="text-xs">
                        {location.region}
                      </Badge>
                    )}
                  </div>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Selected Locations */}
        {selectedLocations.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Selected Locations ({selectedLocations.length} tasks)
            </label>
            <ScrollArea className="max-h-32 w-full border rounded-md p-2">
              <div className="space-y-1">
                {selectedLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-2 bg-primary/5 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-sm font-medium">{location.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {location.country}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveLocation(location.id)}
                      className="h-6 w-6 p-0 hover:bg-destructive/20"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Summary */}
        <div className="p-3 bg-muted/30 rounded-md space-y-1">
          <div className="text-sm font-medium">Task Creation Summary</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• {totalTasks} geographic tasks will be created</div>
            <div>• Each task targets up to {estimatedLeadsPerTask} leads</div>
            <div>• System will abort when {abortLimit} total leads are reached</div>
            <div>• Natural scaling based on actual geographic availability</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeographicTaskSelector;