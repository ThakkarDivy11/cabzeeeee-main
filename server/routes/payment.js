const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Ride = require('../models/Ride');
const PaymentSplit = require('../models/PaymentSplit');
const mongoose = require('mongoose');

const router = express.Router();

// Create Payment Intent for Ride
router.post('/create-ride-payment-intent/:rideId', protect, express.json(), async (req, res) => {
  try {
    assertStripeConfigured();
    const { rideId } = req.params;
    const { paymentMethodId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.isPaid) return res.status(400).json({ success: false, message: 'Ride is already paid' });

    const customerId = await getOrCreateStripeCustomer(req.user);
    const amount = Math.round(ride.fare * 100);

    let paymentIntent;
    if (paymentMethodId) {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        customer: customerId,
        payment_method: paymentMethodId,
        metadata: { userId: req.user._id.toString(), rideId: ride._id.toString(), type: 'ride_payment' }
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr',
        metadata: { userId: req.user._id.toString(), rideId: ride._id.toString(), type: 'ride_payment' }
      });
    }

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Ride Payment Intent Error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate ride payment' });
  }
});

// Confirm Ride Payment (Wallet or after successful Stripe confirmation)
router.post('/confirm-ride-payment/:rideId', protect, express.json(), async (req, res) => {
  try {
    const { rideId } = req.params;
    const { method, paymentIntentId } = req.body; // method: 'wallet' or 'card'
    console.log("Hey")
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (ride.isPaid) return res.status(400).json({ success: false, message: 'Ride is already paid' });

    if (method === 'wallet') {
      if (req.user.walletBalance < ride.fare) {
        return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
      }
      req.user.walletBalance -= ride.fare;
      await req.user.save();
      await Transaction.create({
        user: req.user._id, type: 'debit', amount: ride.fare,
        description: `Payment for Ride #${rideId.substring(0, 8)}`,
        status: 'completed', paymentMethod: 'wallet'
      });
      await ensurePaymentSplit(ride, ride.fare, 'completed');
      ride.isPaid = true;
      await ride.save();
      return res.json({ success: true, message: 'Payment successful via Wallet' });
    }

    if (method === 'card') {
      // Trusting client for now if paymentIntentId is provided, or verify it via Stripe
      if (paymentIntentId) {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (intent.status === 'succeeded') {
          await Transaction.create({
            user: req.user._id, type: 'debit', amount: ride.fare,
            description: `Payment for Ride #${rideId.substring(0, 8)} (Stripe)`,
            status: 'completed', paymentId: paymentIntentId, paymentMethod: 'stripe'
          });
          await ensurePaymentSplit(ride, ride.fare, 'completed');
          ride.isPaid = true;
          await ride.save();
          return res.json({ success: true, message: 'Stripe payment confirmed' });
        }
      }
      return res.status(400).json({ success: false, message: 'Card payment not verified' });
    }

    res.status(400).json({ success: false, message: 'Invalid payment method' });
  } catch (error) {
    console.error('Confirm Ride Payment Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Confirmation failed' });
  }
});

async function getOrCreateStripeCustomer(user) {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() }
  });

  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

function assertStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Stripe secret key missing');
    err.statusCode = 500;
    throw err;
  }
}

// Create Payment Intent for Wallet Top-up
router.post('/create-payment-intent', protect, express.json(), async (req, res) => {
  try {
    assertStripeConfigured();
    const { amount } = req.body;
    const { paymentMethodId } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        message: 'Minimum top-up amount is ₹50'
      });
    }

    let paymentIntent;

    // If a saved PaymentMethod is provided, create the intent for the customer's saved method.
    if (paymentMethodId) {
      const customerId = await getOrCreateStripeCustomer(req.user);
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'inr',
        customer: customerId,
        // confirm will be done on client via confirmCardPayment for SCA support
        payment_method: paymentMethodId,
        metadata: {
          userId: req.user._id.toString(),
          type: 'wallet_topup'
        }
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Stripe expects amount in paise
        currency: 'inr',
        metadata: {
          userId: req.user._id.toString(),
          type: 'wallet_topup'
        }
      });
    }

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment'
    });
  }
});

// Confirm wallet top-up instantly
router.post('/confirm-wallet-topup', protect, express.json(), async (req, res) => {
  try {
    assertStripeConfigured();
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: 'Payment Intent ID is required' });
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      return res.status(400).json({ success: false, message: 'Payment not successful' });
    }

    if (intent.metadata.type !== 'wallet_topup' || intent.metadata.userId !== req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid payment intent metadata' });
    }

    // Check if transaction already exists (avoid double crediting if webhook already processed it)
    const existingTx = await Transaction.findOne({ paymentId: paymentIntentId });
    if (existingTx) {
      return res.json({ success: true, message: 'Wallet already updated' });
    }

    const amount = intent.amount / 100;

    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount: amount,
      description: 'Wallet Top-up via Card',
      status: 'completed',
      paymentId: paymentIntentId
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { walletBalance: amount }
    });

    res.json({ success: true, message: 'Wallet updated successfully' });
  } catch (error) {
    console.error('Confirm Wallet Top-up Error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm wallet top-up' });
  }
});

