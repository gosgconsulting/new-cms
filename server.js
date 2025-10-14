import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;

// Health check endpoint - this is what Railway will check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes by serving the React app
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
});
