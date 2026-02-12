// Environment variables and constants
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'noreply@gosg.com';
export const JWT_SECRET = process.env.JWT_SECRET || 'sparti-demo-secret-key';

// Coerce PORT to integer 1-65535 so empty or malformed Railway PORT does not exit the process
const DEFAULT_PORT = 4173;
const rawPort = process.env.PORT;
const parsed = rawPort != null && rawPort !== '' ? parseInt(String(rawPort), 10) : NaN;
export const PORT = Number.isNaN(parsed) || parsed < 1 || parsed > 65535 ? DEFAULT_PORT : parsed;

