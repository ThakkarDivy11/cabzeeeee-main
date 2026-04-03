const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  dropLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  fare: {
    type: Number,
    required: true
  },
  distance: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: Number,
    default: 0
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike', 'auto'],
    default: 'car'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'wallet'],
    default: 'cash'
  },
  specialInstructions: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'on_board', 'started', 'picked-up', 'completed', 'cancelled'],
    default: 'pending'
  },
  onBoardAt: Date,
  acceptedAt: Date,
  startedAt: Date,
  pickedUpAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['rider', 'driver']
  },
  riderRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  driverRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  pickupOTP: {
    type: String,
    default: null
  },
  otpVerified: {
    type: Boolean,
    default: false
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  currentDriverLocation: {
    type: {
      latitude: Number,
      longitude: Number,
      timestamp: Date
    },
    default: null
  },
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

rideSchema.index({ rider: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Ride', rideSchema);

