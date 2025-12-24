import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useCompetitorAudit } from '@/contexts/CompetitorAuditContext';
import CompetitorAuditStep1WebsiteAnalysis from './CompetitorAuditStep1WebsiteAnalysis';
import CompetitorAuditStep2Keywords from './CompetitorAuditStep2Keywords';
import CompetitorAuditStep3SearchTerms from './CompetitorAuditStep3SearchTerms';
import CompetitorAuditStep4Results from './CompetitorAuditStep4Results';

interface CompetitorAuditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  brandName: string;
}

const CompetitorAuditModal = ({ open, onOpenChange, brandId, brandName }: CompetitorAuditModalProps) => {
  const { currentStep, sessionData, goToStep, nextStep, prevStep, resetSession, updateSessionData } = useCompetitorAudit();

  const steps = [
    { number: 1, title: 'Website Analysis' },
    { number: 2, title: 'Keywords' },
    { number: 3, title: 'Search Terms' },
    { number: 4, title: 'Results' },
  ];

  const progress = (currentStep / steps.length) * 100;

  const handleClose = () => {
    resetSession();
    onOpenChange(false);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return sessionData.website_analysis_complete && sessionData.website_url;
      case 2:
        return sessionData.keywords.length > 0;
      case 3:
        return sessionData.search_terms.length >= 2 && sessionData.search_terms.length <= 5;
      case 4:
        return false; // No next from results
      default:
        return false;
    }
  };

  // Initialize session data with brand info
  if (open && !sessionData.brand_id) {
    updateSessionData({ brand_id: brandId, brand_name: brandName });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Competitor Audit - {brandName}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full space-y-3">
          {/* Step Labels */}
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex-1 text-center text-sm font-medium transition-colors ${
                  step.number === currentStep
                    ? 'text-primary'
                    : step.number < currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/60'
                }`}
              >
                Step {step.number}: {step.title}
              </div>
            ))}
          </div>
          
          {/* Progress Bar */}
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px] py-6">
          {currentStep === 1 && <CompetitorAuditStep1WebsiteAnalysis />}
          {currentStep === 2 && <CompetitorAuditStep2Keywords />}
          {currentStep === 3 && <CompetitorAuditStep3SearchTerms />}
          {currentStep === 4 && <CompetitorAuditStep4Results onComplete={handleClose} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < 4 && (
            <Button
              onClick={nextStep}
              disabled={!canGoNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {currentStep === 4 && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitorAuditModal;
