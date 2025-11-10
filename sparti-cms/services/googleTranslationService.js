/**
 * Google Translation Service
 * 
 * This service provides functions for translating text using Google Cloud Translation API.
 * Currently using a mock implementation that simply returns the original text.
 */

/**
 * Check if the Google Cloud Translation API key is available
 * @returns {boolean} - True if API key is available, false otherwise
 */
export const isGoogleTranslationEnabled = () => {
  // Check for the API key in environment variables
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY || 
                process.env.VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY;
  
  // For development purposes, consider it enabled
  if (process.env.NODE_ENV === 'development') {
    console.log('[testing] Google Translation API is considered enabled in development mode');
    return true;
  }
  
  return !!apiKey;
};

/**
 * Mock translation function that returns the original text
 * This is used when the real translation API is disabled
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language code
 * @returns {Promise<string>} - The "translated" text (same as input)
 */
export const mockTranslateText = async (text, targetLanguage) => {
  console.log(`[testing] Mock translating text to ${targetLanguage}: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
  return text;
};

/**
 * Translate text using Google Cloud Translation API
 * Currently using a mock implementation
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language code
 * @param {string} [sourceLanguage=null] - The source language code (optional)
 * @returns {Promise<string>} - The translated text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = null) => {
  try {
    // If the text is empty or null, return it as is
    if (!text) {
      return text;
    }
    
    console.log(`[testing] Translating text to ${targetLanguage}${sourceLanguage ? ` from ${sourceLanguage}` : ''}`);
    
    // Use mock translation for now
    return await mockTranslateText(text, targetLanguage);
    
    /* 
    // Real implementation would look something like this:
    const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY || 
                  process.env.VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google Cloud Translation API key not found');
    }
    
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
        ...(sourceLanguage && { source: sourceLanguage }),
        format: 'text'
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Translation API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    return data.data.translations[0].translatedText;
    */
  } catch (error) {
    console.error('[testing] Error translating text:', error);
    // In case of error, return the original text
    return text;
  }
};

/**
 * Batch translate multiple texts
 * 
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLanguage - The target language code
 * @param {string} [sourceLanguage=null] - The source language code (optional)
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const batchTranslateTexts = async (texts, targetLanguage, sourceLanguage = null) => {
  try {
    // Filter out empty texts
    const validTexts = texts.filter(text => !!text);
    
    if (validTexts.length === 0) {
      return texts;
    }
    
    console.log(`[testing] Batch translating ${validTexts.length} texts to ${targetLanguage}`);
    
    // For mock implementation, just return the original texts
    return texts;
    
    /*
    // Real implementation would batch the texts and call the API
    const results = await Promise.all(
      validTexts.map(text => translateText(text, targetLanguage, sourceLanguage))
    );
    
    // Map the results back to the original array positions
    return texts.map((text, index) => {
      if (!text) return text;
      const validIndex = validTexts.indexOf(text);
      return validIndex >= 0 ? results[validIndex] : text;
    });
    */
  } catch (error) {
    console.error('[testing] Error batch translating texts:', error);
    // In case of error, return the original texts
    return texts;
  }
};

export default {
  isGoogleTranslationEnabled,
  translateText,
  batchTranslateTexts
};













