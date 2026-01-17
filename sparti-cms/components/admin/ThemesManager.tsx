import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, 
  Plus, 
  Trash2, 
  Edit, 
  Folder,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  FileCode,
  X,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import ThemeAssetsDialog from './ThemeAssetsDialog';

interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  tags?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  from_filesystem?: boolean;
}

interface Tenant {
  id: string;
  name: string;
  theme_id?: string | null;
}

const ThemesManager: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddThemeModal, setShowAddThemeModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showEditTagsModal, setShowEditTagsModal] = useState(false);
  const [selectedThemeForActivation, setSelectedThemeForActivation] = useState<Theme | null>(null);
  const [selectedThemeForTags, setSelectedThemeForTags] = useState<Theme | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [isActivating, setIsActivating] = useState(false);
  const [isUpdatingTags, setIsUpdatingTags] = useState(false);
  const [newTheme, setNewTheme] = useState({
    slug: '',
    name: '',
    description: ''
  });
  const [filterType, setFilterType] = useState<'all' | 'template' | 'custom'>('all');
  const { toast } = useToast();
  const [assetsThemeSlug, setAssetsThemeSlug] = useState<string | null>(null);

  // Fetch themes from API
  const { data: themesData = [], isLoading: themesLoading, refetch: refetchThemes } = useQuery<Theme[]>({
    queryKey: ['themes'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/themes');
        if (response.ok) {
          const data = await response.json();
          return data.themes || [];
        } else {
          console.error('Failed to fetch themes');
          return [];
        }
      } catch (error) {
        console.error('Error fetching themes:', error);
        return [];
      }
    },
  });

  // Fetch tenants for activation
  const { data: tenantsData = [], isLoading: tenantsLoading } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/tenants');
        if (response.ok) {
          const data = await response.json();
          return Array.isArray(data) ? data : [];
        } else {
          console.error('Failed to fetch tenants');
          return [];
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
    },
    enabled: !!user?.is_super_admin || showActivateModal,
  });

  // Filter themes based on selected filter type
  const filteredThemes = useMemo(() => {
    if (filterType === 'all') return themes;
    if (filterType === 'template') {
      return themes.filter(theme => theme.tags?.includes('template'));
    }
    if (filterType === 'custom') {
      return themes.filter(theme => theme.tags?.includes('custom'));
    }
    return themes;
  }, [themes, filterType]);

  useEffect(() => {
    if (themesData) {
      setThemes(themesData);
      setIsLoading(false);
      setFetchError(null);
      
      // Automatically link all themes to demo tenant
      linkAllThemesToDemo(themesData);
    }
  }, [themesData]);

  // Function to ensure all themes have pages created for demo tenant
  // This ensures themes are "linked" to demo by having their pages available
  const linkAllThemesToDemo = async (themesToLink: Theme[]) => {
    const demoTenantId = 'demo';
    
    try {
      // Check if demo tenant exists
      const tenantResponse = await api.get(`/api/tenants`);
      if (!tenantResponse.ok) return;
      
      const tenants = await tenantResponse.json();
      const demoTenant = tenants.find((t: Tenant) => 
        t.id === demoTenantId || 
        t.id === 'demo-tenant' ||
        t.name.toLowerCase() === 'demo' ||
        t.name.toLowerCase() === 'demo account'
      );
      
      if (!demoTenant) {
        console.log('[testing] Demo tenant not found, skipping auto-link');
        return;
      }
      
      // Ensure pages exist for demo tenant for each theme
      // This is handled by the sync process, but we can trigger it here if needed
      // The actual page creation happens in the theme sync service
      console.log(`[testing] All themes are linked to demo tenant (${demoTenant.id}) - pages will be created on sync`);
    } catch (error) {
      console.error('[testing] Error in linkAllThemesToDemo:', error);
    }
  };

  // Sync themes from file system
  const handleSyncThemes = async () => {
    if (!user?.is_super_admin) {
      toast({
        title: 'Access Denied',
        description: 'Only super admins can sync themes.',
        variant: 'destructive',
      });
      return;
    }

      setIsSyncing(true);
    try {
      const response = await api.post('/api/themes/sync');
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Themes Synced',
          description: data.message || `Synced ${data.synced} theme(s)`,
        });
        // Refetch themes (this will trigger auto-linking to demo)
        refetchThemes();
      } else {
        const errorText = await response.text();
        toast({
          title: 'Sync Failed',
          description: errorText || 'Failed to sync themes',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error syncing themes:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to sync themes',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // View theme - opens theme page in new tab
  const handleViewTheme = (theme: Theme) => {
    // UPDATED: navigate within current tab using React Router
    const themeUrl = `/theme/${theme.slug}`;
    navigate(themeUrl);
  };

  // Handle activate theme - opens dialog to select tenant
  const handleActivateTheme = (theme: Theme) => {
    setSelectedThemeForActivation(theme);
    setSelectedTenantId('');
    setShowActivateModal(true);
  };

  // Handle edit tags - opens dialog to edit theme tags
  const handleEditTags = (theme: Theme) => {
    setSelectedThemeForTags(theme);
    setSelectedTags(theme.tags || []);
    setShowEditTagsModal(true);
  };

  // Handle tag toggle
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Confirm tags update
  const handleConfirmTagsUpdate = async () => {
    if (!selectedThemeForTags) return;

    setIsUpdatingTags(true);
    try {
      const response = await api.put(`/api/themes/${selectedThemeForTags.id}`, {
        tags: selectedTags,
      });

      if (response.ok) {
        const updatedTheme = await response.json();
        toast({
          title: 'Tags Updated',
          description: `Tags for "${selectedThemeForTags.name}" have been updated`,
        });
        setShowEditTagsModal(false);
        setSelectedThemeForTags(null);
        setSelectedTags([]);
        // Refetch themes to update the list
        refetchThemes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tags');
      }
    } catch (error: any) {
      console.error('Error updating tags:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update tags',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTags(false);
    }
  };

  // Confirm theme activation
  const handleConfirmActivation = async () => {
    if (!selectedThemeForActivation || !selectedTenantId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a tenant',
        variant: 'destructive',
      });
      return;
    }

    setIsActivating(true);
    try {
      const response = await api.put(`/api/tenants/${selectedTenantId}`, {
        name: tenantsData.find(t => t.id === selectedTenantId)?.name,
        theme_id: selectedThemeForActivation.slug,
      });

      if (response.ok) {
        const updatedTenant = await response.json();
        toast({
          title: 'Theme Activated',
          description: `Theme "${selectedThemeForActivation.name}" has been activated for "${updatedTenant.name}"`,
        });
        setShowActivateModal(false);
        setSelectedThemeForActivation(null);
        setSelectedTenantId('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to activate theme');
      }
    } catch (error: any) {
      console.error('Error activating theme:', error);
      toast({
        title: 'Activation Failed',
        description: error.message || 'Failed to activate theme',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
    }
  };

  // Handle slug input change and auto-generate name
  const handleSlugChange = (slug: string) => {
    // Convert to lowercase and replace spaces/special chars with hyphens
    const formattedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    setNewTheme({
      ...newTheme,
      slug: formattedSlug,
      // Auto-generate name from slug if name is empty or was auto-generated
      name: newTheme.name === formatThemeName(newTheme.slug) || !newTheme.name
        ? formatThemeName(formattedSlug)
        : newTheme.name
    });
  };

  // Format theme name from slug
  const formatThemeName = (slug: string): string => {
    const commonPatterns: { [key: string]: string } = {
      'landingpage': 'Landing Page',
      'homepage': 'Home Page',
      'aboutpage': 'About Page',
      'contactpage': 'Contact Page'
    };
    
    const lowerSlug = slug.toLowerCase();
    if (commonPatterns[lowerSlug]) {
      return commonPatterns[lowerSlug];
    }
    
    return slug
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Create new theme
  const handleCreateTheme = async () => {
    if (!newTheme.slug) {
      toast({
        title: 'Validation Error',
        description: 'Theme slug is required',
        variant: 'destructive'
      });
      return;
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(newTheme.slug)) {
      toast({
        title: 'Validation Error',
        description: 'Slug must contain only lowercase letters, numbers, and hyphens',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.post('/api/themes', {
        slug: newTheme.slug,
        name: newTheme.name || formatThemeName(newTheme.slug),
        description: newTheme.description || `Theme: ${newTheme.name || formatThemeName(newTheme.slug)}`
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: `Theme "${data.theme.name}" created successfully`,
        });
        
        // Reset form and close modal
        setNewTheme({ slug: '', name: '', description: '' });
        setShowAddThemeModal(false);
        
        // Refetch themes
        refetchThemes();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create theme');
      }
    } catch (error: any) {
      console.error('Error creating theme:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create theme',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (!user?.is_super_admin) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only super admins can manage themes.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ThemeAssetsDialog
        open={!!assetsThemeSlug}
        onOpenChange={(open) => setAssetsThemeSlug(open ? assetsThemeSlug : null)}
        themeSlug={assetsThemeSlug || 'master'}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Themes</h1>
          <p className="text-muted-foreground mt-1">
            Manage your theme templates and folders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSyncThemes} 
            variant="outline" 
            disabled={isSyncing}
            title="Sync themes from file system"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync Themes
          </Button>
          <Button 
            onClick={() => setShowAddThemeModal(true)}
            className="bg-brandPurple hover:bg-brandPurple/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Theme
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading || themesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading themes...</span>
        </div>
      ) : themes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No themes found</h3>
            <p className="text-muted-foreground mb-4">
              Create theme folders in <code className="bg-muted px-2 py-1 rounded">sparti-cms/theme/</code> or sync from file system.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={handleSyncThemes} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync from File System
              </Button>
              <Button onClick={() => setShowAddThemeModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Theme
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <Button 
              variant={filterType === 'all' ? 'default' : 'outline'} 
              onClick={() => setFilterType('all')}
              size="sm"
            >
              All
            </Button>
            <Button 
              variant={filterType === 'template' ? 'default' : 'outline'} 
              onClick={() => setFilterType('template')}
              size="sm"
            >
              Template
            </Button>
            <Button 
              variant={filterType === 'custom' ? 'default' : 'outline'} 
              onClick={() => setFilterType('custom')}
              size="sm"
            >
              Custom
            </Button>
          </div>

          {/* Theme Grid */}
          {filteredThemes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No themes found for filter: <strong>{filterType}</strong>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredThemes.map((theme) => (
            <Card key={theme.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-brandPurple" />
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                  </div>
                  {theme.from_filesystem && (
                    <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                      File System
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Slug</Label>
                  <p className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                    {theme.slug}
                  </p>
                </div>
                {theme.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                  </div>
                )}
                {/* Tags Display */}
                {theme.tags && theme.tags.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1">Tags</Label>
                    <div className="flex items-center gap-1 flex-wrap">
                      {theme.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded ${
                            tag === 'template'
                              ? 'bg-blue-100 text-blue-800'
                              : tag === 'custom'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded ${
                    theme.is_active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {theme.is_active !== false ? 'Active' : 'Inactive'}
                  </span>
                  {theme.created_at && (
                    <span className="text-xs text-muted-foreground">
                      Created: {new Date(theme.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTheme(theme)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleActivateTheme(theme)}
                    className="flex-1 bg-brandPurple/10 hover:bg-brandPurple/20 text-brandPurple border-brandPurple/20"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAssetsThemeSlug(theme.slug)}
                    className="flex-1"
                    title="Manage theme assets"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Assets
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: 'Theme Folder',
                        description: `Location: sparti-cms/theme/${theme.slug}`,
                      });
                    }}
                    className="flex-1"
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Folder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTags(theme)}
                    className="flex-1"
                    title="Edit tags"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Tags
                  </Button>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Theme Management
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Themes are automatically detected from the <code className="bg-background px-1 py-0.5 rounded">sparti-cms/theme/</code> folder.
          </p>
          <p>
            Each folder in the theme directory becomes a theme. The folder name is used as the theme slug.
          </p>
          <p>
            Use the "Sync Themes" button to synchronize themes from the file system to the database.
          </p>
        </CardContent>
      </Card>

      {/* Activate Theme Modal */}
      <Dialog open={showActivateModal} onOpenChange={setShowActivateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activate Theme</DialogTitle>
            <DialogDescription>
              Select a tenant to activate the theme "{selectedThemeForActivation?.name}" for.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-select">Select Tenant</Label>
              {tenantsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Loading tenants...</span>
                </div>
              ) : tenantsData.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Tenants Found</AlertTitle>
                  <AlertDescription>
                    No tenants available. Please create a tenant first.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger id="tenant-select">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...tenantsData]
                      .sort((a, b) => {
                        // Demo tenant always at the top
                        if (a.id === 'demo') return -1;
                        if (b.id === 'demo') return 1;
                        // Other tenants sorted alphabetically by name
                        return a.name.localeCompare(b.name);
                      })
                      .map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{tenant.name}</span>
                            {tenant.theme_id === selectedThemeForActivation?.slug && (
                              <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
              {selectedTenantId && tenantsData.find(t => t.id === selectedTenantId)?.theme_id && (
                <p className="text-xs text-amber-600">
                  This tenant currently has theme "{tenantsData.find(t => t.id === selectedTenantId)?.theme_id}" activated.
                  Activating this theme will replace it.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowActivateModal(false);
                setSelectedThemeForActivation(null);
                setSelectedTenantId('');
              }}
              disabled={isActivating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmActivation}
              disabled={isActivating || !selectedTenantId || tenantsLoading}
              className="bg-brandPurple hover:bg-brandPurple/90"
            >
              {isActivating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Activate Theme
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tags Modal */}
      <Dialog open={showEditTagsModal} onOpenChange={setShowEditTagsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Theme Tags</DialogTitle>
            <DialogDescription>
              Select tags for "{selectedThemeForTags?.name}". Tags help categorize and filter themes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Available Tags</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tag-custom"
                    checked={selectedTags.includes('custom')}
                    onChange={() => handleTagToggle('custom')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="tag-custom" className="cursor-pointer">
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs">Custom</span>
                    <span className="ml-2 text-sm text-muted-foreground">- Custom themes created for specific use cases</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="tag-template"
                    checked={selectedTags.includes('template')}
                    onChange={() => handleTagToggle('template')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="tag-template" className="cursor-pointer">
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs">Template</span>
                    <span className="ml-2 text-sm text-muted-foreground">- Template themes for creating new themes</span>
                  </Label>
                </div>
              </div>
            </div>
            {selectedTags.length > 0 && (
              <div>
                <Label className="mb-2 block">Selected Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-2 py-1 rounded ${
                        tag === 'template'
                          ? 'bg-blue-100 text-blue-800'
                          : tag === 'custom'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditTagsModal(false);
                setSelectedThemeForTags(null);
                setSelectedTags([]);
              }}
              disabled={isUpdatingTags}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTagsUpdate}
              disabled={isUpdatingTags}
              className="bg-brandPurple hover:bg-brandPurple/90"
            >
              {isUpdatingTags ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Tags
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Theme Modal */}
      <Dialog open={showAddThemeModal} onOpenChange={setShowAddThemeModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Theme</DialogTitle>
            <DialogDescription>
              Create a new theme folder and register it in the database. The slug will be used as the folder name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-slug">Theme Slug *</Label>
              <Input
                id="theme-slug"
                placeholder="e.g., my-theme"
                value={newTheme.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only. This will be the folder name.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-name">Display Name</Label>
              <Input
                id="theme-name"
                placeholder="Auto-generated from slug"
                value={newTheme.name}
                onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Will be auto-generated from slug if not provided.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme-description">Description</Label>
              <Input
                id="theme-description"
                placeholder="Theme description"
                value={newTheme.description}
                onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Brief description of the theme.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddThemeModal(false);
                setNewTheme({ slug: '', name: '', description: '' });
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTheme}
              disabled={isCreating || !newTheme.slug}
              className="bg-brandPurple hover:bg-brandPurple/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Theme
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemesManager;