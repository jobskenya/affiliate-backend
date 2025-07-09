const express = require('express');
const router = express.Router();
const shareController = require('./shareController');
const authMiddleware = require('./authMiddleware');

router.post('/share', authMiddleware, shareController.logShare);

module.exports = router;