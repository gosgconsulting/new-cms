-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'Standard',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    description TEXT,
    database_url TEXT,
    api_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tenants if they don't exist
INSERT INTO tenants (id, name, plan, status, description, created_at)
SELECT 'tenant-1', 'Main Website', 'Standard', 'active', 'Main company website with blog and contact forms', '2023-10-15'::TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'tenant-1');

INSERT INTO tenants (id, name, plan, status, description, created_at)
SELECT 'tenant-2', 'E-commerce Store', 'Premium', 'active', 'Online store with product catalog and checkout', '2023-11-20'::TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'tenant-2');

INSERT INTO tenants (id, name, plan, status, description, created_at)
SELECT 'tenant-3', 'Blog Platform', 'Basic', 'active', 'Content publishing platform for the marketing team', '2024-01-05'::TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'tenant-3');

INSERT INTO tenants (id, name, plan, status, description, created_at)
SELECT 'tenant-4', 'Marketing Site', 'Standard', 'maintenance', 'Campaign landing pages and marketing materials', '2024-02-10'::TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'tenant-4');

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at on tenants table
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create tenant_databases table to store database connection info
CREATE TABLE IF NOT EXISTS tenant_databases (
    tenant_id VARCHAR(255) PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 5432,
    database_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    ssl BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at on tenant_databases table
DROP TRIGGER IF EXISTS update_tenant_databases_updated_at ON tenant_databases;
CREATE TRIGGER update_tenant_databases_updated_at
BEFORE UPDATE ON tenant_databases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create tenant_api_keys table to store API keys
CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(255) REFERENCES tenants(id) ON DELETE CASCADE,
    api_key VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at on tenant_api_keys table
DROP TRIGGER IF EXISTS update_tenant_api_keys_updated_at ON tenant_api_keys;
CREATE TRIGGER update_tenant_api_keys_updated_at
BEFORE UPDATE ON tenant_api_keys
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index on tenant_api_keys for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_api_keys_api_key ON tenant_api_keys(api_key);
