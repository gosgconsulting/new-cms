/**
 * Vercel serverless entry: forwards (req, res) to the Express app.
 * Used only for Build Output API; local dev uses server.js / server/index.js.
 */
import app from './app.js';
import { initializeDatabaseInBackground } from './utils/database.js';

const dbInitPromise = initializeDatabaseInBackground(
  process.env.VERCEL ? 2 : 5,
  process.env.VERCEL ? 1000 : 5000
);

export default async function handler(req, res) {
  try {
    await dbInitPromise;
  } catch {
    // initializeDatabaseInBackground handles state internally; ignore here.
  }
  return app(req, res);
}
