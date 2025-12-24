import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SuggestedTopicsModal from './SuggestedTopicsModal';

interface TopicResearch {
  id: string;
  keywords: string[];
  location: string;
  language: string;
  topics_number: number;
  status: string;
  created_at: string;
}

interface TopicResearchHistoryTableProps {
  brandId: string;
  brandName: string;
  userId: string;
  onTopicsSelected?: () => void;
}

export const TopicResearchHistoryTable = ({ brandId, brandName, userId, onTopicsSelected }: TopicResearchHistoryTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedResearchId, setSelectedResearchId] = useState<string | null>(null);

  const { data: researchHistory = [], isLoading } = useQuery<TopicResearch[]>({
    queryKey: ['topicResearchHistory', brandId, userId],
    queryFn: async () => {
      if (!brandId || !userId) return [];
      
      const { data, error } = await supabase
        .from('topic_research_history')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching topic research history:', error);
        throw error;
      }
      
      // Cleanup: Remove orphaned pending entries older than 5 minutes that have a completed duplicate
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const pendingEntries = data?.filter(r => 
        r.status === 'pending' && 
        new Date(r.created_at) < new Date(fiveMinutesAgo)
      ) || [];
      
      for (const pending of pendingEntries) {
        // Check if there's a completed entry with same keywords/location/language
        const hasDuplicate = data?.some(r => 
          r.id !== pending.id &&
          r.status === 'completed' &&
          JSON.stringify(r.keywords) === JSON.stringify(pending.keywords) &&
          r.location === pending.location &&
          r.language === pending.language &&
          Math.abs(new Date(r.created_at).getTime() - new Date(pending.created_at).getTime()) < 10 * 60 * 1000 // Within 10 minutes
        );
        
        if (hasDuplicate) {
          console.log('Removing orphaned pending entry:', pending.id);
          await supabase.from('topic_research_history').delete().eq('id', pending.id);
        }
      }
      
      // Return data without the orphaned entries
      return data?.filter(r => 
        !(r.status === 'pending' && 
          new Date(r.created_at) < new Date(fiveMinutesAgo) &&
          data.some(other => 
            other.id !== r.id &&
            other.status === 'completed' &&
            JSON.stringify(other.keywords) === JSON.stringify(r.keywords) &&
            other.location === r.location &&
            other.language === r.language &&
            Math.abs(new Date(other.created_at).getTime() - new Date(r.created_at).getTime()) < 10 * 60 * 1000
          ))
      ) || [];
    },
    enabled: !!brandId && !!userId,
    refetchInterval: (query) => {
      // Auto-refresh every 5 seconds if there are any pending research items
      const hasPending = query.state.data?.some(r => r.status === 'pending');
      return hasPending ? 3000 : false;
    }
  });

  const deleteResearchMutation = useMutation({
    mutationFn: async (researchId: string) => {
      const { error } = await supabase
        .from('topic_research_history')
        .delete()
        .eq('id', researchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicResearchHistory'] });
      toast({
        title: "Research Deleted",
        description: "Topic research has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete research",
        variant: "destructive",
      });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'error':
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleViewTopics = (researchId: string) => {
    setSelectedResearchId(researchId);
    setViewModalOpen(true);
  };

  const handleDeleteResearch = (researchId: string) => {
    if (confirm('Are you sure you want to delete this research? This will also delete all suggested topics.')) {
      deleteResearchMutation.mutate(researchId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Topics Research</CardTitle>
          <CardDescription>
            History of your topic research searches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading research history...</div>
          ) : researchHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No topic research found. Start by finding topics above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {researchHistory.map((research) => (
                  <TableRow key={research.id}>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(research.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {research.keywords.slice(0, 2).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {research.keywords.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{research.keywords.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{research.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{research.language}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(research.status)}>
                        {research.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewTopics(research.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteResearch(research.id)}
                          disabled={deleteResearchMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedResearchId && (
        <SuggestedTopicsModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          researchId={selectedResearchId}
          brandId={brandId}
          userId={userId}
          brandName={brandName}
          onTopicsSelected={onTopicsSelected}
        />
      )}
    </>
  );
};

export default TopicResearchHistoryTable;