const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Contact form submission endpoint (NEW)
app.post('/api/form-submissions', async (req, res) => {
  try {
    const { form_id, form_name, name, email, phone, company, message, ip_address, user_agent } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, and message are required' 
      });
    }

    // Get client IP if not provided
    const clientIP = ip_address || req.ip || req.connection.remoteAddress || 'unknown';

    // For now, we'll log the submission (you can add database storage later)
    console.log('Form submission received:', {
      form_id: form_id || 'Contact Form',
      form_name: form_name || 'Contact Form',
      name,
      email,
      phone: phone || null,
      company: company || null,
      message,
      ip_address: clientIP,
      user_agent: user_agent || req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // TODO: Add database insertion here when database is available
    // Example:
    // await db.query(`
    //   INSERT INTO form_submissions (tenant_id, form_id, name, email, phone, company, message, ip_address, user_agent, created_at)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    // `, [TENANT_ID, form_id, name, email, phone, company, message, clientIP, user_agent]);

    res.status(201).json({ 
      success: true, 
      message: 'Form submission received successfully' 
    });

  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ 
      error: 'Internal server error while processing form submission' 
    });
  }
});

// Contact email endpoint
app.post('/api/send-contact-email', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
      subject: subject || `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});