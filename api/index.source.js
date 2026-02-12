/**
 * Vercel serverless entry: forwards (req, res) to the Express app.
 * Do not use server/index.js here so app.listen() and startup logic are never run.
 * This file is the source for the bundle; build:api produces api/index.js.
 */
import app from '../server/app.js';
import { initializeDatabaseInBackground } from '../server/utils/database.js';

// Ensure DB init runs in serverless environments too (server/index.js is not used on Vercel).
// We keep retries small to avoid long cold starts.
const dbInitPromise = initializeDatabaseInBackground(
  process.env.VERCEL ? 2 : 5,
  process.env.VERCEL ? 1000 : 5000
);

export default async function handler(req, res) {
  // Wait for DB init on cold start so auth endpoints work reliably.
  // If DB init fails, routes will return 503 with diagnostics.
  try {
    await dbInitPromise;
  } catch {
    // initializeDatabaseInBackground handles state internally; ignore here.
  }
  return app(req, res);
}