// models/Booking.js

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the User model, assuming NGOs are users
    required: true,
  },
  foodListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing', // Refers to the specific food item
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);