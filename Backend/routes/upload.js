const express = require('express');
const router = express.Router();
const { upload, uploadImage } = require('../controllers/uploadController');
const auth = require('../middleware/authMiddleware'); // Your existing auth middleware

// @route   POST /api/upload
// This route is protected, so only logged-in users can access it.
// `upload.single('image')` is the middleware that handles the actual file upload.
// 'image' must match the field name used on the frontend.
router.post('/', auth, upload.single('image'), uploadImage);

module.exports = router;
