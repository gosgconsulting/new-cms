import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { initializeDatabase, getBrandingSettings, updateMultipleBrandingSettings } from './sparti-cms/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;

// Middleware
app.use(express.json());

// Initialize database on startup
initializeDatabase().then(success => {
  if (success) {
    console.log('[testing] Database initialized successfully');
  } else {
    console.error('[testing] Failed to initialize database');
  }
}).catch(error => {
  console.error('[testing] Error initializing database:', error);
});

// Health check endpoint - this is what Railway will check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// API Routes - MUST come before static file serving
app.get('/api/branding', async (req, res) => {
  try {
    console.log('[testing] API: Getting branding settings');
    const settings = await getBrandingSettings();
    res.json(settings);
  } catch (error) {
    console.error('[testing] API: Error getting branding settings:', error);
    res.status(500).json({ error: 'Failed to get branding settings' });
  }
});

app.post('/api/branding', async (req, res) => {
  try {
    console.log('[testing] API: Updating branding settings:', req.body);
    await updateMultipleBrandingSettings(req.body);
    res.json({ success: true, message: 'Branding settings updated successfully' });
  } catch (error) {
    console.error('[testing] API: Error updating branding settings:', error);
    res.status(500).json({ error: 'Failed to update branding settings' });
  }
});

// Serve static files from the dist directory - MUST come after API routes
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes by serving the React app - MUST be last
app.use((req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Server is running but app not built',
      timestamp: new Date().toISOString() 
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://0.0.0.0:${port}/health`);
  console.log(`Application available at http://0.0.0.0:${port}/`);
  console.log(`API endpoints available at http://0.0.0.0:${port}/api/`);
});
