import { useEffect, useState } from 'react';
import { useCopilot } from '@/contexts/CopilotContext';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SEMCampaignModalContentProps {
  onClose: () => void;
  campaignId?: string;
}

const SEMCampaignModalContent = ({ onClose, campaignId }: SEMCampaignModalContentProps) => {
  const { selectedBrand } = useCopilot();
  const { user } = useAuth();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form data
  const [campaignName, setCampaignName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [landingPageUrls, setLandingPageUrls] = useState<string[]>(['']);
  const [objectives, setObjectives] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Step 2: Keywords clusters
  const [keywordClusters, setKeywordClusters] = useState<any[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  
  // Step 3: Search settings
  const [location, setLocation] = useState('Singapore');
  const [language, setLanguage] = useState('en');
  const [isSearching, setIsSearching] = useState(false);
  
  // Step 4: Results
  const [adResults, setAdResults] = useState<any[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdGroup, setSelectedAdGroup] = useState<any>(null);

  const totalSteps = 4;

  const addLandingPageUrl = () => {
    setLandingPageUrls([...landingPageUrls, '']);
  };

  const removeLandingPageUrl = (index: number) => {
    setLandingPageUrls(landingPageUrls.filter((_, i) => i !== index));
  };

  const updateLandingPageUrl = (index: number, value: string) => {
    const updated = [...landingPageUrls];
    updated[index] = value;
    setLandingPageUrls(updated);
  };

  const handleAnalyzeUrls = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sem-analyze-urls', {
        body: {
          brandId: selectedBrand.id,
          websiteUrl,
          landingPageUrls: landingPageUrls.filter(url => url.trim()),
          objectives
        }
      });

      if (error) throw error;
      
      setKeywordClusters(data.clusters || []);
      toast.success('URLs analyzed successfully!');
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Error analyzing URLs:', error);
      toast.error(error.message || 'Failed to analyze URLs');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleClusterSelection = (clusterId: string) => {
    setSelectedClusters(prev =>
      prev.includes(clusterId)
        ? prev.filter(id => id !== clusterId)
        : [...prev, clusterId]
    );
  };

  const handleSearchOnWeb = async () => {
    if (selectedClusters.length === 0) {
      toast.error('Please select at least one keyword cluster');
      return;
    }

    setIsSearching(true);
    try {
      const selectedClusterData = keywordClusters.filter(c => 
        selectedClusters.includes(c.id)
      );

      const { data, error } = await supabase.functions.invoke('sem-search-and-analyze', {
        body: {
          clusters: selectedClusterData,
          location,
          language,
          landingPageUrls: landingPageUrls.filter(url => url.trim()),
          brandId: selectedBrand.id
        }
      });

      if (error) throw error;
      
      setAdResults(data.adGroups || []);
      toast.success('Ad research completed!');
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error searching web:', error);
      toast.error(error.message || 'Failed to search and analyze ads');
    } finally {
      setIsSearching(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return campaignName && websiteUrl && landingPageUrls.some(url => url.trim());
      case 1:
        return selectedClusters.length > 0;
      case 2:
        return location && language;
      case 3:
        return adResults.length > 0;
      default:
        return true;
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onClose();
  };

  const handleNextClick = async () => {
    if (currentStep === 0) {
      await handleAnalyzeUrls();
    } else if (currentStep === 2) {
      await handleSearchOnWeb();
    } else if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSaveCampaign();
    }
  };

  const handleBackClick = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveCampaign = async () => {
    if (!selectedBrand?.id || !user?.id) {
      toast.error('Missing brand or user information');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sem_campaigns')
        .insert({
          name: campaignName,
          brand_id: selectedBrand.id,
          user_id: user.id,
          website_url: websiteUrl,
          landing_page_urls: landingPageUrls.filter(url => url.trim()),
          objectives,
          location,
          language,
          ad_groups: adResults,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('SEM Campaign saved:', data);
      toast.success('SEM Campaign saved successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error saving SEM campaign:', error);
      toast.error(error.message || 'Failed to save campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                placeholder="e.g., Spring Sale 2024"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL *</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://brand.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Landing Page URLs *</Label>
              {landingPageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://brand.com/page"
                    value={url}
                    onChange={(e) => updateLandingPageUrl(index, e.target.value)}
                  />
                  {landingPageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeLandingPageUrl(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLandingPageUrl}
                className="w-full"
              >
                + Add Landing Page URL
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Landing Page Objectives</Label>
              <Textarea
                id="objectives"
                placeholder="Describe the goals and objectives for these landing pages..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              The system will analyze the sitemap and content of each landing page URL to generate relevant keyword clusters.
            </p>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select keyword clusters to create ad groups. Each cluster will become one ad group with transactional/commercial focused keywords.
            </p>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              {keywordClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedClusters.includes(cluster.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleClusterSelection(cluster.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{cluster.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cluster.keywords?.length || 0} keywords
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cluster.keywords?.slice(0, 5).map((kw: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                        {cluster.keywords?.length > 5 && (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            +{cluster.keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedClusters.includes(cluster.id)}
                      onChange={() => {}}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            {keywordClusters.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No keyword clusters generated yet. Please complete Step 1.
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Singapore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ms">Malay</SelectItem>
                  <SelectItem value="ta">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-muted-foreground">
              The system will generate relevant search terms for each keyword cluster, perform web searches, and analyze existing ads including headlines, descriptions, sitelinks, and callouts.
            </p>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Ad Group</th>
                    <th className="text-left p-3 font-medium">Keywords</th>
                    <th className="text-left p-3 font-medium">Headlines</th>
                    <th className="text-left p-3 font-medium">Descriptions</th>
                    <th className="text-left p-3 font-medium">Sitelinks</th>
                  </tr>
                </thead>
                <tbody>
                  {adResults.map((adGroup, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-3">{adGroup.name}</td>
                      <td className="p-3">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedAdGroup(adGroup);
                            setShowDetailModal(true);
                          }}
                          className="p-0 h-auto"
                        >
                          {adGroup.keywords?.length || 0} keywords
                        </Button>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedAdGroup(adGroup);
                            setShowDetailModal(true);
                          }}
                          className="p-0 h-auto"
                        >
                          {adGroup.headlines?.length || 0} headlines
                        </Button>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedAdGroup(adGroup);
                            setShowDetailModal(true);
                          }}
                          className="p-0 h-auto"
                        >
                          {adGroup.descriptions?.length || 0} descriptions
                        </Button>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => {
                            setSelectedAdGroup(adGroup);
                            setShowDetailModal(true);
                          }}
                          className="p-0 h-auto"
                        >
                          {adGroup.sitelinks?.length || 0} sitelinks
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {adResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No ad results yet. Please complete the previous steps.
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Landing Pages Analysis';
      case 1:
        return 'Select Keywords Clusters';
      case 2:
        return 'Search on Web';
      case 3:
        return 'Results';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">New SEM Campaign</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {getStepTitle()} - Step {currentStep + 1} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

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
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBackClick}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNextClick}
              disabled={!canProceed() || isLoading || isAnalyzing || isSearching}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : currentStep === 0 ? (
                'Analyze URLs'
              ) : currentStep === 2 ? (
                'Search on Web'
              ) : currentStep === totalSteps - 1 ? (
                'Save SEM Campaign'
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Campaign Creation?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost. Are you sure you want to cancel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Yes, Cancel</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ad Details Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAdGroup?.name} - Ad Details</DialogTitle>
          </DialogHeader>
          
          {selectedAdGroup && (
            <div className="space-y-6">
              {/* Keywords */}
              <div>
                <h3 className="font-semibold mb-2">Keywords ({selectedAdGroup.keywords?.length || 0})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAdGroup.keywords?.map((kw: string, idx: number) => (
                    <span key={idx} className="bg-secondary px-3 py-1 rounded text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Headlines */}
              <div>
                <h3 className="font-semibold mb-2">Headlines ({selectedAdGroup.headlines?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedAdGroup.headlines?.map((headline: string, idx: number) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      {idx + 1}. {headline}
                    </div>
                  ))}
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <h3 className="font-semibold mb-2">Descriptions ({selectedAdGroup.descriptions?.length || 0})</h3>
                <div className="space-y-2">
                  {selectedAdGroup.descriptions?.map((desc: string, idx: number) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      {idx + 1}. {desc}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sitelinks */}
              <div>
                <h3 className="font-semibold mb-2">Sitelinks ({selectedAdGroup.sitelinks?.length || 0})</h3>
                <div className="space-y-3">
                  {selectedAdGroup.sitelinks?.map((sitelink: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded">
                      <div className="font-medium">{sitelink.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{sitelink.url}</div>
                      <div className="mt-2 space-y-1">
                        {sitelink.descriptions?.map((desc: string, descIdx: number) => (
                          <div key={descIdx} className="text-sm">
                            {desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface SEMCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
}

export const SEMCampaignModal = ({ open, onOpenChange, campaignId }: SEMCampaignModalProps) => {
  const { selectedBrand } = useCopilot();
  const { user } = useAuth();

  if (!selectedBrand || !user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <SEMCampaignModalContent 
          onClose={() => onOpenChange(false)} 
          campaignId={campaignId}
        />
      </DialogContent>
    </Dialog>
  );
};
