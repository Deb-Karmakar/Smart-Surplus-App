const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');

const startScheduler = () => {
  // This task will run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running a job every 5 minutes to check for expired food...');
    
    try {
      // Calculate the time 10 minutes ago
      const tenMinutesAgo = new Date(new Date().getTime() - 10 * 60 * 1000);

      // Find all food listings that expired more than 10 minutes ago
      const expiredListings = await FoodListing.find({
        expiresAt: { $lt: tenMinutesAgo }
      });

      if (expiredListings.length > 0) {
        const idsToDelete = expiredListings.map(item => item._id);
        console.log(`Found ${idsToDelete.length} expired items to delete.`);
        
        // Delete the expired items from the database
        await FoodListing.deleteMany({ _id: { $in: idsToDelete } });
        
        console.log('Successfully deleted expired items.');
      } else {
        console.log('No expired items found to delete.');
      }
    } catch (error) {
      console.error('Error during scheduled deletion of expired items:', error);
    }
  });
};

module.exports = startScheduler;
