import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ArrowUpDown, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrackedKeyword {
  id: string;
  keyword: string;
  intent: string | null;
  search_volume: number | null;
  country: string | null;
  created_at: string;
}

interface UseTrackedKeywordsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  onKeywordSelected: (keyword: string) => void;
  currentKeywords?: string[];
  allAvailableKeywords?: string[];
  onKeywordsChange?: (keywords: string[]) => void;
}

const UseTrackedKeywordsModal: React.FC<UseTrackedKeywordsModalProps> = ({
  open,
  onOpenChange,
  brandId,
  onKeywordSelected,
  currentKeywords = [],
  allAvailableKeywords = [],
  onKeywordsChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'keyword' | 'search_volume'>('keyword');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(currentKeywords);

  // Update selected keywords when currentKeywords changes
  useEffect(() => {
    // Only update if the arrays are actually different
    if (JSON.stringify(currentKeywords) !== JSON.stringify(selectedKeywords)) {
      setSelectedKeywords(currentKeywords);
    }
  }, [currentKeywords]);

  // Fetch tracked keywords
  const { data: trackedKeywords = [], isLoading } = useQuery({
    queryKey: ['tracked-keywords', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_tracked_keywords')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TrackedKeyword[];
    },
    enabled: open && !!brandId,
  });

  // Combine all available keywords (AI-recommended + tracked)
  const allKeywords = useMemo(() => {
    const combinedSet = new Set<string>();
    
    // Add all available keywords from session
    allAvailableKeywords.forEach(kw => combinedSet.add(kw));
    
    // Add tracked keywords
    trackedKeywords.forEach(kw => combinedSet.add(kw.keyword));
    
    return Array.from(combinedSet).map(keyword => {
      const trackedData = trackedKeywords.find(tk => tk.keyword === keyword);
      return {
        keyword,
        intent: trackedData?.intent || null,
        search_volume: trackedData?.search_volume || null,
        country: trackedData?.country || null,
        id: trackedData?.id || keyword,
        created_at: trackedData?.created_at || ''
      };
    });
  }, [allAvailableKeywords, trackedKeywords]);

  // Intent colors mapping
  const getIntentColor = (intent: string | null) => {
    switch (intent?.toLowerCase()) {
      case 'commercial': return 'bg-green-100 text-green-800 border-green-200';
      case 'informational': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'navigational': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'transactional': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    let filtered = allKeywords.filter(keyword =>
      keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [allKeywords, searchQuery, sortField, sortDirection]);

  const handleSort = (field: 'keyword' | 'search_volume') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keyword)) {
        return prev.filter(k => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  const handleApply = () => {
    if (onKeywordsChange) {
      onKeywordsChange(selectedKeywords);
    }
    onOpenChange(false);
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '-';
    if (num === 0) return '-';
    return num.toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Select Keywords
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Keywords table */}
          <ScrollArea className="h-[400px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleSort('keyword')}
                  >
                    <div className="flex items-center gap-2">
                      Keyword
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-32">Intent</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-accent/50 w-32"
                    onClick={() => handleSort('search_volume')}
                  >
                    <div className="flex items-center gap-2">
                      Search Volume
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="w-24">Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : filteredKeywords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'No keywords found matching your search.' : 'No tracked keywords found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKeywords.map((keyword) => (
                    <TableRow 
                      key={keyword.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedKeywords.includes(keyword.keyword)
                          ? 'bg-primary/10 hover:bg-primary/15' 
                          : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleKeywordToggle(keyword.keyword)}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <div className={`w-4 h-4 rounded border ${
                            selectedKeywords.includes(keyword.keyword)
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          } flex items-center justify-center`}>
                            {selectedKeywords.includes(keyword.keyword) && (
                              <Check className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {keyword.keyword}
                      </TableCell>
                      <TableCell>
                        {keyword.intent ? (
                          <Badge variant="outline" className={getIntentColor(keyword.intent)}>
                            {keyword.intent}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatNumber(keyword.search_volume)}
                      </TableCell>
                      <TableCell>
                        {keyword.country || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredKeywords.length} keywords • {selectedKeywords.length} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={selectedKeywords.length === 0}
              >
                Apply Selection
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UseTrackedKeywordsModal;