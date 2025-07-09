const express = require('express');
const router = express.Router();
const activationController = require('./activationController');
const authMiddleware = require('./authMiddleware');

router.post('/activate', authMiddleware, activationController.initiateSTKPush);
router.post('/mpesa-callback', activationController.handleMPesaCallback);

module.exports = router;