import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
// Demo color settings (no database required)
import { Input } from '../../../src/components/ui/input';
import { Card } from '../../../src/components/ui/card';
import { useToast } from '../../../src/hooks/use-toast';

interface ColorSettingsProps {
  onUpdate?: (settings: any) => void;
}

export const ColorSettings: React.FC<ColorSettingsProps> = ({ onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#64748b');
  const [accentColor, setAccentColor] = useState('#8b5cf6');
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Demo: simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const settings = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
      };

      // Demo: just store in localStorage
      localStorage.setItem('sparti-demo-colors', JSON.stringify(settings));
      
      onUpdate?.(settings);
      
      toast({
        title: "Colors Updated",
        description: "Color settings have been saved (demo mode)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save color settings (demo mode)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Color Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">
            Primary Color
          </label>
          <div className="flex gap-2 items-center">
            <Input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div>
          <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">
            Secondary Color
          </label>
          <div className="flex gap-2 items-center">
            <Input
              id="secondaryColor"
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-16"
            />
            <Input
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              placeholder="#64748b"
            />
          </div>
        </div>

        <div>
          <label htmlFor="accentColor" className="block text-sm font-medium mb-1">
            Accent Color
          </label>
          <div className="flex gap-2 items-center">
            <Input
              id="accentColor"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-16"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#8b5cf6"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Colors'}
        </Button>
      </div>
    </Card>
  );
};

export default ColorSettings;