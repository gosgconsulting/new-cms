-- Add tenant_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE SET NULL;

-- Add is_super_admin flag for users who can access all tenants
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create index for faster tenant-based queries
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Update existing users to assign them to default tenant
UPDATE users 
SET tenant_id = 'tenant-gosg' 
WHERE tenant_id IS NULL AND is_super_admin = false;
