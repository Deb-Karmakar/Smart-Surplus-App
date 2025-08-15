const User = require('../models/User');
const Redemption = require('../models/Redemption');

// @desc    Redeem cashback points
// @route   POST /api/redeem
// @access  Private (Students only)
exports.redeemPoints = async (req, res) => {
  const { pointsToRedeem } = req.body;
  const studentId = req.user.id;

  try {
    const student = await User.findById(studentId);

    // --- Validation Checks ---
    if (!student) {
      return res.status(404).json({ msg: 'Student not found.' });
    }
    if (student.role !== 'student') {
        return res.status(403).json({ msg: 'Only students can redeem points.' });
    }
    if (pointsToRedeem < 50) {
      return res.status(400).json({ msg: 'A minimum of 50 points is required to redeem.' });
    }
    if (student.cashbackPoints < pointsToRedeem) {
      return res.status(400).json({ msg: 'You do not have enough points.' });
    }

    // --- Calculate Cashback ---
    // 10 points = ₹1, so 50 points = ₹5
    const cashbackAmount = pointsToRedeem / 10;

    // --- Perform the Redemption ---
    // 1. Deduct points from the student's account
    student.cashbackPoints -= pointsToRedeem;
    await student.save();

    // 2. Create a record of the transaction
    const newRedemption = new Redemption({
      student: studentId,
      pointsRedeemed: pointsToRedeem,
      cashbackAmount,
    });
    await newRedemption.save();

    res.status(200).json({
      success: true,
      msg: `Successfully redeemed ${pointsToRedeem} points for ₹${cashbackAmount} cashback!`,
      newBalance: student.cashbackPoints,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
