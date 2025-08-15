const Delivery = require('../models/Delivery');
const Volunteer = require('../models/Volunteer');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

// Helper function to send a push notification
const sendPushNotification = async (userId, payload) => {
    try {
        const subDoc = await PushSubscription.findOne({ user: userId });
        if (subDoc) {
            await webpush.sendNotification(subDoc.subscription, JSON.stringify(payload));
        }
    } catch (error) {
        console.error('Error sending push notification:', error.message);
    }
};

// @desc    Request a new delivery
exports.requestDelivery = async (req, res) => {
  const { foodItem, pickupLocation, dropOffLocation } = req.body;
  try {
    const availableVolunteers = await Volunteer.find({ status: 'Available' }).populate('user', 'name');
    if (availableVolunteers.length === 0) {
      return res.status(404).json({ msg: 'No available volunteers at the moment.' });
    }

    const nearestVolunteer = availableVolunteers[0]; // Simplified logic for demo

    const newDelivery = new Delivery({
      foodItem,
      pickupLocation,
      dropOffLocation,
      assignedVolunteer: nearestVolunteer._id,
      requestedBy: req.user.id,
    });
    const savedDelivery = await newDelivery.save();
    await savedDelivery.populate('foodItem', 'title');


    nearestVolunteer.status = 'Busy';
    await nearestVolunteer.save();

    const canteenStaff = await User.findById(req.user.id);

    // --- Send Push Notifications ---
    // 1. To the assigned volunteer
    await sendPushNotification(nearestVolunteer.user._id, {
        title: 'New Delivery Task!',
        body: `You've been assigned to deliver "${savedDelivery.foodItem.title}" from ${pickupLocation}.`
    });

    // 2. To the canteen staff who requested
    await sendPushNotification(req.user.id, {
        title: 'Volunteer Assigned!',
        body: `${nearestVolunteer.user.name} has been assigned to your delivery request.`
    });

    res.status(201).json({ msg: `${nearestVolunteer.user.name} has been assigned.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update the status of a delivery
exports.updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  const deliveryId = req.params.id;

  const allowedStatusUpdates = ['On the Way', 'Picked Up', 'Delivered'];
  if (!allowedStatusUpdates.includes(status)) {
    return res.status(400).json({ msg: 'Invalid status update.' });
  }

  try {
    const delivery = await Delivery.findById(deliveryId).populate('foodItem', 'title');
    if (!delivery) {
      return res.status(404).json({ msg: 'Delivery not found.' });
    }

    const volunteer = await Volunteer.findOne({ user: req.user.id });
    if (!volunteer || delivery.assignedVolunteer.toString() !== volunteer._id.toString()) {
      return res.status(403).json({ msg: 'You are not authorized to update this delivery.' });
    }

    delivery.status = status;
    await delivery.save();

    if (status === 'Delivered') {
      volunteer.status = 'Available';
      await volunteer.save();
    }

    // --- Send Push Notifications ---
    // 1. To the volunteer who updated the status
    await sendPushNotification(req.user.id, {
        title: 'Status Updated!',
        body: `Your delivery status for "${delivery.foodItem.title}" is now "${status}".`
    });

    // 2. To the canteen staff who requested the delivery
    await sendPushNotification(delivery.requestedBy, {
        title: 'Delivery Update',
        body: `The status for "${delivery.foodItem.title}" has been updated to "${status}".`
    });

    res.json(delivery);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
