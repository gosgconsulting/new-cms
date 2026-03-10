/**
 * Debug Logging Utility
 * 
 * Centralized debug logging that gates output based on environment.
 * Only logs when DEBUG=true or NODE_ENV=development
 */

const DEBUG_ENABLED = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
const DEBUG_PREFIX = '[testing]';

/**
 * Debug log - equivalent to console.log but gated
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
  if (DEBUG_ENABLED) {
    console.log(DEBUG_PREFIX, ...args);
  }
}

/**
 * Debug error - equivalent to console.error but gated
 * @param {...any} args - Arguments to log
 */
export function debugError(...args) {
  if (DEBUG_ENABLED) {
    console.error(DEBUG_PREFIX, ...args);
  }
}

/**
 * Debug warn - equivalent to console.warn but gated
 * @param {...any} args - Arguments to log
 */
export function debugWarn(...args) {
  if (DEBUG_ENABLED) {
    console.warn(DEBUG_PREFIX, ...args);
  }
}

/**
 * Check if debug logging is enabled
 * @returns {boolean} True if debug logging is enabled
 */
export function isDebugEnabled() {
  return DEBUG_ENABLED;
}
