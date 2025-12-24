import { useState, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, Target, Plus, Check, ChevronsUpDown, Globe } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface KeywordData {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition_level: string;
  intent: string;
  source: string;
}

interface KeywordsResearchFormProps {
  brandId: string;
  brandName: string;
  onComplete?: () => void;
}

export const KeywordsResearchForm = ({ brandId, brandName, onComplete }: KeywordsResearchFormProps) => {
  const [keywords, setKeywords] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<KeywordData[]>([]);
  const [currentStep, setCurrentStep] = useState<'input' | 'suggestions' | 'results'>('input');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load brand defaults for location and language
  useEffect(() => {
    const loadBrandDefaults = async () => {
      if (!brandId) return;
      
      try {
        const { data: brand, error } = await supabase
          .from('brands')
          .select('country, language')
          .eq('id', brandId)
          .maybeSingle();

        if (!error && brand) {
          if (brand.country) {
            setSelectedCountry(brand.country);
          }
          if (brand.language) {
            setSelectedLanguage(brand.language);
          }
        }
      } catch (error) {
        console.error('Error loading brand defaults:', error);
      }
    };

    loadBrandDefaults();
  }, [brandId]);

  const handleGenerateAISuggestions = async () => {
    if (!keywords.trim()) {
      toast({
        title: "Keywords Required",
        description: "Please enter at least one keyword to get AI suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const seedKeywords = keywords
        .split(/[,\n]/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

      if (seedKeywords.length === 0) {
        throw new Error('No valid keywords provided');
      }

      const response = await supabase.functions.invoke('ai-keyword-suggestions', {
        body: {
          seedKeywords,
          country: selectedCountry,
          brandName,
          brandId,
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate AI suggestions');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'AI suggestion generation failed');
      }

      const allKeywords = response.data.data.allKeywords || [];
      setSuggestedKeywords(allKeywords);
      setSelectedKeywords(new Set(allKeywords)); // Select all by default
      setCurrentStep('suggestions');
      
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${allKeywords.length} keyword suggestions`,
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      toast({
        title: "AI Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate AI suggestions',
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'informational': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transactional': return 'bg-green-100 text-green-800 border-green-200';
      case 'commercial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'navigational': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getLanguageCode = (language: string) => {
    const languageMap: Record<string, string> = {
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt',
      'Dutch': 'nl',
      'Russian': 'ru',
      'Chinese': 'zh',
      'Japanese': 'ja',
      'Korean': 'ko',
      'Arabic': 'ar',
    };
    return languageMap[language] || 'en';
  };

  const handleReset = () => {
    setKeywords('');
    setSuggestedKeywords([]);
    setResults([]);
    setCurrentStep('input');
    setSelectedKeywords(new Set());
  };

  const handleSelectKeyword = (keyword: string, selected: boolean) => {
    const newSelected = new Set(selectedKeywords);
    if (selected) {
      newSelected.add(keyword);
    } else {
      newSelected.delete(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      if (currentStep === 'suggestions') {
        setSelectedKeywords(new Set(suggestedKeywords));
      } else {
        setSelectedKeywords(new Set(results.map(r => r.keyword)));
      }
    } else {
      setSelectedKeywords(new Set());
    }
  };

  const handleSaveKeywords = async () => {
    if (selectedKeywords.size === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select keywords to save",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const keywordEntries = Array.from(selectedKeywords).map(keyword => {
        const keywordData = results.find(r => r.keyword === keyword);
        return {
          user_id: user.id,
          brand_id: brandId,
          keyword,
          search_volume: keywordData?.search_volume || 0,
          intent: keywordData?.intent || 'Informational',
          intents: [keywordData?.intent || 'Informational'],
          cpc: keywordData?.cpc || 0,
          competition_level: keywordData?.competition_level || 'Low',
          target_country: selectedCountry,
          source: 'keyword_explorer'
        };
      });

      const { error } = await supabase
        .from('seo_tracked_keywords')
        .insert(keywordEntries);

      if (error) throw error;

      queryClient.invalidateQueries({ 
        queryKey: ['tracked-keywords', brandId, user.id]
      });
      queryClient.invalidateQueries({ 
        queryKey: ['saved-keywords', brandId]
      });

      toast({
        title: "Keywords Saved",
        description: `Successfully saved ${selectedKeywords.size} keywords to Saved Keywords`,
      });

      handleReset();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving keywords:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save keywords',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {currentStep === 'input' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Keywords Input */}
            <div className="space-y-2">
              <Label htmlFor="keywords-input">Keywords</Label>
              <Textarea
                id="keywords-input"
                placeholder="Enter keywords separated by commas or new lines (shift + enter)&#10;&#10;Example:&#10;dessert near me&#10;cake shop singapore&#10;bakery delivery"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-sm text-muted-foreground">
                AI will generate additional keyword suggestions based on your inputs
              </p>
            </div>

            {/* Country Selection */}
            <div className="space-y-2">
              <Label>Target Country</Label>
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="truncate">
                        {COUNTRIES_WITH_POPULAR_FIRST.find(c => c.value === selectedCountry)?.label || "Select country"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-background border-border shadow-lg z-50" align="start">
                  <Command className="max-h-[400px]">
                    <CommandInput placeholder="Search countries..." className="h-9" />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandList className="max-h-[340px] overflow-y-auto">
                      <CommandGroup>
                        {COUNTRIES_WITH_POPULAR_FIRST.map((country) => (
                          <CommandItem
                            key={country.value}
                            value={country.label}
                            onSelect={() => {
                              setSelectedCountry(country.value);
                              setCountryOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer",
                              selectedCountry === country.value && "bg-accent"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCountry === country.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Language Selection */}
            <div className="space-y-2">
              <Label>Language</Label>
              <Popover open={languageOpen} onOpenChange={setLanguageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={languageOpen}
                    className="w-full justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="truncate">
                        {LANGUAGES_WITH_POPULAR_FIRST.find(l => l.value === selectedLanguage)?.label || "Select language"}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-background border-border shadow-lg z-50" align="start">
                  <Command className="max-h-[400px]">
                    <CommandInput placeholder="Search languages..." className="h-9" />
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandList className="max-h-[340px] overflow-y-auto">
                      <CommandGroup>
                        {LANGUAGES_WITH_POPULAR_FIRST.map((language) => (
                          <CommandItem
                            key={language.value}
                            value={language.label}
                            onSelect={() => {
                              setSelectedLanguage(language.value);
                              setLanguageOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer",
                              selectedLanguage === language.value && "bg-accent"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLanguage === language.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {language.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Find Keywords Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleGenerateAISuggestions}
                disabled={isGeneratingSuggestions || !keywords.trim()}
                size="lg"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Keywords
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'suggestions' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={selectedKeywords.size === suggestedKeywords.length && suggestedKeywords.length > 0}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
                <h3 className="text-lg font-semibold">
                  AI Generated Suggestions ({selectedKeywords.size}/{suggestedKeywords.length})
                </h3>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSaveKeywords}
                  disabled={saving || selectedKeywords.size === 0}
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Save ({selectedKeywords.size})
                    </>
                  )}
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[400px] w-full border rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {suggestedKeywords.map((keyword, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSelectKeyword(keyword, !selectedKeywords.has(keyword))}
                  >
                    <Checkbox 
                      checked={selectedKeywords.has(keyword)}
                      onCheckedChange={(checked) => handleSelectKeyword(keyword, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm flex-1 break-words">{keyword}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {currentStep === 'results' && results.length > 0 && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Keyword Results ({results.length})</h3>
              <div className="flex items-center gap-2">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleSaveKeywords}
                  disabled={selectedKeywords.size === 0 || saving}
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Save ({selectedKeywords.size})
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedKeywords.size === results.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Intent</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">CPC</TableHead>
                      <TableHead>Competition</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Checkbox
                            checked={selectedKeywords.has(result.keyword)}
                            onCheckedChange={(checked) => handleSelectKeyword(result.keyword, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{result.keyword}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={getIntentColor(result.intent)}>
                            {result.intent}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            {formatNumber(result.search_volume)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${result.cpc?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {result.competition_level}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
