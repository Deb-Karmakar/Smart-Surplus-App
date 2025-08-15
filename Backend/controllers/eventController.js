const Event = require('../models/Events');

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

// @desc    Create a new event (Admin/Organizer only)
exports.createEvent = async (req, res) => {
  const { title, date } = req.body;
  try {
    const newEvent = new Event({
      title,
      date,
    });
    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
