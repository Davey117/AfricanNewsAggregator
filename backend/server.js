// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); // Import standard rate-limiter module

// Service & Router Modules imports
const { initScheduler } = require('./services/scheduler');
const articleRouter = require('./routes/articleRoutes'); // Import V1 routes
const authRouter = require('./routes/authRoutes');
const feedRouter = require('./routes/feedRoutes'); // Import the feed administration router module

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. ASSEMBLE LAYERED MIDDLEWARE PIPELINE
app.use(helmet()); // Secure domain header security policies
app.use(cors()); // Configure Cross-Origin access rules cleanly
app.use(morgan('dev')); // Stream traffic logs output down to terminal layouts
app.use(express.json()); // Parse processing incoming payload payloads cleanly

// Instantiate customized Rate-Limiter configuration profile
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window boundary
  max: 100, // Access threshold limit cap per unique IP address
  standardHeaders: true, // Return rate limit info in the Content-Type response headers
  legacyHeaders: false, // Disable the X-RateLimit-* legacy header structures
  message: {
    status: 'fail',
    message: 'Too many requests generated from this network layout block, try again in 15 minutes.'
  }
});

// Apply rate limiter strictly onto our version 1 endpoint roots BEFORE mounting routes
app.use('/api/v1', apiRateLimiter);

// 2. SYSTEM ROUTING GATEWAYS MOUNTING
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/feed', feedRouter); // Private gateway router block mounted directly
app.use('/api/v1/articles', articleRouter); // Register V1 collection path routes

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy', environment: NODE_ENV, timestamp: new Date() });
});

// 3. DATABASE CONNECTION & LIFECYCLE SEED
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[CRITICAL ERROR] MONGODB_URI is missing from your .env file!');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[DATABASE SUCCESS] Connected securely to cloud MongoDB Atlas cluster.');
    initScheduler(); // Ground automated parsing schedules safely
  })
  .catch((error) => {
    console.error('[DATABASE CRASH] Connection dropped! Details:', error.message);
    process.exit(1);
  });

// Single Unified Production Listener
app.listen(PORT, () => {
  console.log(`[SERVER ACTIVE] Operational on production port: ${PORT} in ${NODE_ENV} mode`);
});