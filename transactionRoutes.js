const express = require('express');
const router = express.Router();
const transactionController = require('./transactionController');
const authMiddleware = require('.authMiddleware');

router.get('/balances', authMiddleware, transactionController.getBalances);
router.get('/transactions', authMiddleware, transactionController.getTransactions);

module.exports = router;