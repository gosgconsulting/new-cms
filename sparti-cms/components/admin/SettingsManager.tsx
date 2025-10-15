import React, { useState, useEffect } from 'react';
import { Image, Monitor, Code, Globe, Search, FileText, Tag, Palette } from 'lucide-react';
import { ColorSettings } from '../cms/ColorSettings';
import { TypographySettings } from '../cms/TypographySettings';
import { ButtonSettings } from '../cms/ButtonSettings';

const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding');

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingTab />;
      case 'style':
        return <StyleTab />;
      case 'seo':
        return <SEOTab />;
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
  const handleSettingsUpdate = (settings: any) => {
    console.log('Settings updated:', settings);
  };

  return (
    <div className="space-y-6">
      <ColorSettings onUpdate={handleSettingsUpdate} />
      <TypographySettings onUpdate={handleSettingsUpdate} />
      <ButtonSettings onUpdate={handleSettingsUpdate} />
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

export default SettingsManager;
