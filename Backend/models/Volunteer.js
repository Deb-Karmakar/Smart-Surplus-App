const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  user: { // Link to the main User model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  rollNumber: { type: String, required: true },
  yearDept: { type: String, required: true },
  email: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  preferredTimes: { type: String },
  vehicleType: { type: String, default: 'On foot' },
  status: {
    type: String,
    enum: ['Available', 'Busy'],
    default: 'Available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', VolunteerSchema);
