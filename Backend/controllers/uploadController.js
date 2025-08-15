const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// --- Configure Cloudinary ---
// This uses the credentials you already added to your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Configure Multer Storage for Cloudinary ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ZeroBite', // This will create a 'ZeroBite' folder in your Cloudinary account
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // You can add transformations here if you want, e.g., to resize images
    // transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// --- Create the Multer upload instance ---
const upload = multer({ storage: storage });

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private (since only logged-in canteen staff can upload)
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }
    // If upload is successful, Cloudinary provides the file details in req.file
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path, // This is the secure, permanent URL of the uploaded image
    });
  } catch (error) {
    console.error('Error during image upload:', error);
    res.status(500).json({ msg: 'Server error during image upload.' });
  }
};

module.exports = {
  upload,
  uploadImage,
};
