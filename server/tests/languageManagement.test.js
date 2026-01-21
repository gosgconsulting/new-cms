/**
 * Language Management Tests
 * 
 * Tests for translation functions, processPageTranslations, and language management API routes
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { query } from '../../sparti-cms/db/index.js';
import {
  extractTranslatableText,
  injectTranslatedText,
  translateTextFields,
  getDefaultLanguage,
  upsertPageLayout
} from '../../sparti-cms/db/modules/pages.js';
import languageManagementService from '../../sparti-cms/services/languageManagementService.js';
import request from 'supertest';
import express from 'express';
import settingsRoutes from '../routes/settings.js';
import { authenticateUser } from '../middleware/auth.js';

// Mock Google Translation API
vi.mock('../../sparti-cms/services/googleTranslationService.js', () => ({
  translateText: vi.fn(async (text, targetLanguage, sourceLanguage) => {
    // Mock translation: add language prefix to text
    if (targetLanguage === 'es') {
      return `[ES] ${text}`;
    } else if (targetLanguage === 'fr') {
      return `[FR] ${text}`;
    }
    return text;
  }),
  isGoogleTranslationEnabled: vi.fn(() => true)
}));

// Create test app for API route tests
const app = express();
app.use(express.json());
// Mock authentication middleware for API tests
app.use('/api/settings', (req, res, next) => {
  // Set mock user and tenant for testing
  req.user = { tenant_id: 'tenant-test-lang', id: 1 };
  req.tenantId = 'tenant-test-lang';
  next();
});
app.use('/api/settings', settingsRoutes);

const testTenant = 'tenant-test-lang';
const testTenant2 = 'tenant-test-lang-2';

describe('Translation Functions', () => {
  describe('extractTranslatableText', () => {
    it('should extract text from simple object', () => {
      const layout = {
        heading: 'Welcome to our site',
        description: 'Hello world'
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result).toEqual({
        'heading': 'Welcome to our site',
        'description': 'Hello world'
      });
    });

    it('should extract text from nested objects', () => {
      const layout = {
        hero: {
          heading: 'Hero Title',
          subtitle: 'Hero Subtitle'
        },
        content: 'Main content'
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result).toEqual({
        'hero.heading': 'Hero Title',
        'hero.subtitle': 'Hero Subtitle',
        'content': 'Main content'
      });
    });

    it('should extract text from arrays', () => {
      const layout = {
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result).toEqual({
        'items[0].text': 'Item 1',
        'items[1].text': 'Item 2'
      });
    });

    it('should skip non-translatable fields', () => {
      const layout = {
        heading: 'Welcome to our site',
        id: 'page-123',
        src: '/image.jpg',
        url: 'https://example.com',
        email: 'test@example.com'
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result).toEqual({
        'heading': 'Welcome to our site'
      });
      expect(result.id).toBeUndefined();
      expect(result.src).toBeUndefined();
      expect(result.url).toBeUndefined();
      expect(result.email).toBeUndefined();
    });

    it('should skip URLs and paths', () => {
      const layout = {
        heading: 'Welcome to our site',
        link: '/about',
        image: 'https://example.com/image.jpg'
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result).toEqual({
        'heading': 'Welcome to our site'
      });
    });

    it('should handle empty objects', () => {
      const result = extractTranslatableText({});
      expect(result).toEqual({});
    });

    it('should handle null and undefined', () => {
      expect(extractTranslatableText(null)).toEqual({});
      expect(extractTranslatableText(undefined)).toEqual({});
    });

    it('should extract text from component structure', () => {
      const layout = {
        components: [
          {
            key: 'HeroSection',
            props: {
              heading: 'Hero Title Text',
              description: 'Hero Description'
            }
          },
          {
            key: 'FAQSection',
            props: {
              items: [
                { text: 'Question 1', content: 'Answer 1' },
                { text: 'Question 2', content: 'Answer 2' }
              ]
            }
          }
        ]
      };
      
      const result = extractTranslatableText(layout);
      
      expect(result['components[0].props.heading']).toBe('Hero Title Text');
      expect(result['components[0].props.description']).toBe('Hero Description');
      expect(result['components[1].props.items[0].text']).toBe('Question 1');
      expect(result['components[1].props.items[0].content']).toBe('Answer 1');
    });
  });

  describe('injectTranslatedText', () => {
    it('should inject translations into simple object', () => {
      const layout = {
        title: 'Welcome',
        description: 'Hello world'
      };
      
      const translations = {
        'title': 'Bienvenido',
        'description': 'Hola mundo'
      };
      
      const result = injectTranslatedText(layout, translations);
      
      expect(result).toEqual({
        title: 'Bienvenido',
        description: 'Hola mundo'
      });
    });

    it('should inject translations into nested objects', () => {
      const layout = {
        hero: {
          heading: 'Hero Title',
          subtitle: 'Hero Subtitle'
        }
      };
      
      const translations = {
        'hero.heading': 'Título del Héroe',
        'hero.subtitle': 'Subtítulo del Héroe'
      };
      
      const result = injectTranslatedText(layout, translations);
      
      expect(result).toEqual({
        hero: {
          heading: 'Título del Héroe',
          subtitle: 'Subtítulo del Héroe'
        }
      });
    });

    it('should inject translations into arrays', () => {
      const layout = {
        items: [
          { text: 'Item 1' },
          { text: 'Item 2' }
        ]
      };
      
      const translations = {
        'items[0].text': 'Elemento 1',
        'items[1].text': 'Elemento 2'
      };
      
      const result = injectTranslatedText(layout, translations);
      
      expect(result.items[0].text).toBe('Elemento 1');
      expect(result.items[1].text).toBe('Elemento 2');
    });

    it('should preserve non-translated fields', () => {
      const layout = {
        title: 'Welcome',
        id: 'page-123',
        count: 5
      };
      
      const translations = {
        'title': 'Bienvenido'
      };
      
      const result = injectTranslatedText(layout, translations);
      
      expect(result).toEqual({
        title: 'Bienvenido',
        id: 'page-123',
        count: 5
      });
    });

    it('should handle missing translations gracefully', () => {
      const layout = {
        title: 'Welcome',
        description: 'Hello'
      };
      
      const translations = {
        'title': 'Bienvenido'
        // description translation missing
      };
      
      const result = injectTranslatedText(layout, translations);
      
      expect(result.title).toBe('Bienvenido');
      expect(result.description).toBe('Hello'); // Original preserved
    });

    it('should handle empty translations', () => {
      const layout = {
        title: 'Welcome'
      };
      
      const result = injectTranslatedText(layout, {});
      
      expect(result).toEqual(layout);
    });
  });

  describe('translateTextFields', () => {
    it('should translate text fields using Google API', async () => {
      const textMap = {
        'title': 'Welcome',
        'description': 'Hello world'
      };
      
      const result = await translateTextFields(textMap, 'es', 'en');
      
      expect(result).toEqual({
        'title': '[ES] Welcome',
        'description': '[ES] Hello world'
      });
    });

    it('should handle translation failures gracefully', async () => {
      const { translateText } = await import('../../sparti-cms/services/googleTranslationService.js');
      vi.mocked(translateText).mockRejectedValueOnce(new Error('API Error'));
      
      const textMap = {
        'title': 'Welcome'
      };
      
      const result = await translateTextFields(textMap, 'es', 'en');
      
      // Should return original text on error
      expect(result).toEqual({
        'title': 'Welcome'
      });
    });

    it('should handle empty text map', async () => {
      const result = await translateTextFields({}, 'es', 'en');
      expect(result).toEqual({});
    });
  });

  describe('getDefaultLanguage', () => {
    beforeAll(async () => {
      // Create test tenant settings
      try {
        await query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
          VALUES ('site_language', 'en', 'text', 'localization', true, $1)
          ON CONFLICT (setting_key, tenant_id) DO UPDATE SET setting_value = 'en'
        `, [testTenant]);
      } catch (error) {
        // Ignore if already exists or database not available
        if (error.code !== 'ENOTFOUND') {
          console.warn('Could not set up test tenant settings:', error.message);
        }
      }
    });

    afterAll(async () => {
      // Cleanup
      try {
        await query('DELETE FROM site_settings WHERE tenant_id = $1', [testTenant]);
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    it('should get default language from database', async () => {
      try {
        const result = await getDefaultLanguage(testTenant);
        expect(result).toBe('en');
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          // Skip test if database not available
          console.warn('Skipping test - database not available');
          return;
        }
        throw error;
      }
    });

    it('should return "default" if no language setting exists', async () => {
      try {
        const result = await getDefaultLanguage('tenant-nonexistent');
        expect(result).toBe('default');
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          // Skip test if database not available
          console.warn('Skipping test - database not available');
          return;
        }
        throw error;
      }
    });
  });
});

describe('processPageTranslations Integration', () => {
  let testPageId = null;
  let testPageId2 = null;
  let databaseAvailable = false;

  beforeAll(async () => {
    // Check if database is available
    try {
      await query('SELECT 1');
      databaseAvailable = true;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.warn('Database not available, skipping integration tests');
        databaseAvailable = false;
        return;
      }
      throw error;
    }
    // Create test tenant
    try {
      await query(`
        INSERT INTO tenants (id, name, slug)
        VALUES ($1, 'Test Tenant', 'test-tenant')
        ON CONFLICT (id) DO NOTHING
      `, [testTenant]);
    } catch (error) {
      // Ignore if tenant exists
    }

    // Create test pages
    try {
      const pageResult = await query(`
        INSERT INTO pages (page_name, slug, status, tenant_id)
        VALUES ('Test Page', '/test-page', 'published', $1)
        RETURNING id
      `, [testTenant]);
      testPageId = pageResult.rows[0].id;

      const pageResult2 = await query(`
        INSERT INTO pages (page_name, slug, status, tenant_id)
        VALUES ('Test Page 2', '/test-page-2', 'published', $1)
        RETURNING id
      `, [testTenant]);
      testPageId2 = pageResult2.rows[0].id;

      // Create default layouts
      const defaultLayout = {
        components: [
          {
            key: 'HeroSection',
            props: {
              title: 'Welcome to our site',
              description: 'This is a test page'
            }
          }
        ]
      };

      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, 'default', $2::jsonb, 1, true)
        ON CONFLICT DO NOTHING
      `, [testPageId, JSON.stringify(defaultLayout)]);

      await query(`
        INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
        VALUES ($1, 'default', $2::jsonb, 1, true)
        ON CONFLICT DO NOTHING
      `, [testPageId2, JSON.stringify(defaultLayout)]);

      // Set default language
      await query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
        VALUES ('site_language', 'en', 'text', 'localization', true, $1)
        ON CONFLICT (setting_key, tenant_id) DO UPDATE SET setting_value = 'en'
      `, [testTenant]);
    } catch (error) {
      console.error('Error setting up test pages:', error);
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      if (testPageId) {
        await query('DELETE FROM page_layouts WHERE page_id = $1', [testPageId]);
        await query('DELETE FROM pages WHERE id = $1', [testPageId]);
      }
      if (testPageId2) {
        await query('DELETE FROM page_layouts WHERE page_id = $1', [testPageId2]);
        await query('DELETE FROM pages WHERE id = $1', [testPageId2]);
      }
      await query('DELETE FROM site_settings WHERE tenant_id = $1', [testTenant]);
      await query('DELETE FROM tenants WHERE id = $1', [testTenant]);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should translate pages when language is added', async () => {
    if (!databaseAvailable) {
      console.warn('Skipping test - database not available');
      return;
    }

    // This test requires the actual processPageTranslations to be called
    // We'll test it indirectly through addLanguage
    const result = await languageManagementService.addLanguage('es', testTenant);
    
    expect(result.success).toBe(true);

    // Verify translation was created
    const translationResult = await query(`
      SELECT layout_json FROM page_layouts
      WHERE page_id = $1 AND language = 'es'
    `, [testPageId]);

    expect(translationResult.rows.length).toBeGreaterThan(0);
    
    const translatedLayout = translationResult.rows[0].layout_json;
    const title = translatedLayout.components[0].props.title;
    
    // Should be translated (mocked as [ES] prefix)
    expect(title).toContain('[ES]');
  });

  it('should skip pages without default layout', async () => {
    if (!databaseAvailable) {
      console.warn('Skipping test - database not available');
      return;
    }

    // Create page without default layout
    const pageResult = await query(`
      INSERT INTO pages (page_name, slug, status, tenant_id)
      VALUES ('No Layout Page', '/no-layout', 'published', $1)
      RETURNING id
    `, [testTenant]);
    const noLayoutPageId = pageResult.rows[0].id;

    try {
      // Add language - should not fail even if page has no layout
      const result = await languageManagementService.addLanguage('fr', testTenant);
      expect(result.success).toBe(true);
    } finally {
      // Cleanup
      try {
        await query('DELETE FROM pages WHERE id = $1', [noLayoutPageId]);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  it('should skip pages with existing translation', async () => {
    if (!databaseAvailable) {
      console.warn('Skipping test - database not available');
      return;
    }

    // Create existing translation
    await query(`
      INSERT INTO page_layouts (page_id, language, layout_json, version, is_default)
      VALUES ($1, 'de', $2::jsonb, 1, false)
      ON CONFLICT DO NOTHING
    `, [testPageId, JSON.stringify({ components: [] })]);

    try {
      // Add language - should skip page with existing translation
      const result = await languageManagementService.addLanguage('de', testTenant);
      // Should still succeed
      expect(result.success).toBe(true);
    } finally {
      // Cleanup
      try {
        await query('DELETE FROM page_layouts WHERE page_id = $1 AND language = $2', [testPageId, 'de']);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});

describe('Language Management API Routes', () => {
  let databaseAvailable = false;

  beforeAll(async () => {
    // Check if database is available
    try {
      await query('SELECT 1');
      databaseAvailable = true;
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        console.warn('Database not available, skipping API route tests');
        databaseAvailable = false;
        return;
      }
      throw error;
    }

    // Create test tenant
    try {
      await query(`
        INSERT INTO tenants (id, name, slug)
        VALUES ($1, 'Test Tenant API', 'test-tenant-api')
        ON CONFLICT (id) DO NOTHING
      `, [testTenant]);

      // Set default language
      await query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_category, is_public, tenant_id)
        VALUES ('site_language', 'en', 'text', 'localization', true, $1)
        ON CONFLICT (setting_key, tenant_id) DO UPDATE SET setting_value = 'en'
      `, [testTenant]);
    } catch (error) {
      // Ignore if exists or database not available
      if (error.code !== 'ENOTFOUND') {
        console.warn('Could not set up test tenant:', error.message);
      }
    }
  });

  afterAll(async () => {
    // Cleanup
    try {
      await query('DELETE FROM site_settings WHERE tenant_id = $1', [testTenant]);
      await query('DELETE FROM tenants WHERE id = $1', [testTenant]);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('POST /api/settings/language/add', () => {
    it('should return 400 if language code is missing', async () => {
      const response = await request(app)
        .post('/api/settings/language/add')
        .send({})
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should add language and trigger translation', async () => {
      if (!databaseAvailable) {
        console.warn('Skipping test - database not available');
        return;
      }

      const response = await request(app)
        .post('/api/settings/language/add')
        .send({ languageCode: 'es' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/settings/language/remove', () => {
    it('should remove language', async () => {
      if (!databaseAvailable) {
        console.warn('Skipping test - database not available');
        return;
      }

      // First add a language
      await request(app)
        .post('/api/settings/language/add')
        .send({ languageCode: 'fr' })
        .set('Content-Type', 'application/json');

      // Then remove it
      const response = await request(app)
        .post('/api/settings/language/remove')
        .send({ languageCode: 'fr' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/settings/language/set-default', () => {
    it('should set default language', async () => {
      if (!databaseAvailable) {
        console.warn('Skipping test - database not available');
        return;
      }

      // First add a language
      await request(app)
        .post('/api/settings/language/add')
        .send({ languageCode: 'de' })
        .set('Content-Type', 'application/json');

      // Set it as default
      const response = await request(app)
        .post('/api/settings/language/set-default')
        .send({ languageCode: 'de', fromAdditionalLanguages: true })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
