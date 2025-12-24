import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Sparkles, X } from 'lucide-react';
import { useCompetitorAudit } from '@/contexts/CompetitorAuditContext';
import { CompetitorAuditService } from '@/services/competitorAuditService';
import { useToast } from '@/hooks/use-toast';

const CompetitorAuditStep3SearchTerms = () => {
  const { sessionData, updateSessionData } = useCompetitorAudit();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [manualTerm, setManualTerm] = useState('');

  const handleGenerateSearchTerms = async () => {
    setGenerating(true);
    try {
      const searchTerms = await CompetitorAuditService.generateSearchTerms(
        sessionData.keywords,
        sessionData.search_terms_count
      );
      updateSessionData({ search_terms: searchTerms });
      toast({
        title: 'Search Terms Generated',
        description: `Generated ${searchTerms.length} search terms`,
      });
    } catch (error) {
      console.error('Error generating search terms:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate search terms',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAddManualTerm = () => {
    if (manualTerm.trim() && sessionData.search_terms.length < 5) {
      updateSessionData({
        search_terms: [...sessionData.search_terms, manualTerm.trim()],
      });
      setManualTerm('');
    }
  };

  const handleRemoveTerm = (index: number) => {
    const newTerms = sessionData.search_terms.filter((_, i) => i !== index);
    updateSessionData({ search_terms: newTerms });
  };

  const handleUpdateTerm = (index: number, value: string) => {
    const newTerms = [...sessionData.search_terms];
    newTerms[index] = value;
    updateSessionData({ search_terms: newTerms });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Generate Search Terms
        </h3>
        <p className="text-sm text-muted-foreground">
          Generate 2-5 search terms that will be used to analyze competitor rankings
        </p>
      </div>

      <div className="space-y-4">
        {/* Keywords Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-xs">Based on these keywords:</Label>
          <div className="flex flex-wrap gap-1 mt-2">
            {sessionData.keywords.slice(0, 10).map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
            {sessionData.keywords.length > 10 && (
              <Badge variant="outline" className="text-xs">
                +{sessionData.keywords.length - 10} more
              </Badge>
            )}
          </div>
        </div>

        {/* Search Terms Count */}
        <div className="space-y-2">
          <Label>Number of Search Terms: {sessionData.search_terms_count}</Label>
          <Slider
            value={[sessionData.search_terms_count]}
            onValueChange={(value) => updateSessionData({ search_terms_count: value[0] })}
            min={2}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Choose between 2-5 search terms</p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateSearchTerms}
          disabled={generating || sessionData.keywords.length === 0}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Search Terms
            </>
          )}
        </Button>

        {/* Search Terms List */}
        {sessionData.search_terms.length > 0 && (
          <div className="space-y-3">
            <Label>Search Terms ({sessionData.search_terms.length}/5)</Label>
            <div className="space-y-2">
              {sessionData.search_terms.map((term, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <Input
                    value={term}
                    onChange={(e) => handleUpdateTerm(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveTerm(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Add */}
        {sessionData.search_terms.length < 5 && (
          <div className="space-y-2">
            <Label>Or Add Manually</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a search term..."
                value={manualTerm}
                onChange={(e) => setManualTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddManualTerm()}
              />
              <Button
                onClick={handleAddManualTerm}
                disabled={!manualTerm.trim() || sessionData.search_terms.length >= 5}
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAuditStep3SearchTerms;
