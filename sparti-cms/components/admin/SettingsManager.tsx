import React, { useState, useEffect } from 'react';
import { Settings, Palette, Type, Image, Monitor, Sun, Moon, Code, Globe, Search, FileText, Tag, Link } from 'lucide-react';

const SettingsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('branding');

  const tabs = [
    { id: 'branding', label: 'Branding', icon: Image },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'developer', label: 'Developer', icon: Code },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingTab />;
      case 'style':
        return <StyleTab />;
      case 'seo':
        return <SEOTab />;
      case 'developer':
        return <DeveloperTab />;
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

// Placeholder components for other tabs
const StyleTab: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Style Settings</h2>
    <p className="text-gray-600">Style settings will be implemented here.</p>
  </div>
);

const SEOTab: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
    <p className="text-gray-600">SEO settings will be implemented here.</p>
  </div>
);

const DeveloperTab: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Developer Settings</h2>
    <p className="text-gray-600">Developer settings will be implemented here.</p>
  </div>
);

export default SettingsManager;
