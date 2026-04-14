'use strict';

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const routes       = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const AppError     = require('./utils/AppError');

const app = express();

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Support a comma-separated list of allowed origins for multi-app setups
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or from allowed list
      // Use cb(null, false) — NOT cb(new Error()) — so rejected origins get a CORS
      // error in the browser rather than an Express 500.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Request logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Global rate limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.all('*', (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});

// ─── Central error handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
