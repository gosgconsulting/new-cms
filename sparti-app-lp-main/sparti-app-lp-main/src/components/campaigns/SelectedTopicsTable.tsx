import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, PenTool } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BulkArticleWriterModal from './BulkArticleWriterModal';
import SingleArticleWriterModal from './SingleArticleWriterModal';
import { TopicBriefTable, TopicBriefItem } from './TopicBriefTable';
import { useNavigate } from 'react-router-dom';

interface SelectedTopic {
  id: string;
  title: string;
  search_term?: string;
  keywords: string[];
  keyword_focus?: string[] | any; // JSONB array from database
  source?: string;
  search_intent?: string;
  status: string;
  created_at: string;
  internal_link_id?: string;
  backlink?: string;
  estimated_word_count?: number;
  content_angle?: string;
  outline?: string[];
  primary_keyword?: string;
  secondary_keywords?: string[];
  difficulty?: number;
  opportunity_score?: number;
  target_word_count?: number;
  matched_backlinks?: Array<{ url: string; title: string; keyword: string; type: 'internal' | 'external' }>;
  matched_sources?: Array<{
    url: string;
    title: string;
    insights?: any;
    citations?: Array<{ text: string; url: string }>;
  }>;
}

interface SelectedTopicsTableProps {
  brandId: string;
  brandName: string;
  userId: string;
  onTopicsSelectedForWriting?: (topicId?: string) => void;
  hideBulkCreation?: boolean;
}

