const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requestDelivery, updateDeliveryStatus } = require('../controllers/deliveryController');

// @route   POST /api/deliveries/request
router.post('/request', auth, requestDelivery);

// --- NEW: Route for a volunteer to update their delivery status ---
// @route   PUT /api/deliveries/updateStatus/:id
router.put('/updateStatus/:id', auth, updateDeliveryStatus);

module.exports = router;
