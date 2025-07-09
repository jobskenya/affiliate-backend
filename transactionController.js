const balanceModel = require('./balanceModel');
const transactionModel = require('./transactionModel');

const getBalances = async (req, res, next) => {
  try {
    const balances = await balanceModel.getBalances(req.user.id);
    res.json(balances);
  } catch (err) {
    next(err);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionModel.getTransactionsByUser(req.user.id);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

module.exports = { getBalances, getTransactions };