import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Save, Eye, Type, RefreshCw, Sparkles, Link2, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import api from '../../utils/api';
import { useQuery } from '@tanstack/react-query';

interface TypographySettings {
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  baseFontSize: string;
  headingScale: string;
  lineHeight: string;
}

interface ThemeStyles {
  // Primary Colors
  primary: string;
  primaryForeground: string;
  
  // Secondary Colors
  secondary: string;
  secondaryForeground: string;
  
  // Base Colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  
  // Accent Colors
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  
  // Additional Colors
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  
  // Typography
  typography: TypographySettings;
}

interface StylePreset {
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    destructiveForeground: string;
  };
  typography: TypographySettings;
}

const defaultTypography: TypographySettings = {
  fontSans: 'Inter, sans-serif',
  fontSerif: 'Playfair Display, serif',
  fontMono: 'Fira Code, monospace',
  baseFontSize: '16px',
  headingScale: '1.25',
  lineHeight: '1.6',
};

const stylePresets: StylePreset[] = [
  {
    name: 'Modern & Clean',
    description: 'Inter font with purple accent - professional and readable',
    colors: {
      primary: '#8b5cf6',
      primaryForeground: '#ffffff',
      secondary: '#f3f0ff',
      secondaryForeground: '#4338ca',
      background: '#ffffff',
      foreground: '#1f2937',
      card: '#ffffff',
      cardForeground: '#1f2937',
      accent: '#dbeafe',
      accentForeground: '#1e40af',
      muted: '#f9fafb',
      mutedForeground: '#6b7280',
      border: '#e5e7eb',
      input: '#e5e7eb',
      ring: '#8b5cf6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
    },
    typography: {
      fontSans: 'Inter, sans-serif',
      fontSerif: 'Playfair Display, serif',
      fontMono: 'Fira Code, monospace',
      baseFontSize: '16px',
      headingScale: '1.25',
      lineHeight: '1.6',
    },
  },
  {
    name: 'Warm & Friendly',
    description: 'Inter font with warm orange tones - inviting and approachable',
    colors: {
      primary: '#f97316',
      primaryForeground: '#ffffff',
      secondary: '#fff7ed',
      secondaryForeground: '#9a3412',
      background: '#ffffff',
      foreground: '#292524',
      card: '#ffffff',
      cardForeground: '#292524',
      accent: '#fed7aa',
      accentForeground: '#9a3412',
      muted: '#fffbeb',
      mutedForeground: '#78716c',
      border: '#fed7aa',
      input: '#fed7aa',
      ring: '#f97316',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
    },
    typography: {
      fontSans: 'Inter, sans-serif',
      fontSerif: 'Merriweather, serif',
      fontMono: 'JetBrains Mono, monospace',
      baseFontSize: '17px',
      headingScale: '1.3',
      lineHeight: '1.65',
    },
  },
  {
    name: 'Professional Blue',
    description: 'Inter font with blue palette - trustworthy and corporate',
    colors: {
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#eff6ff',
      secondaryForeground: '#1e40af',
      background: '#ffffff',
      foreground: '#1e293b',
      card: '#ffffff',
      cardForeground: '#1e293b',
      accent: '#dbeafe',
      accentForeground: '#1e40af',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      border: '#cbd5e1',
      input: '#cbd5e1',
      ring: '#2563eb',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
    },
    typography: {
      fontSans: 'Inter, sans-serif',
      fontSerif: 'Lora, serif',
      fontMono: 'Source Code Pro, monospace',
      baseFontSize: '16px',
      headingScale: '1.25',
      lineHeight: '1.6',
    },
  },
];

const defaultStyles: ThemeStyles = {
  ...stylePresets[0].colors,
  typography: defaultTypography,
};

