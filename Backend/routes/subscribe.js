const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const auth = require('../middleware/authMiddleware');
const PushSubscription = require('../models/PushSubscription');

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:debkarma97@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// @route   POST /api/subscribe
// @desc    Subscribe a user to push notifications
// @access  Private
router.post('/', auth, async (req, res) => {
  const { subscription } = req.body;
  
  console.log('=== SUBSCRIPTION REQUEST DEBUG ===');
  console.log('User ID from token:', req.user.id);
  console.log('Subscription object received:', JSON.stringify(subscription, null, 2));
  
  try {
    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({ user: req.user.id });
    console.log('Existing subscription found:', existingSubscription ? 'Yes' : 'No');
    
    // Store the subscription in the database
    const savedSubscription = await PushSubscription.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, subscription },
      { upsert: true, new: true } // Return the updated document
    );
    
    console.log('Subscription saved successfully:', savedSubscription._id);
    console.log('Saved for user:', savedSubscription.user);
    
    res.status(201).json({ 
      msg: 'Subscription saved.',
      subscriptionId: savedSubscription._id,
      userId: savedSubscription.user
    });
  } catch (err) {
    console.error('Error saving subscription:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: 'Server Error', details: err.message });
  }
});

module.exports = router;