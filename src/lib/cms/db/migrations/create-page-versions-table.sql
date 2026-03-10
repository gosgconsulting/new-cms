-- Migration: Create page_versions table for version history
-- This table stores version history for all page saves, supporting multi-tenancy

-- Create page_versions table
CREATE TABLE IF NOT EXISTS page_versions (
  id SERIAL PRIMARY KEY,
  page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  
  -- Page metadata fields (snapshot at time of save)
  page_name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_index BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'draft',
  page_type VARCHAR(50) NOT NULL DEFAULT 'page',
  
  -- Landing page specific fields
  campaign_source VARCHAR(100),
  conversion_goal VARCHAR(255),
  
  -- Legal page specific fields
  legal_type VARCHAR(100),
  last_reviewed_date DATE,
  
  -- Layout data (components)
  layout_json JSONB NOT NULL DEFAULT '{"components": []}'::jsonb,
  
  -- User who created this version
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Optional comment/description for this version
  comment TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint: one version number per page per tenant
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_version_per_page'
  ) THEN
    ALTER TABLE page_versions 
    ADD CONSTRAINT unique_version_per_page 
    UNIQUE (page_id, tenant_id, version_number);
    RAISE NOTICE 'Added unique constraint unique_version_per_page';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_tenant_id ON page_versions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_tenant ON page_versions(page_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_at ON page_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_page_versions_created_by ON page_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_page_versions_lookup ON page_versions(page_id, tenant_id, version_number);

-- Add comment to table
COMMENT ON TABLE page_versions IS 'Stores version history for page saves, allowing restoration of previous versions';
COMMENT ON COLUMN page_versions.version_number IS 'Sequential version number per page (auto-incremented per page)';
COMMENT ON COLUMN page_versions.layout_json IS 'Complete snapshot of page layout/components at time of save';
COMMENT ON COLUMN page_versions.comment IS 'Optional user-provided description for this version';

