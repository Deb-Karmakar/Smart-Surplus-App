const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getMyNotifications, markNotificationsAsRead } = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get my notifications
router.get('/', auth, getMyNotifications);

// --- NEW: Route to mark notifications as read ---
// @route   POST /api/notifications/mark-read
// @desc    Mark all user's notifications as read
// @access  Private
router.post('/mark-read', auth, markNotificationsAsRead);

module.exports = router;
