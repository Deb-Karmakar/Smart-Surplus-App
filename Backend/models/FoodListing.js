const mongoose = require('mongoose');

// A sub-document schema to track each individual claim
const ClaimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  otp: {
    type: String,
    required: true,
  },
  deliveryRequested: { type: Boolean, default: false },
  deliveryAddress: { type: String },
  deliveryStatus: {
    type: String,
    enum: ['none', 'pending', 'accepted', 'rejected'],
    default: 'none'
  },
  pickupStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  claimedAt: { type: Date, default: Date.now }
});

const FoodListingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
  },
  foodType: { type: String, required: true },
  storageCondition: { type: String, required: true },
  preparationTime: {
    type: Date,
    required: true,
  },
  expiresAt: { type: Date, required: true },
  imageUrl: { type: String },
  status: { type: String, enum: ['available', 'claimed', 'expired'], default: 'available' },
  
  // --- FIX: Renamed 'postedBy' to 'provider' to match controller logic ---
  // This is the field that links a food item to the user who created it.
  provider: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  points: { type: Number, default: 10 },
  claims: [ClaimSchema]
}, { timestamps: true });

module.exports = mongoose.model('FoodListing', FoodListingSchema);
