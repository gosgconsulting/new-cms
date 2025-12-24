import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles, CheckCircle2, AlertCircle, ExternalLink, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES_WITH_POPULAR_FIRST, LANGUAGES_WITH_POPULAR_FIRST } from '@/data/countries-languages';
import { analyzeWebsite, checkExistingBrandAnalysis } from '@/utils/websiteAnalysis';
import { LinksManagementPanel } from '@/components/campaigns/LinksManagementPanel';

interface BrandInformationScannerProps {
  brandId: string;
  userId: string;
  currentWebsite?: string;
  currentName?: string;
  currentDescription?: string;
  currentTargetAudience?: string;
  currentBrandVoice?: string;
  currentCountry?: string;
  currentLanguage?: string;
  onUpdate?: () => void;
}

interface AutomationStep {
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  message?: string;
}

export const BrandInformationScanner = ({
  brandId,
  userId,
  currentWebsite,
  currentName,
  currentDescription,
  currentTargetAudience,
  currentBrandVoice,
  currentCountry,
  currentLanguage,
  onUpdate
}: BrandInformationScannerProps) => {
  const [websiteUrl, setWebsiteUrl] = useState(currentWebsite || '');
  const [brandName, setBrandName] = useState(currentName || '');
  const [brandDescription, setBrandDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keySellingPoints, setKeySellingPoints] = useState<string[]>([]);
  const [brandInformation, setBrandInformation] = useState('');
  const [country, setCountry] = useState(currentCountry || 'United States');
  const [language, setLanguage] = useState(currentLanguage || 'English');
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [automationSteps, setAutomationSteps] = useState<AutomationStep[]>([
    { name: 'Analyzing website content', status: 'pending' },
    { name: 'Discovering sitemap', status: 'pending' },
  ]);

  useEffect(() => {
    setBrandName(currentName || '');
    setCountry(currentCountry || 'United States');
    setLanguage(currentLanguage || 'English');
    setBrandDescription(currentDescription || '');
    setTargetAudience(currentTargetAudience || '');
    
    // Load existing analysis data if available
    loadAnalysisData();
  }, [currentName, currentDescription, currentTargetAudience, currentBrandVoice, currentCountry, currentLanguage, brandId]);

  const loadAnalysisData = async () => {
    try {
      const brandAnalysis = await checkExistingBrandAnalysis(brandId);

      if (brandAnalysis) {
        // Set editable fields from stored analysis
        if (brandAnalysis.brand_name) {
          setBrandName(brandAnalysis.brand_name);
        }
        if (brandAnalysis.brand_description) {
          setBrandDescription(brandAnalysis.brand_description);
        }
        if (brandAnalysis.target_audience) {
          setTargetAudience(brandAnalysis.target_audience);
        }
        if (brandAnalysis.key_selling_points?.length > 0) {
          setKeySellingPoints(brandAnalysis.key_selling_points);
        }

        // Convert database format to component format for display
        const formattedData = {
          website_analysis: {
            brand_name: brandAnalysis.brand_name,
            brand_description: brandAnalysis.brand_description,
            target_audience: brandAnalysis.target_audience,
            key_selling_points: brandAnalysis.key_selling_points,
            sitemap_url: brandAnalysis.sitemap_url,
            total_sitemap_links: brandAnalysis.total_sitemap_links
          },
          backlinks: brandAnalysis.backlinks || [],
          keywords: brandAnalysis.keywords || [],
          competitors: brandAnalysis.competitors || []
        };
        setAnalysisData(formattedData);
        setShowAnalysis(true);
      }
    } catch (error) {
      console.error('Error loading analysis data:', error);
    }
  };

  const updateAutomationStep = (index: number, status: AutomationStep['status'], message?: string) => {
    setAutomationSteps(prev => prev.map((step, idx) => 
      idx === index ? { ...step, status, message } : step
    ));
  };

  const handleScan = async () => {
    if (!websiteUrl) {
      toast.error('Please enter a website URL');
      return;
    }

    // Validate URL format
    try {
      new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsScanning(true);
    setAutomationSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })));

    try {
      const result = await analyzeWebsite(websiteUrl, {
        brandId,
        userId,
        saveToDatabase: true,
        onStepUpdate: updateAutomationStep
      });

      // Extract and populate fields from analysis
      if (result.website_analysis?.brand_name && result.website_analysis.brand_name !== 'Unknown') {
        setBrandName(result.website_analysis.brand_name);
      }

      if (result.website_analysis?.brand_description) {
        setBrandDescription(result.website_analysis.brand_description);
      }

      if (result.website_analysis?.target_audience && result.website_analysis.target_audience !== 'Not specified') {
        setTargetAudience(result.website_analysis.target_audience);
      }

      if (result.website_analysis?.key_selling_points?.length > 0) {
        setKeySellingPoints(result.website_analysis.key_selling_points);
      }

      setAnalysisData(result);
      setShowAnalysis(true);

      // Automatically import discovered sitemap links to seo_internal_links table
      if (result.backlinks && result.backlinks.length > 0) {
        try {
          const linksToImport = result.backlinks.map((link: any) => ({
            url: typeof link === 'string' ? link : link.url,
            type: 'Internal' as const,
            brand_id: brandId,
            user_id: userId
          }));

          const { error: importError } = await supabase
            .from('seo_internal_links')
            .upsert(linksToImport, {
              onConflict: 'url,brand_id,user_id',
              ignoreDuplicates: true
            });

          if (importError) {
            console.error('Error importing sitemap links:', importError);
          }
        } catch (importError) {
          console.error('Failed to import sitemap links:', importError);
        }
      }

      toast.success('Website analyzed successfully');
    } catch (error: any) {
      console.error('Scan error:', error);
      toast.error(error.message || 'Failed to scan website');
      // Mark all pending/loading steps as error
      setAutomationSteps(prev => prev.map(step => 
        step.status === 'loading' || step.status === 'pending' 
          ? { ...step, status: 'error' as const } 
          : step
      ));
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Normalize website URL before saving
      const normalizedUrl = websiteUrl.trim() 
        ? (websiteUrl.startsWith('http://') || websiteUrl.startsWith('https://') 
            ? websiteUrl 
            : `https://${websiteUrl}`)
        : '';

      const { error } = await supabase
        .from('brands')
        .update({
          website: normalizedUrl,
          name: brandName,
          description: brandDescription,
          target_audience: targetAudience,
          country: country,
          language: language,
          key_selling_points: keySellingPoints.filter(k => k.trim() !== ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', brandId)
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Brand information saved successfully');
      onUpdate?.();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save brand information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeySellingPoint = () => {
    setKeySellingPoints([...keySellingPoints, '']);
  };

  const handleUpdateKeySellingPoint = (index: number, value: string) => {
    const updated = [...keySellingPoints];
    updated[index] = value;
    setKeySellingPoints(updated);
  };

  const handleRemoveKeySellingPoint = (index: number) => {
    setKeySellingPoints(keySellingPoints.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Information</CardTitle>
        <CardDescription>
          Scan your website to automatically extract brand details for content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        {!showAnalysis && (
          <>
              <div className="space-y-2">
                <Label htmlFor="website-url">Website URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="website-url"
                    type="text"
                    placeholder="example.com or https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    disabled={isScanning || isSaving}
                  />
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !websiteUrl || isSaving}
                  className="min-w-[100px]"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Scan
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically extracts brand name, description, target audience, keywords, sitemap, and competitors
              </p>
            </div>
          </>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Analysis Progress</h3>
            <div className="space-y-3">
              {automationSteps.map((step, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-3">
                    {step.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    {step.status === 'complete' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {step.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                    {step.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                    <span className={`text-sm ${step.status === 'complete' ? 'text-muted-foreground' : ''}`}>
                      {step.name}
                    </span>
                    {step.message && step.status === 'complete' && (
                      <span className="text-xs text-green-600 ml-auto">{step.message}</span>
                    )}
                  </div>
                  {step.message && step.status === 'error' && (
                    <p className="text-xs text-destructive ml-7">{step.message}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Analysis Results */}
        {showAnalysis && analysisData && !isScanning && (
          <>
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  type="text"
                  placeholder="example.com or https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isScanning || isSaving}
                />
                <Button 
                  onClick={handleScan}
                  disabled={isScanning || !websiteUrl || isSaving}
                  className="min-w-[100px]"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Re-scan
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically extracts brand name, description, target audience, keywords, sitemap, and competitors
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Website Analysis Results</Label>
              </div>
              <Tabs defaultValue="website" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="website">Website Information</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords Focus</TabsTrigger>
                  <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
                </TabsList>

                <TabsContent value="website" className="mt-6">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand-name">Brand Name</Label>
                        <Input
                          id="brand-name"
                          placeholder="Your brand name"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          disabled={isScanning || isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Brand description..."
                          value={brandDescription}
                          onChange={(e) => setBrandDescription(e.target.value)}
                          disabled={isScanning || isSaving}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target-audience">Target Audience</Label>
                        <Textarea
                          id="target-audience"
                          placeholder="Target audience..."
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          disabled={isScanning || isSaving}
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Key Selling Points</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddKeySellingPoint}
                            disabled={isScanning || isSaving}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {keySellingPoints.map((point, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                placeholder="Key selling point..."
                                value={point}
                                onChange={(e) => handleUpdateKeySellingPoint(idx, e.target.value)}
                                disabled={isScanning || isSaving}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveKeySellingPoint(idx)}
                                disabled={isScanning || isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {keySellingPoints.length === 0 && (
                            <p className="text-sm text-muted-foreground">No key selling points added yet</p>
                          )}
                        </div>
                      </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                         <div className="space-y-2">
                           <Label htmlFor="country">Country</Label>
                           <SearchableSelect
                             options={COUNTRIES_WITH_POPULAR_FIRST}
                             value={country}
                             onValueChange={setCountry}
                             placeholder="Select country"
                             searchPlaceholder="Search countries..."
                             disabled={isScanning || isSaving}
                           />
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="language">Language</Label>
                           <SearchableSelect
                             options={LANGUAGES_WITH_POPULAR_FIRST}
                             value={language}
                             onValueChange={setLanguage}
                             placeholder="Select language"
                             searchPlaceholder="Search languages..."
                             disabled={isScanning || isSaving}
                           />
                         </div>
                       </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="keywords" className="mt-6">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Keywords Focus</Label>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {analysisData.keywords && analysisData.keywords.length > 0 ? (
                            analysisData.keywords.map((keyword: string, idx: number) => (
                              <Badge key={idx} variant="outline">{keyword}</Badge>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No keywords found</p>
                          )}
                        </div>
                        {analysisData.keywords && analysisData.keywords.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-4">
                            {analysisData.keywords.length} keywords extracted from your website
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="sitemap" className="mt-6">
                  {/* Sitemap Metadata - Discovery Info */}
                  {analysisData.website_analysis?.sitemap_url && (
                    <Card className="p-4 mb-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Discovered Sitemap</Label>
                        <div className="flex items-start gap-2">
                          <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <a
                              href={analysisData.website_analysis.sitemap_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline break-all"
                            >
                              {analysisData.website_analysis.sitemap_url}
                            </a>
                            {analysisData.website_analysis?.total_sitemap_links && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {analysisData.website_analysis.total_sitemap_links} pages discovered from sitemap analysis
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Unified Links Management Table */}
                  <LinksManagementPanel 
                    brandId={brandId} 
                    userId={userId}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving || isScanning}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Brand Information
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};