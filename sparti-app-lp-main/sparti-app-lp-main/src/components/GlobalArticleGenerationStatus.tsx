import React from 'react';
import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import ArticleGenerationProgress from '@/components/ArticleGenerationProgress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

interface GlobalArticleGenerationStatusProps {
  className?: string;
}

const GlobalArticleGenerationStatus: React.FC<GlobalArticleGenerationStatusProps> = ({
  className
}) => {
  const { currentSession, isGenerating, clearSession } = useArticleGeneration();
  const location = useLocation();
  
  // Don't show during Quick Setup (it's already shown inline)
  const isQuickSetup = location.pathname.includes('/quick-setup');
  
  // Don't show on Articles/Schedule page since we show inline progress there
  const isArticlesPage = location.pathname.includes('/articles');

  if (!currentSession || isQuickSetup || isArticlesPage) {
    return null;
  }

  return (
    <div className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4", className)}>
      <Card className="border-primary/20 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {isGenerating ? 'Generating Articles...' : 'Article Generation Complete'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSession}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <ArticleGenerationProgress 
            showDetails={false}
            className="border-0 shadow-none p-0"
          />
        </div>
      </Card>
    </div>
  );
};

export default GlobalArticleGenerationStatus;
