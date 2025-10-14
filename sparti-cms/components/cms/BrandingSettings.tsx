import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
// Demo branding settings (no Supabase required)
import { Input } from '../../../src/components/ui/input';
import { Card } from '../../../src/components/ui/card';
import { useToast } from '../../../src/hooks/use-toast';

interface BrandingSettingsProps {
  onUpdate?: (settings: any) => void;
}

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [siteName, setSiteName] = useState('Sparti CMS Demo');
  const [tagline, setTagline] = useState('Visual Website Builder');
  const [description, setDescription] = useState('Experience the power of visual website editing');
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Demo: simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const settings = {
        site_name: siteName,
        tagline,
        description,
      };

      // Demo: just store in localStorage
      localStorage.setItem('sparti-demo-branding', JSON.stringify(settings));
      
      onUpdate?.(settings);
      
      toast({
        title: "Settings Saved",
        description: "Branding settings have been updated (demo mode)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings (demo mode)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Branding Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="siteName" className="block text-sm font-medium mb-1">
            Site Name
          </label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Your site name"
          />
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium mb-1">
            Tagline
          </label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Your site tagline"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Your site description"
          />
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Card>
  );
};

export default BrandingSettings;