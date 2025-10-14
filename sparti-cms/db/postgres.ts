import { Pool } from 'pg';

// Type definitions
interface BrandingSettings {
  site_name?: string;
  site_tagline?: string;
  site_logo?: string;
  site_favicon?: string;
}

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('[testing] Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('[testing] PostgreSQL connection error:', err);
});

// Helper function to execute queries
export async function query(text: string, params?: unknown[]) {
  const client = await pool.connect();
  try {
    console.log('[testing] Executing query:', { text, params });
    const result = await client.query(text, params);
    console.log('[testing] Query executed successfully, rows:', result.rowCount);
    return result;
  } catch (error) {
    console.error('[testing] Query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('[testing] Initializing Sparti CMS database tables...');
    
    // Create site_settings table for branding and configuration
    await query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create form_submissions table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS form_submissions (
        id SERIAL PRIMARY KEY,
        form_id VARCHAR(255) NOT NULL,
        form_name VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(50),
        user_agent TEXT
      )
    `);

    // Insert default branding settings if they don't exist
    const defaultSettings = [
      { key: 'site_name', value: 'GO SG', type: 'text' },
      { key: 'site_tagline', value: 'Digital Marketing Agency', type: 'text' },
      { key: 'site_logo', value: '', type: 'file' },
      { key: 'site_favicon', value: '', type: 'file' },
    ];

    for (const setting of defaultSettings) {
      await query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) DO NOTHING
      `, [setting.key, setting.value, setting.type]);
    }

    console.log('[testing] Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('[testing] Database initialization failed:', error);
    return false;
  }
}

// Branding-specific functions
export async function getBrandingSettings(): Promise<BrandingSettings> {
  try {
    const result = await query(`
      SELECT setting_key, setting_value, setting_type
      FROM site_settings
      WHERE setting_key IN ('site_name', 'site_tagline', 'site_logo', 'site_favicon')
    `);
    
    // Convert to object format
    const settings: BrandingSettings = {};
    result.rows.forEach((row: { setting_key: string; setting_value: string }) => {
      settings[row.setting_key as keyof BrandingSettings] = row.setting_value;
    });
    
    return settings;
  } catch (error) {
    console.error('[testing] Error fetching branding settings:', error);
    throw error;
  }
}

export async function updateBrandingSetting(key: string, value: string) {
  try {
    const result = await query(`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (setting_key) 
      DO UPDATE SET 
        setting_value = EXCLUDED.setting_value,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [key, value, key.includes('logo') || key.includes('favicon') ? 'file' : 'text']);
    
    console.log('[testing] Updated branding setting:', { key, value });
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error updating branding setting:', error);
    throw error;
  }
}

export async function updateMultipleBrandingSettings(settings: Record<string, string>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      await client.query(`
        INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (setting_key) 
        DO UPDATE SET 
          setting_value = EXCLUDED.setting_value,
          updated_at = CURRENT_TIMESTAMP
      `, [key, value, key.includes('logo') || key.includes('favicon') ? 'file' : 'text']);
    }
    
    await client.query('COMMIT');
    console.log('[testing] Updated multiple branding settings:', settings);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[testing] Error updating multiple branding settings:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Form submission functions
export async function saveFormSubmission(formData: {
  form_id: string;
  form_name: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}) {
  try {
    const result = await query(`
      INSERT INTO form_submissions 
        (form_id, form_name, name, email, phone, message, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      formData.form_id,
      formData.form_name,
      formData.name,
      formData.email,
      formData.phone || null,
      formData.message || null
    ]);
    
    console.log('[testing] Form submission saved:', result.rows[0].id);
    return result.rows[0];
  } catch (error) {
    console.error('[testing] Error saving form submission:', error);
    throw error;
  }
}

