const express = require('express');
const router = express.Router();
const stripe = require('../config/stripe');
const paypal = require('paypal-rest-sdk');
const Payment = require('../models/Payment');
const Lesson = require('../models/Lesson');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// @route   POST /api/payments/create-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { type, itemId, amount } = req.body;

    if (!type || !itemId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        type,
        itemId
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Create intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/confirm-stripe
// @desc    Confirm Stripe payment
// @access  Private
router.post('/confirm-stripe', auth, async (req, res) => {
  try {
    const { paymentIntentId, type, itemId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update user account and create subscription if needed
    const user = await User.findById(req.user._id);
    let subscriptionId = null;

    if (type === 'lesson') {
      if (!user.purchasedLessons.includes(itemId)) {
        user.purchasedLessons.push(itemId);
        await user.save();
      }
    } else if (type === 'subscription') {
      // For subscriptions, itemId is the plan type, create subscription record
      const duration = itemId === 'monthly' ? 30 : 7;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      
      const subscription = await Subscription.create({
        userId: req.user._id,
        type: itemId,
        price: paymentIntent.amount / 100,
        status: 'active',
        startDate,
        endDate
      });
      
      user.subscriptions.push(subscription._id);
      await user.save();
      subscriptionId = subscription._id;
    }

    // Create payment record
    const payment = await Payment.create({
      userId: req.user._id,
      type,
      amount: paymentIntent.amount / 100,
      paymentMethod: 'stripe',
      transactionId: paymentIntent.id,
      status: 'completed',
      [type === 'lesson' ? 'lessonId' : 'subscriptionId']: type === 'lesson' ? itemId : subscriptionId
    });

    res.json({ message: 'Payment successful', payment });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/create-paypal
// @desc    Create PayPal payment
// @access  Private
router.post('/create-paypal', auth, async (req, res) => {
  try {
    const { type, itemId, amount } = req.body;

    if (!type || !itemId || !amount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const create_payment_json = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: `${req.protocol}://${req.get('host')}/api/payments/paypal-success`,
        cancel_url: `${req.protocol}://${req.get('host')}/api/payments/paypal-cancel`
      },
      transactions: [{
        item_list: {
          items: [{
            name: type === 'lesson' ? 'English Lesson' : 'Speaking Class Subscription',
            sku: itemId,
            price: amount.toFixed(2),
            currency: 'USD',
            quantity: 1
          }]
        },
        amount: {
          currency: 'USD',
          total: amount.toFixed(2)
        },
        description: type === 'lesson' ? 'English Lesson Purchase' : 'Speaking Class Subscription',
        custom: JSON.stringify({
          userId: req.user._id.toString(),
          type,
          itemId
        })
      }]
    };

    paypal.payment.create(create_payment_json, (error, payment) => {
      if (error) {
        console.error('PayPal error:', error);
        return res.status(500).json({ message: 'PayPal payment creation failed' });
      }

      // Find approval URL
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      res.json({ approvalUrl: approvalUrl.href, paymentId: payment.id });
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/payments/paypal-success
// @desc    Handle PayPal success
// @access  Private
router.get('/paypal-success', auth, async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    const execute_payment_json = {
      payer_id: PayerID
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error('PayPal execute error:', error);
        return res.redirect('/checkout?error=payment_failed');
      }

      if (payment.state === 'approved') {
        const custom = JSON.parse(payment.transactions[0].custom);
        const amount = parseFloat(payment.transactions[0].amount.total);

        // Update user account and create subscription if needed
        const user = await User.findById(custom.userId);
        let subscriptionId = null;

        if (custom.type === 'lesson') {
          if (!user.purchasedLessons.includes(custom.itemId)) {
            user.purchasedLessons.push(custom.itemId);
            await user.save();
          }
        } else if (custom.type === 'subscription') {
          // For subscriptions, custom.itemId is the plan type, create subscription record
          const duration = custom.itemId === 'monthly' ? 30 : 7;
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + duration);
          
          const subscription = await Subscription.create({
            userId: custom.userId,
            type: custom.itemId,
            price: amount,
            status: 'active',
            startDate,
            endDate
          });
          
          user.subscriptions.push(subscription._id);
          await user.save();
          subscriptionId = subscription._id;
        }

        // Create payment record
        const paymentRecord = await Payment.create({
          userId: custom.userId,
          type: custom.type,
          amount,
          paymentMethod: 'paypal',
          transactionId: payment.id,
          status: 'completed',
          [custom.type === 'lesson' ? 'lessonId' : 'subscriptionId']: custom.type === 'lesson' ? custom.itemId : subscriptionId
        });

        res.redirect('/dashboard?payment=success');
      } else {
        res.redirect('/checkout?error=payment_failed');
      }
    });
  } catch (error) {
    console.error('PayPal success error:', error);
    res.redirect('/checkout?error=payment_failed');
  }
});

// @route   GET /api/payments/paypal-cancel
// @desc    Handle PayPal cancel
// @access  Public
router.get('/paypal-cancel', (req, res) => {
  res.redirect('/checkout?error=payment_cancelled');
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('lessonId')
      .populate('subscriptionId');

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

