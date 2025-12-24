import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Plus, X } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Step2TargetSettings = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  
  const [country, setCountry] = useState(sessionData.country || 'United States');
  const [language, setLanguage] = useState(sessionData.language || 'English');
  const [searchKeywords, setSearchKeywords] = useState<string[]>(sessionData.search_keywords || []);
  const [currentKeyword, setCurrentKeyword] = useState('');

  // Update session data whenever values change
  useEffect(() => {
    updateSessionData({
      country,
      language,
      search_keywords: searchKeywords
    });
  }, [country, language, searchKeywords]);

  const handleAddKeyword = () => {
    const trimmedKeyword = currentKeyword.trim();
    if (trimmedKeyword && !searchKeywords.includes(trimmedKeyword)) {
      setSearchKeywords([...searchKeywords, trimmedKeyword]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setSearchKeywords(searchKeywords.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Target Settings</h2>
        <p className="text-muted-foreground">
          Define your target market and search keywords for content research
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Settings</CardTitle>
          <CardDescription>
            These settings will be used for keyword research and topic generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">
                Target Country <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={COUNTRIES_WITH_POPULAR_FIRST}
                value={country}
                onValueChange={setCountry}
                placeholder="Select country..."
                searchPlaceholder="Search countries..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">
                Content Language <span className="text-destructive">*</span>
              </Label>
              <SearchableSelect
                options={LANGUAGES_WITH_POPULAR_FIRST}
                value={language}
                onValueChange={setLanguage}
                placeholder="Select language..."
                searchPlaceholder="Search languages..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="search-keywords">
                Search Keywords <span className="text-destructive">*</span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Add keywords that represent your business, products, or services
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                id="search-keywords"
                placeholder="e.g., frozen yogurt, dessert, healthy snacks"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                type="button"
                onClick={handleAddKeyword}
                disabled={!currentKeyword.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {searchKeywords.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Added Keywords ({searchKeywords.length})
                </Label>
                <div className="flex flex-wrap gap-2">
                  {searchKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                    >
                      <span>{keyword}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(index)}
                        className="hover:text-primary/70 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchKeywords.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No keywords added yet. Add at least one keyword to continue.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> These settings will be used to generate keyword clusters in the next step. 
          Make sure your target country, language, and search keywords accurately represent your business.
        </p>
      </div>
    </div>
  );
};
