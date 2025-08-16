const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    getMyNotifications, 
    markNotificationsAsRead,
    deleteNotification,      // <-- 1. IMPORT THE NEW FUNCTIONS
    deleteAllNotifications 
} = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get my notifications
router.get('/', auth, getMyNotifications);

// @route   POST /api/notifications/mark-read
// @desc    Mark all user's notifications as read
// @access  Private
router.post('/mark-read', auth, markNotificationsAsRead);

// --- 2. ADD THE NEW ROUTES FOR DELETING NOTIFICATIONS ---

// @route   DELETE /api/notifications/all
// @desc    Delete all notifications for the logged-in user
// @access  Private
router.delete('/all', auth, deleteAllNotifications);

// @route   DELETE /api/notifications/:id
// @desc    Delete a single notification by its ID
// @access  Private
router.delete('/:id', auth, deleteNotification);


module.exports = router;
