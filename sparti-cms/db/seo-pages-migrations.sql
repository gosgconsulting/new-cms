-- SEO-Enhanced Pages Database Migration Script
-- Creates separate tables for Pages, Landing Pages, and Legal Pages with SEO metadata
-- Run this script on your PostgreSQL database after the main migrations

-- Drop existing pages table if we need to restructure (optional - for clean setup)
-- DROP TABLE IF EXISTS pages CASCADE;

-- Create enhanced pages table with SEO metadata
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT true, -- true = index, false = noindex
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create landing pages table with SEO metadata
CREATE TABLE IF NOT EXISTS landing_pages (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT true, -- true = index, false = noindex
  campaign_source VARCHAR(100), -- for tracking landing page campaigns
  conversion_goal VARCHAR(255), -- primary goal of the landing page
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create legal pages table with SEO metadata
CREATE TABLE IF NOT EXISTS legal_pages (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT false, -- legal pages typically noindex
  legal_type VARCHAR(100), -- privacy-policy, terms-of-service, cookie-policy, etc.
  last_reviewed_date DATE,
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_seo_index ON pages(seo_index);

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_seo_index ON landing_pages(seo_index);
CREATE INDEX IF NOT EXISTS idx_landing_pages_campaign_source ON landing_pages(campaign_source);

CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON legal_pages(slug);
CREATE INDEX IF NOT EXISTS idx_legal_pages_status ON legal_pages(status);
CREATE INDEX IF NOT EXISTS idx_legal_pages_legal_type ON legal_pages(legal_type);
CREATE INDEX IF NOT EXISTS idx_legal_pages_seo_index ON legal_pages(seo_index);

-- Insert sample pages data
INSERT INTO pages (page_name, slug, meta_title, meta_description, seo_index, status) VALUES
('Homepage', '/', 'GO SG - Professional SEO Services Singapore', 'Leading SEO agency in Singapore providing comprehensive digital marketing solutions to boost your online presence and drive organic traffic.', true, 'published'),
('Blog', '/blog', 'SEO Blog - Latest Digital Marketing Insights | GO SG', 'Stay updated with the latest SEO trends, digital marketing strategies, and industry insights from Singapore''s leading SEO experts.', true, 'published'),
('About Us', '/about', 'About GO SG - Your Trusted SEO Partner in Singapore', 'Learn about GO SG, Singapore''s premier SEO agency. Discover our mission, team, and commitment to delivering exceptional digital marketing results.', true, 'published'),
('Contact', '/contact', 'Contact GO SG - Get Your Free SEO Consultation', 'Ready to boost your online presence? Contact GO SG today for a free SEO consultation and discover how we can help grow your business.', true, 'published')
ON CONFLICT (slug) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  seo_index = EXCLUDED.seo_index,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert sample landing pages data
INSERT INTO landing_pages (page_name, slug, meta_title, meta_description, seo_index, campaign_source, conversion_goal, status) VALUES
('SEO Services Landing', '/seo-services', 'Professional SEO Services Singapore - Boost Your Rankings', 'Transform your online presence with our expert SEO services. Increase organic traffic, improve search rankings, and grow your business in Singapore.', true, 'google-ads', 'Lead Generation', 'published'),
('Local SEO Landing', '/local-seo-singapore', 'Local SEO Singapore - Dominate Local Search Results', 'Dominate local search results in Singapore with our specialized local SEO services. Get found by customers in your area and grow your local business.', true, 'facebook-ads', 'Lead Generation', 'published'),
('E-commerce SEO Landing', '/ecommerce-seo', 'E-commerce SEO Services - Increase Online Sales', 'Boost your online store''s visibility and sales with our specialized e-commerce SEO services. Drive more qualified traffic and increase conversions.', true, 'organic', 'Lead Generation', 'draft')
ON CONFLICT (slug) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  seo_index = EXCLUDED.seo_index,
  campaign_source = EXCLUDED.campaign_source,
  conversion_goal = EXCLUDED.conversion_goal,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert sample legal pages data
INSERT INTO legal_pages (page_name, slug, meta_title, meta_description, seo_index, legal_type, last_reviewed_date, version, status) VALUES
('Privacy Policy', '/privacy-policy', 'Privacy Policy - GO SG', 'Learn how GO SG collects, uses, and protects your personal information. Our comprehensive privacy policy ensures your data security and transparency.', false, 'privacy-policy', CURRENT_DATE, '1.0', 'published'),
('Terms of Service', '/terms-of-service', 'Terms of Service - GO SG', 'Read our terms of service to understand the conditions for using GO SG''s SEO and digital marketing services.', false, 'terms-of-service', CURRENT_DATE, '1.0', 'published'),
('Cookie Policy', '/cookie-policy', 'Cookie Policy - GO SG', 'Understand how GO SG uses cookies to improve your browsing experience and provide personalized services.', false, 'cookie-policy', CURRENT_DATE, '1.0', 'draft'),
('Disclaimer', '/disclaimer', 'Disclaimer - GO SG', 'Important disclaimer information regarding GO SG''s SEO services and website content.', false, 'disclaimer', CURRENT_DATE, '1.0', 'draft')
ON CONFLICT (slug) DO UPDATE SET
  page_name = EXCLUDED.page_name,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  seo_index = EXCLUDED.seo_index,
  legal_type = EXCLUDED.legal_type,
  last_reviewed_date = EXCLUDED.last_reviewed_date,
  version = EXCLUDED.version,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Create a view to get all pages with their types for easier querying
CREATE OR REPLACE VIEW all_pages_view AS
SELECT 
  id,
  page_name,
  slug,
  meta_title,
  meta_description,
  seo_index,
  status,
  'page' as page_type,
  created_at,
  updated_at,
  NULL as campaign_source,
  NULL as conversion_goal,
  NULL as legal_type,
  NULL as last_reviewed_date,
  NULL as version
FROM pages
UNION ALL
SELECT 
  id,
  page_name,
  slug,
  meta_title,
  meta_description,
  seo_index,
  status,
  'landing' as page_type,
  created_at,
  updated_at,
  campaign_source,
  conversion_goal,
  NULL as legal_type,
  NULL as last_reviewed_date,
  NULL as version
FROM landing_pages
UNION ALL
SELECT 
  id,
  page_name,
  slug,
  meta_title,
  meta_description,
  seo_index,
  status,
  'legal' as page_type,
  created_at,
  updated_at,
  NULL as campaign_source,
  NULL as conversion_goal,
  legal_type,
  last_reviewed_date,
  version
FROM legal_pages
ORDER BY page_type, created_at DESC;
