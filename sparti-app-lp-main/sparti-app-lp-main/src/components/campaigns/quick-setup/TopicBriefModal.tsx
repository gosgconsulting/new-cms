import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TrendingUp, FileText, Link2, ExternalLink } from 'lucide-react';

interface Topic {
  title: string;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string; // Required - one of: informational, commercial, transactional, navigational
  difficulty: number;
  opportunity_score: number;
  target_word_count: number;
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
}

interface IntentAnalysis {
  topic_index: number;
  refined_intent: string;
  intent_confidence: number;
  backlink_potential: number;
  outreach_targets: string[];
  content_format_suggestions: string[];
  internal_linking_keywords: string[];
}

interface TopicBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: Topic | null;
  intentAnalysis?: IntentAnalysis | null;
  sources?: any[];
  websiteUrl?: string;
  targetCountry?: string;
  language?: string;
  brandName?: string;
  brandDescription?: string;
  targetAudience?: string;
  keySellingPoints?: string[];
}

export const TopicBriefModal = ({ 
  open, 
  onOpenChange, 
  topic,
  intentAnalysis,
  sources = [],
  websiteUrl,
  targetCountry,
  language,
  brandName,
  brandDescription,
  targetAudience,
  keySellingPoints
}: TopicBriefModalProps) => {
  if (!topic) return null;

  const getIntentColor = (intent: string | undefined) => {
    if (!intent) return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    
    switch (intent.toLowerCase()) {
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

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-600 dark:text-green-400';
    if (difficulty <= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl capitalize">{topic.title}</DialogTitle>
          {topic.content_angle && (
            <p className="text-sm text-muted-foreground">{topic.content_angle}</p>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="p-4 bg-muted/50">
                <h3 className="text-sm font-semibold mb-3">Campaign Information</h3>
                <div className="space-y-4">
                  {brandName && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Brand Name</p>
                      <p className="font-semibold text-sm">{brandName}</p>
                    </div>
                  )}
                  
                  {brandDescription && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Description</p>
                      <p className="text-sm">{brandDescription}</p>
                    </div>
                  )}
                  
                  {targetAudience && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Audience</p>
                      <p className="text-sm">{targetAudience}</p>
                    </div>
                  )}
                  
                  {keySellingPoints && keySellingPoints.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Key Selling Points</p>
                      <div className="flex flex-wrap gap-2">
                        {keySellingPoints.map((point, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{point}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    {websiteUrl && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Website</p>
                        <a 
                          href={websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {targetCountry && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Target Country</p>
                        <Badge variant="secondary" className="text-xs">{targetCountry}</Badge>
                      </div>
                    )}
                    {language && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Language</p>
                        <Badge variant="secondary" className="text-xs">{language}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Search Intent</span>
                    </div>
                    <Badge variant="outline" className={getIntentColor(topic.search_intent)}>
                      {topic.search_intent || 'N/A'}
                    </Badge>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>Metrics</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        <span className={getDifficultyColor(topic.difficulty)}>
                          Difficulty: {topic.difficulty}/10
                        </span>
                      </Badge>
                      <Badge variant="outline">
                        Opportunity: {topic.opportunity_score}/10
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Keywords Focus</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Primary Keyword</p>
                    <Badge variant="default" className="text-base px-3 py-1 bg-primary text-primary-foreground">
                      {topic.primary_keyword || 'Not specified'}
                    </Badge>
                  </div>
                  
                  {topic.secondary_keywords && topic.secondary_keywords.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Additional Keywords ({topic.secondary_keywords.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {topic.secondary_keywords.map((kw, i) => (
                          <Badge key={i} variant="secondary">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2">Target Word Count</h3>
                <p className="text-2xl font-bold text-primary">600-900 words</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended length for optimal SEO performance</p>
              </Card>
            </TabsContent>

            <TabsContent value="brief" className="space-y-4 mt-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Content Brief</h3>
                {topic.content_angle ? (
                  <p className="text-sm text-foreground leading-relaxed">
                    {topic.content_angle}
                  </p>
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">
                    This article will focus on <span className="font-medium">{topic.primary_keyword}</span> and provide comprehensive coverage of {topic.secondary_keywords.slice(0, 3).join(', ')}. 
                    The content is designed to address <span className="font-medium">{topic.search_intent}</span> search intent, 
                    delivering approximately {topic.target_word_count.toLocaleString()} words of valuable information for the target audience.
                    {topic.outline && topic.outline.length > 0 && (
                      <> The article will be structured around {topic.outline.length} main sections, ensuring thorough coverage of the topic.</>
                    )}
                  </p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="backlinks" className="space-y-4 mt-4">
              {/* Suggested Internal Links from Sitemap */}
              {topic.matched_backlinks?.some(b => b.type === 'internal') && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Suggested Internal Links (from sitemap)</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Strategic internal linking opportunities from your existing content
                  </p>
                  <div className="space-y-3">
                    {topic.matched_backlinks
                      .filter(backlink => backlink.type === 'internal')
                      .slice(0, 2)
                      .map((backlink, idx) => (
                        <div key={idx} className="border-l-2 border-primary pl-3 py-2 bg-primary/5 rounded-r">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default" className="text-xs">
                                  🔗 Internal
                                </Badge>
                                <p className="font-medium text-sm">{backlink.title}</p>
                              </div>
                              <p className="text-xs text-muted-foreground break-all">{backlink.url}</p>
                              <p className="text-xs text-primary mt-1">Keyword: {backlink.keyword}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* All Matched Backlinks */}
              {topic.matched_backlinks && topic.matched_backlinks.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3">
                    Matched Backlinks ({topic.matched_backlinks.length})
                  </h3>
                  <div className="space-y-3">
                    {topic.matched_backlinks.map((backlink, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 p-3 bg-muted/50 rounded-md">
                        <div className="flex-1 min-w-0">
                          <a
                            href={backlink.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary hover:underline block truncate"
                          >
                            {backlink.title}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {backlink.keyword}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${backlink.type === 'internal' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'}`}
                            >
                              {backlink.type === 'internal' ? '🔗 Internal' : '🌐 External'}
                            </Badge>
                          </div>
                        </div>
                        <a
                          href={backlink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
              
              {intentAnalysis ? (
                <>
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold">Backlink Potential</h3>
                      <Badge variant="outline">
                        <Link2 className="h-3 w-3 mr-1" />
                        {intentAnalysis.backlink_potential}/10
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This topic has {intentAnalysis.backlink_potential >= 7 ? 'high' : intentAnalysis.backlink_potential >= 4 ? 'moderate' : 'low'} potential for earning backlinks.
                    </p>
                  </Card>

                  {intentAnalysis.outreach_targets && intentAnalysis.outreach_targets.length > 0 && (
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold mb-3">Outreach Targets</h3>
                      <div className="space-y-2">
                        {intentAnalysis.outreach_targets.map((target, i) => (
                          <a
                            key={i}
                            href={`https://${target}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {target}
                          </a>
                        ))}
                      </div>
                    </Card>
                  )}

                  {intentAnalysis.content_format_suggestions && intentAnalysis.content_format_suggestions.length > 0 && (
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold mb-3">Recommended Formats</h3>
                      <div className="flex flex-wrap gap-2">
                        {intentAnalysis.content_format_suggestions.map((format, i) => (
                          <Badge key={i} variant="secondary">{format}</Badge>
                        ))}
                      </div>
                    </Card>
                  )}

                  {intentAnalysis.internal_linking_keywords && intentAnalysis.internal_linking_keywords.length > 0 && (
                    <Card className="p-4">
                      <h3 className="text-sm font-semibold mb-3">Internal Linking Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {intentAnalysis.internal_linking_keywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                !topic.matched_backlinks?.length && (
                  <Card className="p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No backlink data available yet. Complete the backlink discovery and intent analysis steps.
                    </p>
                  </Card>
                )
              )}
            </TabsContent>

            <TabsContent value="sources" className="space-y-4 mt-4">
              {topic.matched_sources && topic.matched_sources.length > 0 ? (
                <>
                  <div className="text-sm text-muted-foreground mb-4">
                    {topic.matched_sources.length} relevant source{topic.matched_sources.length !== 1 ? 's' : ''} matched to this topic
                  </div>
                  {topic.matched_sources.map((source, i) => (
                    <Card key={i} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold">{source.title}</h4>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex-shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                        
                        {source.insights?.summary && (
                          <p className="text-xs text-muted-foreground">{source.insights.summary}</p>
                        )}
                        
                        {source.citations && source.citations.length > 0 && (
                          <div className="space-y-2 pt-2 border-t">
                            <p className="text-xs font-semibold">Key Citations:</p>
                            {source.citations.map((citation, cidx) => (
                              <div key={cidx} className="pl-3 border-l-2 border-primary/30">
                                <p className="text-xs italic text-muted-foreground">&ldquo;{citation.text}&rdquo;</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {source.insights?.main_topics && source.insights.main_topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {source.insights.main_topics.slice(0, 3).map((topic, tidx) => (
                              <Badge key={tidx} variant="secondary" className="text-xs">{topic}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No relevant sources matched to this topic. Sources will be automatically selected based on keyword relevance.
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
