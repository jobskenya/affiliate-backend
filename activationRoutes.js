const express = require('express');
const router = express.Router();
const {
  validateActivation,
  initiateSTKPush,
  handleMPesaCallback,
  checkActivationStatus,
  activateUser
} = require('./activationController');
const authMiddleware = require('./authMiddleware');

// Protected routes
router.post('/activate', 
  authMiddleware,
  validateActivation,
  initiateSTKPush
);

// Public callback (MPesa hits this directly)
router.post('/mpesa-callback', 
  handleMPesaCallback
);

// Check activation status
router.get('/status', 
  authMiddleware,
  checkActivationStatus
);

// Manual activation (for testing)
router.post('/manual-activate', 
  authMiddleware,
  activateUser
);

module.exports = router;
