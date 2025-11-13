import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { pool } from '../../sparti-cms/db/index.js';
import { upload } from '../config/multer.js';
import { RESEND_API_KEY, SMTP_FROM_EMAIL } from '../config/constants.js';
import { invalidateAll, invalidateBySlug } from '../../sparti-cms/cache/index.js';

const router = express.Router();

// ===== DATABASE VIEWER ROUTES =====

// Get all database tables
router.get('/database/tables', async (req, res) => {
  try {
    console.log('[testing] API: Getting database tables');
    
    const queryText = `
      SELECT 
        table_name,
        table_schema,
        table_type,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_name = t.table_name 
          AND table_schema = t.table_schema
        ) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(queryText);
    
    // Get row counts for each table
    const tablesWithCounts = await Promise.all(
      result.rows.map(async (table) => {
        try {
          const countQuery = `SELECT COUNT(*) as row_count FROM "${table.table_name}"`;
          const countResult = await pool.query(countQuery);
          return {
            ...table,
            row_count: parseInt(countResult.rows[0].row_count)
          };
        } catch (error) {
          console.warn(`[testing] Could not get row count for ${table.table_name}:`, error.message);
          return {
            ...table,
            row_count: 0
          };
        }
      })
    );
    
    console.log('[testing] Database tables loaded:', tablesWithCounts.length);
    res.json(tablesWithCounts);
  } catch (error) {
    console.error('[testing] Database tables error:', error);
    res.status(500).json({ error: 'Failed to fetch database tables' });
  }
});

// Get table columns
router.get('/database/tables/:tableName/columns', async (req, res) => {
  try {
    const { tableName } = req.params;
    console.log('[testing] API: Getting columns for table:', tableName);
    
    const queryText = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        CASE 
          WHEN pk.column_name IS NOT NULL THEN true 
          ELSE false 
        END as is_primary_key
      FROM information_schema.columns c
      LEFT JOIN (
        SELECT ku.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage ku
          ON tc.constraint_name = ku.constraint_name
        WHERE tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      ) pk ON c.column_name = pk.column_name
      WHERE c.table_name = $1
        AND c.table_schema = 'public'
      ORDER BY c.ordinal_position;
    `;
    
    const result = await pool.query(queryText, [tableName]);
    console.log('[testing] Table columns loaded:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Table columns error:', error);
    res.status(500).json({ error: 'Failed to fetch table columns' });
  }
});

// Get table data
router.get('/database/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    console.log('[testing] API: Getting data for table:', tableName, 'limit:', limit);
    
    // Validate table name to prevent SQL injection
    const tableExistsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `;
    const tableExists = await pool.query(tableExistsQuery, [tableName]);
    
    if (tableExists.rows.length === 0) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    // Use parameterized query with table name validation
    const queryText = `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`;
    const result = await pool.query(queryText, [limit, offset]);
    
    console.log('[testing] Table data loaded:', result.rows.length, 'rows');
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Table data error:', error);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// ===== FILE UPLOAD ROUTES =====

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('[testing] Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ===== SMTP EMAIL ROUTES =====

// Send email
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, text, reply_to } = req.body;

    if (!RESEND_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'SMTP not configured - missing RESEND_API_KEY' 
      });
    }

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and html or text' 
      });
    }

    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      reply_to
    };

    // Remove undefined fields
    Object.keys(emailData).forEach(key => {
      if (emailData[key] === undefined) {
        delete emailData[key];
      }
    });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[testing] SMTP Error:', error);
      return res.status(response.status).json({ 
        success: false, 
        error: `Email sending failed: ${error}` 
      });
    }

    const result = await response.json();
    console.log('[testing] Email sent successfully:', result.id);
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      id: result.id 
    });

  } catch (error) {
    console.error('[testing] SMTP Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Contact form email endpoint
router.post('/send-contact-email', async (req, res) => {
  try {
    const { name, email, subject, message, phone, company } = req.body;

    if (!RESEND_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'SMTP not configured - missing RESEND_API_KEY' 
      });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, subject, message' 
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p>This email was sent from the GO SG website contact form.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const text = `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}

Message:
${message}

---
This email was sent from the GO SG website contact form.
Timestamp: ${new Date().toLocaleString()}
    `;

    const emailData = {
      from: SMTP_FROM_EMAIL,
      to: ['contact@gosg.com'],
      subject: `Contact Form: ${subject}`,
      html,
      text,
      reply_to: email
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[testing] Contact form email error:', error);
      return res.status(response.status).json({ 
        success: false, 
        error: `Failed to send contact email: ${error}` 
      });
    }

    const result = await response.json();
    console.log('[testing] Contact form email sent successfully:', result.id);
    
    res.json({ 
      success: true, 
      message: 'Contact form email sent successfully',
      id: result.id 
    });

  } catch (error) {
    console.error('[testing] Contact form email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ===== SMTP CONFIGURATION ROUTES =====

// Get SMTP config
router.get('/smtp-config', async (req, res) => {
  try {
    console.log('[testing] Loading SMTP configuration...');
    
    const result = await query(`
      SELECT * FROM smtp_config 
      WHERE id = 1
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      const config = result.rows[0];
      // Don't send the password in the response for security
      const safeConfig = {
        ...config,
        password: config.password ? '••••••••' : ''
      };
      console.log('[testing] SMTP configuration loaded');
      res.json(safeConfig);
    } else {
      console.log('[testing] No SMTP configuration found');
      res.json({
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        security: 'tls',
        enabled: false
      });
    }
  } catch (error) {
    console.error('[testing] Error loading SMTP configuration:', error);
    
    // If table doesn't exist, create it
    if (error.message.includes('relation "smtp_config" does not exist')) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS smtp_config (
            id SERIAL PRIMARY KEY,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL DEFAULT 587,
            username VARCHAR(255) NOT NULL,
            password TEXT NOT NULL,
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255),
            security VARCHAR(10) NOT NULL DEFAULT 'tls',
            enabled BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('[testing] SMTP config table created');
        
        // Return default config
        res.json({
          host: '',
          port: 587,
          username: '',
          password: '',
          fromEmail: '',
          fromName: '',
          security: 'tls',
          enabled: false
        });
      } catch (createError) {
        console.error('[testing] Error creating SMTP config table:', createError);
        res.status(500).json({ error: 'Failed to initialize SMTP configuration' });
      }
    } else {
      res.status(500).json({ error: 'Failed to load SMTP configuration' });
    }
  }
});

