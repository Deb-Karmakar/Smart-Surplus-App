const mongoose = require('mongoose');

const RedemptionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pointsRedeemed: {
    type: Number,
    required: true,
  },
  cashbackAmount: {
    type: Number,
    required: true,
  },
  redeemedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Redemption', RedemptionSchema);
