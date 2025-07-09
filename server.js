const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

// Route files
const authRoutes = require('./authRoutes');
const activationRoutes = require('./activationRoutes');
const transactionRoutes = require('./transactionRoutes');
const shareRoutes = require('./shareRoutes');
const withdrawRoutes = require('./withdrawRoutes');

// Middleware
const errorHandler = require('./errorHandler');

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  'https://yourusername.github.io', // Your GitHub Pages
  'http://localhost:3000',          // Local development
  'https://your-custom-domain.com'  // If you have one
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-auth-token',
    'x-requested-with'
  ],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10kb' })); // Security: Limit payload size

// Security middleware
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/activate', activationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/withdraw', withdrawRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handler middleware
app.use(errorHandler);

// Test DB connection
db.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Database connected');
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${err}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
