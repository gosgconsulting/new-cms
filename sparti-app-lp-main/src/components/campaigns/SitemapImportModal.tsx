import { useState, useCallback } from 'react';
import { Plus, Search, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Reusable Links List Component
interface LinksListProps {
  links: string[];
  selectedLinks: string[];
  onToggleSelection: (url: string, checked: boolean) => void;
  onSelectAll: (checked: boolean, allLinks: string[]) => void;
  onImportSelected: (selectedLinks: string[]) => void;
  isImporting: boolean;
  title: string;
}

const LinksList = ({ 
  links, 
  selectedLinks, 
  onToggleSelection, 
  onSelectAll, 
  onImportSelected, 
  isImporting, 
  title 
}: LinksListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="selectAll"
              checked={selectedLinks.length === links.length}
              onCheckedChange={(checked) => onSelectAll(checked as boolean, links)}
            />
            <Label htmlFor="selectAll" className="cursor-pointer text-sm">
              Select all
            </Label>
          </div>
          <Button
            onClick={() => onImportSelected(selectedLinks)}
            disabled={selectedLinks.length === 0 || isImporting}
            size="sm"
          >
            {isImporting ? (
              <>
                <Plus className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Import Selected ({selectedLinks.length})
              </>
            )}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[400px] border rounded-md p-4">
        <div className="space-y-2">
          {links.map((url, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md">
              <Checkbox
                id={`link-${index}`}
                checked={selectedLinks.includes(url)}
                onCheckedChange={(checked) => onToggleSelection(url, checked as boolean)}
              />
              <Label
                htmlFor={`link-${index}`}
                className="text-sm cursor-pointer flex-1 truncate"
                title={url}
              >
                {url}
              </Label>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface SitemapImportModalProps {
  brandId: string;
  userId: string;
  onImportSuccess?: () => void;
}

interface LinkData {
  url: string;
  type: 'Internal' | 'External';
  country_id: string | null;
  brand_id: string;
  user_id: string;
}

// API Functions
const upsertMultipleLinks = async (linksData: LinkData[]): Promise<{ data: any[]; duplicatesRemoved: number }> => {
  // Deduplicate URLs within the batch to prevent "cannot affect row a second time" error
  const uniqueLinks = new Map<string, LinkData>();
  
  linksData.forEach(link => {
    const key = `${link.url.toLowerCase().trim()}|${link.brand_id}|${link.user_id}`;
    // Keep the last occurrence if there are duplicates in the batch
    uniqueLinks.set(key, link);
  });
  
  const deduplicatedLinks = Array.from(uniqueLinks.values());
  const duplicatesRemoved = linksData.length - deduplicatedLinks.length;
  
  const { data, error } = await supabase
    .from('seo_internal_links')
    .upsert(deduplicatedLinks, { 
      onConflict: 'url,brand_id,user_id',
      ignoreDuplicates: false 
    })
    .select();

  if (error) throw error;
  return { data, duplicatesRemoved };
};

export const SitemapImportModal = ({ brandId, userId, onImportSuccess }: SitemapImportModalProps) => {
  const queryClient = useQueryClient();
  
  // Modal state
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);
  
  // Manual sitemap states
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [scannedLinks, setScannedLinks] = useState<string[]>([]);
  const [selectedSitemapLinks, setSelectedSitemapLinks] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [sitemapError, setSitemapError] = useState<string | null>(null);
  
  // Domain discovery states
  const [checkSitemapUrl, setCheckSitemapUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    sitemapUrl: string;
    links: string[];
    totalLinks: number;
    fetchedSitemaps?: string[];
    error?: string;
  } | null>(null);

  // Mutation for importing links
  const importLinksMutation = useMutation({
    mutationFn: upsertMultipleLinks,
    onSuccess: ({ data, duplicatesRemoved }) => {
      queryClient.invalidateQueries({ queryKey: ['seo-internal-links', brandId, userId] });
      
      let successMessage = `Imported ${data.length} internal links`;
      if (duplicatesRemoved > 0) {
        successMessage += ` (${duplicatesRemoved} duplicate${duplicatesRemoved > 1 ? 's' : ''} removed from batch)`;
      }
      toast.success(successMessage);
      
      // Reset modal state
      setSitemapModalOpen(false);
      setSitemapUrl('');
      setScannedLinks([]);
      setSelectedSitemapLinks([]);
      setCheckResult(null);
      setCheckSitemapUrl('');
      
      // Notify parent of successful import
      if (onImportSuccess) {
        onImportSuccess();
      }
    },
    onError: (error: any) => {
      console.error('Error importing links:', error);
      toast.error('Failed to import links');
    },
  });

  // Domain sitemap discovery
  const handleCheckSitemap = useCallback(async () => {
    if (!checkSitemapUrl.trim()) {
      toast.error('Please enter a website domain');
      return;
    }

    setIsChecking(true);
    setCheckResult(null);
    setSelectedSitemapLinks([]);

    try {
      // Use the new domain-based sitemap discovery function
      const { data, error } = await supabase.functions.invoke('domain-sitemap-discovery', {
        body: { domain: checkSitemapUrl.trim() }
      });

      if (error) throw error;

      setCheckResult({
        found: data.success,
        sitemapUrl: data.sitemapUrl || checkSitemapUrl.trim(),
        links: data.links || [],
        totalLinks: data.totalLinks || 0,
        error: data.error,
        fetchedSitemaps: data.fetchedSitemaps
      });

      if (data.success) {
        let successMessage = `✅ Sitemap Found - ${data.totalLinks} pages discovered at ${data.sitemapUrl}`;
        
        // Show information about sub-sitemaps if any were fetched
        if (data.fetchedSitemaps && data.fetchedSitemaps.length > 1) {
          successMessage += ` (fetched ${data.fetchedSitemaps.length} sitemap files)`;
        }
        
        successMessage += `. Select the pages you want to import below.`;
        toast.success(successMessage);
      } else {
        // Show more helpful error message with discovered URLs if available
        let errorMessage = data.error || 'No sitemap found for this website';
        
        if (data.discoveredUrls && data.discoveredUrls.length > 0) {
          errorMessage += `. Checked ${data.discoveredUrls.length} potential sitemap locations.`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error checking sitemap:', error);
      const errorMessage = error.message || 'Failed to check sitemap';
      setCheckResult({
        found: false,
        sitemapUrl: checkSitemapUrl.trim(),
        links: [],
        totalLinks: 0,
        error: errorMessage
      });
      toast.error(errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, [checkSitemapUrl]);

  // Manual sitemap scanning
  const handleScanSitemap = useCallback(async () => {
    if (!sitemapUrl.trim()) {
      toast.error('Please enter a valid sitemap URL');
      return;
    }

    setIsScanning(true);
    setSitemapError(null);
    setSelectedSitemapLinks([]);

    try {
      const { data, error } = await supabase.functions.invoke('sitemap-scanner', {
        body: { sitemapUrl: sitemapUrl.trim() }
      });

      if (data && !data.success && data.error) {
        setSitemapError(data.error);
        toast.error(data.error);
        
        if (data.error.includes('automatically detect')) {
          toast.error('💡 Tip: Try entering the full sitemap URL (e.g., https://example.com/sitemap.xml)');
        } else if (data.error.includes('website restrictions') || data.error.includes('security restrictions')) {
          toast.error('💡 Tip: Try a different sitemap URL or contact the website owner for access');
        }
        return;
      }

      if (error && !data) {
        throw new Error(error.message || 'Failed to scan sitemap');
      }

      if (data && data.success && data.links) {
        setScannedLinks(data.links);
        setSelectedSitemapLinks([]);
        setSitemapError(null);
        toast.success(`Found ${data.totalLinks} links in sitemap. Select the pages you want to import below.`);
      } else {
        const errorMessage = 'No links found in sitemap';
        setSitemapError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Sitemap scanning error:', error);
      
      let errorMessage = 'Failed to scan sitemap. Please check the URL and try again.';
      
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'Access denied: This sitemap is protected. Please try a different sitemap URL.';
      } else if (error.message.includes('404') || error.message.includes('Not Found')) {
        errorMessage = 'Sitemap not found. Please verify the URL is correct.';
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        errorMessage = 'Request timed out. The website may be slow or overloaded. Please try again.';
      } else if (error.message.includes('CORS') || error.message.includes('CORS')) {
        errorMessage = 'CORS error: The website blocks external requests. Please try a different sitemap.';
      }
      
      setSitemapError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }, [sitemapUrl]);

  // Import selected links
  const handleImportSelectedLinks = useCallback((linksToImport: string[]) => {
    const linksData: LinkData[] = linksToImport.map(url => ({
      url,
      type: 'Internal' as const,
      country_id: null,
      brand_id: brandId,
      user_id: userId
    }));

    importLinksMutation.mutate(linksData);
  }, [brandId, userId, importLinksMutation]);

  // Toggle link selection
  const toggleLinkSelection = useCallback((url: string, checked: boolean) => {
    if (checked) {
      setSelectedSitemapLinks(prev => [...prev, url]);
    } else {
      setSelectedSitemapLinks(prev => prev.filter(link => link !== url));
    }
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback((checked: boolean, allLinks: string[]) => {
    if (checked) {
      setSelectedSitemapLinks([...allLinks]);
    } else {
      setSelectedSitemapLinks([]);
    }
  }, []);

  return (
    <Dialog open={sitemapModalOpen} onOpenChange={setSitemapModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Sitemap
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Import Links from Sitemap</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="xml" className="w-full max-w-[53rem]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xml">Domain Sitemap Discovery</TabsTrigger>
            <TabsTrigger value="manual">Manual Sitemap URL</TabsTrigger>
          </TabsList>
          
          {/* Domain Discovery Tab */}
          <TabsContent value="xml" className="space-y-4 mt-4">
            {!checkResult ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="check-sitemap-url">Website Domain</Label>
                  <Input
                    id="check-sitemap-url"
                    placeholder="example.com or https://example.com"
                    className="font-mono text-sm"
                    value={checkSitemapUrl}
                    onChange={(e) => setCheckSitemapUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isChecking) {
                        handleCheckSitemap();
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your website domain (e.g., example.com) and we'll automatically discover and scan your sitemap. We'll check common sitemap locations and robots.txt for sitemap references.
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button variant="outline" onClick={() => setSitemapModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCheckSitemap} disabled={isChecking || !checkSitemapUrl.trim()}>
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      'Discover Sitemap'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {checkResult.found ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-green-900">Sitemap Found</h4>
                          <div className="text-sm text-green-800 space-y-1">
                            <p className="font-mono text-xs break-all">{checkResult.sitemapUrl}</p>
                            <p className="font-semibold">Pages discovered: {checkResult.totalLinks}</p>
                            {checkResult.fetchedSitemaps && checkResult.fetchedSitemaps.length > 1 && (
                              <p className="text-xs text-green-700">
                                Fetched from {checkResult.fetchedSitemaps.length} sitemap files (including sub-sitemaps)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Links List */}
                    <LinksList
                      links={checkResult.links}
                      selectedLinks={selectedSitemapLinks}
                      onToggleSelection={toggleLinkSelection}
                      onSelectAll={toggleSelectAll}
                      onImportSelected={handleImportSelectedLinks}
                      isImporting={importLinksMutation.isPending}
                      title={`Found ${checkResult.links.length} Internal Links`}
                    />
                    
                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCheckResult(null);
                          setCheckSitemapUrl('');
                          setSelectedSitemapLinks([]);
                        }}
                      >
                        Check Another
                      </Button>
                      <Button
                        onClick={() => {
                          setSitemapModalOpen(false);
                          setCheckResult(null);
                          setCheckSitemapUrl('');
                          setSelectedSitemapLinks([]);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <h4 className="font-semibold text-red-900">No Sitemap Found</h4>
                          <p className="text-sm text-red-800">
                            {checkResult.error || 'Could not locate a sitemap for this website'}
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            Try using the Manual tab to enter the sitemap URL directly if you know it.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCheckResult(null);
                          setCheckSitemapUrl('');
                        }}
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={() => {
                          setCheckResult(null);
                          setCheckSitemapUrl('');
                          setSitemapModalOpen(false);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Manual Sitemap Tab */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="sitemapUrl">Sitemap URL</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="sitemapUrl"
                    placeholder="https://example.com/sitemap.xml"
                    value={sitemapUrl}
                    onChange={(e) => setSitemapUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isScanning) {
                        handleScanSitemap();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleScanSitemap}
                    disabled={isScanning || !sitemapUrl.trim()}
                  >
                    {isScanning ? (
                      <>
                        <Search className="h-4 w-4 mr-2 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Scan
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your website's sitemap URL or domain name
                </p>
                {sitemapError && (
                  <p className="text-sm text-destructive">{sitemapError}</p>
                )}
              </div>
            </div>

            {scannedLinks.length > 0 && (
              <div className="space-y-4">
                <LinksList
                  links={scannedLinks}
                  selectedLinks={selectedSitemapLinks}
                  onToggleSelection={toggleLinkSelection}
                  onSelectAll={toggleSelectAll}
                  onImportSelected={handleImportSelectedLinks}
                  isImporting={importLinksMutation.isPending}
                  title={`Found ${scannedLinks.length} Internal Links`}
                />

                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSitemapModalOpen(false);
                      setSitemapUrl('');
                      setScannedLinks([]);
                      setSelectedSitemapLinks([]);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
