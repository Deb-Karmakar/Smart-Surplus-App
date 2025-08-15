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
    ref: 'Volunteer',
  },
  status: {
    type: String,
    enum: ['Pending', 'On the Way', 'Picked Up', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  // --- FIX: Use a consistent field name ---
  requestedBy: { // The canteen staff who made the request
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', DeliverySchema);
