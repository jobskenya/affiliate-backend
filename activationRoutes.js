const express = require('express');
const router = express.Router();
const activationController = require('./activationController');
const authMiddleware = require('./authMiddleware');

// Add status check middleware
router.use(authMiddleware);

// Initiate activation payment
router.post('/activate', 
  activationController.validateActivation,
  activationController.initiateSTKPush
);

// M-Pesa callback handler
router.post('/mpesa-callback', 
  activationController.verifyCallback,
  activationController.handleMPesaCallback,
  activationController.activateUser
);

// Check activation status
router.get('/status', activationController.checkActivationStatus);

module.exports = router;
