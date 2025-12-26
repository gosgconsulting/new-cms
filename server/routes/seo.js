import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { getDatabaseState } from '../utils/database.js';
import {
  getRedirects,
  createRedirect,
  updateRedirect,
  deleteRedirect,
  getRobotsConfig,
  updateRobotsConfig,
  generateRobotsTxt,
  getSitemapEntries,
  createSitemapEntry,
  generateSitemapXML,
  getSEOMeta,
  createSEOMeta
} from '../../sparti-cms/db/seo-management.js';

const router = express.Router();

// ===== SEO SETTINGS ROUTE =====

// Get SEO settings (public endpoint for frontend)
router.get('/seo', async (req, res) => {
  try {
    const { dbInitialized, dbInitializationError } = getDatabaseState();
    
    // Check if database is ready
    if (!dbInitialized) {
      if (dbInitializationError) {
        return res.status(503).json({
          error: 'Database initialization failed',
          message: 'Please try again later'
        });
      }
      return res.status(503).json({
        error: 'Database is initializing',
        message: 'Please try again in a moment'
      });
    }

    const { getPublicSEOSettings } = await import('../../sparti-cms/db/index.js');
    const tenantId = req.query.tenantId || 'tenant-gosg';
    const seoSettings = await getPublicSEOSettings(tenantId);
    
    // Always return valid JSON
    if (!res.headersSent) {
      res.json(seoSettings || {});
    }
  } catch (error) {
    console.error('[testing] Error fetching SEO settings:', error);
    console.error('[testing] Error code:', error.code);
    console.error('[testing] Error message:', error.message);
    console.error('[testing] Error stack:', error.stack);
    
    // Handle database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      if (!res.headersSent) {
        return res.status(503).json({
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please check database configuration.'
        });
      }
    }
    
    // Always return valid JSON, even on error
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to fetch SEO settings',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Unknown error'
      });
    } else {
      console.error('[testing] Response already sent, cannot send error response');
    }
  }
});

// ===== REDIRECTS ROUTES =====

// Get all redirects
router.get('/redirects', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.search) filters.search = req.query.search;

    const redirects = await getRedirects(filters, tenantId);
    res.json(redirects);
  } catch (error) {
    console.error('[testing] Error fetching redirects:', error);
    res.status(500).json({ error: 'Failed to fetch redirects' });
  }
});

// Create redirect
router.post('/redirects', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to create redirects' });
    }
    
    const redirect = await createRedirect(req.body, tenantId);
    res.status(201).json(redirect);
  } catch (error) {
    console.error('[testing] Error creating redirect:', error);
    res.status(500).json({ error: error.message || 'Failed to create redirect' });
  }
});

// Update redirect
router.put('/redirects/:id', async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update redirects' });
    }
    
    const redirect = await updateRedirect(redirectId, req.body, tenantId);
    res.json(redirect);
  } catch (error) {
    console.error('[testing] Error updating redirect:', error);
    if (error.message && error.message.includes('master')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to update redirect' });
  }
});

// Delete redirect
router.delete('/redirects/:id', async (req, res) => {
  try {
    const redirectId = parseInt(req.params.id);
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to delete redirects' });
    }
    
    const redirect = await deleteRedirect(redirectId, tenantId);
    res.json({ message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting redirect:', error);
    if (error.message && error.message.includes('master')) {
      return res.status(403).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Failed to delete redirect' });
  }
});

// ===== ROBOTS.TXT ROUTES =====

// Get robots config
router.get('/robots-config', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || null;
    const config = await getRobotsConfig(tenantId);
    res.json(config);
  } catch (error) {
    console.error('[testing] Error fetching robots config:', error);
    res.status(500).json({ error: 'Failed to fetch robots config' });
  }
});

// Update robots config
router.put('/robots-config', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update robots config' });
    }
    
    await updateRobotsConfig(req.body.rules, tenantId);
    res.json({ message: 'Robots config updated successfully' });
  } catch (error) {
    console.error('[testing] Error updating robots config:', error);
    res.status(500).json({ error: error.message || 'Failed to update robots config' });
  }
});

// Generate robots.txt
router.post('/robots-txt/generate', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    const robotsTxt = await generateRobotsTxt(tenantId);
    res.setHeader('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    console.error('[testing] Error generating robots.txt:', error);
    res.status(500).json({ error: 'Failed to generate robots.txt' });
  }
});

// Update robots.txt file
router.post('/robots-txt/update', async (req, res) => {
  try {
    const tenantId = req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    const robotsTxt = await generateRobotsTxt(tenantId);
    
    // Write to public/robots.txt
    const fs = await import('fs');
    const path = await import('path');
    const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
    
    fs.writeFileSync(robotsPath, robotsTxt);
    
    res.json({ message: 'robots.txt file updated successfully' });
  } catch (error) {
    console.error('[testing] Error updating robots.txt file:', error);
    res.status(500).json({ error: 'Failed to update robots.txt file' });
  }
});

