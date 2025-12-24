import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';

const websiteAnalysisSchema = z.object({
  website_url: z.string().url({ message: 'Please enter a valid URL' }).max(500),
  brand_name: z.string().trim().min(1, { message: 'Brand name is required' }).max(200),
  brand_description: z.string().trim().min(1, { message: 'Description is required' }).max(2000),
  target_country: z.string().trim().min(1, { message: 'Target country is required' }).max(100),
  content_language: z.string().trim().min(1, { message: 'Content language is required' }).max(50),
  target_audience: z.string().trim().min(1, { message: 'Target audience is required' }).max(1000),
  key_selling_points: z.string().trim().max(1000)
});

interface WebsiteAnalysisData {
  website_url: string;
  brand_name: string;
  brand_description: string;
  target_country: string;
  content_language: string;
  target_audience: string;
  key_selling_points: string[];
}

interface WebsiteAnalysisEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: WebsiteAnalysisData;
  onSave: (data: WebsiteAnalysisData) => void;
}

export const WebsiteAnalysisEditModal = ({
  open,
  onOpenChange,
  data,
  onSave
}: WebsiteAnalysisEditModalProps) => {
  const [formData, setFormData] = useState({
    website_url: data.website_url || '',
    brand_name: data.brand_name || '',
    brand_description: data.brand_description || '',
    target_country: data.target_country || '',
    content_language: data.content_language || '',
    target_audience: data.target_audience || '',
    key_selling_points: data.key_selling_points?.join('\n') || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    try {
      const validatedData = websiteAnalysisSchema.parse(formData);
      
      // Convert key_selling_points back to array
      const key_selling_points = validatedData.key_selling_points
        .split('\n')
        .map(point => point.trim())
        .filter(point => point.length > 0);

      onSave({
        website_url: validatedData.website_url,
        brand_name: validatedData.brand_name,
        brand_description: validatedData.brand_description,
        target_country: validatedData.target_country,
        content_language: validatedData.content_language,
        target_audience: validatedData.target_audience,
        key_selling_points
      });
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Website Analysis</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="website_url">Website URL</Label>
            <Input
              id="website_url"
              value={formData.website_url}
              onChange={(e) => handleChange('website_url', e.target.value)}
              className={errors.website_url ? 'border-destructive' : ''}
            />
            {errors.website_url && (
              <p className="text-sm text-destructive">{errors.website_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_name">Brand Name</Label>
            <Input
              id="brand_name"
              value={formData.brand_name}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              className={errors.brand_name ? 'border-destructive' : ''}
            />
            {errors.brand_name && (
              <p className="text-sm text-destructive">{errors.brand_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_description">Product/Service Description</Label>
            <Textarea
              id="brand_description"
              value={formData.brand_description}
              onChange={(e) => handleChange('brand_description', e.target.value)}
              rows={4}
              className={errors.brand_description ? 'border-destructive' : ''}
            />
            {errors.brand_description && (
              <p className="text-sm text-destructive">{errors.brand_description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_country">Target Country</Label>
              <Input
                id="target_country"
                value={formData.target_country}
                onChange={(e) => handleChange('target_country', e.target.value)}
                className={errors.target_country ? 'border-destructive' : ''}
              />
              {errors.target_country && (
                <p className="text-sm text-destructive">{errors.target_country}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_language">Content Language</Label>
              <Input
                id="content_language"
                value={formData.content_language}
                onChange={(e) => handleChange('content_language', e.target.value)}
                className={errors.content_language ? 'border-destructive' : ''}
              />
              {errors.content_language && (
                <p className="text-sm text-destructive">{errors.content_language}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => handleChange('target_audience', e.target.value)}
              rows={3}
              className={errors.target_audience ? 'border-destructive' : ''}
            />
            {errors.target_audience && (
              <p className="text-sm text-destructive">{errors.target_audience}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_selling_points">
              Key Selling Points (one per line)
            </Label>
            <Textarea
              id="key_selling_points"
              value={formData.key_selling_points}
              onChange={(e) => handleChange('key_selling_points', e.target.value)}
              rows={5}
              placeholder="Low in fat&#10;High in fiber&#10;Gluten-free"
              className={errors.key_selling_points ? 'border-destructive' : ''}
            />
            {errors.key_selling_points && (
              <p className="text-sm text-destructive">{errors.key_selling_points}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
