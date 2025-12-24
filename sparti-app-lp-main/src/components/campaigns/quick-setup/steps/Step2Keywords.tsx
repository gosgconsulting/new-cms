import { useState, useEffect } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface KeywordWithData {
  keyword: string;
  search_volume: number | null;
  intent: string;
  country: string;
  selected: boolean;
}

export const Step2Keywords = () => {
  const { sessionData, updateSessionData } = useQuickSetup();
  const [keywordGroups, setKeywordGroups] = useState<KeywordWithData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (sessionData.keyword_groups && sessionData.keyword_groups.length > 0) {
      setKeywordGroups(sessionData.keyword_groups);
      setHasGenerated(true);
    }
    if (sessionData.keywords && sessionData.keywords.length > 0) {
      setFocusKeywords(sessionData.keywords);
    }
  }, []);

  const addKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error('Please enter a keyword');
      return;
    }

    const trimmedKeyword = newKeyword.trim();
    
    if (focusKeywords.includes(trimmedKeyword)) {
      toast.error('Keyword already exists');
      return;
    }

    const updatedKeywords = [...focusKeywords, trimmedKeyword];
    setFocusKeywords(updatedKeywords);
    updateSessionData({ keywords: updatedKeywords });
    setNewKeyword('');
  };

  const removeKeyword = (keyword: string) => {
    const updatedKeywords = focusKeywords.filter(k => k !== keyword);
    setFocusKeywords(updatedKeywords);
    updateSessionData({ keywords: updatedKeywords });
  };

  const generateKeywordData = async () => {
    if (focusKeywords.length === 0) {
      toast.error('Please add at least one keyword');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch keyword data (search volume, intent)
      const { data: keywordData, error: keywordError } = await supabase.functions.invoke(
        'keyword-research',
        {
          body: {
            keywords: focusKeywords,
            country: sessionData.country,
            language: sessionData.language,
          },
        }
      );

      if (keywordError) throw keywordError;

      // Create keyword list with data
      const groups: KeywordWithData[] = focusKeywords.map((keyword: string) => {
        const kwData = keywordData?.keywords?.find((k: any) => k.keyword === keyword);
        
        return {
          keyword: keyword,
          search_volume: kwData?.search_volume || null,
          intent: kwData?.intent || 'informational',
          country: sessionData.country || 'US',
          selected: false, // Default to not selected
        };
      });

      setKeywordGroups(groups);
      updateSessionData({ keyword_groups: groups });
      setHasGenerated(true);
    } catch (error: any) {
      console.error('Error generating keyword data:', error);
      toast.error(error.message || 'Failed to generate keyword data');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKeyword = (index: number) => {
    const updated = [...keywordGroups];
    const newSelectedState = !updated[index].selected;
    
    // Check if trying to select and already at max 3
    if (newSelectedState) {
      const currentlySelected = updated.filter(k => k.selected).length;
      if (currentlySelected >= 3) {
        toast.error('You can select a maximum of 3 keywords');
        return;
      }
    }
    
    updated[index].selected = newSelectedState;
    setKeywordGroups(updated);
    updateSessionData({ keyword_groups: updated });
  };

  const selectAll = () => {
    const updated = keywordGroups.map((group, idx) => ({
      ...group,
      selected: idx < 3, // Only select first 3
    }));
    setKeywordGroups(updated);
    updateSessionData({ keyword_groups: updated });
  };

  const deselectAll = () => {
    const updated = keywordGroups.map(group => ({
      ...group,
      selected: false,
    }));
    setKeywordGroups(updated);
    updateSessionData({ keyword_groups: updated });
  };

  const getSelectedCount = () => {
    return keywordGroups.filter(g => g.selected).length;
  };

  if (!hasGenerated) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Keywords Analysis</h3>
            <p className="text-sm text-muted-foreground">
              We'll analyze your focus keywords, fetch search volume data, and generate long-tail variants to help you rank for more specific queries.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-3">Focus Keywords:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {focusKeywords.map((kw: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="pr-1">
                    {kw}
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="ml-2 hover:bg-muted rounded-full p-0.5"
                      aria-label={`Remove ${kw}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Add a keyword manually..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={addKeyword}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Button
            onClick={generateKeywordData}
            disabled={isLoading || focusKeywords.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Keywords...
              </>
            ) : (
              'Generate Keyword Data & Variants'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Select Keywords</h3>
            <p className="text-sm text-muted-foreground">
              Choose which keywords to target ({getSelectedCount()}/3 selected)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              setHasGenerated(false);
              setKeywordGroups([]);
            }}>
              Regenerate
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Keyword</TableHead>
                <TableHead className="w-32">Search Volume</TableHead>
                <TableHead className="w-32">Intent</TableHead>
                <TableHead className="w-32">Country</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keywordGroups.map((keyword, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Checkbox
                      checked={keyword.selected}
                      onCheckedChange={() => toggleKeyword(idx)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{keyword.keyword}</TableCell>
                  <TableCell>
                    {keyword.search_volume ? keyword.search_volume.toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{keyword.intent}</Badge>
                  </TableCell>
                  <TableCell>{keyword.country}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
