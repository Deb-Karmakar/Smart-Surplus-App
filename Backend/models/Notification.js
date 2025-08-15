const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: {
    type: String,
    // --- FIX: Added all required notification types to this list ---
    enum: [
      'new_listing',        // For when new food is added
      'claim_student',      // For the OTP sent to a student/NGO
      'delivery_request',   // For a new delivery request to canteen
      'delivery_accepted',  // For when delivery is accepted
      'delivery_rejected',  // For when delivery is rejected
      'pickup_confirmation' // For the canteen staff to confirm a pickup
    ],
    required: true,
  },
  relatedListing: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FoodListing' 
  },
  relatedClaimId: { 
    type: String 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
