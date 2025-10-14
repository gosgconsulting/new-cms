import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load settings from localStorage on initial render
  useEffect(() => {
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
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, isInitialized]);

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