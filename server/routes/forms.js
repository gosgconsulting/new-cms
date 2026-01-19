import express from 'express';
import { query } from '../../sparti-cms/db/index.js';
import { authenticateUser } from '../middleware/auth.js';
import {
  saveFormSubmission,
  getFormById,
  getEmailSettingsByFormId,
  getFormSubmissions,
  createContact
} from '../../sparti-cms/db/index.js';

const router = express.Router();

// ===== FORM SUBMISSIONS ROUTES =====

// Submit form
router.post('/form-submissions', async (req, res) => {
  try {
    const { form_id, form_name, name, email, phone, company, message, tenant_id } = req.body;
    
    console.log('[testing] Form submission received:', { form_id, name, email, tenant_id });
    
    // Save form submission
    const submission = await saveFormSubmission({ 
      form_id, 
      form_name, 
      name, 
      email, 
      phone,
      company, 
      message,
      tenant_id,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Also create/update contact record with tenant information
    try {
      const nameParts = name.split(' ');
      const first_name = nameParts[0] || name;
      const last_name = nameParts.slice(1).join(' ') || null;
      
      await createContact({
        first_name,
        last_name,
        email,
        phone,
        company,
        source: form_name || form_id || 'form',
        status: 'new',
        notes: message ? `Form message: ${message}` : null
      }, tenant_id); // Pass tenant_id as second parameter
      
      console.log('[testing] Contact created from form submission for tenant:', tenant_id);
    } catch (contactError) {
      console.error('[testing] Error creating contact from form:', contactError);
      // Don't fail the form submission if contact creation fails
    }
    
    res.json({ 
      success: true, 
      message: 'Form submission saved successfully',
      id: submission.id
    });
  } catch (error) {
    console.error('[testing] Error saving form submission:', error);
    res.status(500).json({ error: 'Failed to save form submission' });
  }
});

// Get all form submissions
router.get('/form-submissions/all', async (req, res) => {
  try {
    console.log('[testing] Fetching all form submissions');
    
    const result = await query(`
      SELECT * FROM form_submissions 
      ORDER BY submitted_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching all form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// Get form submissions by form ID
router.get('/form-submissions/:formId', async (req, res) => {
  try {
    const { formId } = req.params;
    
    console.log('[testing] Fetching submissions for form:', formId);
    
    const submissions = await getFormSubmissions(formId);
    
    res.json(submissions);
  } catch (error) {
    console.error('[testing] Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// ===== FORMS MANAGEMENT ROUTES =====

// Get all forms
router.get('/forms', authenticateUser, async (req, res) => {
  try {
    // For non-super-admin users, always use their tenant_id (security: prevent access to other tenants' forms)
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      // Non-super-admin: must use their own tenant_id
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Your account is not associated with a tenant' });
      }
    } else {
      // Super-admin: can specify tenant via query param or header, but default to their tenant_id if available
      tenantId = req.query.tenantId || 
                  req.headers['x-tenant-id'] || 
                  req.headers['X-Tenant-Id'] ||
                  req.tenantId ||
                  req.user?.tenant_id;
    }
    
    if (!tenantId) {
      console.error('[testing] No tenant ID found. req.tenantId:', req.tenantId, 'req.user?.tenant_id:', req.user?.tenant_id, 'headers:', req.headers['x-tenant-id'] || req.headers['X-Tenant-Id'], 'query:', req.query.tenantId);
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    console.log('[testing] Fetching forms for tenant:', tenantId, 'User is super admin:', req.user?.is_super_admin);
    
    // Ensure tenant_id is treated as string for comparison (PostgreSQL VARCHAR)
    // Use LOWER() for case-insensitive comparison and trim whitespace
    const result = await query(
      `SELECT * FROM forms 
       WHERE LOWER(TRIM(tenant_id)) = LOWER(TRIM($1::text)) 
       ORDER BY created_at DESC`,
      [String(tenantId)]
    );
    
    // Deduplicate forms: keep only the most recent form for each unique (name, tenant_id) combination
    const seenForms = new Map();
    const deduplicatedForms = [];
    
    for (const form of result.rows) {
      const key = `${form.name.toLowerCase().trim()}_${form.tenant_id}`;
      
      if (!seenForms.has(key)) {
        // First occurrence - keep it
        seenForms.set(key, form);
        deduplicatedForms.push(form);
      } else {
        // Duplicate found - keep the one with the most recent created_at
        const existing = seenForms.get(key);
        const existingDate = new Date(existing.created_at);
        const currentDate = new Date(form.created_at);
        
        if (currentDate > existingDate) {
          // Current form is newer - replace the existing one
          const index = deduplicatedForms.indexOf(existing);
          if (index > -1) {
            deduplicatedForms[index] = form;
          }
          seenForms.set(key, form);
        }
        // Otherwise, keep the existing one (older form is discarded)
      }
    }
    
    console.log('[testing] Found', result.rows.length, 'forms for tenant', tenantId, '- after deduplication:', deduplicatedForms.length);
    res.json(deduplicatedForms);
  } catch (error) {
    console.error('[testing] Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});

// Get form by ID
router.get('/forms/:id', authenticateUser, async (req, res) => {
  try {
    const form = await getFormById(req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error fetching form:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Create new form
router.post('/forms', authenticateUser, async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    
    // For non-super-admin users, always use their tenant_id
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Your account is not associated with a tenant' });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers['x-tenant-id'] || req.body.tenantId;
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Check if a form with the same name already exists for this tenant
    const existingForm = await query(`
      SELECT * FROM forms 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
      AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($2))
      LIMIT 1
    `, [name, String(tenantId)]);
    
    if (existingForm.rows.length > 0) {
      return res.status(409).json({ 
        error: 'A form with this name already exists for this tenant',
        existingForm: existingForm.rows[0]
      });
    }
    
    const result = await query(`
      INSERT INTO forms (name, description, fields, settings, is_active, tenant_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, JSON.stringify(fields || []), JSON.stringify(settings || {}), is_active ?? true, tenantId]);
    
    const newForm = result.rows[0];
    
    // Create default email settings for new form
    await query(`
      INSERT INTO email_settings (
        form_id, notification_enabled, notification_emails, notification_subject, 
        notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      newForm.id,
      true,
      ['admin@gosg.com.sg'],
      `New ${newForm.name} Submission`,
      'You have received a new form submission.',
      false,
      'Thank you for your submission',
      'Thank you for contacting us. We will get back to you soon.',
      'GOSG Team'
    ]);
    
    res.json(newForm);
  } catch (error) {
    console.error('[testing] Error creating form:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Update form
router.put('/forms/:id', authenticateUser, async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    
    // For non-super-admin users, always use their tenant_id
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Your account is not associated with a tenant' });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers['x-tenant-id'] || req.body.tenantId;
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    const result = await query(`
      UPDATE forms 
      SET name = $1, description = $2, fields = $3, settings = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6 AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($7::text))
      RETURNING *
    `, [name, description, JSON.stringify(fields), JSON.stringify(settings), is_active, req.params.id, String(tenantId)]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error updating form:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Delete form
router.delete('/forms/:id', authenticateUser, async (req, res) => {
  try {
    // For non-super-admin users, always use their tenant_id
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Your account is not associated with a tenant' });
      }
    } else {
      tenantId = req.tenantId || req.user?.tenant_id || req.headers['x-tenant-id'] || req.query.tenantId;
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    const result = await query(
      'DELETE FROM forms WHERE id = $1 AND LOWER(TRIM(tenant_id)) = LOWER(TRIM($2::text)) RETURNING *', 
      [req.params.id, String(tenantId)]
    );
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: 'Form deleted successfully' });
    } else {
      res.status(404).json({ error: 'Form not found' });
    }
  } catch (error) {
    console.error('[testing] Error deleting form:', error);
    res.status(500).json({ error: 'Failed to delete form' });
  }
});

// Get email settings for a form
router.get('/forms/:id/email-settings', async (req, res) => {
  try {
    const settings = await getEmailSettingsByFormId(req.params.id);
    if (settings) {
      res.json(settings);
    } else {
      res.status(404).json({ error: 'Email settings not found' });
    }
  } catch (error) {
    console.error('[testing] Error fetching email settings:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

// Update email settings for a form
router.put('/forms/:id/email-settings', async (req, res) => {
  try {
    const {
      notification_enabled,
      notification_emails,
      notification_subject,
      notification_template,
      auto_reply_enabled,
      auto_reply_subject,
      auto_reply_template,
      from_email,
      from_name
    } = req.body;
    
    // Check if settings exist
    const existing = await getEmailSettingsByFormId(req.params.id);
    
    let result;
    if (existing) {
      // Update existing settings
      result = await query(`
        UPDATE email_settings 
        SET notification_enabled = $1, notification_emails = $2, notification_subject = $3,
            notification_template = $4, auto_reply_enabled = $5, auto_reply_subject = $6,
            auto_reply_template = $7, from_email = $8, from_name = $9, updated_at = NOW()
        WHERE form_id = $10
        RETURNING *
      `, [
        notification_enabled, notification_emails, notification_subject, notification_template,
        auto_reply_enabled, auto_reply_subject, auto_reply_template, from_email, from_name,
        req.params.id
      ]);
    } else {
      // Create new settings
      result = await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject,
          notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template,
          from_email, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        req.params.id, notification_enabled, notification_emails, notification_subject,
        notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template,
        from_email, from_name
      ]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[testing] Error updating email settings:', error);
    res.status(500).json({ error: 'Failed to update email settings' });
  }
});

// Get form submissions
router.get('/forms/:id/submissions', async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM form_submissions_extended 
      WHERE form_id = $1 
      ORDER BY submitted_at DESC 
      LIMIT 100
    `, [req.params.id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('[testing] Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

// Clean up duplicate forms (merge duplicates, keep the most recent one)
router.post('/forms/cleanup-duplicates', authenticateUser, async (req, res) => {
  try {
    // For non-super-admin users, only clean up their tenant's forms
    let tenantId;
    if (req.user && !req.user.is_super_admin) {
      tenantId = req.user.tenant_id;
      if (!tenantId) {
        return res.status(403).json({ error: 'Your account is not associated with a tenant' });
      }
    } else {
      tenantId = req.query.tenantId || 
                  req.headers['x-tenant-id'] || 
                  req.headers['X-Tenant-Id'] ||
                  req.tenantId ||
                  req.user?.tenant_id;
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    console.log('[testing] Cleaning up duplicate forms for tenant:', tenantId);
    
    // Find duplicate forms (same name, same tenant_id)
    const duplicatesResult = await query(`
      SELECT 
        name,
        tenant_id,
        COUNT(*) as count,
        array_agg(id ORDER BY created_at DESC) as form_ids,
        array_agg(created_at ORDER BY created_at DESC) as created_dates
      FROM forms
      WHERE LOWER(TRIM(tenant_id)) = LOWER(TRIM($1::text))
      GROUP BY name, tenant_id
      HAVING COUNT(*) > 1
    `, [String(tenantId)]);
    
    let deletedCount = 0;
    const deletedFormIds = [];
    
    for (const duplicate of duplicatesResult.rows) {
      const formIds = duplicate.form_ids;
      const createdDates = duplicate.created_dates;
      
      // Keep the first form (most recent), delete the rest
      const formToKeep = formIds[0];
      const formsToDelete = formIds.slice(1);
      
      console.log(`[testing] Found ${formIds.length} duplicates for form "${duplicate.name}". Keeping form ${formToKeep}, deleting:`, formsToDelete);
      
      // Before deleting, migrate any submissions from deleted forms to the kept form
      for (const formIdToDelete of formsToDelete) {
        // Update form_submissions_extended to point to the kept form
        await query(`
          UPDATE form_submissions_extended
          SET form_id = $1
          WHERE form_id = $2
        `, [formToKeep, formIdToDelete]);
        
        // Update form_submissions to point to the kept form
        await query(`
          UPDATE form_submissions
          SET form_id = $1
          WHERE form_id = $2
        `, [formToKeep, formIdToDelete]);
        
        // Delete email_settings for duplicate forms
        await query(`
          DELETE FROM email_settings
          WHERE form_id = $1
        `, [formIdToDelete]);
        
        // Delete the duplicate form
        await query(`
          DELETE FROM forms
          WHERE id = $1
        `, [formIdToDelete]);
        
        deletedFormIds.push(formIdToDelete);
        deletedCount++;
      }
    }
    
    console.log('[testing] Cleanup complete. Deleted', deletedCount, 'duplicate forms');
    
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} duplicate forms`,
      deletedCount,
      deletedFormIds
    });
  } catch (error) {
    console.error('[testing] Error cleaning up duplicate forms:', error);
    res.status(500).json({ error: 'Failed to clean up duplicate forms' });
  }
});

export default router;

