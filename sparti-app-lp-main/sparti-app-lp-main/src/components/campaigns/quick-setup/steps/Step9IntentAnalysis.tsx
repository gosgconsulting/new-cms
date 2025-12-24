import { useEffect, useState } from 'react';
import { useQuickSetup } from '@/contexts/QuickSetupContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Target, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyzedTopic {
  topic_index: number;
  refined_intent: string;
  intent_confidence: number;
  backlink_potential: number;
  outreach_targets: string[];
  content_format_suggestions: string[];
  internal_linking_keywords: string[];
}

export const Step9IntentAnalysis = () => {
  const { sessionData, updateSessionData, setIsLoading, isLoading } = useQuickSetup();
  const [analyzedTopics, setAnalyzedTopics] = useState<AnalyzedTopic[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  useEffect(() => {
    if (sessionData.intent_analysis && sessionData.intent_analysis.length > 0) {
      setAnalyzedTopics(sessionData.intent_analysis);
      setHasAnalyzed(true);
    }
  }, []);

  const analyzeIntent = async () => {
    if (!sessionData.topics || sessionData.topics.length === 0) {
      toast.error('No topics found. Please complete the previous step.');
      return;
    }

    setIsLoading(true);
    setHasAnalyzed(false);

    try {
      const { data, error } = await supabase.functions.invoke('quick-setup-intent-analysis', {
        body: {
          topics: sessionData.topics,
          competitors: sessionData.competitors
        }
      });

      if (error) throw error;

      const analyzed = data.analyzed_topics as AnalyzedTopic[];
      setAnalyzedTopics(analyzed);
      updateSessionData({ intent_analysis: analyzed });
      setHasAnalyzed(true);

    } catch (error) {
      console.error('Error analyzing intent:', error);
      toast.error('Failed to analyze intent');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!hasAnalyzed) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Intent Analysis & Backlink Strategy</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'll analyze search intent for each topic and identify backlink opportunities, 
            outreach targets, and internal linking strategies.
          </p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">What we'll analyze:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Refined search intent classification with confidence scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Backlink potential and outreach target identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Content format suggestions optimized for link building</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Internal linking keyword recommendations</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={analyzeIntent}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Intent...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Analyze Intent & Backlinks
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intent Analysis Results</h2>
          <p className="text-muted-foreground">
            {analyzedTopics.length} topics analyzed
          </p>
        </div>
        <Button onClick={analyzeIntent} disabled={isLoading} variant="outline">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reanalyzing...
            </>
          ) : (
            <>
              <Target className="mr-2 h-4 w-4" />
              Reanalyze
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {analyzedTopics.map((analysis, idx) => {
          const topic = sessionData.topics?.[analysis.topic_index];
          if (!topic) return null;

          return (
            <Card key={idx} className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">{topic.title}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      Intent: {analysis.refined_intent}
                    </Badge>
                    <Badge variant="outline">
                      <span className={getConfidenceColor(analysis.intent_confidence)}>
                        Confidence: {analysis.intent_confidence}/10
                      </span>
                    </Badge>
                    <Badge variant="outline">
                      <Link2 className="h-3 w-3 mr-1" />
                      Backlink Potential: {analysis.backlink_potential}/10
                    </Badge>
                  </div>
                </div>

                {analysis.content_format_suggestions && analysis.content_format_suggestions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Formats:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.content_format_suggestions.map((format, i) => (
                        <Badge key={i} variant="secondary">{format}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.outreach_targets && analysis.outreach_targets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Outreach Targets:</p>
                    <div className="space-y-1">
                      {analysis.outreach_targets.map((target, i) => (
                        <a
                          key={i}
                          href={`https://${target}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          {target}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.internal_linking_keywords && analysis.internal_linking_keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Internal Linking Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.internal_linking_keywords.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
