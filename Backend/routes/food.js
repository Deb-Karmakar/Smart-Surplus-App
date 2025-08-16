const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const {
  getFoodListings,
  addFoodListing,
  claimFood,
  getMyClaimedListings,
  respondToDelivery,
  confirmPickup,
  getMyListings,
  cancelPickup,
  getPendingPickups // <-- ADD THIS LINE
} = require('../controllers/foodController');
// @route   GET /api/food
// @desc    Get all available food listings
// @access  Public
router.get('/', getFoodListings);

// @route   POST /api/food
// @desc    Add a new food listing
// @access  Private
router.post('/', auth, addFoodListing);

// @route   PUT /api/food/claim/:id
// @desc    Claim a food item
// @access  Private
router.put('/claim/:id', auth, claimFood);

// @route   GET /api/food/myclaims
// @desc    Get all food listings claimed by the user
// @access  Private
router.get('/myclaims', auth, getMyClaimedListings);

// @route   PUT /api/food/delivery-response/:claimId
// @desc    Accept or reject a delivery request
// @access  Private
router.put('/delivery-response/:claimId', auth, respondToDelivery);

// @route   PUT /api/food/confirm-pickup/:claimId
// @desc    Confirm a student has picked up the food with OTP
// @access  Private
router.put('/confirm-pickup/:claimId', auth, confirmPickup);

// @route   GET /api/food/my-listings
// @desc    Get all listings for the logged-in canteen organizer
// @access  Private
router.get('/my-listings', auth, getMyListings);

// --- 2. ADD THE NEW ROUTE FOR CANCELLING A PICKUP ---
// @route   PUT /api/food/cancel-pickup/:claimId
// @desc    Cancel a pending pickup request
// @access  Private
router.put('/cancel-pickup/:claimId', auth, cancelPickup);

// Add this to your routes/food.js file

// @route   GET /api/food/pending-pickups
// @desc    Get all pending claims for the logged-in canteen organizer
// @access  Private
router.get('/pending-pickups', auth, getPendingPickups);

module.exports = router;
