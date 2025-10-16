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
  const [primaryColor, setPrimaryColor] = useState('#9b87f5');
  const [secondaryColor, setSecondaryColor] = useState('#7E69AB');
  const [accentColor, setAccentColor] = useState('#F94E40');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#333333');
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
        background_color: backgroundColor,
        text_color: textColor,
      };

      // Update CSS variables on the root element
      const root = document.documentElement;
      root.style.setProperty('--brand-primary', primaryColor);
      root.style.setProperty('--brand-secondary', secondaryColor);
      root.style.setProperty('--brand-accent', accentColor);
      root.style.setProperty('--brand-background', backgroundColor);
      root.style.setProperty('--brand-text', textColor);
      root.style.setProperty('--gradient-start', primaryColor);
      root.style.setProperty('--gradient-end', secondaryColor);

      // Demo: just store in localStorage
      localStorage.setItem('sparti-demo-colors', JSON.stringify(settings));
      
      onUpdate?.(settings);
      
      toast({
        title: "Colors Updated",
        description: "Brand colors have been applied to your site",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save color settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Brand Colors</h2>
          <p className="text-sm text-muted-foreground mb-4">
            These colors are used throughout your site for buttons, headings, and accents
          </p>
        </div>

        <div className="grid gap-4">
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium mb-2">
              Primary Color (Purple)
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#9b87f5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used for primary buttons and highlights</p>
          </div>

          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium mb-2">
              Secondary Color (Dark Purple)
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#7E69AB"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used for gradients and secondary elements</p>
          </div>

          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium mb-2">
              Accent Color (Coral)
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#F94E40"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Used for CTAs and important actions</p>
          </div>

          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium mb-2">
              Background Color
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="backgroundColor"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main background color</p>
          </div>

          <div>
            <label htmlFor="textColor" className="block text-sm font-medium mb-2">
              Text Color
            </label>
            <div className="flex gap-2 items-center">
              <Input
                id="textColor"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-20 h-10"
              />
              <Input
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#333333"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Main text color</p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Color Preview</h3>
          <div className="grid grid-cols-5 gap-2">
            <div className="space-y-1">
              <div 
                className="h-16 rounded-md border"
                style={{ backgroundColor: primaryColor }}
              />
              <p className="text-xs text-center">Primary</p>
            </div>
            <div className="space-y-1">
              <div 
                className="h-16 rounded-md border"
                style={{ backgroundColor: secondaryColor }}
              />
              <p className="text-xs text-center">Secondary</p>
            </div>
            <div className="space-y-1">
              <div 
                className="h-16 rounded-md border"
                style={{ backgroundColor: accentColor }}
              />
              <p className="text-xs text-center">Accent</p>
            </div>
            <div className="space-y-1">
              <div 
                className="h-16 rounded-md border"
                style={{ backgroundColor: backgroundColor }}
              />
              <p className="text-xs text-center">Background</p>
            </div>
            <div className="space-y-1">
              <div 
                className="h-16 rounded-md border"
                style={{ backgroundColor: textColor }}
              />
              <p className="text-xs text-center">Text</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Apply Brand Colors'}
        </Button>
      </div>
    </Card>
  );
};

export default ColorSettings;