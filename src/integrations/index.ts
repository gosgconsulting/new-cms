/**
 * Integration Services Index
 * Centralized exports for all API integrations
 */

// OpenRouter AI Integration
export { 
  OpenRouterClient, 
  openRouterClient,
  type OpenRouterMessage,
  type OpenRouterResponse 
} from './openrouter/client';

// Google API Integration (Maps, Reviews, Translator)
export { 
  GoogleAPIClient, 
  googleAPIClient,
  type GooglePlace,
  type GoogleReview,
  type TranslationResult 
} from './google/client';

// SMTP Integration (Resend)
export { 
  SMTPClient, 
  smtpClient,
  type EmailMessage,
  type EmailResponse 
} from './smtp/client';

// Resend Domain Management
export {
  ResendDomainsClient,
  resendDomainsClient,
  type ResendDomain,
  type DNSRecord,
  type SMTPConfig,
  type CreateDomainRequest
} from './smtp/resend-domains';

// Supabase Integration (existing)
export { supabase } from './supabase/client';
export type { Database } from './supabase/types';

/**
 * Integration Status Check
 * Utility function to check which integrations are properly configured
 */
export const checkIntegrationStatus = () => {
  const status = {
    openrouter: !!import.meta.env.VITE_OPENROUTER_API_KEY,
    google: !!import.meta.env.VITE_GOOGLE_API_KEY,
    smtp: !!import.meta.env.VITE_RESEND_API_KEY,
    supabase: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  };

  console.log('[testing] Integration Status:', status);
  return status;
};
