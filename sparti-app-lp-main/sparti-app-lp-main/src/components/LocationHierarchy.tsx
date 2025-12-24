import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import CountryFilter from '@/components/CountryFilter';

interface LocationHierarchyProps {
  country: string;
  region: string;
  district: string;
  city: string;
  onCountryChange: (country: string) => void;
  onRegionChange: (region: string) => void;
  onDistrictChange: (district: string) => void;
  onCityChange: (city: string) => void;
  disabled?: boolean;
}

// Sample regions - in real app this would come from an API
const REGIONS_BY_COUNTRY: Record<string, string[]> = {
  Thailand: ['Bangkok Province', 'Chiang Mai Province', 'Phuket Province', 'Chonburi Province'],
  'United States': ['California', 'New York', 'Texas', 'Florida'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland']
};

const DISTRICTS_BY_REGION: Record<string, string[]> = {
  'Bangkok Province': ['Bangkok Metropolitan', 'Thonburi', 'Nonthaburi', 'Samut Prakan'],
  'California': ['Los Angeles County', 'San Francisco County', 'Orange County', 'San Diego County']
};

const LocationHierarchy = ({
  country,
  region,
  district,
  city,
  onCountryChange,
  onRegionChange,
  onDistrictChange,
  onCityChange,
  disabled
}: LocationHierarchyProps) => {
  const availableRegions = REGIONS_BY_COUNTRY[country] || [];
  const availableDistricts = DISTRICTS_BY_REGION[region] || [];

  const handleCountryChange = (newCountry: string) => {
    onCountryChange(newCountry);
    onRegionChange(''); // Reset dependent fields
    onDistrictChange('');
  };

  const handleRegionChange = (newRegion: string) => {
    onRegionChange(newRegion);
    onDistrictChange(''); // Reset dependent field
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>Country*</Label>
        <CountryFilter
          value={country}
          onChange={handleCountryChange}
          className={disabled ? 'opacity-50 pointer-events-none' : ''}
        />
      </div>
      
      <div className="space-y-2">
        <Label>Region (optional)</Label>
        <Select 
          value={region} 
          onValueChange={handleRegionChange}
          disabled={disabled || availableRegions.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select region (optional)" />
          </SelectTrigger>
          <SelectContent>
            {availableRegions.map(regionOption => (
              <SelectItem key={regionOption} value={regionOption}>
                {regionOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>District (optional)</Label>
        <Select 
          value={district} 
          onValueChange={onDistrictChange}
          disabled={disabled || availableDistricts.length === 0}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select district (optional)" />
          </SelectTrigger>
          <SelectContent>
            {availableDistricts.map(districtOption => (
              <SelectItem key={districtOption} value={districtOption}>
                {districtOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default LocationHierarchy;