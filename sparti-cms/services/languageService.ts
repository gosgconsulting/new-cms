/**
 * Language Service
 * Handles fetching and updating language settings from the database
 */

// Types
interface LanguageSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  setting_category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface LanguageSettings {
  defaultLanguage: string;
  additionalLanguages: string;
}

/**
 * Fetches language settings from the database
 * @returns Promise with the language settings
 */
export const fetchLanguageSettings = async (): Promise<LanguageSettings> => {
  try {
    // @ts-ignore - Vite environment variables
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
    
    console.log('[testing] Fetching language settings from API...');
    console.log('[testing] API URL:', `${API_BASE_URL}/api/site-settings/site_language`);
    
    // Fetch site_language (default language)
    const defaultLangResponse = await fetch(`${API_BASE_URL}/api/site-settings/site_language`);
    
    // Fetch site_content_languages (additional languages)
    const additionalLangsResponse = await fetch(`${API_BASE_URL}/api/site-settings/site_content_languages`);
    
    // Log raw responses
    console.log('[testing] Default language response status:', defaultLangResponse.status);
    console.log('[testing] Additional languages response status:', additionalLangsResponse.status);
    
    // Check if responses are ok
    if (!defaultLangResponse.ok) {
      const errorText = await defaultLangResponse.text();
      console.error('[testing] Failed to fetch default language:', errorText);
      throw new Error('Failed to fetch default language');
    }
    
    if (!additionalLangsResponse.ok) {
      const errorText = await additionalLangsResponse.text();
      console.error('[testing] Failed to fetch additional languages:', errorText);
      throw new Error('Failed to fetch additional languages');
    }
    
    // Parse response data
    const defaultLangText = await defaultLangResponse.text();
    console.log('[testing] Raw default language response text:', defaultLangText);
    const defaultLangData = defaultLangText ? JSON.parse(defaultLangText) : null;
    
    const additionalLangsText = await additionalLangsResponse.text();
    console.log('[testing] Raw additional languages response text:', additionalLangsText);
    const additionalLangsData = additionalLangsText ? JSON.parse(additionalLangsText) : null;
    
    console.log('[testing] API response for default language (parsed):', defaultLangData);
    console.log('[testing] API response for additional languages (parsed):', additionalLangsData);
    
    // Extract the setting_value from the response
    let defaultLang = 'en';
    let additionalLangs = '';
    
    // Get the default language
    if (defaultLangData && defaultLangData.setting_value) {
      defaultLang = defaultLangData.setting_value;
      console.log('[testing] Default language from API:', defaultLang);
    } else {
      console.log('[testing] Default language not found in API response, using default:', defaultLang);
      console.log('[testing] Default language data structure:', JSON.stringify(defaultLangData));
    }
    
    // Get the additional languages
    if (additionalLangsData && additionalLangsData.setting_value) {
      additionalLangs = additionalLangsData.setting_value;
      console.log('[testing] Additional languages from API:', additionalLangs);
    } else {
      console.log('[testing] Additional languages not found in API response, using default:', additionalLangs);
      console.log('[testing] Additional languages data structure:', JSON.stringify(additionalLangsData));
    }
    
    console.log('[testing] Extracted language values:', { defaultLang, additionalLangs });
    
    return {
      defaultLanguage: defaultLang,
      additionalLanguages: additionalLangs
    };
  } catch (error) {
    console.error('[testing] Error fetching language settings:', error);
    // Return default values if API call fails
    return {
      defaultLanguage: 'en',
      additionalLanguages: ''
    };
  }
};

/**
 * Updates language settings in the database
 * @param defaultLanguage - The default language code
 * @param additionalLanguages - Comma-separated string of additional language codes
 * @returns Promise with the updated language settings
 */
export const updateLanguageSettings = async (
  defaultLanguage: string,
  additionalLanguages: string
): Promise<LanguageSettings> => {
  try {
    // @ts-ignore - Vite environment variables
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
    
    console.log('[testing] Updating language settings:', { defaultLanguage, additionalLanguages });
    
    // Update site_language (default language)
    const defaultLangResponse = await fetch(`${API_BASE_URL}/api/site-settings/site_language`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setting_value: defaultLanguage,
        setting_type: 'text',
        setting_category: 'localization',
        is_public: true
      }),
    });
    
    // Update site_content_languages (additional languages)
    const additionalLangsResponse = await fetch(`${API_BASE_URL}/api/site-settings/site_content_languages`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        setting_value: additionalLanguages,
        setting_type: 'text',
        setting_category: 'localization',
        is_public: true
      }),
    });
    
    // Check if responses are ok
    if (!defaultLangResponse.ok) {
      console.error('[testing] Failed to update default language:', await defaultLangResponse.text());
      throw new Error('Failed to update default language');
    }
    
    if (!additionalLangsResponse.ok) {
      console.error('[testing] Failed to update additional languages:', await additionalLangsResponse.text());
      throw new Error('Failed to update additional languages');
    }
    
    // Parse response data
    const defaultLangResult = await defaultLangResponse.json();
    const additionalLangsResult = await additionalLangsResponse.json();
    
    console.log('[testing] Default language update result:', defaultLangResult);
    console.log('[testing] Additional languages update result:', additionalLangsResult);
    
    return {
      defaultLanguage,
      additionalLanguages
    };
  } catch (error) {
    console.error('[testing] Error updating language settings:', error);
    throw error;
  }
};
