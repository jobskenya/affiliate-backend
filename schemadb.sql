-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  gender VARCHAR(10) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  inviter_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Balances table
CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_balance DECIMAL(12, 2) DEFAULT 0,
  deposit_balance DECIMAL(12, 2) DEFAULT 0,
  withdrawn DECIMAL(12, 2) DEFAULT 0,
  invite_earnings DECIMAL(12, 2) DEFAULT 0,
  UNIQUE(user_id)
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);