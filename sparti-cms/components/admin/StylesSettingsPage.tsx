import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Palette, Save, Eye, Type, Link2, FileText } from 'lucide-react';
import api from '../../utils/api';

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

type BrandColorRoles = {
  brandPrimary: string;
  onBrandPrimary: string;
  brandSecondary: string;
  neutralDark: string;
  neutralLight: string;
  accentColor: string;
};

const defaultTypography: TypographySettings = {
  fontSans: 'Inter, sans-serif',
  fontSerif: 'Playfair Display, serif',
  fontMono: 'Fira Code, monospace',
  baseFontSize: '16px',
  headingScale: '1.25',
  lineHeight: '1.6',
};

const defaultBrandColors: Omit<BrandColorRoles, 'onBrandPrimary'> & { onBrandPrimary?: string } = {
  brandPrimary: '#8b5cf6',
  brandSecondary: '#4338ca',
  neutralDark: '#1f2937',
  neutralLight: '#ffffff',
  accentColor: '#1e40af',
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || !hex.startsWith('#')) return null;
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return { r, g, b };
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function mixHex(a: string, b: string, amountB: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return a;
  const t = clamp(amountB, 0, 1);
  return rgbToHex({
    r: ra.r + (rb.r - ra.r) * t,
    g: ra.g + (rb.g - ra.g) * t,
    b: ra.b + (rb.b - ra.b) * t,
  });
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => v / 255);
  const lin = srgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function autoTextOn(hexBackground: string): '#ffffff' | '#111111' {
  // Simple and reliable for UI: white on dark colors, near-black on light colors.
  const lum = relativeLuminance(hexBackground);
  return lum > 0.5 ? '#111111' : '#ffffff';
}

function deriveThemeStyles(colors: BrandColorRoles, typography: TypographySettings): ThemeStyles {
  const secondarySurface = mixHex(colors.brandSecondary, colors.neutralLight, 0.9);
  const accentSurface = mixHex(colors.accentColor, colors.neutralLight, 0.9);

  const mutedSurface = mixHex(colors.neutralDark, colors.neutralLight, 0.96);
  const mutedText = mixHex(colors.neutralDark, colors.neutralLight, 0.55);

  const border = mixHex(colors.neutralDark, colors.neutralLight, 0.85);

  return {
    primary: colors.brandPrimary,
    primaryForeground: colors.onBrandPrimary,

    secondary: secondarySurface,
    secondaryForeground: colors.brandSecondary,

    background: colors.neutralLight,
    foreground: colors.neutralDark,

    card: colors.neutralLight,
    cardForeground: colors.neutralDark,

    accent: accentSurface,
    accentForeground: colors.accentColor,

    muted: mutedSurface,
    mutedForeground: mutedText,

    border,
    input: border,
    ring: colors.brandPrimary,

    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    typography,
  };
}

function extractBrandColorsFromThemeStyles(themeStyles: Partial<ThemeStyles> | null | undefined): BrandColorRoles {
  const brandPrimary = themeStyles?.primary || defaultBrandColors.brandPrimary;

  // Prefer existing foreground tokens (from prior shadcn-style presets) for brand roles.
  const brandSecondary = themeStyles?.secondaryForeground || themeStyles?.secondary || defaultBrandColors.brandSecondary;
  const accentColor = themeStyles?.accentForeground || themeStyles?.accent || defaultBrandColors.accentColor;

  const neutralDark = themeStyles?.foreground || defaultBrandColors.neutralDark;
  const neutralLight = themeStyles?.background || defaultBrandColors.neutralLight;

  const suggestedOnPrimary = autoTextOn(brandPrimary);
  const onBrandPrimary = themeStyles?.primaryForeground || suggestedOnPrimary;

  return {
    brandPrimary,
    onBrandPrimary,
    brandSecondary,
    neutralDark,
    neutralLight,
    accentColor,
  };
}

interface StylesSettingsPageProps {
  currentTenantId: string;
}

