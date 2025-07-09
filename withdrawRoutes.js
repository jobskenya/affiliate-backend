const express = require('express');
const router = express.Router();
const withdrawController = require('./withdrawController');
const authMiddleware = require('./authMiddleware');

router.patch('/withdraw', authMiddleware, withdrawController.processWithdrawal);

module.exports = router;