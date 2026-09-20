const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const path = require('path');
const { saveMessage, getMessages } = require('../db');

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Creates dynamic Nodemailer transporter using current environment variables
 */
function getTransporter() {
    try {
        require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
    } catch (e) {}

    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';
    if (user && pass && pass !== 'PASTE_YOUR_16_DIGIT_GMAIL_APP_PASSWORD_HERE' && pass !== 'your_app_password') {
        return nodemailer.createTransport({
            service: process.env.SMTP_SERVICE || 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });
    }
    return null;
}

/**
 * POST /api/contact
 * Handles contact form submissions, saves to SQLite, and dispatches email via Gmail SMTP
 */
router.post('/contact', async (req, res) => {
    try {
        let { name, email, message } = req.body;

        // 1. Sanitize & trim inputs
        name = (name || '').trim();
        email = (email || '').trim().toLowerCase();
        message = (message || '').trim();

        // 2. Validate inputs
        const errors = [];
        if (!name || name.length < 2) {
            errors.push('Name must be at least 2 characters long.');
        }
        if (!email || !EMAIL_REGEX.test(email)) {
            errors.push('Please provide a valid email address.');
        }
        if (!message || message.length < 5) {
            errors.push('Message must be at least 5 characters long.');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors
            });
        }

        // 3. Extract client IP address
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // 4. Save message to SQLite database (Security Guarantee: Message is NEVER lost)
        const savedRecord = await saveMessage(name, email, message, ip);
        console.log(`[DB] New message saved from ${name} (${email}) [ID: ${savedRecord.id}]`);

        // 5. Send Gmail Notification Alert
        const transporter = getTransporter();
        let emailSent = false;
        let emailError = null;

        if (transporter && process.env.NOTIFICATION_EMAIL) {
            try {
                const plainText = `New Portfolio Transmission Received!\n\nSender Name: ${name}\nSender Email: ${email}\nClient IP: ${ip}\nDate: ${new Date().toLocaleString()}\n\nMessage / Project Details:\n${message}\n\nReply directly to: ${email}`;

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
                        <p style="margin: 0; font-size: 13px; color: #999999;">
                            <strong>Client IP:</strong> ${ip}
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

                const info = await transporter.sendMail({
                    from: `"Utkarsh Portfolio" <${process.env.SMTP_USER}>`,
                    to: process.env.NOTIFICATION_EMAIL,
                    replyTo: email,
                    subject: `⚡ New Message from ${name} (${email})`,
                    text: plainText,
                    html: htmlContent,
                    priority: 'high',
                    headers: {
                        'X-Priority': '1',
                        'X-MSMail-Priority': 'High',
                        'Importance': 'high'
                    }
                });

                console.log(`[Gmail Alert] Notification dispatched to ${process.env.NOTIFICATION_EMAIL} [MessageId: ${info.messageId}]`);
                emailSent = true;
            } catch (mailErr) {
                console.error('[Gmail Error] Could not send alert via SMTP:', mailErr.message);
                emailError = mailErr.message;
            }
        } else {
            console.log('[Notice] Nodemailer transporter awaiting 16-digit App Password in .env');
        }

        // 6. Return response to frontend
        return res.status(201).json({
            success: true,
            message: emailSent 
                ? "Transmission confirmed! Email notification dispatched to Utkarsh's Gmail." 
                : 'Message saved securely in database! (Awaiting SMTP credentials in .env)',
            emailDispatched: emailSent,
            emailError: emailError,
            data: {
                id: savedRecord.id,
                name: savedRecord.name,
                created_at: savedRecord.created_at
            }
        });
    } catch (err) {
        console.error('[Error] Contact submission failure:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred while processing your message.'
        });
    }
});

/**
 * GET /api/messages
 * Retrieve messages list (Protected with an Admin API Key)
 */
router.get('/messages', async (req, res) => {
    try {
        const adminKey = req.headers['x-admin-key'] || req.query.key;
        const configuredKey = process.env.ADMIN_SECRET_KEY || 'badtobiop';

        if (adminKey !== configuredKey) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid admin key. Provide ?key=badtobiop or x-admin-key header.'
            });
        }

        const messages = await getMessages(100);
        return res.json({
            success: true,
            count: messages.length,
            messages: messages
        });
    } catch (err) {
        console.error('[Error] Fetching messages:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve messages.'
        });
    }
});

module.exports = router;
