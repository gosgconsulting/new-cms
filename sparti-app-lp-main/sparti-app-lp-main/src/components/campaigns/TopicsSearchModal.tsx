import { Search, Plus, X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import UseTrackedKeywordsModal from '@/components/campaigns/UseTrackedKeywordsModal';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { supabase } from '@/integrations/supabase/client';
import { useTopicResearch } from '@/hooks/useTopicResearch';

interface TopicsSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  onResearchComplete: (researchId: string) => void;
}

const TopicsSearchModal = ({ open, onOpenChange, brandId, onResearchComplete }: TopicsSearchModalProps) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [topicsNumber, setTopicsNumber] = useState(20);
  const [contentSettings, setContentSettings] = useState<any>(null);
  const [useTrackedKeywordsModalOpen, setUseTrackedKeywordsModalOpen] = useState(false);

  const { handleSearch, isLoading } = useTopicResearch({
    onResearchComplete: (researchId) => {
      onResearchComplete(researchId);
      onOpenChange(false);
    }
  });

  // Load content settings and brand defaults when modal opens
  useEffect(() => {
    const loadContentSettings = async () => {
      if (!brandId || !open) return;
      
      try {
        // Load content settings
        const { data: settings } = await supabase
          .from('content_settings')
          .select('*')
          .eq('brand_id', brandId)
          .maybeSingle();
        
        if (settings) {
          setContentSettings(settings);
        }

        // Load brand data for location and language defaults
        const { data: brand } = await supabase
          .from('brands')
          .select('industry, target_audience')
          .eq('id', brandId)
          .maybeSingle();

        if (brand) {
          if (brand.industry) setLocation(brand.industry);
          if (brand.target_audience) setLanguage(brand.target_audience);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadContentSettings();
  }, [brandId, open]);

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Search for Topics</DialogTitle>
            <DialogDescription>
              Enter keywords to discover content topics based on search volume and intent analysis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Keywords Input */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Search Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a keyword or topic..."
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onBlur={addKeyword}
                    className="flex-1"
                  />
                  <Button onClick={addKeyword} size="sm" disabled={!currentKeyword.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  type="button"
                  onClick={() => setUseTrackedKeywordsModalOpen(true)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline mt-1"
                >
                  Use tracked keywords
                </button>
              </div>

              {/* Keywords List */}
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5"
                    >
                      <span className="font-medium">{keyword}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
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

            {/* Action Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSearchClick}
                disabled={keywords.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Start Research
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <UseTrackedKeywordsModal
        open={useTrackedKeywordsModalOpen}
        onOpenChange={setUseTrackedKeywordsModalOpen}
        brandId={brandId}
        onKeywordSelected={handleTrackedKeywordSelected}
      />
    </>
  );
};

export default TopicsSearchModal;
