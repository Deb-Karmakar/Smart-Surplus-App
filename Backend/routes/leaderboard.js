const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getLeaderboard } = require('../controllers/leaderboardController');

// @route   GET /api/leaderboard
// @desc    Get the user leaderboard
// @access  Private (only logged-in users can see it)
router.get('/', auth, getLeaderboard);

module.exports = router;
