-- Access Keys Management System Migration
-- This file contains all the SQL commands to create the access keys tables

-- Create user_access_keys table for iframe authentication
CREATE TABLE IF NOT EXISTS user_access_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_key VARCHAR(255) UNIQUE NOT NULL,
  key_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_access_keys_user_id ON user_access_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_keys_access_key ON user_access_keys(access_key);
CREATE INDEX IF NOT EXISTS idx_user_access_keys_is_active ON user_access_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_user_access_keys_created_at ON user_access_keys(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_user_access_keys_updated_at 
  BEFORE UPDATE ON user_access_keys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for access keys management (excludes sensitive data)
CREATE OR REPLACE VIEW user_access_keys_management_view AS
SELECT 
  id,
  user_id,
  key_name,
  CASE 
    WHEN LENGTH(access_key) > 8 THEN 
      LEFT(access_key, 4) || '...' || RIGHT(access_key, 4)
    ELSE 
      '****'
  END as masked_access_key,
  is_active,
  last_used_at,
  created_at,
  updated_at
FROM user_access_keys
ORDER BY created_at DESC;
