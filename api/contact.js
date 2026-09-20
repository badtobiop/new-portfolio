const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    let { name, email, message } = req.body || {};
    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    message = (message || '').trim();

    if (!name || name.length < 2 || !email || !message || message.length < 5) {
      return res.status(400).json({ success: false, message: 'Validation failed' });
    }

    const smtpUser = process.env.SMTP_USER || 'utkarshdhakane2@gmail.com';
    const smtpPass = (process.env.SMTP_PASS || 'owfzpfocskibmuon').replace(/\s+/g, '');
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'utkarshdhakane2@gmail.com';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const plainText = `New Portfolio Transmission Received!\n\nSender: ${name}\nEmail: ${email}\nDate: ${new Date().toLocaleString()}\n\nMessage:\n${message}\n\nReply directly to: ${email}`;

    const htmlContent = `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #0c0207; color: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #ff003c; max-width: 600px; margin: 0 auto;">
      <div style="border-bottom: 2px solid #ff003c; padding-bottom: 14px; margin-bottom: 20px;">
        <h2 style="color: #ff003c; margin: 0; font-size: 22px; letter-spacing: 1.5px; text-transform: uppercase;">
          ⚡ New Portfolio Transmission
        </h2>
        <p style="color: #888888; font-size: 13px; margin: 6px 0 0;">
          Received on: ${new Date().toLocaleString()}
        </p>
      </div>

      <div style="background: rgba(255, 255, 255, 0.05); padding: 18px; border-radius: 8px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
        <p style="margin: 0 0 10px; font-size: 15px;">
          <strong>Sender Name:</strong> <span style="color: #ff3366; font-weight: bold;">${name}</span>
        </p>
        <p style="margin: 0 0 10px; font-size: 15px;">
          <strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #00e676; text-decoration: none; font-weight: bold;">${email}</a>
        </p>
      </div>

      <div style="background: rgba(255, 0, 60, 0.07); border-left: 4px solid #ff003c; padding: 18px; border-radius: 4px; margin-bottom: 25px;">
        <h4 style="color: #ff003c; margin: 0 0 10px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
          Message Content:
        </h4>
        <p style="margin: 0; color: #f0f0f0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 18px;">
        <a href="mailto:${email}?subject=Re: Portfolio Inquiry&body=Hi ${encodeURIComponent(name)},%0D%0A%0D%0AThank you for reaching out!%0D%0A%0D%0ABest regards,%0D%0AUtkarsh Dhakane" 
           style="background: #ff003c; color: #ffffff; padding: 12px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block; letter-spacing: 0.5px;">
          ✉ Reply Directly to ${name}
        </a>
      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"Utkarsh Portfolio" <${smtpUser}>`,
      to: notificationEmail,
      replyTo: email,
      subject: `⚡ New Portfolio Message from ${name} (${email})`,
      text: plainText,
      html: htmlContent,
      priority: 'high'
    });

    return res.status(200).json({
      success: true,
      message: "Transmission confirmed! Email notification dispatched to Utkarsh's Gmail.",
      emailDispatched: true
    });
  } catch (err) {
    console.error('[Vercel Serverless Contact Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message via Vercel serverless function',
      error: err.message
    });
  }
};
