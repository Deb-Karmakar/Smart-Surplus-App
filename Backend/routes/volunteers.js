const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
    registerVolunteer,
    getMyVolunteerProfile,
    updateVolunteerStatus,
    getMyDeliveryTasks,
    getAllVolunteers // <-- IMPORT THE NEW FUNCTION
} = require('../controllers/volunteerController');

// @route   GET /api/volunteers
// @desc    Get all volunteers (Canteen Staff only)
// @access  Private
router.get('/', auth, getAllVolunteers); // <-- ADD THIS NEW ROUTE

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