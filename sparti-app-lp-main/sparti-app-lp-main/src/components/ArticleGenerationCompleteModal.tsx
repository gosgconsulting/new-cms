import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, XCircle } from 'lucide-react';

interface ArticleGenerationCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  successCount: number;
  failureCount: number;
  onGoToSchedule?: () => void;
}

const ArticleGenerationCompleteModal = ({ 
  open, 
  onOpenChange, 
  successCount, 
  failureCount,
  onGoToSchedule
}: ArticleGenerationCompleteModalProps) => {
  const handleGoToSchedule = () => {
    onOpenChange(false);
    if (onGoToSchedule) {
      onGoToSchedule();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            successCount > 0 ? 'bg-success/10' : 'bg-destructive/10'
          }`}>
            {successCount > 0 ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <DialogTitle className="text-2xl">
            {successCount > 0 ? 'Articles Generated!' : 'Generation Failed'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {successCount > 0 && failureCount === 0 && (
              <>
                {successCount} article{successCount > 1 ? 's' : ''} generated successfully!
              </>
            )}
            {successCount > 0 && failureCount > 0 && (
              <>
                {successCount} article{successCount > 1 ? 's' : ''} generated successfully,
                {failureCount} failed.
              </>
            )}
            {successCount === 0 && failureCount > 0 && (
              <>
                Failed to generate articles. Please check your settings and try again.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-6">
          {onGoToSchedule && successCount > 0 && (
            <Button onClick={handleGoToSchedule} size="lg" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              View Articles
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} size="lg" className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleGenerationCompleteModal;
