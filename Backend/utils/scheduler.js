const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');

const startScheduler = () => {
  // This task will run every 5 minute to check for expired food
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running a job every minute to check for expired food...');
    
    try {
      const now = new Date();

      // --- FIX: Update items instead of deleting them ---
      // 1. Find all food listings that are still 'available' but have passed their expiry time.
      const result = await FoodListing.updateMany(
        { 
          expiresAt: { $lt: now },
          status: 'available' 
        },
        // 2. Set their status to 'expired'.
        { $set: { status: 'expired' } }
      );

      if (result.modifiedCount > 0) {
        console.log(`Successfully marked ${result.modifiedCount} items as expired.`);
      } else {
        console.log('No available items have expired in the last 5 minutes.');
      }
    } catch (error) {
      console.error('Error during scheduled update of expired items:', error);
    }
  });
};

module.exports = startScheduler;
