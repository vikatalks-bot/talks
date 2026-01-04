const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'monthly',
      type: 'monthly',
      name: 'Monthly Speaking Class',
      price: 49.99,
      description: 'Access to speaking classes for one month',
      duration: 30 // days
    },
    {
      id: 'weekly',
      type: 'weekly',
      name: 'Weekly Speaking Class',
      price: 19.99,
      description: 'Access to speaking classes for one week',
      duration: 7 // days
    }
  ];

  res.json(plans);
});

// @route   POST /api/subscriptions
// @desc    Create a subscription (after payment)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { type, price } = req.body;

    if (!type || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const duration = type === 'monthly' ? 30 : 7;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    const subscription = await Subscription.create({
      userId: req.user._id,
      type,
      price,
      status: 'active',
      startDate,
      endDate
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscriptions/my-subscriptions
// @desc    Get user's subscriptions
// @access  Private
router.get('/my-subscriptions', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/subscriptions/:id/cancel
// @desc    Cancel a subscription
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


