const mongoose = require('mongoose');

const PushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String,
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('PushSubscription', PushSubscriptionSchema);
