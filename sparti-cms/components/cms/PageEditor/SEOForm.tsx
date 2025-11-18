import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../src/components/ui/card';
import { Input } from '../../../../src/components/ui/input';
import { Label } from '../../../../src/components/ui/label';
import { Textarea } from '../../../../src/components/ui/textarea';
import { SEO_LIMITS } from '../../../utils/componentHelpers';

interface PageData {
  page_name: string;
  meta_title: string;
  meta_description: string;
  seo_index: boolean;
}

interface SEOFormProps {
  pageData: PageData | null;
  onFieldChange: (field: keyof PageData, value: string | boolean) => void;
}

export const SEOForm: React.FC<SEOFormProps> = ({ pageData, onFieldChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO & Meta Information</CardTitle>
        <CardDescription>Configure page title and meta description for search engines</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Page Title</Label>
          <Input
            id="page-title"
            value={pageData?.page_name || ''}
            onChange={(e) => onFieldChange('page_name', e.target.value)}
            placeholder="Page Title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-title">Meta Title</Label>
          <Input
            id="meta-title"
            value={pageData?.meta_title || ''}
            onChange={(e) => onFieldChange('meta_title', e.target.value)}
            placeholder={`Meta Title (${SEO_LIMITS.META_TITLE_MAX} characters max)`}
            maxLength={SEO_LIMITS.META_TITLE_MAX}
          />
          <p className="text-xs text-muted-foreground">
            {(pageData?.meta_title || '').length}/{SEO_LIMITS.META_TITLE_MAX} characters
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-description">Meta Description</Label>
          <Textarea
            id="meta-description"
            value={pageData?.meta_description || ''}
            onChange={(e) => onFieldChange('meta_description', e.target.value)}
            placeholder={`Meta Description (${SEO_LIMITS.META_DESCRIPTION_MAX} characters max)`}
            rows={3}
            maxLength={SEO_LIMITS.META_DESCRIPTION_MAX}
          />
          <p className="text-xs text-muted-foreground">
            {(pageData?.meta_description || '').length}/{SEO_LIMITS.META_DESCRIPTION_MAX} characters
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="seo-index">SEO Index</Label>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="seo-index"
              checked={pageData?.seo_index || false}
              onChange={(e) => onFieldChange('seo_index', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="seo-index" className="text-sm">
              Allow search engines to index this page
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

