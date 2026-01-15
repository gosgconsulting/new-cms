import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon,
  Search,
  Eye,
  EyeOff,
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

interface SEOSettings {
  seo_index: boolean;
  meta_title: string;
  meta_description: string;
  meta_title_rule: string;
}

const SEOSettingsManager: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SEOSettings>({
    seo_index: true,
    meta_title: '',
    meta_description: '',
    meta_title_rule: '{{Website Title}} | {Page Title}'
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
      
      const [seoIndexRes, metaTitleRes, metaDescRes, metaTitleRuleRes] = await Promise.all([
        api.get(`/api/settings/site-settings/seo_index?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/meta_title?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/meta_description?tenantId=${currentTenantId}`, { tenantId: currentTenantId }),
        api.get(`/api/settings/site-settings/meta_title_rule?tenantId=${currentTenantId}`, { tenantId: currentTenantId })
      ]);

      const newSettings: SEOSettings = {
        seo_index: true,
        meta_title: '',
        meta_description: '',
        meta_title_rule: '{{Website Title}} | {Page Title}'
      };

      if (seoIndexRes.ok) {
        const data = await seoIndexRes.json();
        newSettings.seo_index = data.setting_value === 'true' || data.setting_value === true;
      }
      if (metaTitleRes.ok) {
        const data = await metaTitleRes.json();
        newSettings.meta_title = data.setting_value || '';
      }
      if (metaDescRes.ok) {
        const data = await metaDescRes.json();
        newSettings.meta_description = data.setting_value || '';
      }
      if (metaTitleRuleRes.ok) {
        const data = await metaTitleRuleRes.json();
        newSettings.meta_title_rule = data.setting_value || '{{Website Title}} | {Page Title}';
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
        { key: 'meta_title', value: settings.meta_title, type: 'text', category: 'seo' },
        { key: 'meta_description', value: settings.meta_description, type: 'textarea', category: 'seo' },
        { key: 'meta_title_rule', value: settings.meta_title_rule, type: 'text', category: 'seo' },
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

  // Helper to preview rule application with example values
  const previewTitle = (() => {
    const website = settings.meta_title || 'Website Title';
    const page = 'Page Title';
    return (settings.meta_title_rule || '{{Website Title}} | {Page Title}')
      .replace('{{Website Title}}', website)
      .replace('{Page Title}', page);
  })();

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
              Control whether search engines should index your site.
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

          {/* Meta Title & Description */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center mb-2">
              Meta Title & Description
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set site-wide defaults for your meta title and description, and define how page titles should be formatted.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title (Website Title)</Label>
                <Input
                  id="meta_title"
                  value={settings.meta_title}
                  onChange={(e) => handleInputChange('meta_title', e.target.value)}
                  placeholder="e.g., GOSG Consulting"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used as the base website title in your title formatting rule.
                </p>
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={settings.meta_description}
                  onChange={(e) => handleInputChange('meta_description', e.target.value)}
                  placeholder="Brief site-wide description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default meta description used across pages unless overridden.
                </p>
              </div>

              <div>
                <Label htmlFor="meta_title_rule">Title Format Rule</Label>
                <Input
                  id="meta_title_rule"
                  value={settings.meta_title_rule}
                  onChange={(e) => handleInputChange('meta_title_rule', e.target.value)}
                  placeholder="{{Website Title}} | {Page Title}"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use placeholders: {'{{Website Title}}'} and {'{Page Title}'}. Example preview below.
                </p>
                <div className="mt-2 p-3 rounded bg-gray-50 border text-sm">
                  <span className="text-muted-foreground">Preview (example): </span>
                  <span className="font-medium">{previewTitle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOSettingsManager;