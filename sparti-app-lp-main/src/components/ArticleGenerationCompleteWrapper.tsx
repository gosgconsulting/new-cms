import { useArticleGeneration } from '@/contexts/ArticleGenerationContext';
import { useLocation } from 'react-router-dom';
import { ArticleGenerationFullScreenLoader } from './ArticleGenerationFullScreenLoader';

const ArticleGenerationCompleteWrapper = () => {
  const { currentSession, isGenerating, showFullScreenLoader } = useArticleGeneration();
  const location = useLocation();
  
  // Don't show during Quick Setup (handled inline there)
  const isQuickSetup = location.pathname.includes('/quick-setup');

  // Don't show if not generating or in quick setup or user dismissed it
  if (!currentSession || isQuickSetup || !showFullScreenLoader) return null;

  // Only show full screen loader when generating or just completed
  if (currentSession.status === 'running' || currentSession.status === 'completed') {
    return (
      <ArticleGenerationFullScreenLoader
        session={currentSession}
      />
    );
  }

  return null;
};

export default ArticleGenerationCompleteWrapper;
