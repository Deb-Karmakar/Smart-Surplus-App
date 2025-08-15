const express = require('express');
const router = express.Router();
const { redeemPoints } = require('../controllers/redeemController');
const auth = require('../middleware/authMiddleware'); // Your existing auth middleware

// @route   POST /api/redeem
router.post('/', auth, redeemPoints);

module.exports = router;
