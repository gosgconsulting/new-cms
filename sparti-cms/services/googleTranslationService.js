/**
 * Google Translation Service
 * 
 * This service provides functions for translating text using Google Cloud Translation API.
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
 * Strip HTML tags and extract text content
 * 
 * @param {string} html - HTML string
 * @returns {string} - Plain text content
 */
function stripHtmlTags(html) {
  if (!html || typeof html !== 'string') {
    return html;
  }
  
  // Remove HTML tags but preserve text content
  // Replace common HTML entities first
  let text = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');
  
  // Clean up multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Check if string contains HTML tags
 * 
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains HTML
 */
function containsHtml(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return /<[^>]+>/.test(text);
}

/**
 * Split large text into chunks that fit within API limit
 * API limit is 204800 bytes (200KB), we'll use 150KB to be safe
 * 
 * @param {string} text - Text to split
 * @param {number} maxBytes - Maximum bytes per chunk (default: 150000)
 * @returns {string[]} - Array of text chunks
 */
function splitTextIntoChunks(text, maxBytes = 150000) {
  if (!text || typeof text !== 'string') {
    return [text];
  }
  
  // Calculate byte size (UTF-8 encoding)
  const textBytes = Buffer.byteLength(text, 'utf8');
  
  if (textBytes <= maxBytes) {
    return [text];
  }
  
  // Split by sentences first (try to preserve meaning)
  const sentences = text.split(/([.!?]\s+)/);
  const chunks = [];
  let currentChunk = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const testChunk = currentChunk + sentence;
    const testBytes = Buffer.byteLength(testChunk, 'utf8');
    
    if (testBytes <= maxBytes) {
      currentChunk = testChunk;
    } else {
      // Current chunk is full, save it and start new one
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      
      // If single sentence is too large, split by words
      if (Buffer.byteLength(sentence, 'utf8') > maxBytes) {
        const words = sentence.split(/\s+/);
        let wordChunk = '';
        
        for (const word of words) {
          const testWordChunk = wordChunk + (wordChunk ? ' ' : '') + word;
          const wordBytes = Buffer.byteLength(testWordChunk, 'utf8');
          
          if (wordBytes <= maxBytes) {
            wordChunk = testWordChunk;
          } else {
            if (wordChunk) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk;
        }
      } else {
        currentChunk = sentence;
      }
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Translate a single chunk of text using Google Cloud Translation API
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language code
 * @param {string} [sourceLanguage=null] - The source language code (optional)
 * @returns {Promise<string>} - The translated text
 */
async function translateTextChunk(text, targetLanguage, sourceLanguage = null) {
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
}

/**
 * Translate text using Google Cloud Translation API
 * Handles HTML content and large texts by stripping HTML and chunking
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
    
    const textBytes = Buffer.byteLength(text, 'utf8');
    const hasHtml = containsHtml(text);
    
    console.log(`[testing] Translating text to ${targetLanguage}${sourceLanguage ? ` from ${sourceLanguage}` : ''} (${textBytes} bytes${hasHtml ? ', contains HTML' : ''})`);
    
    // If text contains HTML, extract text content first
    let textToTranslate = text;
    if (hasHtml) {
      textToTranslate = stripHtmlTags(text);
      console.log(`[testing] Stripped HTML: ${text.length} -> ${textToTranslate.length} chars`);
    }
    
    // Check if text needs to be chunked
    const chunks = splitTextIntoChunks(textToTranslate);
    
    if (chunks.length === 1) {
      // Single chunk, translate directly
      return await translateTextChunk(chunks[0], targetLanguage, sourceLanguage);
    } else {
      // Multiple chunks, translate each and combine
      console.log(`[testing] Splitting into ${chunks.length} chunks for translation`);
      const translatedChunks = await Promise.all(
        chunks.map((chunk, index) => {
          console.log(`[testing] Translating chunk ${index + 1}/${chunks.length} (${Buffer.byteLength(chunk, 'utf8')} bytes)`);
          return translateTextChunk(chunk, targetLanguage, sourceLanguage);
        })
      );
      
      // Combine translated chunks with spaces
      return translatedChunks.join(' ');
    }
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
    
    // Translate all texts in parallel
    const results = await Promise.all(
      validTexts.map(text => translateText(text, targetLanguage, sourceLanguage))
    );
    
    // Map the results back to the original array positions
    return texts.map((text, index) => {
      if (!text) return text;
      const validIndex = validTexts.indexOf(text);
      return validIndex >= 0 ? results[validIndex] : text;
    });
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





