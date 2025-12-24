import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BacklinksTopicsTableProps {
  topics: any[];
  internalLinks: any[];
  onGenerate: (topicsWithLinks: any[]) => void;
  brandId: string;
}

export const BacklinksTopicsTable = ({
  topics,
  internalLinks,
  onGenerate,
  brandId,
}: BacklinksTopicsTableProps) => {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [topicLinks, setTopicLinks] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Pre-populate suggested links
  useState(() => {
    const initialLinks: Record<string, string> = {};
    topics.forEach(topic => {
      if (topic.suggested_internal_link_id) {
        initialLinks[topic.id] = topic.suggested_internal_link_id;
      }
    });
    setTopicLinks(initialLinks);
  });

  const handleToggleTopic = (topicId: string, checked: boolean) => {
    const newSelected = new Set(selectedTopics);
    if (checked) {
      newSelected.add(topicId);
    } else {
      newSelected.delete(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTopics.size === topics.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(topics.map(t => t.id)));
    }
  };

  const handleLinkChange = (topicId: string, linkId: string) => {
    setTopicLinks(prev => ({
      ...prev,
      [topicId]: linkId,
    }));
  };

  const handleGenerateBacklinks = async () => {
    const selectedTopicsArray = topics.filter(t => selectedTopics.has(t.id));
    
    // Validate that all selected topics have internal links assigned
    const missingLinks = selectedTopicsArray.filter(t => !topicLinks[t.id]);
    if (missingLinks.length > 0) {
      toast({
        title: 'Missing Internal Links',
        description: 'Please assign internal links to all selected topics',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Save selected topics to database
      const selectedTopicsData = selectedTopicsArray.map(topic => ({
        user_id: user.id,
        brand_id: brandId,
        suggested_topic_id: topic.id,
        assigned_internal_link_id: topicLinks[topic.id],
        title: topic.title,
        keywords: topic.keywords || [],
        keyword_focus: topic.keyword_focus,
        status: 'selected'
      }));

      const { error: insertError } = await supabase
        .from('backlink_selected_topics')
        .insert(selectedTopicsData);

      if (insertError) throw insertError;

      // Mark suggested topics as selected
      const { error: updateError } = await supabase
        .from('backlink_suggested_topics')
        .update({ is_selected: true })
        .in('id', selectedTopicsArray.map(t => t.id));

      if (updateError) throw updateError;

      const topicsWithLinks = selectedTopicsArray.map(topic => ({
        ...topic,
        internalLinkId: topicLinks[topic.id],
        internalLink: internalLinks.find(l => l.id === topicLinks[topic.id]),
      }));

      onGenerate(topicsWithLinks);

      toast({
        title: 'Topics Saved',
        description: `${selectedTopicsArray.length} topics saved and ready for article generation`,
      });
    } catch (error) {
      console.error('Error saving selected topics:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Failed to save selected topics',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Generated Topics ({selectedTopics.size} selected)
        </h3>
        <Button
          onClick={handleGenerateBacklinks}
          disabled={selectedTopics.size === 0 || isGenerating}
        >
          {isGenerating ? 'Saving...' : 'Generate Backlinks'}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedTopics.size === topics.length && topics.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Keyword Focus</TableHead>
              <TableHead>Internal Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No topics generated yet. Click "Generate Backlink Topics" above.
                </TableCell>
              </TableRow>
            ) : (
              topics.map((topic) => (
                <TableRow key={topic.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTopics.has(topic.id)}
                      onCheckedChange={(checked) => handleToggleTopic(topic.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{topic.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{topic.keyword_focus || topic.keywords?.[0]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={topicLinks[topic.id] || ''}
                      onValueChange={(value) => handleLinkChange(topic.id, value)}
                    >
                      <SelectTrigger className="w-[250px]">
                        <SelectValue placeholder="Select internal link" />
                      </SelectTrigger>
                      <SelectContent>
                        {internalLinks.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No internal links available
                          </div>
                        ) : (
                          internalLinks.map((link) => (
                            <SelectItem key={link.id} value={link.id}>
                              <div className="flex items-center gap-2">
                                <Link2 className="h-3 w-3" />
                                <span className="truncate">{link.title || link.url}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
