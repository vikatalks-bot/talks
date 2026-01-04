const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/bookings
// @desc    Get user bookings or all bookings (admin)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('subscriptionId')
      .sort({ classDate: 1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { subscriptionId, classDate, classTime } = req.body;

    // Check if user has active subscription
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId: req.user._id,
      status: 'active'
    });

    if (!subscription) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Check if date is in the future
    const bookingDate = new Date(classDate);
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: 'Cannot book past dates' });
    }

    // Create booking
    const booking = await Booking.create({
      userId: req.user._id,
      subscriptionId,
      classDate: bookingDate,
      classTime,
      status: 'confirmed'
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking (admin only)
// @access  Private/Admin
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

