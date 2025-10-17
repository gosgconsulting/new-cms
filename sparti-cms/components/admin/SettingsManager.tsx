import React, { useState, useEffect } from 'react';
import { Image, Monitor, Code, Globe, Search, FileText, Tag, Palette, Type, Shield, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw, Plus, X } from 'lucide-react';

const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding');

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'domain', label: 'Domain', icon: Globe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingTab />;
      case 'style':
        return <StyleTab />;
      case 'seo':
        return <SEOTab />;
      case 'domain':
        return <DomainTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Database-connected Branding Tab Component
const BrandingTab: React.FC = () => {
  const [brandingData, setBrandingData] = useState({
    site_name: '',
    site_tagline: '',
    site_logo: '',
    site_favicon: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load branding settings on component mount
  useEffect(() => {
    loadBrandingSettings();
  }, []);

  const loadBrandingSettings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('[testing] Loading branding settings...');
      
      // For now, we'll use a mock API call since we're in frontend
      // In a real implementation, this would call the backend API
      const response = await fetch('/api/branding');
      if (response.ok) {
        const settings = await response.json();
        setBrandingData({
          site_name: settings.site_name || '',
          site_tagline: settings.site_tagline || '',
          site_logo: settings.site_logo || '',
          site_favicon: settings.site_favicon || ''
        });
        console.log('[testing] Branding settings loaded:', settings);
      } else {
        // Use default values if API call fails
        setBrandingData({
          site_name: 'GO SG',
          site_tagline: 'Digital Marketing Agency',
          site_logo: '',
          site_favicon: ''
        });
        console.log('[testing] Using default branding settings');
      }
    } catch (err) {
      console.error('[testing] Error loading branding settings:', err);
      setError('Failed to load branding settings');
      // Use default values on error
      setBrandingData({
        site_name: 'GO SG',
        site_tagline: 'Digital Marketing Agency',
        site_logo: '',
        site_favicon: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      console.log('[testing] Saving branding settings:', brandingData);
      
      // For now, we'll use a mock API call since we're in frontend
      // In a real implementation, this would call the backend API
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(brandingData),
      });
      
      if (response.ok) {
        console.log('[testing] Branding settings saved successfully');
        // Show success message (you could add a toast notification here)
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('[testing] Error saving branding settings:', err);
      setError('Failed to save branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Branding</h3>
        <p className="text-sm text-gray-600 mb-6">
          Customize your site's branding elements including name, tagline, logo, and favicon.
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={brandingData.site_name}
              onChange={(e) => handleInputChange('site_name', e.target.value)}
              placeholder="Your Site Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={brandingData.site_tagline}
              onChange={(e) => handleInputChange('site_tagline', e.target.value)}
              placeholder="Your site's tagline or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Logo & Favicon */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
              <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload logo</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
              {brandingData.site_logo && (
                <p className="text-xs text-purple-600 mt-2">Current: {brandingData.site_logo}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favicon
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Upload favicon</p>
              <p className="text-xs text-gray-500">32x32 PNG</p>
              {brandingData.site_favicon && (
                <p className="text-xs text-purple-600 mt-2">Current: {brandingData.site_favicon}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Branding Settings'}
        </button>
      </div>
    </div>
  );
};

// Style Tab with Color, Typography, and Button Settings
const StyleTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <ColorSettings />
      <TypographySettings />
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Button Settings</h4>
        <p className="text-sm text-gray-600">Configure button styles and variants for your website.</p>
      </div>
    </div>
  );
};

// Typography Settings Component
const TypographySettings: React.FC = () => {
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
              <label htmlFor="headingFont" className="block text-sm font-medium text-gray-700">Heading Font</label>
              <select
                id="headingFont"
                value={fontSettings.headingFont}
                onChange={(e) => handleInputChange('headingFont', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Font used for headings (h1-h6)</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="bodyFont" className="block text-sm font-medium text-gray-700">Body Font</label>
              <select
                id="bodyFont"
                value={fontSettings.bodyFont}
                onChange={(e) => handleInputChange('bodyFont', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Font used for body text and paragraphs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="baseFontSize" className="block text-sm font-medium text-gray-700">Base Font Size</label>
              <select
                id="baseFontSize"
                value={fontSettings.baseFontSize}
                onChange={(e) => handleInputChange('baseFontSize', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {fontSizeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Base size for all text on your site</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="lineHeight" className="block text-sm font-medium text-gray-700">Line Height</label>
              <select
                id="lineHeight"
                value={fontSettings.lineHeight}
                onChange={(e) => handleInputChange('lineHeight', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {lineHeightOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Line spacing for better readability</p>
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

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Save Typography Settings
        </button>
      </div>
    </div>
  );
};

// Color Settings Component
const ColorSettings: React.FC = () => {
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
            <label htmlFor="primary" className="block text-sm font-medium text-gray-700">Primary Color (Brand Purple)</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="primary"
                value={colorScheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Main brand color used for primary elements</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="accent" className="block text-sm font-medium text-gray-700">Accent Color (Coral)</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="accent"
                value={colorScheme.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Used for call-to-action buttons and highlights</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="brandTeal" className="block text-sm font-medium text-gray-700">Brand Teal</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="brandTeal"
                value={colorScheme.brandTeal}
                onChange={(e) => handleColorChange('brandTeal', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.brandTeal}
                onChange={(e) => handleColorChange('brandTeal', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Used for gradients and secondary accents</p>
          </div>
        </div>
      </div>

      {/* UI Colors */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-foreground border-b border-border pb-2">UI Colors</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="background" className="block text-sm font-medium text-gray-700">Background</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="background"
                value={colorScheme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Main background color of the site</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="foreground" className="block text-sm font-medium text-gray-700">Foreground</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="foreground"
                value={colorScheme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Main text color</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="secondary" className="block text-sm font-medium text-gray-700">Secondary</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="secondary"
                value={colorScheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Used for secondary UI elements</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="muted" className="block text-sm font-medium text-gray-700">Muted Background</label>
            <div className="flex items-center space-x-4">
              <input
                type="color"
                id="muted"
                value={colorScheme.muted}
                onChange={(e) => handleColorChange('muted', e.target.value)}
                className="w-12 h-12 rounded-md border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={colorScheme.muted}
                onChange={(e) => handleColorChange('muted', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <p className="text-xs text-gray-500">Used for subtle background areas</p>
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

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Save Color Settings
        </button>
      </div>
    </div>
  );
};

const SEOTab: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState({
    sitemapEnabled: true,
    titleTemplate: '{{page_title}} | {{site_name}}',
    homeTitleTemplate: '{{site_name}} | {{tagline}}',
    descriptionTemplate: '{{page_excerpt}}',
    homeDescription: '',
    separator: '|',
    noindexPages: [] as string[],
    robotsTxt: `User-agent: *
Allow: /

Sitemap: {{site_url}}/sitemap.xml`,
  });

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setSeoSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const separatorOptions = [
    { value: '|', label: '| (Pipe)' },
    { value: '-', label: '- (Dash)' },
    { value: '•', label: '• (Bullet)' },
    { value: '/', label: '/ (Slash)' },
    { value: ':', label: ': (Colon)' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure search engine optimization settings for better visibility and ranking.
        </p>
      </div>
      
      {/* Sitemap Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            XML Sitemap
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Automatically generate and manage your site's XML sitemap
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h5 className="font-medium text-gray-900">Enable XML Sitemap</h5>
              <p className="text-sm text-gray-600">Automatically generate sitemap.xml for search engines</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={seoSettings.sitemapEnabled}
                onChange={(e) => handleInputChange('sitemapEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          {seoSettings.sitemapEnabled && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitemap URL
                  </label>
                  <input
                    type="text"
                    value="/sitemap.xml"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Generated
                  </label>
                  <input
                    type="text"
                    value="Auto-generated on content changes"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                Regenerate Sitemap Now
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Meta Titles & Descriptions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center">
            <Tag className="h-5 w-5 mr-2" />
            Meta Titles & Descriptions
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Configure title and description templates using variables
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Title Templates */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Title Templates</h5>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title Template
                </label>
                <input
                  type="text"
                  value={seoSettings.titleTemplate}
                  onChange={(e) => handleInputChange('titleTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: {`{{page_title}}, {{site_name}}, {{category}}, {{author}}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Homepage Title Template
                </label>
                <input
                  type="text"
                  value={seoSettings.homeTitleTemplate}
                  onChange={(e) => handleInputChange('homeTitleTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: {`{{site_name}}, {{tagline}}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title Separator
                </label>
                <select
                  value={seoSettings.separator}
                  onChange={(e) => handleInputChange('separator', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {separatorOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Description Templates */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Meta Descriptions</h5>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Description Template
                </label>
                <input
                  type="text"
                  value={seoSettings.descriptionTemplate}
                  onChange={(e) => handleInputChange('descriptionTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variables: {`{{page_excerpt}}, {{page_title}}, {{site_name}}, {{category}}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Homepage Description
                </label>
                <textarea
                  value={seoSettings.homeDescription}
                  onChange={(e) => handleInputChange('homeDescription', e.target.value)}
                  rows={3}
                  placeholder="Enter a custom description for your homepage..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended length: 150-160 characters
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced SEO Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Advanced SEO
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Advanced search engine optimization settings
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Robots.txt */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Robots.txt</h5>
            <textarea
              value={seoSettings.robotsTxt}
              onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Variables: {`{{site_url}}`} - Will be automatically replaced with your site URL
            </p>
          </div>
          
          {/* Social Media */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h5 className="font-medium text-gray-900 mb-4">Social Media (Open Graph)</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Social Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                  <Image className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload default social image</p>
                  <p className="text-xs text-gray-500">1200x630px recommended</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@yourhandle"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook App ID
                  </label>
                  <input
                    type="text"
                    placeholder="123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Save SEO Settings
        </button>
      </div>
    </div>
  );
};

// Domain Tab Component
const DomainTab: React.FC = () => {
  const [domainSettings, setDomainSettings] = useState({
    primaryDomain: '',
    secondaryDomains: [] as string[],
    sslEnabled: false,
    redirectToHttps: false,
    wwwRedirect: false,
    error: '',
    isLoading: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setDomainSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSecondaryDomain = () => {
    const newDomain = prompt('Enter a secondary domain (e.g., sub.example.com)');
    if (newDomain && newDomain.trim() !== '') {
      setDomainSettings(prev => ({
        ...prev,
        secondaryDomains: [...prev.secondaryDomains, newDomain.trim()]
      }));
    }
  };

  const handleRemoveSecondaryDomain = (index: number) => {
    setDomainSettings(prev => ({
      ...prev,
      secondaryDomains: prev.secondaryDomains.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setDomainSettings(prev => ({ ...prev, error: '', isLoading: true }));
    
    if (!domainSettings.primaryDomain) {
      setDomainSettings(prev => ({ ...prev, error: 'Primary domain is required.', isLoading: false }));
      return;
    }

    try {
      console.log('[testing] Saving domain settings:', domainSettings);
      
      // For now, we'll use a mock API call since we're in frontend
      // In a real implementation, this would call the backend API
      const response = await fetch('/api/domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(domainSettings),
      });
      
      if (response.ok) {
        console.log('[testing] Domain settings saved successfully');
        // Show success message (you could add a toast notification here)
      } else {
        throw new Error('Failed to save domain settings');
      }
    } catch (err) {
      console.error('[testing] Error saving domain settings:', err);
      setDomainSettings(prev => ({ ...prev, error: 'Failed to save domain settings.' }));
    } finally {
      setDomainSettings(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Management</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure your website's domain settings, SSL certificates, and redirection rules.
        </p>
        {domainSettings.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">{domainSettings.error}</p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Domain Configuration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center mb-4">
            <Globe className="h-5 w-5 mr-2 text-purple-600" />
            Primary Domain
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="primaryDomain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                id="primaryDomain"
                value={domainSettings.primaryDomain}
                onChange={(e) => handleInputChange('primaryDomain', e.target.value)}
                placeholder="e.g., example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your main website domain. All other domains will redirect to this one.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sslEnabled"
                  checked={domainSettings.sslEnabled}
                  onChange={(e) => handleInputChange('sslEnabled', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="sslEnabled" className="ml-2 text-sm text-gray-700">
                  Enable SSL/HTTPS
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="redirectToHttps"
                  checked={domainSettings.redirectToHttps}
                  onChange={(e) => handleInputChange('redirectToHttps', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="redirectToHttps" className="ml-2 text-sm text-gray-700">
                  Redirect HTTP to HTTPS
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="wwwRedirect"
                  checked={domainSettings.wwwRedirect}
                  onChange={(e) => handleInputChange('wwwRedirect', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="wwwRedirect" className="ml-2 text-sm text-gray-700">
                  Redirect www to non-www
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Secondary Domains */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center mb-4">
            <Copy className="h-5 w-5 mr-2 text-purple-600" />
            Secondary Domains
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Domains
              </label>
              <div className="border border-gray-300 rounded-lg p-3 min-h-[100px]">
                {domainSettings.secondaryDomains.length === 0 ? (
                  <p className="text-gray-500 text-sm">No secondary domains added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {domainSettings.secondaryDomains.map((domain, index) => (
                      <div key={index} className="flex items-center bg-gray-100 text-sm text-gray-800 px-3 py-1 rounded-full">
                        <span>{domain}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSecondaryDomain(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddSecondaryDomain}
                className="mt-2 flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Domain
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Add additional domains that will redirect to your primary domain.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* DNS Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 flex items-center mb-4">
          <Shield className="h-5 w-5 mr-2 text-blue-600" />
          DNS Configuration Instructions
        </h4>
        <div className="space-y-3 text-sm text-gray-700">
          <p>To connect your domain to this website, add the following DNS records at your domain registrar:</p>
          <div className="bg-white border border-blue-200 rounded p-3 font-mono text-xs">
            <div className="grid grid-cols-3 gap-4 font-semibold text-gray-900 border-b pb-2 mb-2">
              <span>Type</span>
              <span>Name</span>
              <span>Value</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span>CNAME</span>
              <span>www</span>
              <span>your-app-production.up.railway.app</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-1">
              <span>A</span>
              <span>@</span>
              <span>185.199.108.153</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Note: DNS changes can take up to 72 hours to propagate globally, but usually complete within a few hours.
          </p>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={domainSettings.isLoading}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {domainSettings.isLoading ? 'Saving...' : 'Save Domain Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
