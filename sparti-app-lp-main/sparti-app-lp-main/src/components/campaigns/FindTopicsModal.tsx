import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import UseTrackedKeywordsModal from './UseTrackedKeywordsModal';
import { useQueryClient } from '@tanstack/react-query';
import { useTopicResearch } from '@/hooks/useTopicResearch';

interface FindTopicsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
  onTopicsGenerated?: (topics: any[]) => void;
  onResearchComplete?: (researchId: string) => void;
  isOnboarding?: boolean;
}

const FindTopicsModal: React.FC<FindTopicsModalProps> = ({
  open,
  onOpenChange,
  brandId,
  brandName,
  onTopicsGenerated,
  onResearchComplete,
  isOnboarding = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search form state
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [topicsNumber, setTopicsNumber] = useState(20);
  const [contentSettings, setContentSettings] = useState<any>(null);
  const [useTrackedKeywordsModalOpen, setUseTrackedKeywordsModalOpen] = useState(false);

  // Use the topic research hook
  const { handleSearch, isLoading } = useTopicResearch({
    onResearchComplete,
    onTopicsGenerated,
    isOnboarding,
    autoClose: true
  });

  // Load content settings and brand defaults
  useEffect(() => {
    const loadContentSettings = async () => {
      if (!brandId) return;
      
      try {
        // Load content settings
        const { data: settings, error } = await supabase
          .from('content_settings')
          .select('*')
          .eq('brand_id', brandId)
          .maybeSingle();
        
        if (!error && settings) {
          setContentSettings(settings);
        }

        // Load brand data for location and language defaults
        const { data: brand, error: brandError } = await supabase
          .from('brands')
          .select('industry, target_audience')
          .eq('id', brandId)
          .maybeSingle();

        if (!brandError && brand) {
          if (brand.industry) setLocation(brand.industry);
          if (brand.target_audience) setLanguage(brand.target_audience);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    if (open) {
      loadContentSettings();
    }
  }, [brandId, open]);


  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setKeyword('');
    }
  }, [open]);

  const handleTrackedKeywordSelected = (selectedKeyword: string) => {
    setKeyword(selectedKeyword);
  };


  const handleSearchClick = async () => {
    if (!keyword.trim()) {
      toast({
        title: "Keyword Required",
        description: "Please enter a search keyword.",
        variant: "destructive",
      });
      return;
    }

    await handleSearch({
      brandId,
      keywords: [keyword.trim()],
      location,
      language,
      topicsNumber,
      contentSettings
    });

    // Close modal after search (for non-onboarding mode)
    if (!isOnboarding) {
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find Topics - {brandName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Keyword Input */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium mb-2 block">Search Keyword</Label>
              <Input
                placeholder="Enter a keyword or topic..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setUseTrackedKeywordsModalOpen(true)}
                className="text-sm text-primary hover:text-primary/80 hover:underline mt-1"
              >
                Use tracked keyword
              </button>
            </div>
          </div>

          {/* Search Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Location</Label>
              <SearchableSelect
                value={location}
                onValueChange={setLocation}
                placeholder="Select location"
                options={COUNTRIES_WITH_POPULAR_FIRST.map(countryData => ({
                  value: countryData.value,
                  label: countryData.label
                }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Language</Label>
              <SearchableSelect
                value={language}
                onValueChange={setLanguage}
                placeholder="Select language"
                options={LANGUAGES_WITH_POPULAR_FIRST.map(langData => ({
                  value: langData.value,
                  label: langData.label
                }))}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Topics Number</Label>
              <Select value={topicsNumber.toString()} onValueChange={(value) => setTopicsNumber(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Number of topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Topics</SelectItem>
                  <SelectItem value="20">20 Topics</SelectItem>
                  <SelectItem value="30">30 Topics</SelectItem>
                  <SelectItem value="50">50 Topics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSearchClick}
              disabled={!keyword.trim() || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isOnboarding ? 'Researching...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      <UseTrackedKeywordsModal
        open={useTrackedKeywordsModalOpen}
        onOpenChange={setUseTrackedKeywordsModalOpen}
        brandId={brandId}
        onKeywordSelected={handleTrackedKeywordSelected}
      />
    </Dialog>
  );
};

export default FindTopicsModal;