import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Type } from "lucide-react";
import { Label } from "@/components/ui/label";

const TypographySettingsPage: React.FC = () => {
  const [fontSettings, setFontSettings] = useState({
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: '16px',
    headingScale: '1.25',
    lineHeight: '1.5'
  });

  const handleInputChange = (field: string, value: string) => {
    setFontSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Default)' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Montserrat', label: 'Montserrat' }
  ];

  const fontSizeOptions = [
    { value: '14px', label: 'Small (14px)' },
    { value: '16px', label: 'Medium (16px)' },
    { value: '18px', label: 'Large (18px)' }
  ];

  const lineHeightOptions = [
    { value: '1.3', label: 'Tight (1.3)' },
    { value: '1.5', label: 'Normal (1.5)' },
    { value: '1.7', label: 'Relaxed (1.7)' }
  ];

  const scaleOptions = [
    { value: '1.2', label: 'Small (1.2)' },
    { value: '1.25', label: 'Medium (1.25)' },
    { value: '1.333', label: 'Large (1.333)' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Typography Settings</h3>
        <p className="text-muted-foreground">
          Customize the typography and font settings for your website
        </p>
      </div>

      {/* Font Family Settings */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
          <Type className="h-5 w-5 text-brandPurple" />
          Font Families
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headingFont">Heading Font</Label>
              <select
                id="headingFont"
                value={fontSettings.headingFont}
                onChange={(e) => handleInputChange('headingFont', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-transparent"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Font used for headings (h1-h6)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyFont">Body Font</Label>
              <select
                id="bodyFont"
                value={fontSettings.bodyFont}
                onChange={(e) => handleInputChange('bodyFont', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-transparent"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Font used for body text and paragraphs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseFontSize">Base Font Size</Label>
              <select
                id="baseFontSize"
                value={fontSettings.baseFontSize}
                onChange={(e) => handleInputChange('baseFontSize', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-transparent"
              >
                {fontSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Base size for all text on your site</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineHeight">Line Height</Label>
              <select
                id="lineHeight"
                value={fontSettings.lineHeight}
                onChange={(e) => handleInputChange('lineHeight', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brandPurple focus:border-transparent"
              >
                {lineHeightOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Line spacing for better readability</p>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Preview */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Typography Preview</h4>
        
        <div className="bg-secondary/20 rounded-lg border border-border p-6">
          <div className="space-y-6">
            <div>
              <h1 style={{
                fontFamily: fontSettings.headingFont,
                fontSize: 'calc(2.5 * 16px)',
                lineHeight: fontSettings.lineHeight
              }} className="font-bold text-foreground">
                Heading 1 - Main Title
              </h1>
              <div className="text-xs text-muted-foreground mt-1">h1 - Used for main page titles</div>
            </div>
            
            <div>
              <h2 style={{
                fontFamily: fontSettings.headingFont,
                fontSize: 'calc(2 * 16px)',
                lineHeight: fontSettings.lineHeight
              }} className="font-bold text-foreground">
                Heading 2 - Section Title
              </h2>
              <div className="text-xs text-muted-foreground mt-1">h2 - Used for section titles</div>
            </div>
            
            <div>
              <h3 style={{
                fontFamily: fontSettings.headingFont,
                fontSize: 'calc(1.5 * 16px)',
                lineHeight: fontSettings.lineHeight
              }} className="font-semibold text-foreground">
                Heading 3 - Subsection Title
              </h3>
              <div className="text-xs text-muted-foreground mt-1">h3 - Used for subsection titles</div>
            </div>
            
            <div>
              <p style={{
                fontFamily: fontSettings.bodyFont,
                fontSize: fontSettings.baseFontSize,
                lineHeight: fontSettings.lineHeight
              }} className="text-foreground">
                This is a paragraph of text that demonstrates how body text will look on your website. The font family, size, and line height can all be customized to match your brand's style. Good typography improves readability and user experience.
              </p>
              <div className="text-xs text-muted-foreground mt-1">Body text - Used for paragraphs and general content</div>
            </div>
            
            <div>
              <p style={{
                fontFamily: fontSettings.bodyFont,
                fontSize: 'calc(0.875 * 16px)',
                lineHeight: fontSettings.lineHeight
              }} className="text-muted-foreground">
                This is smaller text often used for captions, footnotes, or secondary information. It should still be readable but visually distinguished from the main content.
              </p>
              <div className="text-xs text-muted-foreground mt-1">Small text - Used for secondary information</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button variant="default" className="bg-brandPurple hover:bg-brandPurple/90">
          Save Typography Settings
        </Button>
      </div>
    </div>
  );
};

export default TypographySettingsPage;
