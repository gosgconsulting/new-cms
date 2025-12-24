import { useState, useEffect } from 'react';
import { Search, X, Loader2, TrendingUp, BarChart3, Eye, Target, Plus, Check, ChevronsUpDown, Globe } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { COUNTRIES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
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

interface FindKeywordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

const FindKeywordsModal = ({ open, onOpenChange, brandId, brandName }: FindKeywordsModalProps) => {
  const [keywords, setKeywords] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [loading, setLoading] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<KeywordData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentStep, setCurrentStep] = useState<'input' | 'suggestions' | 'results'>('input');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load brand defaults for location
  useEffect(() => {
    const loadBrandDefaults = async () => {
      if (!brandId) return;
      
      try {
        const { data: brand, error } = await supabase
          .from('brands')
          .select('country')
          .eq('id', brandId)
          .maybeSingle();

        if (!error && brand?.country) {
          setSelectedCountry(brand.country);
        }
      } catch (error) {
        console.error('Error loading brand defaults:', error);
      }
    };

    if (open) {
      loadBrandDefaults();
    }
  }, [brandId, open]);

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

      setSuggestedKeywords(response.data.data.allKeywords || []);
      setCurrentStep('suggestions');
      
      toast({
        title: "AI Suggestions Generated",
        description: `Generated ${response.data.data.allKeywords?.length || 0} keyword suggestions`,
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

  const handleAnalyzeKeywords = async () => {
    if (suggestedKeywords.length === 0) {
      toast({
        title: "No Keywords to Analyze",
        description: "Please generate AI suggestions first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('keyword-research', {
        body: {
          keywords: suggestedKeywords,
          country: selectedCountry,
          language: 'en',
          brand_id: brandId
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to analyze keywords');
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Keyword analysis failed');
      }

      setResults(response.data.data.keywords || []);
      setCurrentStep('results');
      setShowResults(true);
      
      toast({
        title: "Keyword Analysis Complete",
        description: `Analyzed ${response.data.data.keywords?.length || 0} keywords with search volumes`,
      });
    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to analyze keywords',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFindKeywords = async () => {
    await handleGenerateAISuggestions();
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

  const getIntentAbbreviation = (intent: string) => {
    switch (intent.toLowerCase()) {
      case 'informational': return 'I';
      case 'transactional': return 'T';
      case 'commercial': return 'C';
      case 'navigational': return 'N';
      default: return 'U';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleReset = () => {
    setKeywords('');
    setSuggestedKeywords([]);
    setResults([]);
    setShowResults(false);
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

  const handleSaveToTracked = async () => {
    if (selectedKeywords.size === 0) {
      toast({
        title: "No Keywords Selected",
        description: "Please select keywords to save to tracked keywords",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Get current user
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
          intents: [keywordData?.intent || 'Informational'], // Array for backwards compatibility
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

      // Invalidate the tracked keywords query to refresh the table
      queryClient.invalidateQueries({ 
        queryKey: ['tracked-keywords', brandId, user.id] 
      });

      toast({
        title: "Keywords Saved",
        description: `Successfully saved ${selectedKeywords.size} keywords to tracked keywords`,
      });

      setSelectedKeywords(new Set());
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Keywords Explorer - {brandName}
          </DialogTitle>
          <DialogDescription>
            Get thousands of relevant keyword ideas with accurate Search Volume and advanced metrics such as Traffic Potential and Intent Analysis.
          </DialogDescription>
        </DialogHeader>

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
                        className={cn(
                          "w-full justify-between h-11",
                          "glass border-2 border-border/50 bg-background/50 backdrop-blur-sm",
                          "hover:border-primary/30 hover:neon-glow transition-all duration-300",
                          "focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">
                            {COUNTRIES_WITH_POPULAR_FIRST.find(c => c.value === selectedCountry)?.label || "Select country"}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className={cn(
                        "w-[400px] p-0",
                        "bg-background/95 backdrop-blur-md border-2 border-border/50",
                        "shadow-2xl rounded-lg z-[100]"
                      )}
                      align="start"
                    >
                      <Command className="max-h-[400px]">
                        <CommandInput 
                          placeholder="Search countries..." 
                          className="h-9"
                        />
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
                                  "flex items-center gap-2 px-3 py-2 cursor-pointer",
                                  "hover:bg-primary/10 hover:text-primary",
                                  "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                                )}
                              >
                                <Check 
                                  className={cn(
                                    "h-4 w-4", 
                                    selectedCountry === country.value ? "opacity-100" : "opacity-0"
                                  )} 
                                />
                                <span className="truncate">{country.label}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={loading || isGeneratingSuggestions}
                  >
                    Reset
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                      disabled={loading || isGeneratingSuggestions}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleFindKeywords}
                      disabled={!keywords.trim() || loading || isGeneratingSuggestions}
                    >
                      {isGeneratingSuggestions ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Find Keywords
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'suggestions' && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">AI Generated Keywords</h3>
                    <p className="text-sm text-muted-foreground">
                      {suggestedKeywords.length} keyword suggestions ready for analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                      {suggestedKeywords.length} keywords
                    </Badge>
                    {selectedKeywords.size > 0 && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {selectedKeywords.size} selected
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="select-all-suggestions"
                    checked={selectedKeywords.size === suggestedKeywords.length && suggestedKeywords.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                  <Label htmlFor="select-all-suggestions" className="text-sm">
                    Select all keywords
                  </Label>
                  {selectedKeywords.size > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedKeywords(new Set())}
                    >
                      Deselect All
                    </Button>
                  )}
                </div>
                
                <div className="max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {suggestedKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm bg-background px-3 py-2 rounded-md border">
                        <Checkbox
                          id={`keyword-${index}`}
                          checked={selectedKeywords.has(keyword)}
                          onCheckedChange={(checked) => handleSelectKeyword(keyword, checked as boolean)}
                        />
                        <Label htmlFor={`keyword-${index}`} className="flex-1 cursor-pointer">
                          {keyword}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep('input')}
                      disabled={loading}
                    >
                      Back to Input
                    </Button>
                    {selectedKeywords.size > 0 && (
                      <Button 
                        onClick={handleSaveToTracked} 
                        disabled={saving}
                        variant="outline"
                        size="sm"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Save Selected
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={handleAnalyzeKeywords}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze Keywords
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 'results' && showResults && (
            /* Results Display */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    {results.length} keywords found
                  </Badge>
                  {selectedKeywords.size > 0 && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {selectedKeywords.size} selected
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>SV {formatNumber(results.reduce((sum, k) => sum + k.search_volume, 0))}</span>
                    <span>•</span>
                    <span>GSV {formatNumber(results.reduce((sum, k) => sum + k.search_volume, 0))}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedKeywords.size > 0 && (
                    <Button 
                      onClick={handleSaveToTracked} 
                      disabled={saving}
                      size="sm"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save to Tracked Keywords
                        </>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleReset}>
                    New Search
                  </Button>
                </div>
              </div>

              {/* Keywords Results Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input 
                            type="checkbox" 
                            className="rounded border-border"
                            checked={selectedKeywords.size === results.length && results.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </TableHead>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Trend</TableHead>
                        <TableHead>Competition</TableHead>
                        <TableHead className="text-right">CPC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.slice(0, 50).map((result, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell>
                            <input 
                              type="checkbox" 
                              className="rounded border-border"
                              checked={selectedKeywords.has(result.keyword)}
                              onChange={(e) => handleSelectKeyword(result.keyword, e.target.checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {result.source === 'original' ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-muted-foreground">+</span>
                              )}
                              <span className="text-primary font-medium hover:underline cursor-pointer">
                                {result.keyword}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant="outline"
                                className={`text-xs px-1.5 py-0.5 ${getIntentColor(result.intent)}`}
                              >
                                {getIntentAbbreviation(result.intent)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {result.intent}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {formatNumber(result.search_volume)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="w-16 h-6 bg-muted/20 rounded flex items-center justify-center">
                              <div className="w-12 h-3 bg-primary/20 rounded-sm flex items-end justify-between px-0.5">
                                {[1,2,1.5,2.5,2,3,2.5,1.8,2.2].map((height, i) => (
                                  <div 
                                    key={i} 
                                    className="w-0.5 bg-primary rounded-full" 
                                    style={{height: `${height * 2}px`}}
                                  />
                                ))}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {result.competition_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${result.cpc?.toFixed(2) || '0.00'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {/* Only show Save to Tracked Keywords button when keywords are selected */}
            {selectedKeywords.size > 0 && (
              <Button 
                onClick={handleSaveToTracked} 
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Save to Tracked Keywords
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FindKeywordsModal;