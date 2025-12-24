import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Globe, FileText, Link as LinkIcon, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SelectedTopic } from '@/contexts/ArticleGenerationContext';

interface ArticleBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic: SelectedTopic | null;
  brandId: string;
  language: string;
  wordCount: number;
}

interface WebsiteAnalysis {
  brand_name?: string;
  company_description?: string;
  target_audience?: string;
  unique_selling_points?: string[];
  brand_voice?: string;
  seo_objective?: string;
}

interface TopicDetails {
  topic_title?: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
  search_term?: string;
  outline?: string[];
  internal_links?: any[];
  matched_sources?: any[];
  target_word_count?: number;
  estimated_word_count?: number;
}

const ArticleBriefModal = ({
  open,
  onOpenChange,
  topic,
  brandId,
  language,
  wordCount
}: ArticleBriefModalProps) => {
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && topic && brandId) {
      loadBriefData();
    }
  }, [open, topic, brandId]);

  const loadBriefData = async () => {
    setLoading(true);
    try {
      // Fetch website analysis for the brand
      const { data: analysisData, error: analysisError } = await supabase
        .from('quick_setup_sessions')
        .select('website_analysis')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisData?.website_analysis) {
        setWebsiteAnalysis(analysisData.website_analysis);
      }

      // Fetch full topic details from selected_topics
      if (topic?.id) {
        const { data: topicData, error: topicError } = await supabase
          .from('selected_topics')
          .select('*')
          .eq('id', topic.id)
          .maybeSingle();

        if (topicData) {
          setTopicDetails(topicData);
        }
      }
    } catch (error) {
      console.error('Error loading brief data:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayWordCount = topicDetails?.target_word_count || topicDetails?.estimated_word_count || wordCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Article Brief
          </DialogTitle>
          <DialogDescription>
            {topic?.title || topicDetails?.topic_title}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="website" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="website">Website Info</TabsTrigger>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
              <TabsTrigger value="sources">Sources</TabsTrigger>
            </TabsList>

            {/* Website Information Tab */}
            <TabsContent value="website" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5" />
                    Brand & Website Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {websiteAnalysis ? (
                    <>
                      {websiteAnalysis.brand_name && (
                        <div>
                          <h4 className="font-semibold mb-1">Brand Name</h4>
                          <p className="text-sm text-muted-foreground">{websiteAnalysis.brand_name}</p>
                        </div>
                      )}

                      {websiteAnalysis.company_description && (
                        <div>
                          <h4 className="font-semibold mb-1">Company Description</h4>
                          <p className="text-sm text-muted-foreground">{websiteAnalysis.company_description}</p>
                        </div>
                      )}

                      {websiteAnalysis.target_audience && (
                        <div>
                          <h4 className="font-semibold mb-1">Target Audience</h4>
                          <p className="text-sm text-muted-foreground">{websiteAnalysis.target_audience}</p>
                        </div>
                      )}

                      {websiteAnalysis.unique_selling_points && websiteAnalysis.unique_selling_points.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Unique Selling Points</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {websiteAnalysis.unique_selling_points.map((usp, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">{usp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {websiteAnalysis.brand_voice && (
                        <div>
                          <h4 className="font-semibold mb-1">Brand Voice</h4>
                          <p className="text-sm text-muted-foreground">{websiteAnalysis.brand_voice}</p>
                        </div>
                      )}

                      {websiteAnalysis.seo_objective && (
                        <div>
                          <h4 className="font-semibold mb-1">SEO Objective</h4>
                          <p className="text-sm text-muted-foreground">{websiteAnalysis.seo_objective}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No website analysis available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Article Brief Tab */}
            <TabsContent value="brief" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Content Brief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">Language</h4>
                      <Badge variant="secondary">{language}</Badge>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Target Word Count</h4>
                      <Badge variant="secondary">{displayWordCount} words</Badge>
                    </div>
                  </div>

                  {(topicDetails?.primary_keyword || topic?.keywords?.[0]) && (
                    <div>
                      <h4 className="font-semibold mb-2">Primary Keyword</h4>
                      <Badge variant="default">
                        {topicDetails?.primary_keyword || topic?.keywords?.[0]}
                      </Badge>
                    </div>
                  )}

                  {(topicDetails?.secondary_keywords || topic?.keywords?.slice(1)) && (
                    <div>
                      <h4 className="font-semibold mb-2">Secondary Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {(topicDetails?.secondary_keywords || topic?.keywords?.slice(1) || []).map((kw, idx) => (
                          <Badge key={idx} variant="outline">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Article Overview</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-foreground leading-relaxed">
                        This article will comprehensively cover <span className="font-medium">{topicDetails?.topic_title || topic?.title}</span>, 
                        focusing on the primary keyword <span className="font-medium">{topicDetails?.primary_keyword || topic?.keywords?.[0]}</span>
                        {topicDetails?.secondary_keywords && topicDetails.secondary_keywords.length > 0 && (
                          <> and incorporating secondary keywords including {topicDetails.secondary_keywords.slice(0, 3).join(', ')}</>
                        )}. 
                        The content will be structured to deliver approximately {displayWordCount.toLocaleString()} words of valuable, 
                        SEO-optimized information targeting our audience in {language}.
                        {topicDetails?.outline && topicDetails.outline.length > 0 && (
                          <> The article follows a {topicDetails.outline.length}-section structure designed to provide comprehensive coverage and answer user search intent effectively.</>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Backlinks Tab */}
            <TabsContent value="backlinks" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <LinkIcon className="h-5 w-5" />
                    Internal Backlinks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topicDetails?.internal_links && topicDetails.internal_links.length > 0 ? (
                    <div className="space-y-3">
                      {topicDetails.internal_links.map((link: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-2">
                          <div className="font-medium">{link.title || link.page_title}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {link.url}
                          </div>
                          {link.anchor_text && (
                            <div className="text-sm">
                              <span className="font-medium">Suggested anchor: </span>
                              <span className="text-muted-foreground">{link.anchor_text}</span>
                            </div>
                          )}
                          {link.keyword && (
                            <Badge variant="outline" className="text-xs">
                              {link.keyword}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No internal backlinks suggested for this article</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sources Tab */}
            <TabsContent value="sources" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5" />
                    Content Sources & Citations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topicDetails?.matched_sources && topicDetails.matched_sources.length > 0 ? (
                    <div className="space-y-4">
                      {topicDetails.matched_sources.map((source: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-3">
                          <div className="font-medium text-lg">{source.title}</div>
                          
                          {source.url && (
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              {source.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}

                          {source.summary && (
                            <div>
                              <h5 className="font-semibold text-sm mb-1">Summary</h5>
                              <p className="text-sm text-muted-foreground">{source.summary}</p>
                            </div>
                          )}

                          {source.citation && (
                            <div>
                              <h5 className="font-semibold text-sm mb-1">Citation</h5>
                              <p className="text-sm text-muted-foreground italic">{source.citation}</p>
                            </div>
                          )}

                          {source.content && (
                            <div>
                              <h5 className="font-semibold text-sm mb-1">Source Content</h5>
                              <div className="text-sm text-muted-foreground max-h-48 overflow-y-auto bg-muted/50 p-3 rounded">
                                {source.content}
                              </div>
                            </div>
                          )}

                          {source.main_topics && Array.isArray(source.main_topics) && source.main_topics.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Topics Covered</h5>
                              <div className="flex flex-wrap gap-1">
                                {source.main_topics.map((topic: string, topicIdx: number) => (
                                  <Badge key={topicIdx} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sources available for this article</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArticleBriefModal;
