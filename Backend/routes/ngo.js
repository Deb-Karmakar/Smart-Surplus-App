const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { findNearbyNGOs } = require('../controllers/ngoController');

// @route   GET /api/ngo/nearby
// @desc    Find NGOs near a given location
// @access  Private
router.get('/nearby', auth, findNearbyNGOs);

module.exports = router;