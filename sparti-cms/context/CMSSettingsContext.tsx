import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDatabase } from '../hooks/useDatabase';

// Define types for our CMS settings
export interface TypographySettings {
  headingFont: string;
  bodyFont: string;
  baseFontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  heading: string;
  link: string;
  success: string;
  warning: string;
  error: string;
}

export interface LogoSettings {
  logo: string | null;
  favicon: string | null;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number | null;
}

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  dateUploaded: string;
}

export interface CMSSettings {
  typography: TypographySettings;
  colors: ColorSettings;
  logo: LogoSettings;
  mediaItems: MediaItem[];
}

interface CMSSettingsContextType {
  settings: CMSSettings;
  updateTypography: (typography: Partial<TypographySettings>) => void;
  updateColors: (colors: Partial<ColorSettings>) => void;
  updateLogo: (logo: Partial<LogoSettings>) => void;
  addMediaItem: (item: MediaItem) => void;
  removeMediaItem: (id: string) => void;
  resetSettings: () => void;
}

// Default settings
const defaultSettings: CMSSettings = {
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseFontSize: '16px',
    lineHeight: '1.5',
    letterSpacing: 'normal',
    fontWeight: '400',
  },
  colors: {
    primary: '#0066ff',
    secondary: '#6600cc',
    accent: '#ff9900',
    background: '#ffffff',
    text: '#333333',
    heading: '#111111',
    link: '#0066cc',
    success: '#00cc00',
    warning: '#ffcc00',
    error: '#ff0000',
  },
  logo: {
    logo: null,
    favicon: null,
    logoAlt: 'Site Logo',
    logoWidth: 200,
    logoHeight: null,
  },
  mediaItems: [],
};

// Create the context
const CMSSettingsContext = createContext<CMSSettingsContextType | undefined>(undefined);

// Storage key for localStorage
const STORAGE_KEY = 'cms_settings';

// Provider component
export const CMSSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CMSSettings>(defaultSettings);
  const { settings: dbSettings } = useDatabase();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from database on initial render, fallback to localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from database first
        const dbSiteSettings = await dbSettings.get();
        
        if (dbSiteSettings) {
          // Map database settings to our CMSSettings format
          const mappedSettings: CMSSettings = {
            typography: {
              headingFont: (dbSiteSettings as any).headingFont || defaultSettings.typography.headingFont,
              bodyFont: (dbSiteSettings as any).bodyFont || defaultSettings.typography.bodyFont,
              baseFontSize: (dbSiteSettings as any).baseFontSize?.toString() || defaultSettings.typography.baseFontSize,
              lineHeight: (dbSiteSettings as any).lineHeight?.toString() || defaultSettings.typography.lineHeight,
              letterSpacing: (dbSiteSettings as any).letterSpacing?.toString() || defaultSettings.typography.letterSpacing,
              fontWeight: (dbSiteSettings as any).fontWeight?.toString() || defaultSettings.typography.fontWeight,
            },
            colors: {
              primary: (dbSiteSettings as any).primaryColor || defaultSettings.colors.primary,
              secondary: (dbSiteSettings as any).secondaryColor || defaultSettings.colors.secondary,
              accent: defaultSettings.colors.accent, // Use default since accentColor doesn't exist in DB
              background: defaultSettings.colors.background,
              text: defaultSettings.colors.text,
              heading: defaultSettings.colors.heading,
              link: defaultSettings.colors.link,
              success: defaultSettings.colors.success,
              warning: defaultSettings.colors.warning,
              error: defaultSettings.colors.error,
            },
            logo: {
              logo: (dbSiteSettings as any).logo || null,
              favicon: (dbSiteSettings as any).favicon || null,
              logoAlt: 'Site Logo',
              logoWidth: 200,
              logoHeight: null,
            },
            mediaItems: [],
          };
          
          setSettings(mappedSettings);
          setIsInitialized(true);
          return;
        }
      } catch (error) {
        console.error('Failed to load settings from database:', error);
      }
      
      // Fallback to localStorage if database load fails
      const storedSettings = localStorage.getItem(STORAGE_KEY);
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Failed to parse stored settings:', error);
        }
      }
      
      setIsInitialized(true);
    };
    
    loadSettings();
  }, [dbSettings]);

  // Save settings to database and localStorage whenever they change (debounced)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Debounce database save to prevent excessive API calls
    const timeoutId = setTimeout(async () => {
      if (!dbSettings) return;
      
      try {
        console.log('Auto-saving CMS settings to database...');
        await dbSettings.update({
          siteName: 'Sparti CMS',
          headingFont: settings.typography.headingFont,
          bodyFont: settings.typography.bodyFont,
          baseFontSize: parseInt(settings.typography.baseFontSize) || 16,
          lineHeight: parseFloat(settings.typography.lineHeight) || 1.5,
          letterSpacing: parseFloat(settings.typography.letterSpacing) || 0,
          fontWeight: parseInt(settings.typography.fontWeight) || 400,
          primaryColor: settings.colors.primary,
          secondaryColor: settings.colors.secondary,
          // Removed accentColor as it doesn't exist in database schema
          logo: settings.logo.logo || undefined,
          favicon: settings.logo.favicon || undefined,
          tenantId: 'default'
        });
        console.log('CMS settings saved successfully');
      } catch (error) {
        console.error('Failed to save settings to database:', error);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [settings.typography.headingFont, settings.typography.bodyFont, settings.typography.baseFontSize, 
      settings.typography.lineHeight, settings.typography.letterSpacing, settings.typography.fontWeight,
      settings.colors.primary, settings.colors.secondary, settings.logo.logo, settings.logo.favicon, 
      isInitialized, dbSettings]);

  // Update typography settings
  const updateTypography = (typography: Partial<TypographySettings>) => {
    setSettings(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        ...typography,
      },
    }));
  };

  // Update color settings
  const updateColors = (colors: Partial<ColorSettings>) => {
    setSettings(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      },
    }));
  };

  // Update logo settings
  const updateLogo = (logo: Partial<LogoSettings>) => {
    setSettings(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        ...logo,
      },
    }));
  };

  // Add a media item
  const addMediaItem = (item: MediaItem) => {
    setSettings(prev => ({
      ...prev,
      mediaItems: [item, ...prev.mediaItems],
    }));
  };

  // Remove a media item
  const removeMediaItem = (id: string) => {
    setSettings(prev => ({
      ...prev,
      mediaItems: prev.mediaItems.filter(item => item.id !== id),
    }));
  };

  // Reset all settings to default
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <CMSSettingsContext.Provider
      value={{
        settings,
        updateTypography,
        updateColors,
        updateLogo,
        addMediaItem,
        removeMediaItem,
        resetSettings,
      }}
    >
      {children}
    </CMSSettingsContext.Provider>
  );
};

// Custom hook to use the CMS settings context
export const useCMSSettings = () => {
  const context = useContext(CMSSettingsContext);
  if (context === undefined) {
    throw new Error('useCMSSettings must be used within a CMSSettingsProvider');
  }
  return context;
};