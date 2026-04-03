const mongoose = require('mongoose');

const paymentSplitSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true,
    unique: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  adminCommission: {
    type: Number,
    required: true
  },
  driverEarning: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

paymentSplitSchema.index({ driverId: 1 });
paymentSplitSchema.index({ riderId: 1 });
paymentSplitSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('PaymentSplit', paymentSplitSchema);
