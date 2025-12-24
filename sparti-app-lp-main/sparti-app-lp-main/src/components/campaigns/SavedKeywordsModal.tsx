import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Loader2 } from 'lucide-react';

interface SavedKeywordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  onAddKeywords: (keywords: string[]) => void;
  currentKeywords: string[];
}

interface SavedKeyword {
  id: string;
  keyword: string;
  position: number | null;
  url: string | null;
  search_volume: number | null;
}

const SavedKeywordsModal: React.FC<SavedKeywordsModalProps> = ({
  open,
  onOpenChange,
  brandId,
  onAddKeywords,
  currentKeywords
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [savedKeywords, setSavedKeywords] = useState<SavedKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  // Load saved keywords when modal opens
  useEffect(() => {
    if (open && brandId && user?.id) {
      loadSavedKeywords();
    }
  }, [open, brandId, user?.id]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedKeywords([]);
      setSearchQuery('');
    }
  }, [open]);

  const loadSavedKeywords = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracked_keywords')
        .select('id, keyword, position, url, search_volume')
        .eq('brand_id', brandId)
        .eq('user_id', user?.id)
        .order('keyword', { ascending: true });

      if (error) {
        console.error('Error loading saved keywords:', error);
        toast({
          title: "Error",
          description: "Failed to load saved keywords",
          variant: "destructive",
        });
        return;
      }

      setSavedKeywords(data || []);
    } catch (error) {
      console.error('Error loading saved keywords:', error);
      toast({
        title: "Error",
        description: "Failed to load saved keywords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter keywords based on search query and exclude already added keywords
  const filteredKeywords = savedKeywords.filter(kw => {
    const matchesSearch = kw.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    const notAlreadyAdded = !currentKeywords.includes(kw.keyword);
    return matchesSearch && notAlreadyAdded;
  });

  const handleKeywordSelect = (keyword: string, selected: boolean) => {
    if (selected) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    } else {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    }
  };

  const handleSelectAll = () => {
    const allFilteredKeywords = filteredKeywords.map(kw => kw.keyword);
    setSelectedKeywords(allFilteredKeywords);
  };

  const handleDeselectAll = () => {
    setSelectedKeywords([]);
  };

  const handleAddSelected = () => {
    if (selectedKeywords.length > 0) {
      onAddKeywords(selectedKeywords);
      toast({
        title: "Keywords Added",
        description: `Added ${selectedKeywords.length} keyword${selectedKeywords.length > 1 ? 's' : ''} to the search form`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Saved Keywords
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search saved keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Selection Controls */}
          {filteredKeywords.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={selectedKeywords.length === filteredKeywords.length}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                  disabled={selectedKeywords.length === 0}
                >
                  Deselect All
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedKeywords.length} of {filteredKeywords.length} selected
              </div>
            </div>
          )}

          {/* Keywords List */}
          <Card className="max-h-[400px] overflow-y-auto">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Loading saved keywords...</span>
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {savedKeywords.length === 0 
                      ? "No saved keywords found. Track some keywords first to use this feature."
                      : searchQuery 
                        ? "No keywords match your search criteria."
                        : "All saved keywords are already added to the form."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedKeywords.includes(keyword.keyword)}
                          onCheckedChange={(checked) => 
                            handleKeywordSelect(keyword.keyword, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">{keyword.keyword}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {keyword.position && (
                              <Badge variant="secondary" className="text-xs">
                                Pos: {keyword.position}
                              </Badge>
                            )}
                            {keyword.search_volume && (
                              <Badge variant="outline" className="text-xs">
                                Vol: {keyword.search_volume.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddSelected}
              disabled={selectedKeywords.length === 0}
              className="min-w-[120px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Selected ({selectedKeywords.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedKeywordsModal;