import { useEffect, useState } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LongtailGroup {
  main_keyword: string;
  variants: string[];
}

export const Step5LongtailVariants = () => {
  const { sessionData, updateSessionData, setIsLoading, isLoading } = useQuickSetup();
  const [longtailGroups, setLongtailGroups] = useState<LongtailGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [newVariants, setNewVariants] = useState<Record<string, string>>({});
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (sessionData.longtail_keywords && sessionData.longtail_keywords.length > 0) {
      setLongtailGroups(sessionData.longtail_keywords);
      setHasGenerated(true);
      // Expand all groups by default
      setExpandedGroups(new Set(sessionData.longtail_keywords.map(g => g.main_keyword)));
    }
  }, []);

  const generateVariants = async () => {
    if (!sessionData.keywords || sessionData.keywords.length === 0) {
      toast.error('No keywords found. Please complete the previous step.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('quick-setup-longtail-variants', {
        body: {
          keywords: sessionData.keywords,
          websiteUrl: sessionData.website_url,
          language: sessionData.language,
          aiAnswers: sessionData.ai_questions_answers
        }
      });

      if (error) throw error;

      const generated = data.longtailKeywords as LongtailGroup[];
      setLongtailGroups(generated);
      setExpandedGroups(new Set(generated.map(g => g.main_keyword)));
      updateSessionData({ longtail_keywords: generated });
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating long-tail variants:', error);
      toast.error('Failed to generate long-tail variants');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (keyword: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(keyword)) {
      newExpanded.delete(keyword);
    } else {
      newExpanded.add(keyword);
    }
    setExpandedGroups(newExpanded);
  };

  const addVariant = (mainKeyword: string) => {
    const newVariant = newVariants[mainKeyword]?.trim();
    if (!newVariant) return;

    const updated = longtailGroups.map(group => {
      if (group.main_keyword === mainKeyword) {
        return {
          ...group,
          variants: [...group.variants, newVariant]
        };
      }
      return group;
    });

    setLongtailGroups(updated);
    updateSessionData({ longtail_keywords: updated });
    setNewVariants({ ...newVariants, [mainKeyword]: '' });
  };

  const removeVariant = (mainKeyword: string, variantIndex: number) => {
    const updated = longtailGroups.map(group => {
      if (group.main_keyword === mainKeyword) {
        return {
          ...group,
          variants: group.variants.filter((_, idx) => idx !== variantIndex)
        };
      }
      return group;
    });

    setLongtailGroups(updated);
    updateSessionData({ longtail_keywords: updated });
  };

  const totalVariants = longtailGroups.reduce((sum, group) => sum + group.variants.length, 0);

  if (!hasGenerated) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Generate Long-tail Keyword Variants</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'll automatically generate specific, low-competition long-tail variants for each of your keywords. 
            These variants will help you target more specific search queries with higher conversion potential.
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Your Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {sessionData.keywords?.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={generateVariants}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Variants...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Long-tail Variants
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Long-tail Keyword Variants</h2>
          <p className="text-muted-foreground">
            {longtailGroups.length} keyword groups • {totalVariants} total variants
          </p>
        </div>
        <Button onClick={generateVariants} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {longtailGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.main_keyword);
          
          return (
            <Card key={group.main_keyword} className="p-4">
              <div className="space-y-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleGroup(group.main_keyword)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-sm font-semibold">
                      {group.main_keyword}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {group.variants.length} variants
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {isExpanded && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {group.variants.map((variant, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="group flex items-center gap-1 pr-1"
                        >
                          {variant}
                          <button
                            onClick={() => removeVariant(group.main_keyword, idx)}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom variant..."
                        value={newVariants[group.main_keyword] || ''}
                        onChange={(e) => setNewVariants({ 
                          ...newVariants, 
                          [group.main_keyword]: e.target.value 
                        })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addVariant(group.main_keyword);
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => addVariant(group.main_keyword)}
                        disabled={!newVariants[group.main_keyword]?.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
