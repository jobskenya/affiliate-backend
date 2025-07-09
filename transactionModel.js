const db = require('./db');

module.exports = {
  createTransaction: async (userId, title, amount, type) => {
    const result = await db.query(
      `INSERT INTO transactions (user_id, title, amount, type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, title, amount, type]
    );
    return result.rows[0];
  },

  getTransactionsByUser: async (userId) => {
    const result = await db.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },
};