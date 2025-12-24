import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, Edit, Trash2, PenTool } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import BulkArticleWriterModal from '@/components/campaigns/BulkArticleWriterModal';
import { SelectedTopic } from '@/contexts/ArticleGenerationContext';

interface Topic {
  id: string;
  title: string;
  content: string;
  status: string;
  meta_description?: string;
  keywords?: string[];
  created_at: string;
  updated_at: string;
  cms_published: boolean;
  cms_url?: string;
}

interface TopicsManagementTableProps {
  brandId: string;
  brandName: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-success text-success-foreground';
    case 'draft':
      return 'bg-muted text-muted-foreground';
    case 'scheduled':
      return 'bg-warning text-warning-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'scheduled':
      return 'Scheduled';
    default:
      return status;
  }
};

export const TopicsManagementTable = ({ brandId, brandName }: TopicsManagementTableProps) => {
  const { user } = useAuth();
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [showBulkWriter, setShowBulkWriter] = useState(false);

  const { data: topics = [], isLoading, refetch } = useQuery<Topic[]>({
    queryKey: ['topics', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!brandId
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleTopicToggle = (topicId: string) => {
    const newSelected = new Set(selectedTopicIds);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopicIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTopicIds.size === topics.length) {
      setSelectedTopicIds(new Set());
    } else {
      setSelectedTopicIds(new Set(topics.map(t => t.id)));
    }
  };

  const handleOpenBulkWriter = () => {
    setShowBulkWriter(true);
  };

  // Convert topics to SelectedTopic format for BulkArticleWriterModal
  const selectedTopicsForWriter: SelectedTopic[] = topics
    .filter(t => selectedTopicIds.has(t.id))
    .map(t => ({
      id: t.id,
      title: t.title,
      keywords: t.keywords || [],
      intent: 'informational',
      status: t.status,
      created_at: t.created_at
    }));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{brandName} - Topics Management</CardTitle>
              <CardDescription>
                Manage and publish content topics for your SEO strategy
              </CardDescription>
            </div>
            <Button onClick={handleOpenBulkWriter} className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              Write {selectedTopicIds.size > 0 ? `${selectedTopicIds.size} ` : ''}Article{selectedTopicIds.size !== 1 ? 's' : ''}
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading topics...</div>
        ) : topics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No topics found. Create your first topic to get started.
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <Checkbox
                checked={selectedTopicIds.size === topics.length && topics.length > 0}
                onCheckedChange={handleSelectAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select all ({selectedTopicIds.size}/{topics.length})
              </label>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Meta Description</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>CMS Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTopicIds.has(topic.id)}
                        onCheckedChange={() => handleTopicToggle(topic.id)}
                      />
                    </TableCell>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px]">
                      <div className="font-semibold">{truncateText(topic.title, 50)}</div>
                      {topic.content && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {truncateText(topic.content, 80)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(topic.status)}>
                      {getStatusLabel(topic.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[150px] text-sm text-muted-foreground">
                      {truncateText(topic.meta_description || '', 60)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords?.slice(0, 2).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {topic.keywords && topic.keywords.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{topic.keywords.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={topic.cms_published ? "default" : "secondary"}>
                        {topic.cms_published ? "Published" : "Not Published"}
                      </Badge>
                      {topic.cms_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-6 w-6 p-0"
                        >
                          <a 
                            href={topic.cms_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(topic.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </>
        )}
      </CardContent>
    </Card>

    {/* Bulk Article Writer Modal */}
    {user && (
      <BulkArticleWriterModal
        open={showBulkWriter}
        onOpenChange={setShowBulkWriter}
        brandId={brandId}
        brandName={brandName}
        userId={user.id}
        selectedTopics={selectedTopicsForWriter}
        hideTopicSelection={selectedTopicIds.size === 0}
        onGenerationComplete={() => {
          setShowBulkWriter(false);
          setSelectedTopicIds(new Set());
          refetch();
        }}
      />
    )}
    </>
  );
};

export default TopicsManagementTable;