import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TopicIdea {
  id: string;
  title: string;
  keywords?: string[];
  search_intents?: string[];
  estimated_word_count?: number;
  search_volume?: number;
  created_at: string;
  updated_at?: string;
}

interface CampaignTopicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  campaignDate: string;
  topicsCount: number;
  campaignId?: string;
}

const CampaignTopicsModal: React.FC<CampaignTopicsModalProps> = ({
  isOpen,
  onClose,
  brandId,
  campaignDate,
  topicsCount,
  campaignId,
}) => {
  const [topics, setTopics] = useState<TopicIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  

  useEffect(() => {
    if (isOpen && brandId && (campaignDate || campaignId)) {
      fetchTopics();
    }
  }, [isOpen, brandId, campaignDate, campaignId]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('seo_topic_ideas')
        .select(`
          id,
          title,
          keywords,
          search_intents,
          estimated_word_count,
          search_volume,
          created_at,
          updated_at
        `)
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      } else if (campaignDate) {
        // Match topics created on the same day
        const start = new Date(campaignDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        query = query
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      toast.error('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  const getIntentColor = (intent?: string) => {
    switch (intent?.toLowerCase()) {
      case 'informational':
        return 'bg-blue-100 text-blue-800';
      case 'navigational':
        return 'bg-green-100 text-green-800';
      case 'commercial':
        return 'bg-yellow-100 text-yellow-800';
      case 'transactional':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(topics.map(t => t.id));
    } else {
      setSelectedTopicIds([]);
    }
  };

  const handleSelectTopic = (topicId: string, checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(prev => [...prev, topicId]);
    } else {
      setSelectedTopicIds(prev => prev.filter(id => id !== topicId));
    }
  };

  const allSelected = topics.length > 0 && selectedTopicIds.length === topics.length;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Campaign Topics</DialogTitle>
          <DialogDescription>
            Blog posts for campaign from {new Date(campaignDate).toLocaleDateString()} ({topicsCount} topics)
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <ScrollArea className="h-[600px] w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading topics...</span>
            </div>
          ) : topics.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="min-w-[250px]">Topic</TableHead>
                  <TableHead className="min-w-[200px]">Keywords</TableHead>
                  <TableHead className="w-[120px]">Intent</TableHead>
                  <TableHead className="w-[150px]">Word Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTopicIds.includes(topic.id)}
                        onCheckedChange={(checked) => handleSelectTopic(topic.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{topic.title}</div>
                    </TableCell>
                    <TableCell>
                      {topic.keywords && topic.keywords.length > 0 ? (
                        <div className="space-y-1">
                          {topic.keywords[0] && (
                            <div>
                              <span className="text-xs text-muted-foreground">Primary:</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                                  {topic.keywords[0]}
                                </Badge>
                              </div>
                            </div>
                          )}
                          {topic.keywords.length > 1 && (
                            <div>
                              <span className="text-xs text-muted-foreground">Secondary:</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {topic.keywords.slice(1, 3).map((keyword, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                                {topic.keywords.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{topic.keywords.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {topic.search_intents && topic.search_intents.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {topic.search_intents.map((intent, idx) => (
                            <Badge key={idx} variant="secondary" className={getIntentColor(intent)}>
                              {intent}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {topic.estimated_word_count ? `${topic.estimated_word_count} words` : 'N/A'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No topics found for this campaign.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignTopicsModal;