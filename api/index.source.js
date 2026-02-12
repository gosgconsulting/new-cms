/**
 * Vercel serverless entry: forwards (req, res) to the Express app.
 * Do not use server/index.js here so app.listen() and startup logic are never run.
 * This file is the source for the bundle; build:api produces api/index.js.
 */
import app from '../server/app.js';

export default function handler(req, res) {
  return app(req, res);
}
