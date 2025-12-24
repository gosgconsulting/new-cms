import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCopilot } from '@/contexts/CopilotContext';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { QuickSetupProvider, useQuickSetup } from '@/contexts/QuickSetupContext';
import { useQuickSetupPersistence } from '@/hooks/useQuickSetupPersistence';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { QuickSetupProgressBar } from '@/components/campaigns/quick-setup/QuickSetupProgressBar';
import { Step1WebsiteInfo } from '@/components/campaigns/quick-setup/steps/Step1WebsiteInfo';
import { Step2KeywordClusters } from '@/components/campaigns/quick-setup/steps/Step2KeywordClusters';
import { Step3KeywordsAndSources } from '@/components/campaigns/quick-setup/steps/Step3KeywordsAndSources';
import { Step8TopicGeneration } from '@/components/campaigns/quick-setup/steps/Step8TopicGeneration';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuickSetupModalContentProps {
  onClose: () => void;
  resumeCampaignId?: string;
}

const QuickSetupModalContent = ({ onClose, resumeCampaignId }: QuickSetupModalContentProps) => {
  const { selectedBrand } = useCopilot();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentStep, nextStep, prevStep, sessionData, resetSession, updateSessionData, setIsLoading, goToStep } = useQuickSetup();
  const { saveCampaignProgress, loadCampaignData } = useQuickSetupPersistence();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);

  // Load campaign data if resuming
  useEffect(() => {
    const loadResume = async () => {
      if (resumeCampaignId) {
        setIsLoadingCampaign(true);
        const result = await loadCampaignData(resumeCampaignId);
        if (result) {
          // Ensure campaign_id is set from the actual campaign ID
          updateSessionData({
            ...result.sessionData,
            campaign_id: resumeCampaignId,
          });
          goToStep(result.currentStep);
        }
        setIsLoadingCampaign(false);
      }
    };
    loadResume();
  }, [resumeCampaignId]);

  // Initialize new session
  useEffect(() => {
    if (selectedBrand && user && !resumeCampaignId) {
      updateSessionData({
        brand_id: selectedBrand.id,
        user_id: user.id,
        data_source: 'url', // Always use URL analysis
      });
      // Start at step 1 (Website Analysis)
      goToStep(1);
    }
  }, [selectedBrand, user, resumeCampaignId]);

  // Auto-save removed - campaign is only created when clicking "Save Topics" in final step

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return sessionData.website_url && 
               sessionData.website_url.length > 0 && 
               sessionData.website_analysis_complete &&
               sessionData.keywords && 
               sessionData.keywords.length >= 1;
      case 2:
        return sessionData.selected_cluster && sessionData.keywords && sessionData.keywords.length > 0;
      case 3:
        return sessionData.topicsGenerated === true;
      case 4:
        return (sessionData.topics?.length || 0) > 0;
      default:
        return true;
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    resetSession();
    setShowCancelDialog(false);
    onClose();
  };

  const handleNextClick = async () => {
    // On final step (4), save topics and create campaign
    if (currentStep === 4) {
      await handleSaveTopics();
      return;
    }
    
    // For all other steps, just proceed to next step
    nextStep();
  };

  const handleSaveTopics = async () => {
    if (!sessionData.topics || sessionData.topics.length === 0) {
      toast.error('No topics to save');
      return;
    }

    if (!sessionData.brand_id || !sessionData.user_id) {
      toast.error('Missing brand or user information');
      return;
    }

    setIsLoading(true);
    try {
      const topicsToSave = sessionData.topics;

      console.log('Saving topics:', {
        topics_count: topicsToSave.length
      });

      // Create campaign with topics
      const campaignId = await saveCampaignProgress({
        ...sessionData,
        topics: topicsToSave,
        topic_count: topicsToSave.length,
      } as any, currentStep);

      if (!campaignId) {
        toast.error('Failed to create campaign');
        setIsLoading(false);
        return;
      }

      console.log('Campaign created with ID:', campaignId);
      resetSession();
      onClose();
      
      // Navigate to campaigns page with auto-select parameter
      if (selectedBrand?.id) {
        navigate(`/app/campaigns?brand=${selectedBrand.id}&autoSelect=${campaignId}`);
      }
    } catch (error: any) {
      console.error('Error saving topics:', error);
      toast.error(error.message || 'Failed to save topics');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1WebsiteInfo />;
      case 2:
        return <Step2KeywordClusters />;
      case 3:
        return <Step3KeywordsAndSources />;
      case 4:
        return <Step8TopicGeneration />;
      default:
        return null;
    }
  };

  if (isLoadingCampaign) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick Setup</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Generate topics in 4 easy steps
          </DialogDescription>
        </DialogHeader>

        <QuickSetupProgressBar currentStep={currentStep} totalSteps={4} />

        <div className="max-h-[60vh] overflow-y-auto px-1">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-muted-foreground"
          >
            Cancel
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button
              onClick={handleNextClick}
              disabled={!canProceed()}
              className="min-w-[120px]"
            >
              {currentStep === 4 ? 'Save Topics' : 'Next'}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Quick Setup?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. Are you sure you want to cancel the Quick Setup process?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Setup</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Yes, Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface QuickSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeCampaignId?: string;
}

export const QuickSetupModal = ({ open, onOpenChange, resumeCampaignId }: QuickSetupModalProps) => {
  const { selectedBrand } = useCopilot();
  const { user } = useAuth();

  if (!selectedBrand || !user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <QuickSetupProvider 
          initialBrandId={selectedBrand.id} 
          initialUserId={user.id}
        >
          <QuickSetupModalContent 
            onClose={() => onOpenChange(false)} 
            resumeCampaignId={resumeCampaignId}
          />
        </QuickSetupProvider>
      </DialogContent>
    </Dialog>
  );
};
