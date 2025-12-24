import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ChevronRight, Check, Loader2, Hotel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { LobstrService, ScrapedLead, ProgressCallback } from '@/services/lobstrService';
import { supabase } from '@/integrations/supabase/client';
import { LeadsScrapingForm } from './LeadsScrapingForm';
import { LeadsResultsTable } from './LeadsResultsTable';

interface NewLeadsCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StepStatus {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  errorMessage?: string;
}

type DataSource = 'google_maps' | 'google_hotels' | 'tripadvisor';

export const NewLeadsCampaignModal = ({ open, onOpenChange }: NewLeadsCampaignModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([]);
  const [campaignData, setCampaignData] = useState({
    activity: '',
    location: '',
    runId: ''
  });

  const dataSources = [
    {
      id: 'google_maps' as DataSource,
      name: 'Google Maps',
      description: 'Extract business data from Google Maps',
      icon: MapPin,
      available: true,
    },
    {
      id: 'google_hotels' as DataSource,
      name: 'Google Hotels',
      description: 'Extract hotel data with rooms, amenities, and pricing',
      icon: Hotel,
      available: true,
    },
    {
      id: 'tripadvisor' as DataSource,
      name: 'Tripadvisor',
      description: 'Extract business data from Tripadvisor',
      icon: MapPin,
      available: false,
      comingSoon: true,
    },
  ];

  const handleSourceSelect = (source: DataSource) => {
    if (source === 'tripadvisor') {
      toast.info('Tripadvisor integration coming soon!');
      return;
    }
    setSelectedSource(source);
    setCurrentStep(2);
  };

  const handleScrapingComplete = (leads: ScrapedLead[], runId: string, query: string, location: string) => {
    setScrapedLeads(leads);
    setCampaignData({
      activity: query,
      location: location,
      runId: runId
    });
    setCurrentStep(3);
    toast.success(`Successfully scraped ${leads.length} leads!`);
  };

  const handleSaveLeads = async () => {
    if (!user || scrapedLeads.length === 0) {
      toast.error('No leads to save');
      return;
    }

    setIsLoading(true);
    try {
      // Leads are already saved to google_search_results by the scraping service
      // Just close the modal and refresh the campaigns list
      toast.success('Leads campaign saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['leads-campaigns-list'] });
      handleClose();
    } catch (error) {
      console.error('Error saving leads campaign:', error);
      toast.error('Failed to save leads campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedSource(null);
    setScrapedLeads([]);
    setCampaignData({ activity: '', location: '', runId: '' });
    setIsLoading(false);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Leads Campaign</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && 'Choose a data source to start scraping business leads'}
            {currentStep === 2 && 'Configure your scraping parameters'}
            {currentStep === 3 && 'Review and save your scraped leads'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 my-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {currentStep > step ? <Check className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <ChevronRight
                  className={cn(
                    'h-5 w-5 mx-2',
                    currentStep > step ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Choose Source */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSources.map((source) => (
                <Card
                  key={source.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg',
                    !source.available && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => source.available && handleSourceSelect(source.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <source.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{source.name}</h3>
                          {source.comingSoon && (
                            <Badge variant="secondary" className="text-xs">
                              Coming Soon
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {source.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Scraping Form */}
        {currentStep === 2 && selectedSource === 'google_maps' && (
          <div className="space-y-4">
            <LeadsScrapingForm
              onComplete={handleScrapingComplete}
              onBack={handleBack}
            />
          </div>
        )}

        {currentStep === 2 && selectedSource === 'google_hotels' && (
          <div className="space-y-4">
            <LeadsScrapingForm
              onComplete={handleScrapingComplete}
              onBack={handleBack}
              sourceType="hotels"
            />
          </div>
        )}

        {/* Step 3: Results Table */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <LeadsResultsTable leads={scrapedLeads} />
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSaveLeads} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Leads'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
