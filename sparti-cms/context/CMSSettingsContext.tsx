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
  folderId: string | null;
}

export interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
}

export interface CMSSettings {
  typography: TypographySettings;
  colors: ColorSettings;
  logo: LogoSettings;
  mediaItems: MediaItem[];
  mediaFolders: MediaFolder[];
}

interface CMSSettingsContextType {
  settings: CMSSettings;
  updateTypography: (typography: Partial<TypographySettings>) => void;
  updateColors: (colors: Partial<ColorSettings>) => void;
  updateLogo: (logo: Partial<LogoSettings>) => void;
  addMediaItem: (item: MediaItem) => void;
  removeMediaItem: (id: string) => void;
  addMediaFolder: (folder: MediaFolder) => void;
  removeMediaFolder: (id: string) => void;
  updateMediaItemFolder: (itemId: string, folderId: string | null) => void;
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
  mediaFolders: [
    { id: 'uncategorized', name: 'Uncategorized', itemCount: 0 }
  ],
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
        
        // Ensure mediaFolders is always an array
        if (!parsedSettings.mediaFolders || !Array.isArray(parsedSettings.mediaFolders)) {
          parsedSettings.mediaFolders = [
            { id: 'uncategorized', name: 'Uncategorized', itemCount: 0 }
          ];
        }
        
        // Ensure mediaItems is always an array
        if (!parsedSettings.mediaItems || !Array.isArray(parsedSettings.mediaItems)) {
          parsedSettings.mediaItems = [];
        }
        
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
      mediaItems: Array.isArray(prev.mediaItems) ? [item, ...prev.mediaItems] : [item],
    }));
  };

  // Remove a media item
  const removeMediaItem = (id: string) => {
    setSettings(prev => ({
      ...prev,
      mediaItems: Array.isArray(prev.mediaItems) 
        ? prev.mediaItems.filter(item => item.id !== id)
        : [],
    }));
  };

  // Add a media folder
  const addMediaFolder = (folder: MediaFolder) => {
    setSettings(prev => ({
      ...prev,
      mediaFolders: Array.isArray(prev.mediaFolders) ? [...prev.mediaFolders, folder] : [folder],
    }));
  };

  // Remove a media folder
  const removeMediaFolder = (id: string) => {
    setSettings(prev => ({
      ...prev,
      mediaFolders: Array.isArray(prev.mediaFolders) 
        ? prev.mediaFolders.filter(folder => folder.id !== id)
        : [{ id: 'uncategorized', name: 'Uncategorized', itemCount: 0 }],
    }));
  };

  // Update media item folder
  const updateMediaItemFolder = (itemId: string, folderId: string | null) => {
    setSettings(prev => ({
      ...prev,
      mediaItems: Array.isArray(prev.mediaItems) 
        ? prev.mediaItems.map(item =>
            item.id === itemId ? { ...item, folderId } : item
          )
        : [],
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
        addMediaFolder,
        removeMediaFolder,
        updateMediaItemFolder,
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