import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../../src/components/ui/dialog';
import { Button } from '../../../../src/components/ui/button';
import { SEOForm } from './SEOForm';
import { Loader2 } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from '../../../../src/hooks/use-toast';

interface PageData {
  page_name: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
}

interface SEODialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  pageName: string;
  tenantId: string;
  themeId?: string;
  onSave?: () => void;
}

const SEODialog: React.FC<SEODialogProps> = ({
  open,
  onOpenChange,
  pageId,
  pageName,
  tenantId,
  themeId,
  onSave,
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load page data when dialog opens
  useEffect(() => {
    if (open && pageId) {
      loadPageData();
    }
  }, [open, pageId, tenantId, themeId]);

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
      console.error('Error loading page data:', error);
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

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SEO Settings - {pageName}</DialogTitle>
          <DialogDescription>
            Configure SEO metadata for this page to improve search engine visibility
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pageData ? (
          <div className="space-y-6">
            <SEOForm pageData={pageData} onFieldChange={handleFieldChange} />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brandPurple hover:bg-brandPurple/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save SEO Settings'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load page data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SEODialog;

