import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Search, Trash2, Edit2, X, Share2, Copy, ExternalLink as LinkIcon, Loader2, FileText, Sparkles, FileCode, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SitemapImportModal } from './SitemapImportModal';
import SourceViewerModal from './SourceViewerModal';
import { BulkLinkAnalyzerModal } from './BulkLinkAnalyzerModal';

interface Country {
  id: string;
  name: string;
  flag_emoji: string;
}

interface LinkData {
  id: string;
  url: string;
  title?: string;
  description?: string;
  type: 'Internal' | 'External';
  keywords?: string[];
  country?: Country | null;
  country_id?: string | null;
  tag?: string;
  link_type?: 'page' | 'post' | 'shop' | 'product';
  language?: string;
  brand_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface LinksManagementPanelProps {
  brandId: string;
  userId: string;
  onSelectionChange?: (selectedLinks: LinkData[]) => void;
}

// Query functions
const fetchLinks = async (brandId: string, userId: string): Promise<LinkData[]> => {
  const { data, error } = await supabase
    .from('seo_internal_links')
    .select(`
      *,
      country:countries(id, name, flag_emoji)
    `)
    .eq('brand_id', brandId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

const addLink = async (linkData: Omit<LinkData, 'id' | 'created_at' | 'updated_at'>): Promise<LinkData> => {
  const { data, error } = await supabase
    .from('seo_internal_links')
    .insert(linkData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const deleteLink = async (linkId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('seo_internal_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) throw error;
};

const bulkDeleteLinks = async (linkIds: string[], userId: string): Promise<void> => {
  const { error } = await supabase
    .from('seo_internal_links')
    .delete()
    .in('id', linkIds)
    .eq('user_id', userId);

  if (error) throw error;
};

const addMultipleLinks = async (linksData: Omit<LinkData, 'id' | 'created_at' | 'updated_at'>[]): Promise<LinkData[]> => {
  const { data, error } = await supabase
    .from('seo_internal_links')
    .insert(linksData)
    .select();

  if (error) throw error;
  return data;
};

const upsertMultipleLinks = async (linksData: Omit<LinkData, 'id' | 'created_at' | 'updated_at'>[]): Promise<{ data: LinkData[]; duplicatesRemoved: number }> => {
  // Deduplicate URLs within the batch to prevent "cannot affect row a second time" error
  const uniqueLinks = new Map<string, Omit<LinkData, 'id' | 'created_at' | 'updated_at'>>();
  
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

const updateLink = async ({ linkId, keywords, country_id, tag }: { linkId: string; keywords?: string[]; country_id?: string | null; tag?: string | null }): Promise<void> => {
  const updateData: any = {};
  if (keywords !== undefined) updateData.keywords = keywords;
  if (country_id !== undefined) updateData.country_id = country_id;
  if (tag !== undefined) updateData.tag = tag;

  const { error } = await supabase
    .from('seo_internal_links')
    .update(updateData)
    .eq('id', linkId);

  if (error) throw error;
};

const fetchTrackedKeywords = async (brandId: string, userId: string) => {
  const { data, error } = await supabase
    .from('seo_tracked_keywords')
    .select('keyword')
    .eq('brand_id', brandId)
    .eq('user_id', userId)
    .order('keyword', { ascending: true });

  if (error) throw error;
  return data?.map(item => item.keyword) || [];
};

export const LinksManagementPanel = ({ brandId, userId, onSelectionChange }: LinksManagementPanelProps) => {
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  
  // Sitemap states
  const [checkSitemapUrl, setCheckSitemapUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    found: boolean;
    sitemapUrl: string;
    links: string[];
    totalLinks: number;
    error?: string;
  } | null>(null);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedLinks, setScannedLinks] = useState<string[]>([]);
  const [selectedSitemapLinks, setSelectedSitemapLinks] = useState<string[]>([]);
  const [sitemapError, setSitemapError] = useState<string | null>(null);

  // Source viewer modal state
  const [viewingSource, setViewingSource] = useState<{ url: string; title: string } | null>(null);
  
  // Bulk analyzer modal state
  const [showBulkAnalyzer, setShowBulkAnalyzer] = useState(false);

  // Edit states
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editKeywords, setEditKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedTrackedKeywords, setSelectedTrackedKeywords] = useState<string[]>([]);
  
  // Tag management states
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTagLinkId, setEditingTagLinkId] = useState<string | null>(null);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Share states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shares, setShares] = useState<any[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);

  // React Query hooks
  const { data: links = [], isLoading: loading, error } = useQuery({
    queryKey: ['seo-internal-links', brandId, userId],
    queryFn: () => fetchLinks(brandId, userId),
    enabled: !!brandId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { data: trackedKeywords = [] } = useQuery({
    queryKey: ['tracked-keywords', brandId, userId],
    queryFn: () => fetchTrackedKeywords(brandId, userId),
    enabled: !!brandId && !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const addSitemapLinksMutation = useMutation({
    mutationFn: addMultipleLinks,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seo-internal-links', brandId, userId] });
      setSelectedSitemapLinks([]);
      toast.success(`Added ${data.length} link${data.length > 1 ? 's' : ''} from sitemap`);
    },
    onError: (error: any) => {
      console.error('Error adding sitemap links:', error);
      toast.error('Failed to add links from sitemap');
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: ({ linkId }: { linkId: string }) => deleteLink(linkId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-internal-links', brandId, userId] });
      toast.success('Link removed successfully');
    },
    onError: (error) => {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: ({ linkIds }: { linkIds: string[] }) => bulkDeleteLinks(linkIds, userId),
    onSuccess: (_, { linkIds }) => {
      queryClient.invalidateQueries({ queryKey: ['seo-internal-links', brandId, userId] });
      setSelectedLinkIds([]);
      toast.success(`Deleted ${linkIds.length} link${linkIds.length > 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error('Error bulk deleting links:', error);
      toast.error('Failed to delete links');
    },
  });


  const updateLinkMutation = useMutation({
    mutationFn: updateLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-internal-links', brandId, userId] });
      toast.success('Link updated successfully');
      setEditDialogOpen(false);
      setEditingLinkId(null);
    },
    onError: (error) => {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    },
  });

  // Handle query error
  useEffect(() => {
    if (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    }
  }, [error]);

  const handleDeleteLink = (id: string) => {
    deleteLinkMutation.mutate({ linkId: id });
  };

  const handleBulkDelete = () => {
    if (selectedLinkIds.length === 0) return;
    bulkDeleteMutation.mutate({ linkIds: selectedLinkIds });
  };

  const toggleLinkSelection = (linkId: string, checked: boolean) => {
    const newSelectedIds = checked
      ? [...selectedLinkIds, linkId]
      : selectedLinkIds.filter(id => id !== linkId);
    
    setSelectedLinkIds(newSelectedIds);
    
    // Notify parent of selection change
    if (onSelectionChange && links.length > 0) {
      const selectedLinksData = links.filter(link => newSelectedIds.includes(link.id));
      onSelectionChange(selectedLinksData);
    }
  };

  const toggleSelectAllLinks = (checked: boolean) => {
    const newSelectedIds = checked ? filteredLinks.map(link => link.id) : [];
    setSelectedLinkIds(newSelectedIds);
    
    // Notify parent of selection change
    if (onSelectionChange) {
      const selectedLinksData = links.filter(link => newSelectedIds.includes(link.id));
      onSelectionChange(selectedLinksData);
    }
  };

  const handleRowClick = (linkId: string) => {
    const isSelected = selectedLinkIds.includes(linkId);
    toggleLinkSelection(linkId, !isSelected);
  };

  const handleCheckSitemap = async () => {
    if (!checkSitemapUrl.trim()) {
      toast.error('Please enter a website domain');
      return;
    }

    setIsChecking(true);
    setCheckResult(null);
    setSelectedSitemapLinks([]);

    try {
      // Use sitemap-scanner to find and scan the sitemap
      const { data, error } = await supabase.functions.invoke('sitemap-scanner', {
        body: { sitemapUrl: checkSitemapUrl.trim() }
      });

      if (error) throw error;

      setCheckResult({
        found: data.success,
        sitemapUrl: data.sitemapUrl || checkSitemapUrl.trim(),
        links: data.links || [],
        totalLinks: data.totalLinks || 0,
        error: data.error
      });

      if (data.success) {
        let successMessage = `✅ Sitemap Found - ${data.totalLinks} pages discovered`;
        toast.success(successMessage);
        setSelectedSitemapLinks(data.links || []);
      } else {
        toast.error(data.error || 'No sitemap found for this website');
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
  };

  const handleScanSitemap = async () => {
    if (!sitemapUrl.trim()) {
      toast.error('Please enter a valid sitemap URL');
      return;
    }

    setIsScanning(true);
    setSitemapError(null); // Clear previous errors
    
    try {
      // Call the sitemap scanner Edge Function
      const { data, error } = await supabase.functions.invoke('sitemap-scanner', {
        body: {
          sitemapUrl: sitemapUrl.trim()
        }
      });

      // Check if we have data with an error message (even if HTTP error occurred)
      if (data && !data.success && data.error) {
        setSitemapError(data.error);
        toast.error(data.error);
        
        // Show additional context based on error type
        if (data.error.includes('automatically detect')) {
          toast.error('💡 Tip: Try entering the full sitemap URL (e.g., https://example.com/sitemap.xml)');
        } else if (data.error.includes('website restrictions') || data.error.includes('security restrictions')) {
          toast.error('💡 Tip: Try a different sitemap URL or contact the website owner for access');
        }
        return;
      }

      // Handle generic network errors
      if (error && !data) {
        throw new Error(error.message || 'Failed to scan sitemap');
      }

      // Success case
      if (data && data.success && data.links) {
        setScannedLinks(data.links);
        setSelectedSitemapLinks([]);
        setSitemapError(null);
        toast.success(`Found ${data.totalLinks} links in sitemap`);
      } else {
        // Fallback error case
        const errorMessage = 'No links found in sitemap';
        setSitemapError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Sitemap scanning error:', error);
      
      // Provide more specific error messages based on error type
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
  };

  const handleAddSelectedLinks = async () => {
    // First, classify the links
    toast.info('Classifying links using AI...');

    try {
      const { data: classificationData, error: classError } = await supabase.functions.invoke(
        'classify-internal-links',
        {
          body: {
            links: selectedSitemapLinks.map(url => ({ url }))
          }
        }
      );

      if (classError) {
        console.error('Classification error:', classError);
        // Continue with default classifications
      }

      const classifications = (classificationData?.classifications || []) as Array<{
        url: string;
        link_type: 'page' | 'post' | 'shop' | 'product';
        language: string;
      }>;
      
      const classificationMap = new Map(
        classifications.map(c => [c.url, c])
      );

      const linksToInsert = selectedSitemapLinks.map(url => {
        const classification = classificationMap.get(url) || { link_type: 'page' as const, language: 'en' };
        return {
          url,
          type: 'Internal' as const,
          link_type: classification.link_type || 'page',
          language: classification.language || 'en',
          brand_id: brandId,
          user_id: userId
        };
      });

      addSitemapLinksMutation.mutate(linksToInsert);
    } catch (error) {
      console.error('Error classifying links:', error);
      // Fallback to default values
      const linksToInsert = selectedSitemapLinks.map(url => ({
        url,
        type: 'Internal' as const,
        link_type: 'page' as const,
        language: 'en',
        brand_id: brandId,
        user_id: userId
      }));

      addSitemapLinksMutation.mutate(linksToInsert);
    }
  };

  const toggleSitemapLinkSelection = (url: string, checked: boolean) => {
    if (checked) {
      setSelectedSitemapLinks(prev => [...prev, url]);
    } else {
      setSelectedSitemapLinks(prev => prev.filter(link => link !== url));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSitemapLinks([...scannedLinks]);
    } else {
      setSelectedSitemapLinks([]);
    }
  };

  const handleEditLink = (link: LinkData) => {
    setEditingLinkId(link.id);
    setEditKeywords(link.keywords || []);
    setSelectedTrackedKeywords([]);
    setNewKeyword('');
    setEditDialogOpen(true);
  };

  const handleEditTags = (link: LinkData) => {
    setEditingTagLinkId(link.id);
    // Parse tags from string (comma-separated or single tag)
    const tags = link.tag ? link.tag.split(',').map(t => t.trim()).filter(Boolean) : [];
    setEditTags(tags);
    setNewTag('');
    setTagDialogOpen(true);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editTags.includes(trimmedTag)) {
      setEditTags([...editTags, trimmedTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter(t => t !== tag));
  };

  const handleSaveTags = () => {
    if (!editingTagLinkId) return;
    
    // Join tags with commas or set to null if empty
    const tagValue = editTags.length > 0 ? editTags.join(', ') : null;
    
    updateLinkMutation.mutate({ 
      linkId: editingTagLinkId, 
      tag: tagValue 
    });
    
    setTagDialogOpen(false);
    setEditingTagLinkId(null);
    setEditTags([]);
    setNewTag('');
  };

  const handleSaveEdit = () => {
    if (!editingLinkId) return;
    
    updateLinkMutation.mutate({
      linkId: editingLinkId,
      keywords: editKeywords,
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !editKeywords.includes(newKeyword.trim())) {
      setEditKeywords([...editKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setEditKeywords(editKeywords.filter(k => k !== keyword));
  };

  const handleToggleTrackedKeyword = (keyword: string) => {
    if (editKeywords.includes(keyword)) {
      handleRemoveKeyword(keyword);
      setSelectedTrackedKeywords(selectedTrackedKeywords.filter(k => k !== keyword));
    } else {
      setEditKeywords([...editKeywords, keyword]);
      setSelectedTrackedKeywords([...selectedTrackedKeywords, keyword]);
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.keywords?.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Share link functions
  const fetchShares = async () => {
    setLoadingShares(true);
    try {
      const { data, error } = await supabase
        .from('seo_internal_links_shares')
        .select('*')
        .eq('brand_id', brandId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares(data || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast.error('Failed to load share links');
    } finally {
      setLoadingShares(false);
    }
  };

  const handleCreateShare = async () => {
    try {
      const { data: slugData, error: slugError } = await supabase
        .rpc('generate_links_share_slug');

      if (slugError) throw slugError;

      const { data, error } = await supabase
        .from('seo_internal_links_shares')
        .insert({
          user_id: userId,
          brand_id: brandId,
          share_slug: slugData,
          filter_country: null,
          filter_tag: null
        })
        .select()
        .single();

      if (error) throw error;

      setShares([data, ...shares]);
      toast.success('Share link created successfully');
    } catch (error) {
      console.error('Error creating share:', error);
      toast.error('Failed to create share link');
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('seo_internal_links_shares')
        .delete()
        .eq('id', shareId)
        .eq('user_id', userId);

      if (error) throw error;

      setShares(shares.filter(s => s.id !== shareId));
      toast.success('Share link deleted');
    } catch (error) {
      console.error('Error deleting share:', error);
      toast.error('Failed to delete share link');
    }
  };

  const handleCopyShareLink = (slug: string) => {
    const shareUrl = `${window.location.origin}/shared-links/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  useEffect(() => {
    if (shareDialogOpen) {
      fetchShares();
    }
  }, [shareDialogOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Links Management</h2>
          <p className="text-muted-foreground">
            Manage and categorize your website links
          </p>
        </div>
      </div>

      {/* Edit Link Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Link Keywords</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Current Keywords */}
              <div className="space-y-2">
                <Label>Current Keywords</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
                  {editKeywords.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No keywords added</span>
                  ) : (
                    editKeywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <button
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Add Manual Keyword */}
              <div className="space-y-2">
                <Label htmlFor="newKeyword">Add Keyword Manually</Label>
                <div className="flex gap-2">
                  <Input
                    id="newKeyword"
                    placeholder="Enter keyword..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                  />
                  <Button onClick={handleAddKeyword} variant="secondary">
                    Add
                  </Button>
                </div>
              </div>

              {/* Select from Tracked Keywords */}
              <div className="space-y-2">
                <Label>Select from Tracked Keywords</Label>
                <div className="border rounded-md p-2 bg-muted/30">
                  {trackedKeywords.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No tracked keywords found. Add keywords in the Keywords tab first.
                    </p>
                  ) : (
                    <ScrollArea className="max-h-40">
                      <div className="space-y-2 p-2">
                        {trackedKeywords.map((keyword) => (
                          <div key={keyword} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tracked-${keyword}`}
                              checked={editKeywords.includes(keyword)}
                              onCheckedChange={() => handleToggleTrackedKeyword(keyword)}
                            />
                            <Label
                              htmlFor={`tracked-${keyword}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {keyword}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSaveEdit} disabled={updateLinkMutation.isPending}>
              {updateLinkMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tag Management Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-auto pr-4">
            <div className="space-y-6 pb-4">
              {/* Current Tags */}
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-muted/30">
                  {editTags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No tags added</span>
                  ) : (
                    editTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Add Tag */}
              <div className="space-y-2">
                <Label htmlFor="newTag">Add Tag</Label>
                <div className="flex gap-2">
                  <Input
                    id="newTag"
                    placeholder="Enter tag name..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Suggested Tags from existing tags */}
              <div className="space-y-2">
                <Label>Suggested Tags</Label>
                <div className="text-sm text-muted-foreground">
                  No existing tags found
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex gap-2 justify-end pt-4 border-t mt-auto">
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTags}>
              Save Tags
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button variant="outline" onClick={() => setShareDialogOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        {selectedLinkIds.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete ({selectedLinkIds.length})
          </Button>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Share Links</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-y-auto">
            <Button onClick={handleCreateShare} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Share Link
            </Button>

            {loadingShares ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No share links created yet
              </div>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-2 p-3 border rounded-md"
                  >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <LinkIcon className="h-4 w-4 flex-shrink-0" />
                          <p className="text-sm font-mono truncate">
                            {share.share_slug}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(share.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyShareLink(share.share_slug)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/shared-links/${share.share_slug}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteShare(share.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Internal Links</CardTitle>
              <CardDescription>
                Manage internal links for backlink strategy
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowBulkAnalyzer(true)}
              disabled={!links || links.length === 0}
              className="ml-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Links ({links?.length || 0})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading links...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No links found matching your search' : 'No links found. Add your first link using the input field above'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedLinkIds.length === filteredLinks.length && filteredLinks.length > 0}
                        onCheckedChange={toggleSelectAllLinks}
                      />
                    </TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow 
                      key={link.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(link.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedLinkIds.includes(link.id)}
                          onCheckedChange={(checked) => toggleLinkSelection(link.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate" title={link.url}>{link.url}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLink(link.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Source Viewer Modal */}
      <SourceViewerModal
        open={!!viewingSource}
        onOpenChange={(open) => !open && setViewingSource(null)}
        source={viewingSource ? JSON.stringify({ title: viewingSource.title, url: viewingSource.url }) : undefined}
        topicTitle={viewingSource?.title}
      />

      {/* Bulk Link Analyzer Modal */}
      <BulkLinkAnalyzerModal
        open={showBulkAnalyzer}
        onOpenChange={setShowBulkAnalyzer}
        links={links || []}
        brandId={brandId}
        userId={userId}
      />
    </div>
  );
};
