const Volunteer = require('../models/Volunteer');
const Delivery = require('../models/Delivery');
const User = require('../models/User'); // Added to check the user's role

// @desc    Register the current user as a volunteer
exports.registerVolunteer = async (req, res) => {
  try {
    const existingVolunteer = await Volunteer.findOne({ user: req.user.id });
    if (existingVolunteer) {
      return res.status(400).json({ msg: 'You are already registered.' });
    }
    const newVolunteer = new Volunteer({ ...req.body, user: req.user.id });
    await newVolunteer.save();
    res.status(201).json(newVolunteer);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION ADDED ---
// @desc    Get all registered volunteers (for Canteen Staff)
// @access  Private (canteen-organizer only)
exports.getAllVolunteers = async (req, res) => {
    try {
        // First, check the role of the user making the request
        const requestingUser = await User.findById(req.user.id).select('role');
        if (!requestingUser || requestingUser.role !== 'canteen-organizer') {
            return res.status(403).json({ msg: 'Access denied. Not authorized.' });
        }

        // If authorized, fetch all volunteers, sorting 'Available' ones first
        const volunteers = await Volunteer.find().sort({ status: 1 });
        res.json(volunteers);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get the volunteer profile for the logged-in user
exports.getMyVolunteerProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ user: req.user.id });
        if (!volunteer) {
            return res.status(404).json({ msg: 'Volunteer profile not found.' });
        }
        res.json(volunteer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a volunteer's availability status
exports.updateVolunteerStatus = async (req, res) => {
    const { status } = req.body;
    if (!['Available', 'Busy'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status.' });
    }
    try {
        const volunteer = await Volunteer.findOneAndUpdate(
            { user: req.user.id },
            { $set: { status: status } },
            { new: true }
        );
        if (!volunteer) {
            return res.status(404).json({ msg: 'Volunteer profile not found.' });
        }
        res.json(volunteer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get assigned (but not delivered) tasks for a volunteer
exports.getMyDeliveryTasks = async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ user: req.user.id });
        if (!volunteer) {
            return res.status(404).json({ msg: 'Volunteer profile not found.' });
        }
        const tasks = await Delivery.find({
            assignedVolunteer: volunteer._id,
            status: { $ne: 'Delivered' } // Find tasks that are not yet delivered
        }).populate('foodItem', 'title source');
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};