const StylesSettingsPage: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [styles, setStyles] = useState<ThemeStyles>(defaultStyles);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeColorGroup, setActiveColorGroup] = useState<'primary' | 'secondary' | 'base' | 'accent'>('primary');
  const [activeSection, setActiveSection] = useState<'colors' | 'typography'>('colors');
  const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);

  // Fetch current tenant to get theme_id
  const { data: tenant } = useQuery({
    queryKey: ['tenant', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;
      try {
        const response = await api.get(`/api/tenants`);
        if (response.ok) {
          const tenants = await response.json();
          return tenants.find((t: any) => t.id === currentTenantId) || null;
        }
        return null;
      } catch (error) {
        console.error('Error fetching tenant:', error);
        return null;
      }
    },
    enabled: !!currentTenantId,
  });

  // Get theme_id from tenant
  useEffect(() => {
    if (tenant?.theme_id) {
      setCurrentThemeId(tenant.theme_id);
    } else {
      // Default to 'landingpage' for now (hardcoded as requested)
      setCurrentThemeId('landingpage');
    }
  }, [tenant]);

  // Load saved styles from API
  useEffect(() => {
    const loadStyles = async () => {
      if (!currentTenantId || !currentThemeId) return;
      
      try {
        setLoading(true);
        // Use theme-specific styles endpoint
        const endpoint = `/api/settings/theme/${encodeURIComponent(currentThemeId)}/styles?tenantId=${encodeURIComponent(currentTenantId)}`;
        const response = await api.get(endpoint);
        if (response.ok) {
          const savedStyles = await response.json();
          if (savedStyles && Object.keys(savedStyles).length > 0) {
            // Remove theme_id and css_path if present (they're metadata, not style properties)
            const { theme_id, css_path, ...styleProperties } = savedStyles;
            setStyles({ ...defaultStyles, ...styleProperties });
            console.log('[testing] Loaded styles from database for theme:', currentThemeId);
          } else {
            console.log('[testing] No saved styles found, using defaults');
          }
        }
      } catch (error) {
        console.log('[testing] No saved styles found, using defaults:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStyles();
  }, [currentTenantId, currentThemeId]);

  const handleColorChange = (field: keyof Omit<ThemeStyles, 'typography'>, value: string) => {
    setStyles(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypographyChange = (field: keyof TypographySettings, value: string) => {
    setStyles(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [field]: value
      }
    }));
  };

  const applyPreset = (preset: StylePreset) => {
    setStyles({
      ...preset.colors,
      typography: preset.typography,
    });
  };

  const handleSave = async () => {
    if (!currentTenantId || !currentThemeId) {
      alert('Please select a tenant and ensure a theme is assigned');
      return;
    }
    
    try {
      setSaving(true);
      
      // Use theme-specific endpoint to save styles
      const response = await api.put(
        `/api/settings/theme/${encodeURIComponent(currentThemeId)}/theme_styles?tenantId=${encodeURIComponent(currentTenantId)}`,
        {
          setting_value: JSON.stringify(styles),
          setting_type: 'json',
          setting_category: 'theme'
        }
      );
      
      if (response.ok) {
        alert(`Styles saved successfully to database!\n\nTheme: ${currentThemeId}\nTenant: ${currentTenantId}\n\nStyles are now stored in the database and will be applied to your theme pages.`);
      } else {
        const errorText = await response.text();
        console.error('[testing] Save failed:', errorText);
        alert('Failed to save styles. Please check the console for details.');
      }
    } catch (error) {
      console.error('Error saving styles:', error);
      alert('Error saving styles');
    } finally {
      setSaving(false);
    }
  };

  const colorGroups = {
    primary: [
      { key: 'primary' as keyof Omit<ThemeStyles, 'typography'>, label: 'Primary', description: 'Main brand color' },
      { key: 'primaryForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Primary Foreground', description: 'Text color on primary background' },
    ],
    secondary: [
      { key: 'secondary' as keyof Omit<ThemeStyles, 'typography'>, label: 'Secondary', description: 'Secondary brand color' },
      { key: 'secondaryForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Secondary Foreground', description: 'Text color on secondary background' },
    ],
    base: [
      { key: 'background' as keyof Omit<ThemeStyles, 'typography'>, label: 'Background', description: 'Main background color' },
      { key: 'foreground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Foreground', description: 'Main text color' },
      { key: 'card' as keyof Omit<ThemeStyles, 'typography'>, label: 'Card', description: 'Card background color' },
      { key: 'cardForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Card Foreground', description: 'Text color on card background' },
    ],
    accent: [
      { key: 'accent' as keyof Omit<ThemeStyles, 'typography'>, label: 'Accent', description: 'Accent color for highlights' },
      { key: 'accentForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Accent Foreground', description: 'Text color on accent background' },
      { key: 'muted' as keyof Omit<ThemeStyles, 'typography'>, label: 'Muted', description: 'Muted background color' },
      { key: 'mutedForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Muted Foreground', description: 'Muted text color' },
      { key: 'border' as keyof Omit<ThemeStyles, 'typography'>, label: 'Border', description: 'Border color' },
      { key: 'input' as keyof Omit<ThemeStyles, 'typography'>, label: 'Input', description: 'Input border color' },
      { key: 'ring' as keyof Omit<ThemeStyles, 'typography'>, label: 'Ring', description: 'Focus ring color' },
      { key: 'destructive' as keyof Omit<ThemeStyles, 'typography'>, label: 'Destructive', description: 'Error/destructive color' },
      { key: 'destructiveForeground' as keyof Omit<ThemeStyles, 'typography'>, label: 'Destructive Foreground', description: 'Text color on destructive background' },
    ],
  };

  const fontOptions = [
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Lato, sans-serif', label: 'Lato' },
  ];

  const serifFontOptions = [
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Merriweather, serif', label: 'Merriweather' },
    { value: 'Lora, serif', label: 'Lora' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
  ];

  const monoFontOptions = [
    { value: 'Fira Code, monospace', label: 'Fira Code' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
    { value: 'Source Code Pro, monospace', label: 'Source Code Pro' },
    { value: 'Courier New, monospace', label: 'Courier New' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading styles...</p>
      </div>
    );
  }

  const themeCssPath = currentThemeId 
    ? `/theme/${currentThemeId}/theme.css`
    : null;

  const themeCssUrl = currentThemeId
    ? `${window.location.origin}/theme/${currentThemeId}/theme.css`
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brandPurple" />
          Theme Styles
        </h3>
        <p className="text-muted-foreground">
          Manage styles for your theme. Styles are linked to your theme's CSS file and applied to the theme pages.
        </p>
      </div>

      {/* Theme CSS File Information */}
      {currentThemeId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Link2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Linked Theme CSS File
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Your styles are linked to the theme's CSS file. Changes you make here will be saved to the theme's stylesheet.
              </p>
              <div className="bg-white rounded-md p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Theme:</p>
                    <p className="text-lg font-semibold text-gray-900">{currentThemeId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 mb-1">CSS File Path:</p>
                    <code className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">
                      {themeCssPath}
                    </code>
                  </div>
                </div>
                {themeCssUrl && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <a
                      href={themeCssUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Theme CSS File
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs text-blue-700 mt-3">
                ✅ <strong>Note:</strong> Styles are now stored in the database and applied dynamically to your theme. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Style Presets */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brandPurple" />
              Quick Style Presets
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a preset to quickly apply a complete style theme
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stylePresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="p-4 rounded-lg border-2 border-border hover:border-brandPurple transition-all text-left bg-white hover:bg-secondary/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
                <span className="font-semibold text-foreground">{preset.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Section Switcher */}
      <div className="bg-white rounded-lg border border-border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('colors')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'colors'
                ? 'bg-brandPurple text-white shadow-sm'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <Palette className="h-4 w-4 inline mr-2" />
            Colors
          </button>
          <button
            onClick={() => setActiveSection('typography')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'typography'
                ? 'bg-brandPurple text-white shadow-sm'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <Type className="h-4 w-4 inline mr-2" />
            Typography
          </button>
        </div>
      </div>

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <>
          {/* Color Group Switcher */}
          <div className="bg-white rounded-lg border border-border p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveColorGroup('primary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeColorGroup === 'primary'
                    ? 'bg-brandPurple text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Primary Colors
              </button>
              <button
                onClick={() => setActiveColorGroup('secondary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeColorGroup === 'secondary'
                    ? 'bg-brandPurple text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Secondary Colors
              </button>
              <button
                onClick={() => setActiveColorGroup('base')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeColorGroup === 'base'
                    ? 'bg-brandPurple text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Base Colors
              </button>
              <button
                onClick={() => setActiveColorGroup('accent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeColorGroup === 'accent'
                    ? 'bg-brandPurple text-white shadow-sm'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                Accent Colors
              </button>
            </div>
          </div>

          {/* Active Color Group Editor */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
              {activeColorGroup === 'primary' && 'Primary Colors'}
              {activeColorGroup === 'secondary' && 'Secondary Colors'}
              {activeColorGroup === 'base' && 'Base Colors'}
              {activeColorGroup === 'accent' && 'Accent Colors'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colorGroups[activeColorGroup].map((color) => (
                <div key={color.key} className="space-y-2">
                  <Label htmlFor={color.key} className="font-semibold">
                    {color.label}
                  </Label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      id={color.key}
                      value={styles[color.key]}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                    />
                    <Input
                      value={styles[color.key]}
                      onChange={(e) => handleColorChange(color.key, e.target.value)}
                      className="font-mono flex-1"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{color.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Typography Section */}
      {activeSection === 'typography' && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
            Typography Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fontSans" className="font-semibold">Sans Serif Font</Label>
              <select
                id="fontSans"
                value={styles.typography.fontSans}
                onChange={(e) => handleTypographyChange('fontSans', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Main body and UI font</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontSerif" className="font-semibold">Serif Font</Label>
              <select
                id="fontSerif"
                value={styles.typography.fontSerif}
                onChange={(e) => handleTypographyChange('fontSerif', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                {serifFontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Used for headings and emphasis</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontMono" className="font-semibold">Monospace Font</Label>
              <select
                id="fontMono"
                value={styles.typography.fontMono}
                onChange={(e) => handleTypographyChange('fontMono', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                {monoFontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Used for code and technical content</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseFontSize" className="font-semibold">Base Font Size</Label>
              <select
                id="baseFontSize"
                value={styles.typography.baseFontSize}
                onChange={(e) => handleTypographyChange('baseFontSize', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="14px">Small (14px)</option>
                <option value="16px">Medium (16px)</option>
                <option value="17px">Large (17px)</option>
                <option value="18px">Extra Large (18px)</option>
              </select>
              <p className="text-xs text-muted-foreground">Base font size for body text</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headingScale" className="font-semibold">Heading Scale</Label>
              <select
                id="headingScale"
                value={styles.typography.headingScale}
                onChange={(e) => handleTypographyChange('headingScale', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="1.2">Small (1.2x)</option>
                <option value="1.25">Medium (1.25x)</option>
                <option value="1.3">Large (1.3x)</option>
                <option value="1.333">Extra Large (1.333x)</option>
              </select>
              <p className="text-xs text-muted-foreground">Scale factor for heading sizes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lineHeight" className="font-semibold">Line Height</Label>
              <select
                id="lineHeight"
                value={styles.typography.lineHeight}
                onChange={(e) => handleTypographyChange('lineHeight', e.target.value)}
                className="w-full px-3 py-2 bg-background border-2 border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              >
                <option value="1.3">Tight (1.3)</option>
                <option value="1.5">Normal (1.5)</option>
                <option value="1.6">Comfortable (1.6)</option>
                <option value="1.65">Relaxed (1.65)</option>
                <option value="1.7">Very Relaxed (1.7)</option>
              </select>
              <p className="text-xs text-muted-foreground">Line spacing for readability</p>
            </div>
          </div>

          {/* Typography Preview */}
          <div className="mt-6 p-6 rounded-lg border-2 border-border bg-card">
            <h5 className="text-sm font-medium text-muted-foreground mb-4">Typography Preview</h5>
            <div style={{ fontFamily: styles.typography.fontSans, fontSize: styles.typography.baseFontSize, lineHeight: styles.typography.lineHeight }}>
              <h1 style={{ fontFamily: styles.typography.fontSerif, fontSize: `calc(${styles.typography.baseFontSize} * ${parseFloat(styles.typography.headingScale) ** 3})` }} className="mb-2">
                Heading 1
              </h1>
              <h2 style={{ fontFamily: styles.typography.fontSerif, fontSize: `calc(${styles.typography.baseFontSize} * ${parseFloat(styles.typography.headingScale) ** 2})` }} className="mb-2">
                Heading 2
              </h2>
              <p className="mb-4">
                This is a sample paragraph showing how your typography settings will look. The text uses your selected sans-serif font with the configured base size and line height for optimal readability.
              </p>
              <code style={{ fontFamily: styles.typography.fontMono }} className="text-sm bg-muted p-2 rounded">
                const code = "monospace font";
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      <div className="bg-white rounded-lg border border-border p-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Preview
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              style={{
                backgroundColor: styles.primary,
                color: styles.primaryForeground,
                fontFamily: styles.typography.fontSans
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: styles.secondary,
                color: styles.secondaryForeground,
                fontFamily: styles.typography.fontSans
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Secondary Button
            </button>
            <button
              style={{
                backgroundColor: styles.accent,
                color: styles.accentForeground,
                fontFamily: styles.typography.fontSans
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Accent Button
            </button>
          </div>
          
          <div
            style={{
              backgroundColor: styles.card,
              color: styles.cardForeground,
              borderColor: styles.border,
              fontFamily: styles.typography.fontSans,
              fontSize: styles.typography.baseFontSize,
              lineHeight: styles.typography.lineHeight
            }}
            className="p-4 rounded-lg border-2"
          >
            <h3 style={{ fontFamily: styles.typography.fontSerif }} className="text-lg font-semibold mb-2">
              Card Preview
            </h3>
            <p className="text-sm" style={{ color: styles.mutedForeground }}>
              This is how a card would look with your current color scheme and typography settings.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          variant="default"
          className="bg-brandPurple hover:bg-brandPurple/90"
          onClick={handleSave}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Styles'}
        </Button>
      </div>
    </div>
  );
};

export default StylesSettingsPage;