export const SelectedTopicsTable = ({ brandId, brandName, userId, onTopicsSelectedForWriting, hideBulkCreation = false }: SelectedTopicsTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bulkWriterModalOpen, setBulkWriterModalOpen] = useState(false);
  const [singleWriterModalOpen, setSingleWriterModalOpen] = useState(false);
  const [selectedTopicForWriting, setSelectedTopicForWriting] = useState<SelectedTopic | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [selectedBriefTopic, setSelectedBriefTopic] = useState<SelectedTopic | null>(null);
  const [manualTopicTitle, setManualTopicTitle] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const { data: selectedTopics = [], isLoading } = useQuery<SelectedTopic[]>({
    queryKey: ['selectedTopics', brandId, userId],
    queryFn: async () => {
      if (!brandId || !userId) return [];
      
      const { data, error } = await supabase
        .from('selected_topics')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', userId)
        .neq('status', 'generating') // Hide topics that are being generated
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching selected topics:', error);
        throw error;
      }
      
      // Filter out topics with empty/null titles and ensure all fields are present
      const validTopics = (data || []).filter(topic => {
        if (!topic.title || topic.title.trim() === '') {
          console.warn('Found topic with empty title:', topic.id);
          return false;
        }
        return true;
      }).map(topic => ({
        ...topic,
        // Ensure backward compatibility with old data
        primary_keyword: topic.primary_keyword || (Array.isArray(topic.keyword_focus) ? topic.keyword_focus[0] : topic.keyword_focus) || '',
        secondary_keywords: topic.secondary_keywords || (Array.isArray(topic.keyword_focus) ? topic.keyword_focus.slice(1) : []),
        difficulty: topic.difficulty ?? 5,
        opportunity_score: topic.opportunity_score ?? 0,
        target_word_count: topic.target_word_count || topic.estimated_word_count,
        matched_backlinks: topic.matched_backlinks || [],
        matched_sources: topic.matched_sources || [],
      }));
      
      return validTopics;
    },
    enabled: !!brandId && !!userId
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ topicId, updates }: { topicId: string; updates: Partial<SelectedTopic> }) => {
      const { error } = await supabase
        .from('selected_topics')
        .update(updates)
        .eq('id', topicId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
      toast({
        title: "Topic Updated",
        description: "Topic has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update topic",
        variant: "destructive",
      });
    }
  });

  const addManualTopicMutation = useMutation({
    mutationFn: async () => {
      const trimmedInput = manualTopicTitle.trim();
      if (!trimmedInput) throw new Error('Topic data is required');
      
      // Try to parse as HTML table first
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmedInput, 'text/html');
      const table = doc.querySelector('table');
      
      let topicsToInsert = [];
      
      if (table) {
        // Parse HTML table (from Excel paste)
        const rows = Array.from(table.querySelectorAll('tr'));
        
        topicsToInsert = rows.map((row, rowIndex) => {
          const cells = Array.from(row.querySelectorAll('td, th'));
          if (cells.length === 0) return null;
          
          // Column 1: Topic title (required) - strip HTML tags by using textContent
          const title = cells[0]?.textContent?.trim() || '';
          if (!title || title.toLowerCase() === 'topic') return null; // Skip header rows
          
          let keyword_focus = null;
          let backlink = null;
          
          // Column 2: Keyword Focus (can be comma-separated)
          if (cells.length >= 2 && cells[1]?.textContent?.trim()) {
            const keywordText = cells[1].textContent.trim();
            if (keywordText.toLowerCase() !== 'keyword focus') { // Skip if it's a header
              const keywords = keywordText.split(',').map(k => k.trim()).filter(k => k.length > 0).slice(0, 3);
              keyword_focus = keywords.length > 0 ? keywords : null;
            }
          }
          
          // Column 3: Backlink URL
          if (cells.length >= 3 && cells[2]) {
            const cell = cells[2];
            // Try to extract href from anchor tag first
            const anchor = cell.querySelector('a');
            if (anchor && anchor.href) {
              backlink = anchor.href;
            } else {
              // Otherwise use text content
              const urlText = cell.textContent?.trim();
              if (urlText && urlText.toLowerCase() !== 'backlink' && urlText.toLowerCase() !== 'links') {
                // Basic URL validation and sanitization
                backlink = urlText;
                // Add https:// if no protocol
                if (backlink && !backlink.match(/^https?:\/\//i)) {
                  backlink = 'https://' + backlink;
                }
              }
            }
            
            // Validate URL format
            if (backlink) {
              try {
                new URL(backlink);
              } catch {
                // Invalid URL, skip it
                backlink = null;
              }
            }
          }
          
          return {
            title,
            keywords: [],
            keyword_focus,
            backlink,
            user_id: userId,
            brand_id: brandId,
            status: 'manual'
          };
        }).filter(t => t !== null);
      } else {
        // Fallback to line-by-line parsing (tab-separated or plain text)
        const lines = trimmedInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length === 0) throw new Error('At least one topic is required');
        
        topicsToInsert = lines.map((line) => {
          const parts = line.split('\t').map(p => p.trim());
          
          let title = '';
          let keyword_focus = null;
          let backlink = null;
          
          if (parts.length >= 1) {
            // Strip HTML tags from title by parsing and extracting text content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = parts[0];
            title = tempDiv.textContent?.trim() || parts[0].trim();
            
            if (parts.length >= 2 && parts[1]) {
              const keywords = parts[1].split(',').map(k => k.trim()).filter(k => k.length > 0).slice(0, 3);
              keyword_focus = keywords.length > 0 ? keywords : null;
            }
            
            // Column 3: Backlink URL
            if (parts.length >= 3 && parts[2]) {
              backlink = parts[2];
              // Add https:// if no protocol
              if (backlink && !backlink.match(/^https?:\/\//i)) {
                backlink = 'https://' + backlink;
              }
              
              // Validate URL format
              try {
                new URL(backlink);
              } catch {
                backlink = null;
              }
            }
          } else {
            title = line;
          }
          
          if (!title) throw new Error('Topic title is required');
          
          return {
            title,
            keywords: [],
            keyword_focus,
            backlink,
            user_id: userId,
            brand_id: brandId,
            status: 'manual'
          };
        });
      }
      
      if (topicsToInsert.length === 0) throw new Error('No valid topics found');
      
      const { error } = await supabase
        .from('selected_topics')
        .insert(topicsToInsert);
      
      if (error) {
        console.error('Error adding manual topic(s):', error);
        throw error;
      }
      
      return topicsToInsert.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
      setManualTopicTitle('');
      toast({
        title: count === 1 ? "Topic Added" : "Topics Added",
        description: count === 1 
          ? "Manual topic has been added successfully." 
          : `${count} topics have been added successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Add Failed",
        description: error instanceof Error ? error.message : "Failed to add topic",
        variant: "destructive",
      });
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (topicId: string) => {
      // Get the topic details first to find the suggested_topic_id
      const { data: topicData } = await supabase
        .from('selected_topics')
        .select('suggested_topic_id')
        .eq('id', topicId)
        .single();

      // Delete from selected_topics
      const { error } = await supabase
        .from('selected_topics')
        .delete()
        .eq('id', topicId);
      
      if (error) throw error;

      // If there was a linked suggested topic, mark it as not selected
      if (topicData?.suggested_topic_id) {
        await supabase
          .from('suggested_topics')
          .update({ is_selected: false })
          .eq('id', topicData.suggested_topic_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
      toast({
        title: "Topic Deleted",
        description: "Selected topic has been deleted successfully.",
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

  const bulkDeleteTopicsMutation = useMutation({
    mutationFn: async (topicIds: string[]) => {
      // Get the topic details first to find suggested_topic_ids
      const { data: topicsData } = await supabase
        .from('selected_topics')
        .select('id, suggested_topic_id')
        .in('id', topicIds);

      // Delete from selected_topics
      const { error } = await supabase
        .from('selected_topics')
        .delete()
        .in('id', topicIds);
      
      if (error) throw error;

      // Mark all linked suggested topics as not selected
      const suggestedTopicIds = topicsData?.filter(t => t.suggested_topic_id).map(t => t.suggested_topic_id) || [];
      if (suggestedTopicIds.length > 0) {
        await supabase
          .from('suggested_topics')
          .update({ is_selected: false })
          .in('id', suggestedTopicIds);
      }
    },
    onSuccess: (_, topicIds) => {
      queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
      setSelectedTopicIds([]);
      toast({
        title: "Topics Deleted",
        description: `${topicIds.length} topic(s) have been deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete topics",
        variant: "destructive",
      });
    }
  });

  // Convert to TopicBriefItem format
  const briefTopics: TopicBriefItem[] = useMemo(() => {
    return selectedTopics.map(topic => ({
      title: topic.title,
      search_term: topic.search_term,
      primary_keyword: topic.primary_keyword || (Array.isArray(topic.keyword_focus) ? topic.keyword_focus[0] : topic.keyword_focus) || '',
      secondary_keywords: topic.secondary_keywords || (Array.isArray(topic.keyword_focus) ? topic.keyword_focus.slice(1) : []),
      search_intent: topic.search_intent || 'informational',
      difficulty: topic.difficulty,
      opportunity_score: topic.opportunity_score,
      target_word_count: topic.target_word_count || topic.estimated_word_count || 0,
      estimated_word_count: topic.estimated_word_count,
      content_angle: topic.content_angle || '',
      outline: topic.outline || [],
      matched_backlinks: topic.matched_backlinks,
      matched_sources: topic.matched_sources,
      keyword_focus: topic.keyword_focus,
    }));
  }, [selectedTopics]);

  const navigate = useNavigate();

  const handleSelectTopic = (topicId: string, checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(prev => [...prev, topicId]);
    } else {
      setSelectedTopicIds(prev => prev.filter(id => id !== topicId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTopicIds(selectedTopics.map(t => t.id));
    } else {
      setSelectedTopicIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedTopicIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedTopicIds.length} selected topic(s)?`)) {
      bulkDeleteTopicsMutation.mutate(selectedTopicIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedTopicIds([]);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{brandName} - Campaign Topics</CardTitle>
              <CardDescription>
                Topics generated from the Quick Setup for this campaign
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedTopicIds.length > 0 && (
                <>
                  <Button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteTopicsMutation.isPending}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedTopicIds.length})
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </>
              )}
              {!hideBulkCreation && (
                <Button
                  onClick={() => onTopicsSelectedForWriting ? onTopicsSelectedForWriting() : setBulkWriterModalOpen(true)}
                  disabled={selectedTopics.length === 0}
                  size="sm"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Bulk Article Creation
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading topics...
            </div>
          ) : selectedTopics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No topics yet. Start by adding topics from the research tool.</p>
              <Button variant="outline" onClick={() => navigate(`/app/copilot/seo/topics?brand=${brandId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Topic
              </Button>
            </div>
          ) : (
            <TopicBriefTable
              topics={briefTopics}
              groupBySearchTerm={true}
              showCheckboxes={true}
              onTopicSelect={(index) => handleSelectTopic(selectedTopics[index].id, !selectedTopicIds.includes(selectedTopics[index].id))}
              selectedTopics={selectedTopics.map(t => selectedTopicIds.includes(t.id))}
            />
          )}
        </CardContent>
      </Card>

      {!onTopicsSelectedForWriting && (
        <>
          <BulkArticleWriterModal
            open={bulkWriterModalOpen}
            onOpenChange={setBulkWriterModalOpen}
            brandId={brandId}
            brandName={brandName}
            userId={userId}
            selectedTopics={selectedTopics}
          />

          {selectedTopicForWriting && (
            <SingleArticleWriterModal
              open={singleWriterModalOpen}
              onOpenChange={setSingleWriterModalOpen}
              topic={selectedTopicForWriting}
              brandId={brandId}
              brandName={brandName}
              userId={userId}
              onGenerationComplete={() => {
                queryClient.invalidateQueries({ queryKey: ['selectedTopics'] });
                setSingleWriterModalOpen(false);
                setSelectedTopicForWriting(null);
              }}
            />
          )}
        </>
      )}
    </>
  );
};

export default SelectedTopicsTable;