-- Analytics Database Migration Script
-- Run this script to add analytics tables to your PostgreSQL database

-- Create analytics_page_views table for tracking page views and basic metrics
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id SERIAL PRIMARY KEY,
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(50),
  session_id VARCHAR(255),
  user_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT false,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100)
);

-- Create analytics_events table for custom event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL,
  event_category VARCHAR(100) NOT NULL, -- lead, phone, form, click, etc.
  event_action VARCHAR(100) NOT NULL,   -- submit, click, view, download, etc.
  event_label VARCHAR(255),
  event_value DECIMAL(10,2),
  page_path VARCHAR(500),
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  properties JSONB DEFAULT '{}', -- Additional event properties
  conversion_value DECIMAL(10,2) DEFAULT 0
);

-- Create analytics_sessions table for session tracking
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  referrer VARCHAR(500),
  landing_page VARCHAR(500),
  exit_page VARCHAR(500),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT true,
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100)
);

-- Create analytics_daily_stats table for aggregated daily statistics
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration DECIMAL(10,2) DEFAULT 0,
  events INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  top_pages JSONB DEFAULT '[]',
  top_referrers JSONB DEFAULT '[]',
  device_breakdown JSONB DEFAULT '{}',
  browser_breakdown JSONB DEFAULT '{}',
  country_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- Create analytics_event_definitions table for managing trackable events
CREATE TABLE IF NOT EXISTS analytics_event_definitions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  is_conversion BOOLEAN DEFAULT false,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_goals table for tracking business goals
CREATE TABLE IF NOT EXISTS analytics_goals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_type VARCHAR(50) NOT NULL, -- event, pageview, duration, etc.
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  period VARCHAR(50) DEFAULT 'monthly', -- daily, weekly, monthly, yearly
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_timestamp ON analytics_page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_user ON analytics_page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_date ON analytics_page_views(DATE(timestamp));

CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_date ON analytics_events(DATE(timestamp));

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_start_time ON analytics_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_stats_date ON analytics_daily_stats(date);

-- Insert default event definitions
INSERT INTO analytics_event_definitions (name, category, description, is_conversion, conversion_value, is_active) VALUES
('contact_form_submit', 'lead', 'Contact form submission', true, 10.00, true),
('phone_click', 'lead', 'Phone number clicked', true, 5.00, true),
('email_click', 'lead', 'Email address clicked', true, 5.00, true),
('quote_request', 'lead', 'Quote request form submitted', true, 25.00, true),
('newsletter_signup', 'engagement', 'Newsletter subscription', false, 0.00, true),
('download_brochure', 'engagement', 'Brochure download', false, 0.00, true),
('video_play', 'engagement', 'Video played', false, 0.00, true),
('social_share', 'engagement', 'Content shared on social media', false, 0.00, true),
('page_scroll_75', 'engagement', 'Page scrolled 75%', false, 0.00, true),
('chat_initiated', 'lead', 'Live chat conversation started', true, 15.00, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default goals
INSERT INTO analytics_goals (name, description, goal_type, target_value, period, start_date, is_active) VALUES
('Monthly Leads', 'Generate 50 leads per month', 'event', 50, 'monthly', CURRENT_DATE, true),
('Contact Form Conversions', 'Achieve 5% contact form conversion rate', 'event', 5.00, 'monthly', CURRENT_DATE, true),
('Page Views Growth', 'Increase monthly page views by 20%', 'pageview', 1000, 'monthly', CURRENT_DATE, true),
('Bounce Rate Improvement', 'Keep bounce rate below 60%', 'bounce_rate', 60.00, 'monthly', CURRENT_DATE, true),
('Session Duration', 'Average session duration above 2 minutes', 'duration', 120, 'monthly', CURRENT_DATE, true)
ON CONFLICT DO NOTHING;

-- Create a function to update daily stats (can be called by a cron job)
CREATE OR REPLACE FUNCTION update_daily_analytics_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_daily_stats (
    date,
    page_views,
    unique_visitors,
    sessions,
    bounce_rate,
    avg_session_duration,
    events,
    conversions
  )
  SELECT 
    target_date,
    COUNT(*) as page_views,
    COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    ROUND(
      (COUNT(*) FILTER (WHERE bounce = true)::decimal / NULLIF(COUNT(DISTINCT session_id), 0)) * 100, 
      2
    ) as bounce_rate,
    ROUND(AVG(duration_seconds), 2) as avg_session_duration,
    (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) = target_date) as events,
    (SELECT COUNT(*) FROM analytics_events WHERE DATE(timestamp) = target_date AND event_category = 'lead') as conversions
  FROM analytics_page_views 
  WHERE DATE(timestamp) = target_date
  ON CONFLICT (date) DO UPDATE SET
    page_views = EXCLUDED.page_views,
    unique_visitors = EXCLUDED.unique_visitors,
    sessions = EXCLUDED.sessions,
    bounce_rate = EXCLUDED.bounce_rate,
    avg_session_duration = EXCLUDED.avg_session_duration,
    events = EXCLUDED.events,
    conversions = EXCLUDED.conversions,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update session end time and duration
CREATE OR REPLACE FUNCTION update_session_on_page_view()
RETURNS TRIGGER AS $$
BEGIN
  -- Update session with latest page view info
  UPDATE analytics_sessions 
  SET 
    end_time = NEW.timestamp,
    duration_seconds = EXTRACT(EPOCH FROM (NEW.timestamp - start_time))::INTEGER,
    page_views = page_views + 1,
    exit_page = NEW.page_path,
    bounce = (page_views = 0) -- Will be false if this is not the first page view
  WHERE session_id = NEW.session_id;
  
  -- If session doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO analytics_sessions (
      session_id, user_id, ip_address, user_agent, landing_page, 
      start_time, page_views, bounce, country, city, device_type, browser, os
    ) VALUES (
      NEW.session_id, NEW.user_id, NEW.ip_address, NEW.user_agent, NEW.page_path,
      NEW.timestamp, 1, true, NEW.country, NEW.city, NEW.device_type, NEW.browser, NEW.os
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic session updates
DROP TRIGGER IF EXISTS trigger_update_session_on_page_view ON analytics_page_views;
CREATE TRIGGER trigger_update_session_on_page_view
  AFTER INSERT ON analytics_page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_page_view();

-- Create a trigger to update event counts in sessions
CREATE OR REPLACE FUNCTION update_session_on_event()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE analytics_sessions 
  SET events = events + 1
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic session event updates
DROP TRIGGER IF EXISTS trigger_update_session_on_event ON analytics_events;
CREATE TRIGGER trigger_update_session_on_event
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_event();
