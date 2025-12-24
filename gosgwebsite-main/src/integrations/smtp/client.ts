/**
 * SMTP Integration using Resend API
 * Provides email sending capabilities
 */

export interface EmailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  reply_to?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    content_type?: string;
  }>;
}

export interface EmailResponse {
  id: string;
  from: string;
  to: string[];
  created_at: string;
}

export class SMTPClient {
  private apiKey: string;
  private baseUrl = 'https://api.resend.com';
  private defaultFrom: string;

  constructor(apiKey?: string, defaultFrom?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_RESEND_API_KEY || '';
    this.defaultFrom = defaultFrom || import.meta.env.VITE_SMTP_FROM_EMAIL || 'noreply@yourdomain.com';
    
    if (!this.apiKey) {
      console.warn('[testing] Resend API key not found. Set VITE_RESEND_API_KEY environment variable.');
    }
  }

  /**
   * Send email using Resend API
   */
  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const emailData = {
      from: message.from || this.defaultFrom,
      to: Array.isArray(message.to) ? message.to : [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
      cc: message.cc ? (Array.isArray(message.cc) ? message.cc : [message.cc]) : undefined,
      bcc: message.bcc ? (Array.isArray(message.bcc) ? message.bcc : [message.bcc]) : undefined,
      reply_to: message.reply_to,
      attachments: message.attachments
    };

    // Remove undefined fields
    Object.keys(emailData).forEach(key => {
      if (emailData[key as keyof typeof emailData] === undefined) {
        delete emailData[key as keyof typeof emailData];
      }
    });

    const response = await fetch(`${this.baseUrl}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Send contact form email
   */
  async sendContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    phone?: string;
    company?: string;
  }): Promise<EmailResponse> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Contact Information</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
          ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
          ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #007bff; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p>This email was sent from the GO SG website contact form.</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    const text = `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : ''}
${data.company ? `Company: ${data.company}` : ''}

Message:
${data.message}

---
This email was sent from the GO SG website contact form.
Timestamp: ${new Date().toLocaleString()}
    `;

    return this.sendEmail({
      to: 'contact@gosg.com', // Replace with your contact email
      subject: `Contact Form: ${data.subject}`,
      html,
      text,
      reply_to: data.email
    });
  }

  /**
   * Send notification email
   */
  async sendNotification(
    to: string | string[],
    subject: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<EmailResponse> {
    const colors = {
      info: '#007bff',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545'
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${colors[type]}; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0; text-transform: capitalize;">${type} Notification</h2>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 5px 5px;">
          <h3 style="color: #333; margin-top: 0;">${subject}</h3>
          <div style="line-height: 1.6; color: #555;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d; text-align: center;">
          <p>GO SG Website Notification System</p>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `[GO SG] ${subject}`,
      html,
      text: `${subject}\n\n${message}\n\n---\nGO SG Website Notification System\nTimestamp: ${new Date().toLocaleString()}`
    });
  }

  /**
   * Validate email address
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email sending statistics (if supported by provider)
   */
  async getStats(): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn('[testing] Failed to fetch email stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const smtpClient = new SMTPClient();
