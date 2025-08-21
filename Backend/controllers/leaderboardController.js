const User = require('../models/User');

// @desc    Get top student users for the leaderboard
// @route   GET /api/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    // 1. Find users who are 'students'
    // 2. Select only their name and points
    // 3. Sort them by points in descending order (highest first)
    // 4. Limit the results to the top 100 users
    const leaderboard = await User.find({ role: 'student' })
      .select('name points')
      .sort({ points: -1 })
      .limit(100);

    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
