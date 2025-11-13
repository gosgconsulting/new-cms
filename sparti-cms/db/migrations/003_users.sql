-- Users Management System Migration
-- This file contains all the SQL commands to create the users management tables

-- Create users table with comprehensive user management
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'active',
  tenant_id VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  email_verification_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tenant_id, is_super_admin, and status columns if they don't exist (for backward compatibility)
-- Drop views first if they exist (with CASCADE to handle dependencies), then recreate them after adding columns
DROP VIEW IF EXISTS users_management_view CASCADE;
DROP VIEW IF EXISTS user_statistics CASCADE;

-- Add columns (only if they don't exist)
DO $$ 
BEGIN
  -- Check and add tenant_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE users ADD COLUMN tenant_id VARCHAR(255);
  END IF;
  
  -- Check and add is_super_admin
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_super_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
  END IF;
  
  -- Check and add status (only if not already in CREATE TABLE)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add session_token column if it doesn't exist (for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'session_token'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN session_token VARCHAR(255);
  END IF;
  
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_sessions_session_token_key' 
    OR (contype = 'u' AND conrelid = 'user_sessions'::regclass)
  ) THEN
    -- Check if we can add the constraint (column must exist and not have nulls if NOT NULL)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_sessions' AND column_name = 'session_token'
    ) THEN
      BEGIN
        ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_session_token_key UNIQUE (session_token);
      EXCEPTION WHEN OTHERS THEN
        -- Constraint might already exist or there might be duplicate values, that's okay
        NULL;
      END;
    END IF;
  END IF;
END $$;

-- Create user_activity_log table for audit trail
CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create indexes for user_sessions (only if columns exist)
DO $$ 
BEGIN
  -- Check if user_sessions table exists and has the required columns
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'user_id') THEN
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'session_token') THEN
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'expires_at') THEN
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_sessions' AND column_name = 'is_active') THEN
      CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON user_activity_log(created_at);

-- Create update timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if they exist)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON user_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- Note: In production, this should be done securely with proper password hashing
INSERT INTO users (first_name, last_name, email, password_hash, role, is_active, email_verified)
VALUES (
  'System', 
  'Administrator', 
  'admin@gosg.com', 
  '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqu', -- This would be properly hashed
  'admin', 
  true, 
  true
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified,
  updated_at = NOW();

-- Create view for user management (excludes sensitive data)
CREATE OR REPLACE VIEW users_management_view AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  role,
  is_active,
  email_verified,
  last_login,
  failed_login_attempts,
  CASE WHEN locked_until > NOW() THEN true ELSE false END as is_locked,
  created_at,
  updated_at
FROM users
ORDER BY created_at DESC;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
  COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_count,
  COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_users,
  COUNT(CASE WHEN last_login > NOW() - INTERVAL '30 days' THEN 1 END) as recent_logins
FROM users;