// Create SetupIntent to save a card for future payments
router.post('/create-setup-intent', protect, express.json(), async (req, res) => {
  try {
    assertStripeConfigured();
    const customerId = await getOrCreateStripeCustomer(req.user);
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      metadata: {
        userId: req.user._id.toString(),
        type: 'save_card'
      }
    });

    res.json({
      success: true,
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error('Stripe SetupIntent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate card setup'
    });
  }
});

// Capture commission split for completed ride
router.post('/split', protect, express.json(), async (req, res) => {
  try {
    const { rideId, totalAmount, paymentStatus = 'completed', notes = '' } = req.body;
    if (!rideId || !totalAmount) {
      return res.status(400).json({ success: false, message: 'rideId and totalAmount are required' });
    }

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });
    if (!ride.driver) return res.status(400).json({ success: false, message: 'Ride has no assigned driver' });

    const existing = await PaymentSplit.findOne({ rideId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payment split already recorded' });
    }

    const split = await recordSplit({
      ride,
      amount: totalAmount,
      paymentStatus,
      notes
    });

    ride.isPaid = true;
    await ride.save();

    res.json({ success: true, data: split });
  } catch (error) {
    console.error('Payment Split Error:', error);
    res.status(500).json({ success: false, message: 'Failed to store payment split' });
  }
});

router.get('/split/summary/admin', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const [agg] = await PaymentSplit.aggregate([
      { $group: { _id: null, totalCommission: { $sum: '$adminCommission' }, count: { $sum: 1 } } }
    ]);
    const recent = await PaymentSplit.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('rideId driverId riderId', 'fare name email')
      .lean();

    res.json({
      success: true,
      data: {
        totalCommission: agg?.totalCommission || 0,
        rideCount: agg?.count || 0,
        recent
      }
    });
  } catch (error) {
    console.error('Admin Commission Summary Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load commission summary' });
  }
});

router.get('/split/summary/driver', protect, async (req, res) => {
  try {
    const driverId = req.user._id;
    const [agg] = await PaymentSplit.aggregate([
      { $match: { driverId: mongoose.Types.ObjectId(driverId) } },
      { $group: { _id: null, totalEarning: { $sum: '$driverEarning' }, rideCount: { $sum: 1 } } }
    ]);
    const detail = await PaymentSplit.find({ driverId })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('rideId', 'fare status')
      .lean();

    res.json({
      success: true,
      data: {
        totalEarning: agg?.totalEarning || 0,
        rideCount: agg?.rideCount || 0,
        detail
      }
    });
  } catch (error) {
    console.error('Driver Split Summary Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load driver earnings' });
  }
});

async function ensurePaymentSplit(ride, amount, status = 'completed') {
  if (!ride || !ride.driver || !ride.rider) return null;
  const existing = await PaymentSplit.findOne({ rideId: ride._id });
  if (existing) return existing;
  return recordSplit({ ride, amount, paymentStatus: status });
}

async function recordSplit({ ride, amount, paymentStatus, notes = '' }) {
  const { adminCommission, driverEarning } = calculateSplit(amount);
  return PaymentSplit.create({
    rideId: ride._id,
    driverId: ride.driver,
    riderId: ride.rider,
    totalAmount: amount,
    adminCommission,
    driverEarning,
    paymentStatus,
    notes
  });
}

function calculateSplit(amount) {
  const total = Number(amount);
  const adminCommission = Number((total * 0.2).toFixed(2));
  const driverEarning = Number((total - adminCommission).toFixed(2));
  return { adminCommission, driverEarning };
}

// List saved payment methods for the current user
router.get('/payment-methods', protect, async (req, res) => {
  try {
    assertStripeConfigured();
    const customerId = await getOrCreateStripeCustomer(req.user);
    const list = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    const methods = (list?.data || []).map(pm => ({
      id: pm.id,
      brand: pm.card?.brand || 'card',
      last4: pm.card?.last4 || '',
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year
    }));

    res.json({ success: true, data: methods });
  } catch (error) {
    console.error('Stripe list payment methods error:', error);
    res.status(500).json({ success: false, message: 'Failed to load saved cards' });
  }
});

// Remove (detach) a saved payment method
router.delete('/payment-methods/:id', protect, async (req, res) => {
  try {
    assertStripeConfigured();
    // Detach is safe: Stripe will validate ownership
    await stripe.paymentMethods.detach(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Stripe detach payment method error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove card' });
  }
});

// Stripe Webhook for payment confirmation
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100;

    try {
      // Create transaction record
      await Transaction.create({
        user: userId,
        type: 'credit',
        amount: amount,
        description: 'Wallet Top-up via Stripe',
        status: 'completed',
        paymentId: paymentIntent.id
      });

      // Update user wallet balance
      await User.findByIdAndUpdate(userId, {
        $inc: { walletBalance: amount }
      });

      console.log(`✅ WALLET UPDATED for User: ${userId}, Amount: ${amount}`);
    } catch (dbError) {
      console.error('Database Update Error (Webhook):', dbError);
    }
  }

  res.json({ received: true });
});

// Get wallet transactions
router.get('/history', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
