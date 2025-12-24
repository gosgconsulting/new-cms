import React, { useState, useEffect } from 'react';
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
import UseTrackedKeywordsModal from '@/components/campaigns/UseTrackedKeywordsModal';
import { TopicResearchHistoryTable } from '@/components/campaigns/TopicResearchHistoryTable';
import { useQueryClient } from '@tanstack/react-query';
import { useTopicResearch } from '@/hooks/useTopicResearch';

interface TopicsResearchFormProps {
  brandId: string;
  brandName: string;
  defaultKeywords?: string[];
  onResearchComplete?: (researchId: string) => void;
}

export const TopicsResearchForm: React.FC<TopicsResearchFormProps> = ({
  brandId,
  brandName,
  defaultKeywords = [],
  onResearchComplete,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Search form state
  const [keywords, setKeywords] = useState<string[]>(defaultKeywords);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [topicsNumber, setTopicsNumber] = useState(20);
  const [contentSettings, setContentSettings] = useState<any>(null);
  const [useTrackedKeywordsModalOpen, setUseTrackedKeywordsModalOpen] = useState(false);

  // Use the topic research hook
  const { handleSearch, isLoading } = useTopicResearch({
    onResearchComplete,
    isOnboarding: true
  });

  // Update keywords when defaultKeywords change
  useEffect(() => {
    if (defaultKeywords.length > 0) {
      setKeywords(defaultKeywords);
    }
  }, [defaultKeywords]);

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

    loadContentSettings();
  }, [brandId]);

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleTrackedKeywordSelected = (selectedKeyword: string) => {
    if (!keywords.includes(selectedKeyword)) {
      setKeywords([...keywords, selectedKeyword]);
    }
  };


  const handleSearchClick = async () => {
    await handleSearch({
      brandId,
      keywords,
      location,
      language,
      topicsNumber,
      contentSettings
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Keywords Input */}
        <div className="space-y-2">
          <Label>Search Keywords</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter a keyword or topic..."
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              type="button" 
              onClick={addKeyword}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <button
            type="button"
            onClick={() => setUseTrackedKeywordsModalOpen(true)}
            className="text-sm text-primary hover:underline"
          >
            Use tracked keywords
          </button>
          
          {/* Keywords Display */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="flex items-center gap-2 px-3 py-1.5 border-2 border-primary/30 bg-primary/10 shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
                >
                  <span className="font-medium">{keyword}</span>
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
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

          <div className="space-y-2">
            <Label>Language</Label>
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

          <div className="space-y-2">
            <Label>Topics Number</Label>
            <Select value={topicsNumber.toString()} onValueChange={(val) => setTopicsNumber(parseInt(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Topics
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={handleSearchClick}
            disabled={isLoading || keywords.length === 0}
            size="lg"
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching Topics...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Topic Research
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Topic Research History Table */}
      {user && (
        <div className="mt-8">
          <TopicResearchHistoryTable 
            brandId={brandId}
            brandName={brandName}
            userId={user.id}
          />
        </div>
      )}

      {/* Use Tracked Keywords Modal */}
      <UseTrackedKeywordsModal
        open={useTrackedKeywordsModalOpen}
        onOpenChange={setUseTrackedKeywordsModalOpen}
        brandId={brandId}
        onKeywordSelected={handleTrackedKeywordSelected}
      />
    </>
  );
};
