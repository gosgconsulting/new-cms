import { query } from '../connection.js';

// Get form by ID or name
export async function getFormById(formId) {
  try {
    // Try to parse as integer first, if it fails, search by name
    const isNumeric = !isNaN(parseInt(formId));
    
    let result;
    if (isNumeric) {
      result = await query('SELECT * FROM forms WHERE id = $1 OR name = $1', [parseInt(formId), formId]);
    } else {
      result = await query('SELECT * FROM forms WHERE name = $1', [formId]);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting form:', error);
    throw error;
  }
}

// Get email settings for a form
export async function getEmailSettingsByFormId(formId) {
  try {
    const result = await query('SELECT * FROM email_settings WHERE form_id = $1', [formId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error getting email settings:', error);
    return null; // Return null if no settings found
  }
}

// Save form submission to new forms database
export async function saveFormSubmissionExtended(formData) {
  try {
    // First, try to find the form in the new forms table
    let form = await getFormById(formData.form_id);
    
    // If form doesn't exist in new table, create a default one for backward compatibility
    if (!form) {
      console.log('Form not found in new forms table, creating default form for:', formData.form_id);
      
      const defaultFormResult = await query(`
        INSERT INTO forms (name, description, fields, settings, is_active)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
      `, [
        formData.form_name || formData.form_id,
        `Auto-created form for ${formData.form_id}`,
        JSON.stringify([
          { field_name: 'name', field_type: 'text', field_label: 'Name', is_required: true, sort_order: 1 },
          { field_name: 'email', field_type: 'email', field_label: 'Email', is_required: true, sort_order: 2 },
          { field_name: 'phone', field_type: 'tel', field_label: 'Phone', is_required: false, sort_order: 3 },
          { field_name: 'company', field_type: 'text', field_label: 'Company', is_required: false, sort_order: 4 },
          { field_name: 'message', field_type: 'textarea', field_label: 'Message', is_required: true, sort_order: 5 }
        ]),
        JSON.stringify({ submit_button_text: 'Send Message', success_message: 'Thank you for your message!' })
      ]);
      
      form = defaultFormResult.rows[0];
      
      // Create default email settings
      await query(`
        INSERT INTO email_settings (
          form_id, notification_enabled, notification_emails, notification_subject, 
          notification_template, auto_reply_enabled, auto_reply_subject, auto_reply_template, from_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        form.id,
        true,
        ['admin@gosg.com.sg'],
        `New ${form.name} Submission`,
        'You have received a new form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}\n\nPhone: {{phone}}\nCompany: {{company}}',
        true,
        'Thank you for contacting GOSG',
        'Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team',
        'GOSG Team'
      ]);
    }

    // Prepare submission data
    const submissionData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: formData.message
    };

    // Save to new form_submissions_extended table
    const result = await query(`
      INSERT INTO form_submissions_extended 
        (form_id, submission_data, submitter_email, submitter_name, submitter_ip, user_agent, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'new')
      RETURNING *
    `, [
      form.id,
      JSON.stringify(submissionData),
      formData.email,
      formData.name,
      formData.ip_address,
      formData.user_agent
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error saving form submission to new database:', error);
    throw error;
  }
}

// Legacy function for backward compatibility
export async function saveFormSubmission(formData) {
  try {
    // Save to both old and new tables for compatibility
    const legacyResult = await query(`
      INSERT INTO form_submissions 
        (form_id, form_name, name, email, phone, company, message, status, ip_address, user_agent, tenant_id, submitted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      formData.form_id,
      formData.form_name,
      formData.name,
      formData.email,
      formData.phone || null,
      formData.company || null,
      formData.message || null,
      formData.status || 'new',
      formData.ip_address || null,
      formData.user_agent || null,
      formData.tenant_id || null
    ]);
    
    // Also save to new forms database for integration
    try {
      await saveFormSubmissionExtended(formData);
    } catch (newDbError) {
      console.error('Error saving to new forms database:', newDbError);
      // Don't fail the legacy save if new database fails
    }
    
    return legacyResult.rows[0];
  } catch (error) {
    console.error('Error saving form submission:', error);
    throw error;
  }
}

export async function getFormSubmissions(formId) {
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
    console.error('Error fetching form submissions:', error);
    throw error;
  }
}

