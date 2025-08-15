const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'canteen-organizer', 'ngo'],
    default: 'student',
  },
  points: {
    type: Number,
    default: 0,
  },
  level: { type: Number, default: 1 },
  title: { type: String, default: 'Food Saver' },
  badges: { type: [String], default: [] },
  weeklyChallenge: {
    title: { type: String, default: 'Claim 5 Food Items' },
    progress: { type: Number, default: 0 },
    goal: { type: Number, default: 5 },
    reward: { type: Number, default: 200 },
  },
  impactStats: {
    mealsSaved: { type: Number, default: 0 },
    co2Prevented: { type: String, default: '0 kg' },
    waterSaved: { type: String, default: '0 L' },
  }
}, { timestamps: true });

// --- FIX: This is the standard and correct way to export a Mongoose model ---
module.exports = mongoose.model('User', UserSchema);
