import { useState } from 'react';
import { Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CMSDialog } from '@/components/settings/CMSDialog';
import { useNavigate } from 'react-router-dom';

interface CMSIntegrationCardProps {
  brandId?: string;
  brandName?: string;
  hasIntegration: boolean;
  onIntegrationChange?: () => void;
}

export const CMSIntegrationCard = ({ 
  brandId, 
  brandName,
  hasIntegration,
  onIntegrationChange 
}: CMSIntegrationCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCMSDialog, setShowCMSDialog] = useState(false);
  const [selectedCMSType, setSelectedCMSType] = useState<'wordpress' | 'shopify' | 'custom-api' | ''>('');
  const navigate = useNavigate();

  const handleOpenCMSDialog = (type: 'wordpress' | 'shopify') => {
    setSelectedCMSType(type);
    setShowCMSDialog(true);
  };

  const handleCustomClick = () => {
    // Open Brevo chat widget
    if (typeof (window as any).BrevoConversations !== 'undefined') {
      (window as any).BrevoConversations('openChat', true);
    } else {
      // Fallback if Brevo isn't loaded
      window.open('https://wa.me/66858420638', '_blank');
    }
  };

  const handleCMSSubmit = async (type: 'wordpress' | 'shopify', data: any) => {
    // Handle CMS integration submission - navigate to settings page
    setShowCMSDialog(false);
    navigate(`/app/settings?brand=${brandId}&tab=integrations`);
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-2 border-primary/10 hover:border-primary/20 transition-colors">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">CMS Integration</CardTitle>
                    <CardDescription className="mt-1">
                      Connect your content management system to publish articles automatically
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {!isOpen && (
                <p className="text-sm text-muted-foreground mt-2 ml-14">
                  Click to expand CMS settings
                </p>
              )}
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-6 ml-14">
              {hasIntegration ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-medium">✓ CMS Connected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your CMS is connected and ready to publish articles
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/settings?brand=${brandId}&tab=integrations`)}
                  >
                    Manage Integration
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Choose your CMS platform to get started:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handleOpenCMSDialog('wordpress')}
                    >
                      <div className="text-left">
                        <div className="font-semibold">WordPress</div>
                        <div className="text-xs text-muted-foreground">Connect via REST API</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={() => handleOpenCMSDialog('shopify')}
                      disabled
                    >
                      <div className="text-left">
                        <div className="font-semibold">Shopify</div>
                        <div className="text-xs text-muted-foreground">Coming soon</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start h-auto p-4"
                      onClick={handleCustomClick}
                    >
                      <div className="text-left">
                        <div className="font-semibold">Custom</div>
                        <div className="text-xs text-muted-foreground">Contact us</div>
                      </div>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <CMSDialog
        open={showCMSDialog}
        onOpenChange={setShowCMSDialog}
        selectedCMSType={selectedCMSType}
        onCMSTypeChange={setSelectedCMSType}
        currentBrandName={brandName}
        brandId={brandId}
        onSubmit={handleCMSSubmit}
      />
    </>
  );
};