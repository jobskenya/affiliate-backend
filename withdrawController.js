const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');

const processWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const minWithdrawal = 5000;

    // Get current balance
    const balance = await balanceModel.getBalances(userId);

    // Validate withdrawal
    if (amount < minWithdrawal) {
      return res.status(400).json({ 
        message: `Minimum withdrawal amount is Ksh ${minWithdrawal}` 
      });
    }

    if (amount > balance.total_balance) {
      return res.status(400).json({ 
        message: 'Insufficient balance for withdrawal' 
      });
    }

    // Update balance
    await balanceModel.updateWithdrawnBalance(userId, amount);
    
    // Create transaction
    await transactionModel.createTransaction(
      userId,
      'Withdrawal Request',
      amount,
      'withdraw'
    );

    // Generate WhatsApp link (frontend will handle this)
    const user = await userModel.findUserById(userId);
    const whatsappLink = `https://api.whatsapp.com/send?phone=+254104718105&text=Please%20allow%20my%20withdrawal%20of%20Ksh.${amount}%20for%20user%20${user.name}`;

    res.json({ 
      message: 'Withdrawal request submitted successfully',
      whatsappLink 
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { processWithdrawal };