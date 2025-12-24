import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandBasicFormProps {
  brandId: string;
  userId: string;
  currentWebsite?: string;
  currentName?: string;
  onUpdate?: () => void;
}

export const BrandBasicForm = ({
  brandId,
  userId,
  currentWebsite,
  currentName,
  onUpdate
}: BrandBasicFormProps) => {
  const [websiteUrl, setWebsiteUrl] = useState(currentWebsite || '');
  const [brandName, setBrandName] = useState(currentName || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBrandName(currentName || '');
    setWebsiteUrl(currentWebsite || '');
  }, [currentName, currentWebsite]);

  const handleSave = async () => {
    if (!brandName.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Information</CardTitle>
        <CardDescription>
          Update your brand name and website URL
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="brand-name">
            Brand Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="brand-name"
            type="text"
            placeholder="Your brand name"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            disabled={isSaving}
          />
          <p className="text-xs text-muted-foreground">
            This name will appear in the dropdown filter
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website-url">Website URL</Label>
          <Input
            id="website-url"
            type="text"
            placeholder="example.com or https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving || !brandName.trim()}
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
              Save
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
