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

// Enable CORS for GitHub Pages frontend
app.use(cors({
  origin: 'https://yourusername.github.io', // Replace with your GitHub Pages URL
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api', activationRoutes);
app.use('/api', transactionRoutes);
app.use('/api', shareRoutes);
app.use('/api', withdrawRoutes);

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
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;