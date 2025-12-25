import React, { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
// Demo typography settings (no database required)
import { Card } from '../../../src/components/ui/card';
import { useToast } from '../../../src/hooks/use-toast';

interface TypographySettingsProps {
  onUpdate?: (settings: any) => void;
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
];

export const TypographySettings: React.FC<TypographySettingsProps> = ({ onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fontFamily, setFontFamily] = useState('Inter');
  const [headingSize, setHeadingSize] = useState('2.5rem');
  const [bodySize, setBodySize] = useState('1rem');
  const [lineHeight, setLineHeight] = useState('1.6');
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Demo: simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const settings = {
        font_family: fontFamily,
        heading_size: headingSize,
        body_size: bodySize,
        line_height: lineHeight,
      };

      // Demo: just store in localStorage
      localStorage.setItem('sparti-demo-typography', JSON.stringify(settings));
      
      onUpdate?.(settings);
      
      toast({
        title: "Typography Updated",
        description: "Typography settings have been saved (demo mode)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save typography settings (demo mode)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Typography Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="fontFamily" className="block text-sm font-medium mb-1">
            Font Family
          </label>
          <select
            id="fontFamily"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="headingSize" className="block text-sm font-medium mb-1">
            Heading Size (H1)
          </label>
          <select
            id="headingSize"
            value={headingSize}
            onChange={(e) => setHeadingSize(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="2rem">2rem (32px)</option>
            <option value="2.5rem">2.5rem (40px)</option>
            <option value="3rem">3rem (48px)</option>
            <option value="3.5rem">3.5rem (56px)</option>
            <option value="4rem">4rem (64px)</option>
          </select>
        </div>

        <div>
          <label htmlFor="bodySize" className="block text-sm font-medium mb-1">
            Body Text Size
          </label>
          <select
            id="bodySize"
            value={bodySize}
            onChange={(e) => setBodySize(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="0.875rem">0.875rem (14px)</option>
            <option value="1rem">1rem (16px)</option>
            <option value="1.125rem">1.125rem (18px)</option>
            <option value="1.25rem">1.25rem (20px)</option>
          </select>
        </div>

        <div>
          <label htmlFor="lineHeight" className="block text-sm font-medium mb-1">
            Line Height
          </label>
          <select
            id="lineHeight"
            value={lineHeight}
            onChange={(e) => setLineHeight(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="1.4">1.4</option>
            <option value="1.5">1.5</option>
            <option value="1.6">1.6</option>
            <option value="1.7">1.7</option>
            <option value="1.8">1.8</option>
          </select>
        </div>

        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Typography'}
        </Button>
      </div>
    </Card>
  );
};

export default TypographySettings;