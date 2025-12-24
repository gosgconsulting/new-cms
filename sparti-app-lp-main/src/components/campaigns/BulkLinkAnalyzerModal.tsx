import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Link {
  id: string;
  url: string;
  title?: string | null;
}

interface BulkLinkAnalyzerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: Link[];
  brandId: string;
  userId: string;
}

interface AnalysisResult {
  linkId: string;
  url: string;
  title: string;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  error?: string;
}

export const BulkLinkAnalyzerModal = ({
  open,
  onOpenChange,
  links,
  brandId,
  userId,
}: BulkLinkAnalyzerModalProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const analyzeLink = async (link: Link): Promise<void> => {
    try {
      // Call the analyze-source-content edge function
      const { data, error } = await supabase.functions.invoke('analyze-source-content', {
        body: { url: link.url }
      });

      if (error) throw error;

      // Save to database
      const { error: insertError } = await supabase
        .from('analyzed_sources')
        .insert({
          user_id: userId,
          brand_id: brandId,
          url: link.url,
          title: data.title || link.title || link.url,
          description: data.description || null,
          content: data.content || null,
          analysis: data.analysis || {},
          source_type: 'link'
        });

      if (insertError) throw insertError;

      return;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to analyze link');
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Initialize results
    const initialResults: AnalysisResult[] = links.map(link => ({
      linkId: link.id,
      url: link.url,
      title: link.title || link.url,
      status: 'pending'
    }));
    setResults(initialResults);
    setCurrentIndex(0);

    // Analyze links one by one
    for (let i = 0; i < links.length; i++) {
      setCurrentIndex(i);
      
      // Update status to analyzing
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'analyzing' } : r
      ));

      try {
        await analyzeLink(links[i]);
        
        // Update status to success
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'success' } : r
        ));
      } catch (error: any) {
        // Update status to error
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'error', error: error.message } : r
        ));
      }

      // Small delay between requests
      if (i < links.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsAnalyzing(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    toast({
      title: 'Analysis Complete',
      description: `Successfully analyzed ${successCount} of ${links.length} links`
    });
  };

  const progress = links.length > 0 ? ((currentIndex + 1) / links.length) * 100 : 0;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  const getDisplayTitle = (url: string, title?: string) => {
    if (title && title !== url) return title;
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.replace(/\/$/, '');
      const lastSegment = path.split('/').pop() || urlObj.hostname;
      return lastSegment.length > 50 ? lastSegment.substring(0, 47) + '...' : lastSegment;
    } catch {
      return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Link Analysis</DialogTitle>
          <DialogDescription>
            Analyzing {links.length} link{links.length !== 1 ? 's' : ''} and saving results to database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {results.length > 0 && (
                  <>
                    <div className="flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{successCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="font-medium">{errorCount}</span>
                    </div>
                  </>
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {isAnalyzing ? `${currentIndex + 1} / ${links.length}` : `${links.length} links`}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Results List */}
          {results.length > 0 && (
            <ScrollArea className="h-[350px] rounded-lg border bg-muted/20">
              <div className="p-3 space-y-1.5">
                {results.map((result) => (
                  <div
                    key={result.linkId}
                    className="flex items-center gap-2.5 p-2.5 rounded-md bg-background border border-transparent hover:border-border transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {result.status === 'pending' && (
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                      )}
                      {result.status === 'analyzing' && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {result.status === 'success' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {result.status === 'error' && (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getDisplayTitle(result.url, result.title)}
                      </p>
                      {result.error && (
                        <p className="text-xs text-destructive mt-0.5 line-clamp-2">{result.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Cancel' : 'Close'}
            </Button>
            {!isAnalyzing && results.length === 0 && (
              <Button onClick={handleStartAnalysis}>
                Start Analysis
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
