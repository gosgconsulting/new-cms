import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KeywordsResearchForm } from './KeywordsResearchForm';

interface KeywordsSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

export const KeywordsSearchModal = ({
  open,
  onOpenChange,
  brandId,
  brandName
}: KeywordsSearchModalProps) => {
  const handleComplete = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Search for Keywords</DialogTitle>
        </DialogHeader>
        <KeywordsResearchForm 
          brandId={brandId}
          brandName={brandName}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};
