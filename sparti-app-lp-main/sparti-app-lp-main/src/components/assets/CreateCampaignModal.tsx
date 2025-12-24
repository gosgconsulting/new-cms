import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { WebsiteAnalysisStep } from './campaign-steps/WebsiteAnalysisStep';
import { BrandInfoStep } from './campaign-steps/BrandInfoStep';
import { MarketingHooksStep } from './campaign-steps/MarketingHooksStep';
import { BrandStyleStep } from './campaign-steps/BrandStyleStep';
import { GenerateAssetsStep } from './campaign-steps/GenerateAssetsStep';

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandId: string;
  userId: string;
  onCampaignCreated?: (campaignId: string) => void;
}

export interface BrandAnalysis {
  brand_name: string;
  brand_description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string[];
    background: string;
    text: string;
  };
  typography: {
    heading_font: string;
    body_font: string;
    characteristics: string;
  };
  logo_url: string | null;
  favicon_url: string | null;
  brand_style: {
    overall_aesthetic: string;
    visual_tone: string;
    design_patterns: string[];
  };
  target_audience: string;
  suggested_audiences?: string[];
  key_products_services: string[];
  unique_selling_points: string[];
}

export interface AssetObjective {
  campaign_goal: string;
  target_platforms: string[];
  content_focus: string;
  tone_direction: string;
  call_to_action: string;
  restrictions: string[];
}

export interface MarketingHook {
  hook_text: string;
  hook_type: string;
  emotional_appeal: string;
  best_for: string;
  rationale: string;
}

export interface AdFormat {
  name: string;
  aspect_ratio: string;
  dimensions: string;
  platforms: string[];
  best_for: string;
}

export interface GeneratedAsset {
  hookText: string;
  format: string;
  imageUrl: string;
  aspectRatio: string;
}

const STEPS = [
  'Website Analysis',
  'Brand Info & Assets',
  'Marketing Hooks',
  'Brand Style',
  'Image Configuration',
];

export const CreateCampaignModal = ({ open, onOpenChange, brandId, userId, onCampaignCreated }: CreateCampaignModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null);
  const [assetObjective, setAssetObjective] = useState<AssetObjective | null>(null);
  const [customAssets, setCustomAssets] = useState<string[]>([]);
  const [targetAudiences, setTargetAudiences] = useState<string[]>([]);
  const [marketingHooks, setMarketingHooks] = useState<MarketingHook[]>([]);
  const [selectedHooks, setSelectedHooks] = useState<MarketingHook[]>([]);
  const [brandStyle, setBrandStyle] = useState<any>(null);
  const [useAIStyles, setUseAIStyles] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<AdFormat[]>([]);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);

  const progress = (currentStep / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setWebsiteUrl('');
    setBrandAnalysis(null);
    setAssetObjective(null);
    setCustomAssets([]);
    setTargetAudiences([]);
    setMarketingHooks([]);
    setSelectedHooks([]);
    setBrandStyle(null);
    setUseAIStyles(false);
    setSelectedFormats([]);
    setGeneratedAssets([]);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return brandAnalysis !== null && assetObjective !== null;
      case 2:
        return brandAnalysis !== null && targetAudiences.length > 0;
      case 3:
        return selectedHooks.length > 0;
      case 4:
        return false; // Handled by BrandStyleStep component
      case 5:
        return false; // Generation step handles its own flow
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Asset Campaign</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex-1 flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                      currentStep === idx + 1
                        ? 'bg-primary text-primary-foreground'
                        : currentStep > idx + 1
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">{step}</div>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > idx + 1 ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {currentStep === 1 && (
            <WebsiteAnalysisStep
              brandId={brandId}
              userId={userId}
              onAnalysisComplete={(analysis, objective) => {
                setBrandAnalysis(analysis);
                setAssetObjective(objective);
                // Auto-populate target audiences from analysis
                if (analysis.target_audience) {
                  setTargetAudiences([analysis.target_audience]);
                }
                // Auto-advance to step 2
                handleNext();
              }}
              brandAnalysis={brandAnalysis}
              websiteUrl={websiteUrl}
              onWebsiteUrlChange={setWebsiteUrl}
            />
          )}

          {currentStep === 2 && brandAnalysis && (
            <BrandInfoStep
              brandId={brandId}
              brandAnalysis={brandAnalysis}
              customAssets={customAssets}
              targetAudiences={targetAudiences}
              onBrandAnalysisUpdate={setBrandAnalysis}
              onCustomAssetsChange={setCustomAssets}
              onTargetAudiencesChange={setTargetAudiences}
            />
          )}

          {currentStep === 3 && brandAnalysis && (
            <MarketingHooksStep
              brandId={brandId}
              brandAnalysis={brandAnalysis}
              assetObjective={assetObjective!}
              useBrandInfo={true}
              marketingHooks={marketingHooks}
              selectedHooks={selectedHooks}
              onHooksGenerated={setMarketingHooks}
              onHooksSelected={setSelectedHooks}
            />
          )}

          {currentStep === 4 && brandAnalysis && (
            <BrandStyleStep
              brandId={brandId}
              brandStyle={brandStyle}
              onStyleFetched={(style, isAI) => {
                setBrandStyle(style);
                setUseAIStyles(isAI);
                handleNext();
              }}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && brandAnalysis && (
            <GenerateAssetsStep
              brandId={brandId}
              userId={userId}
              brandAnalysis={brandAnalysis}
              assetObjective={assetObjective!}
              selectedHooks={selectedHooks}
              selectedFormats={selectedFormats}
              customAssets={customAssets}
              brandStyle={brandStyle}
              onFormatsSelected={setSelectedFormats}
              onAssetsGenerated={setGeneratedAssets}
              onSaveComplete={(campaignId) => {
                onOpenChange(false);
                handleReset();
                onCampaignCreated?.(campaignId);
              }}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && currentStep !== 4 && (
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
