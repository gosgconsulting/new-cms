import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Configure dotenv
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Direct endpoint for home page content
app.get('/api/home-content', async (req, res) => {
  try {
    console.log('Home content endpoint called');
    
    // Get tenant ID from environment variable
    const tenantId = process.env.CMS_TENANT;
    console.log('Using tenant ID:', tenantId);
    
    // Find the home page using tenant_id and page_name = 'Homepage'
    const pageResult = await pool.query(
      'SELECT id FROM pages WHERE tenant_id = $1 AND page_name = $2',
      [tenantId, 'GOSG Homepage']
    );
    
    console.log('Page query result:', pageResult.rows);
    
    if (pageResult.rows.length === 0) {
      console.log(`Home page not found for tenant ${tenantId}`);
      return res.status(404).json({ error: 'Home page not found' });
    }
    
    const pageId = pageResult.rows[0].id;
    console.log('Found page ID:', pageId);
    
    // Get the layout_json from page_layouts
    const layoutResult = await pool.query(
      'SELECT layout_json FROM page_layouts WHERE page_id = $1',
      [pageId]
    );
    
    console.log('Layout query result:', layoutResult.rows.length > 0 ? 'Found' : 'Not found');
    
    if (layoutResult.rows.length === 0) {
      console.log('No layout found for page ID:', pageId);
      return res.status(404).json({ error: 'Home page layout not found' });
    }
    
    // Get page metadata
    const metaResult = await pool.query(
      'SELECT page_name, meta_title, meta_description, meta_keywords, slug FROM pages WHERE id = $1',
      [pageId]
    );
    
    // Process layout_json
    let components = layoutResult.rows[0].layout_json;
    
    // If layout_json is a string, try to parse it
    if (typeof components === 'string') {
      try {
        console.log('Attempting to parse layout_json string');
        components = JSON.parse(components);
      } catch (e) {
        console.error('Error parsing layout_json:', e);
        // Keep it as string if parsing fails
      }
    }
    
    // If components is not an array, convert it to an array
    if (!Array.isArray(components)) {
      console.log('Components is not an array, converting to array format');
      
      // If it's an object with component properties, wrap it in an array
      if (typeof components === 'object' && components !== null) {
        components = [components];
      } else {
        // If it's not an object or is null, create an empty array
        components = [];
      }
    }
    
    // Construct the response
    const pageData = {
      slug: metaResult.rows[0].slug || 'home',
      meta: {
        title: metaResult.rows[0].meta_title || metaResult.rows[0].page_name,
        description: metaResult.rows[0].meta_description || '',
        keywords: metaResult.rows[0].meta_keywords || '',
      },
      components: components
    };
    
    console.log('Final pageData structure:', {
      slug: pageData.slug,
      componentsType: typeof pageData.components,
      isArray: Array.isArray(pageData.components),
      componentCount: Array.isArray(pageData.components) ? pageData.components.length : 'N/A'
    });
    
    res.json(pageData);
  } catch (error) {
    console.error('Error fetching home page content:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// API endpoint to get page content by slug
app.get('/api/page-content/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const tenantId = process.env.CMS_TENANT;
    
    console.log('API called with slug:', slug);
    
    // Variable to store query result
    let pageResult;
    
    // Special handling for home page
    if (slug === 'home') {
      console.log('Handling home page request using tenant_id and page_name');
      // Find the home page using tenant_id and page_name = 'Homepage'
      pageResult = await pool.query(
        'SELECT id FROM pages WHERE tenant_id = $1 AND page_name = $2',
        [tenantId, 'Homepage']
      );
      
      console.log('Home page query result:', pageResult.rows);
    } else {
      // For other pages, use the slug
      pageResult = await pool.query(
        'SELECT id FROM pages WHERE slug = $1 AND tenant_id = $2',
        [slug, tenantId]
      );
    }
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const pageId = pageResult.rows[0].id;
    
    // Get the layout_json from page_layouts
    const layoutResult = await pool.query(
      'SELECT layout_json FROM page_layouts WHERE page_id = $1',
      [pageId]
    );
    
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Page layout not found' });
    }
    
    // Get page metadata
    const metaResult = await pool.query(
      'SELECT page_name, meta_title, meta_description, meta_keywords, slug FROM pages WHERE id = $1',
      [pageId]
    );
    
    // Process layout_json
    let components = layoutResult.rows[0].layout_json;
    
    // If layout_json is a string, try to parse it
    if (typeof components === 'string') {
      try {
        console.log('Attempting to parse layout_json string');
        components = JSON.parse(components);
      } catch (e) {
        console.error('Error parsing layout_json:', e);
        // Keep it as string if parsing fails
      }
    }
    
    // If components is not an array, convert it to an array
    if (!Array.isArray(components)) {
      console.log('Components is not an array, converting to array format');
      
      // If it's an object with component properties, wrap it in an array
      if (typeof components === 'object' && components !== null) {
        components = [components];
      } else {
        // If it's not an object or is null, create an empty array
        components = [];
      }
    }
    
    // Construct the response
    const pageData = {
      slug: metaResult.rows[0].slug || slug,
      meta: {
        title: metaResult.rows[0].meta_title || metaResult.rows[0].page_name,
        description: metaResult.rows[0].meta_description || '',
        keywords: metaResult.rows[0].meta_keywords || '',
      },
      components: components
    };
    
    res.json(pageData);
  } catch (error) {
    console.error('Error fetching page content:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// SPA support - serve index.html for all other routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

// Start server
const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Home content available at http://localhost:${PORT}/api/home-content`);
});