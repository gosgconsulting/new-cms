import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Search,
  Globe,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "../../../src/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../auth/AuthProvider";
import { api } from "../../utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SEOSettings {
  seo_index: boolean;
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  og_site_name: string;
  og_url: string;
}

const SEOSettingsManager: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SEOSettings>({
    seo_index: true,
    og_title: '',
    og_description: '',
    og_image: '',
    og_type: 'website',
    og_site_name: '',
    og_url: ''
  });

  useEffect(() => {
    if (currentTenantId) {
      loadSettings();
    }
  }, [currentTenantId]);

  const loadSettings = async () => {
    if (!currentTenantId) return;
    
    try {
      setLoading(true);
      
      // Load all SEO settings
      const [seoIndexRes, ogTitleRes, ogDescRes, ogImageRes, ogTypeRes, ogSiteNameRes, ogUrlRes] = await Promise.all([
        api.get(`/api/settings/site-settings/seo_index?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_title?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_description?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_image?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_type?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_site_name?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/og_url?tenantId=${currentTenantId}`, { tenantId: currentTenantId })
      ]);

      const newSettings: SEOSettings = {
        seo_index: true, // Default to true
        og_title: '',
        og_description: '',
        og_image: '',
        og_type: 'website',
        og_site_name: '',
        og_url: ''
      };

      if (seoIndexRes.ok) {
        const data = await seoIndexRes.json();
        newSettings.seo_index = data.setting_value === 'true' || data.setting_value === true;
      }
      if (ogTitleRes.ok) {
        const data = await ogTitleRes.json();
        newSettings.og_title = data.setting_value || '';
      }
      if (ogDescRes.ok) {
        const data = await ogDescRes.json();
        newSettings.og_description = data.setting_value || '';
      }
      if (ogImageRes.ok) {
        const data = await ogImageRes.json();
        newSettings.og_image = data.setting_value || '';
      }
      if (ogTypeRes.ok) {
        const data = await ogTypeRes.json();
        newSettings.og_type = data.setting_value || 'website';
      }
      if (ogSiteNameRes.ok) {
        const data = await ogSiteNameRes.json();
        newSettings.og_site_name = data.setting_value || '';
      }
      if (ogUrlRes.ok) {
        const data = await ogUrlRes.json();
        newSettings.og_url = data.setting_value || '';
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('[testing] Error loading SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to load SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTenantId) {
      toast({
        title: "Error",
        description: "No tenant selected. Please select a tenant first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Save all settings
      const settingsToSave = [
        { key: 'seo_index', value: settings.seo_index ? 'true' : 'false', type: 'text', category: 'seo' },
        { key: 'og_title', value: settings.og_title, type: 'text', category: 'seo' },
        { key: 'og_description', value: settings.og_description, type: 'textarea', category: 'seo' },
        { key: 'og_image', value: settings.og_image, type: 'media', category: 'seo' },
        { key: 'og_type', value: settings.og_type, type: 'text', category: 'seo' },
        { key: 'og_site_name', value: settings.og_site_name, type: 'text', category: 'seo' },
        { key: 'og_url', value: settings.og_url, type: 'text', category: 'seo' }
      ];

      const savePromises = settingsToSave.map(setting =>
        api.put(`/api/settings/site-settings/${setting.key}?tenantId=${currentTenantId}`, {
          setting_value: setting.value,
          setting_type: setting.type,
          setting_category: setting.category
        }, { tenantId: currentTenantId })
      );

      await Promise.all(savePromises);

      toast({
        title: "Success",
        description: "SEO settings saved successfully.",
      });
    } catch (error) {
      console.error('[testing] Error saving SEO settings:', error);
      toast({
        title: "Error",
        description: "Failed to save SEO settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: keyof SEOSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground flex items-center">
              <SettingsIcon className="mr-2 h-6 w-6 text-brandPurple" />
              SEO Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure site-wide SEO settings including indexing and OpenGraph metadata
            </p>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-brandPurple hover:bg-brandPurple/90"
          >
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Indexing Settings */}
        <div className="space-y-6 mb-8">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center mb-2">
              <Search className="mr-2 h-5 w-5 text-brandPurple" />
              Search Engine Indexing
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Control whether search engines should index your site. For headless CMS setups (like Diora), 
              you may want to disable indexing if the sitemap is not used here.
            </p>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="seo_index" className="text-base font-medium">
                  Allow Search Engine Indexing
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.seo_index 
                    ? 'Search engines can index your site' 
                    : 'Search engines will not index your site (noindex)'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {settings.seo_index ? (
                  <Eye className="h-5 w-5 text-green-600" />
                ) : (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                )}
                <Switch
                  id="seo_index"
                  checked={settings.seo_index}
                  onCheckedChange={(checked) => handleInputChange('seo_index', checked)}
                />
              </div>
            </div>
          </div>

          {/* OpenGraph Settings */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center mb-2">
              <Globe className="mr-2 h-5 w-5 text-brandPurple" />
              OpenGraph Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure how your site appears when shared on social media. By default, OpenGraph will use 
              the featured image from the page (or slider image), or fallback to your site logo if no image is found.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="og_title">OpenGraph Title</Label>
                <Input
                  id="og_title"
                  value={settings.og_title}
                  onChange={(e) => handleInputChange('og_title', e.target.value)}
                  placeholder="Default: Site Name"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Title shown when sharing on social media. Leave empty to use site name.
                </p>
              </div>

              <div>
                <Label htmlFor="og_description">OpenGraph Description</Label>
                <Textarea
                  id="og_description"
                  value={settings.og_description}
                  onChange={(e) => handleInputChange('og_description', e.target.value)}
                  placeholder="Default: Site Description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Description shown when sharing on social media. Leave empty to use site description.
                </p>
              </div>

              <div>
                <Label htmlFor="og_image">OpenGraph Image</Label>
                <Input
                  id="og_image"
                  value={settings.og_image}
                  onChange={(e) => handleInputChange('og_image', e.target.value)}
                  placeholder="URL to default OpenGraph image"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default image for social sharing. If not set, will use featured image from page or site logo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="og_type">OpenGraph Type</Label>
                  <Select 
                    value={settings.og_type} 
                    onValueChange={(value) => handleInputChange('og_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="profile">Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="og_site_name">Site Name</Label>
                  <Input
                    id="og_site_name"
                    value={settings.og_site_name}
                    onChange={(e) => handleInputChange('og_site_name', e.target.value)}
                    placeholder="Default: Site Name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="og_url">OpenGraph URL</Label>
                <Input
                  id="og_url"
                  value={settings.og_url}
                  onChange={(e) => handleInputChange('og_url', e.target.value)}
                  placeholder="Canonical URL for your site"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The canonical URL of your site. Leave empty to use current page URL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOSettingsManager;