export async function getFormSubmissions(formId: string) {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        message,
        submitted_at
      FROM form_submissions
      WHERE form_id = $1
      ORDER BY submitted_at DESC
    `, [formId]);
    
    // Format for frontend
    const formatted = result.rows.map(row => ({
      id: row.id.toString(),
      date: new Date(row.submitted_at).toLocaleString('en-SG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      data: {
        name: row.name,
        email: row.email,
        phone: row.phone || '',
        message: row.message || ''
      }
    }));
    
    return formatted;
  } catch (error) {
    console.error('[testing] Error fetching form submissions:', error);
    throw error;
  }
}

// Analytics Functions

// Track page view
export async function trackPageView(data: {
  page_path: string;
  page_title?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  session_id: string;
  user_id?: string;
  duration_seconds?: number;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
}) {
  const result = await query(`
    INSERT INTO analytics_page_views (
      page_path, page_title, referrer, user_agent, ip_address, session_id, 
      user_id, duration_seconds, country, city, device_type, browser, os
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id
  `, [
    data.page_path, data.page_title, data.referrer, data.user_agent, 
    data.ip_address, data.session_id, data.user_id, data.duration_seconds || 0,
    data.country, data.city, data.device_type, data.browser, data.os
  ]);
  return result.rows[0];
}

// Track custom event
export async function trackEvent(data: {
  event_name: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  page_path?: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  properties?: object;
  conversion_value?: number;
}) {
  const result = await query(`
    INSERT INTO analytics_events (
      event_name, event_category, event_action, event_label, event_value,
      page_path, user_id, session_id, ip_address, user_agent, properties, conversion_value
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id
  `, [
    data.event_name, data.event_category, data.event_action, data.event_label,
    data.event_value, data.page_path, data.user_id, data.session_id,
    data.ip_address, data.user_agent, JSON.stringify(data.properties || {}),
    data.conversion_value || 0
  ]);
  return result.rows[0];
}

// Get analytics overview for dashboard
export async function getAnalyticsOverview(days: number = 30) {
  const result = await query(`
    WITH date_range AS (
      SELECT CURRENT_DATE - INTERVAL '${days} days' as start_date,
             CURRENT_DATE as end_date
    ),
    current_period AS (
      SELECT 
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as page_views,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors,
        ROUND(AVG(duration_seconds), 2) as avg_session_duration,
        ROUND(
          (COUNT(*) FILTER (WHERE bounce = true)::decimal / NULLIF(COUNT(DISTINCT session_id), 0)) * 100, 
          2
        ) as bounce_rate
      FROM analytics_page_views, date_range
      WHERE timestamp >= start_date AND timestamp <= end_date
    ),
    events_data AS (
      SELECT 
        COUNT(*) as total_events,
        COUNT(*) FILTER (WHERE event_category = 'lead') as conversions
      FROM analytics_events, date_range
      WHERE timestamp >= start_date AND timestamp <= end_date
    ),
    top_pages AS (
      SELECT 
        page_path,
        COUNT(*) as views
      FROM analytics_page_views, date_range
      WHERE timestamp >= start_date AND timestamp <= end_date
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    ),
    top_referrers AS (
      SELECT 
        COALESCE(referrer, 'Direct') as referrer,
        COUNT(DISTINCT session_id) as sessions
      FROM analytics_page_views, date_range
      WHERE timestamp >= start_date AND timestamp <= end_date
      GROUP BY referrer
      ORDER BY sessions DESC
      LIMIT 10
    )
    SELECT 
      cp.*,
      ed.total_events,
      ed.conversions,
      CASE 
        WHEN cp.sessions > 0 THEN ROUND((ed.conversions::decimal / cp.sessions) * 100, 2)
        ELSE 0
      END as conversion_rate,
      (SELECT json_agg(json_build_object('page', page_path, 'views', views)) FROM top_pages) as top_pages,
      (SELECT json_agg(json_build_object('referrer', referrer, 'sessions', sessions)) FROM top_referrers) as top_referrers
    FROM current_period cp, events_data ed
  `);
  
  return result.rows[0] || {
    sessions: 0,
    page_views: 0,
    unique_visitors: 0,
    avg_session_duration: 0,
    bounce_rate: 0,
    total_events: 0,
    conversions: 0,
    conversion_rate: 0,
    top_pages: [],
    top_referrers: []
  };
}

// Get analytics data for charts (daily breakdown)
export async function getAnalyticsChartData(days: number = 30) {
  const result = await query(`
    WITH date_series AS (
      SELECT generate_series(
        CURRENT_DATE - INTERVAL '${days} days',
        CURRENT_DATE,
        '1 day'::interval
      )::date as date
    ),
    daily_data AS (
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors,
        ROUND(AVG(duration_seconds), 2) as avg_duration,
        ROUND(
          (COUNT(*) FILTER (WHERE bounce = true)::decimal / NULLIF(COUNT(DISTINCT session_id), 0)) * 100, 
          2
        ) as bounce_rate
      FROM analytics_page_views
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
    ),
    daily_events AS (
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as events,
        COUNT(*) FILTER (WHERE event_category = 'lead') as conversions
      FROM analytics_events
      WHERE timestamp >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(timestamp)
    )
    SELECT 
      ds.date,
      COALESCE(dd.page_views, 0) as page_views,
      COALESCE(dd.sessions, 0) as sessions,
      COALESCE(dd.unique_visitors, 0) as unique_visitors,
      COALESCE(dd.avg_duration, 0) as avg_duration,
      COALESCE(dd.bounce_rate, 0) as bounce_rate,
      COALESCE(de.events, 0) as events,
      COALESCE(de.conversions, 0) as conversions
    FROM date_series ds
    LEFT JOIN daily_data dd ON ds.date = dd.date
    LEFT JOIN daily_events de ON ds.date = de.date
    ORDER BY ds.date
  `);
  
  return result.rows;
}

// Get event definitions
export async function getEventDefinitions() {
  const result = await query(`
    SELECT * FROM analytics_event_definitions 
    WHERE is_active = true 
    ORDER BY category, name
  `);
  return result.rows;
}

// Create or update event definition
export async function upsertEventDefinition(data: {
  name: string;
  category: string;
  description?: string;
  is_conversion?: boolean;
  conversion_value?: number;
  is_active?: boolean;
}) {
  const result = await query(`
    INSERT INTO analytics_event_definitions (
      name, category, description, is_conversion, conversion_value, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (name) DO UPDATE SET
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      is_conversion = EXCLUDED.is_conversion,
      conversion_value = EXCLUDED.conversion_value,
      is_active = EXCLUDED.is_active,
      updated_at = NOW()
    RETURNING *
  `, [
    data.name, data.category, data.description,
    data.is_conversion || false, data.conversion_value || 0,
    data.is_active !== false
  ]);
  return result.rows[0];
}

// Delete event definition
export async function deleteEventDefinition(name: string) {
  await query(`DELETE FROM analytics_event_definitions WHERE name = $1`, [name]);
}

// Get goals
export async function getAnalyticsGoals() {
  const result = await query(`
    SELECT * FROM analytics_goals 
    WHERE is_active = true 
    ORDER BY created_at DESC
  `);
  return result.rows;
}

// Create or update goal
export async function upsertAnalyticsGoal(data: {
  id?: number;
  name: string;
  description?: string;
  goal_type: string;
  target_value: number;
  period?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}) {
  if (data.id) {
    const result = await query(`
      UPDATE analytics_goals SET
        name = $1, description = $2, goal_type = $3, target_value = $4,
        period = $5, start_date = $6, end_date = $7, is_active = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `, [
      data.name, data.description, data.goal_type, data.target_value,
      data.period || 'monthly', data.start_date, data.end_date,
      data.is_active !== false, data.id
    ]);
    return result.rows[0];
  } else {
    const result = await query(`
      INSERT INTO analytics_goals (
        name, description, goal_type, target_value, period, start_date, end_date, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      data.name, data.description, data.goal_type, data.target_value,
      data.period || 'monthly', data.start_date, data.end_date,
      data.is_active !== false
    ]);
    return result.rows[0];
  }
}

// Delete goal
export async function deleteAnalyticsGoal(id: number) {
  await query(`DELETE FROM analytics_goals WHERE id = $1`, [id]);
}

// Get real-time analytics (last 24 hours)
export async function getRealTimeAnalytics() {
  const result = await query(`
    WITH real_time_data AS (
      SELECT 
        COUNT(*) as page_views_24h,
        COUNT(DISTINCT session_id) as sessions_24h,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as visitors_24h,
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '1 hour') as page_views_1h,
        COUNT(DISTINCT session_id) FILTER (WHERE timestamp >= NOW() - INTERVAL '1 hour') as sessions_1h
      FROM analytics_page_views
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    ),
    events_data AS (
      SELECT 
        COUNT(*) as events_24h,
        COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '1 hour') as events_1h,
        COUNT(*) FILTER (WHERE event_category = 'lead') as conversions_24h
      FROM analytics_events
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
    ),
    active_pages AS (
      SELECT 
        page_path,
        COUNT(*) as current_views
      FROM analytics_page_views
      WHERE timestamp >= NOW() - INTERVAL '5 minutes'
      GROUP BY page_path
      ORDER BY current_views DESC
      LIMIT 5
    )
    SELECT 
      rtd.*,
      ed.events_24h,
      ed.events_1h,
      ed.conversions_24h,
      (SELECT json_agg(json_build_object('page', page_path, 'views', current_views)) FROM active_pages) as active_pages
    FROM real_time_data rtd, events_data ed
  `);
  
  return result.rows[0] || {
    page_views_24h: 0,
    sessions_24h: 0,
    visitors_24h: 0,
    page_views_1h: 0,
    sessions_1h: 0,
    events_24h: 0,
    events_1h: 0,
    conversions_24h: 0,
    active_pages: []
  };
}

export default pool;