// Update SMTP config
router.post('/smtp-config', async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security, enabled } = req.body;
    
    console.log('[testing] Saving SMTP configuration...');
    
    // Validate required fields
    if (enabled && (!host || !port || !username || !password || !fromEmail)) {
      return res.status(400).json({ 
        error: 'Missing required fields: host, port, username, password, fromEmail' 
      });
    }
    
    // Check if configuration exists
    const existing = await query('SELECT id FROM smtp_config WHERE id = 1');
    
    let result;
    if (existing.rows.length > 0) {
      // Update existing configuration
      result = await query(`
        UPDATE smtp_config 
        SET host = $1, port = $2, username = $3, password = $4, 
            from_email = $5, from_name = $6, security = $7, enabled = $8, 
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    } else {
      // Create new configuration
      result = await query(`
        INSERT INTO smtp_config (host, port, username, password, from_email, from_name, security, enabled)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [host, port, username, password, fromEmail, fromName, security, enabled]);
    }
    
    const savedConfig = result.rows[0];
    // Don't send the password back
    const safeConfig = {
      ...savedConfig,
      password: '••••••••'
    };
    
    console.log('[testing] SMTP configuration saved successfully');
    res.json(safeConfig);
    
  } catch (error) {
    console.error('[testing] Error saving SMTP configuration:', error);
    res.status(500).json({ error: 'Failed to save SMTP configuration' });
  }
});

// Test SMTP connection
router.post('/smtp-test', async (req, res) => {
  try {
    const { host, port, username, password, fromEmail, fromName, security } = req.body;
    
    console.log('[testing] Testing SMTP connection...');
    
    // Validate required fields
    if (!host || !port || !username || !password || !fromEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields for SMTP test' 
      });
    }
    
    // Import nodemailer dynamically
    const nodemailer = await import('nodemailer');
    
    // Create transporter
    const transporter = nodemailer.default.createTransporter({
      host,
      port: parseInt(port),
      secure: security === 'ssl',
      auth: {
        user: username,
        pass: password,
      },
      tls: security === 'tls' ? {
        rejectUnauthorized: false
      } : undefined
    });
    
    // Verify connection
    await transporter.verify();
    
    // Send test email
    const testEmail = {
      from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
      to: fromEmail,
      subject: 'SMTP Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SMTP Test Successful!</h2>
          <p>Your SMTP configuration is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="margin-top: 0;">Configuration Details:</h3>
            <p><strong>Host:</strong> ${host}</p>
            <p><strong>Port:</strong> ${port}</p>
            <p><strong>Security:</strong> ${security.toUpperCase()}</p>
            <p><strong>Username:</strong> ${username}</p>
          </div>
          <p style="color: #666; font-size: 12px;">
            This is an automated test email sent at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `SMTP Test Successful!\n\nYour SMTP configuration is working correctly.\n\nHost: ${host}\nPort: ${port}\nSecurity: ${security.toUpperCase()}\nUsername: ${username}\n\nThis is an automated test email sent at ${new Date().toLocaleString()}`
    };
    
    const info = await transporter.sendMail(testEmail);
    
    console.log('[testing] SMTP test email sent successfully:', info.messageId);
    
    res.json({
      success: true,
      message: 'SMTP connection successful! Test email sent.',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('[testing] SMTP test failed:', error);
    
    let errorMessage = 'SMTP connection failed';
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed. Check your username and password.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Connection failed. Check your host and port settings.';
    } else if (error.code === 'ESOCKET') {
      errorMessage = 'Socket error. Check your network connection and firewall settings.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
});

// ===== CACHE ROUTES =====

// Cache invalidation endpoint
router.post('/cache/invalidate', async (req, res) => {
  try {
    const { slug, all } = req.body || {};
    if (all) {
      invalidateAll();
      return res.json({ ok: true, cleared: 'all' });
    }
    if (slug) {
      invalidateBySlug(slug);
      return res.json({ ok: true, cleared: slug });
    }
    return res.status(400).json({ error: 'Provide slug or all=true' });
  } catch (error) {
    console.error('[testing] Cache invalidation error:', error);
    res.status(500).json({ error: 'Failed to invalidate cache' });
  }
});

export default router;

