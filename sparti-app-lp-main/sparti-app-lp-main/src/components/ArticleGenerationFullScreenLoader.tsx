import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { GenerationSession, useArticleGeneration } from '@/contexts/ArticleGenerationContext';

interface ArticleGenerationFullScreenLoaderProps {
  session: GenerationSession;
}

export const ArticleGenerationFullScreenLoader = ({ 
  session
}: ArticleGenerationFullScreenLoaderProps) => {
  const navigate = useNavigate();
  const { dismissFullScreenLoader } = useArticleGeneration();
  const isComplete = session.status === 'completed';
  const isError = session.status === 'error';
  const progress = Math.round(session.overallProgress);

  const handleGoToSchedule = () => {
    // Dismiss the full screen loader
    dismissFullScreenLoader();
    // Navigate to schedule page with brand ID
    navigate(`/app/schedule?brand=${session.params.brandId}`);
  };

  const handleKeepBrowsing = () => {
    dismissFullScreenLoader();
    navigate(`/app/campaigns?brand=${session.params.brandId}`);
  };

  const getStatusMessage = () => {
    if (isComplete) {
      return `Generated ${session.completedArticles} article${session.completedArticles !== 1 ? 's' : ''} successfully`;
    }
    if (isError) {
      return 'Generation encountered an error';
    }
    return `Generating ${session.totalArticles} article${session.totalArticles !== 1 ? 's' : ''}`;
  };

  const getEstimatedTime = () => {
    if (isComplete || isError) return null;
    
    const remainingArticles = session.totalArticles - session.completedArticles;
    const estimatedMinutes = Math.ceil(remainingArticles * 1.5); // ~1.5 min per article
    
    if (estimatedMinutes < 2) {
      return 'Less than 1 minute remaining';
    } else if (estimatedMinutes < 60) {
      return `About ${estimatedMinutes} minutes remaining`;
    } else {
      const hours = Math.floor(estimatedMinutes / 60);
      const mins = estimatedMinutes % 60;
      return `About ${hours}h ${mins}m remaining`;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex items-center justify-center">
      <div className="max-w-md w-full px-6 text-center space-y-8">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          {isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-success/20 to-success/10 border-2 border-success flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-success" />
            </motion.div>
          ) : (
            <svg
              className="w-24 h-24"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Animated gradient play button */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
              
              {/* Outer circle with subtle pulse */}
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#gradient)"
                strokeWidth="2"
                fill="none"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Play button triangle */}
              <motion.path
                d="M 35 25 L 35 75 L 75 50 Z"
                fill="url(#gradient)"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Animated dots */}
              <motion.g>
                <motion.circle
                  cx="25"
                  cy="50"
                  r="3"
                  fill="url(#gradient)"
                  initial={{ opacity: 0.3, y: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.circle
                  cx="20"
                  cy="58"
                  r="2"
                  fill="url(#gradient)"
                  initial={{ opacity: 0.3, y: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.circle
                  cx="25"
                  cy="65"
                  r="2.5"
                  fill="url(#gradient)"
                  initial={{ opacity: 0.3, y: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </motion.g>
            </svg>
          )}
        </motion.div>

        {/* Progress Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold">
            {isComplete ? (
              <span className="bg-gradient-to-r from-success to-success/80 bg-clip-text text-transparent">
                Generation Complete!
              </span>
            ) : isError ? (
              <span className="text-destructive">Generation Failed</span>
            ) : (
              <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                AI generating articles... ({progress}%)
              </span>
            )}
          </h2>
          
          <p className="text-muted-foreground text-lg">
            {getStatusMessage()}
          </p>
        </motion.div>

        {/* Progress Bar */}
        {!isComplete && !isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{session.completedArticles} of {session.totalArticles} completed</span>
              <span>{progress}%</span>
            </div>
          </motion.div>
        )}

        {/* Background Task Info */}
        {!isComplete && !isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Running in the background, safe to leave this page
            </p>
            
            <Button
              onClick={handleKeepBrowsing}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Keep browsing
            </Button>
          </motion.div>
        )}

        {/* Completion Button */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <Button
              onClick={handleGoToSchedule}
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8"
            >
              View Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
