import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, FileText, Loader2, BookOpen, Lightbulb, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCopilot } from '@/contexts/CopilotContext';

interface SourceViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source?: string;
  topicTitle?: string;
}

interface SourceAnalysis {
  title: string;
  description: string;
  content: string;
  analysis: {
    keyTopics: string[];
    keywordsFocus: string[];
    writingStyle: {
      tone: string;
      voice: string;
      characteristics: string[];
    };
    citations: string[];
    contentBrief: {
      suggestedOutline: string[];
      recommendedTone: string;
      keyMessages: string[];
      targetAudience: string;
      contentAngle: string;
    };
  };
}

const SourceViewerModal = ({ open, onOpenChange, source, topicTitle }: SourceViewerModalProps) => {
  const { user } = useAuth();
  const { selectedBrand } = useCopilot();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzedContent, setAnalyzedContent] = useState<SourceAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const parseSourceData = (source?: string) => {
    if (!source) return null;
    
    try {
      const parsed = JSON.parse(source);
      return parsed;
    } catch {
      // If JSON parsing fails, treat as plain text
      return { content: source, type: 'text' };
    }
  };

  const sourceData = parseSourceData(source);

  const handleAnalyzeContent = async () => {
    if (!sourceData?.url) {
      toast.error('No URL available to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-source-content', {
        body: { url: sourceData.url },
      });

      if (error) throw error;

      setAnalyzedContent(data);
      setActiveTab('contents');
      toast.success('Content analyzed successfully');
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!analyzedContent || !user || !selectedBrand) {
      toast.error('Missing required data to save');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('analyzed_sources')
        .insert({
          user_id: user.id,
          brand_id: selectedBrand.id,
          workspace_id: selectedBrand.workspace_id,
          url: sourceData.url,
          title: analyzedContent.title || sourceData.title || sourceData.url,
          description: analyzedContent.description || null,
          content: analyzedContent.content || null,
          analysis: analyzedContent.analysis || {},
          source_type: 'topic'
        });

      if (error) throw error;

      toast.success('Analysis saved to database');
    } catch (error: any) {
      console.error('Error saving to database:', error);
      toast.error(error.message || 'Failed to save to database');
    } finally {
      setIsSaving(false);
    }
  };

  if (!sourceData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Source Information
            </DialogTitle>
          </DialogHeader>
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Source Data</h3>
              <p className="text-muted-foreground">
                No source information is available for this topic.
              </p>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Source Information
            {topicTitle && <span className="text-muted-foreground">- {topicTitle}</span>}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contents" disabled={!analyzedContent}>
              <BookOpen className="h-4 w-4 mr-2" />
              Contents
            </TabsTrigger>
            <TabsTrigger value="brief" disabled={!analyzedContent}>
              <Lightbulb className="h-4 w-4 mr-2" />
              Brief
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {sourceData.title && (
                    <>
                      <FileText className="h-4 w-4" />
                      {sourceData.title}
                    </>
                  )}
                  {sourceData.url && (
                    <a
                      href={sourceData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardTitle>
                {sourceData.url && (
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {sourceData.url}
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sourceData.description && (
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-muted-foreground">{sourceData.description}</p>
                    </div>
                  )}
                  
                  {sourceData.snippet && (
                    <div>
                      <h4 className="font-medium mb-2">Snippet</h4>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">{sourceData.snippet}</p>
                      </div>
                    </div>
                  )}

                  {sourceData.keywords && Array.isArray(sourceData.keywords) && (
                    <div>
                      <h4 className="font-medium mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {sourceData.keywords.map((keyword: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 space-y-2">
                    <Button
                      onClick={handleAnalyzeContent}
                      disabled={isAnalyzing || !sourceData.url}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing Content...
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Fetch & Analyze Content
                        </>
                      )}
                    </Button>
                    {analyzedContent && (
                      <Button
                        onClick={handleSaveToDatabase}
                        disabled={isSaving}
                        variant="secondary"
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save to Database
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contents" className="space-y-6 mt-6">
            {analyzedContent && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {analyzedContent.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzedContent.analysis.keyTopics.map((topic, idx) => (
                          <Badge key={idx} variant="default" className="text-sm">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Keywords Focus</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyzedContent.analysis.keywordsFocus.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-sm">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Writing Style & Tone</h4>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <div>
                          <span className="font-medium">Tone:</span>{' '}
                          <span className="text-muted-foreground">{analyzedContent.analysis.writingStyle.tone}</span>
                        </div>
                        <div>
                          <span className="font-medium">Voice:</span>{' '}
                          <span className="text-muted-foreground">{analyzedContent.analysis.writingStyle.voice}</span>
                        </div>
                        <div>
                          <span className="font-medium">Characteristics:</span>
                          <ul className="list-disc list-inside mt-2 text-muted-foreground">
                            {analyzedContent.analysis.writingStyle.characteristics.map((char, idx) => (
                              <li key={idx}>{char}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {analyzedContent.analysis.citations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 text-lg">Citations Examples</h4>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          {analyzedContent.analysis.citations.map((citation, idx) => (
                            <p key={idx} className="text-sm text-muted-foreground italic">
                              "{citation}"
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-3 text-lg">Full Article Content</h4>
                      <div className="bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {analyzedContent.content}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="brief" className="space-y-6 mt-6">
            {analyzedContent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Content Brief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Suggested Outline</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <ol className="list-decimal list-inside space-y-2">
                        {analyzedContent.analysis.contentBrief.suggestedOutline.map((item, idx) => (
                          <li key={idx} className="text-muted-foreground">{item}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Recommended Tone</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground">
                        {analyzedContent.analysis.contentBrief.recommendedTone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Key Messages</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <ul className="list-disc list-inside space-y-2">
                        {analyzedContent.analysis.contentBrief.keyMessages.map((message, idx) => (
                          <li key={idx} className="text-muted-foreground">{message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Target Audience</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground">
                        {analyzedContent.analysis.contentBrief.targetAudience}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Content Angle</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-muted-foreground">
                        {analyzedContent.analysis.contentBrief.contentAngle}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          {sourceData?.url && (
            <Button 
              variant="outline" 
              onClick={() => window.open(sourceData.url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Source
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SourceViewerModal;