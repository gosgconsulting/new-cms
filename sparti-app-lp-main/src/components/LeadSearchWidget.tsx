import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BaseTouchButton from '@/components/base/BaseTouchButton';
import EnhancedActivitySelector from '@/components/EnhancedActivitySelector';
import CountryFilter from '@/components/CountryFilter';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import LeadQuantitySelector from '@/components/LeadQuantitySelector';

import { LeadGenerationData } from '@/types/leadGeneration';
import { LeadSuggestions } from '@/services/aiLeadAnalysis';

interface LeadSearchWidgetProps {
  onSearch: (data: LeadGenerationData) => void;
  onDataUpdate: (data: LeadGenerationData) => void;
  isSearching: boolean;
  className?: string;
  aiSuggestions?: LeadSuggestions;
  showAISuggestions?: boolean;
}

const LeadSearchWidget = ({ 
  onSearch, 
  onDataUpdate,
  isSearching,
  className,
  aiSuggestions,
  showAISuggestions = false
}: LeadSearchWidgetProps) => {
  const [formData, setFormData] = useState<LeadGenerationData>({
    industryTypes: [],
    targetMarket: '',
    location: '',
    leadQuantity: 50,
    searchActivity: [],
    selectedPlace: null
  });

  const [isLoading, setIsLoading] = useState(false);

  // Populate form with AI suggestions
  useEffect(() => {
    if (aiSuggestions && showAISuggestions) {
      const newData = {
        ...formData,
        searchActivity: aiSuggestions.suggestedActivities || [],
        targetMarket: aiSuggestions.suggestedCountries?.[0] || '',
        location: aiSuggestions.suggestedCities?.[0] || ''
      };
      setFormData(newData);
      onDataUpdate(newData);
    }
  }, [aiSuggestions, showAISuggestions]);

  const updateField = (field: keyof LeadGenerationData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataUpdate(newData);
  };

  const removeActivity = (activityToRemove: string) => {
    const updatedActivities = formData.searchActivity.filter(activity => activity !== activityToRemove);
    updateField('searchActivity', updatedActivities);
  };

  const handleSearch = async () => {
    // Require both country and activity
    if (!formData.targetMarket.trim() || !formData.searchActivity || formData.searchActivity.length === 0) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onSearch(formData);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = formData.targetMarket.trim() !== '' && 
    formData.searchActivity && 
    formData.searchActivity.length > 0;

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-4", className)}>
      {/* Main Search Widget */}
      <Card className="shadow-2xl border-primary/20 glass">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Enhanced Activity Selector */}
            <div className="w-full">
              <EnhancedActivitySelector
                value={Array.isArray(formData.searchActivity) ? formData.searchActivity : (formData.searchActivity ? [formData.searchActivity] : [])}
                onChange={(value) => updateField('searchActivity', value)}
                className="w-full"
              />
            </div>

            {/* Target Market (Country) */}
            <div className="w-full">
              <CountryFilter
                value={formData.targetMarket}
                onChange={(value) => updateField('targetMarket', value)}
                placeholder="Thailand"
                className="w-full"
              />
            </div>

            {/* Location (Optional) */}
            <div className="w-full">
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => updateField('location', value)}
                onPlaceSelect={(place) => updateField('selectedPlace', place)}
                placeholder="Enter address (optional)"
                country={formData.targetMarket}
                className="w-full"
              />
            </div>

            {/* Lead Quantity */}
            <div className="w-full">
              <LeadQuantitySelector
                value={formData.leadQuantity}
                onChange={(value) => updateField('leadQuantity', value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex gap-3 pt-4">
            <BaseTouchButton
              variant="neon"
              onClick={handleSearch}
              disabled={!isValid || isLoading}
              isLoading={isLoading}
              className="flex-1 shadow-glow-primary hover:shadow-glow-accent"
              icon={<Search className="h-4 w-4" />}
            >
              Generate Business Leads
            </BaseTouchButton>
          </div>
        </CardContent>
      </Card>

      {/* Selected Activity Tags */}
      {formData.searchActivity && formData.searchActivity.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          {formData.searchActivity.map((activity, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm"
            >
              <span>{activity}</span>
              <button
                onClick={() => removeActivity(activity)}
                className="hover:text-primary/70 transition-colors"
                aria-label={`Remove ${activity}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadSearchWidget;