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
    const { form_id, form_name, name, email, phone, company, message } = req.body;
    
    console.log('[testing] Form submission received:', { form_id, name, email });
    
    // Save form submission
    const submission = await saveFormSubmission({ 
      form_id, 
      form_name, 
      name, 
      email, 
      phone,
      company, 
      message,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    // Also create/update contact record
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
      });
      
      console.log('[testing] Contact created from form submission');
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
    const result = await query('SELECT * FROM forms ORDER BY created_at DESC');
    res.json(result.rows);
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
    
    const result = await query(`
      INSERT INTO forms (name, description, fields, settings, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, description, JSON.stringify(fields || []), JSON.stringify(settings || {}), is_active ?? true]);
    
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
router.put('/forms/:id', async (req, res) => {
  try {
    const { name, description, fields, settings, is_active } = req.body;
    
    const result = await query(`
      UPDATE forms 
      SET name = $1, description = $2, fields = $3, settings = $4, is_active = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `, [name, description, JSON.stringify(fields), JSON.stringify(settings), is_active, req.params.id]);
    
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
router.delete('/forms/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM forms WHERE id = $1 RETURNING *', [req.params.id]);
    
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

export default router;

