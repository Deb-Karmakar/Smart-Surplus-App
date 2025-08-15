const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  foodItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true,
  },
  pickupLocation: { type: String, required: true },
  dropOffLocation: { type: String, required: true },
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    // --- FIX: This now correctly references the User model ---
    ref: 'User', 
  },
  status: {
    type: String,
    enum: ['Pending', 'On the Way', 'Picked Up', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  requestedBy: { // The canteen staff who made the request
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // --- NEW FIELD: Added to record the reward ---
  pointsAwarded: {
      type: Number,
      default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', DeliverySchema);
