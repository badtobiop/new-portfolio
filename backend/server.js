require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const contactRouter = require('./routes/contact');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Security Headers with Helmet
app.use(helmet({
    contentSecurityPolicy: false // Allows loading CDNs (FontAwesome, DevIcon, GSAP) easily
}));

// 2. CORS Configuration
app.use(cors({
    origin: '*', // In production, replace with specific domain e.g. 'https://utkarshdhakane.dev'
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-admin-key']
}));

// 3. Body Parsing Middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Rate Limiting (Anti-Spam Bot Protection)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 submissions per IP in 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// Apply rate limiter specifically to the contact endpoint
app.use('/api/contact', contactLimiter);

// 5. API Routes
app.use('/api', contactRouter);

// 6. Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'Portfolio REST API'
    });
});

// 7. Optional: Serve frontend static files if hosted together
const frontendPath = path.resolve(__dirname, '..');
app.use(express.static(frontendPath));

// 8. 404 Not Found Middleware for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API Route ${req.originalUrl} not found.`
    });
});

// 9. Global Centralized Error Handler
app.use((err, req, res, next) => {
    console.error('💥 Unhandled Exception:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 10. Start Server
const server = app.listen(PORT, () => {
    console.log(`
=====================================================
🚀 PRO PORTFOLIO BACKEND RUNNING!
📡 URL: http://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/api/health
📩 Contact API: POST http://localhost:${PORT}/api/contact
📋 View Messages: GET http://localhost:${PORT}/api/messages?key=admin123
=====================================================
    `);
});

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Gracefully shutting down...');
    server.close(() => {
        db.close(() => {
            console.log('🔒 Database connection closed. Goodbye!');
            process.exit(0);
        });
    });
});
