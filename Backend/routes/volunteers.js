const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    registerVolunteer,
    getMyVolunteerProfile,
    updateVolunteerStatus,
    getMyDeliveryTasks
} = require('../controllers/volunteerController');

// @route   POST /api/volunteers/register
router.post('/register', auth, registerVolunteer);

// @route   GET /api/volunteers/me
// @desc    Get my volunteer profile
router.get('/me', auth, getMyVolunteerProfile);

// @route   PUT /api/volunteers/status
// @desc    Update my availability status
router.put('/status', auth, updateVolunteerStatus);

// @route   GET /api/volunteers/tasks
// @desc    Get my assigned delivery tasks
router.get('/tasks', auth, getMyDeliveryTasks);

module.exports = router;
