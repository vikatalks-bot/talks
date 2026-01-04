const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/stats', [auth, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalLessons = await Lesson.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      totalUsers,
      totalLessons,
      totalBookings,
      activeSubscriptions,
      totalRevenue: revenue
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/payments
// @desc    Get all payments
// @access  Private/Admin
router.get('/payments', [auth, admin], async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('lessonId')
      .populate('subscriptionId')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