const StylesSettingsPage: React.FC<StylesSettingsPageProps> = ({ currentTenantId }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'colors' | 'typography'>('colors');
  const justSavedRef = useRef(false);

  const [brandColors, setBrandColors] = useState<BrandColorRoles>(() => {
    const initialPrimary = defaultBrandColors.brandPrimary;
    return {
      ...extractBrandColorsFromThemeStyles({ primary: initialPrimary }),
      onBrandPrimary: autoTextOn(initialPrimary),
    };
  });

  const [primaryTextMode, setPrimaryTextMode] = useState<'auto' | 'manual'>(() => {
    const computed = autoTextOn(defaultBrandColors.brandPrimary);
    return (defaultBrandColors.onBrandPrimary || computed) === computed ? 'auto' : 'manual';
  });

  const [typography, setTypography] = useState<TypographySettings>(defaultTypography);

  const derivedStyles = useMemo(() => deriveThemeStyles(brandColors, typography), [brandColors, typography]);

  // Load saved styles from API (tenant-level, shared across themes)
  useEffect(() => {
    const loadStyles = async () => {
      if (!currentTenantId) return;

      // Skip loading if we just saved - the save handler already reloaded the styles
      if (justSavedRef.current) {
        return;
      }

      try {
        setLoading(true);
        const cacheBuster = Date.now();
        const endpoint = `/api/settings/styles?tenantId=${encodeURIComponent(currentTenantId)}&_t=${cacheBuster}`;
        const response = await api.get(endpoint);

        if (response.ok) {
          const savedStyles = await response.json();

          if (savedStyles && Object.keys(savedStyles).length > 0) {
            const { theme_id, css_path, ...styleProperties } = savedStyles;

            const nextBrandColors = extractBrandColorsFromThemeStyles(styleProperties);
            setBrandColors(nextBrandColors);

            const autoOnPrimary = autoTextOn(nextBrandColors.brandPrimary);
            setPrimaryTextMode(nextBrandColors.onBrandPrimary === autoOnPrimary ? 'auto' : 'manual');

            setTypography({
              ...defaultTypography,
              ...(styleProperties.typography || {}),
            });

            return;
          }
        }

        // No saved styles found: stick to defaults
        const fallback = extractBrandColorsFromThemeStyles(null);
        setBrandColors(fallback);
        setPrimaryTextMode(fallback.onBrandPrimary === autoTextOn(fallback.brandPrimary) ? 'auto' : 'manual');
        setTypography(defaultTypography);
      } catch (error) {
        console.error('[Brand Setup] Error loading styles:', error);
        const fallback = extractBrandColorsFromThemeStyles(null);
        setBrandColors(fallback);
        setPrimaryTextMode(fallback.onBrandPrimary === autoTextOn(fallback.brandPrimary) ? 'auto' : 'manual');
        setTypography(defaultTypography);
      } finally {
        setLoading(false);
      }
    };

    loadStyles();
  }, [currentTenantId]);

  const updateBrandColor = (key: keyof BrandColorRoles, value: string) => {
    setBrandColors((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'brandPrimary' && primaryTextMode === 'auto') {
        next.onBrandPrimary = autoTextOn(value);
      }
      return next;
    });
  };

  const handleTypographyChange = (field: keyof TypographySettings, value: string) => {
    setTypography((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!currentTenantId) {
      alert('Please select a tenant');
      return;
    }

    try {
      setSaving(true);
      justSavedRef.current = true;

      const stylesToSave = deriveThemeStyles(brandColors, {
        ...defaultTypography,
        ...(typography || {}),
      });

      const response = await api.put(
        `/api/settings/styles?tenantId=${encodeURIComponent(currentTenantId)}`,
        {
          setting_value: JSON.stringify(stylesToSave),
          setting_type: 'json',
          setting_category: 'theme',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Brand Setup] Save failed:', errorText);
        justSavedRef.current = false;
        alert('Failed to save. Please check the console for details.');
        return;
      }

      // Wait for database commit
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Reload saved styles to confirm
      const cacheBuster = Date.now();
      const endpoint = `/api/settings/styles?tenantId=${encodeURIComponent(currentTenantId)}&_t=${cacheBuster}`;
      const reloadResponse = await api.get(endpoint);

      if (reloadResponse.ok) {
        const saved = await reloadResponse.json();
        const { theme_id, css_path, ...styleProperties } = saved || {};

        const nextBrandColors = extractBrandColorsFromThemeStyles(styleProperties);
        setBrandColors(nextBrandColors);
        setPrimaryTextMode(nextBrandColors.onBrandPrimary === autoTextOn(nextBrandColors.brandPrimary) ? 'auto' : 'manual');
        setTypography({
          ...defaultTypography,
          ...(styleProperties?.typography || {}),
        });
      }

      setTimeout(() => {
        justSavedRef.current = false;
      }, 1000);

      alert(`Brand setup saved successfully!\n\nTenant: ${currentTenantId}`);
    } catch (error) {
      console.error('[Brand Setup] Error saving:', error);
      justSavedRef.current = false;
      alert('Error saving');
    } finally {
      setSaving(false);
    }
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
        <p className="text-muted-foreground">Loading brand setup...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
          <Palette className="h-5 w-5 text-brandPurple" />
          Brand Setup
        </h3>
        <p className="text-muted-foreground">
          Define your brand colors once. The system applies them consistently across the site.
        </p>
      </div>

      {/* Tenant Styles Information */}
      {currentTenantId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Link2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tenant Styles
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Brand setup is tenant-level and shared across all themes. Changes you make here will be applied everywhere for this tenant.
              </p>
              <div className="bg-white rounded-md p-4 border border-blue-200">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Tenant:</p>
                  <p className="text-lg font-semibold text-gray-900">{currentTenantId}</p>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                ✅ <strong>Note:</strong> Settings are stored in the database and applied dynamically.
              </p>
            </div>
          </div>
        </div>
      )}

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
        <div className="bg-white rounded-lg border border-border p-6">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
            Brand Colors
          </h4>

          <div className="space-y-6">
            {/* Brand Primary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="font-semibold">Brand Primary</Label>
                  <p className="text-xs text-muted-foreground">Used for main CTAs, highlights, and key actions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColors.brandPrimary}
                  onChange={(e) => updateBrandColor('brandPrimary', e.target.value)}
                  className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                  aria-label="Brand Primary color picker"
                />
                <Input
                  value={brandColors.brandPrimary}
                  onChange={(e) => updateBrandColor('brandPrimary', e.target.value)}
                  className="font-mono flex-1"
                  placeholder="#000000"
                />
              </div>

              <div className="mt-3 rounded-lg border border-border p-4 bg-muted/30">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium text-foreground">Text on Primary</p>
                    <p className="text-xs text-muted-foreground">Auto-contrast or manual</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryTextMode('auto');
                        setBrandColors((prev) => ({ ...prev, onBrandPrimary: autoTextOn(prev.brandPrimary) }));
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        primaryTextMode === 'auto'
                          ? 'bg-brandPurple text-white'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryTextMode('manual')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        primaryTextMode === 'manual'
                          ? 'bg-brandPurple text-white'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <input
                    type="color"
                    value={primaryTextMode === 'auto' ? autoTextOn(brandColors.brandPrimary) : brandColors.onBrandPrimary}
                    onChange={(e) => {
                      setPrimaryTextMode('manual');
                      updateBrandColor('onBrandPrimary', e.target.value);
                    }}
                    disabled={primaryTextMode === 'auto'}
                    className="w-14 h-14 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label="Text on Primary color picker"
                  />
                  <Input
                    value={primaryTextMode === 'auto' ? autoTextOn(brandColors.brandPrimary) : brandColors.onBrandPrimary}
                    onChange={(e) => {
                      setPrimaryTextMode('manual');
                      updateBrandColor('onBrandPrimary', e.target.value);
                    }}
                    disabled={primaryTextMode === 'auto'}
                    className="font-mono flex-1 disabled:opacity-60"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Brand Secondary */}
            <div className="space-y-2">
              <Label className="font-semibold">Brand Secondary</Label>
              <p className="text-xs text-muted-foreground">Used for icons, badges, and secondary emphasis</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColors.brandSecondary}
                  onChange={(e) => updateBrandColor('brandSecondary', e.target.value)}
                  className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                  aria-label="Brand Secondary color picker"
                />
                <Input
                  value={brandColors.brandSecondary}
                  onChange={(e) => updateBrandColor('brandSecondary', e.target.value)}
                  className="font-mono flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Neutral Dark */}
            <div className="space-y-2">
              <Label className="font-semibold">Neutral Dark</Label>
              <p className="text-xs text-muted-foreground">Used for headings and body text</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColors.neutralDark}
                  onChange={(e) => updateBrandColor('neutralDark', e.target.value)}
                  className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                  aria-label="Neutral Dark color picker"
                />
                <Input
                  value={brandColors.neutralDark}
                  onChange={(e) => updateBrandColor('neutralDark', e.target.value)}
                  className="font-mono flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Neutral Light */}
            <div className="space-y-2">
              <Label className="font-semibold">Neutral Light</Label>
              <p className="text-xs text-muted-foreground">Used for page backgrounds and cards</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColors.neutralLight}
                  onChange={(e) => updateBrandColor('neutralLight', e.target.value)}
                  className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                  aria-label="Neutral Light color picker"
                />
                <Input
                  value={brandColors.neutralLight}
                  onChange={(e) => updateBrandColor('neutralLight', e.target.value)}
                  className="font-mono flex-1"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            {/* Accent */}
            <div className="space-y-2">
              <Label className="font-semibold">Accent Color</Label>
              <p className="text-xs text-muted-foreground">Used for hover states, success indicators, and highlights</p>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColors.accentColor}
                  onChange={(e) => updateBrandColor('accentColor', e.target.value)}
                  className="w-16 h-16 rounded-md border-2 border-input cursor-pointer hover:border-ring transition-colors"
                  aria-label="Accent color picker"
                />
                <Input
                  value={brandColors.accentColor}
                  onChange={(e) => updateBrandColor('accentColor', e.target.value)}
                  className="font-mono flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Typography Section */}
      {activeSection === 'typography' && (
        <div className="bg-white rounded-lg border border-border p-6">
          <h4 className="text-lg font-medium text-foreground border-b border-border pb-2 mb-4">
            Typography
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fontSans" className="font-semibold">Sans Serif Font</Label>
              <select
                id="fontSans"
                value={typography.fontSans}
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
                value={typography.fontSerif}
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
                value={typography.fontMono}
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
                value={typography.baseFontSize}
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
                value={typography.headingScale}
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
                value={typography.lineHeight}
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
            <div style={{ fontFamily: typography.fontSans, fontSize: typography.baseFontSize, lineHeight: typography.lineHeight }}>
              <h1 style={{ fontFamily: typography.fontSerif, fontSize: `calc(${typography.baseFontSize} * ${parseFloat(typography.headingScale) ** 3})` }} className="mb-2">
                Heading 1
              </h1>
              <h2 style={{ fontFamily: typography.fontSerif, fontSize: `calc(${typography.baseFontSize} * ${parseFloat(typography.headingScale) ** 2})` }} className="mb-2">
                Heading 2
              </h2>
              <p className="mb-4">
                This is a sample paragraph showing how your typography settings will look across the site.
              </p>
              <code style={{ fontFamily: typography.fontMono }} className="text-sm bg-muted p-2 rounded">
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
                backgroundColor: derivedStyles.primary,
                color: derivedStyles.primaryForeground,
                fontFamily: typography.fontSans,
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Primary Button
            </button>
            <button
              style={{
                backgroundColor: derivedStyles.secondary,
                color: derivedStyles.secondaryForeground,
                fontFamily: typography.fontSans,
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Secondary
            </button>
            <button
              style={{
                backgroundColor: derivedStyles.accent,
                color: derivedStyles.accentForeground,
                fontFamily: typography.fontSans,
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
            >
              Accent
            </button>
          </div>

          <div
            style={{
              backgroundColor: derivedStyles.card,
              color: derivedStyles.cardForeground,
              borderColor: derivedStyles.border,
              fontFamily: typography.fontSans,
              fontSize: typography.baseFontSize,
              lineHeight: typography.lineHeight,
            }}
            className="p-4 rounded-lg border-2"
          >
            <h3 style={{ fontFamily: typography.fontSerif }} className="text-lg font-semibold mb-2">
              Card Preview
            </h3>
            <p className="text-sm" style={{ color: derivedStyles.mutedForeground }}>
              This is how key UI surfaces will look with your brand setup.
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
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default StylesSettingsPage;