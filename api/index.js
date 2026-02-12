/**
 * Vercel serverless entry: forwards (req, res) to the Express app.
 * Do not use server/index.js here so app.listen() and startup logic are never run.
 */
import app from '../server/app.js';

export default function handler(req, res) {
  return app(req, res);
}
