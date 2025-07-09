const db = require('./db');

module.exports = {
  createUser: async ({ name, phone, gender, passwordHash, referralCode, inviterPhone }) => {
    const result = await db.query(
      `INSERT INTO users (name, phone, gender, password_hash, referral_code, inviter_phone, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'inactive') 
       RETURNING id, name, phone, gender, referral_code, status, created_at`,
      [name, phone, gender, passwordHash, referralCode, inviterPhone]
    );
    return result.rows[0];
  },

  findUserByPhone: async (phone) => {
    const result = await db.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0];
  },

  findUserById: async (id) => {
    const result = await db.query(
      'SELECT id, name, phone, gender, referral_code, status FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  activateUser: async (phone) => {
    const result = await db.query(
      `UPDATE users SET status = 'active' 
       WHERE phone = $1 
       RETURNING id, name, phone, gender, referral_code, status`,
      [phone]
    );
    return result.rows[0];
  },

  findUserByReferralCode: async (referralCode) => {
    const result = await db.query(
      'SELECT * FROM users WHERE referral_code = $1',
      [referralCode]
    );
    return result.rows[0];
  },
};