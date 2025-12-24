import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, Info, Briefcase, ShoppingCart, Compass } from 'lucide-react';
import { TopicBriefModal } from './quick-setup/TopicBriefModal';

export interface TopicBriefItem {
  title: string;
  search_term?: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string;
  difficulty?: number;
  opportunity_score?: number;
  target_word_count: number;
  estimated_word_count?: number;
  content_angle: string;
  outline: string[];
  matched_backlinks?: Array<{ url: string; title: string; keyword: string; type: 'internal' | 'external' }>;
  matched_sources?: Array<{
    url: string;
    title: string;
    insights?: any;
    citations?: Array<{ text: string; url: string }>;
  }>;
  source_citations?: Array<{ text: string; url: string }>;
  keyword_focus?: string | string[];
}

interface TopicBriefTableProps {
  topics: TopicBriefItem[];
  intentAnalysis?: any[];
  groupBySearchTerm?: boolean;
  showCheckboxes?: boolean;
  onTopicSelect?: (index: number) => void;
  selectedTopics?: boolean[];
  websiteUrl?: string;
  targetCountry?: string;
  language?: string;
  brandName?: string;
  brandDescription?: string;
  targetAudience?: string;
  keySellingPoints?: string[];
  writtenTopicIndices?: number[];
}

const getIntentIcon = (intent: string) => {
  const intentLower = intent.toLowerCase();
  switch (intentLower) {
    case 'informational':
      return <Info className="h-4 w-4" />;
    case 'commercial':
      return <Briefcase className="h-4 w-4" />;
    case 'transactional':
      return <ShoppingCart className="h-4 w-4" />;
    case 'navigational':
      return <Compass className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getIntentColor = (intent: string) => {
  const intentLower = intent.toLowerCase();
  switch (intentLower) {
    case 'informational':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    case 'commercial':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    case 'transactional':
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    case 'navigational':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  }
};

export const TopicBriefTable = ({
  topics,
  intentAnalysis,
  groupBySearchTerm = false,
  showCheckboxes = false,
  onTopicSelect,
  selectedTopics,
  websiteUrl,
  targetCountry,
  language,
  brandName,
  brandDescription,
  targetAudience,
  keySellingPoints,
  writtenTopicIndices = [],
}: TopicBriefTableProps) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicBriefItem | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [showBriefModal, setShowBriefModal] = useState(false);

  const handleViewBrief = (topic: TopicBriefItem, index: number) => {
    setSelectedTopic(topic);
    setSelectedTopicIndex(index);
    setShowBriefModal(true);
  };

  const getIntentAnalysis = (index: number) => {
    if (!intentAnalysis) return null;
    return intentAnalysis.find((a: any) => a.topic_index === index) || null;
  };

  const renderKeywordFocus = (topic: TopicBriefItem) => {
    // Handle both old format (keyword_focus string) and new format (primary + secondary)
    if (topic.keyword_focus) {
      const keywords = Array.isArray(topic.keyword_focus) 
        ? topic.keyword_focus 
        : [topic.keyword_focus];
      
      return (
        <div className="flex flex-wrap gap-1">
          {keywords.slice(0, 3).map((keyword, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {keywords.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{keywords.length - 3}
            </Badge>
          )}
        </div>
      );
    }

    // New format: primary_keyword + secondary_keywords
    const allKeywords = [topic.primary_keyword, ...topic.secondary_keywords];
    return (
      <div className="flex flex-wrap gap-1">
        <Badge variant="default" className="text-xs bg-primary">
          {topic.primary_keyword}
        </Badge>
        {topic.secondary_keywords.slice(0, 2).map((keyword, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {keyword}
          </Badge>
        ))}
        {topic.secondary_keywords.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{topic.secondary_keywords.length - 2}
          </Badge>
        )}
      </div>
    );
  };

  // Group topics by search term if needed
  const groupedTopics = groupBySearchTerm
    ? topics.reduce((acc, topic, index) => {
        const searchTerm = topic.search_term || 'Uncategorized';
        if (!acc[searchTerm]) {
          acc[searchTerm] = [];
        }
        acc[searchTerm].push({ ...topic, originalIndex: index });
        return acc;
      }, {} as Record<string, Array<TopicBriefItem & { originalIndex: number }>>)
    : { All: topics.map((topic, index) => ({ ...topic, originalIndex: index })) };

  return (
    <>
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {showCheckboxes && <TableHead className="w-12"></TableHead>}
                <TableHead>Topic</TableHead>
                <TableHead>Search Term</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead className="text-center">Brief</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(groupedTopics).map(([searchTerm, groupTopics]) => (
                <>
                  {groupTopics.map((topic) => (
                    <TableRow key={topic.originalIndex}>
                      {showCheckboxes && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedTopics?.[topic.originalIndex]}
                            onChange={() => onTopicSelect?.(topic.originalIndex)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="font-medium text-sm">{topic.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{topic.search_term || 'General Topic'}</div>
                      </TableCell>
                      <TableCell>
                        {renderKeywordFocus(topic)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getIntentColor(topic.search_intent)} flex items-center gap-1 w-fit`}
                        >
                          {getIntentIcon(topic.search_intent)}
                          <span className="capitalize">{topic.search_intent}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {writtenTopicIndices.includes(topic.originalIndex) ? (
                          <Badge variant="secondary" className="h-8">
                            Written
                          </Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewBrief(topic, topic.originalIndex)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Brief
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedTopic && (
        <TopicBriefModal
          open={showBriefModal}
          onOpenChange={setShowBriefModal}
          topic={{
            title: selectedTopic.title,
            primary_keyword: selectedTopic.primary_keyword,
            secondary_keywords: selectedTopic.secondary_keywords,
            search_intent: selectedTopic.search_intent,
            difficulty: selectedTopic.difficulty || 0,
            opportunity_score: selectedTopic.opportunity_score || 0,
            target_word_count: selectedTopic.target_word_count,
            content_angle: selectedTopic.content_angle,
            outline: selectedTopic.outline,
            matched_backlinks: selectedTopic.matched_backlinks,
            matched_sources: selectedTopic.matched_sources,
          }}
          intentAnalysis={selectedTopicIndex !== null ? getIntentAnalysis(selectedTopicIndex) : null}
          sources={selectedTopic.matched_sources || []}
          websiteUrl={websiteUrl}
          targetCountry={targetCountry}
          language={language}
          brandName={brandName}
          brandDescription={brandDescription}
          targetAudience={targetAudience}
          keySellingPoints={keySellingPoints}
        />
      )}
    </>
  );
};
