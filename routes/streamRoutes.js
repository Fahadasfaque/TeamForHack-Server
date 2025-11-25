const express = require('express');
const router = express.Router();
const { getToken } = require('../controllers/streamController');
const { protect } = require('../middleware/authMiddleware');

router.post('/token', protect, getToken);

module.exports = router;
