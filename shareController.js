const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');

const logShare = async (req, res, next) => {
  try {
    const { service } = req.body;
    const amount = 50; // Ksh 50 per share

    // Update balance
    await balanceModel.updateInviteEarnings(req.user.id, amount);
    
    // Create transaction
    await transactionModel.createTransaction(
      req.user.id,
      `Shared Marketing: ${service}`,
      amount,
      'marketing'
    );

    res.json({ message: 'Share recorded successfully', amount });
  } catch (err) {
    next(err);
  }
};

module.exports = { logShare };