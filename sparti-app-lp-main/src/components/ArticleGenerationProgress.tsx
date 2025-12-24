import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  FileText, 
  AlertCircle,
  X
} from 'lucide-react';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import { cn } from '@/lib/utils';

interface ArticleGenerationProgressProps {
  className?: string;
  showDetails?: boolean;
  onClose?: () => void;
}

const ArticleGenerationProgress: React.FC<ArticleGenerationProgressProps> = ({
  className,
  showDetails = true,
  onClose
}) => {
  const { currentSession, isGenerating, stopGeneration, clearSession } = useArticleGeneration();

  if (!currentSession) {
    return null;
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'generating':
      case 'saving':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'generating':
      case 'saving':
        return 'text-primary';
      case 'pending':
      default:
        return 'text-muted-foreground';
    }
  };

  const getStepBorderColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'generating':
      case 'saving':
        return 'border-primary/30 bg-primary/5';
      case 'pending':
      default:
        return 'border-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'generating':
        return <Badge variant="default" className="bg-accent/10 text-accent">Generating</Badge>;
      case 'saving':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Saving</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const isSessionComplete = currentSession.status === 'completed' || currentSession.status === 'error';
  const hasErrors = currentSession.failedArticles > 0;
  const hasPendingArticles = currentSession.totalArticles > currentSession.completedArticles + currentSession.failedArticles;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              Article Generation Progress
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isSessionComplete && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearSession}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Background Generation Message - Only show when there are pending articles */}
        {hasPendingArticles && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex-shrink-0">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Your articles are being generated in the background
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  You will receive a notification when they're ready ({currentSession.completedArticles}/{currentSession.totalArticles} completed)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Session Info */}
        {currentSession.startTime && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Started: {currentSession.startTime.toLocaleTimeString()}
            </span>
            {currentSession.endTime && (
              <span>
                Duration: {formatDuration(currentSession.startTime, currentSession.endTime)}
              </span>
            )}
          </div>
        )}

        {/* Status Messages */}
        {isSessionComplete && (
          <div className={cn(
            "p-3 rounded-lg border",
            hasErrors 
              ? "border-yellow-200 bg-yellow-50" 
              : "border-green-200 bg-green-50"
          )}>
            <div className="flex items-center gap-2">
              {hasErrors ? (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                hasErrors ? "text-yellow-800" : "text-green-800"
              )}>
                {isSessionComplete && !hasErrors 
                  ? "All articles generated successfully!" 
                  : hasErrors 
                    ? `${currentSession.completedArticles} articles generated, ${currentSession.failedArticles} failed.`
                    : "Generation in progress..."
                }
              </span>
            </div>
          </div>
        )}

        {/* Detailed Steps */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Article Details</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {currentSession.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    getStepBorderColor(step.status)
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-green-800 font-medium truncate">
                          {step.topicTitle}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(step.status)}
                        </div>
                      </div>
                      
                      {(step.status === 'generating' || step.status === 'saving') && (
                        <Progress value={step.progress} className="h-1" />
                      )}
                      
                      {step.error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {step.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleGenerationProgress;
