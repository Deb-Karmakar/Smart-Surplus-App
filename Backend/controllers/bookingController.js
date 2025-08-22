const Booking = require('../models/Booking');
const FoodListing = require('../models/FoodListing');
const mongoose = require('mongoose');

// @desc    Create a new booking (claim food)
// @route   POST /api/bookings
// @access  Private (NGOs only)
exports.createBooking = async (req, res) => {
  // --- SECURITY CHECK ADDED ---
  // Ensure the user has the 'ngo' role before proceeding.
  if (req.user.role !== 'ngo') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only NGOs are authorized to book food deliveries.' 
    });
  }
  // ------------------------------

  const { foodListingId, quantity } = req.body;
  const ngoId = req.user.id;

  if (!ngoId) {
    return res.status(401).json({ success: false, message: 'User not authenticated.' });
  }

  try {
    const food = await FoodListing.findById(foodListingId);
    if (!food) {
        return res.status(404).json({ success: false, message: 'Food listing not found.' });
    }

    const booking = new Booking({
      ngo: ngoId,
      foodListing: foodListingId,
      quantity,
    });
    
    await booking.save();

    // Populate the new booking with details before sending it back
    const populatedBooking = await Booking.findById(booking._id)
      .populate({
        path: 'foodListing',
        model: 'FoodListing',
        populate: {
          path: 'provider',
          model: 'User',
          select: 'name',
        },
      });

    res.status(201).json({ success: true, data: populatedBooking });

  } catch (error) {
    console.error("Booking creation failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};


// @desc    Get all bookings for the logged-in NGO
// @route   GET /api/bookings/mybookings
// @access  Private (NGOs only)
exports.getMyBookings = async (req, res) => {
  try {
    // --- SECURITY NOTE ---
    // This route is already implicitly secure for NGOs because the logic
    // fetches bookings based on the logged-in user's ID (`req.user.id`).
    // An explicit role check could be added for extra security, but is not
    // strictly necessary here.

    const bookings = await Booking.find({ ngo: req.user.id })
      .populate({
        path: 'foodListing',
        model: 'FoodListing',
        populate: {
          path: 'provider',
          model: 'User',
          select: 'name'
        }
      })
      .sort({ bookedAt: -1 });

    // Filter out bookings where the associated food listing might have been deleted
    const validBookings = bookings.filter(booking => booking.foodListing !== null);

    res.status(200).json({ success: true, data: validBookings });
  } catch (error) {
    console.error("Error fetching NGO bookings:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};