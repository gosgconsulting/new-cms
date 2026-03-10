import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ButtonSettingsProps {
  onUpdate?: (settings: any) => void;
}

const BUTTON_RADIUS_OPTIONS = [
  { value: 'none', label: 'Square (0px)' },
  { value: 'sm', label: 'Small (4px)' },
  { value: 'md', label: 'Medium (8px)' },
  { value: 'lg', label: 'Large (12px)' },
  { value: 'full', label: 'Pill (9999px)' },
];

const BUTTON_SIZE_OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
];

export const ButtonSettings: React.FC<ButtonSettingsProps> = ({ onUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Load saved settings from localStorage
  const savedSettings = localStorage.getItem('buttonSettings');
  const initialSettings = savedSettings ? JSON.parse(savedSettings) : {
    primaryColor: '#3b82f6',
    primaryHoverColor: '#2563eb',
    secondaryColor: '#6b7280',
    secondaryHoverColor: '#4b5563',
    borderRadius: 'md',
    defaultSize: 'md',
  };

  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor);
  const [primaryHoverColor, setPrimaryHoverColor] = useState(initialSettings.primaryHoverColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondaryColor);
  const [secondaryHoverColor, setSecondaryHoverColor] = useState(initialSettings.secondaryHoverColor);
  const [borderRadius, setBorderRadius] = useState(initialSettings.borderRadius);
  const [defaultSize, setDefaultSize] = useState(initialSettings.defaultSize);

  const handleSave = async () => {
    setLoading(true);
    try {
      const settings = {
        primaryColor,
        primaryHoverColor,
        secondaryColor,
        secondaryHoverColor,
        borderRadius,
        defaultSize,
      };

      // Save to localStorage (demo version)
      localStorage.setItem('buttonSettings', JSON.stringify(settings));
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(settings);
      }

      toast({
        title: 'Button settings saved',
        description: 'Your button customization has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save button settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Settings</h3>
          <p className="text-sm text-gray-600 mb-6">
            Customize the appearance of buttons across your site
          </p>
        </div>

        {/* Primary Button Colors */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Primary Button</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Background Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{primaryColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryHoverColor">Hover Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="primaryHoverColor"
                  value={primaryHoverColor}
                  onChange={(e) => setPrimaryHoverColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{primaryHoverColor}</span>
              </div>
            </div>
          </div>

          {/* Primary Button Preview */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Preview:</span>
            <button
              style={{
                backgroundColor: primaryColor,
                borderRadius: borderRadius === 'none' ? '0' :
                             borderRadius === 'sm' ? '4px' :
                             borderRadius === 'md' ? '8px' :
                             borderRadius === 'lg' ? '12px' :
                             '9999px',
                padding: defaultSize === 'sm' ? '8px 16px' :
                        defaultSize === 'md' ? '10px 20px' :
                        '12px 24px',
              }}
              className="text-white font-medium transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryHoverColor}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
            >
              Primary Button
            </button>
          </div>
        </div>

        {/* Secondary Button Colors */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Secondary Button</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Background Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryColor"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{secondaryColor}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryHoverColor">Hover Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="secondaryHoverColor"
                  value={secondaryHoverColor}
                  onChange={(e) => setSecondaryHoverColor(e.target.value)}
                  className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{secondaryHoverColor}</span>
              </div>
            </div>
          </div>

          {/* Secondary Button Preview */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Preview:</span>
            <button
              style={{
                backgroundColor: secondaryColor,
                borderRadius: borderRadius === 'none' ? '0' :
                             borderRadius === 'sm' ? '4px' :
                             borderRadius === 'md' ? '8px' :
                             borderRadius === 'lg' ? '12px' :
                             '9999px',
                padding: defaultSize === 'sm' ? '8px 16px' :
                        defaultSize === 'md' ? '10px 20px' :
                        '12px 24px',
              }}
              className="text-white font-medium transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = secondaryHoverColor}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = secondaryColor}
            >
              Secondary Button
            </button>
          </div>
        </div>

        {/* Button Layout */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Button Layout</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Select value={borderRadius} onValueChange={setBorderRadius}>
                <SelectTrigger id="borderRadius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_RADIUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultSize">Default Size</Label>
              <Select value={defaultSize} onValueChange={setDefaultSize}>
                <SelectTrigger id="defaultSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BUTTON_SIZE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Button Settings'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
