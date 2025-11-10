import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchLanguageSettings } from '../services/languageServiceBridge';
import { useAuth } from '../components/auth/AuthProvider';

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
  alt?: string;
  title?: string;
  description?: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
}

export interface Language {
  code: string;
  name: string;
}

export interface LanguageSettings {
  defaultLanguage: Language;
  additionalLanguages: Language[];
}

export interface CMSSettings {
  typography: TypographySettings;
  colors: ColorSettings;
  logo: LogoSettings;
  language: LanguageSettings;
  mediaItems: MediaItem[];
  mediaFolders: MediaFolder[];
}

interface CMSSettingsContextType {
  settings: CMSSettings;
  updateTypography: (typography: Partial<TypographySettings>) => void;
  updateColors: (colors: Partial<ColorSettings>) => void;
  updateLogo: (logo: Partial<LogoSettings>) => void;
  updateLanguage: (language: Partial<LanguageSettings>) => void;
  addMediaItem: (item: MediaItem) => void;
  removeMediaItem: (id: string) => void;
  updateMediaItem: (id: string, updates: Partial<MediaItem>) => void;
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
  language: {
    defaultLanguage: { code: 'en', name: 'English' },
    additionalLanguages: []
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
  const { currentTenantId } = useAuth();
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
        
        // Ensure language settings exist
        if (!parsedSettings.language) {
          parsedSettings.language = {
            defaultLanguage: { code: 'en', name: 'English' },
            additionalLanguages: []
          };
        }
        
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Load language settings from database
  useEffect(() => {
    const loadLanguageSettings = async () => {
      try {
        console.log(`[testing] CMSSettingsContext: Loading language settings for tenant: ${currentTenantId || 'default'}`);
        const langSettings = await fetchLanguageSettings(currentTenantId);
        
        if (langSettings) {
          console.log('[testing] CMSSettingsContext: Loaded language settings:', langSettings);
          
          // Convert defaultLanguage string to Language object
          const defaultLang = langSettings.defaultLanguage || 'en';
          const defaultLanguage = { 
            code: defaultLang, 
            name: getLanguageNameFromCode(defaultLang) 
          };
          
          // Convert additionalLanguages string to array of Language objects
          const additionalLangs = langSettings.additionalLanguages || '';
          const additionalLanguages = additionalLangs
            .split(',')
            .filter(code => code.trim() !== '' && code.trim() !== defaultLang)
            .map(code => ({
              code: code.trim(),
              name: getLanguageNameFromCode(code.trim())
            }));
          
          console.log('[testing] CMSSettingsContext: Processed language settings:', {
            defaultLanguage,
            additionalLanguages
          });
          
          // Update settings with language data from database
          setSettings(prev => ({
            ...prev,
            language: {
              defaultLanguage,
              additionalLanguages
            }
          }));
        }
      } catch (error) {
        console.error('[testing] CMSSettingsContext: Error loading language settings:', error);
      }
    };
    
    if (isInitialized) {
      loadLanguageSettings();
    }
  }, [currentTenantId, isInitialized]);
  
  // Helper function to get language name from code
  function getLanguageNameFromCode(code: string): string {
    // This is a simplified version - in a real implementation, you would have a more complete mapping
    const languageMap: {[key: string]: string} = {
      'en': 'English',
      'fr': 'French',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'pa': 'Punjabi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tr': 'Turkish',
      'pl': 'Polish',
      'uk': 'Ukrainian',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'no': 'Norwegian',
      'da': 'Danish',
      'fi': 'Finnish',
      'cs': 'Czech',
      'sk': 'Slovak',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'el': 'Greek',
      'he': 'Hebrew',
      'ur': 'Urdu',
      'fa': 'Persian',
      'sw': 'Swahili'
    };
    
    return languageMap[code] || code.charAt(0).toUpperCase() + code.slice(1);
  }

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

  // Update language settings
  const updateLanguage = (language: Partial<LanguageSettings>) => {
    setSettings(prev => ({
      ...prev,
      language: {
        ...prev.language,
        ...language,
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

  // Update a media item
  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setSettings(prev => ({
      ...prev,
      mediaItems: Array.isArray(prev.mediaItems) 
        ? prev.mediaItems.map(item =>
            item.id === id ? { ...item, ...updates } : item
          )
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
        updateLanguage,
        addMediaItem,
        removeMediaItem,
        updateMediaItem,
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