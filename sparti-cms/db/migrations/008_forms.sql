-- Forms Database Migration Script
-- Run this script on your PostgreSQL database to create the forms and email settings tables

-- Create forms table
CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL DEFAULT '[]',
  settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_fields table for better field management
CREATE TABLE IF NOT EXISTS form_fields (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL, -- text, email, phone, textarea, select, checkbox, radio, file
  field_label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB DEFAULT '{}',
  options JSONB DEFAULT '[]', -- for select, checkbox, radio fields
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_settings table for form email configurations
CREATE TABLE IF NOT EXISTS email_settings (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT true,
  notification_emails TEXT[] DEFAULT '{}', -- Array of email addresses
  notification_subject VARCHAR(255) DEFAULT 'New Form Submission',
  notification_template TEXT DEFAULT 'You have received a new form submission.',
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_subject VARCHAR(255) DEFAULT 'Thank you for your submission',
  auto_reply_template TEXT DEFAULT 'Thank you for contacting us. We will get back to you soon.',
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_submissions_extended table (enhanced version)
CREATE TABLE IF NOT EXISTS form_submissions_extended (
  id SERIAL PRIMARY KEY,
  form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
  submission_data JSONB NOT NULL,
  submitter_email VARCHAR(255),
  submitter_name VARCHAR(255),
  submitter_ip VARCHAR(50),
  user_agent TEXT,
  status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
  notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by INTEGER -- Reference to users table if exists
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_active ON forms(is_active);
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_sort ON form_fields(form_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_email_settings_form_id ON email_settings(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_ext_form_id ON form_submissions_extended(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_ext_status ON form_submissions_extended(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_ext_submitted ON form_submissions_extended(submitted_at);

-- Insert default contact form
INSERT INTO forms (name, description, fields, settings, is_active) VALUES
('Contact Form', 'Main website contact form', 
 '[
   {"name": "name", "type": "text", "label": "Full Name", "required": true, "placeholder": "Enter your full name"},
   {"name": "email", "type": "email", "label": "Email Address", "required": true, "placeholder": "Enter your email"},
   {"name": "phone", "type": "tel", "label": "Phone Number", "required": false, "placeholder": "Enter your phone number"},
   {"name": "message", "type": "textarea", "label": "Message", "required": true, "placeholder": "Enter your message"}
 ]',
 '{"submit_button_text": "Send Message", "success_message": "Thank you for your message!", "redirect_url": ""}',
 true)
ON CONFLICT DO NOTHING;

-- Insert corresponding form fields
INSERT INTO form_fields (form_id, field_name, field_type, field_label, placeholder, is_required, sort_order) 
SELECT 
  f.id,
  'name',
  'text',
  'Full Name',
  'Enter your full name',
  true,
  1
FROM forms f WHERE f.name = 'Contact Form'
ON CONFLICT DO NOTHING;

INSERT INTO form_fields (form_id, field_name, field_type, field_label, placeholder, is_required, sort_order) 
SELECT 
  f.id,
  'email',
  'email',
  'Email Address',
  'Enter your email',
  true,
  2
FROM forms f WHERE f.name = 'Contact Form'
ON CONFLICT DO NOTHING;

INSERT INTO form_fields (form_id, field_name, field_type, field_label, placeholder, is_required, sort_order) 
SELECT 
  f.id,
  'phone',
  'tel',
  'Phone Number',
  'Enter your phone number',
  false,
  3
FROM forms f WHERE f.name = 'Contact Form'
ON CONFLICT DO NOTHING;

INSERT INTO form_fields (form_id, field_name, field_type, field_label, placeholder, is_required, sort_order) 
SELECT 
  f.id,
  'message',
  'textarea',
  'Message',
  'Enter your message',
  true,
  4
FROM forms f WHERE f.name = 'Contact Form'
ON CONFLICT DO NOTHING;

-- Insert default email settings for contact form
INSERT INTO email_settings (form_id, notification_enabled, notification_emails, notification_subject, notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name)
SELECT 
  f.id,
  true,
  ARRAY['admin@gosg.com.sg'],
  'New Contact Form Submission',
  'You have received a new contact form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nPhone: {{phone}}',
  true,
  'Thank you for contacting GOSG',
  'Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team',
  'GOSG Team'
FROM forms f WHERE f.name = 'Contact Form'
ON CONFLICT DO NOTHING;
