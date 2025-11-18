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
 * Extract text content from HTML while preserving structure information
 * Returns object with text segments and their positions
 * 
 * @param {string} html - HTML string
 * @returns {Object} - { textSegments: string[], htmlTemplate: string }
 */
function extractTextFromHtml(html) {
  if (!html || typeof html !== 'string') {
    return { textSegments: [], htmlTemplate: html };
  }
  
  const textSegments = [];
  const timestamp = Date.now();
  const placeholderPattern = `{{TRANSLATE_TEXT_${timestamp}_`;
  let placeholderIndex = 0;
  let htmlTemplate = html;
  
  // Process HTML by splitting on tags and extracting text nodes
  // This approach handles text between tags, before first tag, and after last tag
  const parts = html.split(/(<[^>]+>)/);
  const processedParts = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // If it's a tag, keep it as is
    if (part.startsWith('<') && part.endsWith('>')) {
      processedParts.push(part);
    } else {
      // It's text content
      const trimmedText = part.trim();
      if (trimmedText && trimmedText.length > 0) {
        // Store the text segment
        textSegments.push(trimmedText);
        // Replace with placeholder
        const placeholder = `${placeholderPattern}${placeholderIndex}}}`;
        processedParts.push(placeholder);
        placeholderIndex++;
      } else {
        // Empty or whitespace-only text, keep original
        processedParts.push(part);
      }
    }
  }
  
  htmlTemplate = processedParts.join('');
  
  return { textSegments, htmlTemplate };
}

/**
 * Reconstruct HTML with translated text segments
 * 
 * @param {string} htmlTemplate - HTML template with placeholders
 * @param {string[]} translatedSegments - Translated text segments
 * @returns {string} - Reconstructed HTML with translated text
 */
function reconstructHtmlWithTranslatedText(htmlTemplate, translatedSegments) {
  let result = htmlTemplate;
  
  // Extract timestamp from placeholder pattern
  const timestampMatch = htmlTemplate.match(/TRANSLATE_TEXT_(\d+)_/);
  if (!timestampMatch) {
    // No placeholders found, return as is
    return htmlTemplate;
  }
  
  const timestamp = timestampMatch[1];
  
  // Replace each placeholder with translated text
  translatedSegments.forEach((translatedText, index) => {
    const placeholder = `{{TRANSLATE_TEXT_${timestamp}_${index}}}`;
    result = result.replace(placeholder, translatedText);
  });
  
  return result;
}

/**
 * Strip HTML tags and extract text content (for non-HTML-aware translation)
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
 * Sleep/delay utility for retry logic
 * 
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process items in batches with concurrency limit
 * 
 * @param {Array} items - Array of items to process
 * @param {Function} processor - Async function to process each item
 * @param {number} batchSize - Maximum concurrent operations (default: 10)
 * @returns {Promise<Array>} - Array of results in same order as input
 */
async function processInBatches(items, processor, batchSize = 10) {
  const results = new Array(items.length);
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, batchIndex) => 
      processor(item, i + batchIndex)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    // Map results back to original positions
    batchResults.forEach((result, batchIndex) => {
      const originalIndex = i + batchIndex;
      if (result.status === 'fulfilled') {
        results[originalIndex] = result.value;
      } else {
        results[originalIndex] = { error: result.reason };
      }
    });
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < items.length) {
      await sleep(200); // 200ms delay between batches (increased for better rate limiting)
    }
  }
  
  return results;
}

/**
 * Translate a single chunk of text using Google Cloud Translation API
 * Includes timeout, retry logic, and better error handling
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLanguage - The target language code
 * @param {string} [sourceLanguage=null] - The source language code (optional)
 * @param {number} [timeoutMs=60000] - Request timeout in milliseconds (default: 60s)
 * @param {number} [maxRetries=3] - Maximum number of retry attempts (default: 3)
 * @returns {Promise<string>} - The translated text
 */
