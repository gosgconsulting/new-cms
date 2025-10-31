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

interface LanguageOperationResult {
  success: boolean;
  message: string;
}

/**
 * Fetches language settings from the database
 * @param tenantId - Optional tenant ID to fetch settings for
 * @returns Promise with the language settings
 */
export const fetchLanguageSettings = async (tenantId?: string | null): Promise<LanguageSettings> => {
  try {
    // @ts-ignore - Vite environment variables
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
    const tenantParam = tenantId ? `?tenantId=${tenantId}` : '';
    
    console.log(`[testing] Fetching language settings from API for tenant: ${tenantId || 'default'}`);
    console.log('[testing] API URL:', `${API_BASE_URL}/api/site-settings/site_language${tenantParam}`);
    
    // Import the API utility
    const { default: api } = await import('../utils/api');
    
    // Fetch site_language (default language)
    const defaultLangResponse = await api.get(`/api/site-settings/site_language${tenantParam}`);
    
    // Fetch site_content_languages (additional languages)
    const additionalLangsResponse = await api.get(`/api/site-settings/site_content_languages${tenantParam}`);
    
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
 * @param tenantId - Optional tenant ID to update settings for
 * @returns Promise with the updated language settings
 */
export const updateLanguageSettings = async (
  defaultLanguage: string,
  additionalLanguages: string,
  tenantId?: string | null
): Promise<LanguageSettings> => {
  try {
    // @ts-ignore - Vite environment variables
    const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
    const tenantParam = tenantId ? `?tenantId=${tenantId}` : '';
    
    console.log(`[testing] Updating language settings for tenant ${tenantId || 'default'}:`, { defaultLanguage, additionalLanguages });
    
    // Ensure the default language is not in additionalLanguages
    let additionalLangsArray = additionalLanguages ? additionalLanguages.split(',').filter(lang => lang.trim() !== '') : [];
    additionalLangsArray = additionalLangsArray.filter(lang => lang !== defaultLanguage);
    
    // Make sure the default language is included in additionalLanguages
    // This is the key fix - we need to include the default language in site_content_languages
    if (!additionalLangsArray.includes(defaultLanguage)) {
      additionalLangsArray.push(defaultLanguage);
    }
    
    const updatedAdditionalLanguages = additionalLangsArray.join(',');
    console.log(`[testing] Updated additionalLanguages to include default: ${updatedAdditionalLanguages}`);
    
    // Import the API utility
    const { default: api } = await import('../utils/api');
    
    // Update site_language (default language)
    const defaultLangResponse = await api.put(`/api/site-settings/site_language${tenantParam}`, {
      setting_value: defaultLanguage,
      setting_type: 'text',
      setting_category: 'localization',
      is_public: true
    });
    
    // Update site_content_languages (additional languages)
    const additionalLangsResponse = await api.put(`/api/site-settings/site_content_languages${tenantParam}`, {
      setting_value: updatedAdditionalLanguages,
      setting_type: 'text',
      setting_category: 'localization',
      is_public: true
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
      additionalLanguages: updatedAdditionalLanguages
    };
  } catch (error) {
    console.error('[testing] Error updating language settings:', error);
    throw error;
  }
};

/**
 * Add a new language to the site
 * 
 * @param languageCode - The language code to add
 * @param tenantId - Optional tenant ID
 * @returns Promise with the result of the operation
 */
export const addLanguage = async (
  languageCode: string,
  tenantId?: string | null
): Promise<LanguageOperationResult> => {
  try {
    console.log(`[testing] Adding language ${languageCode} for tenant ${tenantId || 'default'}`);
    
    // Import the API utility
    const { default: api } = await import('../utils/api');
    
    // Call the API endpoint
    const endpoint = tenantId ? `/api/language/add?tenantId=${encodeURIComponent(tenantId)}` : '/api/language/add';
    const response = await api.post(endpoint, {
      languageCode
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[testing] Failed to add language ${languageCode}:`, errorText);
      throw new Error(`Failed to add language: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[testing] Language ${languageCode} added successfully:`, result);
    
    // Refresh language settings
    await fetchLanguageSettings(tenantId);
    
    return result;
  } catch (error) {
    console.error(`[testing] Error adding language ${languageCode}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Remove a language from the site
 * 
 * @param languageCode - The language code to remove
 * @param tenantId - Optional tenant ID
 * @returns Promise with the result of the operation
 */
export const removeLanguage = async (
  languageCode: string,
  tenantId?: string | null
): Promise<LanguageOperationResult> => {
  try {
    console.log(`[testing] Removing language ${languageCode} for tenant ${tenantId || 'default'}`);
    
    // Import the API utility
    const { default: api } = await import('../utils/api');
    
    // Call the API endpoint
    const endpoint = tenantId ? `/api/language/remove?tenantId=${encodeURIComponent(tenantId)}` : '/api/language/remove';
    const response = await api.post(endpoint, {
      languageCode
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[testing] Failed to remove language ${languageCode}:`, errorText);
      throw new Error(`Failed to remove language: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[testing] Language ${languageCode} removed successfully:`, result);
    
    // Refresh language settings
    await fetchLanguageSettings(tenantId);
    
    return result;
  } catch (error) {
    console.error(`[testing] Error removing language ${languageCode}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Set the default language for the site
 * 
 * @param languageCode - The language code to set as default
 * @param fromAdditionalLanguages - Whether the language is being set from additional languages
 * @param tenantId - Optional tenant ID
 * @returns Promise with the result of the operation
 */
export const setDefaultLanguage = async (
  languageCode: string,
  fromAdditionalLanguages: boolean = false,
  tenantId?: string | null
): Promise<LanguageOperationResult> => {
  try {
    console.log(`[testing] Setting default language to ${languageCode} for tenant ${tenantId || 'default'} (from additional languages: ${fromAdditionalLanguages})`);
    
    // Import the API utility
    const { default: api } = await import('../utils/api');
    
    // Call the API endpoint
    const endpoint = tenantId ? `/api/language/set-default?tenantId=${encodeURIComponent(tenantId)}` : '/api/language/set-default';
    const response = await api.post(endpoint, {
      languageCode,
      fromAdditionalLanguages
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[testing] Failed to set default language to ${languageCode}:`, errorText);
      throw new Error(`Failed to set default language: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`[testing] Default language set to ${languageCode} successfully:`, result);
    
    // Refresh language settings
    await fetchLanguageSettings(tenantId);
    
    return result;
  } catch (error) {
    console.error(`[testing] Error setting default language to ${languageCode}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};