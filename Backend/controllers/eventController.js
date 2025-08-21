const Event = require('../models/Events');
const PushSubscription = require('../models/PushSubscription');
const User = require('../models/User');
const webpush = require('web-push');

// @desc    Get all upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    // Find events where the date is greater than or equal to today
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 }); // Sort by the soonest date
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new event and send notifications
exports.createEvent = async (req, res) => {
  const { title, date } = req.body;
  try {
    const newEvent = new Event({
      title,
      date,
    });
    const event = await newEvent.save();

    // --- Push Notification Logic ---
    console.log('🚀 Event created, preparing to send notifications...');

    // 1. Fetch all push subscriptions from the database
    const subscriptions = await PushSubscription.find({});
    if (subscriptions.length === 0) {
      console.log('No push subscriptions found. Skipping notifications.');
      return res.status(201).json(event);
    }

    // 2. Fetch all users to check their roles
    const users = await User.find({}).select('_id role');
    const userRoles = new Map(users.map(user => [user._id.toString(), user.role]));

    // 3. Iterate and send notifications
    subscriptions.forEach(sub => {
      const userRole = userRoles.get(sub.user.toString());

      let notificationPayload;

      // 4. Customize payload based on user role
      if (userRole === 'canteen-organizer') {
        notificationPayload = {
          title: 'Event Added Successfully! ✅',
          body: `Your new event "${event.title}" has been added to the calendar.`,
        };
      } else if (userRole === 'student') {
        notificationPayload = {
          title: '🎉 New Campus Event!',
          body: `A new event is coming up: "${event.title}"! Check it out.`,
        };
      } else {
        // Optional: Send a generic notification to other roles or skip
        return; 
      }

      console.log(`Sending notification to user ${sub.user} with role ${userRole}`);
      webpush.sendNotification(sub.subscription, JSON.stringify(notificationPayload))
        .catch(err => {
            console.error(`Error sending notification to ${sub.user}:`, err.statusCode, err.body);
            // If a subscription is expired or invalid, you might want to remove it
            if (err.statusCode === 410 || err.statusCode === 404) {
                PushSubscription.findByIdAndDelete(sub._id).then(() => console.log(`Removed invalid subscription for user ${sub.user}`));
            }
        });
    });

    res.status(201).json(event);

  } catch (err) {
    console.error('Error in createEvent:', err.message);
    res.status(500).send('Server Error');
  }
};
