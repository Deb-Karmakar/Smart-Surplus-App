const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings } = require('../controllers/bookingController');

// --- FIX ---
// Import your middleware directly. Since your file exports a single function,
// we can assign it to a variable like 'auth'.
const auth = require('../middleware/authMiddleware');

// @route   POST /api/bookings
// @desc    Create a new booking (claim food)
// @access  Private (NGOs only)
// Apply the 'auth' middleware directly to the route.
router.post('/', auth, createBooking);

// @route   GET /api/bookings/mybookings
// @desc    Get all bookings for the logged-in NGO
// @access  Private (NGOs only)
// Apply the 'auth' middleware directly to the route.
router.get('/mybookings', auth, getMyBookings);


module.exports = router;
