-- Migration: Consolidate Page Types into Single Table
-- This migration consolidates pages, landing_pages, and legal_pages into a single unified pages table

-- Step 1: Rename existing tables to preserve data
ALTER TABLE pages RENAME TO pages_old;
ALTER TABLE landing_pages RENAME TO landing_pages_old;
ALTER TABLE legal_pages RENAME TO legal_pages_old;

-- Step 2: Create unified pages table with all fields
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'draft',
  page_type VARCHAR(50) NOT NULL DEFAULT 'page',
  tenant_id VARCHAR(255) NOT NULL DEFAULT 'tenant-gosg',
  
  -- Landing page specific fields (nullable)
  campaign_source VARCHAR(100),
  conversion_goal VARCHAR(255),
  
  -- Legal page specific fields (nullable)
  legal_type VARCHAR(100),
  last_reviewed_date DATE,
  version VARCHAR(20) DEFAULT '1.0',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_slug_per_tenant UNIQUE (slug, tenant_id),
  CONSTRAINT valid_page_type CHECK (page_type IN ('page', 'landing', 'legal'))
);

-- Step 3: Migrate data from pages_old (let SERIAL handle new IDs)
INSERT INTO pages (
  page_name, slug, meta_title, meta_description, seo_index, status, 
  page_type, tenant_id, created_at, updated_at
)
SELECT 
  page_name, slug, meta_title, meta_description, seo_index, status,
  'page' as page_type,
  COALESCE(tenant_id, 'tenant-gosg') as tenant_id,
  created_at, updated_at
FROM pages_old;

-- Step 4: Migrate data from landing_pages_old (let SERIAL handle new IDs)
INSERT INTO pages (
  page_name, slug, meta_title, meta_description, seo_index, status,
  page_type, tenant_id, campaign_source, conversion_goal, created_at, updated_at
)
SELECT 
  page_name, slug, meta_title, meta_description, seo_index, status,
  'landing' as page_type,
  COALESCE(tenant_id, 'tenant-gosg') as tenant_id,
  campaign_source, conversion_goal, created_at, updated_at
FROM landing_pages_old;

-- Step 5: Migrate data from legal_pages_old (let SERIAL handle new IDs)
INSERT INTO pages (
  page_name, slug, meta_title, meta_description, seo_index, status,
  page_type, tenant_id, legal_type, last_reviewed_date, version, created_at, updated_at
)
SELECT 
  page_name, slug, meta_title, meta_description, seo_index, status,
  'legal' as page_type,
  COALESCE(tenant_id, 'tenant-gosg') as tenant_id,
  legal_type, last_reviewed_date, version, created_at, updated_at
FROM legal_pages_old;

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON pages(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_tenant_id ON pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pages_tenant_type ON pages(tenant_id, page_type);
CREATE INDEX IF NOT EXISTS idx_pages_slug_tenant ON pages(slug, tenant_id);

-- Step 7: Update the sequence to continue from the highest ID
SELECT setval('pages_id_seq', (SELECT MAX(id) FROM pages));

-- Verification queries (run these to verify migration)
-- SELECT 'pages_old count' as table_name, COUNT(*) as count FROM pages_old
-- UNION ALL
-- SELECT 'landing_pages_old count', COUNT(*) FROM landing_pages_old
-- UNION ALL
-- SELECT 'legal_pages_old count', COUNT(*) FROM legal_pages_old
-- UNION ALL
-- SELECT 'new pages count', COUNT(*) FROM pages
-- UNION ALL
-- SELECT 'pages by type', page_type, COUNT(*) FROM pages GROUP BY page_type;

-- ROLLBACK INSTRUCTIONS (if needed):
-- DROP TABLE IF EXISTS pages;
-- ALTER TABLE pages_old RENAME TO pages;
-- ALTER TABLE landing_pages_old RENAME TO landing_pages;
-- ALTER TABLE legal_pages_old RENAME TO legal_pages;
