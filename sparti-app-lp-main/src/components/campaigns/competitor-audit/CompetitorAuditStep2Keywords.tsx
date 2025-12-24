import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, X } from 'lucide-react';
import { useCompetitorAudit } from '@/contexts/CompetitorAuditContext';

const CompetitorAuditStep2Keywords = () => {
  const { sessionData, updateSessionData } = useCompetitorAudit();
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim()) {
      const newKeywords = [...sessionData.keywords, keywordInput.trim()];
      updateSessionData({ keywords: newKeywords });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const newKeywords = sessionData.keywords.filter((_, i) => i !== index);
    updateSessionData({ keywords: newKeywords });
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
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          Select Keywords
        </h3>
        <p className="text-sm text-muted-foreground">
          Review and edit the keywords extracted from the website, or add your own
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="keyword-input">Add Keywords</Label>
          <div className="flex gap-2">
            <Input
              id="keyword-input"
              placeholder="Enter a keyword and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleAddKeyword} disabled={!keywordInput.trim()}>
              Add
            </Button>
          </div>
        </div>

        {sessionData.keywords.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Keywords ({sessionData.keywords.length})</Label>
            <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg min-h-[100px]">
              {sessionData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(index)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {sessionData.keywords.length === 0 && (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No keywords yet. Add keywords above to continue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetitorAuditStep2Keywords;
