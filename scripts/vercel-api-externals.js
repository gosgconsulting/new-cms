/**
 * Shared list of packages marked external in the Vercel API bundle.
 * These must be installed in the function directory so they're available at runtime.
 * pg-native is excluded from install (native addon, often fails in serverless; pg works without it).
 */
export const EXTERNALS = [
  'pg',
  'pg-native', // external in bundle, but we don't install - pg works without it
  'sequelize',
  '@anthropic-ai/sdk',
  '@vercel/blob',
  'uuid',
  'bcryptjs',
  'multer',
  'stripe',
  'jsonwebtoken',
  'dotenv',
  'fast-xml-parser',
  'rate-limiter-flexible',
];

/** Packages to install in function (externals minus pg-native) */
export const EXTERNALS_TO_INSTALL = EXTERNALS.filter((p) => p !== 'pg-native');
