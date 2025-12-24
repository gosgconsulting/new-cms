import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import UseTrackedKeywordsModal from '@/components/campaigns/UseTrackedKeywordsModal';

interface BacklinksTopicsFormProps {
  brandId: string;
  brandName: string;
  selectedKeywords: any[];
  selectedLinks: any[];
  onTopicsGenerated: (topics: any[]) => void;
  onKeywordsChange?: (keywords: string[]) => void;
}

export const BacklinksTopicsForm = ({
  brandId,
  brandName,
  selectedKeywords,
  selectedLinks,
  onTopicsGenerated,
  onKeywordsChange,
}: BacklinksTopicsFormProps) => {
  const [keywords, setKeywords] = useState<string[]>(
    selectedKeywords.map(kw => kw.keyword || kw)
  );
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [location, setLocation] = useState('United States');
  const [language, setLanguage] = useState('English');
  const [numberOfTopics, setNumberOfTopics] = useState('10');
  const [isGenerating, setIsGenerating] = useState(false);
  const [useTrackedKeywordsModalOpen, setUseTrackedKeywordsModalOpen] = useState(false);
  const { toast } = useToast();

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      const newKeywords = [...keywords, currentKeyword.trim()];
      setKeywords(newKeywords);
      onKeywordsChange?.(newKeywords);
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(newKeywords);
    onKeywordsChange?.(newKeywords);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleTrackedKeywordSelected = (selectedKeyword: string) => {
    if (!keywords.includes(selectedKeyword)) {
      const newKeywords = [...keywords, selectedKeyword];
      setKeywords(newKeywords);
      onKeywordsChange?.(newKeywords);
    }
  };

  const handleGenerateTopics = async () => {
    if (keywords.length === 0) {
      toast({
        title: 'No Keywords Selected',
        description: 'Please add keywords first',
        variant: 'destructive',
      });
      return;
    }

    if (selectedLinks.length === 0) {
      toast({
        title: 'No Internal Links',
        description: 'Please select internal links first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create generation record
      const internalLinksData = selectedLinks.map(link => ({
        id: link.id,
        url: link.url,
        title: link.title
      }));

      const { data: generation, error: genError } = await supabase
        .from('backlink_topic_generation')
        .insert({
          user_id: user.id,
          brand_id: brandId,
          keywords: keywords,
          internal_links: internalLinksData,
          location,
          language,
          topics_number: parseInt(numberOfTopics),
          status: 'pending'
        })
        .select()
        .single();

      if (genError) throw genError;

      // Call edge function with generation ID
      const { data, error } = await supabase.functions.invoke('generate-backlink-topics', {
        body: {
          brandId,
          brandName,
          keywords,
          internalLinks: internalLinksData,
          location,
          language,
          numberOfTopics: parseInt(numberOfTopics),
          generationId: generation.id
        },
      });

      if (error) throw error;

      // Fetch generated topics from database
      const { data: topics, error: topicsError } = await supabase
        .from('backlink_suggested_topics')
        .select('*')
        .eq('generation_id', generation.id)
        .order('created_at', { ascending: true });

      if (topicsError) throw topicsError;

      onTopicsGenerated(topics || []);

      toast({
        title: 'Topics Generated',
        description: `Generated ${topics?.length || 0} backlink topics`,
      });
    } catch (error) {
      console.error('Error generating topics:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate topics',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Location</Label>
          <SearchableSelect
            options={COUNTRIES_WITH_POPULAR_FIRST}
            value={location}
            onValueChange={setLocation}
            placeholder="Select country"
          />
        </div>

        <div className="space-y-2">
          <Label>Language</Label>
          <SearchableSelect
            options={LANGUAGES_WITH_POPULAR_FIRST}
            value={language}
            onValueChange={setLanguage}
            placeholder="Select language"
          />
        </div>

        <div className="space-y-2">
          <Label>Number of Topics</Label>
          <Select value={numberOfTopics} onValueChange={setNumberOfTopics}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 Topics</SelectItem>
              <SelectItem value="20">20 Topics</SelectItem>
              <SelectItem value="30">30 Topics</SelectItem>
              <SelectItem value="40">40 Topics</SelectItem>
              <SelectItem value="50">50 Topics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

        <div className="flex justify-center">
          <Button
            onClick={handleGenerateTopics}
            disabled={isGenerating || keywords.length === 0 || selectedLinks.length === 0}
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Topics...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Backlink Topics
              </>
            )}
          </Button>
        </div>
      </div>

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