// ===== SITEMAP ROUTES =====

// Get sitemap entries
router.get('/sitemap-entries', async (req, res) => {
  try {
    const type = req.query.type || null;
    // Priority: header > query > user
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || null;
    const entries = await getSitemapEntries(type, tenantId);
    res.json(entries);
  } catch (error) {
    console.error('[testing] Error fetching sitemap entries:', error);
    res.status(500).json({ error: 'Failed to fetch sitemap entries' });
  }
});

// Create sitemap entry
router.post('/sitemap-entries', async (req, res) => {
  try {
    // Priority: header > query > user > body
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to create sitemap entries' });
    }
    
    const entry = await createSitemapEntry(req.body, tenantId);
    res.status(201).json(entry);
  } catch (error) {
    console.error('[testing] Error creating sitemap entry:', error);
    res.status(500).json({ error: error.message || 'Failed to create sitemap entry' });
  }
});

// Update sitemap entry
router.put('/sitemap-entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    // Priority: header > query > user > body
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || req.body.tenantId || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to update sitemap entries' });
    }
    
    // Check if it's a master entry and prevent update
    const checkResult = await query(`SELECT tenant_id FROM sitemap_entries WHERE id = $1`, [entryId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found' });
    }
    if (!checkResult.rows[0].tenant_id) {
      return res.status(403).json({ 
        error: 'Cannot update master sitemap entry. Master data (tenant_id = NULL) is shared across all tenants.' 
      });
    }
    
    const result = await query(`
      UPDATE sitemap_entries 
      SET url = $1, changefreq = $2, priority = $3, sitemap_type = $4, 
          title = $5, description = $6, lastmod = NOW(), updated_at = NOW()
      WHERE id = $7 AND tenant_id = $8
      RETURNING *
    `, [
      req.body.url,
      req.body.changefreq,
      req.body.priority,
      req.body.sitemap_type,
      req.body.title,
      req.body.description,
      entryId,
      tenantId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found or is a master entry' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[testing] Error updating sitemap entry:', error);
    res.status(500).json({ error: 'Failed to update sitemap entry' });
  }
});

// Delete sitemap entry
router.delete('/sitemap-entries/:id', async (req, res) => {
  try {
    const entryId = parseInt(req.params.id);
    // Priority: header > query > user
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || null;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required to delete sitemap entries' });
    }
    
    // Check if it's a master entry and prevent deletion
    const checkResult = await query(`SELECT tenant_id FROM sitemap_entries WHERE id = $1`, [entryId]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found' });
    }
    if (!checkResult.rows[0].tenant_id) {
      return res.status(403).json({ 
        error: 'Cannot delete master sitemap entry. Master data (tenant_id = NULL) is shared across all tenants.' 
      });
    }
    
    const result = await query('DELETE FROM sitemap_entries WHERE id = $1 AND tenant_id = $2 RETURNING id', [entryId, tenantId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sitemap entry not found or is a master entry' });
    }
    
    res.json({ message: 'Sitemap entry deleted successfully' });
  } catch (error) {
    console.error('[testing] Error deleting sitemap entry:', error);
    res.status(500).json({ error: 'Failed to delete sitemap entry' });
  }
});

// Generate sitemap XML
router.post('/sitemap/generate', async (req, res) => {
  try {
    // Priority: header > query > user > default
    const tenantId = req.tenantId || req.query.tenantId || req.user?.tenant_id || 'tenant-gosg';
    const sitemapXML = await generateSitemapXML(tenantId);
    
    // Write to public/sitemap.xml
    const fs = await import('fs');
    const path = await import('path');
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    fs.writeFileSync(sitemapPath, sitemapXML);
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemapXML);
  } catch (error) {
    console.error('[testing] Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

// ===== SEO META ROUTES =====

// Get SEO meta
router.get('/seo-meta/:objectType/:objectId', async (req, res) => {
  try {
    const { objectType, objectId } = req.params;
    const seoMeta = await getSEOMeta(parseInt(objectId), objectType);
    res.json(seoMeta || {});
  } catch (error) {
    console.error('[testing] Error fetching SEO meta:', error);
    res.status(500).json({ error: 'Failed to fetch SEO meta' });
  }
});

// Create SEO meta
router.post('/seo-meta', async (req, res) => {
  try {
    const seoMeta = await createSEOMeta(req.body);
    res.status(201).json(seoMeta);
  } catch (error) {
    console.error('[testing] Error creating SEO meta:', error);
    res.status(500).json({ error: 'Failed to create SEO meta' });
  }
});

export default router;

