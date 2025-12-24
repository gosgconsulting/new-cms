import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedKeyword {
  id: string;
  keyword: string;
  search_volume?: number;
  target_country?: string;
  keyword_difficulty?: number;
  cpc?: number;
  competition_level?: string;
}

interface SavedKeywordsTableProps {
  brandId: string;
  onUseKeywords: (keywords: SavedKeyword[]) => void;
}

export function SavedKeywordsTable({ brandId, onUseKeywords }: SavedKeywordsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { toast } = useToast();

  const { data: savedKeywords = [], isLoading, refetch } = useQuery({
    queryKey: ["saved-keywords", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from("seo_tracked_keywords")
        .select("*")
        .eq("brand_id", brandId)
        .order("keyword", { ascending: true });

      if (error) throw error;
      return data as SavedKeyword[];
    },
    enabled: !!brandId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  const filteredKeywords = savedKeywords.filter((kw) =>
    kw.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedKeywords.size === filteredKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(filteredKeywords.map((kw) => kw.id)));
    }
  };

  const handleToggleKeyword = (id: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedKeywords(newSelected);
  };

  const handleRowClick = (id: string) => {
    handleToggleKeyword(id);
  };

  const handleUseSelected = () => {
    const selected = filteredKeywords.filter((kw) => selectedKeywords.has(kw.id));
    onUseKeywords(selected);
  };

  // Get keywords that need data (missing search volume)
  const keywordsNeedingData = savedKeywords.filter((kw) => !kw.search_volume);

  const handleGetData = async () => {
    if (keywordsNeedingData.length === 0) {
      toast({
        title: "All Keywords Have Data",
        description: "All saved keywords already have search volume data",
      });
      return;
    }

    setIsLoadingData(true);
    try {
      // Group keywords by target country to batch requests efficiently
      const keywordsByCountry = keywordsNeedingData.reduce((acc, kw) => {
        const country = kw.target_country || 'United States';
        if (!acc[country]) acc[country] = [];
        acc[country].push(kw);
        return acc;
      }, {} as Record<string, SavedKeyword[]>);

      let totalUpdated = 0;

      // Fetch data for each country group
      for (const [country, keywords] of Object.entries(keywordsByCountry)) {
        const keywordList = keywords.map(kw => kw.keyword);

        const response = await supabase.functions.invoke('keyword-research', {
          body: {
            keywords: keywordList,
            country: country,
            brand_id: brandId
          }
        });

        if (response.error) {
          console.error(`Error fetching data for ${country}:`, response.error);
          toast({
            title: "Fetch Error",
            description: `Failed to fetch data for ${country}: ${response.error.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Check if response has data
        if (!response.data) {
          console.error(`No data returned for ${country}`);
          continue;
        }

        // Handle different response structures
        let keywordResults: any[] = [];
        
        if (response.data.success && Array.isArray(response.data.data)) {
          keywordResults = response.data.data;
        } else if (Array.isArray(response.data)) {
          keywordResults = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          keywordResults = response.data.results;
        } else {
          console.error(`Invalid response structure for ${country}:`, response.data);
          toast({
            title: "Data Format Error",
            description: `Unexpected response format for ${country}`,
            variant: "destructive",
          });
          continue;
        }

        // Update the keywords in the database with the fetched metrics
        for (const result of keywordResults) {
          const keyword = keywords.find(kw => kw.keyword === result.keyword);
          if (keyword && result.search_volume !== undefined) {
            await supabase
              .from('seo_tracked_keywords')
              .update({
                search_volume: result.search_volume || 0,
                keyword_difficulty: result.keyword_difficulty || 0,
                cpc: result.cpc || 0,
                competition_level: result.competition_level || 'LOW',
              })
              .eq('id', keyword.id);
            totalUpdated++;
          }
        }
      }

      await refetch();

      if (totalUpdated > 0) {
        toast({
          title: "Data Fetched Successfully",
          description: `Updated metrics for ${totalUpdated} keyword${totalUpdated !== 1 ? 's' : ''}`,
        });
      } else {
        toast({
          title: "No Data Updated",
          description: "Could not fetch keyword data. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching keyword data:', error);
      toast({
        title: "Fetch Failed",
        description: error instanceof Error ? error.message : 'Failed to fetch keyword data',
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search saved keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={handleGetData}
          variant="outline"
          className="gap-2"
          disabled={keywordsNeedingData.length === 0 || isLoadingData}
        >
          {isLoadingData ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
            <>Get Data ({keywordsNeedingData.length})</>
          )}
        </Button>
        <Button
          onClick={handleUseSelected}
          disabled={selectedKeywords.size === 0}
          className="gap-2"
        >
          Use Selected ({selectedKeywords.size}) <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading saved keywords...
            </div>
          ) : filteredKeywords.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchQuery ? "No keywords found matching your search." : "No saved keywords yet. Start by discovering new keywords."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedKeywords.size === filteredKeywords.length && filteredKeywords.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead>Country</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.map((keyword) => (
                  <TableRow 
                    key={keyword.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(keyword.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedKeywords.has(keyword.id)}
                        onCheckedChange={() => handleToggleKeyword(keyword.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{keyword.keyword}</TableCell>
                    <TableCell className="text-right">
                      {keyword.search_volume ? keyword.search_volume.toLocaleString() : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {keyword.target_country || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
