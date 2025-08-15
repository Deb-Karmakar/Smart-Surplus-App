const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const Booking = require('../models/Booking');

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Helper function to send a push notification
const sendPushNotification = async (userId, payload) => {
    try {
        const subDoc = await PushSubscription.findOne({ user: userId });
        if (subDoc && subDoc.subscription) {
            await webpush.sendNotification(subDoc.subscription, JSON.stringify(payload));
        }
    } catch (error) {
        console.error('Error sending push notification:', error.message);
        if (error.statusCode === 410) {
            await PushSubscription.deleteOne({ user: userId });
        }
    }
};

// getFoodListings function...
exports.getFoodListings = async (req, res) => {
  try {
    const listings = await FoodListing.find({ status: 'available' })
      .populate('provider', 'name')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// addFoodListing function...
exports.addFoodListing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'canteen-organizer') {
        return res.status(403).json({ msg: 'User not authorized to add listings' });
    }
    const newListing = new FoodListing({
      ...req.body,
      provider: req.user.id,
    });
    const listing = await newListing.save();

    const studentsAndNgos = await User.find({ role: { $in: ['student', 'ngo'] } });
    const inAppNotifications = studentsAndNgos.map(recipient => ({
        user: recipient._id,
        type: 'new_listing',
        message: `New food available: "${listing.title}" from ${listing.source}.`,
        relatedListing: listing._id,
    }));

    if (inAppNotifications.length > 0) {
        await Notification.insertMany(inAppNotifications);
    }

    const pushPayload = {
        title: 'New Food Available!',
        body: `"${listing.title}" from ${listing.source} is now available.`,
    };
    const pushPromises = studentsAndNgos.map(recipient => sendPushNotification(recipient._id, pushPayload));
    await Promise.all(pushPromises);
    
    res.status(201).json(listing);
  } catch (err) {
    console.error("Error in addFoodListing:", err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Request to claim a food item
exports.claimFood = async (req, res) => {
  const { quantityToClaim, deliveryDetails } = req.body;
  const foodId = req.params.id;
  const userId = req.user.id;

  try {
    const listing = await FoodListing.findById(foodId);
    if (!listing || listing.status !== 'available' || listing.quantity < quantityToClaim) {
      return res.status(400).json({ msg: 'Item not available in the requested quantity.' });
    }

    const claimingUser = await User.findById(userId);
    if (!claimingUser) {
        return res.status(404).json({ msg: 'Claiming user not found.' });
    }

    const providerId = listing.provider || listing.postedBy;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const newClaim = {
        user: userId,
        quantity: quantityToClaim,
        otp,
        deliveryRequested: deliveryDetails.deliveryRequested,
        deliveryAddress: deliveryDetails.deliveryAddress,
        deliveryStatus: deliveryDetails.deliveryRequested ? 'pending' : 'none',
        pickupStatus: 'pending',
    };

    const updateOperation = { $push: { claims: newClaim } };

    if (claimingUser.role === 'ngo') {
        updateOperation.$inc = { quantity: -quantityToClaim };
        const newBooking = new Booking({
            ngo: userId,
            foodListing: foodId,
            quantity: quantityToClaim,
        });
        await newBooking.save();
    }
    
    await FoodListing.updateOne({ _id: foodId }, updateOperation);
    
    const updatedListing = await FoodListing.findById(foodId);
    const claimId = updatedListing.claims[updatedListing.claims.length - 1]._id;

    const claimantMessage = `Your OTP for "${updatedListing.title}" is ${otp}.`;
    await new Notification({ user: userId, type: 'claim_student', message: claimantMessage, relatedListing: foodId }).save();
    await sendPushNotification(userId, { title: 'Your OTP Code', body: claimantMessage });

    if (providerId) {
        if (deliveryDetails && deliveryDetails.deliveryRequested) {
            const staffMessage = `${claimingUser.name} has requested delivery for ${quantityToClaim} of "${updatedListing.title}" to: ${deliveryDetails.deliveryAddress}`;
            await new Notification({ user: providerId, type: 'delivery_request', message: staffMessage, relatedListing: foodId, relatedClaimId: claimId }).save();
            await sendPushNotification(providerId, { title: 'New Delivery Request', body: staffMessage });
        } else {
            const staffMessage = `Did ${claimingUser.name} pick up ${quantityToClaim} of "${updatedListing.title}"? Confirm with OTP.`;
            await new Notification({ user: providerId, type: 'pickup_confirmation', message: staffMessage, relatedListing: foodId, relatedClaimId: claimId }).save();
            await sendPushNotification(providerId, { title: 'New Pickup Request', body: staffMessage });
        }
    } else {
        console.log(`⚠️ Provider ID could not be determined for listing ID ${foodId}. Skipping provider notification.`);
    }

    res.json(updatedListing);
  } catch (err) {
    console.error('Error in claimFood:', err.message);
    res.status(500).send('Server Error');
  }
};

// Other functions (respondToDelivery, confirmPickup, etc.)
exports.respondToDelivery = async (req, res) => {
    const { claimId } = req.params;
    const { response } = req.body;

    try {
        const updateResult = await FoodListing.updateOne(
            { "claims._id": claimId },
            { $set: { "claims.$.deliveryStatus": response } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ msg: 'Claim not found' });
        }

        const listing = await FoodListing.findOne({ "claims._id": claimId });
        const providerId = listing.provider || listing.postedBy;
        if (!listing || !providerId) return res.status(404).json({ msg: 'Claim or provider not found' });

        const claim = listing.claims.id(claimId);
        const student = await User.findById(claim.user);
        const studentMessage = response === 'accepted'
            ? `Your delivery request for "${listing.title}" has been accepted!`
            : `Your delivery for "${listing.title}" was not possible. Please pick it up yourself.`;
        
        await new Notification({ user: claim.user, type: response === 'accepted' ? 'delivery_accepted' : 'delivery_rejected', message: studentMessage, relatedListing: listing._id }).save();
        await sendPushNotification(claim.user, { title: 'Delivery Update', body: studentMessage });

        const staffMessage = `Did ${student.name} receive ${claim.quantity} of "${listing.title}"? Confirm with OTP.`;
        await new Notification({ user: providerId, type: 'pickup_confirmation', message: staffMessage, relatedListing: listing._id, relatedClaimId: claimId }).save();
        await sendPushNotification(providerId, { title: 'Confirm Pickup', body: staffMessage });

        await Notification.findOneAndDelete({ relatedClaimId: claimId, type: 'delivery_request' });

        res.json(listing);
    } catch (err) {
        console.error('Error in respondToDelivery:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.confirmPickup = async (req, res) => {
    const { claimId } = req.params;
    const { otp } = req.body;

    try {
        const listing = await FoodListing.findOne({ "claims._id": claimId });
        if (!listing) return res.status(404).json({ msg: 'Claim not found' });

        const claim = listing.claims.id(claimId);
        if (!claim) return res.status(404).json({ msg: 'Claim details not found' });

        if (claim.otp !== otp) {
            return res.status(400).json({ msg: 'Incorrect OTP.' });
        }
        if (claim.pickupStatus === 'confirmed') {
            return res.status(400).json({ msg: 'This pickup has already been confirmed.' });
        }

        const newQuantity = listing.quantity - claim.quantity;
        const newStatus = newQuantity <= 0 ? 'claimed' : listing.status;

        await FoodListing.updateOne(
            { "claims._id": claimId },
            { 
                $set: { 
                    "claims.$.pickupStatus": "confirmed",
                },
                ...( (await User.findById(claim.user))?.role !== 'ngo' && { $set: { quantity: newQuantity } } ),
                ...(newStatus === 'claimed' && { $set: { status: newStatus } })
            }
        );

        const userWhoClaimed = await User.findById(claim.user);
        userWhoClaimed.points += (listing.points || 5) * claim.quantity;
        if (userWhoClaimed.weeklyChallenge && userWhoClaimed.weeklyChallenge.progress < userWhoClaimed.weeklyChallenge.goal) {
            userWhoClaimed.weeklyChallenge.progress += 1;
        }
        await userWhoClaimed.save();

        await Notification.findOneAndDelete({ relatedClaimId: claimId, type: 'pickup_confirmation' });

        res.json({ msg: 'Pickup confirmed successfully!' });
    } catch (err) {
        console.error('Error in confirmPickup:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMyClaimedListings = async (req, res) => {
  try {
    const claimedListings = await FoodListing.find({ 'claims.user': req.user.id })
      .sort({ updatedAt: -1 });
    res.json(claimedListings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- NEW FUNCTION TO GET ALL ITEMS POSTED BY AN ORGANIZER ---
// @desc    Get all food listings posted by the logged-in organizer
// @route   GET /api/food/my-listings
// @access  Private (Canteen Organizers)
// --- IMPROVED BACKEND FUNCTION FOR GETTING ORGANIZER'S LISTINGS ---
// Add this to your foodController.js

exports.getMyListings = async (req, res) => {
    try {
        console.log('getMyListings called for user:', req.user.id); // Debug log
        
        // Find all listings where the provider is the logged-in user
        const listings = await FoodListing.find({ provider: req.user.id })
            .populate('provider', 'name email') // Populate provider details
            .sort({ createdAt: -1 }); // Sort by newest first
        
        console.log(`Found ${listings.length} listings for user ${req.user.id}`); // Debug log
        
        // Add some debugging info to each listing
        const listingsWithDebugInfo = listings.map(listing => {
            const confirmedClaims = listing.claims ? listing.claims.filter(claim => claim.pickupStatus === 'confirmed') : [];
            console.log(`Listing ${listing.title}: ${listing.claims?.length || 0} total claims, ${confirmedClaims.length} confirmed`);
            
            return {
                ...listing.toObject(),
                debugInfo: {
                    totalClaims: listing.claims?.length || 0,
                    confirmedClaims: confirmedClaims.length,
                    pendingClaims: listing.claims ? listing.claims.filter(claim => claim.pickupStatus === 'pending').length : 0
                }
            };
        });
        
        res.json(listingsWithDebugInfo);
        
    } catch (err) {
        console.error('Error in getMyListings:', err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error',
            error: err.message 
        });
    }
};