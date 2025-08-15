const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUpcomingEvents, createEvent } = require('../controllers/eventController');

// @route   GET /api/events
// @desc    Get all upcoming events
// @access  Public
router.get('/', getUpcomingEvents);

// @route   POST /api/events
// @desc    Create a new event
// @access  Private (you can add role checks here later)
router.post('/', auth, createEvent);

module.exports = router;
