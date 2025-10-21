-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    database_url TEXT,
    api_key VARCHAR(255)
);

-- Insert GO SG CONSULTING tenant if it doesn't exist
INSERT INTO tenants (id, name, created_at)
SELECT 'tenant-gosg', 'GO SG CONSULTING', NOW()
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE id = 'tenant-gosg');

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
