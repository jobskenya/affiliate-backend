const db = require('./db');

module.exports = {
  createBalance: async (userId) => {
    await db.query(
      'INSERT INTO balances (user_id, total_balance, deposit_balance, withdrawn, invite_earnings) VALUES ($1, 0, 0, 0, 0)',
      [userId]
    );
  },

  getBalances: async (userId) => {
    const result = await db.query(
      'SELECT * FROM balances WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  },

  updateDepositBalance: async (userId, amount) => {
    await db.query(
      `UPDATE balances 
       SET deposit_balance = deposit_balance + $1,
           total_balance = total_balance + $1
       WHERE user_id = $2`,
      [amount, userId]
    );
  },

  updateInviteEarnings: async (userId, amount) => {
    await db.query(
      `UPDATE balances 
       SET invite_earnings = invite_earnings + $1,
           total_balance = total_balance + $1
       WHERE user_id = $2`,
      [amount, userId]
    );
  },

  updateWithdrawnBalance: async (userId, amount) => {
    await db.query(
      `UPDATE balances 
       SET withdrawn = withdrawn + $1,
           total_balance = total_balance - $1
       WHERE user_id = $2`,
      [amount, userId]
    );
  },
};