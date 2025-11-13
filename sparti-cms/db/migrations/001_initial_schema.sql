-- Sparti CMS Database Migration Script
-- Run this script on your PostgreSQL database to create the necessary tables

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content JSONB NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) NOT NULL DEFAULT 'Sparti CMS',
  primary_color VARCHAR(50) NOT NULL DEFAULT '#3b82f6',
  secondary_color VARCHAR(50) NOT NULL DEFAULT '#64748b',
  font_family VARCHAR(255) NOT NULL DEFAULT 'Inter',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions table (for contact forms)
CREATE TABLE IF NOT EXISTS form_submissions (
  id SERIAL PRIMARY KEY,
  form_id VARCHAR(255) NOT NULL,
  form_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_active ON components(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted ON form_submissions(submitted_at);

-- Insert default settings if none exist
INSERT INTO settings (site_name, primary_color, secondary_color, font_family)
SELECT 'GOSG Website', '#3b82f6', '#64748b', 'Inter'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE id = 1);

-- Insert sample components
INSERT INTO components (name, type, category, content, is_active) VALUES
('Hero Section', 'hero', 'hero', '{"title": "Welcome to GOSG", "subtitle": "Professional SEO Services"}', true),
('Contact Form', 'form', 'forms', '{"fields": ["name", "email", "message"]}', true),
('Testimonials', 'testimonials', 'testimonials', '{"items": []}', true)
ON CONFLICT DO NOTHING;

-- Insert sample pages
INSERT INTO pages (title, slug, content, is_published) VALUES
('Home', 'home', '{"sections": []}', true),
('About', 'about', '{"sections": []}', false),
('Contact', 'contact', '{"sections": []}', true)
ON CONFLICT (slug) DO NOTHING;
