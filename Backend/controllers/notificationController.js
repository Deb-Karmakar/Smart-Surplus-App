const Notification = require('../models/Notification');

// @desc    Get all notifications for the logged-in user
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW: Function to mark all unread notifications as read ---
exports.markNotificationsAsRead = async (req, res) => {
    try {
        // Find all unread notifications for the current user and update them
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ msg: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