async function translateTextChunk(text, targetLanguage, sourceLanguage = null, timeoutMs = 60000, maxRetries = 3) {
  const apiKey = process.env.GOOGLE_CLOUD_TRANSLATION_API_KEY || 
                process.env.VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Cloud Translation API key not found');
  }
  
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  
  let lastError;
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      try {
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
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Google Translation API error: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        return data.data.translations[0].translatedText;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Check if it's a timeout or abort error (handle various error formats)
        // Handle AggregateError, TypeError wrapping network errors, etc.
        const errorCause = fetchError.cause || fetchError;
        const isTimeout = 
          fetchError.name === 'AbortError' || 
          fetchError.code === 'ETIMEDOUT' ||
          errorCause.code === 'ETIMEDOUT' ||
          (errorCause.name === 'AggregateError' && errorCause.code === 'ETIMEDOUT') ||
          (fetchError.message && fetchError.message.includes('timeout')) ||
          (fetchError.message && fetchError.message.includes('ETIMEDOUT')) ||
          (fetchError.message && fetchError.message.includes('fetch failed'));
        
        if (isTimeout) {
          throw new Error(`Request timeout after ${timeoutMs}ms`);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      
      // Check if this is a retryable error (network/timeout errors)
      // Handle various error formats including AggregateError wrapped in TypeError
      const errorCause = error.cause || error;
      const isRetryable = 
        (error.message && (
          error.message.includes('timeout') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('fetch failed') ||
          error.message.includes('network')
        )) ||
        error.code === 'ETIMEDOUT' ||
        errorCause.code === 'ETIMEDOUT' ||
        (errorCause.name === 'AggregateError' && errorCause.code === 'ETIMEDOUT');
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Only retry on retryable errors (network/timeout issues)
      if (!isRetryable) {
        console.log(`[testing] Non-retryable error on attempt ${attempt + 1}, not retrying:`, error.message);
        throw error;
      }
      
      // Calculate exponential backoff delay: 1s, 2s, 4s, etc.
      const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000); // Cap at 10s
      console.log(`[testing] Translation attempt ${attempt + 1} failed (${error.message}), retrying in ${delayMs}ms...`);
      
      await sleep(delayMs);
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Translation failed after all retries');
}

/**
 * Translate text using Google Cloud Translation API
 * Handles HTML content by preserving structure and translating only text nodes
 * Handles large texts by chunking
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
    
    // If text contains HTML, preserve structure and translate only text nodes
    if (hasHtml) {
      const { textSegments, htmlTemplate } = extractTextFromHtml(text);
      
      if (textSegments.length === 0) {
        // No text to translate, return original
        return text;
      }
      
      console.log(`[testing] Extracted ${textSegments.length} text segments from HTML`);
      
      // Translate each text segment in batches to avoid overwhelming the API
      const translatedSegments = await processInBatches(
        textSegments,
        async (segment, index) => {
          try {
            // Check if segment needs chunking
            const chunks = splitTextIntoChunks(segment);
            
            if (chunks.length === 1) {
              return await translateTextChunk(chunks[0], targetLanguage, sourceLanguage);
            } else {
              // Translate chunks in batches to avoid overwhelming the API
              const translatedChunks = await processInBatches(
                chunks,
                async (chunk) => {
                  try {
                    return await translateTextChunk(chunk, targetLanguage, sourceLanguage);
                  } catch (error) {
                    console.error(`[testing] Error translating chunk within segment ${index}:`, error);
                    return chunk; // Return original on error
                  }
                },
                5 // Process 5 chunks at a time (smaller batch for nested chunks)
              );
              
              // Handle any errors and combine
              const validChunks = translatedChunks.map((result, chunkIndex) => {
                if (result && typeof result === 'object' && result.error) {
                  console.error(`[testing] Error translating chunk ${chunkIndex + 1} within segment ${index}:`, result.error);
                  return chunks[chunkIndex]; // Return original on error
                }
                return result;
              });
              
              return validChunks.join(' ');
            }
          } catch (error) {
            console.error(`[testing] Error translating HTML text segment ${index}:`, error);
            return segment; // Return original on error
          }
        },
        5 // Process 5 segments at a time (reduced to avoid overwhelming API)
      );
      
      // Handle any errors from batch processing
      const finalSegments = translatedSegments.map((result, index) => {
        if (result && typeof result === 'object' && result.error) {
          console.error(`[testing] Error translating HTML text segment ${index}:`, result.error);
          return textSegments[index]; // Return original on error
        }
        return result;
      });
      
      // Reconstruct HTML with translated text
      const translatedHtml = reconstructHtmlWithTranslatedText(htmlTemplate, finalSegments);
      return translatedHtml;
    }
    
    // For non-HTML text, check if it needs to be chunked
    const chunks = splitTextIntoChunks(text);
    
    if (chunks.length === 1) {
      // Single chunk, translate directly
      return await translateTextChunk(chunks[0], targetLanguage, sourceLanguage);
    } else {
      // Multiple chunks, translate each and combine (with batching for large chunk counts)
      console.log(`[testing] Splitting into ${chunks.length} chunks for translation`);
      
      const translatedChunks = await processInBatches(
        chunks,
        async (chunk, index) => {
          console.log(`[testing] Translating chunk ${index + 1}/${chunks.length} (${Buffer.byteLength(chunk, 'utf8')} bytes)`);
          return await translateTextChunk(chunk, targetLanguage, sourceLanguage);
        },
        5 // Process 5 chunks at a time (reduced to avoid overwhelming API)
      );
      
      // Handle any errors and combine translated chunks
      const validChunks = translatedChunks.map((result, index) => {
        if (result && typeof result === 'object' && result.error) {
          console.error(`[testing] Error translating chunk ${index + 1}:`, result.error);
          return chunks[index]; // Return original on error
        }
        return result;
      });
      
      // Combine translated chunks with spaces
      return validChunks.join(' ');
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





