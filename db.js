const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false // Required for Neon
  }
});

// Test connection immediately
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch(err => console.error('❌ Neon connection error:', err));

module.exports = pool;
