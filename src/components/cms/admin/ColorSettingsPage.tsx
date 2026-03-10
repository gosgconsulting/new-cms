import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ColorSettingsPage: React.FC = () => {
  const [colorScheme, setColorScheme] = useState({
    primary: '#9b87f5', // Brand Purple
    secondary: '#e5e7eb',
    accent: '#F94E40', // Coral
    background: '#f8fafc',
    foreground: '#111827',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    brandTeal: '#38bdf8',
    brandGold: '#f59e0b'
  });

  const handleColorChange = (field: string, value: string) => {
    setColorScheme(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Color Settings</h3>
        <p className="text-muted-foreground">
          Customize the color scheme of your website
        </p>
      </div>

      {/* Brand Colors */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brandPurple" />
          Brand Colors
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="primary">Primary Color (Brand Purple)</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="primary"
                value={colorScheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Main brand color used for primary elements</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accent">Accent Color (Coral)</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="accent"
                value={colorScheme.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Used for call-to-action buttons and highlights</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="brandTeal">Brand Teal</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="brandTeal"
                value={colorScheme.brandTeal}
                onChange={(e) => handleColorChange('brandTeal', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.brandTeal}
                onChange={(e) => handleColorChange('brandTeal', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Used for gradients and secondary accents</p>
          </div>
        </div>
      </div>

      {/* UI Colors */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">UI Colors</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="background"
                value={colorScheme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Main background color of the site</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foreground">Foreground</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="foreground"
                value={colorScheme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Main text color</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secondary">Secondary</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="secondary"
                value={colorScheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Used for secondary UI elements</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="muted">Muted Background</Label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="muted"
                value={colorScheme.muted}
                onChange={(e) => handleColorChange('muted', e.target.value)}
                className="w-12 h-12 rounded-md border border-input cursor-pointer"
              />
              <Input
                value={colorScheme.muted}
                onChange={(e) => handleColorChange('muted', e.target.value)}
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">Used for subtle background areas</p>
          </div>
        </div>
      </div>

      {/* Color Scheme Preview */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">Color Scheme Preview</h4>
        
        <div className="bg-secondary/20 rounded-lg border border-border p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Primary Button */}
              <div className="flex flex-col items-center space-y-2">
                <button 
                  style={{ backgroundColor: colorScheme.primary }} 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                >
                  Primary Button
                </button>
                <p className="text-xs text-muted-foreground">Primary Button</p>
              </div>
              
              {/* Accent Button */}
              <div className="flex flex-col items-center space-y-2">
                <button 
                  style={{ backgroundColor: colorScheme.accent }} 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                >
                  Accent Button
                </button>
                <p className="text-xs text-muted-foreground">Accent Button</p>
              </div>
              
              {/* Gradient Button */}
              <div className="flex flex-col items-center space-y-2">
                <button 
                  style={{ 
                    background: `linear-gradient(to right, ${colorScheme.primary}, ${colorScheme.brandTeal})` 
                  }} 
                  className="px-4 py-2 rounded-lg text-white font-medium"
                >
                  Gradient Button
                </button>
                <p className="text-xs text-muted-foreground">Gradient Button</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card Preview */}
              <div 
                style={{ 
                  backgroundColor: colorScheme.background,
                  color: colorScheme.foreground,
                  borderColor: colorScheme.secondary
                }} 
                className="p-4 rounded-lg border"
              >
                <h3 style={{ color: colorScheme.foreground }} className="text-lg font-semibold mb-2">Card Title</h3>
                <p style={{ color: colorScheme.mutedForeground }} className="text-sm">This is how a card would look with your color scheme.</p>
              </div>
              
              {/* Muted Section */}
              <div 
                style={{ 
                  backgroundColor: colorScheme.muted,
                  color: colorScheme.foreground,
                  borderColor: colorScheme.secondary
                }} 
                className="p-4 rounded-lg border"
              >
                <h3 style={{ color: colorScheme.foreground }} className="text-lg font-semibold mb-2">Muted Section</h3>
                <p style={{ color: colorScheme.mutedForeground }} className="text-sm">This is how a muted section would look.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border">
        <Button variant="default" className="bg-brandPurple hover:bg-brandPurple/90">
          Save Color Settings
        </Button>
      </div>
    </div>
  );
};

export default ColorSettingsPage;
