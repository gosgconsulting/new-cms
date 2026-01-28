import { RESEND_API_KEY, SMTP_FROM_EMAIL } from '../config/constants.js';

/**
 * Replace template placeholders with actual values
 * Supports placeholders like {{name}}, {{email}}, {{message}}, etc.
 */
export function replaceTemplatePlaceholders(template, data) {
  if (!template) return '';
  
  let result = template;
  
  // Replace all placeholders in the format {{key}}
  Object.keys(data).forEach(key => {
    const value = data[key] || '';
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Send email via Resend API
 */
export async function sendEmailViaResend(emailData) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const { to, subject, html, text, reply_to, from } = emailData;

  if (!to || !subject || (!html && !text)) {
    throw new Error('Missing required fields: to, subject, and html or text');
  }

  const payload = {
    from: from || SMTP_FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    reply_to
  };

  // Remove undefined fields
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Convert plain text template to HTML
 */
function textToHtml(text) {
  if (!text) return '';
  
  // Replace newlines with <br> tags
  return text
    .replace(/\n/g, '<br>')
    .replace(/\r/g, '');
}

/**
 * Send form notification emails to administrators
 */
export async function sendFormNotificationEmails(formSubmission, emailSettings) {
  if (!emailSettings || !emailSettings.notification_enabled) {
    console.log('[testing] Notification emails disabled for form');
    return null;
  }

  if (!emailSettings.notification_emails || emailSettings.notification_emails.length === 0) {
    console.log('[testing] No notification email addresses configured');
    return null;
  }

  try {
    // Prepare template data
    const templateData = {
      name: formSubmission.name || '',
      email: formSubmission.email || '',
      phone: formSubmission.phone || '',
      company: formSubmission.company || '',
      message: formSubmission.message || '',
      form_name: formSubmission.form_name || formSubmission.form_id || 'Form'
    };

    // Replace placeholders in subject and template
    const subject = replaceTemplatePlaceholders(
      emailSettings.notification_subject || 'New Form Submission',
      templateData
    );

    const template = emailSettings.notification_template || 'You have received a new form submission.';
    const textContent = replaceTemplatePlaceholders(template, templateData);
    const htmlContent = textToHtml(textContent);

    // Determine from email (use notification_from_email if set, otherwise fallback to SMTP_FROM_EMAIL)
    const fromEmail = emailSettings.notification_from_email || SMTP_FROM_EMAIL;

    console.log('[testing] Sending notification email from:', fromEmail, '(notification_from_email:', emailSettings.notification_from_email || 'not set, using SMTP_FROM_EMAIL:', SMTP_FROM_EMAIL, ')');

    // Send email to all notification recipients
    const emailData = {
      from: fromEmail,
      to: emailSettings.notification_emails,
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: formSubmission.email || undefined
    };

    const result = await sendEmailViaResend(emailData);
    console.log('[testing] Form notification emails sent successfully:', result.id);
    return result;
  } catch (error) {
    console.error('[testing] Error sending form notification emails:', error);
    throw error;
  }
}

/**
 * Send auto-reply email to form submitter
 */
export async function sendFormAutoReply(formSubmission, emailSettings) {
  if (!emailSettings || !emailSettings.auto_reply_enabled) {
    console.log('[testing] Auto-reply emails disabled for form');
    return null;
  }

  if (!formSubmission.email) {
    console.log('[testing] No email address provided, skipping auto-reply');
    return null;
  }

  try {
    // Prepare template data
    const templateData = {
      name: formSubmission.name || '',
      email: formSubmission.email || '',
      phone: formSubmission.phone || '',
      company: formSubmission.company || '',
      message: formSubmission.message || '',
      form_name: formSubmission.form_name || formSubmission.form_id || 'Form'
    };

    // Replace placeholders in subject and template
    const subject = replaceTemplatePlaceholders(
      emailSettings.auto_reply_subject || 'Thank you for your submission',
      templateData
    );

    const template = emailSettings.auto_reply_template || 'Thank you for contacting us. We will get back to you soon.';
    const textContent = replaceTemplatePlaceholders(template, templateData);
    const htmlContent = textToHtml(textContent);

    // Determine from email and name
    const fromEmail = emailSettings.from_email || SMTP_FROM_EMAIL;
    const fromName = emailSettings.from_name || 'Team';

    // Resend supports "Name <email@example.com>" format
    const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    const emailData = {
      from,
      to: formSubmission.email,
      subject,
      html: htmlContent,
      text: textContent
    };

    const result = await sendEmailViaResend(emailData);
    console.log('[testing] Form auto-reply email sent successfully:', result.id);
    return result;
  } catch (error) {
    console.error('[testing] Error sending form auto-reply email:', error);
    throw error;
  }
}

/**
 * Process form submission emails (notifications + auto-replies)
 * This is the main function to call after saving a form submission
 */
export async function processFormSubmissionEmails(formSubmission, formId) {
  try {
    // Import here to avoid circular dependencies
    const { getEmailSettingsByFormId } = await import('../../sparti-cms/db/modules/forms.js');
    
    // Get email settings for this form
    const emailSettings = await getEmailSettingsByFormId(formId);
    
    if (!emailSettings) {
      console.log('[testing] No email settings found for form:', formId);
      return { notifications: null, autoReply: null };
    }

    const results = {
      notifications: null,
      autoReply: null
    };

    // Send notification emails (don't fail if this fails)
    try {
      results.notifications = await sendFormNotificationEmails(formSubmission, emailSettings);
    } catch (error) {
      console.error('[testing] Failed to send notification emails (non-fatal):', error);
      // Don't throw - form submission should still succeed
    }

    // Send auto-reply (don't fail if this fails)
    try {
      results.autoReply = await sendFormAutoReply(formSubmission, emailSettings);
    } catch (error) {
      console.error('[testing] Failed to send auto-reply email (non-fatal):', error);
      // Don't throw - form submission should still succeed
    }

    return results;
  } catch (error) {
    console.error('[testing] Error processing form submission emails:', error);
    // Don't throw - form submission should still succeed even if emails fail
    return { notifications: null, autoReply: null };
  }
}
