import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// Root health check (Railway default)
app.get('/', (req, res) => {
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({ 
      status: 'healthy', 
      message: 'Server is running',
      timestamp: new Date().toISOString() 
    });
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all other routes
app.get('*', (req, res) => {
  // Skip API routes and health check
  if (req.path.startsWith('/api') || req.path === '/health') {
    return res.status(404).json({ error: 'Route not found' });
  }
  
  const indexPath = join(__dirname, 'dist', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Application not built. Run npm run build first.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at http://0.0.0.0:${port}/health`);
  console.log(`Application available at http://0.0.0.0:${port}/`);
});
