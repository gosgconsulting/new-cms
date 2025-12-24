import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, Phone, Mail, Globe, Star, Users, AlertTriangle } from 'lucide-react';
import { BusinessLead } from '@/types/leadGeneration';

interface AdvancedFiltersProps {
  leads: BusinessLead[];
  onFilteredLeads: (filteredLeads: BusinessLead[]) => void;
  className?: string;
}

interface FilterState {
  hasPhone: boolean | null;
  hasEmail: boolean | null;
  hasWebsite: boolean | null;
  minRating: number;
  minReviews: number;
  businessSize: string[];
  digitalPresenceGaps: string[];
  leadScoreRange: [number, number];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  leads,
  onFilteredLeads,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    hasPhone: null,
    hasEmail: null,
    hasWebsite: null,
    minRating: 0,
    minReviews: 0,
    businessSize: [],
    digitalPresenceGaps: [],
    leadScoreRange: [0, 100]
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const presetFilters = [
    {
      name: "High-Quality Prospects",
      description: "Complete contact info, good ratings",
      filters: { hasPhone: true, hasEmail: true, hasWebsite: true, minRating: 4.0 }
    },
    {
      name: "Contact Missing",
      description: "Businesses needing contact optimization",
      filters: { hasPhone: false, hasEmail: false }
    },
    {
      name: "Web Development Opportunities",
      description: "No website or poor digital presence",
      filters: { hasWebsite: false, digitalPresenceGaps: ['no-website'] }
    },
    {
      name: "Reputation Management Needs",
      description: "Low ratings or few reviews",
      filters: { minRating: 0, minReviews: 0 }
    }
  ];

  const applyFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    const filtered = leads.filter(lead => {
      // Contact filters
      if (updatedFilters.hasPhone !== null) {
        const hasPhone = !!(lead.phone || lead.contactInfo?.phone);
        if (hasPhone !== updatedFilters.hasPhone) return false;
      }

      if (updatedFilters.hasEmail !== null) {
        const hasEmail = !!(lead.email || lead.contactInfo?.email);
        if (hasEmail !== updatedFilters.hasEmail) return false;
      }

      if (updatedFilters.hasWebsite !== null) {
        const hasWebsite = !!(lead.website || lead.contactInfo?.website);
        if (hasWebsite !== updatedFilters.hasWebsite) return false;
      }

      // Rating filter
      if (updatedFilters.minRating > 0) {
        if (!lead.rating || lead.rating < updatedFilters.minRating) return false;
      }

      // Reviews filter
      if (updatedFilters.minReviews > 0) {
        if (!lead.reviews_count || lead.reviews_count < updatedFilters.minReviews) return false;
      }

      // Business size filter
      if (updatedFilters.businessSize.length > 0) {
        if (!lead.businessSize || !updatedFilters.businessSize.includes(lead.businessSize)) return false;
      }

      // Lead score filter
      if (lead.leadScore !== undefined) {
        const [min, max] = updatedFilters.leadScoreRange;
        if (lead.leadScore < min || lead.leadScore > max) return false;
      }

      return true;
    });

    onFilteredLeads(filtered);

    // Count active filters
    let count = 0;
    if (updatedFilters.hasPhone !== null) count++;
    if (updatedFilters.hasEmail !== null) count++;
    if (updatedFilters.hasWebsite !== null) count++;
    if (updatedFilters.minRating > 0) count++;
    if (updatedFilters.minReviews > 0) count++;
    if (updatedFilters.businessSize.length > 0) count++;
    if (updatedFilters.leadScoreRange[0] > 0 || updatedFilters.leadScoreRange[1] < 100) count++;

    setActiveFiltersCount(count);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      hasPhone: null,
      hasEmail: null,
      hasWebsite: null,
      minRating: 0,
      minReviews: 0,
      businessSize: [],
      digitalPresenceGaps: [],
      leadScoreRange: [0, 100]
    };
    applyFilters(clearedFilters);
  };

  const applyPreset = (preset: typeof presetFilters[0]) => {
    applyFilters(preset.filters as Partial<FilterState>);
    setIsOpen(false);
  };

  return (
    <div className={className}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-lead-orange">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Advanced Lead Filters</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Preset Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {presetFilters.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => applyPreset(preset)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-contact-blue" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Has Phone Number</label>
                    <Select value={filters.hasPhone?.toString() || 'any'} onValueChange={(value) => 
                      applyFilters({ hasPhone: value === 'any' ? null : value === 'true' })
                    }>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Has Email</label>
                    <Select value={filters.hasEmail?.toString() || 'any'} onValueChange={(value) => 
                      applyFilters({ hasEmail: value === 'any' ? null : value === 'true' })
                    }>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm">Has Website</label>
                    <Select value={filters.hasWebsite?.toString() || 'any'} onValueChange={(value) => 
                      applyFilters({ hasWebsite: value === 'any' ? null : value === 'true' })
                    }>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Quality Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-opportunity-green" />
                  Business Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Minimum Rating: {filters.minRating}</label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([value]) => applyFilters({ minRating: value })}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block">Minimum Reviews: {filters.minReviews}</label>
                  <Slider
                    value={[filters.minReviews]}
                    onValueChange={([value]) => applyFilters({ minReviews: value })}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm mb-2 block">Lead Score Range: {filters.leadScoreRange[0]} - {filters.leadScoreRange[1]}</label>
                  <Slider
                    value={filters.leadScoreRange}
                    onValueChange={(value) => applyFilters({ leadScoreRange: value as [number, number] })}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={clearAllFilters} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdvancedFilters;