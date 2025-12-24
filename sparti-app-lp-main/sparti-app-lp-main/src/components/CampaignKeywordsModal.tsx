import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CampaignKeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  keywords: string[];
  campaignDate: string;
}

const CampaignKeywordsModal: React.FC<CampaignKeywordsModalProps> = ({
  isOpen,
  onClose,
  keywords,
  campaignDate,
}) => {
  const uniqueKeywords = [...new Set(keywords)];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Campaign Keywords</DialogTitle>
          <DialogDescription>
            Keywords for campaign from {new Date(campaignDate).toLocaleDateString()} ({uniqueKeywords.length} unique keywords)
          </DialogDescription>
        </DialogHeader>
        
        <Separator />
        
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-4">
            {uniqueKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {uniqueKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No keywords found for this campaign.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignKeywordsModal;