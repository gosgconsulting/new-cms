import React, { useState, useEffect } from 'react';
import { Button } from '../../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Textarea } from '../../../../src/components/ui/textarea';
import { SEOForm } from './SEOForm';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from '../../../../src/hooks/use-toast';
import { SEO_LIMITS } from '../../../utils/componentHelpers';

interface PageData {
  page_name: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
}

interface SEOPageProps {
  pageId: string;
  pageName: string;
  pageSlug: string;
  tenantId: string;
  themeId?: string;
  onBack: () => void;
  onSave?: () => void;
}

const SEOPage: React.FC<SEOPageProps> = ({
  pageId,
  pageName,
  pageSlug,
  tenantId,
  themeId,
  onBack,
  onSave,
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load page data when component mounts
  useEffect(() => {
    if (pageId) {
      loadPageData();
    }
  }, [pageId, tenantId, themeId]);

  const loadPageData = async () => {
    try {
      setLoading(true);
      const themeParam = themeId && themeId !== 'custom' ? `&themeId=${themeId}` : '';
      const url = `/api/pages/${pageId}?tenantId=${tenantId}${themeParam}`;
      const response = await api.get(url, {
        headers: { 'X-Tenant-Id': tenantId || '' }
      });

      if (!response.ok) {
        throw new Error('Failed to load page data');
      }

      const data = await response.json();
      const page = data.page;

      setPageData({
        page_name: page.page_name || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        seo_index: page.seo_index !== undefined ? page.seo_index : true,
      });
    } catch (error) {
      console.error('[testing] Error loading page data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load page data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof PageData, value: string | boolean) => {
    if (pageData) {
      setPageData({
        ...pageData,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!pageData) return;

    try {
      setSaving(true);
      const response = await api.put(`/api/pages/${pageId}`, {
        page_name: pageData.page_name,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        seo_index: pageData.seo_index,
        tenantId: tenantId,
      });

      if (!response.ok) {
        throw new Error('Failed to save SEO settings');
      }

      toast({
        title: 'Success',
        description: 'SEO settings saved successfully',
      });

      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      console.error('[testing] Error saving SEO settings:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save SEO settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">SEO Settings</h2>
            <p className="text-sm text-muted-foreground">{pageName} - {pageSlug}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading || !pageData}
          className="bg-brandPurple hover:bg-brandPurple/90"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save SEO Settings
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pageData ? (
          <div className="max-w-3xl mx-auto">
            <SEOForm pageData={pageData} onFieldChange={handleFieldChange} />
            
            {/* Additional SEO Information Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>SEO Guidelines</CardTitle>
                <CardDescription>
                  Best practices for optimizing your page for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Meta Title</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Keep it under {SEO_LIMITS.META_TITLE_MAX} characters for optimal display</li>
                    <li>Include your primary keyword near the beginning</li>
                    <li>Make it compelling and descriptive</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Meta Description</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Keep it under {SEO_LIMITS.META_DESCRIPTION_MAX} characters</li>
                    <li>Write a compelling summary that encourages clicks</li>
                    <li>Include a call-to-action when appropriate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">SEO Index</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Enable indexing to allow search engines to crawl and index this page</li>
                    <li>Disable indexing for pages you want to keep private or exclude from search results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load page data
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOPage;

