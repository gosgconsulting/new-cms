import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Trash2, Eye, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SourceViewerModal from './SourceViewerModal';
import EditTopicWithAIModal from './EditTopicWithAIModal';
import { TopicBriefModal } from './quick-setup/TopicBriefModal';
import { ExternalLink } from 'lucide-react';

interface SuggestedTopic {
  id: string;
  title: string;
  keywords: string[];
  keyword_focus?: string[] | string;
  source?: string;
  intent?: string;
  is_selected: boolean;
  research_id?: string;
  outline?: string[];
  word_count?: number;
  internal_links?: any[];
  sources?: any[];
}

interface SuggestedTopicsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  researchId: string;
  brandId: string;
  userId: string;
  brandName?: string;
  onTopicsSelected?: () => void;
}

const SuggestedTopicsModal = ({ open, onOpenChange, researchId, brandId, userId, brandName = 'Your Brand', onTopicsSelected }: SuggestedTopicsModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSourceTopic, setSelectedSourceTopic] = useState<SuggestedTopic | null>(null);
  const [sourceViewerOpen, setSourceViewerOpen] = useState(false);
  const [editTopicModalOpen, setEditTopicModalOpen] = useState(false);
  const [selectedTopicForEdit, setSelectedTopicForEdit] = useState<SuggestedTopic | null>(null);
  const [selectedTopicForDetails, setSelectedTopicForDetails] = useState<SuggestedTopic | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const { data: suggestedTopics = [], isLoading } = useQuery<SuggestedTopic[]>({
    queryKey: ['suggestedTopics', researchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggested_topics')
        .select('id, research_id, title, keywords, keyword_focus, source, intent, is_selected, outline, word_count, internal_links, sources, created_at')
        .eq('research_id', researchId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!researchId && open
  });

  // Query selected topics to check actual selection status
  const { data: selectedTopics = [] } = useQuery({
    queryKey: ['selectedTopics', brandId, userId],
    queryFn: async () => {
      if (!brandId || !userId) return [];
      
      const { data, error } = await supabase
        .from('selected_topics')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!brandId && !!userId && open
  });

  // Create a set of actually selected topic IDs for efficient lookup
  const actuallySelectedIds = new Set(
    selectedTopics.map(st => st.suggested_topic_id).filter(Boolean)
  );

  const selectTopicMutation = useMutation({
    mutationFn: async (topic: SuggestedTopic) => {
      // Validate topic has required fields
      if (!topic.title || topic.title.trim() === '') {
        throw new Error('Topic must have a title');
      }

      // First, mark the suggested topic as selected
      await supabase
        .from('suggested_topics')
        .update({ is_selected: true })
        .eq('id', topic.id);

      // Then, add to selected_topics table (with proper constraint)
      const { error } = await supabase
        .from('selected_topics')
        .upsert({
          user_id: userId,
          brand_id: brandId,
          suggested_topic_id: topic.id,
          title: topic.title.trim(),
          keywords: topic.keywords || [],
          keyword_focus: Array.isArray(topic.keyword_focus) 
            ? topic.keyword_focus 
            : (topic.keyword_focus ? [topic.keyword_focus.trim()] : null),
          source: topic.source,
          intent: topic.intent,
          status: 'selected'
        }, {
          onConflict: 'user_id,brand_id,suggested_topic_id',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('Error selecting topic:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestedTopics', researchId] });
      queryClient.invalidateQueries({ queryKey: ['selectedTopics', brandId, userId] });
      toast({
        title: "Topic Selected",
        description: "Topic has been added to your selected topics.",
      });
    },
    onError: (error) => {
      toast({
        title: "Selection Failed",
        description: error instanceof Error ? error.message : "Failed to select topic",
        variant: "destructive",
      });
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      const { error } = await supabase
        .from('suggested_topics')
        .delete()
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestedTopics', researchId] });
      queryClient.invalidateQueries({ queryKey: ['selectedTopics', brandId, userId] });
      toast({
        title: "Topic Deleted",
        description: "Suggested topic has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete topic",
        variant: "destructive",
      });
    }
  });

  const parseSourceTitle = (source?: string) => {
    if (!source) return 'Title';
    
    try {
      const parsed = JSON.parse(source);
      return parsed.title || source;
    } catch {
      // If JSON parsing fails, return the raw content
      return source;
    }
  };

  const handleSelectTopic = (topic: SuggestedTopic) => {
    // Check if topic is actually in selected_topics table
    const isActuallySelected = actuallySelectedIds.has(topic.id);
    
    if (isActuallySelected) {
      toast({
        title: "Already Selected",
        description: "This topic has already been selected.",
        variant: "destructive",
      });
      return;
    }
    selectTopicMutation.mutate(topic);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this suggested topic?')) {
      deleteTopicMutation.mutate(topicId);
    }
  };

  const handleSourceClick = (topic: SuggestedTopic) => {
    setSelectedSourceTopic(topic);
    setSourceViewerOpen(true);
  };

  const handleEditTopic = (topic: SuggestedTopic) => {
    setSelectedTopicForEdit(topic);
    setEditTopicModalOpen(true);
  };

  const handleViewDetails = (topic: SuggestedTopic) => {
    setSelectedTopicForDetails(topic);
    setDetailsModalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Suggested Topics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading suggested topics...</div>
          ) : suggestedTopics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Topics Found</h3>
                <p className="text-muted-foreground">
                  No suggested topics were found for this research. The research might still be processing.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Keywords Focus</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Brief</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestedTopics.map((topic) => {
                  const isActuallySelected = actuallySelectedIds.has(topic.id);
                  return (
                    <TableRow key={topic.id}>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <div className="font-medium">{topic.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {topic.keyword_focus && (Array.isArray(topic.keyword_focus) ? topic.keyword_focus.length > 0 : true) ? (
                            (Array.isArray(topic.keyword_focus) ? topic.keyword_focus : [topic.keyword_focus]).map((keyword, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No keywords</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {topic.word_count ? (
                          <span className="text-sm">~{topic.word_count.toLocaleString()}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(topic)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-primary hover:text-primary"
                            onClick={() => handleEditTopic(topic)}
                            title="Edit with AI"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={isActuallySelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSelectTopic(topic)}
                            disabled={isActuallySelected || selectTopicMutation.isPending}
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            {isActuallySelected ? 'Selected' : 'Select'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTopic(topic.id)}
                            disabled={deleteTopicMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-end gap-2">
            {actuallySelectedIds.size > 0 && onTopicsSelected ? (
              <Button onClick={() => {
                onOpenChange(false);
                onTopicsSelected();
              }}>
                Write
              </Button>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            )}
          </div>
        </div>

        <SourceViewerModal
          open={sourceViewerOpen}
          onOpenChange={setSourceViewerOpen}
          source={selectedSourceTopic?.source}
          topicTitle={selectedSourceTopic?.title}
        />

        <EditTopicWithAIModal
          open={editTopicModalOpen}
          onOpenChange={setEditTopicModalOpen}
          topic={selectedTopicForEdit}
          brandId={brandId}
          brandName={brandName}
          researchId={researchId}
        />

        <TopicBriefModal
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
          topic={selectedTopicForDetails ? {
            title: selectedTopicForDetails.title,
            primary_keyword: Array.isArray(selectedTopicForDetails.keyword_focus) 
              ? selectedTopicForDetails.keyword_focus[0] 
              : (selectedTopicForDetails.keyword_focus || selectedTopicForDetails.keywords?.[0] || ''),
            secondary_keywords: Array.isArray(selectedTopicForDetails.keyword_focus) 
              ? selectedTopicForDetails.keyword_focus.slice(1) 
              : (selectedTopicForDetails.keywords?.slice(1) || []),
            search_intent: selectedTopicForDetails.intent || 'informational',
            difficulty: 5,
            opportunity_score: 0,
            target_word_count: selectedTopicForDetails.word_count || 1400,
            content_angle: '',
            outline: selectedTopicForDetails.outline || [],
          } : null}
          intentAnalysis={null}
          sources={[]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SuggestedTopicsModal;